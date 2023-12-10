"use client";
import { useRef } from "react"
import Button from "./UI/Button";
import Range from "./UI/Range";

export default function Player({props}) {
    const videoRef = useRef(null)
    return (
        <div>
            <video ref={videoRef}></video>
            <div>
                <Button name={"play"} defaultValue={"Play"} />
                <Button name={"pause"} defaultValue={"Pause"} />
                <label htmlFor={"Volume"}>Seeker</label>
                <Range name={"volume"} defaultValue={100} min={0} max={100} step={1} />
                <label htmlFor={"seeker"}>Seeker</label>
                <Range name={"seeker"} defaultValue={0} min={0} max={1} step={0.1} />
            </div>
        </div>
    )
}