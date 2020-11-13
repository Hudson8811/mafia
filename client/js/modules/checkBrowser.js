define(['swfobject'],
	function () {
        swfobject.ua.pv = [100, 0, 0];

//		function (callback) {
//			detect browser
//			var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
			// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
//			var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
//			var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
			// At least Safari 3+: "[object HTMLElementConstructor]"
//			var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
//			var isIE = /*@cc_on!@*/false || !!document.documentMode;   // At least IE6
//			if (isChrome) {
//				var version = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
//				if (version < 35) {
//					return callback(new Error('Пожалуйста обновите версию браузера. Рекомендуемая версия 37+. Ваша версия ' + version + '.'));
//				}
//				callback(null);
//			} else {
//				callback(new Error('Пожалуйста используйте для игры <a href="https://www.google.com/chrome/browser/">Google Chrome</a>'));
//			}
//		}
//		function (cb) {
//			if (!DetectRTC.isWebRTCSupported) {
//				return cb(new Error('Ваш бразуер не поддерживает webrtc. Пожалуйста используйте для игры <a href="https://www.google.com/chrome/browser/">Google Chrome</a>'))
//			}
//			cb(null);
//		}

//		function (cb) {
//			if (handshakeData.play) {
//				if (!DetectRTC.hasMicrophone) {
//					return cb(new Error('У вас нет микрофона. Вы не можете играть!'));
//				}
//				if (!DetectRTC.hasWebcam) {
//					return cb(new Error('У вас нет вебкамеры. Вы не можете играть!'));
//				}
//			}
//			cb(null);
//		}

		return {
			check: function (cb) {

				if (!window.WebSocket) {
					return cb(new Error(phrases.error_need_websocket));
				}
				if (!swfobject.hasFlashPlayerVersion('1')) {
					return cb(new Error(phrases.error_need_flash));
				}
				if (!swfobject.hasFlashPlayerVersion('11')) {
					return cb(new Error(phrases.error_old_version_flash));
				}

                var hasFlash = false;
                try {
                    var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
                    if (fo) {
                        hasFlash = true;
                    }
                } catch (e) {
                    if (navigator.mimeTypes
                        && navigator.mimeTypes['application/x-shockwave-flash'] != undefined
                        && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
                        hasFlash = true;
                    }
                }

                if (!hasFlash) {
                    return cb(new Error(phrases.error_need_flash));
				}

				cb(null);
			}
		}
	});
