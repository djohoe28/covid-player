import LogMessage from "./LogMessage";
import { MessageType } from "./Message";

export default class CloseMessage extends LogMessage {
    constructor(sender: string = '', data: string = '', timestamp: number = Date.now(), mType: MessageType = MessageType.CLOSE_MESSAGE) {
        super(sender, data, timestamp, mType);
    }
}