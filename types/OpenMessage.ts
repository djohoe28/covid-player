import LogMessage from "./LogMessage";
import { MessageType } from "./Message";

export default class OpenMessage extends LogMessage {
    constructor(sender: string = '', data: string = '', timestamp: number = Date.now(), mType: MessageType = MessageType.OPEN_MESSAGE) {
        super(sender, data, timestamp, mType);
    }
}