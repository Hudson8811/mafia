'use strict';

requirejs.config({
	baseUrl: '/client/js',
    waitSeconds : 40,
	paths: {
		'jquery': './vendor/jquery/dist/jquery',
		'jquery-ui': './vendor/jquery-ui/jquery-ui',
		'underscore': './vendor/underscore/underscore',
		'swfobject': './vendor/swfobject/swfobject/swfobject',
		'socket': './vendor/socket.io-client/dist/socket.io',
		'SoundManager': './vendor/soundmanager/script/soundmanager2-nodebug',
		'flipclock': './vendor/FlipClock/compiled/flipclock',
		'async': './vendor/async/dist/async',
		'jquery.cookie': './vendor/jquery.cookie/jquery.cookie',
		'jscrollpane': './vendor/jScrollPane/script/jquery.jscrollpane.min',
		'mousewheel': './vendor/jScrollPane/script/jquery.mousewheel'
	},
	shim: {
		'flipclock': ['jquery']
	}
});

require(['jquery', 'async', 'socket', 'modules/config', 'modules/preloader', 'modules/render', 'modules/game', 'modules/sendError', 'modules/loader', 'modules/actions', 'modules/checkBrowser', 'modules/allowCamera', 'modules/debug', 'modules/gameNotify', 'jquery.cookie'
], function ($, async, io, config, preloader, render, game, sendError, loader, actions, checkBrowser, allowCamera, DEBUG, notify) {

	var socket;

	$(function () {
		window.game = game;
		async.waterfall([
			checkBrowser.check,
			function (cb) {
				render.loader.show();
				loader.start();
				$(loader).on('completeFile', function (event, percent) {
					render.loader.setPercent(percent);
				});
				$(loader).on('complete', function () {
					render.loader.hide();
					cb(null);
				});
				$(loader).on('error', function (event, info) {
					cb(new Error(_.template(phrases.init.file_download_error)({filename: info.file})));
				});
			},
			function (cb) {
				if (handshakeData.password && !handshakeData.administrator) {
					var data = $.cookie('password');
					var dataStorage = data ? JSON.parse(data) : null;

					if (dataStorage && dataStorage.gid == handshakeData.gid) {
						handshakeData.password = dataStorage.password;
						cb(null);
					} else {
						var inputId = 'password';
						render.dialog.create($('<input>', {type: 'password', id: inputId}).prop('outerHTML'), {
							title: phrases.init.enter_pass, buttons: [
								{
									title: phrases.ok,
									className: 'buttonRed',
									onClick: function (e, dialog, id) {
										handshakeData.password = $('#'+inputId).val();
										cb(null);
										dialog.close(id);
									}
								}
							]
						});
					}
				} else {
					cb(null);
				}
			},
			function (cb) {
				if (handshakeData.play) {
					$(allowCamera).on('successVideo', function(e, video){
						game.setYourSelfVideo(video);
					});
					allowCamera.check(cb, $('#checkYourVideo'));
				} else {
					cb(null);
				}
			},
			function (callback) {
				socket = io(config.host + ':' + config.port, {
					transports: ['websocket'],
					autoConnect: false,
					reconnectionDelay: 500,
					query: handshakeData
				});

				var dialog = render.dialog.create(phrases.init.connect);
				socket.once('connect', function(){
					render.dialog.close(dialog);
				});

				socket.on('connect', function () {
					var getDataDialog = render.dialog.create(phrases.init.get_data);
					socket.once('init', function(){
						render.dialog.close(getDataDialog);
					});
					socket.once('close', function(){
						render.dialog.close(getDataDialog);
					});
				});

				socket.on('close', function(data){
					$(game).trigger('error', data);
				});

				socket.on('disconnect', function (reason) {
					if (reason != 'io server disconnect') {
						var getDataDialog = render.dialog.create(phrases.init.connection_closed);
						socket.once('connect', function(){
							render.dialog.close(getDataDialog);
						});
					}
					DEBUG.log('socket disconnect');
				});

				var init = false;
				socket.on('init', function (data) {
					if (!init){
						if (handshakeData.password) {
							$.cookie('password', JSON.stringify({
								gid: handshakeData.gid,
								password: handshakeData.password
							}));
						}
						actions.init(data, socket);
					} else {
						actions.reload(data);
					}
					init = true;
				});

				socket.open();

				socket.io.decoder.on('decoded', function (data) {
					if (data.data) {
						sendError.addMemory(data.data);
						if (config.debug) {
							console.log(data.data);
						}
					}
				});

				callback(null);
			},
			function(cb){
				//if (!handshakeData.password){
					notify.init();
				//}
				cb(null);
			}
		], function (err) {
			if (err) {
				DEBUG.log('Произошла ошибка:', err);
				$(game).trigger('error', err);
			}
		});
	});
}, function(e) {
    if (!window.was_require_error){
        alert('Возникла ошибка, попробуйте обновить страницу');
        window.was_require_error = true;
	}
});
