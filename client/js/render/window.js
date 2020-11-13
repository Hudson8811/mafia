define(
	['jquery', 'modules/constants'],
	function ($, constants) {
		return function (_num) {
			var _video,
				_audioButton = true,
				_videoButton = true;

			var _dummyList = {
				alive: '',
				prison: 'jail',
				dead: 'dead',
				kicked: 'ban',
				escaping: 'wantedStart',
				escaped: 'wantedFinal'
			};

			var _actionList = {
				vote: 'vote',
				sex: 'sex',
				aim: 'aim',
				heal: 'heal',
				knife: 'knife',
				search: 'loupe',
				voteUp: 'voteUp',
				cancelVote: 'cancelVote'
			};

			var $_el = $($('#windowTemplate').html());
			$_el.find('.gamerUserNumber').text(_num);

			var object = {
				getElement: function () {
					return $_el;
				},
				setVideo: function (video) {
					var self = this;
					_video = video;
					this.setVideoElement(video.getElement());

					video.addConditionVideo('button', this.getVideoButton, '&&');
					$(this).on('video', function () {
						self.setVideoButton(!_videoButton);
						_video.updateVideo();
					});

					video.addConditionAudio('button', this.getAudioButton, '&&');
					$(this).on('sound', function () {
						self.setAudioButton(!_audioButton);
						_video.updateAudio();
					});
					return this;
				},
				setVideoElement: function(videoElement){
					$_el.find('.videoContainer').prepend(videoElement);
				},
				getVideo: function () {
					return _video;
				},
				getVideoButton: function () {
					return _videoButton;
				},
				getAudioButton: function () {
					return _audioButton;
				},
				setUsername: function (username) {
					$_el.find('.gamerUserName').append(username);
					return this;
				},
				setColorUsername: function () {
					$_el.find('.gamerUserName, .lossUser').addClass('green');
				},
				clearColorUsername: function () {
					$_el.find('.gamerUserName, .lossUser').removeClass('green').removeClass('red');
				},
				setRedColorUsername: function(){
					$_el.find('.gamerUserName, .lossUser').addClass('red');
				},
				setStatus: function (status) {
					var $userState = $_el.find('.gamerUserState');

					if (status) {
						$userState.text(constants.user.windowStatuses[status]);
						$userState.show();
					} else {
						$userState.hide();
					}
				},
				setRole: function(role){
					var $userRole =  $_el.find('.gamerUserRole');
					if (role){
						$userRole.text(constants.user.descriptionRoles[role].title);
						$userRole.show();
					} else {
						$userRole.hide();
					}
				},
				setAction: function (action, callback) {
					$_el.addClass(_actionList[action]);
					$_el.find('.additional').one('click', function (e) {
						callback(e, _num);
						return false;
					});
				},
				clearAction: function () {
					$_el.removeClass(_.values(_actionList).join(' '));
					$_el.find('.additional').off('click');
					return this;
				},
				setDummy: function (dummy) {

					$_el.removeClass(_.map(_dummyList, function (val) {
						return val
					}).join(' '));

					if (arguments.length > 0) {
						$_el.addClass(_dummyList[dummy]);
						$_el.find('video').removeClass().addClass(_dummyList[dummy]);
					}
				},
				setProfileUrl: function(link){
					$_el.find('.profile').attr('href', link);
					return this;
				},
				show: function () {
					$_el.show();
					$_el.css('display', '');
					return this;
				},
				hide: function () {
					$_el.hide();
					return this;
				},
				setOnline: function(){
					$_el.addClass('online');
					return this;
				},
				setOffline: function(){
					$_el.removeClass('online');
					return this;
				},
				setHighLight: function(){
					$_el.addClass('candidate');
					return this;
				},
				setVoter: function(){
					$_el.addClass('voter');
					return this;
				},
				resetVoter: function(){
					$_el.removeClass('voter');
					return this;
				},
				resetHighLight: function(){
					$_el.removeClass('candidate');
					return this;
				},
				setOutCry: function(){
					$_el.addClass('outcry');
					return this;
				},
				resetOutCry: function(){
					$_el.removeClass('outcry');
					return this;
				},
				setNight: function(){
					$_el.addClass('nightVideoHide');
					$_el.find('.dummy-text').text(constants.user.windowDummy.nightVideoDisabled);
					return this;
				},
				setDay: function(){
					$_el.removeClass('nightVideoHide');
					$_el.find('.dummy-text').text('');
					return this;
				},
				setMafia: function(){
					$_el.addClass('nightMafiaHide');
					$_el.find('.dummy-text').text(constants.user.windowDummy.nightMafiaVideoDisabled);
					return this;
				},
				removeMafia: function(){
					$_el.removeClass('nightMafiaHide');
					$_el.find('.dummy-text').text('');
					return this;
				},
				showModerFunction: function () {
					$_el.find('.videoContainer .kick').css('display', '');
					return true;
				},
				showWarningFunction: function () {
					$_el.find('.videoContainer .warning').css('display', '');
					return true;
				},
				showFoulFunction: function(){
					$_el.find('.videoContainer .foul').css('display', '');
					$_el.find('.videoContainer .foulCancel').css('display', '');
					return true;
				},
				showSilentFunction: function(){
					$_el.find('.videoContainer .silent').css('display', '');
					return true;
				},
				setVideoButton: function (val) {
					_videoButton = val;
					if (!_videoButton) {
						$_el.addClass('videoOff');
					} else {
						$_el.removeClass('videoOff')
					}
				},
				setAudioButton: function (val) {
					_audioButton = val;
					if (!_audioButton) {
						$_el.addClass('soundOff');
					} else {
						$_el.removeClass('soundOff');
					}
				},
				showRed: function(){
					$_el.addClass('red');
				},
				hideRed: function(){
					$_el.removeClass('red');
				},
				setSize: function(size) {
					$_el.width(size.width).height(size.height);
					this.getVideo().getElement().width(size.width).height(size.height);
				},
				setFoul: function(number){
					var $foulEl = $_el.find('.foulEl');
					$foulEl.empty();
					for (var i = 0; i< number; i++){
						$foulEl.append('&bull; ');
					}
				}
			};

			_.each(['warning', 'kick', 'sound', 'video', 'foul', 'foulCancel', 'silent'], function (type) {
				$_el.find('.' + type).on('click', function (e) {
					$(object).trigger(type, e);
					return false;
				});
			});

			return object;
		};
	}
);