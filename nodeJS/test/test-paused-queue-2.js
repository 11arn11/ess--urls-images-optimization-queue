const Queue = require('bull');

const config = require('../config');

let paused_queue = new Queue('paused', {redis : config.redis});

(async function () {

	await paused_queue.resume();

})();

