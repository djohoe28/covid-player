import Message, { MessageType } from "./Message";

export default abstract class LogMessage extends Message {
    // data: string; // TODO: Works in implementing class -- is this an Abstract issue?
    constructor(sender: string = '', data: string = '', timestamp: number = Date.now(), mType: MessageType = MessageType.LOG_MESSAGE) {
        super(sender, data, timestamp, mType);
    }
}