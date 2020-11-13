define(['underscore', 'jquery', 'render/window'], function (_, $, window) {
	var _windowList = [];
	var $_el;

	$(function(){
		$_el = $('#area');
	});

	return {
		show: function() {
			$_el.show();
		},
		hide: function() {
			$_el.hide();
		},
		addWindow: function(num) {
			var w = new window(num);

			_windowList.push(w);
			$_el.append(w.getElement());

			return w;
		},
		clear: function(){
			$_el.empty();
			_windowList = [];
			this.hide();
		},
		getCountWindows: function() {
			return _windowList.length;
		},
		setNight: function(){
			$('body').removeClass('day').addClass('night');
		},
		setDay: function(){
			$('body').removeClass('night').addClass('day');
		},
		setLeading: function(){
			$_el.addClass('leadingArea');
		}
	}
});