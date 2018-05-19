const ImageArchiver = require('../modules/image-archiver');

(async () => {

	let master_file_url = 'https://www.galbani.it/img_din/Tiramisu_bdsb_hp.jpg';

	let optimized_file_path = '/Users/andrea.nigro/PhpstormProjects/ess--urls-images-optimization-queue/temp/optimized/www.galbani.it/img_din/belpaese_curiosità.png';

	let file_path = 'www.galbani.it/img_din/Tiramisu_bdsb_hp.jpg';

	await ImageArchiver.save(master_file_url, optimized_file_path, file_path);

})();