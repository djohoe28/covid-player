import { MessageType } from "@modules/Message";
import type Snapshot from "@modules/Snapshot";
import State from "@modules/State";
import { clamp, toHhMmSs } from "@utils/Utility";
import SocketController from "@controllers/SocketController";

export type VideoEvents = "click" | "durationchange" | "timeupdate";

export default class VideoController {
	video: HTMLVideoElement;
	source: HTMLSourceElement;
	pauseButton: HTMLButtonElement;
	volumeInput: HTMLInputElement;
	timeInput: HTMLInputElement;
	linkButton: HTMLButtonElement;
	fileInput: HTMLInputElement;
	videoBlocker: HTMLElement;
	controlBlocker: HTMLElement;
	currentTimeText: HTMLElement;
	durationText: HTMLElement;
	socketController: SocketController;
	sourceTitle: string; // TODO: IMPLEMENT.
	duration: number; // TODO: IMPLEMENT.
	state: State;
	isClicked: boolean = false;
	latencyThreshold: number = 0; // Threshold for video time difference (in seconds)
	constructor(
		video: HTMLVideoElement,
		source: HTMLSourceElement,
		pauseButton: HTMLButtonElement,
		volumeInput: HTMLInputElement,
		timeInput: HTMLInputElement,
		linkButton: HTMLButtonElement,
		fileInput: HTMLInputElement,
		videoBlocker: HTMLElement,
		controlBlocker: HTMLElement,
		currentTimeText: HTMLElement,
		durationText: HTMLElement,
		socketController: SocketController
	) {
		this.video = video;
		this.source = source;
		this.pauseButton = pauseButton;
		this.volumeInput = volumeInput;
		this.timeInput = timeInput;
		this.linkButton = linkButton;
		this.fileInput = fileInput;
		this.videoBlocker = videoBlocker;
		this.controlBlocker = controlBlocker;
		this.currentTimeText = currentTimeText;
		this.durationText = durationText;
		this.socketController = socketController;
		this.video.addEventListener("click", this.handleVideoClick);
		this.video.addEventListener("timeupdate", this.handleVideoTimeUpdate);
		this.video.addEventListener(
			"durationchange",
			this.handleVideoDurationChange
		);
		this.pauseButton.addEventListener("click", this.handlePauseClick);
		this.volumeInput.addEventListener("input", this.handleVolumeInput);
		this.timeInput.addEventListener("input", this.handleTimeInput);
		this.linkButton.addEventListener("click", this.handleLinkClick);
		this.fileInput.addEventListener("input", this.handleFileInput);
		this.state = State.getFromVideo(this.video);
	}
	//#region Setters
	setPaused(paused: boolean, isUser: boolean): void {
		let changed = this.state.paused != paused;
		this.state.paused = paused;
		if (changed && isUser) {
			if (this.state.paused) {
				this.video.pause();
			} else {
				if (!this.isClicked) return;
				this.video.play();
			}
			this.sendState();
		}
	}
	setSource(src: string, isUser: boolean): void {
		let changed = this.state.src != src;
		this.state.src = src;
		if (changed && isUser) {
			// TODO: && this.isClicked?
			this.video.src = this.state.src;
			this.video.load();
			this.sendState();
		}
		return;
	}
	setCurrentTime(time: number, isUser: boolean, timestamp?: number) {
		let changed = this.state.currentTime != time;
		let latency = this.state.paused ? 0 : Date.now() - (timestamp ?? 0);
		this.state.currentTime = time - latency / 1000; // NOTE: latency (ms), currentTime (sec)
		if (changed && isUser) {
			this.video.currentTime = clamp(
				this.state.currentTime,
				0,
				this.duration
			);
			// NOTE: 0 < time < duration;
			this.sendState();
		}
	}
	setState(state: State, isUser: boolean) {
		this.setSource(state.src, isUser);
		this.setPaused(state.paused, isUser); // TODO: Wait for source load? Buffer?
		this.setCurrentTime(state.currentTime, isUser); // TODO: Timestamp Latency
	}
	setSnapshot(snapshot: Snapshot) {
		let isUser = snapshot.sender != this.socketController.username;
		// TODO: Add video source change; prompt user for filename / automatically redirect video.src?
		if (snapshot.src.includes(":")) {
			// Source is on the web
			this.setSource(snapshot.src, isUser);
		} else {
			alert(`Please load the file: ${snapshot.src}`);
		}
		this.setPaused(snapshot.paused, isUser);
		this.setCurrentTime(snapshot.currentTime, isUser, snapshot.timestamp);
	}
	//#endregion
	//#region Methods
	togglePause(isUser: boolean): boolean {
		this.state.paused = !this.state.paused;
		if (isUser) {
			this.state.paused ? this.video.play() : this.video.pause();
		}
		return this.state.paused;
	}
	sendState(): void {
		// TODO: Add props?
		this.socketController.send(this.state.toJSON(), MessageType.STATE);
	}
	//#endregion
	//#region Handlers
	handleVideoClick(_event: Event): void {
		/**
		 * Uncaught (in promise) DOMException:
		 * play() failed because the user didn't interact with the document first.
		 * https://goo.gl/xX8pDD
		 */
		if (!this.isClicked) {
			// TODO: Wait until video loads to remove box?
			this.videoBlocker.style.display = "none";
			this.controlBlocker.style.display = "none";
			this.setSource(this.sourceTitle, true); // TODO: Implement default?
			this.isClicked = true;
			return; // TODO: Ignores first click.
		}
		this.togglePause(true);
	}
	handleVideoTimeUpdate(_event: Event): void {
		this.state.currentTime = this.video.currentTime;
		this.timeInput.value = this.video.currentTime.toString();
		this.currentTimeText.innerHTML = toHhMmSs(this.video.currentTime);
	}
	handleVideoDurationChange(_event: Event): void {
		this.state.src = this.video.src; // TODO: More?
		this.duration = this.video.duration;
		this.timeInput.max = this.duration.toString();
		this.timeInput.step = (this.duration / 100).toString();
		this.durationText.innerHTML = toHhMmSs(this.duration);
	}
	handleVolumeInput(_event: Event) {
		this.video.volume = parseFloat(this.volumeInput.value) / 100;
	}
	handleTimeInput(_event: Event) {
		// currentTime input
		// TODO: Doesn't work with locally loaded file -- why? Set source as file from JS? Requires BunFile...
		this.setCurrentTime(parseFloat(this.timeInput.value), true);
		this.sendState();
	}
	handleLinkClick(_event: Event) {
		// Load video link
		let url = prompt("Enter video source address:");
		if (!url || url == "") return;
		this.video.src = url;
		this.video.load();
		this.sourceTitle = url;
		this.sendState();
	}
	handleFileInput(_event: Event) {
		/**
		 * lastModified: 1703012842204
		 * lastModifiedDate: Tue Dec 19 2023 21:07:22 GMT+0200 (Israel Standard Time) {}
		 * name: "Mori Calliope - Twitter Status 1693647928030875968 - 2023_08_21_18_35_00.mp4"
		 * size: 10572793
		 * type: "video/mp4"
		 * webkitRelativePath: ""
		 */
		// TODO: How to identify video? Enforce identity? Unequal files =/= Unequal content.
		if (!this.fileInput.files || !this.fileInput.files[0]) return;
		let file = this.fileInput.files[0];
		let url = URL.createObjectURL(file);
		this.source.src = url;
		this.video.load();
		this.sourceTitle = file.name;
		this.sendState();
	}
	handlePauseClick(_event: Event) {
		this.togglePause(true);
	}
	//#endregion
}
