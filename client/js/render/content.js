define(['underscore', 'jquery'], function (_, $) {
	return function(selector, params) {
			var tpl = _.unescape($(selector).get(0).innerHTML);
			return _.template(tpl)(params);
	}
});