export default function Range(props) {
    return <input type="range" {...props} className={`appearance-none rounded-lg dark:bg-gray-700 ${props.className ? props.className : ""}`} />
}