const config    = require('./config');
const recursive = require('recursive-readdir');
const path      = require('path');

const ImageArchiver = require('./modules/image-archiver');

(async () => {

	recursive(config.storage.archive).then(
		async function (files) {

			// console.log("files are", files);

			let ordered_files = files.sort();

			let master_file_id = null;

			for (let i = 0; i < ordered_files.length; i++) {

				let file = ordered_files[i];

				let filename = path.basename(file.replace(config.storage.archive + '/', ''));

				let file_path           = path.dirname(file.replace(config.storage.archive + '/', ''));
				let file_version        = filename.substr(22, 1);
				let local_file_path     = file;
				let storage_folder_path = config.storage.storage;

				let created_at = filename.substr(0, 20).replace('__', ' ').replace(/_/g, '-');

				console.log(filename, master_file_id, file_version);
				master_file_id = await ImageArchiver.register(file_path, file_version, local_file_path, storage_folder_path, master_file_id, created_at)

			}

			// console.log("files are", files);
		},
		function (error) {
			console.error("something exploded", error);
		}
	);

})();