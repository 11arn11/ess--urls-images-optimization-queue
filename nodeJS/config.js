module.exports = {

	REDIS : {
		"host" : "127.0.0.1",
		"port" : "6379"
	},

	GOOGLE_PSI_KEY : "AIzaSyCLRB-SnqDh3hEXAYdDvlQVi0iURBvHR1g",
	//GOOGLE_PSI_KEY : "AIzaSyALHl_PAlecsrHffP_MUpI8-WRmPfNPaqA",

	temp_storage : 'tmp/storage',

	domain_filter : [
		'www.galbani.it'
	],

	QUEUE : {

		step1 : 'pages',

		step2 : 'pagesToOptimize'

	},

	ARENA : {
		queues : [
			{
				name     : 'pages',
				"hostId" : "local",
			},
			{
				name     : 'pagesToOptimize',
				"hostId" : "local",
			},
		]
	}
};