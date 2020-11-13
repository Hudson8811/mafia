define(['jquery', 'underscore', 'modules/user', 'modules/constants', 'modules/render'],

	function ($, _, User, constants, render) {
		var _instance;

		var _constructor = function () {
			var _id;
			var _guestId;
			var _title;
			var _count;
			var _startTime;
			var _timeDiff;
			var _periodType;
			var _periodNum;
			var _users = [];
			var _leading;
			var _config = {};
			var _myId;
			var _event;
			var _nextEvent;
			var _nextTime;
			var _currentTime;
			var _viewers = [];
			var _video;
			var _serverUrl;
			var _bet;

			return {
				getId: function () {
					if (!_id) {
						_id = handshakeData.gid;
					}
					return _id;
				},
				setYourSelfVideo: function (video) {
					_video = video;
					return this;
				},
				getYourSelfVideo: function () {
					return _video;
				},
				setServerUrl: function (url) {
					_serverUrl = url;
					return this;
				},
				getServerUrl: function () {
					return _serverUrl;
				},
				setMyId: function (id) {
					_myId = parseInt(id);
					return this;
				},
				getMyId: function () {
					return _myId;
				},
				setMyGuestId: function (id) {
					_guestId = id;
					return this;
				},
				getMyGuestId: function () {
					return _guestId;
				},
				setTitle: function (title) {
					_title = title;
					return this;
				},
				getTitle: function () {
					return _title;
				},
				setCount: function (count) {
					_count = parseInt(count);
					return this;
				},
				getCount: function () {
					return _count;
				},
				setStartTime: function (startTime) {
					_startTime = parseInt(startTime);
					return this;
				},
				getStartTime: function () {
					return _startTime;
				},
				setServerTime: function (serverTime) {
					_timeDiff = (new Date().getTime() - serverTime);
					return this;
				},
				getServerTime: function () {
					return Math.ceil((new Date().getTime() - _timeDiff) / 1000);
				},
				getTimeToStart: function () {
					var time = this.getStartTime() - this.getServerTime();
					if (time < 0) time = 0;
					return time;
				},
				setPeriodNum: function (periodNum) {
					_periodNum = parseInt(periodNum);
					return this;
				},
				getPeriodNum: function () {
					return _periodNum;
				},
				getEvent: function () {
					return _event;
				},
				setEvent: function (event) {
					_event = event;
					return this;
				},
				getNextEvent: function () {
					return _nextEvent;
				},
				setNextEvent: function (event) {
					_nextEvent = event;
					return this;
				},
				setNextTime: function (nextTime) {
					_nextTime = nextTime;
					return this;
				},
				getNextTime: function () {
					return _nextTime;
				},
				setUsers: function (users) {
					_users = users;
					return this;
				},
				getCurrentTime: function () {
					return _currentTime;
				},
				setCurrentTime: function (time) {
					_currentTime = time
					return this;
				},
				addUser: function (user) {
					if (!this.findUserById(user.getId())) {
						_users.push(user);
					}
					return this;
				},
				getViewers: function () {
					return _viewers;
				},
				setViewers: function (viewers) {
					_viewers = viewers;
					return this;
				},
				addViewer: function (viewer) {
					_viewers.push(viewer);
				},
				removeViewer: function (viewer) {
					_viewers = (_.without(_viewers, viewer));
				},
				removeUser: function (user) {
					_users = (_.without(_users, user));
					return this;
				},
				removeAllUsers: function () {
					_users = [];
				},
				findUserById: function (id) {
					return _.find(this.getUsers(), function (el) {
						return el.getId() === parseInt(id);
					});
				},
				findMemberById: function (id) {
					return _.find(this.getMembers(), function (el) {
						return el.getId() === parseInt(id);
					});
				},
				findUserBySocketId: function (socketId) {
					return _.find(this.getUsers(), function (el) {
						return el.getSocketId().toLowerCase() === socketId.toLowerCase();
					});
				},
				findMemberBySocketId: function (socketId) {
					return _.find(this.getMembers(), function (el) {
						return el.getSocketId().toLowerCase() === socketId.toLowerCase();
					});
				},
				findViewerBySocketId: function (socketId) {
					return _.find(this.getViewers(), function (v) {
						return v.getSocketId().toLowerCase() == socketId.toLowerCase();
					});
				},
				findUserByRole: function (role) {
					return _.find(this.getUsers(), function (v) {
						return v.getRole() == role;
					});
				},
				setLeading: function (user) {
					if (user) {
						_leading = user;
					} else {
						_leading = false;
					}
					return this;
				},
				getLeading: function () {
					return _leading;
				},
				getAliveLeading: function(){
					var leading;
					if (_leading && _leading.checkAlive()){
						leading = _leading;
					}
					return leading;
				},
				getUsers: function () {
					return _users;
				},
				getMembers: function () {
					var members = _users;
					if (_leading) {
						members = _.union(members, [_leading]);
					}
					return members;
				},
				getYourSelf: function () {
					return _.find(this.getMembers(), function (el) {
						return el.getId() == this.getMyId()
					}.bind(this));
				},
				getYourSelfViewer: function () {
					return _.find(this.getViewers(), function (el) {
						return el.getSocketId() == this.getMyGuestId();
					}.bind(this));
				},
				getUsersWithoutYourSelf: function () {
					return this.getUsersWithoutUsers([this.getYourSelf()]);
				},
				getUsersWithoutUsers: function(users){
					return _.filter(_users, function(u){
						return !_.contains(users, u);
					});
				},
				getMembersWithoutYourSelf: function () {
					return _.filter(this.getMembers(), function (u) {
						return u.getId() != this.getMyId()
					}.bind(this));
				},
				getAliveUsersWithoutYourSelf: function () {
					return _.filter(this.getUsersWithoutYourSelf(), function (u) {
						return u.checkAlive();
					});
				},
				getAliveUsers: function(){
					return _.filter(this.getUsers(), function(u){
						return u.checkAlive();
					});
				},
				checkYourSelf: function(obj){
					return (obj == this.getYourSelf());
				},
				getRolesList: function () {
					return _roleList;
				},
				setRolesList: function (roles) {
					_roleList = roles;
					return this;
				},
				getBet: function(){
					return _bet;	
				},
				setBet: function(bet){
					_bet = parseInt(bet);
					return this;
				},
				setConfig: function (first, value) {
					if (_.isObject(first)) {
						_config = first;
					} else {
						_config[first] = value;
					}
					return this;
				},
				getConfig: function (name) {
					if (!name) return _config;
					return _config[name];
				},
				setOnlyMe: function (data) {
					var self = this;
					var user = this.getYourSelf();
					user.setRole(parseInt(data.role));

					if (data.mafiaList) {
						_.each(data.mafiaList, function (role, id) {
							var user = self.findUserById(parseInt(id));
							user.setRole(parseInt(role));
						});
					}
					if (data.rolesList) {
						_.each(data.rolesList, function (role, id) {
							var user = self.findUserById(parseInt(id));
							user.setRole(parseInt(role));
						});
					}
				},
				setInitData: function (data) {
					this
						.setServerTime(data.time)
						.setServerUrl(data.game.serverUrl)
						.setTitle(data.game.title)
						.setCount(data.game.count)
						.setBet(data.game.bet)
						.setStartTime(data.game.startTime);

					var conf = {
						show_role_prisoned: parseInt(data.game.show_role_prisoned),
						show_role_killed: parseInt(data.game.show_role_killed),
						show_vote: parseInt(data.game.show_vote),
						free_talk: parseInt(data.game.free_talk),
						show_check_result: parseInt(data.game.show_check_result),
						only_first_night: parseInt(data.game.only_first_night),
						dead_last_talk: parseInt(data.game.dead_last_talk),
						classic_vote: parseInt(data.game.classic_vote),
						hard_classic_vote: parseInt(data.game.hard_classic_vote),
						mute: parseInt(data.game.mute)
					};
					if (data.game.has_leading) {
						conf.has_leading = parseInt(data.game.has_leading);
					}
					this.setConfig(conf);
				},
				getPanelData: function () {
					var result = {
						title: this.getTitle()
					};

					result.configOptions = [];
                    _.each(this.getConfig(), function (e, i) {
                        if (i !== 'hard_classic_vote') {
                            var el = constants.game.descriptionPanelOptions[i][e];
                            if (el) {
                                result.configOptions.push({title: el.title, id: el.id});
                            }
                        }
                    });

					result.roleOptions = [];
					_.each(this.getRolesList(), function (e) {
						var role = constants.user.descriptionRoles[e];
						result.roleOptions.push({title: role.title, id: role.id});
					});
					result.fond = this.getUsers().length*this.getBet();

					return result;
				}
			};
		};

		if (!_instance) {
			_instance = _constructor();
		}

		return _instance;
	}
);
