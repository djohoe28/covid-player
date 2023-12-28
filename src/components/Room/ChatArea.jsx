"use client";
import { Button, ListItem, ListItemButton, ListItemText, Stack, TextField } from "@mui/material";
import { Send } from "@mui/icons-material";
import { useRef, useState } from "react";

function renderRow(props) {
	const { index, style } = props;
	return (
		<ListItem style={style} key={index} component="div" disablePadding>
			<ListItemButton>
				<ListItemText primary={`Item ${index + 1}`.repeat(index + 1)} />
			</ListItemButton>
		</ListItem>
	);
}

export default function ChatArea({ props }) {
	const inputRef = useRef(null);
	const [message, setMessage] = useState("");
	const sendMessage = () => {
		console.log(message);
		setMessage("");
	};
	return (
		<Stack direction={"column"} spacing={2} marginBottom={1}>
			<Stack direction={"row"} spacing={2} marginBottom={1}>
				<TextField
					ref={inputRef}
					fullWidth
					placeholder="Enter message..."
					title="Message Input"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && sendMessage()}
				/>
				<Button
					title="Send message"
					aria-label="Send"
					onClick={sendMessage}
				>
					<Send />
				</Button>
			</Stack>
		</Stack>
	);
}
