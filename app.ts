const PORT: number = +(process.env.PORT || 8081);
const NODE_ENV = process.env.NODE_ENV ?? "development";
type WebSocketData = {
  socketId: number
};
Bun.serve<WebSocketData>({
  port: PORT,
  fetch(req, server) {
    // console.log(req);
    // console.log(server);
    // const url = new URL(req.url);

    const upgraded = server.upgrade(req, {
      data: {
        socketId: Date.now()
        // createdAt: Date.now(),
        // token: cookies["X-Token"],
        // userId: user.id,
      },
    });
    if (upgraded) {
      console.log("Upgrade succeded!");
      return undefined;
    }
    const url = new URL(req.url);
    const path = url.pathname;
    const srcPath = `./src${path === "/" ? "/index.html" : path}`
    console.log(`Upgrade failed; Serving static path = ${srcPath}...`);
    const file = Bun.file(srcPath); // TODO: Change to `public` after `Bun.bundle`
    return new Response(file);
  },
  websocket: {
    async message(ws, message) {
      console.log(`Received ${message} from ${ws.data.socketId}`);
    }
  }
});
// type WebSocketData = {
//   createdAt: number;
//   token: string;
//   userId: string;
//   username: string;
// };

// const server = Bun.serve<WebSocketData>({
//     port: PORT,
//     async fetch(req, server) {
//       const cookies = req.headers.get("Cookie");
//       console.log(cookies);
//       if (cookies) {
//         // const cookies = parseCookies(req.headers.get("Cookie"));
//         // const token = cookies["X-Token"];
//         // const user = await getUserFromToken(token);
//       }
//       const sessionId = Date.now();
//       const username = `user#${sessionId}`; // TODO: getUsernameFromCookies(cookies);
//       const upgradeSuccess = server.upgrade(req, {
//         headers: {
//           "Set-Cookie": `SessionId=${sessionId}`,
//         },
//         data: {
//           createdAt: Date.now(),
//           token: "X-Token", // cookies["X-Token"],
//           userId: username // user.id,
//         },
//       });
//       if (upgradeSuccess) return undefined;
//       return new Response(`Hello ${username}, and welcome to ${NODE_ENV}!`);
//     },
//     websocket: {
//       open(ws) {
//         const msg = `${ws.data.username} has entered the chat`;
//         ws.subscribe("the-group-chat");
//         ws.publish("the-group-chat", msg);
//       },
//       message(ws, message) {
//         // the server re-broadcasts incoming messages to everyone
//         ws.publish("the-group-chat", `${ws.data.username}: ${message}`);
//       },
//       close(ws) {
//         const msg = `${ws.data.username} has left the chat`;
//         server.publish("the-group-chat", msg);
//         ws.unsubscribe("the-group-chat");
//       },
//       // drain(ws) {}, // the socket is ready to receive more data
//     },
//   });
  
//   console.log(`Listening on http://${server.hostname}:${server.port}`);
  