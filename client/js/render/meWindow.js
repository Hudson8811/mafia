define(['underscore', 'jquery', 'jquery-ui'], function (_, $) {

	var $areaEl;
	var $panelEl;
	var $_video;

	var init = function (obj) {

		if (!obj.video) {
			$panelEl = $('#meVideoPanelTemplateViewer').clone().removeAttr('id');
		} else {
			$_video = obj.video.getElement();
			$panelEl = $('#meVideoPanelTemplateUser').clone().removeAttr('id');
			$areaEl = $('#meVideoAreaTemplate').clone().removeAttr('id');
			setNumber(obj.number);
			setInPanel();

			$('#meVideoArea').replaceWith($areaEl);

			$areaEl.draggable();
			$panelEl.on('click', function () {
				if (!$areaEl.is(':visible')) {
					setInArea();
				} else {
					setInPanel();
				}
			});
		}
		$('#meVideoPanel').replaceWith($panelEl);

		return this;
	};

	var setInPanel = function () {
		$areaEl.hide();
		$panelEl.find('.zoomAvatar').removeClass('zoomOut').addClass('zoomIn');
		$panelEl.append($_video);
	};

	var setInArea = function () {
		$areaEl.show();
		$panelEl.find('.zoomAvatar').removeClass('zoomIn').addClass('zoomOut');
		$areaEl.append($_video);
	};

	var setNumber = function (number) {
		$panelEl.find('.numberAvatar').show().text(number);
		return this;
	};

	var sayOff = function(val){
		var $sayOff = $panelEl.find('.sayOff');
		if (val){
			$sayOff.show();
		} else {
			$sayOff.hide();
		}
	};

	var hide = function(){
		$('.wrapper').removeClass('candidate').removeClass('outcry');
		if ($areaEl){
			$areaEl.hide();
		}
	};
	var getVideo = function(){
		return $_video;
	};
	var setVideo = function(video){
		var $conteiner = $panelEl.find('.zoomAvatar');
		if ($conteiner.hasClass('zoomOut')){
			$areaEl.append(video);
		} else {
			$panelEl.append(video);
		}
	};
	var showRed = function(){
		$('.wrapper').addClass('candidate');
	};
	var hideRed = function(){
		$('.wrapper').removeClass('candidate');
	};

	var showOutCry = function(){
		$('.wrapper').addClass('outcry');
	};

	var hideOutCry = function(){
		$('.wrapper').removeClass('outcry');
	};
	var setFoul = function(number){
		var $foulEl = $panelEl.find('.foulEl');
		$foulEl.empty();
		for (var i = 0; i < number; i++){
			$foulEl.append('&bull; ');
		}
	};

	return function () {
		return {
			init: init,
			setNumber: setNumber,
			sayOff: sayOff,
			hide: hide,
			getVideo: getVideo,
			setVideo: setVideo,
			showRed: showRed,
			hideRed: hideRed,
			showOutCry: showOutCry,
			hideOutCry: hideOutCry,
			setFoul: setFoul
		};
	}();
});
