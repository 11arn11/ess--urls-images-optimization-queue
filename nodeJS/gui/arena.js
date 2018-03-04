const Arena = require('bull-arena');

const express = require('express');
const router  = express.Router();

const config = require('../config');

let queues = [];

for (let c = 0; c < Object.keys(config.sites).length; c++) {
	let site = config.sites[Object.keys(config.sites)[c]];
	queues.push({
		name     : site.name + '/' + config.QUEUE.step1,
		'hostId' : config.REDIS.host,
	});
	queues.push({
		name     : site.name + '/' + config.QUEUE.step2,
		'hostId' : config.REDIS.host,
	});
}

const options = {
	queues : queues
};

const settings = {
	redis : {
		host : config.REDIS.host,
		port : config.REDIS.port
	}
};

console.log(settings);

const arena = Arena(options, settings);

router.use('/', arena);