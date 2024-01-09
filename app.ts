import Message, { MessageType } from "@modules/Message";

type WebSocketData = {
	username: string;
};

const PORT: number = +(process?.env["PORT"] || 8081);
const NODE_ENV = process?.env.NODE_ENV ?? "development";
const DEFAULT_ROOM = "ROOM";
const SERVER_NAME = "SERVER";

var userCount = 0;

function serve(req: Request): Response {
	try {
		let url = new URL(req.url);
		let path = url.pathname;
		let srcPath = `./public${path === "/" ? "/index.html" : path}`;
		console.log(`Serving static path = ${srcPath}...`);
		let file = Bun.file(srcPath);
		return new Response(file);
	} catch (err) {
		return new Response(`ERROR @ ${NODE_ENV}`);
	}
}

function getUsernameFromCookies(cookies?: string | null) {
	// return Date.now().toString() + Math.floor(Math.random() * 10).toString()
	if (cookies) {
		console.log(cookies);
	}
	return `User#${userCount}`;
}

const server = Bun.serve<WebSocketData>({
	port: PORT,
	fetch(req, server) {
		const cookies = req.headers.get("cookie");
		const username = getUsernameFromCookies(cookies);
		const success = server.upgrade(req, { data: { username } });
		if (success) {
			// TODO: reduce upon socket close? seems to be done automatically upon Render spin down.
			userCount += 1;
			return undefined;
		}
		return serve(req);
	},
	websocket: {
		open(ws) {
			let openMsg = new Message(
				SERVER_NAME,
				ws.data.username,
				MessageType.SOCKET_OPENED
			);
			let nameMsg = new Message(
				SERVER_NAME,
				ws.data.username,
				MessageType.SOCKET_ID
			);
			ws.subscribe(DEFAULT_ROOM);
			ws.send(Message.stringify(nameMsg));
			server.publish(DEFAULT_ROOM, Message.stringify(openMsg));
		},
		message(_ws, incoming) {
			// the server re-broadcasts incoming messages to everyone
			let newMsg: Message = JSON.parse(incoming as string) as Message;
			server.publish(DEFAULT_ROOM, Message.stringify(newMsg));
		},
		close(ws) {
			let closeMsg = new Message(
				SERVER_NAME,
				ws.data.username,
				MessageType.SOCKET_CLOSED
			);
			server.publish(DEFAULT_ROOM, Message.stringify(closeMsg));
			ws.unsubscribe(DEFAULT_ROOM);
		},
	},
});

console.log(`Listening on https://${server.hostname}:${server.port}`);
