import Message from "../types/Message";
import { MessageType } from "../types/Message";
import State, { type IStateProperties } from "../types/State";
const DEBUG = false;
// TODO: Render automatically redirects to HTTPS; WSS = WS over TLS;
const WS_ADDRESS = `${location.protocol.includes("https") ? 'wss:' : 'ws:'}//${location.host}`;
const MAX_DELTA = 0; // Threshold for video time difference (in seconds)
// TODO: appears like latency - even paused - is ~3sec
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
// TODO: Hard-coded because duration label doesn't initialize correctly; SEE: playVideo durationchange
var userName: string = `User#-1`;
var srcName: string = `https://samples.tdarr.io/api/v1/samples/sample__240__libvpx-vp9__aac__30s__video.mkv`;
var duration: number = 30; // TODO: Probably not relevant anymore.
var isVideoInteracted: boolean = false;

function toHhMmSs(seconds: number) {
	// TODO: Come up with more permanent / performant solution?
	return new Date(seconds * 1000).toISOString().slice(11, 19);
}

function log(object: any) {
	let element = document.createElement("p");
	let stringify = JSON.stringify(object);
	// NOTE: Scroll to bottom *if* was at bottom before append.
	let isScrolledToBottom: boolean = Math.ceil(chatArea.scrollTop) + chatArea.offsetHeight >= chatArea.scrollHeight;
	element.textContent = stringify.substring(1, stringify.length - 1); // NOTE: Removes quotation marks
	chatArea?.appendChild(element);
	if(isScrolledToBottom) {
		element.scrollIntoView();
	}
}

function debug(object: any) {
	if (DEBUG) {
		console.log(object);
	}
}

function currySocketOpen(_ws: WebSocket) {
	return function handleSocketOpen(event: Event) {
		// log(`Open type = ${event.type}`);
		// TODO: Block chat until socket open?
		debug(event);
	};
}

function currySocketClose(_ws: WebSocket) {
	return function handleSocketClose(event: CloseEvent) {
		// log(`Closure success = ${event.wasClean}`);
		debug(event);
	};
}

function currySocketError(_ws: WebSocket) {
	return function handleSocketError(event: Event | ErrorEvent) {
		// TODO: socket.onerror: Event
		log(`Error: type = ${event.type}`);
		debug(event);
		// ws.send("Error!")
	};
}

function currySocketMessage(_ws: WebSocket) {
	return function handleSocketMessage(event: MessageEvent) {
		let message: Message = JSON.parse(event.data) as Message;
		switch (message.mType) {
			case MessageType.SOCKET_OPENED:
				log(`${message.data} has entered the chat!`);
				break;
			case MessageType.SOCKET_CLOSED:
				log(`${message.data} has left the chat!`);
				break;
			case MessageType.SOCKET_ID:
				userName = message.data;
				log(`Your ID: ${userName}`);
				break;
			case MessageType.CHAT:
				message = message as Message;
				log(`${message.sender} @ ${message.timestamp} = ${message.data}`)
				// TODO: >>>>> HERE NUMBNUTS <<<<<
				break;
			case MessageType.STATE:
				message = message as Message;
				console.log("VVVVVVVVVVVVVVVVVV");
				console.log(message);
				setState(message.data);
				console.log("^^^^^^^^^^^^^^^^^^")
				break;
		}
	};
}

function getNewSocket(address: string = WS_ADDRESS) {
	// TODO: Relegate Socket, States, etc. to classes
	// TODO: Add FTP server-client?
	// TODO: Make Server manage synchronization?
	let ws = new WebSocket(address);
	ws.addEventListener("open", currySocketOpen(ws));
	ws.addEventListener("close", currySocketClose(ws));
	ws.addEventListener("error", currySocketError(ws));
	ws.addEventListener("message", currySocketMessage(ws));
	return ws;
}

function getState({ paused = playVideo.paused, currentTime = playVideo.currentTime, src = srcName, timestamp = Date.now() }: IStateProperties): State {
	// TODO: Make sure object destructuring works as intended.
	return new State({
		paused: paused,
		currentTime: currentTime,
		timestamp: timestamp,
		src: src,
		sender: userName
	});
}

function sendState(props: IStateProperties = {}) {
	let state = getState(props); // TODO: Is object destructuring even relevant at this point?
	debug(state);
	socket.send(Message.stringify(new Message(userName, state, MessageType.STATE)));
}

function setState(state: State) {
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
			Math.min(duration, state.currentTime + (state.paused ? 0 : (latency / 1000)))
		); // NOTE: Clamp(0 < time < duration); latency in miliseconds, currentTime in seconds
	}
}

// TODO: Use mitata for benchmarking WSS de/compressed VS uncompressed
// TODO: Also check load times of arrow/anonymous/named functions/handlers etc.
// TODO: Also-also check load times of HTML VS HTML-in-JS. (vis-a-vis Render spin-down)
// SEE: https://bun.sh/docs/project/benchmarking#benchmarking-tools

function sendChatMessage() {
	if (sendInput.value && sendInput.value != "") {
		// TODO: CSS :disabled when sendInput.length < 1 ?
		let message = sendInput.value;
		if (!message || message == "") {
			return;
		}
		socket.send(Message.stringify(new Message(userName, message, MessageType.CHAT)));
		sendInput.value = ""; // NOTE: == null, // SEE: sendInput "blur" event
	}
};

sendButton.addEventListener("click", sendChatMessage);

sendInput.addEventListener("keydown", (e: KeyboardEvent) => {
	// Send the message on Enter, if pressed without Shift. (Shift+Enter = newline)
	if (e.code == "Enter") { // NOTE: || e.key == "Enter"
		if (!e.shiftKey) { e.preventDefault(); sendChatMessage(); }
	}
});

playVideo.addEventListener("durationchange", () => {
	// Video duration changed
	duration = playVideo.duration;
	timeInput.max = duration.toString();
	timeInput.step = (duration / 100).toString();
	durationText.innerHTML = toHhMmSs(duration);
});

playVideo.addEventListener("timeupdate", () => {
	// Video is playing
	timeInput.value = playVideo.currentTime.toString();
	currentTimeText.innerHTML = toHhMmSs(playVideo.currentTime);
});

function togglePause() {
	// Play/Pause toggled
	let pause = !playVideo.paused;
	pause ? playVideo.pause() : playVideo.play();
	sendState({paused: pause});
}

pauseButton.addEventListener("click", togglePause);
playVideo.addEventListener("click", () => {
	// TODO: This workaround also disables the control buttons.
	/**
	 * Uncaught (in promise) DOMException:
	 * play() failed because the user didn't interact with the document first.
	 * https://goo.gl/xX8pDD
	 */
	if (isVideoInteracted) {
		togglePause();
	} else {
		// TODO: Wait until video loads to remove box?
		blockerVideo.style.display = "none";
		blockerLoad.style.display = "none";
		playVideo.src = srcName;
		isVideoInteracted = true;
	}
});

volumeInput.addEventListener("input", () => {
	// Volume input
	playVideo.volume = parseFloat(volumeInput.value) / 100;
});

timeInput.addEventListener("input", () => {
	// currentTime input
	// TODO: Doesn't work with locally loaded file -- why? Set source as file from JS? Requires BunFile...
	playVideo.currentTime = parseFloat(timeInput.value);
	console.log("AAAAAAAAAAAAAAAAA");
	sendState({ currentTime: parseFloat(timeInput.value) });
	console.log("BBBBBBBBBBBBBBBBB");
});

loadText.addEventListener("click", () => {
	// Load video link
	let url = prompt("Enter video source address:");
	if (!url || url == "") return;
	playSource.src = url;
	playVideo.load();
	srcName = url;
	sendState();
});

loadFile.addEventListener("input", () => {
	/**
	 * lastModified: 1703012842204
	 * lastModifiedDate: Tue Dec 19 2023 21:07:22 GMT+0200 (Israel Standard Time) {}
	 * name: "Mori Calliope - Twitter Status 1693647928030875968 - 2023_08_21_18_35_00.mp4"
	 * size: 10572793
	 * type: "video/mp4"
	 * webkitRelativePath: ""
	 */
	// TODO: How to identify video? Enforce identity? Unequal files =/= Unequal content.
	if (!loadFile.files || !loadFile.files[0]) return;
	let file = loadFile.files[0];
	let url = URL.createObjectURL(file);
	playSource.src = url;
	playVideo.load();
	srcName = file.name;
	sendState();
});

// TODO: de-modulate?
const socket = getNewSocket();
// TODO: BunFile not assignable to File // SEE: https://github.com/oven-sh/bun/issues/5980
// TODO: socket2 is for development purposes only; disable on production build.

// options: {
// 	/**
// 	 * Sets the headers when establishing a connection.
// 	 */
// 	headers?: HeadersInit;
//   },

exports = { setState: setState, WebSocket: WebSocket, socket: socket };
