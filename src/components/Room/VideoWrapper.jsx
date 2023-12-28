"use client";
import { useEffect, useRef, useState } from "react";
import {
	Button,
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

export default function VideoWrapper({ props }) {
	const videoRef = useRef(null);
	const [paused, setPaused] = useState(true);
	const [volume, setVolume] = useState(50);
	const [currentTime, setCurrentTime] = useState(5025);
	const [duration, setDuration] = useState(12388);
	const [source, setSource] = useState(sources._16_09);
	const handleDurationChange = (e) => {
		setDuration(e.target.duration);
	};
	const handleLoadClick = () => {};
	const handleFullscreenClick = () => {};
	useEffect(() => {
        setCurrentTime(0);
		setPaused(true);
		videoRef.current?.load();
    }, [source]);
	useEffect(() => {
		console.log(videoRef.current?.paused ? "Paused" : "Playing");
	}, [videoRef.current?.paused]);
	useEffect(() => {
		console.log(videoRef.current?.currentTime);
	}, [videoRef.current?.currentTime]);
	return (
		<Stack direction={"column"} spacing={2} marginBottom={1}>
			<video
				ref={videoRef}
				// controls
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
					onChange={(_e, newTime) => {
						if (videoRef.current) {
							// TODO: videoRef.current?.currentTime
							videoRef.current.currentTime = newTime;
						}
						setCurrentTime(newTime);
					}}
				/>
				<Typography minWidth={"9em"}>
					{convertSeconds(currentTime)} / {convertSeconds(duration)}
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
					onChange={(_e, pause) => {
                        pause ? videoRef.current?.pause() : videoRef.current?.play();
						setPaused(pause);
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
				<Typography minWidth={"2em"}>{volume}</Typography>
				<Button
					startIcon={<Source />}
					onClick={handleLoadClick}
					title="Load a video source"
					aria-label="Load"
				>
					Load
				</Button>
				<Typography noWrap>{source}</Typography>
				<Button
					title="Go fullscreen"
					aria-label="Fullscreen"
					onClick={handleFullscreenClick}
				>
					<Fullscreen />
				</Button>
			</Stack>
			<Select
				title="Select video source"
				fullWidth
				value={source}
				onChange={(e) => setSource(e.target.value)}
			>
				{selectSource}
			</Select>
		</Stack>
	);
}
