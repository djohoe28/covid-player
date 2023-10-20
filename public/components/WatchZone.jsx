import React from "react";
function WatchZone({ refChat, refVideo }) {
	return (
		<>
			<video ref={refVideo}></video>
			<textarea ref={refChat}></textarea>
		</>
	);
}
export default WatchZone;
