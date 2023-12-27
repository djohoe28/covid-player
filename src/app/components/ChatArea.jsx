"use client";
import { Button, Input, Stack } from "@mui/material";
import { Send } from "@mui/icons-material";

export default function ChatArea({ props }) {
	return (
		<Stack direction={"column"} spacing={2} marginBottom={1}>
			<Stack direction={"row"} spacing={2} marginBottom={1}>
				<Input
					type="text"
					fullWidth
					placeholder="Enter message..."
					title="Message Input"
				/>
				<Button title="Send message" aria-label="Send">
					<Send />
				</Button>
			</Stack>
		</Stack>
	);
}
