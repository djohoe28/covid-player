const DEBUG = true;
const MAX_DELTA = 1000; // Maximum video time difference (in miliseconds)

const playVideo = document.getElementById("playVideo");
const playSource = document.getElementById("playSource");
const pauseButton = document.getElementById("pauseButton");
const volumeInput = document.getElementById("volumeInput");
const timeInput = document.getElementById("timeInput");
const loadText = document.getElementById("loadText");
const loadFile = document.getElementById("loadFile");
const durationText = document.getElementById("durationText");
const currentTimeText = document.getElementById("currentTimeText");
const chatArea = document.getElementById("chatArea");
const sendInput = document.getElementById("sendInput");
const sendButton = document.getElementById("sendButton");

function toHhMmSs(seconds) {
	// TODO: Come up with more permanent / performant solution?
	return new Date(seconds * 1000).toISOString().slice(11, 19);
}

function log(object) {
	// TODO: Scroll to bottom if was at bottom before append.
	let element = document.createElement("p");
	element.textContent = JSON.stringify(object).toString();
	chatArea.appendChild(element);
}

function debug(object) {
	if (DEBUG) {
		console.log(object);
	}
}

function handleSocketOpen (event) {
	log("Open:");
	log(event.data);
	debug(event);
	event.srcElement.send("Hello World!")
}

function handleSocketClose (event) {
	log("Close:");
	log(event.data);
	debug(event);
	event.srcElement.send("Goodbye!");
}

function handleSocketError(event) {
	log("Error:");
	log(event.data);
	debug(event);
	event.srcElement.send("Error!")
}

function handleSocketMessage (event) {
	log("Message:");
	log(event.data);
	debug(event);
}

function initializeSocket(socket) {
	socket.addEventListener("open", handleSocketOpen);
	socket.addEventListener("close", handleSocketClose);
	socket.addEventListener("error", handleSocketError);
	socket.addEventListener("message", handleSocketMessage);
	return socket;
}

function newSocket(address = "ws://localhost:8081") {
	return initializeSocket(new WebSocket("ws://localhost:8081"));
}

const socket1 = newSocket();

function getState(props) {
	let timestamp = new Date().getTime();
	return {
		// src: playSource.src, // TODO: Handle files/links differently? Send by default?
		paused: playVideo.paused,
		currentTime: playVideo.currentTime,
		timestamp: timestamp,
		...props,
	};
}

function sendState(props) {
	let state = getState(props);
	console.log(state);
	socket1.send(state);
	// TODO: Implement sending state to server.
}

function setState(state) {
	// TODO: Implement receiving state from server.
	let timestamp = new Date().getTime();
	let latency = timestamp - state.timestamp; // NOTE: Delta-Time of packet sending/arrival in miliseconds
	// TODO: Add video source change; prompt user for filename / automatically redirect video.src?
	if (state.paused != playVideo.paused) {
		state.paused ? playVideo.pause() : playVideo.play();
	}
	if (Math.abs(playVideo.currentTime - state.currenteTime) > MAX_DELTA) {
		playVideo.currentTime = Math.max(
			0,
			Math.min(playVideo.duration, state.currentTime + latency)
		); // NOTE: Clamp(0 < time < duration)
	}
}

function getMessage(message) {
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
		socket1.send(message)
	}
};

sendButton.addEventListener("click", sendMessage);

sendInput.addEventListener("keydown", (e) => {
	// Send the message on Enter, if pressed without Shift. (Shift+Enter = newline)
	if (e.code == "Enter") { // NOTE: || e.key == "Enter"
		if (!e.shiftKey) { sendMessage(); }
	}
});

sendInput.addEventListener("blur", () => {
	if (sendInput.value == "") { sendInput.value = null; }
});

playVideo.addEventListener("durationchange", () => {
	// Video duration changed
	timeInput.max = playVideo.duration;
	timeInput.step = playVideo.duration / 100;
	durationText.innerHTML = toHhMmSs(playVideo.duration);
});

playVideo.addEventListener("timeupdate", () => {
	// Video is playing
	timeInput.value = playVideo.currentTime;
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
	playVideo.volume = volumeInput.value / 100;
});

timeInput.addEventListener("input", () => {
	// currentTime input
	playVideo.currentTime = timeInput.value;
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
	if(!loadFile.files[0]) return;
	let url = URL.createObjectURL(loadFile.files[0]);
	playSource.src = url;
	playVideo.load();
	sendState({
		src: loadFile.files[0].name,
	});
});

// TODO: socket2 is for development purposes only; disable on production build.
setTimeout(()=>{
	const socket2 = newSocket();
	document.exports.socket2 = socket2;
}, 1000);

document.exports = { WebSocket: WebSocket, socket1: socket1 };
