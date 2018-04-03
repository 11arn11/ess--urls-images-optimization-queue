const Queue = require('bull');

const queue_1_1 = new Queue('queue1');
const queue_1_2 = new Queue('queue2');

(async function () {

	await queue_1_1.pause();

	queue_1_1.process(function (job, done) {

		if (something) {

			queue_1_2.resume();

		}

		console.log(job.data);

		done();

	});

})();