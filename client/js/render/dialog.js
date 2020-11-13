define(['underscore', 'jquery'],
	function (_, $) {
		var _dialogs = [];
		var _default_config = {
			title: false,
			error: false,
			buttons: [],
			time: 0
		};
		var _default_data = {
			className: '',
			classContainer: ''
		};

		var $wrap = $('.wrapper');
		var _template;
		$(function () {
			_template = _.template($('#popup').html());
		});

		return {
			create: function (text, config, isJquery) {
				var self = this;
				if (!config) config = {};
				config = _.defaults(config, _default_config);
				var id = _.uniqueId('popUpWindow-');

				var data = _.defaults({
					id: id,
					content: isJquery?'':text,
					title: config.title,
					buttons: []
				}, _default_data);

				if (config.error) {
					data.classContainer = 'error';
				}

				if (config.time > 0) {
					var timeout = setTimeout(function (id, self) {
						self.close(id);
					}.bind(null, id, this), config.time * 1000)
				}

				if (config.buttons.length) {
					_.each(config.buttons, function (button) {
						button.id = _.uniqueId('button_');
						data.buttons.push({
							className: button.className,
							title: button.title,
							hide: button.hide,
							id: button.id
						});
					});
				}

				_dialogs.push({
					id: id,
					timeout: timeout ? timeout : false
				});

				var $dialog = $(_template(data));
				$wrap.append($dialog);
				if (isJquery){
					$dialog.find('.popUpContent').append(text);
				}

				if (config.buttons.length) {
					_.each(config.buttons, function (button) {
						$wrap.find('#'+button.id).on('click', function (e) {
							button.onClick(e, self, id);
							return false;
						});
					});
				}

				$(this).trigger('createDialog');
				return id;
			},
			exist: function (id) {
				return (typeof _.findWhere(_dialogs, {id: id}) !== 'undefined');
			},
			close: function (id) {
				if (id) {
					if (this.exist(id)) {
						$('#' + id).remove();
						var el = _.findWhere(_dialogs, {id: id});
						if (el.timeout) clearTimeout(el.timeout);
						_dialogs = _.without(_dialogs, el);
					}
				} else {
					_.each(_dialogs, function ($el) {
						this.close($el.id)
					}, this)
				}
			}
		}
	});