module.exports = {

	redis : {
		host : "YOUR_redis_HOST",
		port : "YOUR_redis_PORT"
	},

	google_psi_api_key : "YOUR_GOOGLE_PSI_API_KEY",

	temp_storage : 'YOUR_STORAGE_ABSOLUTE_PATH', // /tmp/ess_uioq

	sites : {

		SITE_NAME : { // your site config key
			name          : 'SITE_LABEL',
			homepage      : 'SITE_HOMEPAGE', // http://www.site.com
			domain_filter : [
				'www.domain1.com',
				'www.domain2.com'
			],
		},

	},

	queue : {
		step1 : 'pages',
		step2 : 'pagesToOptimize'
	},

};