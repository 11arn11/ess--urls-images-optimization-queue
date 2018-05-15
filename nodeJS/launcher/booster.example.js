const args = require('../modules/cli')();

const apikey_ratelimiter = require('../modules/apikey-ratelimiter');

const crawler     = require('../workers/crawler');
const psi_fetcher = require('../workers/psi_fetcher');
const pso_fetcher = require('../workers/pso_fetcher');
const uploader    = require('../workers/uploader');

const config = require('../config');

let site = config.sites[args.site];

let step1_queue = site.name + '/' + config.queue.step1;
let step2_queue = site.name + '/' + config.queue.step2;
let step3_queue = site.name + '/' + config.queue.step3;

try {

	// Crawler
	crawler({
		site_name              : site.name,
		semaphore_path         : config.storage.semaphore,
		redis                  : config.redis,
		destination_queue_name : step1_queue,
		homepage               : site.homepage
	});

	// PSI
	[
		[2000, 'YOUR_PSI_API_KEY', 'localhost'],
		[2000, 'YOUR_PSI_API_KEY', 'localhost'],
		[2000, 'YOUR_PSI_API_KEY', 'localhost'],
		[2000, 'YOUR_PSO_API_KEY', 'localhost'],
	].forEach(function (settings) {

		let proxy_url = settings[2] | null;

		let akrl = apikey_ratelimiter(settings[0], settings[1], proxy_url);

		psi_fetcher({
			redis                  : config.redis,
			source_queue_name      : step1_queue,
			destination_queue_name : step2_queue,
			rate_limiter           : akrl.rate_limiter,
			google_psi_api_key     : akrl.api_key,
			proxy                  : akrl.proxy_url
		});

	});

	// PSO
	[
		[2000, 'YOUR_PSO_API_KEY', 'localhost'],
		[2000, 'YOUR_PSO_API_KEY', 'localhost'],
		[2000, 'YOUR_PSO_API_KEY', 'localhost'],
	].forEach(function (settings) {

		let proxy_url = settings[2] | null;

		let akrl = apikey_ratelimiter(settings[0], settings[1], proxy_url);

		pso_fetcher({
			redis                  : config.redis,
			source_queue_name      : step2_queue,
			destination_queue_name : step3_queue,
			rate_limiter           : akrl.rate_limiter,
			google_psi_api_key     : akrl.api_key,
			proxy                  : akrl.proxy_url,
			storage                : config.storage,
			domain_filter          : site.domain_filter,
			//
			semaphore_path         : config.storage.semaphore,
			site_name              : site.name,
			smtp                   : config.smtp
		});

	});

	// Uploader
	uploader({
		redis             : config.redis,
		source_queue_name : step3_queue,
		storage           : config.storage,
		ftp               : site.ftp,
		status            : false,
		semaphore_path    : config.storage.semaphore,
		site_name         : site.name,
		smtp              : config.smtp
	});

} catch (err) {

	console.log('errore', err);

}