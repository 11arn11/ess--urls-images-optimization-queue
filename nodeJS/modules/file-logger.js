const fs     = require('fs');
const mkdirp = require('mkdirp');
const path   = require('path');

module.exports = async function (file_path, data, status, error) {

	let date = new Date().toISOString();

	status = status === undefined ? 'info' : status;

	let row = [date, status];

	for (let c = 0; c < data.length; c++) {
		row.push(data[c]);
	}

	error = error === undefined ? '' : error;
	row.push(error);

	let destination = path.dirname(file_path);
	if (!fs.existsSync(destination)) {
		mkdirp.sync(destination);
	}

	fs.appendFileSync(file_path, row.join('|@|') + '\n', (err) => {

		if (err) throw err;

	});

};