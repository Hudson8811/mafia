define(['jquery', 'underscore', 'SoundManager'],
	function ($, _, sm) {
		var _src = '/client/static/music/';
		var _soundList = {
			vote_start:'Голосование.mp3',
			vote_action	:'Посадка действие.mp3',
			vote_wait: 'Процесс голосования.mp3',
			doctor_action:'Доктор действие.mp3',
			doctor_wake_up:'Доктор просыпание.mp3',
			commissar_action_success:'Комиссар действие успех.mp3',
			commissar_action_fail:'Комиссар действие провал.mp3',
			commissar_wake_up:'Комиссар просыпание.mp3',
			whore_action:'Любовница действие.mp3',
			whore_wake_up:'Любовница просыпание.mp3',
			maniac_action:'Маньяк действие.mp3',
			maniac_wake_up:'Маньяк просыпание.mp3',
			mafia_kill_action:'Мафия действие.mp3',
			mafia_kill_wake_up:'Мафия просыпание.mp3',
			don_action_success:'Дон действие успех.mp3',
			don_action_fail:'Дон действие провал.mp3',
			don_wake_up:'Дон просыпание.mp3',
			start_game:'Переход из лобби.mp3',
			dialog:'Диалог.mp3',
			start_day: 'Наступает день.mp3'
		};

		sm.getInstance().setup({
			preferFlash: false,
			url: './swf/',
			onready: function () {
				_.each(_soundList, function (sound, id) {
					sm.getInstance().createSound(id, _src + sound);
				});
			}
		});

		return function() {
			return function () {
				var volume = 100;
				var sound;

				return {
					play: function (s, loop, finish) {
						var self = this;
						this.pause();
						sound = s;
						sm.getInstance().play(sound, {
							volume: volume,
							onfinish: function(){
								if (loop){
									self.play(sound, loop);
								} else if (finish){
									finish();
								}
							}
						});
					},
					pause: function () {
						sm.getInstance().stop(sound);
						sound = null;
					},
					resume: function(){
						sm.getInstance().resume();
					},
					setVolume: function (v) {
						volume = v*100;
						if (sound){
							sm.getInstance().setVolume(sound, volume)
						}
					}
				}
			}
		}();
	});
