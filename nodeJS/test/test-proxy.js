const request = require('request-promise');

(async function () {

	try {

		let config = {

			key                          : 'AIzaSyAU7XUrI8fG_ohnvqulunCw_3WgsbMyFuk',
			strategy                     : 'desktop',
			url                          : 'https://www.galbani.it/index.html',
			filter_third_party_resources : true

		};

		let options = {
			url      : 'https://developers.google.com/speed/pagespeed/insights/optimizeContents',
			qs       : config,
			encoding : null,
		};

		options.proxy  = 'http://86.107.98.214:8118';
		//options.tunnel = true;

		let output = await request(options);
		console.error(output);

	} catch (err) {

		console.error(err);

	}

})();