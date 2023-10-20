import React from "react";
import RoomZone from "./RoomZone";
import WatchZone from "./WatchZone";
import SourceZone from "./SourceZone";
function App() {
	const refVideo = useRef(null);
	const refChat = useRef(null);
	const [room, setRoom] = useState("Entrance Hall");
	const [message, setMessage] = useState("Hello World!");
	const [delta, setDelta] = useState(1.0 / 60.0);
	const [source, setSource] = useState(
		"https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a7/How_to_make_video.webm/How_to_make_video.webm.720p.vp9.webm"
	);
	function onDurationChangeCapture(event) {
		console.log(event);
	}
	function onAction(event) {
		console.log(event);
	}
	return (
		<>
			<RoomZone
				room={room}
				setRoom={setRoom}
				message={message}
				setMessage={setMessage}
			/>
			<SourceZone
				delta={delta}
				setDelta={setDelta}
				source={source}
				setSource={setSource}
			/>
			<div
				onDurationChangeCapture={onDurationChangeCapture}
				onPlayCapture={onAction}
				onPauseCapture={onAction}
				onSeekedCapture={onAction}
			>
				<WatchZone refVideo={refVideo} refChat={refChat} />
			</div>
		</>
	);
}
export default App;
