const args = require('./modules/cli')();

const RateLimiter = require('limitme');

const psi_fetcher = require('./workers/psi_fetcher');

const config = require('./config');

const rate_limiter = new RateLimiter(2000);

let site = config.sites[args.site];

let step1_queue = site.name + '/' + config.queue.step1;
let step2_queue = site.name + '/' + config.queue.step2;

psi_fetcher({
	redis                  : config.redis,
	source_queue_name      : step1_queue,
	destination_queue_name : step2_queue,
	rate_limiter           : rate_limiter,
	google_psi_api_key     : config.google_psi_api_key
});