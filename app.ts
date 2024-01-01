// import "./src/main.ts";
// NOTE: This is to assure that `main.ts` is watched, bundled, and Hot Reloaded when changes are made.
// TODO: Remove this before production, probably.

const PORT: number = +(process.env['PORT'] || 8081);
const NODE_ENV = process.env.NODE_ENV ?? "development";

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
  console.log(cookies);
  return `User#${userCount}`;
}

const server = Bun.serve<{ username: string }>({
  port: PORT,
  fetch(req, server) {
    const cookies = req.headers.get("cookie");
    const username = getUsernameFromCookies(cookies);
    const success = server.upgrade(req, { data: { username } });
    if (success) {
      userCount += 1;
      return undefined;
    }
    return serve(req);
    // return new Response("Hello world");
  },
  websocket: {
    open(ws) {
      const msg = `${ws.data.username} has entered the chat`;
      console.log(msg);
      ws.subscribe("the-group-chat");
      server.publish("the-group-chat", msg); // TODO: ws.publish?
    },
    message(ws, message) {
      // the server re-broadcasts incoming messages to everyone
      const msg = message; // TODO: add timestamp? ArrayBuffer? Stringify?
      console.log(`${ws.data.username}: ${msg}`);
      server.publish("the-group-chat", msg); // TODO: ws.publish?
    },
    close(ws) {
      const msg = `${ws.data.username} has left the chat`;
      console.log(msg);
      server.publish("the-group-chat", msg);
      ws.unsubscribe("the-group-chat");
    },
  },
});
console.log(`Listening on http://${server.hostname}:${server.port}`);
