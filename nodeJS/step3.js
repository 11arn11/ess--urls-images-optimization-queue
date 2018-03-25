const args = require('./modules/cli')();

const uploader = require('./workers/uploader');

const config = require('./config');

let site = config.sites[args.site];

let step3_queue = site.name + '/' + config.queue.step3;

uploader({
	redis             : config.redis,
	source_queue_name : step3_queue,
	storage           : config.storage,
	smtp              : config.smtp
});