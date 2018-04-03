const Queue      = require('bull');
const PromiseFtp = require('promise-ftp');
const path       = require('path');

const message = require('../modules/message');

const file_logger = require('../modules/file-logger');

let log_file_path;

module.exports = async function (config) {

	check_config(config);

	const imagesToUploadQueue = new Queue(config.source_queue_name, {redis : config.redis});

	let ftp_config = config.ftp;

	await imagesToUploadQueue.pause();

	imagesToUploadQueue.process(5, async function (job, done) {

		let url = job.data.url ? job.data.url : 'n_a';

		let local_file_path = config.storage.output + '/' + url;
		let remote_file_path, temp_remote_file, remote_folder;

		try {

			if (message.is_complete(job.data)) {

				imagesToUploadQueue.on('completed', async function (job, result) {

					done(null, {
						'status' : 'completed'
					});

					let count_waiting = await imagesToUploadQueue.getWaitingCount();
					let count_active  = await imagesToUploadQueue.getActiveCount();

					console.log(count_waiting, count_active);

					if (count_waiting === 0 && count_active === 0) {

						console.log('uploader complete');
						process.exit();

					}

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

			console.error();
			console.error(err.toString());
			console.error('da', local_file_path);
			console.error('a', remote_file_path);
			console.error('folder', remote_folder);
			console.error();

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

}

async function log(config, local_file_path, remote_file_path, status, error) {

	if (log_file_path === undefined) {

		log_file_path = new Date().toISOString();

		log_file_path = log_file_path.replace(/-/g, '_').replace(/:/g, '_').replace(/\./g, '_');

		log_file_path = config.storage.log + '/' + config.site_name + '__' + log_file_path;

	}

	await file_logger(log_file_path, [local_file_path, remote_file_path], status, error);

}