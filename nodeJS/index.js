const RateLimiter = require('limitme');

const crawler     = require('./workers/crawler');
const psi_fetcher = require('./workers/psi_fetcher');
const pso_fetcher = require('./workers/pso_fetcher');

const config = require('./config');

crawler({

	redis : config.REDIS,

	destination_queue_name : config.QUEUE.step1,

	homepage : 'https://www.galbani.it'

});

const rate_limiter = new RateLimiter(2000);

psi_fetcher({

	REDIS : config.REDIS,

	source_queue_name : config.QUEUE.step1,

	destination_queue_name : config.QUEUE.step2,

	rate_limiter : rate_limiter,

	GOOGLE_PSI_KEY : config.GOOGLE_PSI_KEY

});

pso_fetcher({

	REDIS : config.REDIS,

	source_queue_name : config.QUEUE.step2,

	rate_limiter : rate_limiter,

	GOOGLE_PSI_KEY : config.GOOGLE_PSI_KEY,

	temp_storage : config.temp_storage,

	domain_filter : config.domain_filter

});