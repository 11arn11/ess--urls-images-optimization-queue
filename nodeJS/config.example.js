module.exports = {

	redis : {
		host : "YOUR_redis_HOST",
		port : "YOUR_redis_PORT"
	},

	google_psi_api_key : "YOUR_GOOGLE_PSI_API_KEY",

	storage : {
		output  : 'temp/optimized',
		archive : 'temp/archive',
		zip     : 'temp/zip',
		log     : 'log'
	},

	sites : {

		SITE_NAME : { // your site config key
			name          : 'SITE_LABEL',
			homepage      : 'SITE_HOMEPAGE', // http://www.site.com
			domain_filter : [
				'www.domain1.com',
				'www.domain2.com'
			],
			ftp           : {
				host          : 'FTP_HOST',
				port          : 'FTP_PORT',
				user          : 'FTP_USER',
				password      : 'FTP_PASSWORD',
				path          : 'FTP_PATH',
				remove_domain : true, // TRUE to filter domain folder
			}
		},

	},

	queue : {
		step1 : 'pages',
		step2 : 'pagesToOptimize',
		step3 : 'imagesToUpload',
	},

};