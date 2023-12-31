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
	let messageNode = document.createElement("p");
	messageNode.textContent = message;
	chatArea.appendChild(messageNode);
	sendInput.value = "";
}

sendButton.onclick = function () {
	getMessage(sendInput.value); // TODO: Add "sent" class? Redundant?
};

playVideo.ondurationchange = function () {
	// Video duration changed
	timeInput.max = playVideo.duration;
	timeInput.step = playVideo.duration / 100;
	durationText.innerHTML = toHhMmSs(playVideo.duration);
};

playVideo.ontimeupdate = function () {
	// Video is playing
	timeInput.value = playVideo.currentTime;
	currentTimeText.innerHTML = toHhMmSs(playVideo.currentTime);
};

function togglePause() {
	// Play/Pause toggled
	let paused = !playVideo.paused; // Predictive
	playVideo.paused ? playVideo.play() : playVideo.pause();
	sendState({ paused: paused });
}

pauseButton.onclick = togglePause;
playVideo.onclick = togglePause;

volumeInput.oninput = function () {
	// Volume input
	playVideo.volume = volumeInput.value / 100;
};

timeInput.oninput = function () {
	// currentTime input
	playVideo.currentTime = timeInput.value;
	sendState({ currentTime: timeInput.value });
};

loadText.onclick = function () {
	// Load video link
	let url = prompt("Enter video source address:");
	playSource.src = url;
	playVideo.load();
	// TODO: Force source change?
	sendState({
		src: url,
	});
};

loadFile.oninput = function () {
	// lastModified: 1703012842204
	// lastModifiedDate: Tue Dec 19 2023 21:07:22 GMT+0200 (Israel Standard Time) {}
	// name: "Mori Calliope - Twitter Status 1693647928030875968 - 2023_08_21_18_35_00.mp4"
	// size: 10572793
	// type: "video/mp4"
	// webkitRelativePath: ""
	// TODO: How to identify video? Enforce identity? Unequal files =/= Unequal content.
	let url = URL.createObjectURL(loadFile.files[0]);
	playSource.src = url;
	playVideo.load();
	sendState({
		src: loadFile.files[0].name,
	});
};

const socket = new WebSocket("ws://localhost:8081");
socket.addEventListener("message", (event) => {
	console.log(event);
}); // message is received
socket.addEventListener("open", (event) => {
	socket.send("Hello World!")
	console.log(event);
}); // socket opened
socket.addEventListener("close", (event) => {
	socket.send("Goodbye!");
	console.log(event);
}); // socket closed
socket.addEventListener("error", (event) => {
	socket.send("Error!")
	console.log(event);
}); // error handler
console.log(socket);
