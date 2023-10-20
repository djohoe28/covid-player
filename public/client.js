// const socketIo = require('socket.io');
// const io = socketIo(server); // ! Uncaught ReferenceError: socketIo is not defined
import React from "react";
import ReactDOM from "react-dom";
// const ReactDOM = require('react-dom');
// const App = require("./components/app");
//#region DOM Constants
// const video = document.getElementById("video");
// const inputDelta = document.getElementById("inputDelta");
// const inputRoom = document.getElementById("inputRoom");
// const inputMessage = document.getElementById("inputMessage");
// const inputUrl = document.getElementById("inputUrl");
// const inputFile = document.getElementById("inputFile");
// const textArea = document.getElementById("textArea");
//#endregion

//#region Constants
const STUN_PROT = "stun";
const STUN_HOST = "stun.l.google.com";
const STUN_PORT = 19302;
const SIGN_PROT = "https";
const SIGN_HOST = "covid-player-server.onrender.com";
const SIGN_PORT = 10000;
const STUN_URL = new URL(`${STUN_PROT}:${STUN_HOST}:${STUN_PORT}`);
const SIGN_URL = new URL(`${SIGN_PROT}:${SIGN_HOST}`); // :${SIGN_PORT}
const socket = io(SIGN_URL.href);
const peerConnection = new RTCPeerConnection({
	iceServers: [{ urls: STUN_URL.href }],
});
const deltaOffset = 1.0 / 60.0; // ? Assure Keyboard Seek is captured. (assumes >=1FPS).
var timeStampLatest = Date.now(); // The latest Packet timestamp received, to avoid older Packets.
//#endregion

//#region Variables
var syncing = false; // ? Disables synchronization while syncing, to avoid feedback loop.
var deltaMax = 0; // ? Overridden by HTML & video load.
//#endregion

//#region HTML Event Handlers
// function onSubmitDelta() {
// 	console.log(`Update Delta = ${deltaMax} -> ${inputDelta.value}`);
// 	deltaMax = parseFloat(`${inputDelta.value}`); // TODO: Determine type.
// }
// onSubmitDelta(); // ! Use default value.

// function onSubmitRoom() {
// 	let roomId = inputRoom.value;
// 	socket.emit("joinRoom", roomId); // Join a specific chatroom identified by 'roomId'
// }

// function onSubmitMessage() {
// 	let message = inputMessage.value;
// 	socket.emit("message", message);
// }

// function onInputFile(event) {
// 	let file = event.target.files[0];
// 	inputUrl.value = URL.createObjectURL(file);
// 	onSubmitSource();
// }

// function onSubmitSource() {
// 	video.src = inputUrl.value;
// }

// function onVideoAction(event) {
// 	if (syncing) {
// 		console.log("Synced Action Event");
// 		return; // Avoid event loop.
// 	}
// 	let packet = {
// 		paused: event.target.paused, // TODO: type: event.type?
// 		currentTime: event.target.currentTime,
// 		timeStamp: Date.now(), //event.timeStamp,
// 	};
// 	timeStampLatest = packet.timeStamp;
// 	let message = JSON.stringify(packet);
// 	console.log(`SEND: ${message}`);
// 	socket.emit("send", message);
// }

// function onVideoDurationChange() {
// 	let interval = video.duration / 100; // ? Keyboard Seek Interval (1% of video duration).
// 	inputDelta.value = Math.max(deltaOffset, interval - deltaOffset); // ? Minimal delta = deltaOffset.
// 	onSubmitDelta(); // ? Automatically calls value update event.
// }
//#endregion

//#region Socket Events
socket.on("message", (message) => {
	console.log(`MSG: ${message}`);
	textArea.textContent += message + "\n"; // Append the message to the textarea
});

socket.on("sync", (message) => {
	let packet = JSON.parse(message);
	let delta = packet.currentTime - video.currentTime;
	let latency = packet.paused ? 0 : (Date.now() - packet.timeStamp) / 1000; // Ignore latency when paused. Milliseconds to Seconds
	if (syncing || packet.timeStamp < timeStampLatest) {
		console.log(
			`Ignored conflicting sync; delta=${delta}, latency=${latency}, packet=`,
			packet
		);
		return;
	}
	syncing = true;
	// TODO: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#events
	if (packet.paused && !video.paused) {
		video.pause(); // TODO: In progress of play() call.
	}
	if (Math.abs(delta) > deltaMax) {
		// TODO: Pause until all Peers are synced?
		video.currentTime = packet.currentTime + latency;
	}
	if (!packet.paused && video.paused) {
		video.play(); // TODO: Uncaught (in promise) DOMException: play() failed because the user didn't interact with the document first. https://goo.gl/xX8pDD
	}
	timeStampLatest = packet.timeStamp;
	syncing = false;
});

// In client.js, add the following for peer connection
socket.on("connect", () => {
	console.log("Socket Connected!");
});

socket.on("offer", (offer) => {
	console.log("Offer Received?", offer);
	// Handle offer from the other peer and respond with an answer
	peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
	peerConnection.createAnswer().then((answer) => {
		console.log("Answer Created?", answer);
		peerConnection.setLocalDescription(answer);
		socket.emit("answer", answer);
	});
});

socket.on("answer", (answer) => {
	console.log("Answer Received?", answer);
	// Handle answer from the other peer
	peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on("userJoined", (socketId) => {
	console.log("JOIN: ", socketId);
});
//#endregion
//#region PeerConnection Events
peerConnection.ondatachannel = (event) => {
	console.log("DataChannel?", event);
	// Handle data channel creation and messages
	const dataChannel = event.channel;
	dataChannel.onmessage = (event) => {
		console.log("DataChannel Message?", event);
	};
};

// Exchange ICE candidates
peerConnection.onicecandidate = (event) => {
	console.log("ICECandidate?", event);
	if (event.candidate) {
		socket.emit("newIceCandidate", event.candidate);
	}
};
//#endregion

//#region Event Initialization
// document.getElementById("submitDelta").onclick = onSubmitDelta;
// document.getElementById("submitRoom").onclick = onSubmitRoom;
// document.getElementById("submitMessage").onclick = onSubmitMessage;
// document.getElementById("submitSource").onclick = onSubmitSource;
// document.getElementById("inputFile").oninput = onInputFile;
// video.ondurationchange = onVideoDurationChange;
// video.onplay = onVideoAction;
// video.onpause = onVideoAction;
// video.onseeked = onVideoAction;
//#endregion
// const rootElement = document.getElementById("root");
// ReactDOM.render(<App />, rootElement); // TODO: IN DEVELOPMENT
window.exports = {
	socket,
};
const domNode = document.getElementById('root');
const root = React.createRoot(domNode);
// root.render(<App />);