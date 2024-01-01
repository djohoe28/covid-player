export default class State {
    paused: boolean;
	currentTime: number;
	timestamp: number;
    constructor() {
        // TODO: IMPLEMENT ASAP, INCLUDE OPTIONAL PROPERTIES AND CONSTRUCT FROM OBJECT
        this.paused = false;
        this.currentTime = 0;
        this.timestamp = 0;
    }
}