module.exports = {

	redis : {
		host : "YOUR_redis_HOST",
		port : "YOUR_redis_PORT"
	},

	google_psi_api_key : "YOUR_GOOGLE_PSI_API_KEY",

	storage : {
		output    : '/tmp/ess-uioq/optimized',
		archive   : '/tmp/ess-uioq/archive',
		storage   : '/tmp/ess-uioq/storage',
		zip       : '/tmp/ess-uioq/zip',
		log       : '/tmp/ess-uioq/log',
		semaphore : '/tmp/ess-uioq'
	},

	smtp : {
		host   : "YOUR_smtp_HOST",
		port   : "YOUR_smtp_PORT",
		secure : false,
		auth   : {
			user : "YOUR_smtp_USERNAME",
			pass : "YOUR_smtp_PASSWORD"
		}
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