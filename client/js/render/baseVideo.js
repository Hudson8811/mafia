define(['jquery', 'underscore', 'modules/config', 'swfobject'],
	function ($, _, config) {
		return function (type) {
			var _type = type;

			return function () {

				var self = {};

				var _id,
					_endInit = false,
					_runComplete = false,
					_endComplete = false,
					_runConnect = false,
					_endConnect = false,
					_runClose = false;

				var _connectUrl;
				var _streamName;
				var _externalAudioConditions = {'main':{'audio': [false, '&&']}};
				var _externalVideoConditions = {'main':{'video': [false, '&&']}};

				var _el;
				var _$flashEl;
				var _flash;

				var _swf = _type ? '/client/as/player/bin/player.swf' : '/client/as/publish/bin/publish.swf';
				_swf = _swf + '?' + version;

				_id = _.uniqueId('video-window-');
				_el = $('<video></video>').clone().attr('id', _id).get().pop();

				var _connect = function () {
					_flash.Connect(_connectUrl, createCallback({
						connect: function () {
							_endConnect = true;
							if (_runComplete) {
								_complete();
							}
						}
					}).connect);
				};

				var _close = function () {
					_runComplete = false;
					_endComplete = false;
					if (config.debug) console.log('close');
					_flash.Close();
				};

				var _complete = function () {

					var cb = createCallback({
						complete: function () {
							_endComplete = true;
							_setVideo();
							_setAudio();
						}
					});

					if (_type) {
						if (config.debug) console.log('capture ', _streamName);
						_flash.Capture(_streamName, cb.complete);
					} else {
						if (config.debug) console.log('publish ', _streamName);
						_flash.Publish(_streamName, cb.complete);
					}
				};

				var _setVideo = function () {
					if (self.externalResult(_externalVideoConditions)) {
						if (config.debug) console.log('play video');
						_flash.PlayVideo();
						$(self).trigger('playVideo');
					} else {
						if (config.debug) console.log('pause video');
						_flash.PauseVideo();
						$(self).trigger('pauseVideo');
					}
				};

				var _setAudio = function () {
					if (self.externalResult(_externalAudioConditions)) {
						if (config.debug) console.log('play audio');
						_flash.PlaySound();
						$(self).trigger('playSound');
					} else {
						if (config.debug) console.log('pause audio');
						_flash.PauseSound();
						$(self).trigger('pauseSound');
					}
				};

				var createCallback = function (params) {
					var result = {};
					$.each(params, function (i, v) {
						var name = i + _id;
						$(document).one(name, v);
						result[i] = 'function(e){$(document).trigger("' + name + '", e);}';
					});
					return result;
				};
				$.extend(self, {
					init: function (params) {
						params['initCallback'] = function () {
							_endInit = true;
							if (_runConnect) {
								_connect();
							}
							if (_runClose) {
								_close();
							}
						};
						if (config.debug){
							params['debug'] = true;
						}

						var flashId = 'flash_' + _id;
						_$flashEl = $('<div></div>').css('position', 'absolute').css('left', '-1000px').append($('<div/>', {id: flashId})).appendTo('body');

						setTimeout(function () {
							swfobject.embedSWF(_swf, flashId, "100%", "100%", "11", false, createCallback(params), {
								allowScriptAccess: 'always',
								wmode: 'opaque',
								quality: 'low',
								hasPriority: 'true'
							}, {});
							_flash = $('#' + flashId)[0];

							var oldPosition = {top: 0, left: 0};
							var updatePosition = function () {
								var visible = $(_el).is(":visible");
								var flashVisible = _$flashEl.is(":visible");
								if (flashVisible && !visible) {
									_$flashEl.css('left', '-1000px');
									oldPosition.left = -1000;
								} else if (visible) {
									var position = $(_el).offset();
									if (position.top != oldPosition.top || position.left != oldPosition.left) {
										_$flashEl.css('left', position.left + 'px').css('top', position.top + 'px').css('height', $(_el).height()).css('width', $(_el).width()).css('z-index', $(_el).parent().data('z') || 0);
										oldPosition = position;
									}
								}
							};
							setInterval(updatePosition, 100);
							updatePosition();
						}, 0);
					},
					showSettings: function(){
						_flash.Settings();
					},
					close: function () {
						_runClose = true;
						_runComplete = false;
						if (_endInit) {
							_close();
						}
						return this;
					},
					getElement: function () {
						return $(_el);
					},
					externalResult: function(conditions){
						var self = this;
						var result = true;
						_.each(conditions, function(condition){
							if (!_.isArray(condition)){
								result = self.externalResult(condition);
							} else {
								var isCondResult = _.isFunction(condition[0])?condition[0]():condition[0];
								result = (condition[1] == '&&')?result && isCondResult:result || isCondResult;
							}

						});
						return result;
					},
					addCondition: function(externalConditions, key, condition, operator){
						var keyArray = key.split('.');
						if (keyArray.length == 1){
							externalConditions[key] = [condition, operator];
						} else {
							if (!externalConditions[keyArray[0]]){
								externalConditions[keyArray[0]] = {};
							}
							externalConditions[keyArray[0]][keyArray[1]] = [condition, operator];
						}
					},
					addConditionVideo: function (key, condition, operator) {
						this.addCondition(_externalVideoConditions, key, condition, operator);
						this.updateVideo();
						return this;
					},
					addConditionAudio: function (key, condition, operator) {
						this.addCondition(_externalAudioConditions, key, condition, operator);
						this.updateAudio();
						return this;
					},
					delCondition: function(externalConditions, key){
						var keyArray = key.split('.');
						if (keyArray.length == 1){
							delete externalConditions[keyArray[0]];
						} else {
							delete  externalConditions[keyArray[0]][keyArray[1]];
						}
					},
					delConditionVideo: function(key){
						this.delCondition(_externalVideoConditions, key);
						this.updateVideo();
						return this;
					},
					delConditionAudio: function(key){
						this.delCondition(_externalAudioConditions, key);
						this.updateAudio();
						return this;
					},
					setVideo: function (val) {
						if (typeof val != 'undefined') this.addConditionVideo('main.video', val, '&&');
						return this;
					},
					setAudio: function (val) {
						if (typeof val != 'undefined') this.addConditionAudio('main.audio', val, '&&');
						return this;
					},
					updateVideo: function(){
						if (_endComplete) {
							_setVideo();
						}
					},
					updateAudio: function(){
						if (_endComplete) {
							_setAudio();
						}
					},
					connect: function (url) {
						_connectUrl = url;
						_runConnect = true;

						if (_endInit) {
							_connect();
						}
						return this;
					},
					stream: function (name) {
						_runComplete = true;
						_runClose = false;
						_streamName = name;
						if (_endConnect) {
							_complete();
						}
						return this;
					},
					remove: function () {
						_$flashEl.remove();
						return this;
					}

				});
				return self;
			};
		};
	});
