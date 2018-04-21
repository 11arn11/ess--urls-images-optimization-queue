const Queue = require('bull');

const config = require('../config');

let paused_queue = new Queue('paused', {redis : config.redis});

(async function () {

	// Before "pause"
	let waiting = await paused_queue.getWaitingCount();
	console.log('// Before "pause"', waiting);

	await paused_queue.pause();

	// After "pause"
	waiting = await paused_queue.getWaitingCount();
	console.log('// After "pause"', waiting);

	// After "add"
	paused_queue.add({});
	paused_queue.add({});
	paused_queue.add({});
	paused_queue.add({});
	paused_queue.add({});
	paused_queue.add({});
	waiting = await paused_queue.getWaitingCount();
	console.log('// After "add"', waiting);

	let w = await paused_queue.getWaiting();
	console.log(w.length);

	// After "resume"
	await paused_queue.resume();
	waiting = await paused_queue.getWaitingCount();
	console.log('// After "resume"', waiting);

	await paused_queue.close();

})();

