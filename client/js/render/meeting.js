define(['underscore', 'jquery', 'render/clock'],
	function (_, $, Clock) {

		var _users = [];
		var $_el;
		var _clock;

		$(function () {
			$_el = $('#gameStart');
			_clock = new Clock($_el.find('.gameStartTimer div'));
			_clock.init();
		});

		return {
			findElById: function (id) {
				return _.find($('.gameStartVideoItem'), function (el) {
					return $(el).data('user-id') == id;
				});
			},
			show: function (config) {
				var self = this;
				$_el.show();
				_.times(config.count, function (n) {
					var id = 'meeting-item-' + n;
					var el = $('#meetingVideo').clone().appendTo($_el.find('#videoItems')).attr('id', id).css('display', '');
					el.find('.num').addClass('num' + (n + 1));
					_users.push(id);
				});

				if (config.has_leading) {
					$('.videoLeadingItem').show();
				}

				if (config.buy_place){
					$('#byPlaceNow').show();
					$('#byPlaceNow a').on('click', function(){
						$(self).trigger('buyPlace');
						return false;
					});
				}

				_clock.setTime(config.time).start();
				return this;
			},
			hide: function () {
				$_el.hide();
				return this;
			},
			add: function (data) {
				var $el = $('#' + _users.shift()).data('user-id', data.id);
				$el.find('.userName').text(data.username);
				$el.find('.ramka').prepend(data.videoElement);
				data.sound && this.sound.call(this, $el);
				data.kick && this.addKick.call(this, $el);
				return this;
			},
			setFond: function(fond) {
				var $fond = $_el.find('.gameStartFond');
				if (fond) {
					$fond.show();	
				} else {
					$fond.hide();
				}
				$fond.find('.money').text(fond);
			},
			addLeading: function (data) {
				var $el = $('.videoLeadingItem');
				$el.find('.gameStartVideoItem').data('user-id', data.id);
				$el.find('.userName').text(data.username);
				$el.find('.gameStartVideoItem .ramka').prepend(data.videoElement);
				data.sound && this.sound.call(this, $el);
				data.kick && this.addKick.call(this, $el);
				return this;
			},
			sound: function($el){
				$el.find('.sayOff').show();
			},
			addKick: function($el){
				var $kick = $el.find('.kick');
				$kick.addClass('active');
				var self = this;
				var id = $kick.parents('.gameStartVideoItem').data('user-id');
				$kick.on('click', function(){
					$(self).trigger('kick', id);
					return false;
				});
			},
			removeKick: function($el){
				$el.off('click');
				$el.removeClass('active');
				$el.siblings('.sayOff').hide();
			},
			removeLeading: function(){
				var $el = $('.videoLeadingItem');
				$el.find('.userName').empty();
				$el.find('.ramka video').remove();
				this.removeKick($el.find('.ramka .kick'));
				return this;
			},
			remove: function (userId) {
				var $el = $(this.findElById(userId));
				var id = $el.attr('id');
				_users.push(id);
				_users = _.sortBy(_users, function (val) {
					return val;
				});
				$el.find('.userName').empty();
				$el.find('.ramka video').remove();

				this.removeKick($el.find('.ramka .kick'));
				return this;
			},
			clear: function () {
				$_el.find('#videoItems').empty();
				_clock.stop();
				_users = [];
				this.hide();
			},
			soundOff: function (id, val) {
				var $el = $(this.findElById(id));
				var $sayOff = $el.find('.sayOff');
				if (val){
					$sayOff.hide();
				} else {
					$sayOff.show();
				}
			},
			showStartGame: function () {
				var self = this;
				$_el.find('.startGame').show().on('click', function () {
					setTimeout(function () {
						$(self).trigger('nextEvent');
					}, 0);
					return false;
				});
			}
		}
	});