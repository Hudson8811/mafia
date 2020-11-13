define([
	'render/loader',
	'render/meeting',
	'render/dialog',
	'render/panel',
	'render/area',
	'render/meWindow',
	'render/leadingWindow',
	'render/newspaper',
	'render/content',
	'render/finish',
	'render/baseVideo',
	'render/background',
	'render/nightVideo',
	'render/buyPlace'
],
	function (loader, meeting, dialog, panel, area, meWindow, leadingWindow, newspaper, content, finish, video, background, nightVideo, buyPlace) {
		return {
			loader: loader,
			meeting: meeting,
			dialog: dialog,
			panel: panel,
			area: area,
			meWindow: meWindow,
			leadingWindow: leadingWindow,
			newspaper: newspaper,
			content: content,
			finish: finish,
			publish: video(0),
			player:video(1),
			background: background,
			nightVideo: nightVideo,
			buyPlace: buyPlace
		}
	});
