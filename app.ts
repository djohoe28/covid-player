// import "./src/main.ts";
// NOTE: This is to assure that `main.ts` is watched, bundled, and Hot Reloaded when changes are made.
// TODO: Remove this before production, probably.

import type { ServerWebSocket } from "bun";
import Message, { MessageType } from "./types/Message";
import OpenMessage from "./types/OpenMessage";
import CloseMessage from "./types/CloseMessage";
import NameMessage from "./types/NameMessage";

type WebSocketData = {
  username: string
};

const PORT: number = +(process.env['PORT'] || 8081);
const NODE_ENV = process.env.NODE_ENV ?? "development";
const LOG_ROOM = "log";
const CHAT_ROOM = "chat";
const CONTROL_ROOM = "control";
const SERVER_ROOM = "server";
const SERVER_NAME = "SERVER";

var userCount = 0;

function serve(req: Request): Response {
  try {
    let url = new URL(req.url);
    let path = url.pathname;
    let srcPath = `./public${path === "/" ? "/index.html" : path}`
    console.log(`Serving static path = ${srcPath}...`);
    let file = Bun.file(srcPath);
    return new Response(file);
  } catch (err) {
    return new Response(`ERROR @ ${NODE_ENV}`);
  }
}

function getUsernameFromCookies(cookies?: string | null) {
  // return Date.now().toString() + Math.floor(Math.random() * 10).toString()
  if (cookies) { console.log(cookies); }
  return `User#${userCount}`;
}

function subscribe(ws: ServerWebSocket<WebSocketData>) {
  ws.subscribe(LOG_ROOM);
  ws.subscribe(CHAT_ROOM);
  ws.subscribe(CONTROL_ROOM);
  ws.subscribe(SERVER_ROOM);
}

function unsubscribe(ws: ServerWebSocket<WebSocketData>) {
  ws.unsubscribe(LOG_ROOM);
  ws.unsubscribe(CHAT_ROOM);
  ws.unsubscribe(CONTROL_ROOM);
  ws.unsubscribe(SERVER_ROOM);
}

function send(ws: ServerWebSocket<WebSocketData>, message: Message) {
  ws.send(Message.stringify(message));
}

function publish(room: string, message: Message) {
  server.publish(room, Message.stringify(message));
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
      let openMsg = new OpenMessage(SERVER_NAME, ws.data.username);
      let nameMsg = new NameMessage(SERVER_NAME, ws.data.username);
      subscribe(ws);
      send(ws, nameMsg)
      publish(LOG_ROOM, openMsg);
    },
    message(_ws, incoming) {
      // the server re-broadcasts incoming messages to everyone
      let message: Message = JSON.parse(incoming as string) as Message;
      switch (message.mType) {
        case MessageType.TEXT_MESSAGE:
          publish(CHAT_ROOM, message);
          break;
        case MessageType.STATE_MESSAGE:
          publish(CONTROL_ROOM, message);
          break;
        default: break;
      }
    },
    close(ws) {
      let msg = new CloseMessage(SERVER_NAME, ws.data.username);
      publish(LOG_ROOM, msg);
      unsubscribe(ws);
    },
  },
});
// TODO: Leverage location or something for protocol?
console.log(`Listening on http://${server.hostname}:${server.port}`);
