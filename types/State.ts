export interface IStateProperties {
    // TODO: Abstract (supported properties)
    paused?: boolean;
    currentTime?: number;
    src?: string;
    timestamp?: number;
    sender?: string;
}

export interface IState extends IStateProperties {
    // TODO: Interface (or equivalent object)
    paused: boolean;
    currentTime: number;
    src: string;
    timestamp: number;
    sender?: string;
};


export default class State implements IState {
    paused: boolean;
    currentTime: number;
    src: string;
    timestamp: number;
    sender: string;
    constructor({ paused = true, currentTime = 0, src = '', timestamp = Date.now(), sender = "" }: IStateProperties = {}) {
        this.paused = paused;
        this.currentTime = currentTime;
        this.timestamp = timestamp;
        this.src = src;
        this.sender = sender;
    }
    toString(): string {
        return `${this.sender} : ${this.paused ? '|' : '>'} ${this.currentTime} @ ${this.timestamp} < ${this.src}`
    }
    stringify(): string {
        const { paused, currentTime, src, timestamp, sender } = this;
        return JSON.stringify({ paused, currentTime, src, timestamp, sender });
    }
    private apply(element: HTMLVideoElement) {
        // TODO: Dangerous!
        if (element.paused && !this.paused) { element.play(); }
        else if (!element.paused && this.paused) { element.pause(); }
        if (element.src.startsWith("http://") || element.src.startsWith("https://")) { element.src = this.src; }
        element.currentTime = this.currentTime;
    }
}
