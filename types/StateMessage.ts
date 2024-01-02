import Message, { MessageType } from "./Message";
import State from "./State";

export default class StateMessage extends Message {
    data: State;
    constructor(sender: string = '', data: State = new State(), timestamp: number = Date.now(), mType: MessageType = MessageType.STATE_MESSAGE) {
        super(sender, data, timestamp, mType);
        this.data = data;
    }
}