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
	const inputRef = useRef(null);
	const [paused, setPaused] = useState(true);
	const [volume, setVolume] = useState(100);
	const [currentTime, setCurrentTime] = useState(5025);
	const [duration, setDuration] = useState(12388);
	const [source, setSource] = useState(sources._16_09);
	const [title, setTitle] = useState(sources._16_09);
	const sendReport = (state) => {
		let stateReport = {
			paused: paused,
			currentTime: currentTime,
			title: title,
			...state,
		};
		console.log(stateReport); // TODO: Add to messages?
	};
	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.volume = volume * 0.01;
		}
	}, [volume]);
	useEffect(() => {
		// TODO: Refactor?
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
						onDurationChange={(e) => setDuration(e.target.duration)}
						onTimeUpdate={(e) =>
							setCurrentTime(e.target.currentTime)
						}
						onPause={() => setPaused(true)}
						onPlay={() => setPaused(false)}
						onClick={(e) => {
							e.target.paused
								? e.target.play()
								: e.target.pause();
							sendReport({
								paused: e.target.paused,
								type: "video.onClick",
							});
						}}
						onLoadedMetadata={() => {}} // TODO: OnSourceChanged?
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
									videoRef.current.currentTime = newTime;
								}
								setCurrentTime(newTime);
								// TODO: Allow enabling of sendState onChange.
							}}
							onChangeCommitted={(_e, newTime) =>
								sendReport({
									currentTime: newTime,
									type: "currentTime.onChangeCommitted",
								})
							}
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

							sendReport({
								paused: pause,
								type: "togglePause.onChange",
							});
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
							ref={inputRef}
							type="file"
							accept="video/*"
							onInput={(e) => {
								let file = e.target.files[0];
								if (file) {
									let src = URL.createObjectURL(file);
									setSource(src);
									setTitle(file.name);
									// TODO: receiveState -> Open File Input and request Title.
									sendReport({
										title: file.name,
										type: "inputFile.onInput",
									});
								}
							}}
						/>
					</Button>
					<Typography noWrap width={"300vw"}>
						{title}
					</Typography>
					<Button
						component="label"
						variant="outlined"
						startIcon={<Source />}
						sx={{ paddingX: 5 }}
						onClick={() => {
							// TODO: blocks.
							let src = prompt(
								"Enter video source link:",
								source
							);
							if (inputRef.current) {
								inputRef.current.value = null; // TODO: Allow file reload after link.
							}
							if (src) {
								setSource(src);
								setTitle(src);
								sendReport({
									title: src,
									type: "inputLink.onInput",
								});
							}
						}}
					>
						Link
					</Button>
					<Button
						title="Go fullscreen"
						aria-label="Fullscreen"
						onClick={() => {}} // TODO: Implement fullscreen.
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
