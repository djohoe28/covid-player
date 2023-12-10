export default function Button(props) {
    return <input type="button" {...props} className={`bg-red-500 ${props.className ? props.className : ""}`} />
}