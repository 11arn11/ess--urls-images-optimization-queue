const crawler     = require('./workers/crawler');

const config = require('./config');

crawler({

	redis : config.REDIS,

	destination_queue_name : config.QUEUE.step1,

	homepage : 'https://www.galbani.it'

});