import User, { type ChatElements, type Elements, type VideoElements } from "../modules/User";
const WS_ADDRESS = `${location.protocol.includes("https") ? 'wss:' : 'ws:'}//${location.host}`;

/**
 * TODO: Deprecation notice from Google Chrome:
 * The Expect-CT header is deprecated and will be removed. Chrome requires Certificate Transparency for all publicly trusted certificates issued after April 30, 2018.
 * 1 source - localhost/:0
 * Learn more: Check the feature status page for more details. = https://chromestatus.com/feature/6244547273687040
 * Learn more: This change will go into effect with milestone 107. = https://chromiumdash.appspot.com/schedule
 */
const playVideo = document.getElementById("playVideo") as HTMLVideoElement;
const playSource = document.getElementById("playSource") as HTMLSourceElement;
const pauseButton = document.getElementById("pauseButton") as HTMLButtonElement;
const volumeInput = document.getElementById("volumeInput") as HTMLInputElement;
const timeInput = document.getElementById("timeInput") as HTMLInputElement;
const loadText = document.getElementById("loadText") as HTMLButtonElement;
const loadFile = document.getElementById("loadFile") as HTMLInputElement;
const durationText = document.getElementById("durationText") as HTMLSpanElement;
const currentTimeText = document.getElementById("currentTimeText") as HTMLSpanElement;
const chatArea = document.getElementById("chatArea") as HTMLTextAreaElement;
const sendInput = document.getElementById("sendInput") as HTMLInputElement;
const sendButton = document.getElementById("sendButton") as HTMLButtonElement;
const blockerVideo = document.getElementById("blockerVideo") as HTMLDivElement;
const blockerLoad = document.getElementById("blockerLoad") as HTMLDivElement;
// TODO: Hard-coded because duration label doesn't initialize correctly; see: playVideo durationchange

// TODO: de-modulate?
const socket: WebSocket = new WebSocket(WS_ADDRESS);
const videoElements: VideoElements = {
	video: playVideo,
	source: playSource,
	togglePauseButton: pauseButton,
	volumeInput: volumeInput,
	timeInput: timeInput,
	loadText: loadText,
	loadFile: loadFile,
	durationText: durationText,
	currentTimeText: currentTimeText,
	videoBlocker: blockerVideo,
	controlBlocker: blockerLoad
}
const chatElements: ChatElements = {
	area: chatArea,
	input: sendInput,
	button: sendButton,
}
const elements: Elements = {
	video: videoElements,
	chat: chatElements
}
const user: User = new User(socket, elements);
// TODO: BunFile not assignable to File // SEE: https://github.com/oven-sh/bun/issues/5980
// setVideoSourceFromFile(Bun.file("./short.mp4"));
// TODO: socket2 is for development purposes only; disable on production build.
// setTimeout(()=>{
// 	const socket2 = getNewSocket();
//     exports.socket2 = socket2;
// }, 1000);

exports = { user: user, WebSocket: WebSocket };

// const DEBUG = false;
// const MAX_DELTA = 0; // Threshold for video time difference (in seconds)
// const socket = getNewSocket();
// var userName: string = `User#-1`;
// var duration: number = 30; // TODO: Probably not relevant anymore.
// var isVideoInteracted: boolean = false;
// var srcName: string = `https://samples.tdarr.io/api/v1/samples/sample__240__libvpx-vp9__aac__30s__video.mkv`;

// function toHhMmSs(seconds: number) {
// 	// TODO: Come up with more permanent / performant solution?
// 	return new Date(seconds * 1000).toISOString().slice(11, 19);
// }

// function log(object: any) {
// 	let element = document.createElement("p");
// 	let stringify = JSON.stringify(object);
// 	// NOTE: Scroll to bottom *if* was at bottom before append.
// 	let isScrolledToBottom: boolean = Math.ceil(chatArea.scrollTop) + chatArea.offsetHeight >= chatArea.scrollHeight;
// 	element.textContent = stringify.substring(1, stringify.length - 1); // NOTE: Removes quotation marks
// 	chatArea?.appendChild(element);
// 	if(isScrolledToBottom) {
// 		element.scrollIntoView();
// 	}
// }

// function debug(object: any) {
// 	if (DEBUG) {
// 		console.log(object);
// 	}
// }

// function getState({ paused = playVideo.paused, currentTime = playVideo.currentTime, src = srcName, timestamp = Date.now() }: IStateProperties): State {
// 	// TODO: Make sure object destructuring works as intended.
// 	return new State({
// 		paused: paused,
// 		currentTime: currentTime,
// 		timestamp: timestamp,
// 		src: src,
// 		sender: userName
// 	});
// }

// function sendState(props: IStateProperties = {}) {
// 	let state = getState(props); // TODO: Is object destructuring even relevant at this point?
// 	debug(state);
// 	sendMessage(new StateMessage(userName, state));
// }

// function setState(state: State) {
// 	let timestamp = Date.now();
// 	let latency = timestamp - state.timestamp; // NOTE: Delta-Time of packet sending/arrival in miliseconds
// 	// TODO: Add video source change; prompt user for filename / automatically redirect video.src?
// 	if (state.src.includes(":")) {
// 		// Source is on the web
// 		if (srcName != state.src) {
// 			srcName = state.src;
// 			playVideo.src = state.src;
// 		}
// 	} else {
// 		alert(`Please load the file: ${state.src}`);
// 	}
// 	if (state.paused != playVideo.paused) {
// 		state.paused ? playVideo.pause() : playVideo.play();
// 	}
// 	if (Math.abs(playVideo.currentTime - state.currentTime) > MAX_DELTA) {
// 		playVideo.currentTime = Math.max(
// 			0,
// 			Math.min(duration, state.currentTime + (state.paused ? 0 : (latency / 1000)))
// 		); // NOTE: Clamp(0 < time < duration); latency in miliseconds, currentTime in seconds
// 	}
// }

// function currySocketOpen(_ws: WebSocket) {
// 	return function handleSocketOpen(event: Event) {
// 		// log(`Open type = ${event.type}`);
// 		// TODO: Block chat until socket open?
// 		debug(event);
// 	};
// }

// function currySocketClose(_ws: WebSocket) {
// 	return function handleSocketClose(event: CloseEvent) {
// 		// log(`Closure success = ${event.wasClean}`);
// 		debug(event);
// 	};
// }

// function currySocketError(_ws: WebSocket) {
// 	return function handleSocketError(event: Event | ErrorEvent) {
// 		// TODO: socket.onerror: Event
// 		log(`Error: type = ${event.type}`);
// 		debug(event);
// 		// ws.send("Error!")
// 	};
// }

// function currySocketMessage(_ws: WebSocket) {
// 	return function handleSocketMessage(event: MessageEvent) {
// 		let message: Message = JSON.parse(event.data) as Message;
// 		switch (message.messageType) {
// 			case MessageType.OPEN:
// 				log(`${message.content} has entered the chat!`);
// 				break;
// 			case MessageType.CLOSE:
// 				log(`${message.content} has left the chat!`);
// 				break;
// 			case MessageType.ASSIGN:
// 				userName = message.content;
// 				log(`Your ID: ${userName}`);
// 				break;
// 			case MessageType.CHAT:
// 				// message = message as TextMessage;
// 				log(`${message.senderName ?? message.senderId} @ ${message.timestamp} = ${message.content}`)
// 				// TODO: >>>>> HERE NUMBNUTS <<<<<
// 				break;
// 			case MessageType.VIDEO:
// 				let state = JSON.parse(message.content) as State;
// 				console.log("VVVVVVVVVVVVVVVVVV");
// 				console.log(state);
// 				setState(state);
// 				console.log("^^^^^^^^^^^^^^^^^^")
// 				break;
// 		}
// 	};
// }

// function setVideoSourceFromFile(file: File) {
// 	let url = URL.createObjectURL(file);
// 	playSource.src = url;
// 	playVideo.load();
// 	srcName = file.name;
// 	sendState();
// }

// loadFile.addEventListener("input", () => {
// 	/**
// 	 * lastModified: 1703012842204
// 	 * lastModifiedDate: Tue Dec 19 2023 21:07:22 GMT+0200 (Israel Standard Time) {}
// 	 * name: "Mori Calliope - Twitter Status 1693647928030875968 - 2023_08_21_18_35_00.mp4"
// 	 * size: 10572793
// 	 * type: "video/mp4"
// 	 * webkitRelativePath: ""
// 	 */
// 	// TODO: How to identify video? Enforce identity? Unequal files =/= Unequal content.
// 	if (!loadFile.files || !loadFile.files[0]) return;
// 	setVideoSourceFromFile(loadFile.files[0])
// });

// function getNewSocket(address: string = WS_ADDRESS) {
// 	let ws = new WebSocket(address);
// 	ws.addEventListener("open", currySocketOpen(ws));
// 	ws.addEventListener("close", currySocketClose(ws));
// 	ws.addEventListener("error", currySocketError(ws));
// 	ws.addEventListener("message", currySocketMessage(ws));
// 	return ws;
// }

// function sendMessage(message: Message) {
// 	socket.send(message.stringify());
// }

// function sendChatMessage() {
// 	if (sendInput.value && sendInput.value != "") {
// 		// TODO: CSS :disabled when sendInput.length < 1 ?
// 		let message = sendInput.value;
// 		if (!message || message == "") {
// 			return;
// 		}
// 		sendMessage(new TextMessage(userName, message));
// 		sendInput.value = ""; // NOTE: == null, see: sendInput "blur" event
// 	}
// };

// sendButton.addEventListener("click", sendChatMessage);

// sendInput.addEventListener("keydown", (e: KeyboardEvent) => {
// 	// Send the message on Enter, if pressed without Shift. (Shift+Enter = newline)
// 	if (e.code == "Enter") { // NOTE: || e.key == "Enter"
// 		if (!e.shiftKey) { e.preventDefault(); sendChatMessage(); }
// 	}
// });

// playVideo.addEventListener("durationchange", () => {
// 	// Video duration changed
// 	duration = playVideo.duration;
// 	timeInput.max = duration.toString();
// 	timeInput.step = (duration / 100).toString();
// 	durationText.innerHTML = toHhMmSs(duration);
// });

// playVideo.addEventListener("timeupdate", () => {
// 	// Video is playing
// 	timeInput.value = playVideo.currentTime.toString();
// 	currentTimeText.innerHTML = toHhMmSs(playVideo.currentTime);
// });

// function togglePause() {
// 	// Play/Pause toggled
// 	let pause = !playVideo.paused;
// 	pause ? playVideo.pause() : playVideo.play();
// 	sendState({paused: pause});
// }

// pauseButton.addEventListener("click", togglePause);
// playVideo.addEventListener("click", () => {
// 	// TODO: This workaround also disables the control buttons.
// 	/**
// 	 * Uncaught (in promise) DOMException:
// 	 * play() failed because the user didn't interact with the document first.
// 	 * https://goo.gl/xX8pDD
// 	 */
// 	if (isVideoInteracted) {
// 		togglePause();
// 	} else {
// 		// TODO: Wait until video loads to remove box?
// 		blockerVideo.style.display = "none";
// 		blockerLoad.style.display = "none";
// 		playVideo.src = srcName;
// 		isVideoInteracted = true;
// 	}
// });

// volumeInput.addEventListener("input", () => {
// 	// Volume input
// 	playVideo.volume = parseFloat(volumeInput.value) / 100;
// });

// timeInput.addEventListener("input", () => {
// 	// currentTime input
// 	// TODO: Doesn't work with locally loaded file -- why? Set source as file from JS? Requires BunFile...
// 	playVideo.currentTime = parseFloat(timeInput.value);
// 	console.log("AAAAAAAAAAAAAAAAA");
// 	sendState({ currentTime: parseFloat(timeInput.value) });
// 	console.log("BBBBBBBBBBBBBBBBB");
// });

// loadText.addEventListener("click", () => {
// 	// Load video link
// 	let url = prompt("Enter video source address:");
// 	if (!url || url == "") return;
// 	playSource.src = url;
// 	playVideo.load();
// 	srcName = url;
// 	sendState();
// });