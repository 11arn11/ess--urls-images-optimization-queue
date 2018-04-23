var mailer = require('nodemailer-promise');

const config = require('../config');

var sendEmail = mailer.config(config.smtp);

var message = {
	from        : '"✔ ESS - URLs Images Optimization Queue 👻" <ess--urls-iamges-optimization-queue@mail-delivery.it>',
	to          : 'andrea.nigro@ogilvy.com',
	subject     : 'Oggetto della mail',
	text        : [
		'Il processo è terminato',
		'',
		'ciao',
		'Andrea R.'
	].join('\n'),
	attachments : [{
		path : '/Users/andrea.nigro/PhpstormProjects/ess--urls-images-optimization-queue/log/ovs__2018_04_03T15_07_53_038Z'
	}]
};

sendEmail(message)
	.then(function(info){console.log(info)})   // if successful
	.catch(function(err){console.log('got error'); console.log(err)});