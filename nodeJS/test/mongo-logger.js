const config = require('../config');
const Logger = require('../modules/logger');

(async () => {

	let logger = new Logger(config.mongo);

	logger.info('test', {
		data1 : 1,
		data2 : 'asdsada',
		data3 : {
			'asdasd' : [
				'123',
				'456',
				{
					'test' : 123,
				}
			],
			pippo    : 'asdasd'
		}
	})

})();