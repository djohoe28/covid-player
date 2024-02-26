export function toHhMmSs(seconds: number) {
	// TODO: Come up with more permanent / performant solution?
	return new Date(seconds * 1000).toISOString().slice(11, 19);
}
export function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}