export default function Button(props) {
    return <input type="button" {...props} className={`video-button ${props.className ? props.className : ""}`} />
}