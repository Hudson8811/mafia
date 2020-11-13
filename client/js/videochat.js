'use strict';

requirejs.config({
	baseUrl: '/client/js',
	paths: {
		'jquery': './vendor/jquery/dist/jquery',
		'underscore': './vendor/underscore/underscore',
		'swfobject': './vendor/swfobject/swfobject/swfobject',
		'async': './vendor/async/dist/async'
	}
});
window.version = 1;

require(['jquery', 'async', 'underscore', 'modules/peers', 'render/baseVideo', 'render/window', 'modules/allowCamera'], function($, async, _, peers, baseVideo, windowVideo, allowCamera){
	var users = [];
	$(function(){
		var $videoContainer = $('.allVideoContainer');
		async.waterfall([
			function(cb){
				$(allowCamera).on('successVideo', function(e, video){

					var videoWindow = windowVideo('');
					videoWindow.setVideo(video);
					videoWindow.setUsername(data.username);
					videoWindow.setProfileUrl(data.profileUrl);

					$videoContainer.append(videoWindow.getElement());

					video.connect(data.serverUrl);
					video.stream(data.id);
					video.setVideo(true);
					video.setAudio(true);

					users.push({
						id:data.id,
						username:data.username,
						profileUrl:data.profileUrl,
						window: videoWindow
					});

					$(document).on('click', '#settings', function(){
						var $settingsVideo = $('#videoSettings');

						if ($settingsVideo.is(':visible')){
							videoWindow.setVideoElement($settingsVideo.find('video'));
							$settingsVideo.hide();
						} else {
							$(videoWindow.getVideo().getElement()).appendTo($settingsVideo.find('.video-here'));
							$settingsVideo.show();
							video.showSettings();
						}

						return false;
					});
					$('#hi').hide();
					$('#buttons').show();
				});
				allowCamera.check(cb);
			},
			function(cb){
				$(peers).on('add', function(e, user){
					var video = baseVideo(1)();
					var videoWindow = windowVideo('');

					videoWindow.setVideo(video);
					videoWindow.setUsername(user.username);
					videoWindow.setProfileUrl(user.profileUrl);
					videoWindow.setOnline();

					$videoContainer.append(videoWindow.getElement());

					video.init({});
					video.connect(data.serverUrl);
					video.stream(user.id);
					video.setVideo(true);
					video.setAudio(true);

					users.push({
						id:user.id,
						username:user.username,
						profileUrl:user.profileUrl,
						window:videoWindow
					});
				});

				$(peers).on('close', function(e, user){
					var data = _.findWhere(users, {id:user.id});
					if (data){
						var videoWindow = data.window;
						videoWindow.getVideo().remove();
						$(videoWindow.getElement()).remove();

					}
				});

				peers.init();
				cb(null);
			}
		], function(err){
			if (err){
				console.error(err);
			}
		});
	});
});
