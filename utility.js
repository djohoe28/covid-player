// Not in use.
const defaultUrl = {
	protocol: "http",
	hostname: "localhost",
	port: undefined,
	pathname: undefined,
	search: undefined,
	hash: undefined,
	username: undefined,
	password: undefined,
};

function assurePrefix(str, pre) {
    if (!pre) return str;
	if (str.startsWith(pre)) { return str; }
	return pre + str;
}

function assureSuffix(str, suf) {
    if (!suf) return str;
	if (str.endsWith(suf)) { return str; }
	return str + suf;
}

function appendIfExists(str, obj, prop, pre, suf) {
    if (!obj[prop]) return str;
    let toAdd = obj[prop];
    toAdd = assurePrefix(toAdd, pre);
    toAdd = assureSuffix(toAdd, suf);
    return str + toAdd;
}

function getCredentials(username, password) {
    appendIfExists((username ?? "") + ":", {password: password}, "password", undefined, "@")
    if (username && password) { return `${username}:${password}@`; }
    if (!username && password) { return `:${password}@`; }
    if (username && !password) { return `${username}:@`; }
    return "";
}

function getUrl(obj) {
	let args = { ...defaultUrl, ...obj };
    let str = assureSuffix(args.protocol, ":") + getCredentials(args.username, args.password) + assurePrefix(args.hostname, "//");
	appendIfExists(str, args, "pathname", "/", "/");
    appendIfExists(str, args, "search", "?"); // TODO: Implement search arguments[]
    appendIfExists(str, args, "hash", "#");
	let url = new URL(str);
	return url;
}