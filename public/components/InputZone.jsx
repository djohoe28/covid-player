const React = require("react");
function InputZone({
	value = undefined,
	setValue = undefined,
	id = "input",
	type = "text",
	placeholder = "Enter value here...",
}) {
	const [local, setLocal] = React.useState({ value }); // TODO: Make sure that local doesn't get redefined to value.
	return (
		<>
			<input
				id={id}
				name={id}
				type={type}
				value={local}
				placeholder={placeholder}
				onBlur={setValue(local)}
				onChange={(event) => {
					setLocal(event.target.value);
				}}
			/>
			<label for={id}>= {value}</label>
		</>
	);
}
export default InputZone;
