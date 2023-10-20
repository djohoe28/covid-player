// const socketIo = require('socket.io');
// const io = socketIo(server); // ! Uncaught ReferenceError: socketIo is not defined

//#region DOM Constants
const video = document.getElementById("video");
const inputDelta = document.getElementById("inputDelta");
const inputRoom = document.getElementById("inputRoom");
const inputMessage = document.getElementById("inputMessage");
const textArea = document.getElementById("textArea");
//#endregion

//#region Constants
const STUN_PROT = "stun";
const STUN_HOST = "stun.l.google.com";
const STUN_PORT = 19302;
const SIGN_PROT = "http";
const SIGN_HOST = "http://covid-player-server.onrender.com"
const SIGN_PORT = 10000;
const STUN_URL = new URL(`${STUN_PROT}:${STUN_HOST}:${STUN_PORT}`);
const SIGN_URL = new URL(SIGN_HOST);
// TODO: Look into URL functions in utility.js.
const socket = io(SIGN_URL.href);
const configuration = {
	iceServers: [{ urls: STUN_URL.href }],
};
const peerConnection = new RTCPeerConnection(configuration);
const deltaOffset = 1.0 / 60.0; // ? Assure Keyboard Seek is captured. (assumes >=1FPS).
//#endregion

//#region Variables
var syncing = false; // ? Disables synchronization while syncing, to avoid feedback loop.
var deltaMax = 0; // ? Overridden by HTML & video load.
//#endregion

//#region HTML Event Handlers
function onDeltaSubmit() {
	console.log(`Update Delta = ${deltaMax} -> ${inputDelta.value}`);
	deltaMax = parseFloat(`${inputDelta.value}`); // TODO: Determine type.
}

function onRoomSubmit() {
	let roomId = inputRoom.value;
	socket.emit("joinRoom", roomId); // Join a specific chatroom identified by 'roomId'
}

function onMessageSubmit() {
	let message = inputMessage.value;
	socket.emit("message", message);
}

function onFileSubmit(event) {
	let file = event.target.files[0];
	video.src = URL.createObjectURL(file);
}

function onVideoAction(event) {
	if (syncing) {
		console.log("Synced Action Event");
		return; // Avoid event loop.
	}
	let packet = {
		paused: event.target.paused, // TODO: type: event.type?
		currentTime: event.target.currentTime,
		timeStamp: Date.now(), //event.timeStamp,
	};
	let message = JSON.stringify(packet);
	console.log(`SEND: ${message}`);
	socket.emit("send", message);
}

function onVideoDurationUpdate() {
	let interval = video.duration / 100; // ? Keyboard Seek Interval (1% of video duration).
	inputDelta.value = interval - deltaOffset;
	onDeltaSubmit(); // ? Automatically calls value update event.
}
//#endregion

//#region Socket Events
socket.on("message", (message) => {
	console.log(`MSG: ${message}`);
	textArea.textContent += message + "\n"; // Append the message to the textarea
});

socket.on("sync", (message) => {
	syncing = true;
	let deltaMax = parseFloat(`${inputDelta.value}`); // TODO: Determine type.
	let packet = JSON.parse(message);
	// TODO: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#events
	let delta = packet.currentTime - video.currentTime;
	let latency = packet.paused ? 0 : (Date.now() - packet.timeStamp) / 1000; // Ignore latency when paused. Milliseconds to Seconds
	// console.log("sync", packet);
	if (packet.paused && !video.paused) {
		video.pause(); // ? Prevent duplicate events.
	}
	if (Math.abs(delta) > deltaMax) {
		// TODO: Pause until all Peers are synced?
		video.currentTime = packet.currentTime + latency;
	}
	if (!packet.paused && video.paused) {
		video.play(); // TODO: Uncaught (in promise) DOMException: play() failed because the user didn't interact with the document first. https://goo.gl/xX8pDD
	}
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
window.exports = {
	socket,
};
