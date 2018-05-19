const MongoClient = require('mongodb').MongoClient;

let Logger = function (config) {

	this.config            = config;
	this.config.host       = config.host || 'localhost';
	this.config.port       = config.port || 27017;
	this.config.db         = config.db || 'logs';
	this.config.collection = config.collection || 'logs';

};

Logger.prototype.info  = function (key, data) {
	return log(this, 'info', key, data);
};
Logger.prototype.error = function (key, data) {
	return log(this, 'error', key, data);
};

module.exports = Logger;

function log(_this, level, key, data) {

	let db_url = 'mongodb://' + _this.config.host + ':' + _this.config.port;

	let log = {
		level : level,
		key   : key,
		data  : data
	};

	return MongoClient.connect(db_url)
		.then((conn) => {
			return conn.db(_this.config.db).collection(_this.config.collection).insertOne(log)
				.then(() => {
					return conn.close();
				});
		});

}