define(
	['underscore', 'modules/render', 'modules/constants'],
	function (_, render, constants) {
		return function (id, game) {
			var _id = id ? parseInt(id) : 0;
			var _username;
			var _video;
			var _status;
			var _player;
			var _role;
			var _socketId;
			var _num;
			var _timeEscaping;
			var _name;
			var _profileUrl;
			var _choosen;
			var _window;
			var _fouls = 0;

			return {
				game: game,
				getId: function () {
					return _id;
				},
				setId: function (id) {
					_id = parseInt(id);
					return this;
				},
				setUsername: function (username) {
					_username = username;
					return this;
				},
				getUsername: function () {
					return _username;
				},
				setVideo: function (video) {
					_video = video;
					return this;
				},
				getVideo: function () {
					return _video;
				},
				setFouls: function(num){
					num = parseInt(num);
					var increment = (num > this.getFouls());
					_fouls = num;
					$(this).trigger('fouls', increment);
					return this;
				},
				getFouls: function(){
					return _fouls;
				},
				setStatus: function (status, role) {
					if (role) {
						this.setRole(parseInt(role));
					}
					_status = status;
					$(this).trigger('statusChange', this);

					return this;
				},
				getStatus: function () {
					return _status;
				},
				setPlayer: function (player) {
					_player = player;
					return this;
				},
				getPlayer: function () {
					return _player;
				},
				setRole: function (role) {
					_role = role;
					$(this).trigger('roleChange', this);
					return this;
				},
				getRole: function () {
					return _role;
				},
				isLeading: function () {
					return this.getRole() == constants.user.roles.LEADING;
				},
				isMafia: function () {
					return _.contains([constants.user.roles.MAFIA, constants.user.roles.MAFIA_BOSS], this.getRole());
				},
				isMafiaBoss: function () {
					return this.getRole() == constants.user.roles.MAFIA_BOSS;
				},
				isCommissar: function () {
					return this.getRole() == constants.user.roles.COMMISSAR;
				},
				isDoctor: function(){
					return this.getRole() == constants.user.roles.DOCTOR;
				},
				isWhore: function(){
					return this.getRole() == constants.user.roles.WHORE;
				},
				isManiac: function(){
					return this.getRole() == constants.user.roles.MANIAC;
				},
				setSocketId: function (socketId) {
					_socketId = socketId;
					$(this).trigger('socketChange', this);
					return this;
				},
				getSocketId: function () {
					return _socketId;
				},
				getNumber: function () {
					return _num;
				},
				setNumber: function (num) {
					_num = num;
					return this;
				},
				setProfileUrl: function (profileUrl) {
					_profileUrl = profileUrl;
					return this;
				},
				getProfileUrl: function () {
					return _profileUrl;
				},
				setTimeEscaping: function (time) {
					_timeEscaping = parseInt(time);
					return this;
				},
				getTimeEscaping: function () {
					return _timeEscaping;
				},
				setName: function (name) {
					_name = name;
					return this;
				},
				getName: function () {
					return _name;
				},
				getWindow: function () {
					return _window;
				},
				setWindow: function (window) {
					_window = window;
					return this;
				},
				updateUserData: function(user){

					var status = parseInt(user.status);
					if (this.getStatus() != parseInt(status)){
						this.setStatus(status);
					}

					if (this.getSocketId() != user.socketId){
						this.setSocketId(user.socketId);
					}
					if (this.getRole() != user.role){
						this.setRole(user.role);
					}

					if (user.time && this.checkAlive()) {
						this.setTimeEscaping(user.time);
						this.setStatus(constants.user.statuses.ESCAPING);
					}

					var fouls = parseInt(user.fouls);
					if (this.getFouls() != fouls){
						this.setFouls(fouls);
					}

				},
				setInitData: function (user) {
					user.status && this.setStatus(parseInt(user.status));

					this
						.setUsername(user.username)
						.setSocketId(user.socketId)
						.setPlayer(user.player)
						.setProfileUrl(user.profileUrl);

					this.setVideo(user.video);

					user.number && this.setNumber(user.number);
					user.role && this.setRole(user.role);

					if (user.time && this.checkAlive()) {
						this.setTimeEscaping(user.time);
						this.setStatus(constants.user.statuses.ESCAPING);
					}
					user.fouls && this.setFouls(user.fouls);
				},
				setChoose: function(){
					_choosen = true;
					$(this).trigger('chooseSet');
				},
				clearChoose: function(){
					_choosen = false;
					$(this).trigger('chooseClear');
				},
				wasChoosen: function(){
					return _choosen;
				},
				checkAlive: function (strict) {
					var statuses = constants.user.statuses;
					if (strict){
					    return statuses.ALIVE == this.getStatus();
					} else {
					    return _.contains([statuses.ALIVE, statuses.ESCAPING], this.getStatus());
					}
				},
				updateWindow: function () {
					var userWindow = this.getWindow();
					var dummy;
					var statuses = constants.user.statuses;
					var status = this.getStatus();

					switch (status) {
						case statuses.ALIVE:
							dummy = 'alive';
							break;
						case statuses.ESCAPING:
							dummy = 'escaping';
							break;
						case statuses.DEAD:
							dummy = 'dead';
							break;
						case statuses.PRISON:
							dummy = 'prison';
							break;
						case statuses.ESCAPED:
							dummy = 'escaped';
							break;
						case statuses.KICKED:
							dummy = 'kicked';
							break;
					}
					userWindow.setDummy(dummy);
					$(game).trigger('updateWindow', this);
					return this;
				},
				updateWindowStatus: function (force) {
					this.getWindow().setStatus(this.getStatus());

					var showDeaded = (this.getStatus() == constants.user.statuses.DEAD && !this.game.getConfig('show_role_killed'));
					var showPrisoned = (this.getStatus() == constants.user.statuses.PRISON && !this.game.getConfig('show_role_prisoned'));
					if (showDeaded || showPrisoned || force) {
						this.getWindow().setRole(this.getRole());
					} else {
						this.getWindow().setRole();
					}
				}
			};
		};
	}
);
