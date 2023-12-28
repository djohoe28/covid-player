"use client";
import { useEffect, useRef, useState } from "react";
import {
	Button,
	MenuItem,
	Paper,
	Select,
	Slider,
	Stack,
	ToggleButton,
	Typography,
	styled,
} from "@mui/material";
import {
	VolumeUp,
	PlayArrow,
	Pause,
	Source,
	Fullscreen,
	CloudUpload,
} from "@mui/icons-material";
import { convertSeconds } from "../../app/utilities";
import { sources } from "../../app/sources";

const volumeMarks = Array.from(Array(11).keys(), (x) => {
	return {
		value: x * 10,
	};
});

const selectSource = Object.keys(sources).map((value, index) => (
	<MenuItem key={index} value={sources[value]}>
		{value}
	</MenuItem>
));

const VisuallyHiddenInput = styled("input")({
	clip: "rect(0 0 0 0)",
	clipPath: "inset(50%)",
	height: 1,
	overflow: "hidden",
	position: "absolute",
	bottom: 0,
	left: 0,
	whiteSpace: "nowrap",
	width: 1,
});

export default function VideoWrapper({ props }) {
	const videoRef = useRef(null);
	const [paused, setPaused] = useState(true);
	const [volume, setVolume] = useState(50);
	const [currentTime, setCurrentTime] = useState(5025);
	const [duration, setDuration] = useState(12388);
	const [source, setSource] = useState(sources.UHD_16_09);
	const handleDurationChange = (e) => {
		setDuration(e.target.duration);
	};
	const handleLoadClick = () => {};
	const handleFullscreenClick = () => {};
	const handlePlay = () => {
		console.log(!videoRef.current?.paused ? "Play" : "Playing");
		setPaused(false);
	};
	const handlePause = () => {
		console.log(videoRef.current?.paused ? "Pause" : "Pausing");
		setPaused(true);
	};
	const handleTimeUpdate = (e) => {
		if (videoRef.current) {
			setCurrentTime(e.target.currentTime);
		}
	};
	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.volume = volume * 0.01;
		}
	}, [volume]);
	useEffect(() => {
		setCurrentTime(0);
		setPaused(true);
		videoRef.current?.load();
	}, [source]);

	return (
		<Paper variant="outlined" sx={{ padding: 1 }}>
			<Stack
				direction={"column"}
				spacing={1.2}
				height={"82vh"}
				marginBottom={1}
			>
				<Paper variant="outlined">
					<video
						ref={videoRef}
						// controls
						onDurationChange={handleDurationChange}
						onTimeUpdate={handleTimeUpdate}
						onPause={handlePause}
						onPlay={handlePlay}
						width={"100%"}
						height={"484vh"}
						style={{
							objectFit: "contain",
						}}
					>
						<source src={source}></source>
						{/** TODO: Constrain width to avoid source overwrite. Use slider. */}
						{/* onChange -> infinite loop (videoRef.current?.load()) */}
					</video>
				</Paper>
				<Paper
					variant="outlined"
					sx={{
						paddingTop: 0.3,
						paddingLeft: 2,
						paddingRight: 0.5,
						paddingBottom: 0.5,
					}}
				>
					<Stack direction={"row"} spacing={2} alignItems="center">
						<Slider
							aria-label="Position"
							value={currentTime}
							min={0}
							max={duration}
							step={0.1}
							onChange={(_e, newTime) => {
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
				</Paper>
				<Stack
					direction={"row"}
					spacing={1}
					marginBottom={1}
					alignItems="center"
				>
					<ToggleButton
						title={paused ? "Play" : "Pause"}
						aria-label={paused ? "Play" : "Pause"}
						value={!paused}
						selected={paused}
						onChange={(_e, pause) => {
							pause
								? videoRef.current?.pause()
								: videoRef.current?.play();
							// setPaused(pause);
						}}
					>
						{paused ? <PlayArrow /> : <Pause />}
					</ToggleButton>
					<VolumeUp />
					<Slider
						aria-label="Volume"
						marks={volumeMarks}
						value={volume}
						min={0}
						max={100}
						step={1}
						onChange={(_e, value) => setVolume(value)}
					/>
					<Typography minWidth={"2em"} align={"center"}>
						{volume}
					</Typography>
					<Button
						component="label"
						variant="outlined"
						startIcon={<CloudUpload />}
						sx={{ paddingX: 5 }}
					>
						File
						<VisuallyHiddenInput
							type="file"
							accept="video/*"
							onInput={(e) =>
								setSource(
									URL.createObjectURL(e.target.files[0])
								)
							}
						/>
					</Button>
					<Typography noWrap width={"300vw"}>
						{source}
					</Typography>
					<Button
						component="label"
						variant="outlined"
						startIcon={<Source />}
						sx={{ paddingX: 5 }}
					>
						Link
					</Button>
					<Button
						title="Go fullscreen"
						aria-label="Fullscreen"
						onClick={handleFullscreenClick}
					>
						<Fullscreen />
					</Button>
				</Stack>
				{/* <Select
				title="Select video source"
				fullWidth
				value={source}
				onChange={(e) => setSource(e.target.value)}
			>
				{selectSource}
			</Select> */}
			</Stack>
		</Paper>
	);
}
