export default function Range(props) {
    return <input type="range" {...props} className={`${props.className ? props.className : ""}`} />
}