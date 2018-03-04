const Crawler = require('simplecrawler');
const Queue   = require('bull');

module.exports = async function (config) {

	if (!config)
		throw new Error('Config non found');

	if (!config.REDIS)
		throw new Error('Redis config not found');

	if (!config.destination_queue_name)
		throw new Error('destination_queue_name not found');

	if (!config.homepage)
		throw new Error('Homepage URL not found');

	let destinationQueue = new Queue(config.destination_queue_name, {redis : config.REDIS});

	let crawler = new Crawler(config.homepage);

	crawler.initalPath          = '/';
	crawler.sortQueryParameters = true;
	crawler.respectRobotsTxt    = false;

	crawler.on('fetchcomplete', async function (queueItem, responseBuffer, response) {

		if (queueItem.stateData.contentType.match('text/html')) {

			console.log(queueItem.stateData.contentType, queueItem.url);

			let jobId = queueItem.url.replace(/\//g, '_').replace(/:/g, '').replace(/\./g, '_');

			console.log('jobId', jobId);

			destinationQueue.add({
				url   : queueItem.url,
				step0 : queueItem
			}, {
				jobId    : jobId,
				attempts : 10
			});

		}

	});

	crawler.on('complete', function () {

		console.log('crawling complete');

	});

	crawler.start();

};