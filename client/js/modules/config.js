define(['underscore'], function (_) {
	return {
		port: Array.isArray(location.href.match('test')) ? 1489 : 443,
        host: Array.isArray(location.href.match('test')) ? 'ws://' + location.hostname : 'io.' + location.hostname,
		debug: localStorage && localStorage.appDebug,
		slides: function() {
			
			var slideList = [
				{
                    path:	'/client/static/slides/ru/pics/kartiny1/',
					slides: [
                        ['slide_1.jpg', 'slide_2.jpg', 'slide_3.jpg', 'slide_4.jpg', 'slide_5.jpg'],
                        ['slide_6.jpg', 'slide_7.jpg', 'slide_8.jpg', 'slide_9.jpg', 'slide_10.jpg'],
                        ['slide_11.jpg', 'slide_12.jpg', 'slide_13.jpg', 'slide_14.jpg', 'slide_15.jpg'],
                        ['slide_16.jpg', 'slide_17.jpg', 'slide_18.jpg', 'slide_19.jpg', 'slide_20.jpg']
					]
				},
				{
					path:	'/client/static/slides/ru/pics/kartiny2/',
					slides: [
                        ['slide_1.jpg', 'slide_2.jpg', 'slide_3.jpg', 'slide_4.jpg', 'slide_5.jpg'],
                        ['slide_6.jpg', 'slide_7.jpg', 'slide_8.jpg', 'slide_9.jpg', 'slide_10.jpg'],
                        ['slide_11.jpg', 'slide_12.jpg', 'slide_13.jpg', 'slide_14.jpg', 'slide_15.jpg'],
                        ['slide_16.jpg', 'slide_17.jpg', 'slide_18.jpg', 'slide_19.jpg', 'slide_20.jpg']
					]
				},
                {
					path:	'/client/static/slides/ru/pics/kartiny3/',
					slides: [
                        ['slide_1.jpg', 'slide_2.jpg', 'slide_3.jpg', 'slide_4.jpg', 'slide_5.jpg'],
                        ['slide_6.jpg', 'slide_7.jpg', 'slide_8.jpg', 'slide_9.jpg', 'slide_10.jpg'],
                        ['slide_11.jpg', 'slide_12.jpg', 'slide_13.jpg', 'slide_14.jpg', 'slide_15.jpg'],
                        ['slide_16.jpg', 'slide_17.jpg', 'slide_18.jpg', 'slide_19.jpg', 'slide_20.jpg']
					]
				},
                {
					path:	'/client/static/slides/ru/pics/kartiny4/',
					slides: [
                        ['slide_1.jpg', 'slide_2.jpg', 'slide_3.jpg', 'slide_4.jpg', 'slide_5.jpg'],
                        ['slide_6.jpg', 'slide_7.jpg', 'slide_8.jpg', 'slide_9.jpg', 'slide_10.jpg'],
                        ['slide_11.jpg', 'slide_12.jpg', 'slide_13.jpg', 'slide_14.jpg', 'slide_15.jpg'],
                        ['slide_16.jpg', 'slide_17.jpg', 'slide_18.jpg', 'slide_19.jpg', 'slide_20.jpg']
					]
				},
                {
					path:	'/client/static/slides/ru/pics/kartiny5/',
					slides: [
                        ['slide_1.jpg', 'slide_2.jpg', 'slide_3.jpg', 'slide_4.jpg', 'slide_5.jpg'],
                        ['slide_6.jpg', 'slide_7.jpg', 'slide_8.jpg', 'slide_9.jpg', 'slide_10.jpg'],
                        ['slide_11.jpg', 'slide_12.jpg', 'slide_13.jpg', 'slide_14.jpg', 'slide_15.jpg'],
                        ['slide_16.jpg', 'slide_17.jpg', 'slide_18.jpg', 'slide_19.jpg', 'slide_20.jpg']
					]
				},
                {
					path:	'/client/static/slides/ru/pics/kartiny6/',
					slides: [
                        ['slide_1.jpg', 'slide_2.jpg', 'slide_3.jpg', 'slide_4.jpg', 'slide_5.jpg'],
                        ['slide_6.jpg', 'slide_7.jpg', 'slide_8.jpg', 'slide_9.jpg', 'slide_10.jpg'],
                        ['slide_11.jpg', 'slide_12.jpg', 'slide_13.jpg', 'slide_14.jpg', 'slide_15.jpg'],
                        ['slide_16.jpg', 'slide_17.jpg', 'slide_18.jpg', 'slide_19.jpg', 'slide_20.jpg']
					]
				},
                {
					path:	'/client/static/slides/ru/pics/kartiny7/',
					slides: [
                        ['slide_1.jpg', 'slide_2.jpg', 'slide_3.jpg', 'slide_4.jpg', 'slide_5.jpg'],
                        ['slide_6.jpg', 'slide_7.jpg', 'slide_8.jpg', 'slide_9.jpg', 'slide_10.jpg'],
                        ['slide_11.jpg', 'slide_12.jpg', 'slide_13.jpg', 'slide_14.jpg', 'slide_15.jpg'],
                        ['slide_16.jpg', 'slide_17.jpg', 'slide_18.jpg', 'slide_19.jpg', 'slide_20.jpg']
					]
				}
			];

			return _.map(slideList, function(o) {
				return _.map(o.slides, function(oneNightSlides) {
					return _.map(oneNightSlides, function(slide) {
						return o.path + slide;
					})
				});
			});
        }()
	}
});
