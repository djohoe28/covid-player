import React from "react";
function FileZone({
	value = undefined,
	setValue = undefined,
	id = "inputFile",
}) {
	const [local, setLocal] = useState({ value }); // TODO: Make sure that local doesn't get redefined to value.
	return (
		<>
			<input
				id={id}
				name={id}
				type="file"
                onInput={}
			/>
			<label for={id}>= {value}</label>
		</>
	);
}
export default FileZone;
