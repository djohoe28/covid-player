const DEBUG = false;

function debug(object: any) {
	if (DEBUG) {
		console.log(object);
	}
}

export function toHhMmSs(seconds: number) {
	// TODO: Come up with more permanent / performant solution?
	return new Date(seconds * 1000).toISOString().slice(11, 19);
}