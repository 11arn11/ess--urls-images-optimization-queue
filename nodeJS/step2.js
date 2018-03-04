const RateLimiter = require('limitme');

const pso_fetcher = require('./workers/pso_fetcher');

const config = require('./config');

const rate_limiter = new RateLimiter(2000);

let site = config.sites.fruttolo;

let step2_queue = site.name + '/' + config.QUEUE.step2;

pso_fetcher({

	REDIS : config.REDIS,

	source_queue_name : step2_queue,

	rate_limiter : rate_limiter,

	GOOGLE_PSI_KEY : config.GOOGLE_PSI_KEY,

	temp_storage : config.temp_storage,

	domain_filter : site.domain_filter

});