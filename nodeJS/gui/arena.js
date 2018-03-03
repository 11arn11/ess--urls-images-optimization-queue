const Arena = require('bull-arena');

const express = require('express');
const router  = express.Router();

const config = require('../config');

const arena = Arena(config.ARENA);

router.use('/', arena);