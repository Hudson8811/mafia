define(['jquery', 'jquery-ui', 'render/clock', 'modules/panelSetting', 'modules/constants'], function ($, ui, Clock, config, constants) {
	var $_el;
	var _clock;
	var _config = config;

	$(function () {
		$_el = $('#panel');
	});

	return {
		init: function (obj) {
			var self = this;
			this.show({});
			this.setTitle(obj.title);
			this.setFond(obj.fond);

			_.each(obj.configOptions, function (el) {
				self.addOption(el.title, el.id);
			});
			_.each(obj.roleOptions, function (role) {
				self.addRole(role.title, role.id);
			});
		},
		show: function (config) {
			_clock = new Clock($_el.find('.gameTimer div'));
			_clock.init(config);
			$_el.show();
			return this;
		},
		hide: function () {
			$_el.hide();
			$(this).trigger('close');
			return this;
		},
		setTitle: function (title) {
			$_el.find('.gameTitle').text(title);
			return this;
		},
		setPeriod: function (title) {
			$_el.find('.dayStatus').text(title);
			return this;
		},
		setFond: function(fond) {
			if (fond) {
				$_el.find('.gameFond').show();
				$_el.find('.gameFond .money').text(fond);
			}
		},
		setTime: function (time, countdown) {
			_clock.setTime(time).setCountdown(countdown).start();
			return this;
		},
		setText: function(text, green){
			var $el = $_el.find('.emceeTxt');
			if ($el.text()){
				if (!text){
					$el.text('');
				}
			} else {
				if (green) {
					$el.addClass('green');
				} else {
					$el.removeClass('green');
				}
				$el.text(text);
			}
			return this;
		},
		addOption: function (title, cssClass) {
			var $el = $('#option_example').clone().removeAttr('id').appendTo('.gameOptionIcon');
			$el.addClass(cssClass);
			$el.attr('data-hint', title);
			$el.show();
			return this;
		},
		addRole: function (title, cssClass) {
			var el = $('#role_example').clone().removeAttr('id').appendTo('.gameRoles');
			el.addClass(cssClass);
			el.attr('data-hint', title);
			el.show();
			return this;
		},
		addButton: function(text, className, callback){
			var $container = $_el.find('.longBiguttonContainer');
			var $link = $($('#examplePanelButton').html());
			$link.addClass(className);
			$link.find('p').text(text);
			$link.one('click', function(e){
				callback(e);
				return false;
			});
			$container.append($link);
			return $link;
		},
		removeButtons: function(){
			var $el = $_el.find('.longBiguttonContainer');
			$el.find('a').not('.outcryButton').remove();
		},
		outCryInit: function(callback){
			var $el = $_el.find('.longBiguttonContainer');

			var $link = $el.find('.outcryButton');
			$link.data('allow', true);
			$link.on('click', function(e){
				if ($(this).data('allow')){
					callback(e);
				}
				return false;
			});
			$link.hide();
			$el.append($link);
		},
		outCryShow: function(){
			var $link = $_el.find('.longBiguttonContainer').find('.outcryButton');
			$link.show();
		},
		outCryHide: function(){
			var $link = $_el.find('.longBiguttonContainer').find('.outcryButton');
			$link.hide();
		},
		getClock: function () {
			return _clock;
		},
		clear: function () {
			$_el.find('.videoAvatar').children().not('div').remove();
			$_el.find('.gameOptionIcon').children().not('#option_example').remove();
			$_el.find('.gameRoles').children().not('#role_example').remove();
			this.hide();
		},
		settings: _config
	}
});
