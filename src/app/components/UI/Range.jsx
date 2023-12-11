export default function Range(props) {
    return <input type="range" {...props} className={`video-range ${props.className ? props.className : ""}`} />
}