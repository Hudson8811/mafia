define(['jquery'], function ($) {

	return {
		change: function(i){
			var body = $('body');
			var className;

			switch (i) {
				case 'brown':
					className = 'bgBrown';
					break;
				case 'blue':
					className = 'bgBlue';
					break;
				case 'green':
					className = 'bgGreen';
					break;
				case 'photoSet_1':
					className = 'photoSet_1';
					break;
				case 'photoSet_2':
					className = 'photoSet_2';
					break;
				case 'photoSet_3':
					className = 'photoSet_3';
					break;
			}
			body.removeClass('bgBrown bgBlue bgGreen photoSet_1 photoSet_2 photoSet_3').addClass(className);
		}
	}
});
