export enum MessageType {
    MESSAGE,
    LOG_MESSAGE,
    OPEN_MESSAGE,
    CLOSE_MESSAGE,
    NAME_MESSAGE,
    TEXT_MESSAGE,
    STATE_MESSAGE
};

export default abstract class Message {
    sender: string;
    data: any;
    timestamp: number;
    mType: MessageType;
    constructor(sender: string = '', data: any = null, timestamp: number = Date.now(), mType: MessageType = MessageType.MESSAGE) {
        this.sender = sender;
        this.data = data;
        this.timestamp = timestamp;
        this.mType = mType;
    }
    stringify() {
        const { sender, data, timestamp, mType } = this;
        return JSON.stringify({ sender, data, timestamp, mType })
    }
    static stringify(message: Message) {
        const { sender, data, timestamp, mType } = message;
        return JSON.stringify({ sender, data, timestamp, mType });
    }
    toString() {
        return `${this.mType} | ${this.sender} @ ${this.timestamp} : ${this.data}`;
    }
};