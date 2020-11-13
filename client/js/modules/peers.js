define(['jquery'], function($){
	var peers = [];

	var newPeers = function(users){
		return _.filter(users, function(u){
			return !_.contains(this, u.id);
		}, _.map(peers, function(p){return p.id;}));
	};

	var closedPeers = function(users){
		return _.filter(peers, function(u){
			return !_.contains(this, u.id);
		}, _.map(users, function(p){return p.id;}));
	};

	var getData = function(){
		$.get('/room/getPeers', {}, function(users){
			var add = newPeers(users);
			var close = closedPeers(users);

			_.each(close, function(p){
				peers = _.without(peers, p);
				$(self).trigger('close', p);
			});
			_.each(add, function(p){
				peers.push(p);
				$(self).trigger('add', p);
			});
		}, 'json');
	};

	var self = {
		init: function(){
			var fn = function(){
				getData();
			};
			setInterval(fn, 5000);
			fn();
		}
	};
	return self;
});
