const request = require('request-promise');

const md5     = require('md5');
const md5File = require('md5-file');

const mysql = require('promise-mysql');

const config = require('../config');

module.exports = {

	save : async function (master_file_url, optimized_file_path, file_path) {

		let master_file_binary = await request({
			url      : master_file_url,
			encoding : null
		});
		let master_file_id     = await get_file_version_id(master_file_binary, 'M', file_path);
		console.log(master_file_id);

		let optimized_file_binary = '';
		let optimized_file_id     = await get_file_version_id(optimized_file_binary, 'O', file_path, master_file_id);
		console.log(optimized_file_id);

	}

};

function get_file_version_id(binary, version, path, master_file_id) {

	if (!master_file_id && version !== 'M') {
		throw new Error('master_file_id non trovato per la versione '.version);
	}

	let connection, md5_binary, md5_path;

	md5_binary = md5(binary);
	md5_path   = md5(path);

	return mysql.createConnection(config.mysql).then(function (conn) {

		connection = conn;

		let sql = 'SELECT id FROM images_history WHERE md5_binary=? AND version=? AND md5_path=?';

		return connection.query(sql, [md5_binary, version, md5_path]);

	}).then(async function (rows) {

		if (rows.length === 0) {

			let size, width, height, mime, extension, live;

			size      = 0;
			width     = 0;
			height    = 0;
			mime      = 'image/png';
			extension = 'jpg';
			live      = version === 'M' ? 1 : 0;

			let sql = 'INSERT INTO images_history SET ?';

			let result = await connection.query(sql, {
				path           : path,
				md5_path       : md5_path,
				md5_binary     : md5_binary,
				version        : version,
				size           : size,
				width          : width,
				height         : height,
				mime           : mime,
				extension      : extension,
				live           : live,
				master_file_id : master_file_id | null,
			});

			return result.insertId;

		} else {

			return rows[0].id;

		}

	}).then(async function (file_id) {

		await connection.end();

		return file_id;

	});

}