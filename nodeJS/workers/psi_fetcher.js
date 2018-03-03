const Queue = require('bull');

const page_speed_insight = require('../modules/page-speed-insight');

module.exports = async function (config) {

	if (!config)
		throw new Error('Config non found');

	if (!config.REDIS)
		throw new Error('Redis config not found');

	if (!config.source_queue_name)
		throw new Error('source_queue_name not found');

	if (!config.destination_queue_name)
		throw new Error('destination_queue_name not found');

	if (!config.rate_limiter)
		throw new Error('RateLimiter instance not found');

	if (!config.GOOGLE_PSI_KEY)
		throw new Error('GOOGLE_PSI_KEY not found');

	const pagesQueue = new Queue(config.source_queue_name, {redis : config.REDIS});

	const pagesToOptimizeQueue = new Queue(config.destination_queue_name, {redis : config.REDIS});

	pagesQueue.process(10, async function (job, done) {

		let url, psi;

		try {

			url = job.data.url;

			psi = await page_speed_insight(url, config.GOOGLE_PSI_KEY, config.rate_limiter);

			let imageOptimizationRuleImpact = psi.formattedResults.ruleResults.OptimizeImages.ruleImpact;

			if (imageOptimizationRuleImpact > 0) {

				console.log('da ottimizzare ', imageOptimizationRuleImpact, url);

				pagesToOptimizeQueue.add({
					url   : url,
					step1 : psi
				}, {attempts : 10});

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
};

