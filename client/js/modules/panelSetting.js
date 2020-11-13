define(['jquery', 'jquery-ui', 'jquery.cookie'], function ($, ui, cookie) {

	var $noticeSlider;
	var $alertSlider;
	var $musicSlider;
	var defaultSoundValue = 70;
	var defaultBackground = 'green';

	var $noticeEl;
	var $alertEl;
	var $musicEl;

	var $popupEl;

	$(function () {
		$noticeSlider = $('#noticeSlider');
		$alertSlider = $('#alertSlider');
		$musicSlider = $('#musicSlider');

		$noticeSlider.slider();
		$alertSlider.slider();
		$musicSlider.slider();

		$noticeSlider.on('slidechange', function (e, ui) {
			setValue($noticeEl, ui.value);
		});

		$alertSlider.on('slidechange', function (e, ui) {
			setValue($alertEl, ui.value);
		});
		$musicSlider.on('slidechange', function(e, ui){
			setValue($musicEl, ui.value);
		});

		$noticeEl = $('.notice').data('type', 'notice');
		$alertEl = $('.alert').data('type', 'alert');
		$musicEl = $('.music').data('type', 'music');

		$popupEl = $('#panelSettings').find('.popUp').data('type', 'popup');

		$('#flashSettingButton').on('click', function(){
			$(self).trigger('showFlashSettings');
		});
	});

	var setBackground = function (color) {
		$.cookie('background', color, {path: '/'});
		$(self).trigger('changeBackground', color);
	};
	var setValue = function (item, v) {
		$.cookie(item.data('type'), v, {path: '/'});
		if (!v) {
			item.removeClass('on').addClass('off');
		} else {
			item.removeClass('off').addClass('on');
		}
		$(self).trigger(item.data('type'), v)
	};

	var setVideo = function(video){
		$('.videoHere').append(video);
	};
	var getVideo = function(){
		return $('.videoHere video');
	};
	var setActiveUser = function(){
		$('.gameControlPopUp').addClass('userGamer');
	};

	var self = {
		initPopup: function(){
			var val = $.cookie('popup') === 'true';
			setValue($popupEl, val);

			$popupEl.on('click', function(){
				setValue($popupEl, $(this).hasClass('off'));
				return false;
			});
		},
		initBackground: function () {
			var bg = $.cookie('background') || defaultBackground;

			if (bg == 'green') {
				$('.greenBG').addClass('on');
			} else if (bg == 'brown') {
				$('.brownBG').addClass('on');
			} else if (bg == 'blue'){
				$('.blueBG').addClass('on');
			} else if (bg == 'photoSet_1'){
				$('.photoSet1BG').addClass('on');
			} else if (bg == 'photoSet_2'){
				$('.photoSet2BG').addClass('on');
			} else {
				$('.photoSet3BG').addClass('on');
			}
			setBackground(bg);

			$('.greenBG, .brownBG, .blueBG, .photoSet1BG, .photoSet2BG, .photoSet3BG').on('click', function () {
				$(this).siblings('a').removeClass('on');
				$(this).addClass('on');

				if ($(this).hasClass('blueBG')) {
					color = 'blue';
				} else if ($(this).hasClass('brownBG')) {
					color = 'brown';
				} else if ($(this).hasClass('greenBG')){
					color = 'green';
				} else if ($(this).hasClass('photoSet1BG')){
					color = 'photoSet_1';
				} else if ($(this).hasClass('photoSet2BG')){
					color = 'photoSet_2';
				} else {
					color = 'photoSet_3';
				}
				setBackground(color);
				return false;
			});
		},
		initSounds: function () {

			var notice = $.cookie($noticeEl.data('type'));
			if (!notice) {
				notice = defaultSoundValue;
			}
			$noticeSlider.slider('value', notice);

			var alert = $.cookie($alertEl.data('type'));
			if (!alert) {
				alert = defaultSoundValue;
			}
			$alertSlider.slider('value', alert);

			var music = $.cookie($musicEl.data('type'));
			if (!music) {
				music = defaultSoundValue;
			}
			$musicSlider.slider('value', music);

			var s = this;
			$('.gameControl').on('click', function () {
				var $popup = $('.gameControlPopUp');
				$popup.toggle();
				if ($popup.is(':visible')){
					$(s).trigger('open');
				} else {
					$(s).trigger('close');
				}
				return false;
			});

			$('.greenBG, .brownBG, .blueBG').on('click', function () {
				$(this).siblings('a').removeClass('on');
				$(this).addClass('on');

				var color = 'green';
				if ($(this).hasClass('blueBG')) {
					color = 'blue';
				} else if ($(this).hasClass('brownBG')) {
					color = 'brown';
				}
				setBackground(color);
				return false;
			});

			$($musicEl).add($noticeEl).add($alertEl).on('click', function () {
				var v;

				if ($(this).hasClass('off')) {
					v = defaultSoundValue;
				} else {
					v = 0;
				}

				var slider;

				if ($alertEl.is($(this))) {
					slider = $alertSlider;
				} else if ($noticeEl.is($(this))) {
					slider = $noticeSlider;
				} else {
					slider = $musicSlider;
				}

				slider.slider('value', v);

				return false;
			});
		},
		setActiveUser: setActiveUser,
		setVideo: setVideo,
		getVideo: getVideo
	};

	return self;
});
