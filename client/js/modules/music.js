define(['jquery', 'underscore', 'SoundManager'],
    function ($, _, sm) {
        var _soundList = soundList;
        var _currentInstance = null;
        var _volume = 100;

        var createInstance = function (url, autoPlay) {
            return sm.getInstance().createSound({
                volume: _volume,
                url: url,
                autoPlay: autoPlay,
                onfinish: function () {
                    var index = _soundList.indexOf(url) + 1;
                    var next = (index == _soundList.length) ? _soundList[0] : _soundList[index];
                    _currentInstance = createInstance(next, true)
                }
            });
        };

        sm.getInstance().setup({
            preferFlash: false,
            url: './swf/'
        });

        if (_soundList.length) {
            _currentInstance = createInstance(_soundList[0], false);
        }

        return function () {
            return {
                play: function () {
                    if (_currentInstance) {
                        _currentInstance.play();
                    }
                },
                pause: function () {
                    if (_currentInstance) {
                        _currentInstance.pause();
                    }
                },
                resume: function () {
                    if (_currentInstance) {
                        _currentInstance.resume();
                    }
                },
                setVolume: function (v) {
                    if (_currentInstance) {
                        _volume = v * 100;
                        _currentInstance.setVolume(_volume)
                    }
                }
            }
        }();
    });
