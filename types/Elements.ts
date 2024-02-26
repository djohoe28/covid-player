export interface VideoElements {
	video: HTMLVideoElement;
	source: HTMLSourceElement;
	togglePauseButton: HTMLButtonElement;
	volumeInput: HTMLInputElement;
	timeInput: HTMLInputElement;
	loadText: HTMLButtonElement;
	loadFile: HTMLInputElement;
	durationText: HTMLSpanElement;
	currentTimeText: HTMLSpanElement;
	videoBlocker: HTMLDivElement;
    controlBlocker: HTMLDivElement;
}
export interface ChatElements {
	area: HTMLTextAreaElement;
	input: HTMLInputElement;
	button: HTMLButtonElement;
}
export interface Elements {
	video: VideoElements;
	chat: ChatElements;
}