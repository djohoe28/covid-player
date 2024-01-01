export interface IStateProperties {
    // TODO: Abstract (supported properties)
    paused?: boolean;
    currentTime?: number;
    timestamp?: number;
    src?: string;
}

export interface IState extends IStateProperties {
    // TODO: Interface (or equivalent object)
    paused: boolean;
    currentTime: number;
    timestamp: number;
    src?: string;
};

export default class State implements IState {
    paused: boolean;
    currentTime: number;
    timestamp: number;
    src?: string;
    constructor({ paused, currentTime, timestamp = Date.now(), src }: IState) {
        this.paused = paused;
        this.currentTime = currentTime;
        this.timestamp = timestamp;
        this.src = src;
    }
    toString(): string {
        return `${this.paused ? 'paused' : 'playing'} ${this.currentTime} @ ${this.timestamp} | ${this.src ?? ''}`
    }
    stringify(): string {
        return JSON.stringify({ paused: this.paused, currentTime: this.currentTime, timestamp: this.timestamp, src: this.src })
    }
}