import LogMessage from "./LogMessage";
import { MessageType } from "./Message";

export default class NameMessage extends LogMessage {
    constructor(sender: string = '', data: string = '', timestamp: number = Date.now(), mType: MessageType = MessageType.NAME_MESSAGE) {
        super(sender, data, timestamp, mType);
    }
}