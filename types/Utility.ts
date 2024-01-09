const DEBUG = false;

export function debug(object: any) {
	if (DEBUG) {
		console.log(object);
	}
}

export function toHhMmSs(seconds: number) {
	// TODO: Come up with more permanent / performant solution?
	return new Date(seconds * 1000).toISOString().slice(11, 19);
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(min, value), max);
}
