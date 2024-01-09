import type { IStamp } from "./Interfaces";
import type { IState } from "./State";
import State from "./State";

export interface ISnapshot extends IState, IStamp {}

export default class Snapshot extends State implements ISnapshot {
	timestamp: number;
	sender: string;
	constructor({
		src,
		currentTime,
		paused,
		timestamp = Date.now(),
		sender = "",
	}: ISnapshot) {
		super({ src, currentTime, paused });
		this.timestamp = timestamp;
		this.sender = sender;
	}
	toString(): string {
		return `${super.toString()} : ${this.sender} @ ${this.timestamp}`;
	}
	toJSON(): string {
		// TODO: Flattens State
		const { src, currentTime, paused, timestamp, sender } = this;
		return JSON.stringify({ src, currentTime, paused, timestamp, sender });
	}
}
