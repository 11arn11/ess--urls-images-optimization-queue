const RateLimiter = require('limitme');

const psi_fetcher = require('./workers/psi_fetcher');

const config = require('./config');

const rate_limiter = new RateLimiter(2000);

console.log('start');

psi_fetcher({

	REDIS : config.REDIS,

	source_queue_name : config.QUEUE.step1,

	destination_queue_name : config.QUEUE.step2,

	rate_limiter : rate_limiter,

	GOOGLE_PSI_KEY : config.GOOGLE_PSI_KEY

});

console.log('finish');
