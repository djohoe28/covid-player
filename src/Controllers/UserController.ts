import ChatController from "./ChatController";
import SocketController from "./SocketController";
import VideoController from "./VideoController";

export default class Synchronizer {
	// message: Message; // TODO: Object Pool
	socketController: SocketController;
	videoController: VideoController;
	chatController: ChatController;
	constructor(
		socketController: SocketController,
		videoController: VideoController,
		chatController: ChatController
	) {
		this.socketController = socketController;
		this.videoController = videoController;
		this.chatController = chatController;
	}
}
