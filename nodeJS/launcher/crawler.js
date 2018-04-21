const args = require('../modules/cli')();

const crawler = require('../workers/crawler');

const config = require('../config');

let site = config.sites[args.site];

let step1_queue = site.name + '/' + config.queue.step1;

crawler({
	site_name              : site.name,
	semaphore_path         : config.storage.semaphore,
	redis                  : config.redis,
	destination_queue_name : step1_queue,
	homepage               : site.homepage
});