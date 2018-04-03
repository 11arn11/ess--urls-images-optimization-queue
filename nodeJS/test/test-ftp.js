const PromiseFtp = require('promise-ftp');

const config = require('../config');


const ftp = new PromiseFtp();

let ftp_config           = config.sites.fruttolo.ftp;
ftp_config.autoReconnect = true;

let local  = 'temp/archive/www.fruttolo.it/sites/default/files/VISORE_homepage_ste_v2.jpg';
let remote = '/var/tmp/ess-uioq/www.fruttolo.it/sites/default/files/VISORE_homepage_ste_v2.jpg';
let test   = ftp_config.path + '/foo.remote-copy.txt';

(async function () {

	console.log(ftp_config);

	await ftp.connect(ftp_config);

	await ftp.put(local, test);

	await ftp.end();

})();

