define(['jquery', 'underscore'],
	function ($, _) {

		var result = {
			user: {
				statuses: {
					ALIVE: 0,
					DEAD: 1,
					PRISON: 2,
					BANNED: 3,
					ESCAPED: 4,
					ESCAPING: 5,
					KICKED: 6
				},
				roles: {
					CIVILIAN: 1,
					SPECTATOR: 2,
					MAFIA: 3,
					MAFIA_BOSS: 4,
					COMMISSAR: 5,
					DOCTOR: 6,
					WHORE: 7,
					MANIAC: 8,
					LEADING: 9
				},
				types: {
					SPECTATOR: 0,
					PLAYER:1,
					LEADING: 2
				},

				windowDummy: {
					nightVideoDisabled: phrases.constants.night_video_disabled,
					nightMafiaVideoDisabled: phrases.constants.night_mafia_video_disabled
				}
			},
			game: {
				typeEvents: {
					MAFIA_KILL: 1,
					MAFIA_CHECK: 2,
					COMMISSAR_CHECK: 3,
					MANIAC_KILL: 4,
					DOCTOR_HEAL: 5
				},
				results: {
					CIVILIAN_WIN: 1,
					MAFIA_WIN: 2
				}
			},
			language: {
				ru: 1,
				en: 2
			}
		};

		var windowStatuses = {};
		var statuses = result.user.statuses;
		windowStatuses[statuses.PRISON] = phrases.constants.prison;
		windowStatuses[statuses.DEAD] = phrases.constants.dead;
		windowStatuses[statuses.ESCAPING] = phrases.constants.escaping;
		windowStatuses[statuses.ESCAPED] = phrases.constants.escaped;
		windowStatuses[statuses.KICKED] = phrases.constants.kicked;
		result.user.windowStatuses = windowStatuses;

		var descriptionRoles = {};
		var roles = result.user.roles;
		descriptionRoles[roles.CIVILIAN] = {
			title: phrases.constants.civilian,
			id: 'civilian'
		};
		descriptionRoles[roles.COMMISSAR] = {
			title: phrases.constants.commissar,
			id: 'commissar'
		};
		descriptionRoles[roles.MAFIA] = {
			title: phrases.constants.mafia,
			id: 'mafia'
		};
		descriptionRoles[roles.MAFIA_BOSS] = {
			title: phrases.constants.mafia_boss,
			id: 'boss'
		};
		descriptionRoles[roles.DOCTOR] = {
			title: phrases.constants.doctor,
			id: 'doctor'
		};
		descriptionRoles[roles.WHORE] = {
			title: phrases.constants.whore,
			id: 'whore'
		};
		descriptionRoles[roles.MANIAC] = {
			title: phrases.constants.maniac,
			id: 'maniac'
		};
		descriptionRoles[roles.SPECTATOR] = {
			title: phrases.constants.viewer,
			id: 'viewer'
		};
		descriptionRoles[roles.LEADING] = {
			title: 'Ведущий',
			id: 'leading'
		};

		result.user.descriptionRoles = descriptionRoles;

		var descriptionResult = {};
		var results = result.game.results;
		descriptionResult[results.MAFIA_WIN] = {
			id: 'mafWon',
			title: phrases.constants.mafia_win
		};
		descriptionResult[results.CIVILIAN_WIN] = {
			id: 'civWon',
			title: phrases.constants.civilian_win
		};

		result.game.descriptionResult = descriptionResult;

		result.game.descriptionEvent = {
			StartGame: phrases.constants.event.start_game,
			EndStart: phrases.constants.event.end_of_day,
			EndOfDay: phrases.constants.event.end_of_day,
			StartNight: phrases.constants.event.start_night,
			GettingRole: phrases.constants.event.getting_role,
			EndOfNight: phrases.constants.event.end_of_night,
			StartDay: phrases.constants.event.start_day,
			UserTalk: [phrases.constants.event.user_talk, phrases.constants.event.me_talk],
			UserTalkResult: '',
			LeadingTalk: 'Говорит ведущий',
			FreeTalk: phrases.constants.event.free_talk,
			MafiaTalk: [phrases.constants.event.mafia_session, phrases.constants.event.mafia_meeting],
			MafiaVoteResult: phrases.constants.event.mafia_sleep,
			CommissarCheck: phrases.constants.event.commissar_wake,
			CommissarCheckEnd: phrases.constants.event.commissar_sleep,
			MafiaCheck: phrases.constants.event.don_mafia_wake,
			MafiaCheckEnd: phrases.constants.event.don_mafia_sleep,
			DeadLastTalk: [phrases.constants.event.user_last_talk, phrases.constants.event.your_last_talk],
			Vote: phrases.constants.event.second_vote,
			VoteResult: phrases.constants.event.vote_result,
			ClassicVote: phrases.constants.event.classic_vote,
			ClassicVoteResult: phrases.constants.event.vote_result,
			VoteAll: phrases.constants.event.second_vote,
			VoteAllResult: phrases.constants.event.vote_result,
			VoteComplete: 'Оглашается приговор',
			GameOver: phrases.constants.event.game_over,
			LastTalk: [phrases.constants.event.user_last_talk, phrases.constants.event.your_last_talk],
			JudgeTalk: [phrases.constants.event.voters_talked, phrases.constants.event.your_voters_talked],
			DoctorHeal: phrases.constants.event.doctor_wake,
			DoctorHealEnd: phrases.constants.event.doctor_sleep,
			WhoreSex: phrases.constants.event.whore_wake,
			WhoreSexEnd: phrases.constants.event.whore_sleep,
			ManiacKill: phrases.constants.event.maniac_wake,
			ManiacKillEnd: phrases.constants.event.maniac_sleep,
			LastMorning: ''
		};

		result.game.descriptionPanelOptions = {
			show_vote: {
				0: {id: 'yesShowVote', title: phrases.constants.panel.yes_show_vote},
				1: {id: 'noShowVote', title: phrases.constants.panel.no_show_vote}
			},
			show_check_result: {
				0: {id: 'yesShowCheckResult', title: phrases.constants.panel.yes_show_check_result},
				1: {id: 'noShowCheckResult', title: phrases.constants.panel.no_show_check_result}
			},
			free_talk: {
				0: {id: 'yesTalk', title: phrases.constants.panel.yes_talk},
				1: {id: 'noTalk', title: phrases.constants.panel.no_talk}
			},
			only_first_night: {
				0: {id: 'noOnlyFirstNight', title: phrases.constants.panel.mafia_talk_all_night},
				1: {id: 'yesOnlyFirstNight', title: phrases.constants.panel.mafia_talk_first_night}
			},
			show_role_killed: {
				0: {id: 'yesShowRole', title: phrases.constants.panel.show_role},
				1: {id: 'noShowRole', title: phrases.constants.panel.no_show_role}
			},
			show_role_prisoned: {
				0: {id: 'yesRolePrisoned', title: phrases.constants.panel.show_role_prisoned},
				1: {id: 'noRolePrisoned', title: phrases.constants.panel.not_show_role_prisoned}
			},
			dead_last_talk: {
				0: {id: 'yesDeadLastTalk', title: phrases.constants.panel.last_talk_deaded},
				1: {id: 'noDeadLastTalk', title: phrases.constants.panel.not_last_talk_deaded}
			},
			has_leading: {
				1: {id: 'leading', title: 'Игра с ведущим'}
			},
			classic_vote: {
				0: {id: 'noClassicVote', title: 'Не классическое голосование'},
				1: {id: 'classicVote', title: 'Классическое голосование'}
			},
			mute: {
				0: {id: 'noMute', title: 'Договорка со звуком'},
				1: {id: 'mute', title: 'Договорка без звука'}
			}
		};


		function descriptionPeriod(num) {
			if (!num) {
				return phrases.constants.period.start;
			} else {
				if (num % 2) {
					return _.template(phrases.constants.period.night)({num: (num + 1) / 2});
				} else {
					return _.template(phrases.constants.period.day)({num: num / 2});
				}
			}
		}

		result.game.descriptionPeriod = descriptionPeriod;

		var newsPaperData = {};
		newsPaperData[result.game.typeEvents.MAFIA_KILL] = [
			{
				title: phrases.constants.newspaper.mafia_miss,
				text: phrases.constants.newspaper.mafia_miss_text,
				className: 'firstNews clearfix imgfr',
				img: 'mafia_no_kill.jpg'
			},
			{
				title: phrases.constants.newspaper.mafia_kill,
				text:  phrases.constants.newspaper.mafia_kill_text,
				className: 'firstNews clearfix imgfr',
				img: 'mafia_kill.jpg'
			}
		];
		newsPaperData[result.game.typeEvents.COMMISSAR_CHECK] = [
			{
				title: phrases.constants.newspaper.commissar_miss,
				text: phrases.constants.newspaper.commissar_miss_text,
				className: 'lastNews fl',
				img: 'no_found.png'
			},
			{
				title: phrases.constants.newspaper.commissar_check_mafia,
				text:  phrases.constants.newspaper.commissar_check_mafia_text,
				className: 'lastNews fl',
				img:  'found_mafia.png'
			}
		];
		newsPaperData[result.game.typeEvents.MAFIA_CHECK] = [
			{
				title: phrases.constants.newspaper.mafia_check_fail,
				text: phrases.constants.newspaper.mafia_check_fail_text,
				className: 'lastNews fr',
				img: 'no_found.png'
			},
			{
				title: phrases.constants.newspaper.mafia_check,
				text: phrases.constants.newspaper.mafia_check_text,
				className: 'lastNews fr',
				img: 'found_commissar.png'
			}
		];
		newsPaperData[result.game.typeEvents.MANIAC_KILL] = [
			{
				title: phrases.constants.newspaper.maniac_check_fail,
				text: phrases.constants.newspaper.maniac_check_fail_text,
				className: 'firstNews clearfix imgfl',
				img: 'maniac_no_kill.jpg'
			},
			{
				title: phrases.constants.newspaper.maniac_check,
				text: phrases.constants.newspaper.maniac_check_text,
				className: 'firstNews clearfix imgfl',
				img: 'maniac_kill.jpg'
			}
		];
		newsPaperData[result.game.typeEvents.DOCTOR_HEAL] = [
			{
				title: phrases.constants.newspaper.doctor_heal_fail,
				text: phrases.constants.newspaper.doctor_heal_fail_text,
				className: 'firstNews clearfix',
				img: false
			},
			{
				title: phrases.constants.newspaper.doctor_heal,
				text: phrases.constants.newspaper.doctor_heal_text,
				className: 'firstNews clearfix',
				img: false
			}
		];
		result.game.newspaperData = newsPaperData;
		return result;
	});
