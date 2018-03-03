const Queue = require('bull');

const config = require('./config');

const pagesQueue           = new Queue('pages', {redis : config.REDIS});
const pagesToOptimizeQueue = new Queue('pagesToOptimize', {redis : config.REDIS});

(async function () {

	let period = 0;

	await pagesQueue.clean(period, 'completed');
	await pagesQueue.clean(period, 'wait');
	await pagesQueue.clean(period, 'active');
	await pagesQueue.clean(period, 'delayed');
	await pagesQueue.clean(period, 'failed');

	await pagesToOptimizeQueue.clean(period, 'completed');
	await pagesToOptimizeQueue.clean(period, 'wait');
	await pagesToOptimizeQueue.clean(period, 'active');
	await pagesToOptimizeQueue.clean(period, 'delayed');
	await pagesToOptimizeQueue.clean(period, 'failed');


	console.log('reset OK ');

})();



