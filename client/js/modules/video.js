define(['underscore', 'jquery'], function(_, $){
	var $source;
	var video;
	var list = nightVideo;
	var currentVideo;

	var setNextVideo = function(){
		var i = _.indexOf(list, currentVideo);
		setCurrentVideo((list[++i])?list[i]:list[0]);
	};

	var setCurrentVideo = function(video){
		currentVideo = video;
		$source.attr('src', currentVideo);
	};

	return {
		init: function(){
			video  = $('<video/>', {width:"100%", height:"auto"})[0];
			$source =  $('<source/>', {type:'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'});
			setCurrentVideo(list[0]);
			$(video).append($source);
			video.addEventListener('ended', function(){
				setNextVideo();
				video.load();
				video.play();
			});
		},
		element: function(){
			return video;
		},
		pause: function(){
			video.pause();
		},
		play: function(){
			video.play();
		},
		volume: function(vol){
			video.volume = vol;
		},
		mute: function(val){
			$(video).prop('muted', val);
		}
	}
});
