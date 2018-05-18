const mkdirp             = require('mkdirp');
const dir                = require('node-dir');
const path               = require('path');
const fs                 = require('fs');
const {zip, unzip, list} = require('zip-unzip-promise');
const rimraf             = require('rimraf');
const md5                = require('md5');
const md5File            = require('md5-file');
const dateTime           = require('node-datetime');
const request            = require('request-promise');
const glob               = require('glob');
const mail_notifier      = require('../modules/mail-notifier');
const semaphore          = require('../modules/fs-semaphore');

const Queue = require('bull');

const message                 = require('../modules/message');
const page_speed_optimization = require('../modules/page-speed-optimization');

module.exports = function (config) {

	check_config(config);

	const pagesToOptimizeQueue = new Queue(config.source_queue_name, {redis : config.redis});

	const imagesToUploadQueue = config.destination_queue_name !== undefined
		? new Queue(config.destination_queue_name, {redis : config.redis})
		: null
	;

	pagesToOptimizeQueue.process(10, async function (job, done) {

		let url, pso, temp_folder, file_map, image_temp_folder, image_files;

		try {

			if (message.is_complete(job.data)) {

				console.log('PSO complete message receive');

				pagesToOptimizeQueue.on('global:completed', async function (jobId, result) {
					console.log('on global completed', jobId);
					await wait_for_finish(pagesToOptimizeQueue, imagesToUploadQueue, config);
				});
				pagesToOptimizeQueue.on('global:error', async function (err) {
					console.log('on global error', err);
					await wait_for_finish(pagesToOptimizeQueue, imagesToUploadQueue, config);
				});
				pagesToOptimizeQueue.on('global:failed', async function (jobId, err) {
					console.log('on global failes', jobId);
					await wait_for_finish(pagesToOptimizeQueue, imagesToUploadQueue, config);
				});
				pagesToOptimizeQueue.on('global:stalled', async function (jobId) {
					console.log('on global stalled', jobId);
					await wait_for_finish(pagesToOptimizeQueue, imagesToUploadQueue, config);
				});

				done(null, {
					'status' : 'completed'
				});

				return;

			}

			url = job.data.url;

			// console.log('processing', url);

			pso = await page_speed_optimization(url, config.google_psi_api_key, config.rate_limiter, config.proxy_url);

			// salva lo zip scaricato e lo decomprime
			temp_folder = await save_optimized_files(pso, config.storage.zip);

			// crea la mappa dei file ottimizzati
			file_map = await parse_manifest_file(temp_folder + '/MANIFEST');

			image_temp_folder = temp_folder + '/image';

			image_files = await dir.promiseFiles(image_temp_folder);

			for (let y = 0; y < image_files.length; y++) {

				let image_file_path = image_files[y];

				let image_path = image_file_path.replace(temp_folder + '/', '');

				let image_url = file_map[image_path];

				let local_image_url = decodeURI(image_url.replace('https://', '').replace('http://', ''));

				let domain_included = 1;

				// Filtro per dominio
				if (config.domain_filter) {
					domain_included = 0;
					for (let z = 0; z < config.domain_filter.length; z++) {
						if (local_image_url.startsWith(config.domain_filter[z])) {
							domain_included++;
						}
					}
				}

				if (domain_included) {

					let master_file = await get_master_file(image_url);

					await save_file_history(image_file_path, local_image_url, master_file, config.storage);

					let optimized = save_optimazed_file(image_file_path, local_image_url, master_file, config.storage);

					if (optimized) {

						if (imagesToUploadQueue) {

							let jobId = local_image_url.replace(/\//g, '_').replace(/:/g, '').replace(/\./g, '_');

							imagesToUploadQueue.add({
								url : local_image_url,
							}, {
								jobId    : jobId,
								attempts : 10
							});

						}

					}

				}

			}

			if (fs.existsSync(temp_folder)) {
				rimraf.sync(temp_folder);
				// console.log('removed image temp folder', temp_folder);
			}

			done(null, {

				temp_folder       : temp_folder,
				file_map          : file_map,
				image_temp_folder : image_temp_folder,
				image_files       : image_files,

			});

		} catch (err) {

			if (fs.existsSync(temp_folder)) {
				rimraf.sync(temp_folder);
				// console.log('removed image temp folder', temp_folder);
			}

			done(err, {
				error             : err,
				url               : url,
				proxy             : config.proxy_url,
				pso               : pso,
				temp_folder       : temp_folder,
				file_map          : file_map,
				image_temp_folder : image_temp_folder,
				image_files       : image_files,
			});

		}

	});

};

function check_config(config) {

	if (!config)
		throw new Error('Config non found');

	if (!config.redis)
		throw new Error('Redis config not found');

	if (!config.source_queue_name)
		throw new Error('source_queue_name not found');

	if (!config.rate_limiter)
		throw new Error('RateLimiter instance not found');

	if (!config.google_psi_api_key)
		throw new Error('google_psi_api_key not found');

	if (!config.storage)
		throw new Error('storage config not found');

	if (!config.storage.zip)
		throw new Error('zip storage folder not found');

	if (!config.storage.archive)
		throw new Error('archive storage folder not found');

	if (!config.storage.output)
		throw new Error('output storage folder not found');

	if (!config.destination_queue_name) {

		if (!config.semaphore_path)
			throw new Error('Semaphore Path URL not found');

		if (!config.site_name)
			throw new Error('Site Name not found');

		if (!config.smtp)
			throw new Error('SMTP congif not found');

	}

}

async function save_optimized_files(zipped_content, temp_storage) {

	let destination = temp_storage + '/zipped_optimized_resources';
	if (!fs.existsSync(destination)) {
		mkdirp.sync(destination);
		// console.log('created', destination);
	}

	let time           = new Date().getTime();
	let micro_time     = process.hrtime();
	let temp_folder    = destination + '/temp_' + time + '_' + micro_time[1];
	let temp_file_name = temp_folder + '.zip';

	// console.log('created', temp_file_name);

	fs.writeFileSync(temp_file_name, zipped_content);

	await unzip(temp_file_name, temp_folder);

	fs.unlinkSync(temp_file_name);

	return temp_folder;

}

async function parse_manifest_file(manifest_file_path) {

	let manifest = fs.readFileSync(manifest_file_path, 'utf8');

	let manifest_rows_array = manifest.split("\n");

	let output = {};

	for (let c = 0; c < manifest_rows_array.length; c++) {

		let row = manifest_rows_array[c];

		let split = row.split(": ");

		if (split.length === 2) {
			output[split[0]] = split[1];
		}

	}

	return output;

}

async function get_master_file(url) {

	return await request({
		url      : url,
		encoding : null
	});

}

async function save_file_history(image_file_path, local_image_url, master_file, storage_config) {

	let formatted_date      = dateTime.create().format('Y_m_d__H_M_S');
	let archive_folder_path = storage_config.archive + '/' + local_image_url;
	let file_extension      = path.extname(image_file_path);

	let master_md5 = md5(master_file);
	if (!file_version_exists(archive_folder_path, master_md5)) {
		let archivied_master_file_name = formatted_date + '__M__' + master_md5 + file_extension;

		let archive_master_file_path = archive_folder_path + '/' + archivied_master_file_name;
		let archive_master_folder    = path.dirname(archive_master_file_path);
		if (!fs.existsSync(archive_master_folder)) {
			mkdirp.sync(archive_master_folder);
		}
		// console.log(image_file_path, '=>', archive_master_file_path);
		fs.writeFileSync(archive_master_file_path, master_file);
	}

	// Optimized version
	let optimized_md5 = md5File.sync(image_file_path);
	if (!file_version_exists(archive_folder_path, optimized_md5)) {
		let archivied_optimized_file_name = formatted_date + '__O__' + optimized_md5 + file_extension;

		let archive_optimized_file_path = archive_folder_path + '/' + archivied_optimized_file_name;
		let archive_optimized_folder    = path.dirname(archive_optimized_file_path);
		if (!fs.existsSync(archive_optimized_folder)) {
			mkdirp.sync(archive_optimized_folder);
		}
		// console.log(image_file_path, '=>', archive_optimized_file_path);
		fs.copyFileSync(image_file_path, archive_optimized_file_path);
	}

}

function save_optimazed_file(image_file_path, local_image_url, master_file, storage_config) {

	let archive_folder_path = storage_config.archive + '/' + local_image_url;
	let master_md5          = md5(master_file);

	if (file_version_exists(archive_folder_path, master_md5, 'O')) {
		console.log('skipped because already optimized', archive_folder_path);
		return false;
	}

	let output_file_path = storage_config.output + '/' + local_image_url;
	let output_folder    = path.dirname(output_file_path);

	if (fs.existsSync(output_file_path)) {

		let old_size = fs.statSync(output_file_path).size;
		let new_size = fs.statSync(image_file_path).size;

		if (old_size > new_size) {
			console.log('skipped because exist bigger optimized image', archive_folder_path);
			return false;
		}

	}

	if (!fs.existsSync(output_folder)) {
		mkdirp.sync(output_folder);
	}
	// console.log(image_file_path, '=>', output_file_path);
	fs.copyFileSync(image_file_path, output_file_path);

	return true;

}

function file_version_exists(archive_folder_path, md5, version) {

	let extension = path.extname(archive_folder_path);

	let wildcard_expression;
	if (version === undefined) {
		wildcard_expression = archive_folder_path + '/*' + md5 + extension;
	}
	else {
		wildcard_expression = archive_folder_path + '/*' + '__' + version + '__' + md5 + extension;
	}

	let files = glob.sync(wildcard_expression);

	// process.exit();

	return files.length > 0;
}

async function wait_for_finish(pagesToOptimizeQueue, imagesToUploadQueue, config) {

	let count_waiting = await pagesToOptimizeQueue.getWaitingCount();
	let count_active  = await pagesToOptimizeQueue.getActiveCount();

	console.log('pso countdown', count_waiting, count_active);

	if (count_waiting === 0 && count_active === 0) {

		console.log('pso_fetcher complete');

		if (imagesToUploadQueue) {

			imagesToUploadQueue.add(message.complete(), {
				jobId : 'pso_fetcher complete'
			});

			await imagesToUploadQueue.resume();

		} else {

			let message = await mail_notifier(config.smtp, {
				from    : '"✔ ESS - URLs Images Optimization Queue 👻" <ess--urls-iamges-optimization-queue@mail-delivery.it>',
				to      : 'andrea.nigro@ogilvy.com',
				subject : 'Oggetto della mail',
				text    : [
					'Il processo di ottimizzazione delle immagini è terminato',
					'',
					'ciao',
					'Andrea R.'
				].join('\n'),
			});

			console.log(message);

			semaphore.set_green_light(config.semaphore_path, config.site_name);

			process.exit();

		}

	}

}