import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors"; // Import the cors package
import path from "path";

const app = express();
app.get("/", (req, res) => {
	res.sendFile(path.join(path.dirname, "/index.html"));
});
app.use(express.static(join(__dirname, "public")));
const server = createServer(app);

const CLIENT_PROT = process.env.PROT || "http";
const CLIENT_HOST = process.env.SELF || "localhost";
const CLIENT_PORT = process.env.PORT || 10000; // TODO: Merge ports?
const SERVER_PORT = process.env.PORT || 3000; // See above.
const CLIENT_URL = new URL(`${CLIENT_PROT}://${CLIENT_HOST}:${CLIENT_PORT}`); // TODO: try-catch?
const io = Server(server, {
	cors: {
		origin: process.env.CORS || process.env.SELF || CLIENT_URL.href || "*",
	},
});
io.use((socket, next) => {
	const origin = socket.request.headers.origin;
	next();
});
// io.origins("*:*");

io.on("connection", (socket) => {
	// Handle signaling and peer discovery
	socket.on("message", (message) => {
		io.emit("message", message); // Broadcast the message to all peers in the room
	});
	socket.on("send", (message) => {
		socket.broadcast.emit("sync", message); // TODO: .to(roomId)?
	});
});

// In server.js, add the following for WebRTC signaling

io.on("connection", (socket) => {
	socket.on("joinRoom", (roomId) => {
		// Notify other peers about the new connection
		socket.to(roomId).emit("userJoined", socket.id);
		socket.join(roomId);
	});

	// Handle offer and answer exchange
	socket.on("newIceCandidate", (candidate) => {
		// Handle ICE candidate exchange
		socket.to(roomId).emit("newIceCandidate", candidate);
	});
});

//

server.listen(SERVER_PORT, () => {
	console.log(`Server is running on port ${SERVER_PORT}...`);
});
