const Queue = require('bull');

const config = require('../config');

let imagesToUploadQueue = new Queue('fruttolo/' + config.queue.step3, {redis : config.redis});

(async function (config) {

	console.log('inizio');

	let count_waiting = await imagesToUploadQueue.getWaitingCount();
	let count_active  = await imagesToUploadQueue.getActiveCount();

	console.log(count_waiting, count_active);

	let response = await imagesToUploadQueue.resume();
	console.log(response);

	console.log('fine');

})();