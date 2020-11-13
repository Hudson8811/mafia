define(['modules/config'], function (config) {
	var DEBUG = {log: function(){}};
	if (config.debug) {
		DEBUG = (function () {
			var timestamp = function () {
			};

			timestamp.toString = function () {
				return "[DEBUG " + (new Date).toLocaleTimeString() + "]";
			};

			return {
				log: console.log.bind(console, '%s', timestamp)
			}
		})();
	}

	return DEBUG;
});
