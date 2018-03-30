const args = require('./modules/cli')();

const Queue = require('bull');

const config = require('./config');

let site = config.sites[args.site];

(async function () {

	let period = 0;

	let queues = Object.keys(config.queue);

	for (let q = 0; q < queues.length; q++) {

		let site = config.sites[args.site];

		let name = site.name + '/' + config.queue[queues[q]];

		console.log(name);

		let queue = new Queue(name, {redis : config.redis});

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