define(['jquery', 'modules/video', 'modules/slides'], function($, video, slides){
	var $_el;
	var _type;

	$(function(){
		$_el = $('#slides');
	});

	return {
		init: function(type){
			_type = type;
			var $container = $_el.find('.addImgContainer');
			if(type){
				video.init();
				$container.append(video.element);
			} else {
				slides.init();
				$container.append(slides.element);
			}
		},
		show: function(params){
			$_el.show();
			if (_type){
				video.mute(false);
				video.play();
			} else {
				slides.start(params.period);
			}
		},
		hide: function(params){
			$_el.hide();
			if (_type){
				if (params.stopSound){
					video.mute(true);
				} else {
					video.pause();
				}
			} else {
				slides.stop(params.stopSound);
                $_el.find('.ads-wrapper').empty();
			}
		},
		volume: function(v){
			if (_type){
				video.volume(v);
			} else {
				slides.volume(v);
			}
		}
	}
});