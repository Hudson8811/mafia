define(['jquery'],
	function ($) {
        var getWindowSize = function(num, panelPadding) {
            var originWidth = 320;
            var minWidth = 220;
            var originHeight = 240;
            var widthPadding = 12;
            var heightPadding = 12;

            var width = $('.allVideoContainer').width();
            var height = $(window).height() - panelPadding;

            var withDiff = (originWidth - minWidth);
            for (var step = 0; step <= withDiff/4;  step = step + 1) {
                var newWidth = originWidth - step*4;
                var newHeight = originHeight - step*3;

                var column = Math.floor( width / (newWidth + widthPadding*2) );
                var row = Math.floor( height / (newHeight + heightPadding*2) );

                if (column * row >= num) {
                    break;
                }
            }

            return {
                width: newWidth,
                height: newHeight
            };
        };

        return {
            getWindowSize: getWindowSize
        };
	}
);
