package {

import flash.display.Sprite;
import flash.display.StageAlign;
import flash.display.StageScaleMode;
import flash.events.Event;
import flash.events.StatusEvent;
import flash.events.NetStatusEvent;
import flash.events.SampleDataEvent;
import flash.external.ExternalInterface;
import flash.media.Camera;
import flash.media.Microphone;
import flash.media.MicrophoneEnhancedMode;
import flash.media.MicrophoneEnhancedOptions;
import flash.media.SoundCodec;
import flash.media.Video;
import flash.net.NetConnection;
import flash.net.NetStream;
import flash.system.Security;
import flash.system.SecurityPanel;
import flash.media.H264Level;
import flash.media.H264Profile;
import flash.media.H264VideoStreamSettings;
import flash.media.SoundCodec;

[SWF(frameRate="4", backgroundColor="0x000000")]
public class Main extends Sprite {
	private var connection:NetConnection;
	private var stream:NetStream;
	private var video:Video;
	private var camera:Camera;
	private var microphone:Microphone;
	private var flashVars:Object;

	public function Main():void {
		if (this.stage)
			this.Init();
		else
			this.addEventListener(Event.ADDED_TO_STAGE, this.Init);
	}

	private function Init(e:Event = null):void {
		this.removeEventListener(Event.ADDED_TO_STAGE, this.Init);
		this.flashVars = this.stage.loaderInfo.parameters;
		Security.allowDomain("*");

		this.stage.align = StageAlign.TOP_LEFT;
		this.stage.scaleMode = StageScaleMode.NO_SCALE;

		this.video = new Video();
		this.stage.addEventListener(Event.RESIZE, this.resizeVideo);
		this.resizeVideo(null);

		this.microphone = this.getMicrophone();
		this.camera = this.getCamera();

		this.video.attachCamera(this.camera);
		this.addChild(this.video);

		this.initExternalInterface();

		if (this.camera == null) {
			ExternalInterface.call(this.flashVars.cameraEvent, 'Camera.NotFounded');
			return;
		}

		if (this.camera.muted) {
			Security.showSettings(SecurityPanel.PRIVACY);
			var self:Main = this;
			this.camera.addEventListener(StatusEvent.STATUS, function (event:StatusEvent):void {
				if (self.flashVars.cameraEvent != null) {
					ExternalInterface.call(self.flashVars.cameraEvent, event.code);
				} else {
					var message:String = 'camera event not determinate' + event.code;
					self.log(message);
				}
			});
		} else {
			ExternalInterface.call(this.flashVars.cameraEvent, 'Camera.UnmutedSave');
		}

		if (this.flashVars.initCallback != null) {
			ExternalInterface.call(this.flashVars.initCallback);
		} else {
			this.error('initCallback not determinate');
		}
	}

	private function getCamera():Camera {

		var camera:Camera = Camera.getCamera();
		camera.setMode(320, 240, 15, false);
		camera.setQuality(0, 90);

		return camera;
	}

	private function getMicrophone():Microphone {
		var microphone:Microphone = Microphone.getEnhancedMicrophone();

		if (microphone) {
			microphone.codec = SoundCodec.SPEEX;

			microphone.setUseEchoSuppression(true);//предотвращение обратной связи
			microphone.framesPerPacket = 1;
			microphone.setSilenceLevel(0, 2000);//отключение микрофона
			microphone.gain = 50;

			var options:MicrophoneEnhancedOptions = new MicrophoneEnhancedOptions();
			options.mode = MicrophoneEnhancedMode.FULL_DUPLEX;
			options.echoPath = 128;
			options.nonLinearProcessing = true;

			microphone.enhancedOptions = options;
			microphone.addEventListener(SampleDataEvent.SAMPLE_DATA, function(event:SampleDataEvent):void{
			});

		} else {
			this.log('Microphone not founded');
		}

		return microphone;
	}

	private function resizeVideo(event:Event):void {
		this.video.width = this.stage.stageWidth;
		this.video.height = this.stage.stageHeight;
	}

	private function initExternalInterface():void {

		if (ExternalInterface.available) {
			ExternalInterface.addCallback("Connect", this.Connect);
			ExternalInterface.addCallback("Publish", this.Publish);
			ExternalInterface.addCallback("PauseVideo", this.PauseVideo);
			ExternalInterface.addCallback("PlayVideo", this.PlayVideo);
			ExternalInterface.addCallback("PauseSound", this.PauseSound);
			ExternalInterface.addCallback("PlaySound", this.PlaySound);
			ExternalInterface.addCallback("Close", this.Close);
			ExternalInterface.addCallback("Settings", this.Settings);
		}
	}

	private function Connect(url:String, callback:String):void {
		this.connection = new NetConnection();
		var self:Main = this;
		url = 'rtmp://' + url + '/';
		this.connection.addEventListener(NetStatusEvent.NET_STATUS, function (event:NetStatusEvent):void {
			var message:String = 'connection status ' + event.info.code;
			self.log(message);
			if (event.info.code == "NetConnection.Connect.Success") {
				self.InitStream();
				ExternalInterface.call(callback);
			} else if (event.info.code == "NetConnection.Connect.Closed") {
				self.connection.connect(url);
			}
		});

		this.connection.client = {};
		this.connection.connect(url);
	}


	private function InitStream():void {

		this.stream = new NetStream(this.connection);
		var h264Settings:H264VideoStreamSettings = new H264VideoStreamSettings();
		h264Settings.setProfileLevel(H264Profile.BASELINE, H264Level.LEVEL_1_2);
		this.stream.videoStreamSettings = h264Settings;
		this.stream.bufferTime = 0;
		this.stream.client = {};
	}
	
	public function Settings():void{
		Security.showSettings(SecurityPanel.CAMERA);
	}

	public function Publish(url:String, callback:String):void {
		if (this.hasStream()) {
			this.PauseSound();
			this.PauseVideo();
			this.stream.publish(url, "live");
			var self:Main = this;
			this.stream.addEventListener(NetStatusEvent.NET_STATUS, function (event:NetStatusEvent):void {
				var message:String = 'netStream status' + event.info.code;
				if (event.info.code == "NetStream.Publish.Start") {
					self.log(message);
					ExternalInterface.call(callback);
				} else {
					self.error(event.info.code);
				}
			});
		}
	}

	public function Close():void {
		if (this.stream) {
			this.stream.dispose();
		}
	}

	public function PauseVideo():void {
		if (this.hasStream()) {
			this.stream.attachCamera(null);
		}
	}

	public function PlayVideo():void {
		if (this.hasStream()) {
			this.stream.attachCamera(this.camera);
		}
	}

	public function PauseSound():void {
		if (this.hasStream()) {
			this.stream.attachAudio(null);
		}
	}

	public function PlaySound():void {
		if (this.hasStream()) {
			this.stream.attachAudio(this.microphone);
		}
	}

	private function hasStream():Boolean {
		if (!this.stream) {
			this.error('stream not defined');
		}
		return !!this.stream;
	}

	private function error(message:String):void {
		ExternalInterface.call('console.log', '[publish] [error]', message);
	}

	private function log(message:String):void {
		if (flashVars.debug){
			ExternalInterface.call('console.log', '[publish]', message);
		}
	}

}
}
