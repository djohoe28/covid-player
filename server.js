const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors"); // Import the cors package
const path = require("path");

const app = express();
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "/index.html"));
});
app.use(express.static(path.join(__dirname, "public")));
const server = http.createServer(app);

const CLIENT_PROTOCOL = "https";
const CLIENT_HOSTNAME = "covid-player-server.onrender.com";
const CLIENT_PORT = 10000;
const CLIENT_URL = new URL(
	`${CLIENT_PROTOCOL}://${CLIENT_HOSTNAME}` // :${CLIENT_PORT}
);
const io = socketIo(server, {
	cors: {
		origin: "*", // TODO: Use CLIENT_URL instead.
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
const port = process.env.PORT || 3000;
server.listen(port, () => {
	console.log(`Server is running on port ${port}...`);
});
