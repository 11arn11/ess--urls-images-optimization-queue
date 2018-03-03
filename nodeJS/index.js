const crawler     = require('./crawler');
const psi_fetcher = require('./psi_fetcher');
const pso_fetcher = require('./pso_fetcher');

let homepage = 'https://www.galbani.it';

let queue_name = 'crawler';

crawler(homepage, queue_name);