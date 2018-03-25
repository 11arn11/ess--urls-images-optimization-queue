const Queue = require('bull');

const message = require('../modules/message');

const config = require('../config');

let pagesQueue = new Queue('fruttolo/' + config.queue.step1, {redis : config.redis});

pagesQueue.add(message.complete());
