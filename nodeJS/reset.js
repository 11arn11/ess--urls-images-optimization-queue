const Queue = require('bull');

const config = require('./config');

const pagesQueue           = new Queue('pages', {redis : config.REDIS});
const pagesToOptimizeQueue = new Queue('pagesToOptimize', {redis : config.REDIS});

(async function () {

	await pagesQueue.clean(0);

	await pagesToOptimizeQueue.clean(0);

	console.log('reset OK ');

})();



