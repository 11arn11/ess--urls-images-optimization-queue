const request = require('request-promise');

const mkdirp = require('mkdirp');
const fs     = require('fs-extra');
const path   = require('path');

const sizeOf = require('image-size');

const md5     = require('md5');
const md5File = require('md5-file');

const mysql = require('promise-mysql');

const config = require('../config');

module.exports = {

	save : async function (file_path, master_file_url, optimized_file_path, storage_folder_path) {

		let temp_storage_folder_path = path.join(storage_folder_path, 'temp');
		if (!fs.existsSync(temp_storage_folder_path)) {
			mkdirp.sync(temp_storage_folder_path);
		}

		let master_file_binary = await request({
			url      : master_file_url,
			encoding : null
		});

		let master_temp_file_path = path.join(temp_storage_folder_path,md5(master_file_url));
		fs.writeFileSync(master_temp_file_path, master_file_binary);

		let master_file_id = await get_file_version_id(file_path, 'M', master_temp_file_path, storage_folder_path);

		let optimized_file_id = await get_file_version_id(file_path, 'O', optimized_file_path, storage_folder_path, master_file_id);

	}

};

async function get_file_version_id(file_path, file_version, local_file_path, storage_folder_path, master_file_id) {

	if (!master_file_id && file_version !== 'M') {
		throw new Error('master_file_id non trovato per la versione '.version);
	}

	let connection, md5_binary, md5_path, file_id;

	md5_binary = md5File.sync(local_file_path);
	md5_path   = md5(file_path);

	try {

		connection = await mysql.createConnection(config.mysql);

		try {

			let sql  = 'SELECT id FROM images_history WHERE md5_binary=? AND version=? AND md5_path=?';
			let rows = await connection.query(sql, [md5_binary, file_version, md5_path]);

			if (rows.length === 0) {

				try {

					await connection.query('START TRANSACTION;');

					try {

						let file_stat  = fs.statSync(local_file_path);
						let image_stat = await sizeOf(local_file_path);

						let size, width, height, extension, live;

						size       = file_stat.size;
						width      = image_stat.width;
						height     = image_stat.height;
						extension  = path.extname(file_path);
						live       = file_version === 'M' ? 1 : 0;
						let sql    = 'INSERT INTO images_history SET ?';
						let result = await connection.query(sql, {
							path           : file_path,
							md5_path       : md5_path,
							md5_binary     : md5_binary,
							version        : file_version,
							size           : size,
							width          : width,
							height         : height,
							extension      : extension,
							live           : live,
							master_file_id : master_file_id || null,
						});

						file_id = result.insertId;

						let stored_file_path = path.join(storage_folder_path, file_id + extension);

						if (!fs.existsSync(storage_folder_path)) {
							mkdirp.sync(storage_folder_path);
						}

						//FIXME
						//da rimuovere quando ci sarà una sola modalita di archiviazione dei file

						if (file_version === 'M') {
							fs.renameSync(local_file_path, stored_file_path);
						}
						else {
							fs.copyFileSync(local_file_path, stored_file_path);
						}

						await connection.query('COMMIT;');

					} catch (error) {
						console.error(error);
						await connection.query('ROLLBACK;');
						throw error;
					}

				} catch (error) {
					throw error;
				}

			} else {
				file_id = rows[0].id;
			}

		} catch (error) {
			await connection.end();
			throw error;
		}

		await connection.end();

	} catch (err) {
		throw err;
	}

	return file_id;

}
