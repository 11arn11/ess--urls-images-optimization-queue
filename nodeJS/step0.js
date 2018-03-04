const args = require('./modules/cli')();

const crawler = require('./workers/crawler');

const config = require('./config');

let site = config.sites[args.site];

let step1_queue = site.name + '/' + config.QUEUE.step1;

crawler({

	REDIS : config.REDIS,

	destination_queue_name : step1_queue,

	homepage : site.homepage

});