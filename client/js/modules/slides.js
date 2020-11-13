define(['underscore', 'jquery', 'modules/config', 'modules/music'], function (_, $, config, music) {

	var _time = 15;
	var _period;
	var _current = 0;
	var _interval;
	var _sound = music;
	
    var currentDayOfYear = function () {
		var now = new Date();
		var start = new Date(now.getFullYear(), 0, 0);
		var diff = now - start;
		var oneDay = 1000 * 60 * 60 * 24;
		return Math.floor(diff / oneDay);
	};

	var _slideList = function() {
		var currendDay = Math.floor(currentDayOfYear()/2);
		var countList = 7;
		
		var i = currendDay % countList;

		return config.slides[i];
	}();

	var _object = {
		init: function(){
			this.element = $('<img/>');
		},
		start: function (period) {
			if (period){
				this.set(period, 0);
			}
			_sound.play();

			_interval = setInterval(function () {
				_object.next();
			}, _time * 1000)
		},
		stop: function (onlySound) {
			if (!onlySound){
				clearInterval(_interval);
			}
			_sound.pause();
		},
		set: function (period, num) {
			if (period > 4) {
				period = period % 4 ? period % 4 : 4;
			}

			_period = period;
			_current = num;

			var slide = _slideList[_period][_current];
			this.element.attr('src', slide+'?'+version);
		},
		next: function () {
			var next = _current + 1;
			if (_slideList[_period][next]) {
				_current++;
			} else {
				_current = 0;
			}

			this.set(_period, _current);
		},
		volume: function(v){
			_sound.setVolume(v);
		},
		element: null
	};

	return _object;
});
