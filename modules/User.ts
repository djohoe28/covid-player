import Sources from "../json/Sources";
import type { Elements } from "../types/Elements";
import { type Message, MessageType } from "../types/Message";
import type { State } from "../types/State";
import { toHhMmSs, clamp } from "./utility";

export default class User {
	id: string = "(me)";
	nickname?: string;
	interacted: boolean = false;
	duration: number = 0;
	epsilon: number = 0.001;
	filename?: string;
	constructor(
		public socket: WebSocket,
		public elements: Elements,
		public state: State = {
			isFile: false,
			src: Sources.SD_04_03,
			paused: true,
			currentTime: 0,
		}
	) {
		// this.duration = elements.video.video.duration;
		this.socket.addEventListener("open", this.handleSocketOpen.bind(this));
		this.socket.addEventListener(
			"close",
			this.handleSocketClose.bind(this)
		);
		this.socket.addEventListener(
			"error",
			this.handleSocketError.bind(this)
		);
		this.socket.addEventListener(
			"message",
			this.handleSocketMessage.bind(this)
		);
		this.elements.video.video.addEventListener(
			"click",
			this.handleVideoClick.bind(this)
		);
		this.elements.video.video.addEventListener(
			"durationchange",
			this.handleVideoDurationChange.bind(this)
		);
		this.elements.video.video.addEventListener(
			"timeupdate",
			this.handleVideoTimeUpdate.bind(this)
		);
		this.elements.video.video.addEventListener(
			"loadeddata",
			this.temp.bind(this)
		);
		this.elements.video.volumeInput.addEventListener(
			"input",
			this.handleVideoVolumeInput.bind(this)
		);
		this.elements.video.togglePauseButton.addEventListener(
			"click",
			this.handleVideoTogglePauseButtonClick.bind(this)
		);
		this.elements.video.timeInput.addEventListener(
			"input",
			this.handleVideoTimeInput.bind(this)
		);
		this.elements.video.loadText.addEventListener(
			"click",
			this.handleVideoLoadTextClick.bind(this)
		);
		this.elements.video.loadFile.addEventListener(
			"input",
			this.handleVideoLoadFileChange.bind(this)
		);
		this.elements.chat.input.addEventListener(
			"keydown",
			this.handleChatInputKeyDown.bind(this)
		);
		this.elements.chat.button.addEventListener(
			"click",
			this.handleChatButtonClick.bind(this)
		);
	}
	temp() {
		this.setPaused(this.state.paused);
	}
	log(object: any) {
		let element = document.createElement("p");
		let stringify = JSON.stringify(object);
		// NOTE: Scroll to bottom *if* was at bottom before append.
		let isScrolledToBottom: boolean =
			Math.ceil(this.elements.chat.area.scrollTop) +
				this.elements.chat.area.offsetHeight >=
			this.elements.chat.area.scrollHeight;
		element.textContent = stringify.substring(1, stringify.length - 1); // NOTE: Removes quotation marks
		this.elements.chat.area?.appendChild(element);
		if (isScrolledToBottom) {
			element.scrollIntoView();
		}
	}
	setSourceFromURL(src: string) {
		// TODO: Implement end-user file loading.
		if (this.state.src == src) {
			return;
		}
		this.state.isFile = false;
		this.state.src = src;
		this.elements.video.video.src = src;
		this.elements.video.video.load();
	}
	setSourceFromFile(file: File) {
		this.state.isFile = true;
		// TODO: Redundant? NUMBNTUS
		this.state.src = file.name;
		this.filename = file.name;
		if (this.elements.video.video.srcObject != file) {
			// SEE: https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static#using_object_urls_for_media_streams
			// if ("srcObject" in this.elements.video.video) {
			// 	this.elements.video.video.srcObject = file;
			// } else {
			// 	// TODO: !("srcObject" in this.elements.video.video): never
			// 	this.elements.video.source.src = URL.createObjectURL(file);
			// }
			this.elements.video.video.src = URL.createObjectURL(file);
			this.elements.video.video.load();
		}
	}
	setPaused(paused: boolean) {
		this.state.paused = paused;
		if (this.elements.video.video.paused !== paused) {
			paused
				? this.elements.video.video.pause()
				: this.elements.video.video.play();
		}
	}
	setCurrentTime(currentTime: number) {
		// TODO: Add source flag?
		console.log(`setCurrentTime(${currentTime})`);
		this.state.currentTime = currentTime;
		this.elements.video.video.currentTime = currentTime;
		this.elements.video.timeInput.value = currentTime.toString();
		this.elements.video.currentTimeText.textContent = toHhMmSs(currentTime);
	}
	setState(state: State, timestamp?: number) {
		if (state.isFile && !(this.state.isFile && this.filename == state.src)) {
			alert(`Please load the video source file: ${state.src}`);
		} else {
			this.setSourceFromURL(state.src);
		}
		this.setPaused(state.paused);
		let currentTime: number = state.currentTime;
		if (timestamp && !state.paused) {
			// TODO: Add epsilon?
			currentTime = clamp(
				currentTime - (Date.now() - timestamp) / 1000,
				0,
				this.duration
			);
		}
		console.log(`setState(${timestamp != undefined}, ${currentTime})`);
		this.setCurrentTime(currentTime);
	}
	setStateFromMessage(message: Message) {
		if (message.messageType !== MessageType.STATE) {
			return;
		}
		this.setState(JSON.parse(message.content) as State, message.timestamp);
	}
	togglePause() {
		this.setPaused(!this.state.paused);
	}
	sendMessage(messageType: MessageType, content: string) {
		let message: Message = {
			senderId: this.id,
			senderName: this.nickname,
			timestamp: Date.now(),
			messageType: messageType,
			content: content,
		};
		this.socket.send(JSON.stringify(message));
	}
	sendVideoMessage() {
		// TODO: Assumes this.state is updated.
		console.error(this.state);
		this.sendMessage(MessageType.STATE, JSON.stringify(this.state));
	}
	sendChatMessage() {
		this.sendMessage(MessageType.TEXT, this.elements.chat.input.value);
		this.elements.chat.input.value = "";
	}
	handleSocketOpen(event: Event) {
		console.info(event);
	}
	handleSocketClose(event: CloseEvent) {
		console.info(event);
	}
	handleSocketError(event: Event | ErrorEvent) {
		console.error(event);
	}
	handleSocketMessage(event: MessageEvent) {
		let message: Message = JSON.parse(event.data) as Message;
		switch (message.messageType) {
			case MessageType.OPEN:
				this.log(`${message.content} has joined`);
				break;
			case MessageType.CLOSE:
				this.log(`${message.content} has left`);
				break;
			case MessageType.ASSIGN:
				this.id = message.content;
				this.log(`Your ID: ${message.content}`);
				break;
			case MessageType.TEXT:
				this.log(
					`${message.senderName ?? message.senderId}: ${
						message.content
					}`
				);
				break;
			case MessageType.STATE:
				if (message.senderId == this.id) {
					return;
				}
				this.setStateFromMessage(message);
				break;
		}
	}
	handleVideoClick(event: MouseEvent) {
		if (!this.interacted) {
			this.interacted = true;
			this.elements.video.videoBlocker.style.display = "none";
			this.elements.video.controlBlocker.style.display = "none";
			return;
		}
		this.togglePause();
		this.sendVideoMessage();
	}
	setDuration(duration: number) {
		this.duration = duration;
		this.elements.video.timeInput.max = duration.toString();
		this.elements.video.timeInput.step = (duration / 100).toString();
		// TODO: Clamp this.elements.timeInput.value?
		this.elements.video.durationText.textContent = toHhMmSs(duration);
	}
	handleVideoDurationChange(event: Event) {
		this.setDuration(this.elements.video.video.duration);
	}
	handleVideoTimeUpdate(event: Event) {
		let currentTime: number = this.elements.video.video.currentTime;
		console.log(`handleVideoTimeUpdate(${event.isTrusted}, ${currentTime})`);
		this.state.currentTime = currentTime;
		this.elements.video.currentTimeText.textContent = toHhMmSs(currentTime);
		// TODO: Disable handleVideoTimeInput?
		if (!event.isTrusted) {
			return;
		}
		this.elements.video.timeInput.value = currentTime.toString();
		// this.sendVideoMessage(); // NOTE: Disabled to avoid traffic overload.
	}
	handleVideoVolumeInput(event: Event) {
		this.elements.video.video.volume =
			parseInt(this.elements.video.volumeInput.value) / 100;
	}
	handleVideoTogglePauseButtonClick(event: MouseEvent) {
		this.togglePause();
		this.sendVideoMessage();
	}
	handleVideoTimeInput(event: Event) {
		// TODO: Disable handleVideoTimeUpdate?
		if (!event.isTrusted) {
			return;
		}
		let currentTime: number = parseFloat(
			this.elements.video.timeInput.value
		);
		console.log(`handleVideoTimeInput(${event.isTrusted}, ${currentTime})`);
		this.state.currentTime = currentTime;
		this.elements.video.video.currentTime = currentTime;
		console.warn(currentTime, this.elements.video.video.currentTime);
		this.sendVideoMessage();
	}
	handleVideoLoadTextClick(event: MouseEvent) {
		let src: string | null = prompt("Enter a video URL", Sources.SD_16_09);
		if (!src) {
			return;
		}
		this.setSourceFromURL(src);
		this.sendVideoMessage();
	}
	handleVideoLoadFileChange(event: Event) {
		let files: FileList | null = this.elements.video.loadFile.files;
		if (!files || !files[0]) {
			return;
		}
		this.elements.video.video.srcObject;
		this.setSourceFromFile(files[0]);
		this.sendVideoMessage();
	}
	handleChatInputKeyDown(event: KeyboardEvent) {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			this.sendChatMessage();
		}
	}
	handleChatButtonClick(event: MouseEvent) {
		this.sendChatMessage();
	}
}
