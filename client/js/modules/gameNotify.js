define(['jquery'], function ($) {

	var $text,
		$panel,
		$close,
		_timeOut,
		time = 12000,
		timeClose = 1000;

	var init = function(){
		if (handshakeData.moderator) {
			$form = $('#game-notify-form');
			$form.show();

			$form.on('submit', function () {
				$.post($form.attr("action"), {
					'message': $form.find('input[name="message"]').val(),
					'channel': notifyChannel
				}, function () {
					$form.find('input[type="text"]').val("");
				});
				return false;
			});
		}
		$text = $('#jsNotifyText');
		$panel = $('#jsNotifyPanel');
		$close = $('#jsNotifyClose');

		socket.on(notifyChannel, function (data) {
			add(data.message);
		});

        socket.emit('join', {name: notifyChannel});
	};

	var add = function (message) {
		$text.html(message);
		$panel.show();
		clearTimeout(_timeOut);
		_timeOut = setTimeout(function () {
			$panel.fadeOut(timeClose);
		}, time);

		$close.one('click', function (e) {
			$panel.fadeOut(timeClose);
			return false;
		});
	};

	return {
		init:init,
		add: add
	}
});