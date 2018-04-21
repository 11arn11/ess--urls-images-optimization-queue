const request = require('request-promise');

module.exports = async function page_speed_optimization(url, psi_key, throttle_pso, proxy_url) {

	let config = {

		key                          : psi_key,
		strategy                     : 'desktop',
		url                          : url,
		filter_third_party_resources : true

	};

	return await throttle_pso

		.enqueue()

		.then(async function () {

			let options = {
				url      : 'https://developers.google.com/speed/pagespeed/insights/optimizeContents',
				qs       : config,
				encoding : null,
				proxy    : proxy_url,
			};

			if (proxy_url)
				options.proxy = proxy_url;

			return await request(options);

		})

		;

};
