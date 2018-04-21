const RateLimiter = require('limitme');

module.exports = function (limit_me, api_key, proxy_url) {

	return {
		rate_limiter : new RateLimiter(limit_me),
		api_key      : api_key,
		proxy_url    : proxy_url
	}

};