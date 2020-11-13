define(['jquery'],
	function ($) {
		var $_el = $('#loadGame');
		return {
			show: function(percent) {
				if (! percent) percent = 0;
				this.setPercent(percent);
				$_el.show();
			},
			hide: function() {
				$_el.hide();
			},
			setPercent: function(percent) {
				$_el.find('.loadGreenLine').width(percent + '%');
				$_el.find('.percent span').text(percent);
			}
		}
	});