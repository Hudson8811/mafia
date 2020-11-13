define(['jquery', 'modules/constants', 'jscrollpane', 'mousewheel'], function ($, constants) {
	var $_el;
	var $text;
	$(function () {
		$_el = $('#newspaper');
		$_el.find('#rollNewspaper').on('click', function () {
			object.hide();
			return false;
		});
		$text = $_el.find('.newsText');
		$text.jScrollPane({
			autoReinitialise: true,
			mouseWheelSpeed: 30,
			verticalDragMinHeight: 20,
			verticalDragMaxHeight: 20,
			contentWidth: "0px"
		});
	});

	var _createNews = function (e, user) {

		var type = parseInt(e.type);
		var v = parseInt(e.value);

		var news = constants.game.newspaperData[type];
		var text;
		var title;
		var className;
		var img;

		if (v > 0) {
			title = news[1].title;
			text = news[1].text;
			className = news[1].className;
			img = news[1].img;

			switch (type) {
				case constants.game.typeEvents.COMMISSAR_CHECK:
				case constants.game.typeEvents.MAFIA_CHECK:
				case constants.game.typeEvents.DOCTOR_HEAL:
					break;
				case constants.game.typeEvents.MANIAC_KILL:
				case constants.game.typeEvents.MAFIA_KILL:
					title = _.template(title)({number: user.getNumber()});
					break;
			}
		} else {
			title = news[0].title;
			text = news[0].text;
			className = news[0].className;
			img = news[0].img;
		}

		return {title: title, text: text, img:img, className:className};
	};

	var object = {
		add: function (e, user) {
			var result = _createNews(e, user);
			var $div = $('<div>', {class: result.className});
			if (result.img){
				$div.append($('<img>', {src:'/client/static/img/newspaper/'+result.img}));
			}
			$div.append($('<h1>').text(result.title)).append($('<p></p>').html(result.text));
			$text.data('jsp').getContentPane().append($div);
		},
		show: function () {
			$_el.show();
		},
		hide: function () {
			var self = this;
			$_el.slideUp(300, function () {
				self.clear();
			});
		},
		clear: function () {
			$text.data('jsp').getContentPane().text('');
		}
	};

	return object;
});
