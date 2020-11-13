define(['jquery', 'flipclock'], function ($, clock) {
	return function ($el, time) {
		if (!time) time = 0;
		var _clock;

		return {
			init: function(config){
				_clock = new FlipClock($el, time, $.extend({
					countdown: true,
					clockFace: 'MinuteCounter',
					language: 'ru'
				}, config));
			},
			setTime: function (time) {
				_clock.setTime(time);
				return this;
			},
			getTime: function () {
				return _clock.getTime();
			},
			start: function () {
				_clock.start();
				return this;
			},
			stop: function () {
				_clock.stop();
				return this;
			},
			destroy: function () {
				$el.empty();
			},
			getFlipclock: function(){
				return _clock;
			},
			setCountdown: function(countdown){
				_clock.setCountdown(countdown);
				return this;
			}
		}
	}
});