export interface IState {
	src: string;
	currentTime: number;
	paused: boolean;
}

export default class State implements IState {
	src: string;
	currentTime: number;
	paused: boolean;
	constructor({ src, currentTime, paused }: IState) {
		this.src = src;
		this.currentTime = currentTime;
		this.paused = paused;
	}
	static getFromVideo(video: HTMLVideoElement) : State {
		return new State({src: video.src, currentTime: video.currentTime, paused: video.paused});
	}
	toString(): string {
		return `${this.src} = ${this.currentTime} ${this.paused ? "|" : ">"}`;
	}
	toJSON(): string {
		// TODO: Flattens State
		const { paused, currentTime, src } = this;
		return JSON.stringify({ paused, currentTime, src });
	}
}
