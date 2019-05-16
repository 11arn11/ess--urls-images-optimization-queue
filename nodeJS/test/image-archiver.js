const ImageArchiver = require('../modules/image-archiver');
const config        = require('../config');

(async () => {

	let master_file_url = 'https://www.galbani.it/img_din/Tiramisu_bdsb_hp.jpg';

	let optimized_file_path = '/Users/andrea.nigro/PhpstormProjects/ess--urls-images-optimization-queue/__DONE';

	let file_path = 'www.galbani.it/img_din/Tiramisu_bdsb_hp.jpg';

	await ImageArchiver.save(file_path, master_file_url, optimized_file_path, config.storage.storage);

})();