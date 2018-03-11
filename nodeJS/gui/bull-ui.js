const config = require('../config');

console.info(config.redis);

const app = require('bull-ui/app')({
	redis : config.redis
});

app.listen(4444, function () {
	console.log('bull-ui started listening on port', this.address().port);
});