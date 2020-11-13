define(['underscore', 'jquery'],
	function (_, $) {
		var $_data;
		return {
			init: function(data, money){
				var self = this;
				var places = _.map(data, function(el, index){
					return {item:index, bought: el, money: money};
				});
				$_data = $(_.template($('#buyPlaceTemplate').html())({places: places}));
				$_data.find('a').on('click', function(){
					$(self).trigger('buy', { item: $(this).parents('.byPlaceItem').data('item') });
					return false;
				});
			},
			getData: function(){
				return $_data;
			},
			setStatus: function(item, status){
				$_data.find('[data-item='+item+']').removeClass('byFree byLock').addClass(status?'byLock':'byFree')
			}
		}
	}
);
