const Queue      = require('bull');
const PromiseFtp = require('promise-ftp');
const path       = require('path');

const message       = require('../modules/message');
const mail_notifier = require('../modules/mail-notifier');
const semaphore     = require('../modules/fs-semaphore');

const file_logger = require('../modules/file-logger');

let log_file_path;

module.exports = async function (config) {

	check_config(config);

	const imagesToUploadQueue = new Queue(config.source_queue_name, {redis : config.redis});

	let ftp_config = config.ftp;

	if (config.status === false)
		await imagesToUploadQueue.pause();

	imagesToUploadQueue.process(5, async function (job, done) {

		let url = job.data.url ? job.data.url : 'n_a';

		let local_file_path = config.storage.output + '/' + url;
		let remote_file_path, temp_remote_file, remote_folder;

		try {

			if (message.is_complete(job.data)) {

				console.log('UPLOADER complete message receive');

				imagesToUploadQueue.on('global:completed', async function (jobId, result) {
					console.log('on global completed', jobId);
					await wait_for_finish(imagesToUploadQueue);
				});
				imagesToUploadQueue.on('global:error', async function (err) {
					console.log('on global error', err);
					await wait_for_finish(imagesToUploadQueue);
				});
				imagesToUploadQueue.on('global:failed', async function (jobId, err) {
					console.log('on global failes', jobId);
					await wait_for_finish(imagesToUploadQueue);
				});
				imagesToUploadQueue.on('global:stalled', async function (jobId) {
					console.log('on global stalled', jobId);
					await wait_for_finish(imagesToUploadQueue);
				});

				done(null, {
					'status' : 'completed'
				});

				return;

			}

			if (ftp_config.domain_filter.length > 0) {
				for (let f = 0; f < ftp_config.domain_filter.length; f++)
					temp_remote_file = url.replace(ftp_config.domain_filter[f] + '/', '');
				remote_file_path = config.ftp.path + '/' + temp_remote_file;
			} else {
				remote_file_path = config.ftp.path + '/' + url;
			}

			let ftp_client = new PromiseFtp();

			// Connection
			await ftp_client.connect(ftp_config);

			// Create recursively remote folder if not exists
			remote_folder  = path.dirname(remote_file_path);
			let dir_exists = await ftp_client.list(remote_folder);
			if (dir_exists.length === 0) {
				await ftp_client.mkdir(remote_folder, true);
				console.log('creo -R', remote_folder);
			}

			// Upload file
			await ftp_client.put(local_file_path, remote_file_path);

			//
			await ftp_client.end();

			await log(config, local_file_path, remote_file_path);

			done(null, {
				config           : config,
				local_file_path  : local_file_path,
				remote_file_path : remote_file_path,
				remote_folder    : remote_folder,
				temp_remote_file : temp_remote_file
			});

		} catch (err) {

			await log(config, local_file_path, remote_file_path, 'error', err.toString());

			done(err, {
				error : err,
			});

			/*
			console.error();
			console.error(err.toString());
			console.error('da', local_file_path);
			console.error('a', remote_file_path);
			console.error('folder', remote_folder);
			console.error();
			*/

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

	if (!config.storage)
		throw new Error('storage config not found');

	if (!config.storage.output)
		throw new Error('output storage folder not found');

	if (!config.ftp)
		throw new Error('ftp config not found');

	if (config.status === undefined)
		throw new Error('status not found');

	if (typeof(config.status) !== "boolean")
		throw new Error('Invalid status value. Must be boolean');

	if (!config.semaphore_path)
		throw new Error('Semaphore Path URL not found');

	if (!config.site_name)
		throw new Error('Site Name not found');

	if (!config.smtp)
		throw new Error('SMTP congif not found');

}

async function log(config, local_file_path, remote_file_path, status, error) {

	if (log_file_path === undefined) {

		log_file_path = new Date().toISOString();

		log_file_path = log_file_path.replace(/-/g, '_').replace(/:/g, '_').replace(/\./g, '_');

		log_file_path = config.storage.log + '/' + config.site_name + '__' + log_file_path;

	}

	await file_logger(log_file_path, [local_file_path, remote_file_path], status, error);

}

async function wait_for_finish(imagesToUploadQueue) {

	let count_waiting = await imagesToUploadQueue.getWaitingCount();
	let count_active  = await imagesToUploadQueue.getActiveCount();

	console.log('uploader countdown', count_waiting, count_active);

	if (count_waiting === 0 && count_active === 0) {

		let message = await mail_notifier(config.smtp, {
			from        : '"✔ ESS - URLs Images Optimization Queue 👻" <ess--urls-iamges-optimization-queue@mail-delivery.it>',
			to          : 'andrea.nigro@ogilvy.com',
			subject     : 'Oggetto della mail',
			text        : [
				'Il processo è terminato',
				'',
				'ciao',
				'Andrea R.'
			].join('\n'),
			attachments : [{
				path : log_file_path
			}]
		});

		console.log(message);

		semaphore.set_green_light(config.semaphore_path, config.site_name);

		process.exit();

	}

}