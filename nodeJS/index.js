const RateLimiter = require('limitme');

const crawler     = require('./workers/crawler');
const psi_fetcher = require('./workers/psi_fetcher');
const pso_fetcher = require('./workers/pso_fetcher');

const config = require('./config');

let site = config.sites.fruttolo;

let step1_queue = site.name + '/' + config.QUEUE.step1;
let step2_queue = site.name + '/' + config.QUEUE.step2;

try {

	crawler({
		REDIS                  : config.REDIS,
		destination_queue_name : step1_queue,
		homepage               : site.homepage
	});

	const rate_limiter = new RateLimiter(2000);

	psi_fetcher({
		REDIS                  : config.REDIS,
		source_queue_name      : step1_queue,
		destination_queue_name : step2_queue,
		rate_limiter           : rate_limiter,
		GOOGLE_PSI_KEY         : config.GOOGLE_PSI_KEY
	});

	pso_fetcher({
		REDIS             : config.REDIS,
		source_queue_name : step2_queue,
		rate_limiter      : rate_limiter,
		GOOGLE_PSI_KEY    : config.GOOGLE_PSI_KEY,
		temp_storage      : config.temp_storage,
		domain_filter     : site.domain_filter
	});

} catch (err) {

	console.error(err)

}