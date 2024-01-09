import type SocketController from "./SocketController";

export default class ChatController {
	chatArea: HTMLElement;
	textInput: HTMLInputElement;
	sendButton: HTMLButtonElement;
	socketController: SocketController;
	constructor(
		chatArea: HTMLElement,
		textInput: HTMLInputElement,
		sendButton: HTMLButtonElement,
		socketController: SocketController
	) {
		this.chatArea = chatArea;
		this.textInput = textInput;
		this.sendButton = sendButton;
		this.socketController = socketController;
		textInput.addEventListener("keydown", this.handleInputKeyDown);
		sendButton.addEventListener("click", this.handleSendClick);
	}
	//#region Methods
	log(object: any) {
		let element = document.createElement("p");
		let stringify = JSON.stringify(object);
		// NOTE: Scroll to bottom *if* was at bottom before append.
		let isScrolledToBottom: boolean =
			Math.ceil(this.chatArea.scrollTop) + this.chatArea.offsetHeight >=
			this.chatArea.scrollHeight;
		element.textContent = stringify.substring(1, stringify.length - 1); // NOTE: Removes quotation marks
		this.chatArea.appendChild(element);
		if (isScrolledToBottom) {
			element.scrollIntoView();
		}
	}
	send() {
		let text = this.textInput.value;
		if (text && text != "") {
			// TODO: CSS :disabled when sendInput.length < 1 ?
			// TODO: IMPLEMENT.
			// socket.send(
			// 	Message.stringify(
			// 		new Message(userName, message, MessageType.CHAT)
			// 	)
			// );
			this.textInput.value = ""; // NOTE: == null, // SEE: sendInput "blur" event
		}
	}
	//#endregion
	//#region Handlers
	handleSendClick() {
		this.send();
	}
	handleInputKeyDown(event: KeyboardEvent) {
		// Send the message on Enter, if pressed without Shift. (Shift+Enter = newline)
		if (event.code == "Enter") {
			if (!event.shiftKey) {
				// NOTE: || e.key == "Enter"
				event.preventDefault();
				this.send();
			}
		}
	}
	//#endregion
}