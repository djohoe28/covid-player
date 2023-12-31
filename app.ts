// const PORT: number = +(process.env.PORT || 8081);
// const NODE_ENV = process.env.NODE_ENV ?? "development";

// const server = Bun.serve({
//   port: PORT,
//   fetch() {
//     return new Response("Welcome to Bun, DJ!");
//   },
// });

// console.log(`[${NODE_ENV}] Serving http://localhost:${server.port}`);

const server = Bun.serve<{ username: string }>({
    fetch(req, server) {
      const cookies = req.headers.get("cookie");
      const username = new Date().toISOString(); // TODO: getUsernameFromCookies(cookies);
      const success = server.upgrade(req, { data: { username } });
      if (success) return undefined;
  
      return new Response("Hello world");
    },
    websocket: {
      open(ws) {
        const msg = `${ws.data.username} has entered the chat`;
        ws.subscribe("the-group-chat");
        ws.publish("the-group-chat", msg);
      },
      message(ws, message) {
        // the server re-broadcasts incoming messages to everyone
        ws.publish("the-group-chat", `${ws.data.username}: ${message}`);
      },
      close(ws) {
        const msg = `${ws.data.username} has left the chat`;
        server.publish("the-group-chat", msg);
        ws.unsubscribe("the-group-chat");
      },
    },
  });
  
  console.log(`Listening on ${server.hostname}:${server.port}`);
  