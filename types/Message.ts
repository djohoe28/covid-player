export enum MessageType {
	OPEN = "OPEN",
	CLOSE = "CLOSE",
	ASSIGN = "ASSIGN",
	TEXT = "TEXT",
	STATE = "STATE",
}
export interface Message {
	senderId: string;
	senderName?: string;
	timestamp: number;
	messageType: MessageType;
	content: string;
}