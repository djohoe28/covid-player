var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);

// types/Message.ts
class Message {
  sender;
  data;
  timestamp;
  mType;
  constructor(sender = "", data = null, timestamp = Date.now(), mType = MessageType.MESSAGE) {
    this.sender = sender;
    this.data = data;
    this.timestamp = timestamp;
    this.mType = mType;
  }
  stringify() {
    const { sender, data, timestamp, mType } = this;
    return JSON.stringify({ sender, data, timestamp, mType });
  }
  static stringify(message) {
    const { sender, data, timestamp, mType } = message;
    return JSON.stringify({ sender, data, timestamp, mType });
  }
  toString() {
    return `${this.mType} | ${this.sender} @ ${this.timestamp} : ${this.data}`;
  }
}
var MessageType;
var init_Message = __esm(() => {
  (function(MessageType2) {
    MessageType2[MessageType2["MESSAGE"] = 0] = "MESSAGE";
    MessageType2[MessageType2["LOG_MESSAGE"] = 1] = "LOG_MESSAGE";
    MessageType2[MessageType2["OPEN_MESSAGE"] = 2] = "OPEN_MESSAGE";
    MessageType2[MessageType2["CLOSE_MESSAGE"] = 3] = "CLOSE_MESSAGE";
    MessageType2[MessageType2["NAME_MESSAGE"] = 4] = "NAME_MESSAGE";
    MessageType2[MessageType2["TEXT_MESSAGE"] = 5] = "TEXT_MESSAGE";
    MessageType2[MessageType2["STATE_MESSAGE"] = 6] = "STATE_MESSAGE";
  })(MessageType || (MessageType = {}));
});

// types/State.ts
class State {
  paused;
  currentTime;
  src;
  timestamp;
  sender;
  constructor({ paused = true, currentTime = 0, src = "", timestamp = Date.now(), sender = "" } = {}) {
    this.paused = paused;
    this.currentTime = currentTime;
    this.timestamp = timestamp;
    this.src = src;
    this.sender = sender;
  }
  toString() {
    return `${this.sender} : ${this.paused ? "|" : ">"} ${this.currentTime} @ ${this.timestamp} < ${this.src}`;
  }
  stringify() {
    const { paused, currentTime, src, timestamp, sender } = this;
    return JSON.stringify({ paused, currentTime, src, timestamp, sender });
  }
  apply(element) {
    if (element.paused && !this.paused) {
      element.play();
    } else if (!element.paused && this.paused) {
      element.pause();
    }
    if (element.src.startsWith("http://") || element.src.startsWith("https://")) {
      element.src = this.src;
    }
    element.currentTime = this.currentTime;
  }
}
var init_State = __esm(() => {
});

// types/StateMessage.ts
class StateMessage extends Message {
  data;
  constructor(sender = "", data = new State, timestamp = Date.now(), mType = MessageType.STATE_MESSAGE) {
    super(sender, data, timestamp, mType);
    this.data = data;
  }
}
var init_StateMessage = __esm(() => {
  init_Message();
  init_State();
});

// types/TextMessage.ts
class TextMessage extends Message {
  data;
  constructor(sender = "", data = "", timestamp = Date.now(), mType = MessageType.TEXT_MESSAGE) {
    super(sender, data, timestamp, mType);
    this.data = data;
  }
}
var init_TextMessage = __esm(() => {
  init_Message();
});

// src/main.ts
var require_main = __commonJS((exports) => {
  init_Message();
  init_State();
  init_StateMessage();
  init_TextMessage();
  var toHhMmSs = function(seconds) {
    return new Date(seconds * 1000).toISOString().slice(11, 19);
  };
  var log = function(object) {
    let element = document.createElement("p");
    let stringify = JSON.stringify(object);
    element.textContent = stringify.substring(1, stringify.length - 1);
    chatArea?.appendChild(element);
  };
  var debug = function(object) {
    if (DEBUG) {
      console.log(object);
    }
  };
  var currySocketOpen = function(_ws) {
    return function handleSocketOpen(event) {
      debug(event);
    };
  };
  var currySocketClose = function(_ws) {
    return function handleSocketClose(event) {
      debug(event);
    };
  };
  var currySocketError = function(_ws) {
    return function handleSocketError(event) {
      log(`Error: type = ${event.type}`);
      debug(event);
    };
  };
  var currySocketMessage = function(_ws) {
    return function handleSocketMessage(event) {
      let message = JSON.parse(event.data);
      switch (message.mType) {
        case MessageType.OPEN_MESSAGE:
          log(`${message.data} has entered the chat!`);
          break;
        case MessageType.CLOSE_MESSAGE:
          log(`${message.data} has left the chat!`);
          break;
        case MessageType.NAME_MESSAGE:
          userName = message.data;
          log(`Your ID: ${userName}`);
          break;
        case MessageType.TEXT_MESSAGE:
          console.log("Text");
          console.log(message.data);
          message = message;
          log(`${message.sender} @ ${message.timestamp} = ${message.data}`);
          break;
        case MessageType.STATE_MESSAGE:
          console.log("State");
          console.log(message.data);
          message = message;
          console.log("CCCCCCCCCCCCCCCCCC");
          setState(message.data);
          console.log("DDDDDDDDDDDDDDDDDD");
          break;
      }
      console.log(message);
    };
  };
  var getNewSocket = function(address = WS_ADDRESS) {
    let ws = new WebSocket(address);
    ws.addEventListener("open", currySocketOpen(ws));
    ws.addEventListener("close", currySocketClose(ws));
    ws.addEventListener("error", currySocketError(ws));
    ws.addEventListener("message", currySocketMessage(ws));
    return ws;
  };
  var getState = function({ paused = playVideo.paused, currentTime = playVideo.currentTime, src = srcName, timestamp = Date.now() }) {
    return new State({
      paused,
      currentTime,
      timestamp,
      src,
      sender: userName
    });
  };
  var sendState = function(props = {}) {
    let state = getState(props);
    debug(state);
    sendMessage(new StateMessage(userName, state));
  };
  var setState = function(state) {
    let timestamp = Date.now();
    let latency = timestamp - state.timestamp;
    if (state.src.includes(":")) {
      if (srcName != state.src) {
        srcName = state.src;
        playVideo.src = state.src;
      }
    } else {
      alert(`Please load the file: ${state.src}`);
    }
    if (state.paused != playVideo.paused) {
      state.paused ? playVideo.pause() : playVideo.play();
    }
    if (Math.abs(playVideo.currentTime - state.currentTime) > MAX_DELTA) {
      playVideo.currentTime = Math.max(0, Math.min(playVideo.duration, state.currentTime + latency));
    }
  };
  var sendMessage = function(message) {
    socket.send(message.stringify());
  };
  var sendChatMessage = function() {
    if (sendInput.value && sendInput.value != "") {
      let message = sendInput.value;
      if (!message || message == "") {
        return;
      }
      sendMessage(new TextMessage(userName, message));
      sendInput.value = "";
    }
  };
  var togglePause = function() {
    playVideo.paused ? playVideo.play() : playVideo.pause();
    sendState();
  };
  var setVideoSourceFromFile = function(file) {
    let url = URL.createObjectURL(file);
    playSource.src = url;
    playVideo.load();
    srcName = file.name;
    sendState();
  };
  var DEBUG = false;
  var WS_ADDRESS = `${location.protocol.includes("https") ? "wss:" : "ws:"}//${location.host}`;
  console.log(WS_ADDRESS);
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
  var userName = `User#-1`;
  var srcName = playVideo.src;
  sendButton.addEventListener("click", sendChatMessage);
  sendInput.addEventListener("keydown", (e) => {
    if (e.code == "Enter") {
      if (!e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    }
  });
  sendInput.addEventListener("blur", () => {
    if (sendInput.value == "") {
      sendInput.value = "";
    }
  });
  playVideo.addEventListener("durationchange", () => {
    timeInput.max = playVideo.duration.toString();
    timeInput.step = (playVideo.duration / 100).toString();
    durationText.innerHTML = toHhMmSs(playVideo.duration);
  });
  playVideo.addEventListener("timeupdate", () => {
    timeInput.value = playVideo.currentTime.toString();
    currentTimeText.innerHTML = toHhMmSs(playVideo.currentTime);
  });
  pauseButton.addEventListener("click", togglePause);
  playVideo.addEventListener("click", togglePause);
  volumeInput.addEventListener("input", () => {
    playVideo.volume = parseFloat(volumeInput.value) / 100;
  });
  timeInput.addEventListener("input", () => {
    playVideo.currentTime = parseFloat(timeInput.value);
    console.log("AAAAAAAAAAAAAAAAA");
    sendState({ currentTime: parseFloat(timeInput.value) });
    console.log("BBBBBBBBBBBBBBBBB");
  });
  loadText.addEventListener("click", () => {
    let url = prompt("Enter video source address:");
    if (!url || url == "")
      return;
    playSource.src = url;
    playVideo.load();
    srcName = url;
    sendState();
  });
  loadFile.addEventListener("input", () => {
    if (!loadFile.files || !loadFile.files[0])
      return;
    setVideoSourceFromFile(loadFile.files[0]);
  });
  var socket = getNewSocket();
  exports = { setState, WebSocket, socket };
});
export default require_main();
