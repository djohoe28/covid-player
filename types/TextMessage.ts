import Message, { MessageType } from "./Message";

export default class TextMessage extends Message {
    data: string;
    constructor(sender: string = '', data: string = '', timestamp: number = Date.now(), mType: MessageType = MessageType.TEXT_MESSAGE) {
        super(sender, data, timestamp, mType);
        this.data = data;
    }
}