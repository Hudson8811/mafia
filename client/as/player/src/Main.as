package {

import flash.display.Sprite;
import flash.display.StageAlign;
import flash.display.StageScaleMode;
import flash.events.Event;
import flash.events.MouseEvent;
import flash.events.NetStatusEvent;
import flash.external.ExternalInterface;
import flash.geom.Rectangle;
import flash.media.SoundCodec;
import flash.media.Video;
import flash.net.NetConnection;
import flash.net.NetStream;
import flash.media.SoundTransform;
import flash.system.Security;


[SWF(frameRate="4", backgroundColor="0x000000")]
public class Main extends Sprite {
	private var connection:NetConnection;
	private var stream:NetStream;
	private var video:Video;
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

		Security.allowDomain('*');
		this.stage.align = StageAlign.TOP_LEFT;
		this.stage.scaleMode = StageScaleMode.NO_SCALE;

		this.video = new Video();
		this.stage.addEventListener(Event.RESIZE, this.resizeVideo);
		this.resizeVideo(null);

		this.addChild(this.video);
		this.initExternalInterface();
		if (this.flashVars.initCallback != null) {
			ExternalInterface.call(this.flashVars.initCallback);
		}
	}

	private function resizeVideo(event:Event):void {
		this.video.width = this.stage.stageWidth;
		this.video.height = this.stage.stageHeight;
	}

	private function initExternalInterface():void {
		if (ExternalInterface.available) {
			ExternalInterface.addCallback("Connect", this.Connect);
			ExternalInterface.addCallback("Capture", this.Capture);
			ExternalInterface.addCallback("PlayVideo", this.PlayVideo);
			ExternalInterface.addCallback("PauseVideo", this.PauseVideo);
			ExternalInterface.addCallback("PlaySound", this.PlaySound);
			ExternalInterface.addCallback("PauseSound", this.PauseSound);
			ExternalInterface.addCallback("Close", this.Close);
		}
	}

	private function Connect(url:String, callback:String):void {
		this.connection = new NetConnection();
		var self:Main = this;
		url = 'rtmp://' + url + '/';
		this.connection.addEventListener(NetStatusEvent.NET_STATUS, function (event:NetStatusEvent):void {
			self.log(event.info.code);
			if (event.info.code == "NetConnection.Connect.Success") {
				self.InitStream();
				ExternalInterface.call(callback);
			} else if (event.info.code == "NetConnection.Connect.Closed") {
				self.connection.connect(url);
				self.log('reconnection');
			} else {
				self.error(event.info.code);
			}
		});
		this.connection.client = {};
		this.connection.connect(url);
	}

	private function InitStream():void {
		this.stream = new NetStream(this.connection);
		var self:Main = this;

		this.stream.addEventListener(NetStatusEvent.NET_STATUS, function (event:NetStatusEvent):void {
			var message:String = 'netStream event' + event.info.code;
			self.log(message);
		});

		var soundTransform:SoundTransform = new SoundTransform(1);
		this.stream.soundTransform = soundTransform;

		this.stream.bufferTime = 0;
		this.stream.maxPauseBufferTime = 0;
		this.stream.useJitterBuffer = true;
		this.stream.client = {};
		this.video.attachNetStream(this.stream);
	}

	public function Capture(url:String, callback:String):void {
		if (this.hasStream()) {
			this.stream.close();
			this.stream.play(url, -1, -1);
			this.PauseSound();
			this.PauseVideo();
			ExternalInterface.call(callback);
		}
	}

	public function Close():void {
		if (this.hasStream()) {
			this.stream.dispose();
		}
	}

	public function PlayVideo():void {
		this.video.visible = true;
	}

	private function PauseVideo():void {
		this.video.visible = false;
	}

	public function PauseSound():void {
		if (this.hasStream()) {
			var soundTransform:SoundTransform = this.stream.soundTransform;
			soundTransform.volume = 0;
			this.stream.soundTransform = soundTransform;
		}
	}

	public function PlaySound():void {
		if (this.hasStream()) {
			var soundTransform:SoundTransform = this.stream.soundTransform;
			soundTransform.volume = 1;
			this.stream.soundTransform = soundTransform;
		}
	}

	private function hasStream():Boolean {
		if (!this.stream) {
			this.error('stream not defined');
		}
		return !!this.stream;
	}

	private function error(message:String):void {
		ExternalInterface.call('console.log', '[player] [error]', message);
	}

	private function log(message:String):void {
		if (flashVars.debug){
			ExternalInterface.call('console.log', '[player]', message);
		}
	}
}
}
