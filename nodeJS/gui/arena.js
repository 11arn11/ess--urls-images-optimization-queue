const Arena = require('bull-arena');

const express = require('express');
const router  = express.Router();

const config = require('../config');

let queues = [];

for (let c = 0; c < Object.keys(config.sites).length; c++) {

	let site = config.sites[Object.keys(config.sites)[c]];

	for (let q = 0; q < Object.keys(config.queue).length; q++) {

		let name = Object.keys(config.queue)[q];

		queues.push({
			name     : site.name + '/' + config.queue[name],
			'hostId' : config.redis.host,
			redis    : config.redis
		});

	}

}

queues.push({
	name     : 'paused',
	'hostId' : config.redis.host,
	redis    : config.redis
});

const options = {
	queues : queues
};

const arena = Arena(options);

router.use('/', arena);