const args = require('./modules/cli')();

const Queue = require('bull');

const config = require('./config');

let site = config.sites[args.site];

let queues = [];

for (let q = 0; q < Object.keys(config.queue).length; q++) {

	let name  = site.name + '/' + Object.keys(config.queue)[q];
	let queue = new Queue(name, {redis : config.redis});
	queues.push(queue);

}

(async function () {

	let period = 0;

	for (let q = 0; q < queues.length; q++) {

		let queue = queues[q];
		console.log(queue);

		await queue.empty();
		await queue.clean(period, 'completed');
		await queue.clean(period, 'wait');
		await queue.clean(period, 'active');
		await queue.clean(period, 'delayed');
		await queue.clean(period, 'failed');

	}

	console.log('reset', site.name, '(', queues.length, ' queue)');

	process.exit();

})();