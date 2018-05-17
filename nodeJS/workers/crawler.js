const Crawler = require('simplecrawler');
const Queue   = require('bull');

const semaphore = require('../modules/fs-semaphore');
const message   = require('../modules/message');

module.exports = function (config) {

	if (!config)
		throw new Error('Config non found');

	if (!config.redis)
		throw new Error('Redis config not found');

	if (!config.destination_queue_name)
		throw new Error('destination_queue_name not found');

	if (!config.homepage)
		throw new Error('Homepage URL not found');

	if (!config.semaphore_path)
		throw new Error('Semaphore Path URL not found');

	if (!config.site_name)
		throw new Error('Site Name not found');

	if (!semaphore.is_green_light(config.semaphore_path, config.site_name))
		throw new Error('Another crawler is running for "' + config.site_name + '"');

	semaphore.set_red_light(config.semaphore_path, config.site_name)

	let destinationQueue = new Queue(config.destination_queue_name, {redis : config.redis});

	let crawler = new Crawler(config.homepage);

	crawler.initalPath          = '/';
	crawler.sortQueryParameters = true;
	crawler.respectRobotsTxt    = false;

	crawler.on('fetchcomplete', async function (queueItem, responseBuffer, response) {

		try {

			if (queueItem.stateData.contentType !== undefined) {
				if (queueItem.stateData.contentType.match('text/html')) {

					// console.log(queueItem.stateData.contentType, queueItem.url);

					let jobId = queueItem.url.replace(/\//g, '_').replace(/:/g, '').replace(/\./g, '_');

					// console.log('jobId', jobId);

					destinationQueue.add({
						url   : queueItem.url,
						step0 : queueItem
					}, {
						jobId    : jobId,
						attempts : 2
					});

				}
			}

		} catch (err) {

			console.log('errore');
			console.log(queueItem);
			console.log(err);

		}

	});

	crawler.on('complete', function () {

		console.log('crawler complete');

		destinationQueue.add(message.complete(), {
			jobId : 'crawler complete'
		});

	});

	crawler.start();

	console.log('crawler start');

};