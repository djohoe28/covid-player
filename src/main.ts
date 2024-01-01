import State from "./State";

const DEBUG = true;
const NODE_ENV = process.env.NODE_ENV ?? "development";
const WS_ADDRESS = NODE_ENV == "development" ? "ws://localhost:8081" : "ws://covid-player.onrender.com";
const MAX_DELTA = 1000; // Maximum video time difference (in miliseconds)

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

function toHhMmSs(seconds: number) {
	// TODO: Come up with more permanent / performant solution?
	return new Date(seconds * 1000).toISOString().slice(11, 19);
}

function log(object: any) {
	// TODO: Scroll to bottom if was at bottom before append.
	let element = document.createElement("p");
	element.textContent = JSON.stringify(object).toString();
	chatArea?.appendChild(element);
}

function debug(object: any) {
	if (DEBUG) {
		console.log(object);
	}
}

function currySocketOpen (ws: WebSocket) {
    return function (event: Event) {
        log("Open:");
        log(event.type);
        debug(event);
        ws.send("Hello World!")
    };
}

function currySocketClose (ws: WebSocket) {
    return function (event: CloseEvent) {
        log("Close:");
        log(event.wasClean);
        debug(event);
        ws.send("Goodbye!");
    };
}

function currySocketError (ws: WebSocket) {
    return function (event: Event | ErrorEvent) {
        // TODO: socket.onerror: Event
        log("Error:");
        log(event.type);
        debug(event);
        ws.send("Error!")
    };
}

function currySocketMessage (ws: WebSocket) {
    return function (event: MessageEvent) {
        log("Message:");
        log(event.data);
        debug(event);
        debug(ws);
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

function getState(props?: Object) {
	let timestamp = new Date().getTime();
	return {
		// src: playSource.src, // TODO: Handle files/links differently? Send by default?
		paused: playVideo?.paused,
		currentTime: playVideo?.currentTime,
		timestamp: timestamp,
		...props,
	};
}

function sendState(props?: Object) {
	let state = getState(props);
	console.log(state);
	socket.send(JSON.stringify(state));
	// TODO: Implement sending state to server.
}

function setState(state: State) {
	// TODO: Implement receiving state from server.
	let timestamp = new Date().getTime();
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

function getMessage(message: any) {
	if (!message || message == "") {
		return;
	}
	// TODO: Refactor to use a "message" modular element to allow sent/received messages.
	log(message);
	sendInput.value = ""; // NOTE: == null, see: sendInput "blur" event
}

function sendMessage() {
	if(sendInput.value && sendInput.value != "") {
		// TODO: CSS :disabled when sendInput.length < 1 ?
		let message = sendInput.value;
		getMessage(message); // TODO: Add "sent" class? Redundant?
		socket.send(message)
	}
};

sendButton.addEventListener("click", sendMessage);

sendInput.addEventListener("keydown", (e: KeyboardEvent) => {
	// Send the message on Enter, if pressed without Shift. (Shift+Enter = newline)
	if (e.code == "Enter") { // NOTE: || e.key == "Enter"
		if (!e.shiftKey) { sendMessage(); }
	}
});

sendInput.addEventListener("blur", () => {
	if (sendInput.value == "") { sendInput.value = ""; } // TODO: null?
});

playVideo.addEventListener("durationchange", () => {
	// Video duration changed
	timeInput.max = '' + playVideo.duration;
	timeInput.step = '' + playVideo.duration / 100;
	durationText.innerHTML = toHhMmSs(playVideo.duration);
});

playVideo.addEventListener("timeupdate", () => {
	// Video is playing
	timeInput.value = '' + playVideo.currentTime;
	currentTimeText.innerHTML = toHhMmSs(playVideo.currentTime);
});

function togglePause() {
	// Play/Pause toggled
	let paused = !playVideo.paused; // Predictive
	playVideo.paused ? playVideo.play() : playVideo.pause();
	sendState({ paused: paused });
}

pauseButton.addEventListener("click", togglePause);
playVideo.addEventListener("click", togglePause);

volumeInput.addEventListener("input", () => {
	// Volume input
	playVideo.volume = parseInt(volumeInput.value) / 100;
});

timeInput.addEventListener("input", () => {
	// currentTime input
	playVideo.currentTime = parseInt(timeInput.value);
	sendState({ currentTime: timeInput.value });
});

loadText.addEventListener("click", () => {
	// Load video link
	let url = prompt("Enter video source address:");
	if(!url || url == "") return;
	playSource.src = url;
	playVideo.load();
	// TODO: Force source change?
	sendState({
		src: url,
	});
});

loadFile.addEventListener("input", () => {
	// lastModified: 1703012842204
	// lastModifiedDate: Tue Dec 19 2023 21:07:22 GMT+0200 (Israel Standard Time) {}
	// name: "Mori Calliope - Twitter Status 1693647928030875968 - 2023_08_21_18_35_00.mp4"
	// size: 10572793
	// type: "video/mp4"
	// webkitRelativePath: ""
	// TODO: How to identify video? Enforce identity? Unequal files =/= Unequal content.
	if(!loadFile.files || !loadFile.files[0]) return;
	let url = URL.createObjectURL(loadFile.files[0]);
	playSource.src = url;
	playVideo.load();
	sendState({
		src: loadFile.files[0].name,
	});
});

const socket = getNewSocket(); // TODO: Abstract
// TODO: socket2 is for development purposes only; disable on production build.
setTimeout(()=>{
	const socket2 = getNewSocket();
    exports.socket2 = socket2;
}, 1000);

exports = { setState: setState, WebSocket: WebSocket, socket: socket };
