define(['jquery', 'modules/render', 'modules/game'], function ($, render, game) {

	var sendLog = function (data, callback) {
		$.post('/site/memory', {
			memory: JSON.stringify({
				data: window.memory,
				errors: window.errors,
				gid: game.getId(),
				userAgent: navigator.userAgent,
				message: data
			})
		}, callback, 'json');
	};

	window.onerror = function (errMessage, url, line) {
		window.errors = [arguments];
		sendLog(phrases.error, function (data) {
			$(game).trigger('errorSyntax', data);
		});
	};

	var $errorElement;

	$(function () {
		$errorElement = $('#copy_buffer');

		$(game).on('errorSyntax', function (e, data) {
			/*render.dialog.create('Идентификатор ошибки - ' + data.id + '.', {
				time: 5,
				title: 'Произошла ошибка'
			});*/
		});

        $(game).on('error', function (e, err) {
            var content = '<p>' + err.message + '</p>';

            var buttons = [{
                title: phrases.exit,
                className: 'buttonRed',
                onClick: function (e, dialog) {
                    window.location.href = '/';
                }
            }];

            if (err.message == phrases.error_need_flash) {
                content += '<div id="fl_id"></div>';
                buttons.push({
                    title: 'Включить / Установить',
                    className: 'buttonRed',
                    onClick: function (e, dialog, id) {
                        window.location.href = 'https://get.adobe.com/flashplayer';
                    }
                });
            } else {
                buttons.push({
                    title: phrases.close,
                    className: 'buttonRed',
                    onClick: function (e, dialog, id) {
                        dialog.close(id);
                    }
                });
            }

            render.dialog.create(content, {
                error: true,
                buttons: buttons
            });

            if (err.message == phrases.error_need_flash) {
                swfobject.ua.pv = [100, 0, 0];
                swfobject.embedSWF('/client/as/player/bin/player.swf', 'fl_id', "100%", "100%", "11", false, {}, {}, {});
            }
        });

		$errorElement.show();
		$errorElement.find('input').on('click', function () {
			sendLog($errorElement.find('textarea').val(), function (data) {
				var text;
				if (data.result) {
					text = _.template(phrases.your_error_message)({id:data.id});
				} else {
					text = 'Произошла ошибка! Свяжитесь пожалуйста с разработчиками :(';
				}

				$errorElement.find('textarea').val("");
				render.dialog.create(text, {
					wide: true, buttons: [
						{
							title: phrases.close,
							className: 'buttonRed',
							onClick: function (e, dialog) {
								dialog.close();
							}
						}
					]
				})
			});
			return false;
		});

	});

	return {
		addMemory: function (data) {
			window.memory.push(data);
		}
	}
});
