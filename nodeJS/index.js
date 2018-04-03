const args = require('./modules/cli')();

const RateLimiter = require('limitme');

const crawler     = require('./workers/crawler');
const psi_fetcher = require('./workers/psi_fetcher');
const pso_fetcher = require('./workers/pso_fetcher');
const uploader    = require('./workers/uploader');

const config = require('./config');

let site = config.sites[args.site];

let step1_queue = site.name + '/' + config.queue.step1;
let step2_queue = site.name + '/' + config.queue.step2;
let step3_queue = site.name + '/' + config.queue.step3;

try {

	crawler({
		redis                  : config.redis,
		destination_queue_name : step1_queue,
		homepage               : site.homepage
	});

	const rate_limiter = new RateLimiter(2000);

	psi_fetcher({
		redis                  : config.redis,
		source_queue_name      : step1_queue,
		destination_queue_name : step2_queue,
		rate_limiter           : rate_limiter,
		google_psi_api_key     : config.google_psi_api_key
	});

	pso_fetcher({
		redis                  : config.redis,
		source_queue_name      : step2_queue,
		destination_queue_name : step3_queue,
		rate_limiter           : rate_limiter,
		google_psi_api_key     : config.google_psi_api_key,
		storage                : config.storage,
		domain_filter          : site.domain_filter
	});

	uploader({
		redis             : config.redis,
		source_queue_name : step3_queue,
		storage           : config.storage,
		ftp               : site.ftp,
		site_name         : site.name
	});

} catch (err) {

	console.error(err)

}