const config = require('../config');

console.info(config.REDIS);

const app = require('bull-ui/app')({
	redis : config.REDIS
});

app.listen(4444, function () {
	console.log('bull-ui started listening on port', this.address().port);
});