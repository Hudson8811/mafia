define(['underscore', 'jquery'],
	function (_, $) {
		var default_config = {
			images: '/client/static/images.json',
			music: '/client/static/music.json'
		};

		var config;
		var self;

		var totalByte = 0;
		var totalCount = 0;
		var totalBytesLoaded = 0;
		var totalCountLoaded = 0;

		var imageList = {};
		var musicList = {};
		var list = {};

		var loadingConfig = function (cb) {
			getFileList(config.images, function (data) {
				imageList = data;
				$(self).trigger('loading');
			});
			getFileList(config.music, function (data) {
				musicList = data;
				$(self).trigger('loading')
			});
			$(self).on('loading', function () {
				if (!_.isEmpty(musicList) && !_.isEmpty(imageList)) {
					list = _.extend({}, musicList, imageList);
					_.each(list, function (el) {
						totalByte += el;
						totalCount++;
					});
					$(self).on('downloadFile', function (e, file) {
						totalBytesLoaded += list[file];
						totalCountLoaded ++;
						$(self).trigger('completeFile', Math.floor((totalBytesLoaded/totalByte)*100));
						if (totalBytesLoaded == totalByte){
							$(self).trigger('complete');
						}
					});
					loadImages();
					loadMusic();
				}
			});
		};

		var loadImages = function () {
			_.each(imageList, function (size, file) {
				var image = new Image();
				image.src = '/client/' + file;

				image.onload = function (file) {
					$(self).trigger('downloadFile', file);
				}.bind(null, file);

				image.onerror = function (file) {
					$(self).trigger('error', {
						file: file
					});
				}.bind(null, file);

			});
		};

		var loadMusic = function () {
			_.each(musicList, function (size, file) {
				$.ajax({
					url: '/client/' + file,
					success: function (file) {
						$(self).trigger('downloadFile', file);
					}.bind(null, file),
					error: function (file) {
						$(self).trigger('error', {
							file: file
						});
					}.bind(null, file)
				});
			});
		};

		var getFileList = function (file, callback) {
			$.get(file + '?v=' + version, {}, function (data) {
				callback(data);
			}, 'json');
		};

		return self = {
			start: function (conf) {
				if (!conf) conf = {};
				config = _.defaults(conf, default_config);
				loadingConfig();
			}
		};
	}
)
;
