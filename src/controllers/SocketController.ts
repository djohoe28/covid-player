import { MessageType } from "@modules/Message";
import Message from "@modules/Message";

export type SocketEvent = "open" | "error" | "close" | "message";

export default class SocketController {
	// message: Message; // TODO: Object Pool
	socket: WebSocket;
	username: string;
	constructor(address: string) {
		this.username = "User#-1";
		this.socket = new WebSocket(address);
		this.socket.addEventListener("open", this.handleSocketOpen);
		this.socket.addEventListener("error", this.handleSocketError);
		this.socket.addEventListener("close", this.handleSocketClose);
		this.socket.addEventListener("message", this.handleSocketMessage);
	}
	//#region Methods
	log(obj: Object) {
		console.log(obj);
	}
	send(data: string, mType: MessageType) {
		// TODO: Simplify? Is Message class necessary?
		this.socket.send(
			Message.stringify(new Message(this.username, data, mType))
		);
	}
	//#endregion
	//#region Handlers
	handleSocketOpen(event: Event) {
		this.log(event);
	}
	handleSocketClose(event: CloseEvent) {
		this.log(event);
	}
	handleSocketError(event: Event) {
		this.log(event);
	}
	handleSocketMessage(event: MessageEvent) {
		this.log(event);
		let message = JSON.parse(event.data) as Message;
		if (message) {
			switch (message.mType) {
				// TODO: handleMessageSnapshot etc.?
				case MessageType.SOCKET_ID:
					this.username = message.data; // TODO: Custom username? Input?
					break;
				default:
					break;
			}
		}
	}
	//#endregion
}
