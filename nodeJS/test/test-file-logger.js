const file_logger = require('../modules/file-logger');

let file_path = 'temp/log/log1.log';

(async function () {

	await file_logger(file_path, ['testo 1', 'testo 22']);

	await file_logger(file_path, ['testo 3', 'testo 44'], 'warning');

	await file_logger(file_path, ['testo 5', 'testo 66'], 'error');

})();