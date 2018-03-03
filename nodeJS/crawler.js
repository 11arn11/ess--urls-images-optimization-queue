const Crawler = require('simplecrawler');
const Queue   = require('bull');

const config = require('./config');

const homepage = 'https://www.galbani.it';

let pagesQueue = new Queue('pages', {redis : config.REDIS});

let crawler = new Crawler(homepage);

crawler.initalPath          = '/';
crawler.sortQueryParameters = true;
crawler.respectRobotsTxt    = false;

crawler.on('crawlstart', async function () {

	console.log('Starting "crawling" ' + homepage);

	await pagesQueue.empty();

});

crawler.on('fetchcomplete', async function (queueItem, responseBuffer, response) {

	if (queueItem.stateData.contentType.match('text/html')) {

		console.log(queueItem.stateData.contentType, queueItem.url);

		pagesQueue.add(queueItem);

	}

});

crawler.on('complete', function () {

	console.log('complete');

});

crawler.start();
