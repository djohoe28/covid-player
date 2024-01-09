export type SocketEvent = "open" | "error" | "close" | "message";

export default class SocketController {
    socket: WebSocket;
    username: string;
    constructor(address: string) {
        this.username = "User#-1";
        this.socket = new WebSocket(address);
		this.socket.addEventListener("open", SocketController.handleSocketOpen);
		this.socket.addEventListener("error", SocketController.handleSocketError);
		this.socket.addEventListener("close", SocketController.handleSocketClose);
		this.socket.addEventListener("message", SocketController.handleSocketMessage);
    }
	log(obj: Object) {
		console.log(obj);
	}
    //#region Handlers
    static handleSocketOpen(event: Event) {
		console.log(event);
	}
	static handleSocketClose(event: CloseEvent) {
		console.log(event);
	}
	static handleSocketError(event: Event) {
		console.log(event);
	}
	static handleSocketMessage(event: MessageEvent) {
        console.log(event);
	}
    //#endregion
}