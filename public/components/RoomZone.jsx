const React = require("react");
function RoomZone({ room, setRoom, message, setMessage }) {
	return (
		<>
			<InputZone
				value={room}
				setValue={setRoom}
				id="inputRoom"
				type="text"
				placeholder="Room ID"
			/>
			<InputZone
				value={message}
				setValue={setMessage}
				id="inputMessage"
				type="text"
				placeholder="Message Text"
			/>
		</>
	);
}
export default RoomZone;
