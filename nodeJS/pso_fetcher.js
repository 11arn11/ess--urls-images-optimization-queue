const Queue = require('bull');

const mkdirp             = require('mkdirp');
const dir                = require('node-dir');
const path               = require('path');
const fs                 = require('fs');
const {zip, unzip, list} = require('zip-unzip-promise');
const RateLimiter        = require('limitme');
const rimraf             = require('rimraf');

const page_speed_optimization = require('./modules/page-speed-optimization');

const config = require('./config');

const pagesToOptimizeQueue = new Queue('pagesToOptimize', {redis : config.REDIS});

const throttle_pso = new RateLimiter(4000);

pagesToOptimizeQueue.process(10, async function (job, done) {

	let url, pso, temp_folder, file_map, image_temp_folder, image_files;

	try {

		url = job.data.url;

		console.log('processing', url);

		pso = await page_speed_optimization(url, config.GOOGLE_PSI_KEY, throttle_pso);

		temp_folder = await save_optimized_data(pso, config.temp_storage);

		file_map = await parse_manifest_file(temp_folder);

		image_temp_folder = temp_folder + '/image';

		image_files = await dir.promiseFiles(image_temp_folder);

		for (let y = 0; y < image_files.length; y++) {

			let image_file_path = image_files[y];

			let image_path = image_file_path.replace(temp_folder + '/', '');

			let image_url = file_map[image_path];

			image_url = image_url.replace('https://', '');
			image_url = image_url.replace('http://', '');

			let domain_included = 1;

			// Filtro per dominio
			if (config.domain_filter) {
				domain_included = 0;
				for (let z = 0; z < config.domain_filter.length; z++) {
					if (image_url.startsWith(config.domain_filter[z])) {
						domain_included++;
					}
				}
			}

			if (domain_included) {

				let destination_file_path = config.temp_storage + '/' + image_url;

				let destination_folder = path.dirname(destination_file_path);
				if (!fs.existsSync(destination_folder)) {
					mkdirp.sync(destination_folder);
				}

				console.log(image_file_path);
				fs.copyFileSync(image_file_path, destination_file_path);

			}

		}

		if (fs.existsSync(temp_folder)) {
			rimraf.sync(temp_folder);
			console.log('removed image temp folder', temp_folder);
		}

		done();

	} catch (err) {

		if (fs.existsSync(temp_folder)) {
			rimraf.sync(temp_folder);
			console.log('removed image temp folder', temp_folder);
		}

		done(err, {
			error             : err,
			url               : url,
			pso               : pso,
			temp_folder       : temp_folder,
			file_map          : file_map,
			image_temp_folder : image_temp_folder,
			image_files       : image_files,
		});

	}

});

async function save_optimized_data(zipped_content, temp_storage) {

	let destination = temp_storage;
	if (!fs.existsSync(destination)) {
		mkdirp.sync(destination);
		console.log('created', destination);
	}

	let time           = new Date().getTime();
	let micro_time     = process.hrtime();
	let temp_folder    = destination + '/temp_' + time + '_' + micro_time[1];
	let temp_file_name = temp_folder + '.zip';

	console.log('created', temp_file_name);

	fs.writeFileSync(temp_file_name, zipped_content);

	await unzip(temp_file_name, temp_folder);

	fs.unlinkSync(temp_file_name);

	return temp_folder;

}

async function parse_manifest_file(temp_folder) {

	let manifest = fs.readFileSync(temp_folder + '/MANIFEST', 'utf8');

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
