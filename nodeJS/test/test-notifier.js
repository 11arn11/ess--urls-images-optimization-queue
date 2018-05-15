(async function () {

	try {

		const mail_notifier = require('../modules/mail-notifier');

		const config = require('../config');

		let status = await mail_notifier(config.smtp, {
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
		});

		console.log(status);

	} catch (e) {

		console.log('error',e);

		process.exit();

	}

})();