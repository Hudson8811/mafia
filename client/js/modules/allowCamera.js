define(['jquery', 'swfobject', 'render/dialog', 'render/baseVideo'],
	function ($, swf, dialog, baseVideo) {
		var self;
		self = {
			check: function (cb) {
				var _template = _.template($('#checkCamera').html());

				var checkVideoDialog = dialog.create(_template({content: true}), {
					title: phrases.check_video
				});

				var video = baseVideo(0)();
				$('#checkCameraContent').prepend(video.getElement());

				video.init({
						cameraEvent: function (e, code) {
							if (code == 'Camera.Unmuted') {
								dialog.close(checkVideoDialog);

								dialog = dialog.create(_template({content: false}), {
										title: phrases.check_video,
										buttons: [
											{
												'title': phrases.complete_camera,
												'className': 'buttonRed',
												'onClick': function (e, dialog, id) {
													dialog.close(id);
													$(self).trigger('successVideo', video);
													cb(null);
												}
											}
										]
									}
								);
								$('#checkCameraContent').prepend(video.getElement());
							} else if (code == 'Camera.UnmutedSave') {
								dialog.close(checkVideoDialog);
								$(self).trigger('successVideo', video);
								cb(null);
							}
							else if (code == 'Camera.NotFounded') {
								dialog.close(checkVideoDialog);
								cb(new Error(phrases.error_camera_not_founded));
							} else {
								dialog.close(checkVideoDialog);
								cb(new Error(phrases.error_you_need_allow_camera));
							}
						}
					}
				);

			}
		};
		return self;
	});
