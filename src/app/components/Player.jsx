"use client";
import { useEffect, useRef, useState } from "react";
import {
	Button,
	Grid,
	Input,
	MenuItem,
	Select,
	Slider,
	Stack,
	ToggleButton,
	Typography,
} from "@mui/material";
import {
	VolumeUp,
	PlayArrow,
	Pause,
	Source,
	Fullscreen,
	Send,
} from "@mui/icons-material";
import { convertSeconds } from "../utilities";
import { sources } from "../sources";

export default function Player({ props }) {
	const videoRef = useRef(null);
	const [paused, setPaused] = useState(true);
	const [volume, setVolume] = useState(50);
	const [currentTime, setCurrentTime] = useState(5025);
	const [duration, setDuration] = useState(12388);
	const [source, setSource] = useState(sources._16_09);
	const handleDurationChange = (e) => {
		setDuration(e.target.duration);
	};
	const handleSourceChange = () => {
		setCurrentTime(0);
		setPaused(true);
		videoRef.current?.load();
	};
	useEffect(handleSourceChange, [source]); // TODO: Replace all calls to setSource with mySetSource?
	useEffect(() => {
		console.log(videoRef.current?.paused ? "Paused" : "Playing");
	}, [videoRef.current?.paused]);
	useEffect(() => {
		console.log(videoRef.current?.currentTime);
	}, [videoRef.current?.currentTime]);
	return (
		<Grid
			container
			marginBottom={1}
			spacing={2}
			// direction={{xs: "column", sm: "row"}}
			sx={{
				flexDirection: {
					xs: "column",
					sm: "row",
				},
			}}
			alignItems={"center"}
			{...props}
		>
			<Grid item xs={8}>
				<Stack direction={"column"} spacing={2} marginBottom={1}>
					<video
						ref={videoRef}
						controls
						onDurationChange={handleDurationChange}
						width={"100%"}
						height={"360vh"}
						style={{
							objectFit: "contain",
						}}
					>
						<source src={source}></source>
						{/** TODO: Constrain width to avoid source overwrite. Use slider. */}
						{/* onChange -> infinite loop (videoRef.current?.load()) */}
					</video>
					<Stack
						direction={"row"}
						spacing={2}
						marginBottom={1}
						alignItems="center"
					>
						<Slider
							aria-label="Position"
							value={currentTime}
							min={0}
							max={duration}
							step={0.1}
							onChange={(e, newTime) => {
								if (videoRef.current) {
									// TODO: videoRef.current?.currentTime
									videoRef.current.currentTime = newTime;
								}
								setCurrentTime(newTime);
							}}
						/>
						<Typography minWidth={"9em"}>
							{convertSeconds(currentTime)} /{" "}
							{convertSeconds(duration)}
						</Typography>
					</Stack>
					<Stack
						direction={"row"}
						spacing={2}
						marginBottom={1}
						alignItems="center"
					>
						<ToggleButton
							title={paused ? "Play" : "Pause"}
							aria-label={paused ? "Play" : "Pause"}
							value={!paused}
							selected={paused}
							onChange={(e, pause) => {
								if (pause) {
									videoRef.current?.pause(); // TODO: videoRef.current?.pause();
								} else {
									videoRef.current?.play(); // TODO: videoRef.current?.play();
								}
								setPaused(pause);
							}}
						>
							{paused ? <PlayArrow /> : <Pause />}
						</ToggleButton>
						<VolumeUp />
						<Slider
							aria-label="Volume"
							marks={Array.from(Array(11).keys(), (x) => {
								return {
									value: x * 10,
								};
							})}
							value={volume}
							min={0}
							max={100}
							step={1}
							onChange={(e, value) => setVolume(value)}
						/>
						<Typography minWidth={"2em"}>{volume}</Typography>
						<Button
							startIcon={<Source />}
							onClick={() => console.log(source)}
							title="Load a video source"
							aria-label="Load"
						>
							Load
						</Button>
						<Typography noWrap>{source}</Typography>
						<Button title="Go fullscreen" aria-label="Fullscreen">
							<Fullscreen />
						</Button>
					</Stack>
				</Stack>
			</Grid>
			<Grid item xs={4}>
				<Stack direction={"column"} spacing={2} marginBottom={1}>
					<Select
						title="Select video source"
						fullWidth
						value={source}
						onChange={(e) => setSource(e.target.value)}
						// TODO: handleChange -> setSource -> videoRef.current?.src = e.target.value;
					>
						{Object.keys(sources).map((value, index) => (
							<MenuItem key={index} value={sources[value]}>
								{value}
							</MenuItem>
						))}
					</Select>
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
			</Grid>
		</Grid>
	);
}
