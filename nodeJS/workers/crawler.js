const Crawler = require('simplecrawler');
const Queue   = require('bull');

const message = require('../modules/message');

module.exports = async function (config) {

	if (!config)
		throw new Error('Config non found');

	if (!config.redis)
		throw new Error('Redis config not found');

	if (!config.destination_queue_name)
		throw new Error('destination_queue_name not found');

	if (!config.homepage)
		throw new Error('Homepage URL not found');

	let destinationQueue = new Queue(config.destination_queue_name, {redis : config.redis});

	let crawler = new Crawler(config.homepage);

	crawler.initalPath          = '/';
	crawler.sortQueryParameters = true;
	crawler.respectRobotsTxt    = false;

	crawler.on('fetchcomplete', async function (queueItem, responseBuffer, response) {

		try {

			if (queueItem.stateData.contentType.match('text/html')) {

				// console.log(queueItem.stateData.contentType, queueItem.url);

				let jobId = queueItem.url.replace(/\//g, '_').replace(/:/g, '').replace(/\./g, '_');

				// console.log('jobId', jobId);

				destinationQueue.add({
					url   : queueItem.url,
					step0 : queueItem
				}, {
					jobId    : jobId,
					attempts : 10
				});

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