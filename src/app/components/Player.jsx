"use client";
import { useRef, useState } from "react";
import {
	Slider,
	Stack,
	ToggleButton,
	Typography,
} from "@mui/material";
import { VolumeUp, Timelapse, PlayArrow, Pause } from "@mui/icons-material";

export default function Player({ props }) {
	const videoRef = useRef(null);
	const [paused, setPaused] = useState(true);
	const [volume, setVolume] = useState(100);
	const [position, setPosition] = useState(0);
	return (
		<div>
			<video ref={videoRef}></video>
			<div>
				<ToggleButton
					value="paused"
					selected={paused}
					onChange={() => {
						setPaused(!paused);
					}}
				>
					{paused ? <Pause color="action" /> : <PlayArrow color="action" />}
                    {/* TODO: color="action" seems to be black on the black background? */}
				</ToggleButton>
				<Stack
					spacing={2}
					direction="row"
					sx={{ mb: 1 }}
					alignItems="center"
				>
					<VolumeUp />
					<Slider
						aria-label="Volume"
						marks
						defaultValue={volume}
						min={0}
						max={100}
						step={1}
						onChange={(e, value) => setVolume(value)}
					/>
					<Typography>{volume}</Typography>
				</Stack>
				<Stack
					spacing={2}
					direction="row"
					sx={{ mb: 1 }}
					alignItems="center"
				>
					<Timelapse />
					<Slider
						aria-label="Position"
						defaultValue={position}
						min={0}
						max={60}
						step={0.1}
						onChange={(e, value) => setPosition(value)}
					/>
					<Typography>{position}</Typography>
				</Stack>
			</div>
		</div>
	);
}
