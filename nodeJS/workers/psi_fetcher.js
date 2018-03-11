const Queue = require('bull');

const page_speed_insight = require('../modules/page-speed-insight');

module.exports = async function (config) {

	if (!config)
		throw new Error('Config non found');

	if (!config.redis)
		throw new Error('Redis config not found');

	if (!config.source_queue_name)
		throw new Error('source_queue_name not found');

	if (!config.destination_queue_name)
		throw new Error('destination_queue_name not found');

	if (!config.rate_limiter)
		throw new Error('RateLimiter instance not found');

	if (!config.google_psi_api_key)
		throw new Error('google_psi_api_key not found');

	const pagesQueue = new Queue(config.source_queue_name, {redis : config.redis});

	const pagesToOptimizeQueue = new Queue(config.destination_queue_name, {redis : config.redis});

	pagesQueue.process(10, async function (job, done) {

		let url, psi;

		try {

			url = job.data.url;

			psi = await page_speed_insight(url, config.google_psi_api_key, config.rate_limiter);

			let imageOptimizationRuleImpact = psi.formattedResults.ruleResults.OptimizeImages.ruleImpact;

			if (imageOptimizationRuleImpact > 0) {

				console.log('da ottimizzare ', imageOptimizationRuleImpact, url);

				let jobId = url.replace(/\//g, '_').replace(/:/g, '').replace(/\./g, '_');

				pagesToOptimizeQueue.add({
					url   : url,
					step1 : psi
				}, {
					jobId    : jobId,
					attempts : 10
				});

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

