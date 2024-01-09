const WS_ADDRESS = `${location.protocol.includes("https") ? "wss:" : "ws:"}//${
	location.host
}`;
const playVideo = document.getElementById("playVideo") as HTMLVideoElement;
const playSource = document.getElementById("playSource") as HTMLSourceElement;
const pauseButton = document.getElementById("pauseButton") as HTMLButtonElement;
const volumeInput = document.getElementById("volumeInput") as HTMLInputElement;
const timeInput = document.getElementById("timeInput") as HTMLInputElement;
const loadText = document.getElementById("loadText") as HTMLButtonElement;
const loadFile = document.getElementById("loadFile") as HTMLInputElement;
const durationText = document.getElementById("durationText") as HTMLSpanElement;
const currentTimeText = document.getElementById(
	"currentTimeText"
) as HTMLSpanElement;
const chatArea = document.getElementById("chatArea") as HTMLTextAreaElement;
const sendInput = document.getElementById("sendInput") as HTMLInputElement;
const sendButton = document.getElementById("sendButton") as HTMLButtonElement;
const blockerVideo = document.getElementById("blockerVideo") as HTMLDivElement;
const blockerLoad = document.getElementById("blockerLoad") as HTMLDivElement;

/**
 * TODO: Use mitata for benchmarking WSS de/compressed VS uncompressed
 * TODO: check load times of HTML VS HTML-in-JS. (vis-a-vis Render spin-down)
 * SEE: https://bun.sh/docs/project/benchmarking#benchmarking-tools
 * TODO: Add FTP server-client?
 * TODO: Make Server manage synchronization?
 * TODO: BunFile not assignable to File // SEE: https://github.com/oven-sh/bun/issues/5980
 * TODO: appears like latency - even paused - is ~3sec
 */
/**
 * TODO: Deprecation notice from Google Chrome:
 * The Expect-CT header is deprecated and will be removed. Chrome requires Certificate Transparency for all publicly trusted certificates issued after April 30, 2018.
 * 1 source - localhost/:0
 * Learn more: Check the feature status page for more details. = https://chromestatus.com/feature/6244547273687040
 * Learn more: This change will go into effect with milestone 107. = https://chromiumdash.appspot.com/schedule
 */