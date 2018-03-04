module.exports = {

	REDIS : {
		"host" : "127.0.0.1",
		"port" : "9736"
	},

	GOOGLE_PSI_KEY : "AIzaSyCLRB-SnqDh3hEXAYdDvlQVi0iURBvHR1g",
	//GOOGLE_PSI_KEY : "AIzaSyALHl_PAlecsrHffP_MUpI8-WRmPfNPaqA",

	temp_storage : 'tmp/storage',

	sites : {

		fruttolo : {
			name          : 'fruttolo',
			homepage      : 'http://www.fruttolo.it',
			domain_filter : [
				'www.fruttolo.it'
			],
		},

		galbani : {
			name          : 'galbani',
			homepage      : 'https://www.galbani.it',
			domain_filter : [
				'www.galbani.it'
			],
		}

	},

	QUEUE : {
		step1 : 'pages',
		step2 : 'pagesToOptimize'
	},

};