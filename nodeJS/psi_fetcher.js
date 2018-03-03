const Queue       = require('bull');
const RateLimiter = require('limitme');

const page_speed_insight = require('./modules/page-speed-insight');

const config = require('./config');

const pagesQueue = new Queue('pages', {redis : config.REDIS});

const pagesToOptimizeQueue = new Queue('pagesToOptimize', {redis : config.REDIS});

const throttle_psi = new RateLimiter(4000);

pagesQueue.process(10, async function (job, done) {

	let url, psi;

	try {

		url = job.data.url;

		psi = await page_speed_insight(url, config.GOOGLE_PSI_KEY, throttle_psi);

		let imageOptimizationRuleImpact = psi.formattedResults.ruleResults.OptimizeImages.ruleImpact;

		if (imageOptimizationRuleImpact > 0) {

			console.log('da ottimizzare ', imageOptimizationRuleImpact, url);
			pagesToOptimizeQueue.add(job.data);

			done(null, {
				'status'     : '2opt',
				'ruleImpact' : imageOptimizationRuleImpact,
			});

		} else {

			done(null, {
				'status' : 'OK'
			});

		}

	} catch (err) {

		done(err, {
			error : err,
			url   : url,
			psi   : psi
		});

	}

});