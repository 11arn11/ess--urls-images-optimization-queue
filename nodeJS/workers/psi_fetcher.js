const Queue = require('bull');

const message            = require('../modules/message');
const page_speed_insight = require('../modules/page-speed-insight');

module.exports = function (config) {

	check_config(config);

	const pagesQueue = new Queue(config.source_queue_name, {redis : config.redis});

	const pagesToOptimizeQueue = new Queue(config.destination_queue_name, {redis : config.redis});

	pagesQueue.process(10, async function (job, done) {

		let url, psi;

		try {

			if (message.is_complete(job.data)) {

				console.log('complete message receive');

				pagesQueue.on('global:completed', async function (jobId, result) {
					console.log('on global completed', jobId);
					await wait_for_finish(pagesQueue, pagesToOptimizeQueue);
				});
				pagesQueue.on('global:error', async function (err) {
					console.log('on global error', err);
					await wait_for_finish(pagesQueue, pagesToOptimizeQueue);
				});
				pagesQueue.on('global:failed', async function (jobId, err) {
					console.log('on global failes', jobId);
					await wait_for_finish(pagesQueue, pagesToOptimizeQueue);
				});
				pagesQueue.on('global:stalled', async function (jobId) {
					console.log('on global stalled', jobId);
					await wait_for_finish(pagesQueue, pagesToOptimizeQueue);
				});

				done(null, {
					'status' : 'completed'
				});

				return;

			}

			url = job.data.url;

			psi = await page_speed_insight(url, config.google_psi_api_key, config.rate_limiter, config.proxy_url);

			let imageOptimizationRuleImpact = psi.formattedResults.ruleResults.OptimizeImages.ruleImpact;

			if (imageOptimizationRuleImpact > 0) {

				// console.log('da ottimizzare ', imageOptimizationRuleImpact, url);

				let jobId = url.replace(/\//g, '_').replace(/:/g, '').replace(/\./g, '_');

				pagesToOptimizeQueue.add({
					url   : url,
					step1 : psi
				}, {
					jobId    : jobId,
					attempts : 10
				});

				done(null, {
					proxy        : config.proxy_url || 'localhost',
					'status'     : '2opt',
					'ruleImpact' : imageOptimizationRuleImpact,
				});

			} else {

				done(null, {
					proxy    : config.proxy_url === undefined ? 'localhost' : config.proxy_url,
					'status' : 'OK'
				});

			}

		} catch (err) {

			done(new Error(config.proxy_url === undefined ? 'localhost' : config.proxy_url), {
				error : err,
				url   : url,
				psi   : psi
			});

		}

	});
};

function check_config(config) {

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

}

async function wait_for_finish(pagesQueue, pagesToOptimizeQueue) {

	let count_waiting = await pagesQueue.getWaitingCount();
	let count_active  = await pagesQueue.getActiveCount();

	console.log('psi countdown', count_waiting, count_active);

	if (count_waiting === 0 && count_active === 0) {

		console.log('psi_fetcher complete');

		pagesToOptimizeQueue.add(message.complete(), {
			jobId : 'psi_fetcher complete'
		});

	}

}