const request = require('request-promise');

module.exports = async function page_speed_insight(url, psi_key, throttle_psi, proxy_url) {

	let config = {

		key                          : psi_key,
		strategy                     : 'desktop',
		url                          : url,
		filter_third_party_resources : true

	};

	return await throttle_psi

		.enqueue()

		.then(async function () {

			let options = {
				url  : 'https://www.googleapis.com/pagespeedonline/v4/runPagespeed',
				qs   : config,
				json : true,

			};

			if (proxy_url) {
				options.proxy  = proxy_url;
				options.tunnel = true;
			}

			return await request(options);

		})

		;

}
