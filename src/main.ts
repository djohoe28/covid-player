import type Message from "../types/Message";
import { MessageType } from "../types/Message";
import State, { type IStateProperties } from "../types/State";
import StateMessage from "../types/StateMessage";
import TextMessage from "../types/TextMessage";
const DEBUG = false;
// const NODE_ENV = /* process.env.NODE_ENV  ?? */ "development";
// const IS_DEV_ENV = NODE_ENV == "development";
// const IS_SECURE = location.protocol.includes("https");
// const WS_PROTOCOL = IS_SECURE ? 'wss:' : 'ws:';
// const WS_HOSTNAME = location.host;
// const WS_PORT: number = +(location.port || 8081);
const WS_ADDRESS = `${location.protocol.includes("https") ? 'wss:' : 'ws:'}//${location.host}`;
console.log(WS_ADDRESS);
const MAX_DELTA = 1000; // Threshold for video time difference (in miliseconds)

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
var userName: string = `User#-1`;
var srcName = './short.mp4';

function toHhMmSs(seconds: number) {
	// TODO: Come up with more permanent / performant solution?
	return new Date(seconds * 1000).toISOString().slice(11, 19);
}

function log(object: any) {
	// TODO: Scroll to bottom if was at bottom before append.
	let element = document.createElement("p");
	let stringify = JSON.stringify(object);
	element.textContent = stringify.substring(1, stringify.length - 1);
	chatArea?.appendChild(element);
}

function debug(object: any) {
	if (DEBUG) {
		console.log(object);
	}
}

function currySocketOpen (_ws: WebSocket) {
    return function handleSocketOpen (event: Event) {
        // log(`Open type = ${event.type}`);
        debug(event);
    };
}

function currySocketClose (_ws: WebSocket) {
    return function handleSocketClose (event: CloseEvent) {
        // log(`Closure success = ${event.wasClean}`);
        debug(event);
    };
}

function currySocketError (_ws: WebSocket) {
    return function handleSocketError (event: Event | ErrorEvent) {
        // TODO: socket.onerror: Event
        log(`Error: type = ${event.type}`);
        debug(event);
        // ws.send("Error!")
    };
}

function currySocketMessage (_ws: WebSocket) {
    return function handleSocketMessage (event: MessageEvent) {
		let message: Message = JSON.parse(event.data) as Message;
		switch(message.mType) {
			// case MessageType.MESSAGE:
			// 	console.log("Message");
			// 	console.log(message.data);
			// 	break;
			// case MessageType.LOG_MESSAGE:
			// 	console.log("Log");
			// 	console.log(message.data);
			// 	break;
			case MessageType.OPEN_MESSAGE:
				log(`${message.data} has entered the chat!`);
				break;
			case MessageType.CLOSE_MESSAGE:
				log(`${message.data} has left the chat!`);
				break;
			case MessageType.NAME_MESSAGE:
				userName = message.data;
				log(`Your ID: ${userName}`);
				break;
			case MessageType.TEXT_MESSAGE:
				console.log("Text");
				console.log(message.data);
				message = message as TextMessage;
				log(`${message.sender} @ ${message.timestamp} = ${message.data}`)
				// TODO: >>>>> HERE NUMBNUTS <<<<<
				break;
			case MessageType.STATE_MESSAGE:
				console.log("State");
				console.log(message.data);
				message = message as StateMessage;
				setState(message.data);
				break;
		}
		console.log(message);
		
    };
}

function getNewSocket(address: string = WS_ADDRESS) {
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
	// TODO: Implement sending state to server via different PubSub channel.
	let state = getState(props); // TODO: Is object destructuring even relevant at this point?
	debug(state);
	sendMessage(new StateMessage(userName, state));
}

function setState(state: State) {
	// TODO: Implement receiving state from server.
	let timestamp = Date.now();
	let latency = timestamp - state.timestamp; // NOTE: Delta-Time of packet sending/arrival in miliseconds
	// TODO: Add video source change; prompt user for filename / automatically redirect video.src?
	if (state.paused != playVideo.paused) {
		state.paused ? playVideo.pause() : playVideo.play();
	}
	if (Math.abs(playVideo.currentTime - state.currentTime) > MAX_DELTA) {
		playVideo.currentTime = Math.max(
			0,
			Math.min(playVideo.duration, state.currentTime + latency)
		); // NOTE: Clamp(0 < time < duration)
	}
}

function sendMessage(message: Message) {
	socket.send(message.stringify());
}

function sendChatMessage() {
	if(sendInput.value && sendInput.value != "") {
		// TODO: CSS :disabled when sendInput.length < 1 ?
		let message = sendInput.value;
		if (!message || message == "") {
			return;
		}
		sendMessage(new TextMessage(userName, message));
		sendInput.value = ""; // NOTE: == null, see: sendInput "blur" event
	}
};

sendButton.addEventListener("click", sendChatMessage);

sendInput.addEventListener("keydown", (e: KeyboardEvent) => {
	// Send the message on Enter, if pressed without Shift. (Shift+Enter = newline)
	if (e.code == "Enter") { // NOTE: || e.key == "Enter"
		if (!e.shiftKey) { e.preventDefault(); sendChatMessage(); }
	}
});

sendInput.addEventListener("blur", () => {
	if (sendInput.value == "") { sendInput.value = ""; } // TODO: null?
});

playVideo.addEventListener("durationchange", () => {
	// Video duration changed
	timeInput.max = playVideo.duration.toString();
	timeInput.step = (playVideo.duration / 100).toString();
	durationText.innerHTML = toHhMmSs(playVideo.duration);
});

playVideo.addEventListener("timeupdate", () => {
	// Video is playing
	timeInput.value = playVideo.currentTime.toString();
	currentTimeText.innerHTML = toHhMmSs(playVideo.currentTime);
});

function togglePause() {
	// Play/Pause toggled
	playVideo.paused ? playVideo.play() : playVideo.pause();
	sendState(); // TODO: { paused: paused } ?
}

pauseButton.addEventListener("click", togglePause);
playVideo.addEventListener("click", togglePause);

volumeInput.addEventListener("input", () => {
	// Volume input
	playVideo.volume = parseFloat(volumeInput.value) / 100;
});

timeInput.addEventListener("input", () => {
	// currentTime input
	// TODO: Doesn't work with locally loaded file -- why? Set source as file from JS? Requires BunFile...
	playVideo.currentTime = parseFloat(timeInput.value);
	sendState({ currentTime: playVideo.currentTime });
});

loadText.addEventListener("click", () => {
	// Load video link
	let url = prompt("Enter video source address:");
	if(!url || url == "") return;
	playSource.src = url;
	playVideo.load();
	srcName = url;
	sendState();
});

function setVideoSourceFromFile(file: File) {
	let url = URL.createObjectURL(file);
	playSource.src = url;
	playVideo.load();
	srcName = file.name;
	sendState();
}

loadFile.addEventListener("input", () => {
	// lastModified: 1703012842204
	// lastModifiedDate: Tue Dec 19 2023 21:07:22 GMT+0200 (Israel Standard Time) {}
	// name: "Mori Calliope - Twitter Status 1693647928030875968 - 2023_08_21_18_35_00.mp4"
	// size: 10572793
	// type: "video/mp4"
	// webkitRelativePath: ""
	// TODO: How to identify video? Enforce identity? Unequal files =/= Unequal content.
	if(!loadFile.files || !loadFile.files[0]) return;
	setVideoSourceFromFile(loadFile.files[0])
});

const socket = getNewSocket(); // TODO: Abstract
// setVideoSourceFromFile(Bun.file("./short.mp4")); // TODO: BunFile not assignable to File // SEE: https://github.com/oven-sh/bun/issues/5980
// TODO: socket2 is for development purposes only; disable on production build.
setTimeout(()=>{
	const socket2 = getNewSocket();
    exports.socket2 = socket2;
}, 1000);

exports = { setState: setState, WebSocket: WebSocket, socket: socket };
