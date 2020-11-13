define([], function(){
	if (typeof phrases != 'undefined'){
		return phrases;
	} else {
		return {
			check_video:'проверка видео',
			complete_camera:'camers success',
			error_camera_not_founded: 'camera not found',
			error_you_need_allow_camera:'error allow'
		}
	}
});
