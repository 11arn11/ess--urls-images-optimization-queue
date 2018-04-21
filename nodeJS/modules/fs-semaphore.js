const mkdirp = require('mkdirp');
const fs     = require('fs');

module.exports = {

	is_green_light : function (path, resource_id) {

		if (!path)
			throw new Error('Invalid FsSemaphore path');

		if (!resource_id)
			throw new Error('Invalid Resource ID');

		let file_path = path + '/' + resource_id;

		return !fs.existsSync(file_path);
	},

	set_red_light : function (path, resource_id) {

		if (!path)
			throw new Error('Invalid FsSemaphore path');

		if (!resource_id)
			throw new Error('Invalid Resource ID');

		let file_path = path + '/' + resource_id;

		mkdirp.sync(path);

		fs.closeSync(fs.openSync(file_path, 'w'));

	},

	set_green_light : function (path, resource_id) {

		if (!path)
			throw new Error('Invalid FsSemaphore path');

		if (!resource_id)
			throw new Error('Invalid Resource ID');

		let file_path = path + '/' + resource_id;

		fs.unlinkSync(file_path);

	}

};
