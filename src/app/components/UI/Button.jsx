export default function Button(props) {
    return <input type="button" {...props} className={`rounded px-1 mx-0.5 dark:text-slate-300 dark:bg-slate-900 ${props.className ? props.className : ""}`} />
}