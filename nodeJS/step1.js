const args = require('./modules/cli')();

const RateLimiter = require('limitme');

const psi_fetcher = require('./workers/psi_fetcher');

const config = require('./config');

const rate_limiter = new RateLimiter(2000);

let site = config.sites[args.site];

let step1_queue = site.name + '/' + config.QUEUE.step1;
let step2_queue = site.name + '/' + config.QUEUE.step2;

psi_fetcher({

	REDIS : config.REDIS,

	source_queue_name : step1_queue,

	destination_queue_name : step2_queue,

	rate_limiter : rate_limiter,

	GOOGLE_PSI_KEY : config.GOOGLE_PSI_KEY

});