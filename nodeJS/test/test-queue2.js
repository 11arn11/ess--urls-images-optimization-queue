const Queue = require('bull');

const queue_2_2 = new Queue('queue2');

(async function () {

	// pause globally
	// in this way, Arena will not show the jobs of queue 2 until queue 2 is resumed
	queue_2_2.pause();

	// paused locally
	// in this way I will not be able to restart the second queue externally
	// queue_2_2.pause(true);

	queue_2_2.process(function (job, done) {

		console.log(job.data);

		done();

	});

})();

