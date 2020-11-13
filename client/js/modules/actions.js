define(['jquery', 'underscore', 'modules/render', 'modules/game', 'modules/constants', 'modules/sound', 'modules/user', 'modules/windowResizer'], function ($, _, render, game, constants, sound, User, resizer) {
		var socket;

		var events = ['StartGame', 'EndStart', 'StartNight', 'GettingRole', 'MafiaTalk', 'MafiaVoteResult', 'CommissarCheck', 'CommissarCheckEnd', 'MafiaCheck', 'MafiaCheckEnd', 'DoctorHeal', 'DoctorHealEnd', 'WhoreSex', 'WhoreSexEnd', 'ManiacKill', 'ManiacKillEnd', 'EndOfNight', 'StartDay', 'DeadLastTalk', 'UserTalk', 'UserTalkResult', 'LeadingTalk', 'FreeTalk', 'Vote', 'VoteResult', 'ClassicVoteStart', 'ClassicVoteNotify', 'ClassicVote', 'ClassicVoteResult', 'JudgeTalk', 'VoteAll', 'VoteAllResult', 'LastTalk', 'VoteComplete', 'EndOfDay', 'GameOver', 'LeaveLeading'];

		var userEvents = ['userGoAway', 'newUser', 'newViewer', 'userExit', 'userReturn', 'userRemove', 'returnUserAfterExit', 'Kick', 'OutCry', 'OutCryEnd', 'Foul'];

		var settings;

		var noticeSound;
		var alertSound;

		var hidePopup;

		var initSettings = function () {
			render.nightVideo.init(false);//use slide

			settings = render.panel.settings;

			$(settings).on('changeBackground', function (e, i) {
				render.background.change(i);
			});

			noticeSound = sound();
			alertSound = sound();

			$(settings).on('notice', function (e, v) {
				noticeSound.setVolume(v / 100);
			});

			$(settings).on('alert', function (e, v) {
				alertSound.setVolume(v / 100);
			});
			$(settings).on('music', function (e, v) {
				render.nightVideo.volume(v/100);
			});

			settings.initBackground();
			settings.initSounds();

			$(settings).on('popup', function(e, v){
				hidePopup = v;
			});
			settings.initPopup();

		};

		var resetRed = function(){
			_.each(game.getUsers(), function(u){
				u.wasChoosen() && u.clearChoose();
			});
		};

		var initView = function (data) {

			var me = game.getYourSelf();
            var leading = game.getLeading();

			render.panel.init(game.getPanelData());
			render.meWindow.init((me)?{number: me.getNumber(), video: me.getVideo()}:{});

			if (me){
				if (me.wasChoosen()){
					render.meWindow.showRed();
				}
				$(me).on('chooseSet', function(){
					render.meWindow.showRed();
				});
				$(me).on('chooseClear', function(){
					render.meWindow.hideRed();
				});

				var fouls = me.getFouls();
				if (fouls){
					render.meWindow.setFoul(me.getFouls());
				}
				$(me).on('fouls', function(e, increment){
					render.meWindow.setFoul(me.getFouls());
                    if (!hidePopup){
                        var text = (increment) ? 'Вам начислен фол<br> Будьте аккуратны' : 'С вас снят фол';
                        render.dialog.create(text, {
                            time: 2,
                            buttons: [buttons.closeButtons]
                        });
                    }
				});

				settings.setActiveUser();
				$(settings).on('open', function(){
					settings.setVideo(render.meWindow.getVideo());
					$(settings).on('showFlashSettings', function(){
						me.getVideo().showSettings();
					});
				});
				$(settings).on('close', function(){
					render.meWindow.setVideo(settings.getVideo());
					$(settings).off('showFlashSettings');
				});
				if (me && me.checkAlive() && !me.isLeading()){
					render.panel.outCryInit(function(){
						$.post('/api/outCry', {}, function () {
						}, 'json')
							.fail(fail)
					});
				}
			}

			var statuses = constants.user.statuses;

			_.each(_.sortBy(game.getUsersWithoutYourSelf(), function (u) {
				return u.getNumber();
			}), function (u) {

				var windowUser = render.area.addWindow(u.getNumber()).setUsername(u.getUsername()).setProfileUrl(u.getProfileUrl());
				u.setWindow(windowUser);
				windowUser.setVideo(u.getVideo());

				if (u.wasChoosen()){
					windowUser.showRed();
				}
				$(u).on('chooseSet', function(){
					windowUser.showRed();
				});
				$(u).on('chooseClear', function(){
					windowUser.hideRed();
				});

				var fouls = u.getFouls();
				if (fouls){
					windowUser.setFoul(fouls);
				}
				$(u).on('fouls', function(){
					windowUser.setFoul(u.getFouls());
				});

				if (handshakeData.moderator || (me && me.isLeading())) {
					windowUser.showModerFunction();
					$(windowUser).on('kick', function () {
						render.dialog.create(phrases.actions.warning_del_user, {
							title: phrases.actions.complete_kick, buttons: [
								{
									title: phrases.yes,
									className: 'buttonRed',
									onClick: function (e, dialog, id) {
										$.post('/api/kick', {p: {kid: u.getId()}}, function () {
										}, 'json').fail(fail).always(function () {
											dialog.close(id);
										});
									}
								},
								{
									title: phrases.close,
									className: 'buttonRed',
									onClick: function (e, dialog, id) {
										dialog.close(id);
									}
								}
							]
						});
					});
				}

				if (me && !handshakeData.password) {
					windowUser.showWarningFunction();
					$(windowUser).on('warning', function () {
						$.post('/api/complaint', {p: {uid: u.getId()}}, function () {
							render.dialog.create(phrases.actions.info_sended, {
								time: 5,
								buttons: [buttons.closeButtons]
							});
						}, 'json')
							.fail(fail);
					});
				}

				if (handshakeData.moderator || me && me.isLeading()){
					windowUser.showFoulFunction();
					$(windowUser).on('foul', function(){
						$.post('/api/foul', {p:{uid: u.getId(), cancel:0}});
					});
					$(windowUser).on('foulCancel', function(){
						$.post('/api/foul', {p:{uid: u.getId(), cancel:1}})
					});
				}

                if (game.getAliveLeading() && me && me.isLeading()) {
                    windowUser.showSilentFunction();
                    $(windowUser).on('silent', function () {
                        $.post('/api/silent', {p: {uid: u.getId()}}, function () {
                            render.dialog.create('Игрок лишен слова на 1 круг', {
                                time: 10,
                                buttons: [buttons.closeButtons]
                            });
                        })
                    });
                }

				$(game).on('resizeWindow', function(e, size){
					windowUser.setSize(size);
			    });
			});

			$(game).on('clearWindowAction', function () {
				_.each(game.getUsersWithoutYourSelf(), function (user) {
					user.getWindow().clearAction();
				});
			});

			$(window).on('resize', function(){
				var me = game.getYourSelf();
				var padding = (me && me.checkAlive())?40:0;
				$(game).trigger('resizeWindow', resizer.getWindowSize(game.getUsersWithoutYourSelf().length, padding));
			}).trigger('resize');

			_.each(game.getUsers(), function (u) {

				$(u).on('roleChange', function (e, u) {
					if (!u.checkAlive() && !game.checkYourSelf(u)) {//стала известна роль такое случается когда есть любовница
						var meLeading = (game.getYourSelf() && game.getYourSelf().isLeading());
						u.updateWindowStatus(meLeading);
					}
				});

				$(u).on('statusChange', function (e, u) {
					var me = game.checkYourSelf(u);
					if (!me) {
						u.updateWindowStatus((game.getYourSelf() && game.getYourSelf().isLeading()));
						u.updateWindow();
						if (!u.checkAlive()) {
							u.wasChoosen() && u.clearChoose();
							u.getVideo().setAudio(false).setVideo(false);
						}
						if (!u.checkAlive(true)){
							u.getWindow().setOffline();
						}
					} else {
						if (!u.checkAlive()) {
							u.wasChoosen() && u.clearChoose();
							u.getVideo().setVideo(false);
							render.panel.outCryHide();
						}
					}
				});

				$(u).on('statusChange', function (e, u) {
					var me = game.checkYourSelf(u);
					if (me && !u.checkAlive()) {

						var textes = {};
						textes[statuses.DEAD] = phrases.actions.your_kill;
						textes[statuses.PRISON] = phrases.actions.your_prison;
						textes[statuses.KICKED] = phrases.actions.your_kick;
						textes[statuses.ESCAPED] = phrases.actions.your_escaped;
							
						if (textes[u.getStatus()]) {
							render.dialog.create(textes[u.getStatus()], {time: 10, buttons: [buttons.closeButtons]});
						}
					}
				});
				$(u).trigger('statusChange', u);
			});

			$(render.dialog).on('createDialog', function () {
				alertSound.play('dialog');
			});

			if (leading) {
				var video = leading.getVideo();
				video.stream(leading.getSocketId());
				if (me && me.isLeading()) {
					if (me.checkAlive()) {
						video.setVideo(true);
						bindTalkSpace(leading.getVideo(), function () {
							render.meWindow.sayOff(false)
						}, function () {
							render.meWindow.sayOff(true)
						});
					}
					render.area.setLeading();
				} else {
					if (leading.checkAlive()) {
						video.setAudio(true);
					}

					$(leading).on('statusChange', function(e, u){
						u.updateWindow();
					});

					$(leading).on('socketChange', function (e, user) {
						if (user.checkAlive(true)) {
							user.getVideo().stream(leading.getSocketId());
						}
					});

					var windowLeading = render.leadingWindow.init(leading.getVideo());
					windowLeading.setUsername(leading.getUsername());
					windowLeading.setProfileUrl(leading.getProfileUrl());
					leading.setWindow(windowLeading);
					leading.updateWindow();
				}
			}

			changePeriod();

			$(game).on('newEvent', function (e, data) {

				game.setEvent(data.typeEvent);
				game.setNextTime(data.timeEvent);
				game.setCurrentTime(data.timeCurrentEvent);
				var exclude = _.contains(['UserTalkResult', 'StartNight', 'CommissarCheckEnd', 'MafiaCheckEnd', 'EndOfNight', 'WhoreSexEnd', 'DoctorHealEnd', 'ManiacKillEnd', 'MafiaVoteResult', 'ClassicVoteStart', 'EndOfDay'], data.typeEvent);
				if (game.getAliveLeading() && game.checkYourSelf(game.getAliveLeading()) && !exclude) {
					nextEvent();
				}

				if (data.period) {
					if (parseInt(data.period) != game.getPeriodNum()) {
						game.setPeriodNum(data.period);
						changePeriod();
					}
				}

				var countdown = !(game.getAliveLeading() && !exclude);
				var time =  !countdown ? game.getServerTime() - game.getCurrentTime() : game.getNextTime() - game.getServerTime();
				if (data.typeEvent != 'ClassicVote'){
					render.panel.setTime(time, countdown);
				}
				render.panel.setText('');
				$(game).on('afterEvent', function(){
					render.panel.setText(constants.game.descriptionEvent[game.getEvent()]);
				});
			});
		};

		var initViewEnd = function(){

			$(window).off('resize');
			_.each(game.getUsersWithoutYourSelf(), function(u){
				u.getWindow().setSize({height:'', width:''});
			});

			render.area.hide();
			render.panel.hide();
			render.meWindow.hide();
			render.leadingWindow.hide();
		};

		var buttons = {
			closeButtons: {
				title: phrases.close,
				className: 'buttonRed',
				onClick: function (e, dialog, id) {
					dialog.close(id);
				}
			}
		};

		var fail = function (data) {
			console.log('данные ', data.responseJSON);
			alert(data.responseJSON.p.em);
		};

		var nextEvent = function () {
			setTimeout(function () {
				render.panel.addButton('Продолжить', 'gray', function () {
					$.post('/api/leadingNextEvent', {}, function () {
					}, 'json')
						.fail(fail)
						.always(function () {
							render.panel.removeButtons();
						})
				});
			}, 300);
			$(game).one('newEvent', function(){
				render.panel.removeButtons();
			});
		};

		var stopTalk = function () {
			render.panel.addButton(phrases.actions.i_all_speak, 'green', function () {
				$.post('/api/stopTalk', {}, function (data) {
				}, 'json')
					.fail(fail)
					.always(function () {
						render.panel.removeButtons();
					})
			});
			$(game).one('newEvent', function () {
				render.panel.removeButtons();
			});
		};

		var showOnlyUsersWindow = function (usersId) {
			var prisoners = _.map(usersId, function(id){
				return game.findUserById(id);
			});
			var otherUsers = game.getUsersWithoutUsers(_.union([game.getYourSelf()], prisoners));

			_.each(otherUsers, function (user) {
				if (user.checkAlive()){
					user.getVideo().setVideo(false);
				}
				user.getWindow().hide();
			});
			$(game).one('newEvent', function () {
				_.each(otherUsers, function (user) {
					user.getWindow().show();
					if (user.checkAlive()){
						user.getVideo().setVideo(true);
					}
				});
			});
		};

		var prisonWindow = function (users, action, callback) {
			var clear = function () {
				$(game).trigger('clearWindowAction');
			};
			_.each(users, function (user) {
				user.getWindow().setAction('vote', function () {
					$.post(action, {p: {vid: user.getId()}}, function(data){
						user.getWindow().setHighLight();
						$(game).one('newEvent', function(){
							user.getWindow().resetHighLight();
						});
						callback(data);
					}, 'json')
						.fail(fail)
						.always(clear);
				});
			});

			$(game).one('newEvent', clear);
		};

		var mafiaKillWindow = function (users, callback) {
			var clear = function () {
				$(game).trigger('clearWindowAction');
			};
			_.each(users, function (user) {
				user.getWindow().setAction('aim', function () {
					$.post('/api/mafiaVote', {p: {pid: user.getId()}}, callback, 'json')
						.fail(fail)
						.always(clear);
				});
			});
			$(game).one('newEvent', clear)
		};

		var maniacKillWindow = function (users, callback) {
			var clear = function () {
				$(game).trigger('clearWindowAction');
			};

			_.each(users, function (user) {
				user.getWindow().setAction('knife', function () {
					$.post('/api/maniacKill', {p: {kid: user.getId()}}, callback, 'json')
						.fail(fail)
						.always(clear);
				});
			});
			$(game).one('newEvent', clear)
		};

		var whoreCheckWindow = function (users, callback) {
			var clear = function () {
				$(game).trigger('clearWindowAction');
			};
			_.each(users, function (user) {
				user.getWindow().setAction('sex', function () {
					$.post('/api/whoreSex', {p: {sid: user.getId()}}, callback, 'json')
						.fail(fail)
						.always(clear)
				});
			});
			$(game).one('newEvent', clear);
		};

		var doctorCheckWindow = function (users, callback) {
			var clear = function () {
				$(game).trigger('clearWindowAction');
			};
			_.each(users, function (user) {
				user.getWindow().setAction('heal', function () {
					$.post('/api/doctorHeal', {p: {hid: user.getId()}}, callback, 'json')
						.fail(fail)
						.always(clear);
				});
			});
			$(game).one('newEvent', clear);
		};

		var mafiaCheckWindow = function (users, callback) {
			var clear = function () {
				$(game).trigger('clearWindowAction');
			};
			_.each(users, function (user) {
				user.getWindow().setAction('search', function () {
					$.post('/api/mafiaCheck', {p: {pid: user.getId()}}, callback, 'json')
						.fail(fail)
						.always(clear);
				});
			});

			$(game).one('newEvent', clear);
		};

		var commissarCheckWindow = function (users, callback) {
			var clear = function () {
				$(game).trigger('clearWindowAction');
			};

			_.each(users, function (user) {
				var windowUser = user.getWindow();
				windowUser.setAction('search', function () {
					$.post('/api/commissarCheck', {p: {pid: user.getId()}}, callback, 'json')
						.fail(fail)
						.always(clear);
				});
			});
			$(game).one('newEvent', clear);
		};

		var userTalkCheckWindow	= function(users){

			var setVote = function(){
				_.each(users, function (user) {
					user.getWindow().setAction('vote', function () {
						$.post('/api/suggestVote', {p: {vid: user.getId()}}, function (data) {
							$(game).trigger('chooseVoter', user);
							user.getWindow().setHighLight();
							$(game).one('newEvent', function(){
								user.getWindow().resetHighLight();
							});
							resetVote(user);
						}, 'json').fail(fail);
					});
				});
			};

			var resetVote = function(user){
				user.getWindow().setAction('cancelVote', function(){
					$.post('/api/cancelSuggestVote', {p: {vid: user.getId()}}, function (data) {
						$(game).trigger('resetVoter', user);
						user.getWindow().resetHighLight();
					}, 'json').fail(fail);
				})
			};
			setVote();

			$(game).on('chooseVoter', function(e, user){
				$(game).trigger('clearWindowAction');
				alertSound.play('vote_action');
			});

			$(game).on('resetVoter', function(e, user){
				$(game).trigger('clearWindowAction');
				setVote();
			});

			$(game).one('newEvent', function(){
				$(game).trigger('clearWindowAction');
				$(game).off('chooseVoter resetVoter');
			});
		};

		var dayUserReturnHandler = function (e, user) {
			if (user.checkAlive(true) && !user.isLeading()){
				user.getVideo().stream(user.getSocketId());
				if (user.checkAlive()){
					user.getWindow().setOnline();
				}
			}
		};

		var changePeriod = function () {
			render.panel.setPeriod(constants.game.descriptionPeriod(game.getPeriodNum()));
			var me = game.getYourSelf();

			var leading = game.getAliveLeading();
			if (game.getPeriodNum() % 2) {

				_.each(game.getUsers(), function(user){
					$(user).off('socketChange', dayUserReturnHandler);
				});

				render.area.setNight();
				render.area.hide();
				render.nightVideo.show({period:game.getPeriodNum()});

				_.each(game.getUsers(), function (u) {
					u.getVideo().close();
					if (u.checkAlive()) {
						u.getVideo().setVideo(false);
						if (!game.checkYourSelf(u)) {
							u.getWindow().setOffline();
							u.getWindow().setNight();
						}
					}
				});

				if (leading && !game.checkYourSelf(leading)) {
					leading.getVideo().setVideo(false);
					leading.getWindow().setNight();
				}
				if (me && !me.isLeading()){
					render.panel.outCryHide();
				}
			} else {

				render.area.setDay();
				render.area.show();
				render.nightVideo.hide({});

				_.each(game.getUsers(), function (u) {
					u.getVideo().stream(u.getSocketId());
					if (u.checkAlive()) {
						u.getVideo().setVideo(true);
						if (!game.checkYourSelf(u)) {
							u.getWindow().setOnline();
							u.getWindow().setDay();
						}
					}
				});

				if (leading && !game.checkYourSelf(leading)) {
					leading.getVideo().setVideo(true);
					leading.getWindow().setDay();
				}

				_.each(game.getUsers(), function(user){
					$(user).on('socketChange', dayUserReturnHandler);
				});

				noticeSound.play('start_day');
				$(game).one('newEvent', function () {
					noticeSound.pause();
				});
				if (me && me.checkAlive() && !me.isLeading()){
					render.panel.outCryShow();
				}
			}
		};

		var bindTalkSpace = function (video, fnPlaySound, fnPauseSound) {
			var bind = false;
			var $body = $('body');
			$body.on('keyup', function (e) {
				if (e.keyCode == 32) {
					bind = false;
					video.setAudio(false);
				}
			});
			$body.on('keydown', function (e) {
				if (e.keyCode == 32) {
					if (!bind) {
						bind = true;
						video.setAudio(true);
					}
					return false;
				}
			});
			$(video).on('playSound', fnPlaySound);
			$(video).on('pauseSound', fnPauseSound);
			$(video).trigger('pauseSound');
		};

		var unbindTalkSpace = function (video) {
			$('body').off('keyup keydown');
			$(video).trigger('playSound');//убираем
			$(video).off('playSound pauseSound');
		};

		var setOneEventStream = function (active, noAudio, noVideo) {
			if (active && active.checkAlive()) {
				var userWindow = active.getWindow();
				userWindow && userWindow.setDay();

				var v = active.getVideo();
				if (!noAudio) v.setAudio(true);
				if (!noVideo) v.setVideo(true);
				v.stream(active.getRole() + active.getSocketId());

				var handler = function (e, u) {
					if (u.checkAlive(true) && !u.isLeading()) {
						if (u.getId() == active.getId()) {
							v.stream(u.getRole() + u.getSocketId());
						}
					}
				};
				_.each(game.getUsers(), function(user){
					$(user).on('socketChange', handler);
				});

				$(game).one('newEvent', function () {
					userWindow && userWindow.setNight();

					if (!noAudio) v.setAudio(true);
					if (!noVideo) v.setVideo(true);
					v.setVideo(false).setAudio(false).close();
					_.each(game.getUsers(), function(user){
						$(user).off('socketChange', handler);
					});
				});
			}
		};

		var showNightWindow = function () {
			render.area.show();
			render.nightVideo.hide({stopSound:true});

			_.each(game.getAliveUsersWithoutYourSelf(), function (u) {
				u.updateWindow();
			});
			var leading = game.getAliveLeading();
			var hasLeading = leading && !game.checkYourSelf(leading);
			if (hasLeading) {
				leading.updateWindow();
			}

			$(game).one('newEvent', function () {
				render.nightVideo.show({});
				render.area.hide();
			});
		};

		var methods = {
			Meeting: function (gameOpts) {

				var me = game.getYourSelf();
				var canBuyPlace = paidGame && me && (!leading || leading && me != leading);
				render.meeting.show({
					time: game.getTimeToStart(),
					count: game.getCount(),
					has_leading: game.getConfig('has_leading'),
					buy_place: canBuyPlace
				});

				var leading = game.getLeading();

				if (me && leading && (me == leading)) {
					render.meeting.showStartGame();

					$(render.meeting).on('nextEvent', function () {
						$.post('/api/leadingNextEvent', {}, function () {
						}, 'json')
							.fail(fail);
					});
				}

				var add = function (u){
					var me = game.getYourSelf();
					var video = u.getVideo();
					video.stream(u.getSocketId()).setVideo(true);

					if (me != u) {
						video.setAudio(true);
					} else {
						bindTalkSpace(u.getVideo(), function () {
							render.meeting.soundOff(u.getId(), true);
						}, function () {
							render.meeting.soundOff(u.getId(), false);
						});
					}

					var user = {
						id: u.getId(),
						username: u.getUsername(),
						videoElement: u.getVideo().getElement(),
						sound: u == me,
						kick: (u != me && ((handshakeData.moderator) || (me && me.isLeading())))
					};

					if (game.getLeading() == u) {
						render.meeting.addLeading(user);
					} else {
						render.meeting.add(user);
						render.meeting.setFond(game.getBet()*game.getUsers().length);
					}
				};

				if (leading) {
					add(leading);
				}

				_.each(game.getUsers(), function (u) {
					add(u);
				});

				$(game).on('newUserComplete', function (e, u) {
					add(u);
				});

				$(game).on('userRemoveComplete userKickComplete', function (e, u) {
					if (game.getLeading() == u) {
						render.meeting.removeLeading();
					} else {
						render.meeting.remove(u.getId());
					}
				});

				$(game).on('userKickComplete', function(e, u){
					if (game.checkYourSelf(u)){
						render.dialog.create(phrases.actions.kick_from_lobby, {
							time: 5,
							buttons: [buttons.closeButtons]
						});
					}
					game.removeUser(u);
					game.addViewer(u)
				});

				$(render.meeting).on('kick', function(e, userId){
						render.dialog.create(phrases.actions.warning_del_user, {
							title: phrases.actions.complete_kick, buttons: [
								{
									title: phrases.yes,
									className: 'buttonRed',
									onClick: function (e, dialog, id) {
										$.post('/api/kick', {p: {kid: userId}}, function () {
										}, 'json').fail(fail).always(function () {
											dialog.close(id);
										});
									}
								},
								{
									title: phrases.close,
									className: 'buttonRed',
									onClick: function (e, dialog, id) {
										dialog.close(id);
									}
								}
							]
						});
				});

				if (canBuyPlace){
					var buyPlaceDialog;

					var alreadyBuy = {};
					_.each(JSON.parse(gameOpts.buyPlace), function(el){
						alreadyBuy[el.item] = 1;
					});

					var noBuy = {};
					_.each(_.range(1, game.getCount()+1), function(el){ noBuy[el] = 0; });

					var places = _.extend({}, noBuy, alreadyBuy);

					render.buyPlace.init(places, placeMoney);
					$(render.buyPlace).on('buy', function(e, data){
						$.post('/api/buyPlace', {p:data}, function(data){ console.log(data); }, 'json')
							.fail(fail)
							.always(function () {});
					});

					$(render.meeting).on('buyPlace', function(){
						buyPlaceDialog = render.dialog.create(render.buyPlace.getData(), {
							buttons: [buttons.closeButtons]
						}, true);
					});

					socket.on('BuyPlace', function(data){
						render.buyPlace.setStatus(data.item, 1);
					});
					socket.on('FreePlace', function(data){
						render.buyPlace.setStatus(data.item, 0);
					});

					$(game).one('newEvent', function(){
						buyPlaceDialog && render.dialog.close(buyPlaceDialog);
					});
				}

				$(game).one('newEvent', function (e, data) {

					if (me) {
						unbindTalkSpace(me.getVideo());
					}

					$(game).off('newUserComplete');
					$(game).off('userRemoveComplete');
					$(game).off('userKickComplete');
					render.meeting.clear();
					delete render.meeting;
				});
			},

			StartGame: function (data) {
				if (data.game.result == 4) {
					return $(game).trigger('error', {message: _.first(data.game.errors)});
				}

				var me = game.getYourSelf();

				if (!data.init) {

					_.each(game.getUsers(), function (u) {
						var o = _.findWhere(data.players, {user_id: u.getId()});
						u.setNumber(o.number);
					});

					if (data.onlyMe) {
						game.setOnlyMe(JSON.parse(data.onlyMe));
					}

					game.setPeriodNum(0);

					game.setRolesList(_.sortBy(data.game.roles, function (num) {
						return num;
					}));

					initView();
					$(game).trigger('newEvent', data);

				}

				_.each(game.getMembersWithoutYourSelf(), function (u) {
					u.getVideo().setAudio(true);
				});

				if (me && !me.isLeading()) {
					bindTalkSpace(me.getVideo(), function () {
						render.meWindow.sayOff(false);
					}, function () {
						render.meWindow.sayOff(true);
					});
				}

				if (!hidePopup){
					var dialog = render.dialog.create(phrases.actions.start_game_dialog, {
						time: 5,
						buttons: [buttons.closeButtons]
					});
				}


				$(game).one('newEvent', function () {
					if (me && !me.isLeading()) {
						unbindTalkSpace(me.getVideo());
						render.meWindow.sayOff(false);
					}
					_.each(game.getUsersWithoutYourSelf(), function (u) {
						u.getVideo().setAudio(false);
					});


					if (!hidePopup) {
						render.dialog.close(dialog);
					}
				});
				//alertSound.play('start_game');
			},

			VoteComplete: function(data){
				resetRed();
				if (!game.getConfig('show_role_prisoned')) {//перевернутый флаг
					_.each(data.prisoners, function (o) {
						game.findUserById(parseInt(o.id)).setRole(parseInt(o.r));
					});
				}
				_.each(data.prisoners, function (p) {
					var user = game.findUserById(parseInt(p.id));
					user.setStatus(constants.user.statuses.PRISON, p.role);
				});

				var text;
				if (data.prisoners.length == 1) {
					if (!data.prisoners[0].r) {
						text = phrases.actions.player_prison;
					} else {
						var role = parseInt(data.prisoners[0].r);
						if (role == constants.user.roles.MAFIA || role == constants.user.roles.MAFIA_BOSS) {
							text = phrases.actions.kill_mafia;
						} else {
							text = phrases.actions.kill_civilian;
						}
					}
				} else if (data.prisoners.length > 1) {
					text = phrases.actions.players_prison;
				} else {
					text = phrases.actions.prison_failed;
				}
				if (text) {
					render.dialog.create(text, {buttons: [buttons.closeButtons], time: 5});
				}

				//dialog
				if (data.sexed) {
					var user = game.findUserById(data.sexed);
					var sexedDialog = render.dialog.create(_.template(phrases.actions.whore_save_player)({name: user.getUsername()}), {
						time: 5,
						buttons: [buttons.closeButtons]
					});

					$(game).one('newEvent', function () {
						render.dialog.close(sexedDialog);
					});
				}
				//dialog
			},

			EndOfDay: function (data) {
			},

			StartNight: function (data) {
			},

			GettingRole: function(data){

				var role = (game.getYourSelf()) ? game.getYourSelf().getRole() : constants.user.roles.SPECTATOR;
				if (!_.contains([constants.user.roles.LEADING, constants.user.roles.SPECTATOR], role)){
					var roleDescription = constants.user.descriptionRoles[role];
					var dialog = render.dialog.create(_.template($('#role').html())({
						className: roleDescription.id,
						title: roleDescription.title
					}), {
						title: phrases.actions.your_role,
						buttons: [buttons.closeButtons]
					});

					$(game).one('newEvent', function(){
						render.dialog.close(dialog);
					});
				}
			},

			MafiaTalk: function (data) {
				var me = game.getYourSelf();
				var desc = constants.game.descriptionEvent[game.getEvent()];
				desc = (data.kill)?desc[0]:desc[1];
				render.panel.setText(desc);

				if (me && me.checkAlive() && (me.isLeading() || me.isMafia())) {
					var leading = game.getAliveLeading();

					showNightWindow();

					var mafiaUsers = _.filter(game.getAliveUsers(), function (u) {
						return u.isMafia();
					});
					var connectOtherMafia = (mafiaUsers.length > 1 && (!game.getConfig('only_first_night') || game.getPeriodNum() == 1));

					if (me.isMafia()) {
						if (connectOtherMafia) {
							_.each(mafiaUsers, function (u) {
								setOneEventStream(u, game.getConfig('mute'));
							});
						} else if (leading) {
							setOneEventStream(me, true);
						} else {
							_.each(_.without(mafiaUsers, me), function (u) {
								u.getWindow().setMafia();
							});
							$(game).one('newEvent', function () {
								_.each(_.without(mafiaUsers, me), function (u) {
									u.getWindow().removeMafia();
								});
							});
						}
					} else {
						_.each(mafiaUsers, function (u) {
							setOneEventStream(u, true);
						});
					}

					var killCallback = function(){
						alertSound.play('mafia_kill_action');
					};

					if (leading) {
						if (me.isLeading()) {
							if (data.kill){
								mafiaKillWindow(game.getAliveUsersWithoutYourSelf(), killCallback);
							}
						} else {
							leading.getWindow().setDay();
							leading.getVideo().setVideo(true);
							$(game).one('newEvent', function () {
								leading.getWindow().setNight();
								leading.getVideo().setVideo(false);
							});
						}
					} else {

						var dialogText;
						if (data.kill) {

							$(game).one('clearWindowAction', function () {
								render.panel.removeButtons();
							});
							render.panel.addButton(phrases.actions.kill_yourself, 'gray', function () {
								$.post('/api/mafiaVote', {p: {pid: me.getId()}}, killCallback, 'json')
									.fail(fail)
									.always(function () {
										$(game).trigger('clearWindowAction');
									});
							});
							mafiaKillWindow(game.getAliveUsersWithoutYourSelf(), killCallback);

							dialogText = phrases.actions.mafia_talk_kill;

						} else {
							dialogText = phrases.actions.first_mafia_talk;
						}

						if (!hidePopup){
							var dialog = render.dialog.create(dialogText, {time: 2, buttons: [buttons.closeButtons]});

							$(game).one('newEvent', function () {
								render.dialog.close(dialog);
							});
						}
					}
					alertSound.play('mafia_kill_wake_up');
				}
			},

			MafiaVoteResult: function (data) {
			},

			CommissarCheck: function (data) {
				var me = game.getYourSelf();
				if (me && me.checkAlive() && (me.isCommissar() || me.isLeading())) {
					showNightWindow();

					var commissarCallback = function(data){
						if (data.p.result){
							alertSound.play('commissar_action_success')
						} else {
							alertSound.play('commissar_action_fail')
						}
					};

					var leading = game.getAliveLeading();
					if (leading) {
						setOneEventStream(me.isLeading() ? game.findUserByRole(constants.user.roles.COMMISSAR) : me, true);

						if (me.isLeading()) {
							commissarCheckWindow(game.getUsers(), commissarCallback);
						} else {
							leading.getWindow().setDay();
							leading.getVideo().setVideo(true);
							$(game).one('newEvent', function () {
								leading.getWindow().setNight();
								leading.getVideo().setVideo(false);
							});
						}
					} else {

						commissarCheckWindow(game.getUsersWithoutYourSelf(), function (data) {

							var result = data.p.result;
							var text;

							if (result){
								text = phrases.actions.commissar_find_mafia;
							} else {
								text = phrases.actions.commissar_fake;
							}

							render.dialog.create(text, {
								title: phrases.actions.check_result,
								time: 5,
								buttons: [buttons.closeButtons]
							});
							commissarCallback(data);
						});

						if (!hidePopup){
							var dialog = render.dialog.create(phrases.actions.go_check, {
								time: 2,
								buttons: [buttons.closeButtons]
							});

							$(game).one('newEvent', function () {
								render.dialog.close(dialog);
							});
						}
					}
					alertSound.play('commissar_wake_up');
				}
			},
			CommissarCheckEnd: function (data) {
			},
			MafiaCheck: function () {

				var me = game.getYourSelf();
				if (me && me.checkAlive() && (me.isMafiaBoss() || me.isLeading())) {
					showNightWindow();

					var mafiaCallback = function(data){
						if (data.p.result){
							alertSound.play('don_action_success');
						} else {
							alertSound.play('don_action_fail');
						}
					};
					var leading = game.getAliveLeading();
					if (leading) {
						setOneEventStream(me.isLeading() ? game.findUserByRole(constants.user.roles.MAFIA_BOSS) : me, true);
						if (me.isLeading()) {
							mafiaCheckWindow(game.getUsersWithoutYourSelf(), mafiaCallback);
						} else {
							leading.getVideo().setVideo(true);
							leading.getWindow().setDay();
							$(game).one('newEvent', function () {
								leading.getWindow().setNight();
								leading.getVideo().setVideo(false);
							});
						}

					} else {
						mafiaCheckWindow(game.getUsersWithoutYourSelf(), function (data) {

							var result = data.p.result;
							var text;
							if (result){
								var role = parseInt(data.p.role);
								if (role == constants.user.roles.COMMISSAR){
									text = phrases.actions.mafia_boss_find_commissar;
								}
							} else {
								text = phrases.actions.mafia_boss_miss;
							}

							render.dialog.create(text, {
								title: phrases.actions.check_result,
								time: 5,
								buttons: [buttons.closeButtons]
							});
							mafiaCallback(data);
						});

						if (!hidePopup){
							var dialog = render.dialog.create(phrases.actions.go_check, {
								time: 2,
								buttons: [buttons.closeButtons]
							});

							$(game).one('newEvent', function () {
								render.dialog.close(dialog);
							});
						}
					}
					alertSound.play('don_wake_up');
				}
			},
			MafiaCheckEnd: function (data) {

			},
			DoctorHeal: function (data) {
				var me = game.getYourSelf();
				if (me && me.checkAlive() && (me.isDoctor() || me.isLeading())) {

					showNightWindow();

					var healUsers = _.filter(game.getUsers(), function (u) {
						return _.contains(_.map(data.usersHeal, function (val) {
							return parseInt(val);
						}), u.getId());
					});

					var doctorCallback = function(){
						alertSound.play('doctor_action');
					};
					var leading = game.getAliveLeading();
					if (leading) {
						setOneEventStream(me.isLeading() ? game.findUserByRole(constants.user.roles.DOCTOR) : me, true);
						if (me.isLeading()) {
							doctorCheckWindow(healUsers, doctorCallback);
						} else {
							leading.getWindow().setDay();
							leading.getVideo().setVideo(true);
							$(game).one('newEvent', function () {
								leading.getWindow().setNight();
								leading.getVideo().setVideo(false);
							});
						}

					} else {
						if (_.contains(healUsers, me)) {

							$(game).one('clearWindowAction', function () {
								render.panel.removeButtons();
							});

							render.panel.addButton(phrases.actions.treat_yourself, 'green', function () {
								$.post('/api/doctorHeal', {p: {hid: me.getId()}}, doctorCallback, 'json')
									.fail(fail)
									.always(function () {
										$(game).trigger('clearWindowAction');
									})
							});

							healUsers = _.without(healUsers, me);
						}

						doctorCheckWindow(healUsers, doctorCallback);

						if (!hidePopup){
							var dialog = render.dialog.create(phrases.actions.doctor_wake, {
								time: 2,
								buttons: [buttons.closeButtons]
							});

							$(game).one('newEvent', function () {
								render.dialog.close(dialog);
							});
						}

					}
					alertSound.play('doctor_wake_up');
				}
				//view
			},
			DoctorHealEnd: function (data) {

			},
			WhoreSex: function (data) {
				var me = game.getYourSelf();
				if (me && me.checkAlive() && (me.isWhore() || me.isLeading())) {
					showNightWindow();

					var whoreCallback = function(){
						alertSound.play('whore_action');
					};

					var sexyUsers = _.filter(game.getUsersWithoutYourSelf(), function (u) {
						return _.contains(_.map(data.usersSex, function (u) {
							return parseInt(u);
						}), u.getId());
					});

					var leading = game.getAliveLeading();
					if (leading) {
						setOneEventStream(me.isLeading() ? game.findUserByRole(constants.user.roles.WHORE) : me, true);
						if (me.isLeading()) {
							whoreCheckWindow(sexyUsers, whoreCallback);
						} else {
							leading.getWindow().setDay();
							leading.getVideo().setVideo(true);
							$(game).one('newEvent', function () {
								leading.getWindow().setNight();
								leading.getVideo().setVideo(false);
							});
						}


					} else {

						whoreCheckWindow(sexyUsers, whoreCallback);
						$(game).one('clearWindowAction', function () {
							render.panel.removeButtons();
						});

						render.panel.addButton(phrases.actions.whore_yourself, 'gray', function () {
							$.post('/api/whoreSex', {p: {sid: me.getId()}}, whoreCallback, 'json')
								.fail(fail)
								.always(function () {
									$(game).trigger('clearWindowAction');
								});
						});

						if (!hidePopup){
							var dialog = render.dialog.create(phrases.actions.whore_love, {
								time: 2,
								buttons: [buttons.closeButtons]
							});

							$(game).one('newEvent', function () {
								render.dialog.close(dialog);
							});
						}

					}
					alertSound.play('whore_wake_up');
				}
			},
			WhoreSexEnd: function () {

			},
			ManiacKill: function (data) {

				var me = game.getYourSelf();
				if (me && me.checkAlive() && (me.isManiac() || me.isLeading())) {

					showNightWindow();
					var kills = (data.kills > 0);

					var maniacCallback = function(){
						alertSound.play('maniac_action');
					};

					var leading = game.getAliveLeading();
					if (leading) {
						setOneEventStream(me.isLeading() ? game.findUserByRole(constants.user.roles.MANIAC) : me, true);
						if (me.isLeading()) {
							if (kills) {
								maniacKillWindow(game.getAliveUsersWithoutYourSelf(), maniacCallback);
							}
						} else {
							leading.getVideo().setVideo(true);
							leading.getWindow().setDay();
							$(game).one('newEvent', function () {
								leading.getWindow().setNight();
								leading.getVideo().setVideo(false);
							});
						}

					} else {
						if (kills) {
							maniacKillWindow(game.getAliveUsersWithoutYourSelf(), maniacCallback);
						}
					}

					var text;
					if (kills) {
						text = _.template(phrases.actions.maniac_wake)({count: data.kills});
					} else {
						text = phrases.actions.maniac_wake_without_kills;
					}

					var dialog = render.dialog.create(text, {time: 2, buttons: [buttons.closeButtons]});

					$(game).one('newEvent', function () {
						render.dialog.close(dialog);
					});
					alertSound.play('maniac_wake_up');
				}
			},

			ManiacKillEnd: function (data) {
			},

			EndOfNight: function (e, data) {
			},

			StartDay: function (data) {

				if (data.events && data.events.length) {

					_.each(data.events, function (e) {
						var user = game.findUserById(parseInt(e.value));
						render.newspaper.add(e, user);

						var type = parseInt(e.type);
						if (e.value > 0 && (type == constants.game.typeEvents.MAFIA_KILL || type == constants.game.typeEvents.MANIAC_KILL)) {
							user.setStatus(constants.user.statuses.DEAD, e.role);
						}
					});

					render.newspaper.show();

					$(game).one('newEvent', function () {
						setTimeout(function(){
							render.newspaper.hide();
						}, 10000);
					});
				} else {

					if (!hidePopup){
						var dialog = render.dialog.create(phrases.actions.all_wake, {
							title: phrases.actions.good_morning,
							time: 5,
							buttons: [buttons.closeButtons]
						});

						$(game).one('newEvent', function () {
							render.dialog.close(dialog);
						});
					}
				}
			},

			DeadLastTalk: function (data) {

				var user = game.findUserById(parseInt(data.talker));

				var desc = constants.game.descriptionEvent[game.getEvent()];
				desc = game.checkYourSelf(user)?desc[1]:_.template(desc[0])({number: user.getNumber()});
				render.panel.setText(desc, game.checkYourSelf(user));

				if (game.checkYourSelf(user)) {
					alertSound.play('dialog');
					if (!game.getAliveLeading()) {
						stopTalk();
					}
					var video = user.getVideo();
					video.setVideo(true).setAudio(true);
					$(game).one('newEvent', function () {
						video.setVideo(false).setAudio(false);
					});
				} else {
					var userWindow = user.getWindow();
					userWindow.setColorUsername();
					user.getVideo().setAudio(true).setVideo(true);
					userWindow.setOnline();

					$(game).one('newEvent', function () {
						user.getVideo().setAudio(false).setVideo(false);
						userWindow.clearColorUsername();
						userWindow.setOffline();
					});
				}
			},

			UserTalk: function (data) {
				var user = game.findUserById(parseInt(data.talker));

				var desc = constants.game.descriptionEvent[game.getEvent()];
				desc = game.checkYourSelf(user)?desc[1]:_.template(desc[0])({number: user.getNumber()});
				render.panel.setText(desc, game.checkYourSelf(user));

				var me = game.getYourSelf();
				if (me && me.checkAlive() && me.isLeading()){
					userTalkCheckWindow(_.filter(game.getAliveUsersWithoutYourSelf(), function(u){
						return !u.wasChoosen();
					}), function(){});
				}

				if (game.checkYourSelf(user)) {
					alertSound.play('dialog');

					if (!hidePopup){
						var text;
						if (data.silent){
							text = 'Вы лишены права говорить на этот круг,<br> но у Вас есть возможность выставить кандидатуру!';
						} else {
							text = phrases.actions.your_talk;
						}
						var dialog = render.dialog.create(text, {
							time: 5,
							title: phrases.actions.you_speak,
							buttons: [buttons.closeButtons]
						});
					}

					if (!game.getAliveLeading()) {

						var voteYouSelf = function(){
							userTalkCheckWindow(_.filter(game.getAliveUsersWithoutYourSelf(), function(u){
								return !u.wasChoosen();
							}), function(){});
							if (!user.wasChoosen()){
								render.panel.addButton('Выставить себя', 'gray', function () {
									$.post('/api/suggestVote', {p:{vid: user.getId()}}, function () {
											$(game).trigger('chooseVoter', user);
											resetYourSelf();
										}, 'json').fail(fail);
								});
							}
						};

						var resetYourSelf = function(){
							render.panel.addButton('Отмена', 'red', function(){
								$.post('/api/cancelSuggestVote', {p:{vid: user.getId()}}, function(){
									$(game).trigger('resetVoter', user);
								})
							});
						};
						stopTalk();
						voteYouSelf();

						if (!user.wasChoosen()){
							$(game).on('chooseVoter', function(e, u){
								render.panel.removeButtons();
								stopTalk();
							});
							$(game).on('resetVoter', function(e, u){
								render.panel.removeButtons();
								stopTalk();
								voteYouSelf();
							});
						}
					}

					if (!data.silent){
						user.getVideo().setAudio(true);
					}
					$(game).one('newEvent', function () {
						user.getVideo().setAudio(false);
						if (!hidePopup) {
							render.dialog.close(dialog);
						}
					});
				} else {

					if (!data.silent){
						user.getWindow().setColorUsername();
						user.getVideo().setAudio(true);
					} else {
						user.getWindow().setRedColorUsername();
					}

					$(game).one('newEvent', function () {
						user.getVideo().setAudio(false);
						user.getWindow().clearColorUsername();
					});
				}
			},

			UserTalkResult:function(data){
				if (data.vote){
					var user = game.findUserById(parseInt(data.vote));
					user.setChoose();
				}
			},
			LeadingTalk: function(data){
			},
			FreeTalk: function (data) {
				_.each(game.getAliveUsersWithoutYourSelf(), function (user) {
					user.getVideo().setAudio(true);
				});

				if (!hidePopup){
					var text = (game.getPeriodNum() == 2) ? phrases.actions.free_talk_first_day : phrases.actions.free_talk;
					var dialog = render.dialog.create(text, {
						title: phrases.actions.all_talked,
						time: 2,
						buttons: [buttons.closeButtons]
					});
				}

				var me = game.getYourSelf();
				var check = me && me.checkAlive() && !me.isLeading();
				if (check) {
					bindTalkSpace(me.getVideo(), function () {
						render.meWindow.sayOff(false);
					}, function () {
						render.meWindow.sayOff(true);
					});
				}

				$(game).one('newEvent', function () {
					if (check) {
						unbindTalkSpace(me.getVideo());
					}

					if (!hidePopup) {
						render.dialog.close(dialog);
					}

					_.each(game.getAliveUsersWithoutYourSelf(), function (user) {
						user.getVideo().setAudio(false);
					});
				});
			},

			OtherVote: function (data) {

				noticeSound.play('vote_wait', true);
				$(game).one('newEvent', noticeSound.pause);

				showOnlyUsersWindow(data.prisoners);

				var prisonersUsers = _.filter(game.getUsersWithoutYourSelf(), function (u) {
					return _.contains(data.prisoners, u.getId());
				});

				var me = game.getYourSelf();

				if (me && me.checkAlive() && !me.isLeading()) {

					prisonWindow(prisonersUsers, '/api/judgeVote', function (data) {
						alertSound.play('vote_action');
						noticeSound.pause();
					});
				}
			},
			Vote: function (data) {

				this.OtherVote(data);
				var dialog;
				if (data.countLastVoting == 0){
					resetRed();

					if (!hidePopup){
						var numbers = _.map(data.prisoners, function (p) {
							return game.findUserById(p).getNumber();
						});

						dialog = render.dialog.create(_.template(phrases.actions.vote_start)({users: '№'+numbers.join(', №')}), {
							time: 3,
							buttons: [buttons.closeButtons]
						});

						$(game).one('newEvent', function () {
							render.dialog.close(dialog);
						});
					}

				} else {

					if (!hidePopup){

						var text = phrases.actions.third_vote_start;
						var liveUsers = _.filter(game.getUsers(), function (u) {
							return u.checkAlive();
						});
						if (liveUsers.length == 3) {
							text += phrases.actions.third_vote_warning;
						}

						dialog = render.dialog.create(text, {time: 3, buttons: [buttons.closeButtons]});
						$(game).one('newEvent', function () {
							render.dialog.close(dialog);
						});
					}
				}
			},
			VoteResult: function (data) {

					var conf = [];
					var content;
					if (Object.keys(data.voters).length) {

						var voters = {};
						_.each(data.voters, function(candidate, voter){
							if (!this[candidate]){
								this[candidate] = [];
							}
							this[candidate].push(voter);
						}, voters);

						_.each(voters, function (v, i) {
							var user = game.findUserById(parseInt(i));
							conf.push({
								name: user.getUsername(),
								number: user.getNumber(),
								voterList: _.map(v, function (num) {
									var user = game.findUserById(parseInt(num));
									return {name: user.getUsername(), number: user.getNumber()};
								})
							});
						});

						content = _.template($('#voteResults').html())({suspectList: conf});
					} else {
						content = phrases.actions.vote_failed;
					}

					var dialog = render.dialog.create(content, {
						title: phrases.actions.vote_result,
						buttons: [buttons.closeButtons]
					});

					$(game).one('newEvent', function () {
						if (game.getConfig('classic_vote')){
							render.dialog.close(dialog);
						}
					});
			},

			ClassicVoteStart: function(data){
				resetRed();

				var numbers = _.map(data.candidates, function(id){
					return game.findUserById(id).getNumber();
				});

				var dialog = render.dialog.create('На голосование выставлены игроки: №'+numbers.join(', №'));
				$(game).one('newEvent', function(){
					render.dialog.close(dialog);
				});
			},

			ClassicVoteNotify: function(data){
				var user = game.findUserById(data.candidate);
				var dialog = render.dialog.create('Кто голосует против игрока №'+user.getNumber()+'?');
				$(game).one('newEvent', function(){
					render.dialog.close(dialog);
				});
			},

			ClassicVote: function(data){

				var user = game.findUserById(data.candidate);
				var me = game.getYourSelf();

				render.panel.setText(_.template(constants.game.descriptionEvent[game.getEvent()])({number: user.getNumber()}));

				var leading = game.getLeading();
				if (leading && leading.checkAlive() && game.getConfig('hard_classic_vote')){
					if (me && me.checkAlive()){
						if (me.isLeading()){
							var users = _.filter(game.getAliveUsers(), function(u){ return !_.contains(data.excludeVoters, u.getId()); });
							_.each(users, function(user){
								user.getWindow().setAction('voteUp', function(){
									$.post('/api/classicJudgeVote', {p:{vid:user.getId()}}, function(){
										user.getWindow().clearAction();
									}, 'json')
									.fail(fail);
								});
							});
							$(game).one('newEvent', function(){
								$(game).trigger('clearWindowAction');
							});
						}
					}

				} else {
					if (me && !me.isLeading() && me.checkAlive() && !_.contains(data.excludeVoters, me.getId())){

						var vote =  function () {
							$.post('/api/classicJudgeVote', {p: {vid: user.getId()}}, function () {
							}, 'json')
								.fail(fail)
								.always(function () {
									render.panel.removeButtons();
							})
						};

						var $body = $('body');
						$body.on('keyup', function (e) {
							if (e.keyCode == 32) {
								vote();
							}
						});

						render.panel.addButton('Проголосовать', 'gray', vote);
						$(game).one('newEvent', function () {
							$body.off('keyup');
							render.panel.removeButtons();
						});
					}
				}

				user.setChoose();
				$(game).one('newEvent', function(){
					user.clearChoose();
				});
				socket.on('Voting', function(dataVoting){
					if (dataVoting.candidate_id == data.candidate){
						var user = game.findUserById(dataVoting.voter_id);
						if (me != user){
							user.getWindow().clearAction().setVoter();
							$(game).one('newEvent', function(){
								user.getWindow().resetVoter();
							});
						} else {
							render.meWindow.showRed();
							$(game).one('newEvent', function(){
								render.meWindow.hideRed();
							});
						}
					}
				});
				$(game).one('newEvent', function(){
					socket.off('Vote');
				});
			},
			ClassicVoteResult: function(data){
				this.VoteResult(data);
			},
			JudgeTalk: function (data) {

				var user = game.findUserById(parseInt(data.talker));

				var desc = constants.game.descriptionEvent[game.getEvent()];
				desc = game.checkYourSelf(user)?desc[1]:_.template(desc[0])({number: user.getNumber()});
				render.panel.setText(desc, game.checkYourSelf(user));

				if (game.checkYourSelf(user)) {
					if (!game.getAliveLeading()) {
						stopTalk();
					}

					user.getVideo().setAudio(true);
					$(game).one('newEvent', function () {
						user.getVideo().setAudio(false);
					});

					if (!hidePopup){
						var dialog = render.dialog.create(phrases.actions.your_prison_talk, {time: 5, buttons: [buttons.closeButtons]});
						$(game).one('newEvent', function () {
							render.dialog.close(dialog);
						});
					}
				} else {
					user.getWindow().setColorUsername();
					user.getVideo().setAudio(true);
					$(game).one('newEvent', function () {
						user.getWindow().clearColorUsername();
						user.getVideo().setAudio(false);
					});
				}
			},
			VoteAll: function (data) {
				var me = game.getYourSelf();
				var numbers = _.map(data.prisoners, function (u) {
					return game.findUserById(u).getNumber();
				});

				if (me && me.checkAlive()) {
					var leading = game.getLeading();

					var voteAll = function(handler){
						render.panel.addButton(phrases.actions.vote_all, 'red', function () {
							$.post('/api/judgeAllVote', {p: {vid: 1}}, function () {
							}, 'json')
								.fail(fail)
								.always(function () {
									render.panel.removeButtons();
									handler();
								})
						});
						$(game).one('newEvent', function () {
							render.panel.removeButtons();
						});

					};

					if (leading && leading.checkAlive() && me.isLeading()){
						voteAll(nextEvent);
					} else if (!leading || !leading.checkAlive()){
						voteAll();
					}

					render.dialog.create(_.template(phrases.actions.forth_vote)({users: '№'+numbers.join(', №')}),{
						time:3
					});

				} else {
					render.dialog.create(_.template(phrases.actions.viewer_decisions)({users: '№'+numbers.join(', №')}), {
						time:3
					});
				}
			},
			VoteAllResult: function (data) {
				var content;
				if (data.voters) {

					var getVoters = function (voters) {
						return _.map(voters, function (id) {
							var user = game.findUserById(parseInt(id));
							return {name: user.getUsername(), number: user.getNumber()};
						});
					};

					var voters = {};
					_.each(data.voters, function(candidate, voter){
						if (!this[candidate]){
							this[candidate] = [];
						}
						this[candidate].push(voter);
					}, voters);

					var sendToHome = getVoters(voters[0]);
					var sendToJail = getVoters(voters[1]);

					var text;
					if (sendToJail.length > sendToHome.length){
						text = phrases.actions.forth_result_all_prison;
					} else {
						text = phrases.actions.forth_result_all_save;
					}

					content = _.template($('#voteForthResults').html())({
						sendToHome: sendToHome,
						sendToJail: sendToJail
					});

				} else {
					content = phrases.actions.forth_result_not_vote;
				}

				var dialog = render.dialog.create(content+'<br>'+text, {
					title: phrases.actions.vote_result,
					buttons: [buttons.closeButtons]
				});

				$(game).one('newEvent', function () {
					render.dialog.close(dialog);
				});
			},

			LastTalk: function (data) {
				var user = game.findUserById(parseInt(data.talker));

				var desc = constants.game.descriptionEvent[game.getEvent()];
				desc = game.checkYourSelf(user)?desc[1]:_.template(desc[0])({number: user.getNumber()});
				render.panel.setText(desc, game.checkYourSelf(user));

				if (game.checkYourSelf(user)) {
					alertSound.play('dialog');
					if (!game.getAliveLeading()) {
						stopTalk();
					}
					user.getVideo().setVideo(true).setAudio(true);
					$(game).one('newEvent', function () {
						user.getVideo().setVideo(false).setAudio(false);
					});

				} else {
					user.getWindow().setColorUsername();
					user.getVideo().setVideo(true).setAudio(true);
					user.getWindow().setOnline();

					$(game).one('newEvent', function () {
						user.getVideo().setVideo(false).setAudio(false);
						user.getWindow().clearColorUsername();
						user.getWindow().setOffline();
					});
				}

				if (!hidePopup){
					var dialog = render.dialog.create(phrases.actions.last_talk_prison, {time: 5, buttons: [buttons.closeButtons]});
					$(game).one('newEvent', function () {
						render.dialog.close(dialog);
					});
				}
			},

			LeaveLeading: function(data){
				initViewEnd();
				return $(game).trigger('error', {message: 'Игра закончена<br> Ведущий сбежал'});
			},

			GameOver: function (data) {

				initViewEnd();

				var users = _.sortBy(game.getUsers(), function (u) {
					return u.getNumber();
				});
				var leading = game.getLeading();
				if (leading) {
					$(leading.getWindow()).trigger('close');
					users.push(game.getLeading());
				}

				_.each(users, function (u) {
					var info = _.findWhere(data.roles, {id: u.getId()});
					var color = render.finish.getColor(parseInt(info.r), constants.user.roles);

					render.finish.add({
						id: u.getId(),
						username: u.getUsername(),
						number: u.getNumber(),
						rating: info.rtg,
						factor: parseInt(info.factor),
						color: color,
						role: constants.user.descriptionRoles[parseInt(info.r)].title,
						money: info.money,
						leading: (parseInt(info.r) == constants.user.roles.LEADING)
					}, u.getVideo());
				});

				_.each(users, function (u) {
					var video = u.getVideo();
					video.setVideo(true);
					if (game.checkYourSelf(u)) {
						bindTalkSpace(u.getVideo(), function () {
							render.finish.soundOff(u.getId(), true);
						}, function () {
							render.finish.soundOff(u.getId(), false);
						});
					} else {
						video.setAudio(true);
					}
				});

				var result = constants.game.descriptionResult[data.result];
				render.finish.show(result.title, result.id, game.getConfig('has_leading'));
				alertSound.play('dialog');
			}
		};

		var userMethods = {
			newUser: function (data) {
				var oUser = new User(data.id, game);

				if (data.itsMe) {
					game.setMyId(data.id);
					data.video = game.getYourSelfVideo();
				} else {
					data.video = render.player();
					data.video.init({});
				}
				data.video.connect(game.getServerUrl());
				oUser.setInitData(data);
				if (oUser.getPlayer() == constants.user.types.LEADING) {
					oUser.setRole(constants.user.roles.LEADING);
					game.setLeading(oUser);
				} else {
					game.addUser(oUser);
				}
				$(game).trigger('newUserComplete', oUser);
			},

			newViewer: function (data) {
				data.itsMe && game.setMyGuestId(data.socketId);

				var user = new User(0, game);
				user.setSocketId(data.socketId);
				game.addViewer(user);
			},
			userRemove: function (data) {
				var member = game.findMemberBySocketId(data.socket);
				var viewer = game.findViewerBySocketId(data.socket);
				if (member) {
					$(game).trigger('userRemoveComplete', member);
					if (!game.checkYourSelf(member)){
						member.getVideo().remove();
					}
					if (member.getPlayer() == constants.user.types.LEADING) {
						game.setLeading(false);
					} else {
						game.removeUser(member);
					}
				} else {
					game.removeViewer(viewer);
				}
			},
			userGoAway: function (data) {
				var user = game.findMemberBySocketId(data.socket);
				if (user.checkAlive()) {
					user.setStatus(constants.user.statuses.ESCAPING);
					user.setTimeEscaping(data.time);
				}
			},
			userReturn: function (data) {
				var user = game.findMemberBySocketId(data.oldSocket);
				if (user.getStatus() == constants.user.statuses.ESCAPING) {
					user.setStatus(constants.user.statuses.ALIVE);
					user.setTimeEscaping(0);
				}
				user.setSocketId(data.newSocket);
			},
			userExit: function (data) {
				var user = game.findMemberBySocketId(data.socket);
				if (user.checkAlive()){
					user.setStatus(constants.user.statuses.ESCAPED);
					if (user.isLeading()) {
						render.panel.getClock().getFlipclock().setCountdown(true);
					}
				}
			},
			returnUserAfterExit: function (data) {
				var user = game.findMemberById(data.id);
				user.setSocketId(data.socketId);
			},
			Kick: function (data) {
				var user = game.findUserById(parseInt(data.user_id));
				user.setStatus(constants.user.statuses.KICKED);
				$(game).trigger('userKickComplete', user);
			},

			OutCry: function(data){
				var user = game.findUserById(parseInt(data.user_id));
				if (game.checkYourSelf(user)){
					render.panel.outCryHide();
					render.meWindow.showOutCry();
				} else {
					user.getWindow().setOutCry();
				}
				user.getVideo().addConditionAudio('main.outcry', true, '||');
			},
			OutCryEnd: function(data){
				var user = game.findUserById(parseInt(data.user_id));
				if (game.checkYourSelf(user)){
					render.panel.outCryShow();
					render.meWindow.hideOutCry();
				} else {
					user.getWindow().resetOutCry();
				}
				user.getVideo().delConditionAudio('main.outcry');
			},
			Foul: function(data){
				var user = game.findUserById(parseInt(data.user_id));
				user.setFouls(data.fouls);
			}
		};

		return {
			reload: function(data){

				_.each(game.getViewers(), function (viewer) {//remove all viewers
					game.removeViewer(viewer);
				});
				var isMeeting = !data.game.response;

				if (isMeeting){
					_.each(game.getUsers(), function(user){
						userMethods.userRemove({socket:user.getSocketId()});
					});
					var leading = game.getLeading();
					leading && userMethods.userRemove({socket:leading.getSocketId()});
				}

				_.each(data.users, function (user) {
					if (parseInt(user.player)) {
						if (isMeeting){
							userMethods.newUser(user);
						} else {
							game.findMemberById(parseInt(user.id)).updateUserData(user);
						}
					} else {
						userMethods.newViewer(user);
					}
				});

				if (!isMeeting) {

					var response = JSON.parse(data.game.response);
					if (game.getCurrentTime() != response.timeCurrentEvent) {

						if (data.game.suggest) {
							_.each(JSON.parse(data.game.suggest), function (suggestId) {
								game.findUserById(suggestId).setChoose();
							});
						}
						response.period = data.game.period;

						$(game).trigger('newEvent', response);
						setTimeout(function () {
							methods[response.typeEvent](response);
							$(game).trigger('afterEvent');
						}, 0);
					}
				}
			},
			init: function (data, socketInstance) {
				socket = socketInstance;
				this.events();
				initSettings();
				game.setInitData(data);
				var onlyMe;
				_.each(data.users, function (user) {//пользователи
					if (parseInt(user.player)) {
						if (user.itsMe && user.onlyMe) {
							onlyMe = user.onlyMe;
						}
						userMethods.newUser(user);
					} else {
						userMethods.newViewer(user);
					}
				});
				if (onlyMe) {
					game.setOnlyMe(JSON.parse(onlyMe));
				}

				if (!data.game.response) {
					methods.Meeting(data.game);
				} else {
					game.setRolesList(_.sortBy(JSON.parse(data.game.roles), function (num) {
						return num;
					}));
					game.setPeriodNum(data.game.period);

					if (data.game.suggest){
						_.each(JSON.parse(data.game.suggest), function(suggestId){
							game.findUserById(suggestId).setChoose();
						});
					}

					var response = JSON.parse(data.game.response);
					initView();
					$(game).trigger('newEvent', response);
					setTimeout(function(){
						methods[response.typeEvent]($.extend(response, {init: true}));
						$(game).trigger('afterEvent');
					}, 0);
				}
			},
			events: function () {
				_.each(events, function (v) {
					socket.on(v, function (data) {
						$(game).trigger('newEvent', data);
						methods[v](data);
						$(game).trigger('afterEvent');
					});
				});

				_.each(userEvents, function (e) {
					socket.on(e, function (data) {
						userMethods[e](data);
					});
				});
			}
		}
	}
);
