define(['jquery'], function ($) {

	navigator.getUserMedia = navigator.getUserMedia ||
		navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

	var opts = {
		config: {
			audio: {
				optional: [
					{sourceId: null}
				]
			},
			video: {
				mandatory: {
					maxWidth: 320,
					maxHeight: 240,
					maxFrameRate: 10
				},
				optional: [
					{sourceId: null}
				]
			}
		},
		stream: null
	};

	var sources = {
		microphone: [],
		camera: []
	};

	var getSources = function (cb) {
		if (typeof MediaStreamTrack === 'undefined') {
			alert('This browser does not support MediaStreamTrack.\n\nTry Chrome.');
		} else {
			MediaStreamTrack.getSources(function (cb, sourceInfos) {
				for (var i = 0; i != sourceInfos.length; ++i) {
					var sourceInfo = sourceInfos[i];
					var option = {};
					option.value = sourceInfo.id;
					if (sourceInfo.kind === 'audio') {
						option.text = sourceInfo.label || 'microphone ' + (sources.microphone.length + 1);//https connection and label ok
						sources.microphone.push(option);
					} else if (sourceInfo.kind === 'video') {
						option.text = sourceInfo.label || 'camera ' + (sources.camera.length + 1);
						sources.camera.push(option);
					} else {
						DEBUG.log('Some other kind of source: ', sourceInfo);
					}
				}
				opts.config.audio.optional[0].sourceId = opts.config.audio.optional[0].sourceId || sources.microphone[0].value;
				opts.config.video.optional[0].sourceId = opts.config.video.optional[0].sourceId || sources.camera[0].value;
				cb();
			}.bind(null, cb));
		}
	}

	var gotStream = function () {

		navigator.getUserMedia(opts.config, function (stream) {
			opts.stream = stream;
			$(self).trigger('initComplete', {url: URL.createObjectURL(opts.stream), sources: sources, selected: {audio: opts.config.audio.optional[0].sourceId, video: opts.config.video.optional[0].sourceId}});
		}, function () {
			$(self).trigger('error');
		});
	}

	var init = function () {
		if (!!opts.stream) {
			opts.stream.stop();
			gotStream();
		} else {
			getSources(gotStream);
		}
	}

	var self = {
		init: init,
		opts: opts,
		setAudioSource: function (v) {
			opts.config.audio.optional[0].sourceId = v;
		},
		setVideoSource: function (v) {
			opts.config.video.optional[0].sourceId = v;
		},
		getAudioSource: function () {
			return opts.config.audio.optional[0].sourceId;
		},
		getVideoSource: function () {
			return opts.config.video.optional[0].sourceId;
		}
	}

	return self;
});

