const args = require('./modules/cli')();

const RateLimiter = require('limitme');

const pso_fetcher = require('./workers/pso_fetcher');

const config = require('./config');

const rate_limiter = new RateLimiter(2000);

let site = config.sites[args.site];

let step2_queue = site.name + '/' + config.queue.step2;

pso_fetcher({

	redis : config.redis,

	source_queue_name : step2_queue,

	rate_limiter : rate_limiter,

	google_psi_api_key : config.google_psi_api_key,

	temp_storage : config.temp_storage,

	domain_filter : site.domain_filter

});