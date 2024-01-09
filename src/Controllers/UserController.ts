import SocketController from "./SocketController";
import VideoController from "./VideoController";

export default class Synchronizer {
	// message: Message; // TODO: Object Pool
	socketWrapper: SocketController;
	videoWrapper: VideoController;
	constructor(
		socketWrapper: SocketController,
		videoWrapper: VideoController
	) {
		this.socketWrapper = socketWrapper;
		this.videoWrapper = videoWrapper;
		function sendState(props: ISnapshotProperties = {}) {
			let state = getState(props); // TODO: Is object destructuring even relevant at this point?
			debug(state);
			socket.send(
				Message.stringify(
					new Message(userName, state, MessageType.STATE)
				)
			);
		}
		function setState(state: Snapshot) {
			let timestamp = Date.now();
			let latency = timestamp - state.timestamp; // NOTE: Delta-Time of packet sending/arrival in miliseconds
			// TODO: Add video source change; prompt user for filename / automatically redirect video.src?
			if (state.src.includes(":")) {
				// Source is on the web
				if (srcName != state.src) {
					srcName = state.src;
					playVideo.src = state.src;
				}
			} else {
				alert(`Please load the file: ${state.src}`);
			}
			if (state.paused != playVideo.paused) {
				state.paused ? playVideo.pause() : playVideo.play();
			}
			if (Math.abs(playVideo.currentTime - state.currentTime) > MAX_DELTA) {
				playVideo.currentTime = Math.max(
					0,
					Math.min(
						duration,
						state.currentTime + (state.paused ? 0 : latency / 1000)
					)
				); // NOTE: Clamp(0 < time < duration); latency in miliseconds, currentTime in seconds
			}
		}
	}
}
