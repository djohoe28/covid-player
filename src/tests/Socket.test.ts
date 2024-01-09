import Message, { MessageType } from "../../types/Message";
import { test, expect, mock } from "bun:test";
import type Snapshot from "../../types/State";

const WS_ADDRESS = `${location.protocol.includes("https") ? "wss:" : "ws:"}//${
	location.host
}`;
var userName = "User#-1";
var srcName = ""
var duration = 0;
const MAX_DELTA = 0;
var playVideo = new HTMLVideoElement();

const log = mock((obj: any) => {
	console.log(obj);
});
const debug = mock((obj: any) => {
	console.log(obj);
});
const setState = mock((state: Snapshot) => {
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
			Math.min(
				duration,
				state.currentTime + (state.paused ? 0 : latency / 1000)
			)
		); // NOTE: Clamp(0 < time < duration); latency in miliseconds, currentTime in seconds
	}
});

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
				log(
					`${message.sender} @ ${message.timestamp} = ${message.data}`
				);
				// TODO: >>>>> HERE NUMBNUTS <<<<<
				break;
			case MessageType.STATE:
				message = message as Message;
				console.log("VVVVVVVVVVVVVVVVVV");
				console.log(message);
				setState(message.data);
				console.log("^^^^^^^^^^^^^^^^^^");
				break;
		}
	};
}

var socket = new WebSocket(WS_ADDRESS);
socket.addEventListener("open", currySocketOpen(socket));
socket.addEventListener("close", currySocketClose(socket));
socket.addEventListener("error", currySocketError(socket));
socket.addEventListener("message", currySocketMessage(socket));
