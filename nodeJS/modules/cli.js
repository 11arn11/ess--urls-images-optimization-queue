const program = require('commander');

const package_json = require('../package');
const config       = require('../config');

module.exports = function () {

	program

		.version(package_json.version, '-v, --version')

		.usage('[options]')

		.option('-c, --config', 'Show available site configuration')
		.option('-s, --site <name>', 'Site configuration name')

		.parse(process.argv)

	;

	if (program.config) {
		console.info('Available site configuration name:');
		Object.keys(config.sites).forEach(function (site_name) {
			console.info('-', site_name);
		});
		process.exit();
	}

	if (!program.site) {
		console.error('Error: site argument missing');
		process.exit();
	}

	if (!Object.keys(config.sites).includes(program.site)) {
		console.error('Error: site configuration missing for "' + program.site + '"');
		process.exit();
	}

	return program;

};

