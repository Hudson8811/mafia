define(['underscore', 'jquery', 'jquery-ui'],
	function (_, $) {
		var $areaEl;
		var $panelEl;
		var $_video;

		var _dummyList = {
			escaping: 'wantedStart',
			escaped: 'wantedFinal'
		};

		var init = function (video) {

			$_video = video.getElement();

			$panelEl = $('#leadingVideoPanelTemplate').clone().removeAttr('id');
			$areaEl = $('#leadingVideoAreaTemplate').clone().removeAttr('id');
			setInPanel();

			$('#leadingVideoPanel').replaceWith($panelEl);
			$('#leadingVideoArea').replaceWith($areaEl);

			$areaEl.draggable();

			$panelEl.on('click', function () {
				if (!$areaEl.is(':visible')) {
					setInArea();
				} else {
					setInPanel();
				}
			});

			$areaEl.find('.info').on('click', function () {
				if ($areaEl.hasClass('info')) {
					$areaEl.removeClass('info');
				} else {
					$areaEl.addClass('info');
				}
				return false;
			});
			return this;
		};
		setDummy = function (dummy) {
			var removingClass = _.values(_dummyList).join(' ');
			$areaEl.removeClass(removingClass);
			$panelEl.removeClass(removingClass);
			$_video.removeClass('hide');
			var dummyClass = _dummyList[dummy];
			if (dummyClass) {
				$areaEl.addClass(dummyClass);
				$panelEl.addClass(dummyClass);
				$_video.addClass('hide');
			}
			return this;
		};
		var setNight = function(){
			$areaEl.addClass('nightVideoHide');
			$panelEl.addClass('nightVideoHide');
		};
		var setDay = function(){
			$areaEl.removeClass('nightVideoHide');
			$panelEl.removeClass('nightVideoHide');
		};
		var setInPanel = function () {
			$areaEl.hide();
			$panelEl.find('.zoomAvatar').removeClass('zoomOut').addClass('zoomIn');
			$panelEl.find('.videoLeading').append($_video);

		};
		var setInArea = function () {
			$areaEl.show();
			$panelEl.find('.zoomAvatar').removeClass('zoomIn').addClass('zoomOut');
			$areaEl.append($_video);
		};

		var setUsername = function (username) {
			$areaEl.find('.gamerUserName').text(username);
			return this;
		};

		var setProfileUrl = function(url){
			$areaEl.find('.profile').attr('href', url);
		};

		var hide = function(){
			if ($areaEl){
				$areaEl.hide();
			}
		};

		var self = {
			init: init,
			setUsername: setUsername,
			setDummy: setDummy,
			hide: hide,
			setProfileUrl: setProfileUrl,
			setNight: setNight,
			setDay: setDay
		};

		return function () {
			return self;
		}();
	});