// src/main.ts
var exports_main = {};
var toHhMmSs = function(seconds) {
  return new Date(seconds * 1000).toISOString().slice(11, 19);
};
var log = function(object) {
  let element = document.createElement("p");
  element.textContent = JSON.stringify(object).toString();
  chatArea?.appendChild(element);
};
var debug = function(object) {
  if (DEBUG) {
    console.log(object);
  }
};
var currySocketOpen = function(ws) {
  return function(event) {
    log("Open:");
    log(event.type);
    debug(event);
    ws.send("Hello World!");
  };
};
var currySocketClose = function(ws) {
  return function(event) {
    log("Close:");
    log(event.wasClean);
    debug(event);
    ws.send("Goodbye!");
  };
};
var currySocketError = function(ws) {
  return function(event) {
    log("Error:");
    log(event.type);
    debug(event);
    ws.send("Error!");
  };
};
var currySocketMessage = function(ws) {
  return function(event) {
    log("Message:");
    log(event.data);
    debug(event);
    debug(ws);
  };
};
var getNewSocket = function(address = "ws://localhost:8081") {
  let ws = new WebSocket(address);
  ws.addEventListener("open", currySocketOpen(ws));
  ws.addEventListener("close", currySocketClose(ws));
  ws.addEventListener("error", currySocketError(ws));
  ws.addEventListener("message", currySocketMessage(ws));
  return ws;
};
var getState = function(props) {
  let timestamp = new Date().getTime();
  return {
    paused: playVideo?.paused,
    currentTime: playVideo?.currentTime,
    timestamp,
    ...props
  };
};
var sendState = function(props) {
  let state = getState(props);
  console.log(state);
  socket.send(JSON.stringify(state));
};
var setState = function(state) {
  let timestamp = new Date().getTime();
  let latency = timestamp - state.timestamp;
  if (state.paused != playVideo.paused) {
    state.paused ? playVideo.pause() : playVideo.play();
  }
  if (Math.abs(playVideo.currentTime - state.currentTime) > MAX_DELTA) {
    playVideo.currentTime = Math.max(0, Math.min(playVideo.duration, state.currentTime + latency));
  }
};
var getMessage = function(message) {
  if (!message || message == "") {
    return;
  }
  log(message);
  sendInput.value = "";
};
var sendMessage = function() {
  if (sendInput.value && sendInput.value != "") {
    let message = sendInput.value;
    getMessage(message);
    socket.send(message);
  }
};
var togglePause = function() {
  let paused = !playVideo.paused;
  playVideo.paused ? playVideo.play() : playVideo.pause();
  sendState({ paused });
};
var DEBUG = true;
var MAX_DELTA = 1000;
var playVideo = document.getElementById("playVideo");
var playSource = document.getElementById("playSource");
var pauseButton = document.getElementById("pauseButton");
var volumeInput = document.getElementById("volumeInput");
var timeInput = document.getElementById("timeInput");
var loadText = document.getElementById("loadText");
var loadFile = document.getElementById("loadFile");
var durationText = document.getElementById("durationText");
var currentTimeText = document.getElementById("currentTimeText");
var chatArea = document.getElementById("chatArea");
var sendInput = document.getElementById("sendInput");
var sendButton = document.getElementById("sendButton");
sendButton.addEventListener("click", sendMessage);
sendInput.addEventListener("keydown", (e) => {
  if (e.code == "Enter") {
    if (!e.shiftKey) {
      sendMessage();
    }
  }
});
sendInput.addEventListener("blur", () => {
  if (sendInput.value == "") {
    sendInput.value = "";
  }
});
playVideo.addEventListener("durationchange", () => {
  timeInput.max = "" + playVideo.duration;
  timeInput.step = "" + playVideo.duration / 100;
  durationText.innerHTML = toHhMmSs(playVideo.duration);
});
playVideo.addEventListener("timeupdate", () => {
  timeInput.value = "" + playVideo.currentTime;
  currentTimeText.innerHTML = toHhMmSs(playVideo.currentTime);
});
pauseButton.addEventListener("click", togglePause);
playVideo.addEventListener("click", togglePause);
volumeInput.addEventListener("input", () => {
  playVideo.volume = parseInt(volumeInput.value) / 100;
});
timeInput.addEventListener("input", () => {
  playVideo.currentTime = parseInt(timeInput.value);
  sendState({ currentTime: timeInput.value });
});
loadText.addEventListener("click", () => {
  let url = prompt("Enter video source address:");
  if (!url || url == "")
    return;
  playSource.src = url;
  playVideo.load();
  sendState({
    src: url
  });
});
loadFile.addEventListener("input", () => {
  if (!loadFile.files || !loadFile.files[0])
    return;
  let url = URL.createObjectURL(loadFile.files[0]);
  playSource.src = url;
  playVideo.load();
  sendState({
    src: loadFile.files[0].name
  });
});
var socket = getNewSocket();
setTimeout(() => {
  const socket2 = getNewSocket();
  exports_main.socket2 = socket2;
}, 1000);
exports_main = { setState, WebSocket, socket };
