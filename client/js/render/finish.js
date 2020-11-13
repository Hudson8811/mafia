define(['underscore', 'jquery', 'render/content'],
	function (_, $, content) {
		var $_el;
		$(function () {
			$_el = $('#gameOver');
		});

		return {
			show: function (title, className, has_leading) {
				$_el.show();
				$_el.find('.wonTitle').text(title);
				$_el.addClass(className);
				if (has_leading){
					$_el.find('.leadingContainer').show();
				}
			},
			hide: function () {
				$_el.hide();
			},
			add: function (user, video) {
				var html = _.template($('#finishTemplate').html())(user);
				if (user.leading){
					$_el.find('.leadingContainer').append(html);
				} else {
					var $html = $(html).find('.userNumber').show().end();
					$_el.find('.gamersContainer').append($html[0]);
				}

				if (typeof video != 'undefined') {
					$_el.find('.userGame#' + user.id + ' .gameStopVideoItem').append(video.getElement());//todo переделать
				}
			},
			soundOff: function(id, val){
				var $sayOff = $_el.find('.userGame#'+id+' .sayOff');
				if (val){
					$sayOff.hide();
				} else {
					$sayOff.show();
				}
			},
			getColor: function (role, roles) {
				if (role == roles.MAFIA || role == roles.MAFIA_BOSS) {
					return 'red';
				} else if (role == roles.COMMISSAR) {
					return 'green';
				} else {
					return '';
				}
			}
		}
	});