const Queue  = require('bull');
const Client = require('ftp');

const message = require('../modules/message');

module.exports = async function (config) {

	check_config(config);

	const ftp_client = new Client();

	const imagesToUploadQueue = new Queue(config.source_queue_name, {redis : config.redis});

	imagesToUploadQueue.pause();

	imagesToUploadQueue.process(10, async function (job, done) {

		try {

			console.log(job.data);

			ftp_client.on('ready', function () {

				ftp_client.put('foo.txt', 'foo.remote-copy.txt', function (err) {

					if (err) {

						console.error(err);

						done({
							err : err
						});

					} else {

						ftp_client.end();

						done(message.complete());

					}

				});

			});

			ftp_client.connect(config.smtp);

		} catch (err) {

			done(err, {
				error : err,
				data  : job.data,
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

	if (!config.storage)
		throw new Error('storage config not found');

	if (!config.storage.output)
		throw new Error('output storage folder not found');

	if (!config.smtp)
		throw new Error('output storage folder not found');

}