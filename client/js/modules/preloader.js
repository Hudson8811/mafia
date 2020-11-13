define(['jquery', 'modules/game'], function ($, game) {
	window.errors = [];
	window.memory = [];

	$.ajaxPrefilter(function (options, originalOptions, xhr) {
		if (options.type == 'post' || options.type == 'POST') {
			options.data = $.param($.extend(originalOptions.data, {'gid': game.getId()}, csrf));
		}
	});
});
