import ChatController from "@controllers/ChatController";
import SocketController from "@controllers/SocketController";
import VideoController from "@controllers/VideoController";

export default class Synchronizer {
	constructor(
		public socketController: SocketController,
		public videoController: VideoController,
		public chatController: ChatController
	) {
	}
}
