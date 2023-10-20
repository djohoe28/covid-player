const React = require("react");
const InputZone = require("InputZone");
function SourceZone({ delta, setDelta, source, setSource }) {
	return (
		<>
			<InputZone
				value={delta}
				setValue={setDelta}
				id="inputDelta"
				type="number"
				placeholder="Delta Threshold"
			/>
			<input
				id="inputFile"
				type="file"
				onInput={(event)=>{setSource(URL.createObjectURL(event.target.files[0]))}}
			/>
			<InputZone
				value={source}
				setValue={setSource}
				id="inputSource"
				type="text"
				placeholder="Video Source"
			/>
		</>
	);
}
export default SourceZone;
