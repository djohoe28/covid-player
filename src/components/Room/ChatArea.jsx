"use client";
import {
	Button,
	Divider,
	List,
	ListItem,
	ListItemText,
	Paper,
	Stack,
	TextField,
} from "@mui/material";
import { Send } from "@mui/icons-material";
import { useRef, useState } from "react";

const messages = [
	"Lorem ipsum dolor sit amet, consectetur adipiscing elit.\nDonec id odio pretium, viverra odio non, finibus tellus.\nDonec vehicula sapien sed orci volutpat porta.",
	// "Nam ac metus tempus, eleifend orci quis, varius metus.\nCurabitur ornare leo id erat dapibus pharetra.\nVestibulum at enim vel leo porttitor rutrum et eget lectus.\nMorbi quis nulla eu quam ultrices posuere.\nSed molestie arcu quis mi tincidunt, sit amet varius est congue.",
	// "Quisque tincidunt nisi eget ipsum pretium, vitae volutpat ligula convallis.\nAliquam aliquam sem ac sapien tempor hendrerit.\nNullam pellentesque magna non diam mattis, ac vulputate erat placerat.\nDonec at diam quis nisi dignissim feugiat quis eget sem.\nDonec varius tortor vel libero rutrum finibus.",
	// "Sed blandit orci volutpat, porta nunc lobortis, gravida tortor.Integer hendrerit metus bibendum, pretium metus non, consequat tortor.",
	// "Fusce vel risus eget sem tristique placerat.\nVestibulum a tortor et ligula fringilla viverra non ac dui.",
	// "Morbi vehicula turpis id convallis egestas.",
	// "Mauris a ligula commodo, mollis leo quis, elementum nunc.\nEtiam faucibus nisi a magna malesuada, quis vestibulum dolor pulvinar.\nIn quis leo in leo imperdiet dictum eu viverra ligula.",
	// "Phasellus viverra quam quis lorem iaculis, eu pharetra nibh tincidunt.",
	// "Aliquam non lacus ut massa gravida dignissim.\nDonec nec turpis tincidunt, scelerisque felis et, accumsan mi.",
	// "Sed id lorem non sapien sodales maximus ut nec urna.\nInteger in tellus ac dolor gravida tristique et eget nisi.",
	// "Vivamus nec odio eu mi aliquam auctor sed ac mi.\nPhasellus efficitur nunc quis leo consequat imperdiet.\nAliquam in augue ultrices arcu placerat interdum eget eget quam.\nPraesent interdum purus et libero pharetra convallis.\nVivamus sed est bibendum risus pulvinar blandit.",
	// "Suspendisse pharetra purus ac pharetra pretium.\nNullam vestibulum magna in nibh laoreet tempor.\nInteger aliquet sapien sit amet lectus posuere, sed semper nulla rutrum.",
	// "Vivamus eget nisl ac nisi maximus suscipit.\nMorbi vitae ligula at lorem fringilla suscipit sed ac justo.\nIn id libero bibendum, maximus odio eget, malesuada elit.\nDonec quis risus ultricies, egestas eros vitae, viverra lacus.\nInteger lacinia purus eu est pulvinar, quis interdum nulla consequat.\nDuis rutrum quam a erat aliquam, in semper leo cursus.",
	// "Integer nec libero at magna iaculis viverra.\nDonec ut mi vel diam molestie pulvinar eget bibendum orci.\nUt scelerisque neque vel dictum placerat.",
	// "Nullam vel ligula quis metus porta ullamcorper in at enim.\nSed eu neque nec ante ultrices sollicitudin non cursus nulla.\nAliquam in nunc non ex scelerisque tristique.",
	// "Quisque eu massa eu libero eleifend lacinia sed sed mi.\nDonec suscipit nisi ac tempus consectetur.\nPhasellus non quam ut lorem rutrum convallis.\nPellentesque ullamcorper ex et mi sollicitudin consequat.\nUt sagittis dolor ac nisl sollicitudin tristique.",
	// "Quisque euismod ipsum in sapien porta vestibulum.\nDonec bibendum felis ut nisi tincidunt, non tempus magna sodales.\nProin elementum orci vel accumsan malesuada.",
	// "Duis porta dui et ligula tincidunt sagittis.\nCurabitur id orci eu purus sagittis gravida ac et erat.\nPhasellus et erat in tortor iaculis rutrum eu cursus diam.\nMauris ac ante et nulla scelerisque finibus.",
	// "Phasellus ultrices ante non libero consectetur, vitae ultricies tortor pharetra.\nEtiam placerat diam eget risus molestie faucibus.",
	// "Vivamus sed metus sit amet lorem ultricies elementum et sit amet tellus.\nMaecenas eleifend dui nec risus rhoncus, in cursus turpis lacinia.\nNulla rutrum tortor in tortor posuere, vehicula bibendum nunc interdum.",
];

export default function ChatArea({ props }) {
	const inputRef = useRef(null);
	const [message, setMessage] = useState("");
	const sendMessage = () => {
		console.log(message);
		setMessage("");
	};
	return (
		<Stack
			direction={"column"}
			spacing={2}
			marginBottom={1}
			alignContent={"start"}
		>
			<Paper variant="outlined">
				<List
					sx={{
						height: 537.5,
						overflowY: "scroll"
					}}
				>
					{messages.map((value, index) => {
						return (
							<ListItem key={index}>
								<ListItemText>
									{index}. {value}
								</ListItemText>
								<Divider />
							</ListItem>
						);
					})}
				</List>
			</Paper>
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
					variant="outlined"
				>
					<Send />
				</Button>
			</Stack>
		</Stack>
	);
}
