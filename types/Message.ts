export enum MessageType {
	UNKNOWN,
	SOCKET_OPENED,
	SOCKET_CLOSED,
	SOCKET_ID,
	CHAT,
	STATE,
}

export default class Message {
	sender: string;
	data: any;
	timestamp: number;
	mType: MessageType;
	constructor(
		sender: string = "",
		data: any = null,
		mType: MessageType = MessageType.UNKNOWN,
		timestamp: number = Date.now()
	) {
		this.sender = sender;
		this.data = data;
		this.mType = mType;
		this.timestamp = timestamp;
	}
	static stringify(message: Message) {
		const { sender, data, mType, timestamp } = message;
		return JSON.stringify({ sender, data, mType, timestamp });
	}
	toString() {
		return `${this.mType} | ${this.sender} @ ${this.timestamp} : ${this.data}`;
	}
}
