const args = require('./modules/cli')();

const Queue = require('bull');

const config = require('./config');

let site = config.sites[args.site];

let step1_queue = site.name + '/' + config.QUEUE.step1;
let step2_queue = site.name + '/' + config.QUEUE.step2;

const step1Queue = new Queue(step1_queue, {redis : config.REDIS});
const step2Queue = new Queue(step2_queue, {redis : config.REDIS});

(async function () {

	let period = 0;

	await step1Queue.empty();
	await step1Queue.clean(period, 'completed');
	await step1Queue.clean(period, 'wait');
	await step1Queue.clean(period, 'active');
	await step1Queue.clean(period, 'delayed');
	await step1Queue.clean(period, 'failed');

	await step2Queue.empty();
	await step2Queue.clean(period, 'completed');
	await step2Queue.clean(period, 'wait');
	await step2Queue.clean(period, 'active');
	await step2Queue.clean(period, 'delayed');
	await step2Queue.clean(period, 'failed');

	console.log('reset', site.name);

	process.exit();

})();