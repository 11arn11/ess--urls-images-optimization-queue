module.exports = {

	complete : function () {

		return {
			type    : 'message',
			message : 'complete',
			time    : new Date().getTime()
		};

	},

	is_complete : function (obj) {

		return obj.type && obj.type === 'message' && obj.message && obj.message === 'complete';

	}

};