var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);

// json/Sources.ts
var Sources, Sources_default;
var init_Sources = __esm(() => {
  Sources = {
    SD_04_03: "https://www.shutterstock.com/shutterstock/videos/5993084/preview/stock-footage-parasitic-worm-trichinella-spiralis-trichinosis-in-a-sample-of-raw-meat-muscle-fibers-under.webm",
    SD_09_16: "https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-fashion-woman-with-silver-makeup-39875-small.mp4",
    _16_09: "https://samples.tdarr.io/api/v1/samples/sample__240__libvpx-vp9__aac__30s__video.mkv",
    SD_16_09: "https://samples.tdarr.io/api/v1/samples/sample__480__libvpx-vp9__aac__30s__video.mkv",
    HD_16_09: "https://samples.tdarr.io/api/v1/samples/sample__720__libvpx-vp9__aac__30s__video.mkv",
    FHD_16_09: "https://samples.tdarr.io/api/v1/samples/sample__1080__libvpx-vp9__aac__30s__video.mkv",
    UHD_16_09: "https://samples.tdarr.io/api/v1/samples/sample__2160__libvpx-vp9__aac__30s__video.mkv"
  };
  Sources_default = Sources;
});

// types/Message.ts
var MessageType;
var init_Message = __esm(() => {
  (function(MessageType2) {
    MessageType2["OPEN"] = "OPEN";
    MessageType2["CLOSE"] = "CLOSE";
    MessageType2["ASSIGN"] = "ASSIGN";
    MessageType2["TEXT"] = "TEXT";
    MessageType2["STATE"] = "STATE";
  })(MessageType || (MessageType = {}));
});

// modules/utility.ts
function toHhMmSs(seconds) {
  return new Date(seconds * 1000).toISOString().slice(11, 19);
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
var init_utility = __esm(() => {
});

// modules/User.ts
class User {
  socket;
  elements;
  state;
  id = "(me)";
  nickname;
  interacted = false;
  duration = 0;
  epsilon = 0.001;
  constructor(socket, elements, state = {
    src: Sources_default.SD_04_03,
    paused: true,
    currentTime: 0
  }) {
    this.socket = socket;
    this.elements = elements;
    this.state = state;
    this.socket.addEventListener("open", this.handleSocketOpen.bind(this));
    this.socket.addEventListener("close", this.handleSocketClose.bind(this));
    this.socket.addEventListener("error", this.handleSocketError.bind(this));
    this.socket.addEventListener("message", this.handleSocketMessage.bind(this));
    this.elements.video.video.addEventListener("click", this.handleVideoClick.bind(this));
    this.elements.video.video.addEventListener("durationchange", this.handleVideoDurationChange.bind(this));
    this.elements.video.video.addEventListener("timeupdate", this.handleVideoTimeUpdate.bind(this));
    this.elements.video.volumeInput.addEventListener("input", this.handleVideoVolumeInput.bind(this));
    this.elements.video.togglePauseButton.addEventListener("click", this.handleVideoTogglePauseButtonClick.bind(this));
    this.elements.video.timeInput.addEventListener("input", this.handleVideoTimeInput.bind(this));
    this.elements.video.loadText.addEventListener("click", this.handleVideoLoadTextClick.bind(this));
    this.elements.video.loadFile.addEventListener("input", this.handleVideoLoadFileChange.bind(this));
    this.elements.chat.input.addEventListener("keydown", this.handleChatInputKeyDown.bind(this));
    this.elements.chat.button.addEventListener("click", this.handleChatButtonClick.bind(this));
  }
  log(object) {
    let element = document.createElement("p");
    let stringify = JSON.stringify(object);
    let isScrolledToBottom = Math.ceil(this.elements.chat.area.scrollTop) + this.elements.chat.area.offsetHeight >= this.elements.chat.area.scrollHeight;
    element.textContent = stringify.substring(1, stringify.length - 1);
    this.elements.chat.area?.appendChild(element);
    if (isScrolledToBottom) {
      element.scrollIntoView();
    }
  }
  setSourceFromURL(src) {
    this.state.src = src;
    if (this.elements.video.video.src !== src) {
      this.elements.video.video.src = src;
      this.elements.video.video.load();
    }
  }
  setSourceFromFile(file) {
    this.state.src = file.name;
    if (this.elements.video.video.srcObject != file) {
      this.elements.video.video.src = URL.createObjectURL(file);
      console.log(this.elements.video.video.src);
      this.elements.video.video.load();
    }
  }
  setPaused(paused) {
    this.state.paused = paused;
    if (this.elements.video.video.paused !== paused) {
      paused ? this.elements.video.video.pause() : this.elements.video.video.play();
    }
  }
  setCurrentTime(currentTime) {
    this.state.currentTime = currentTime;
    this.elements.video.video.currentTime = currentTime;
    this.elements.video.timeInput.value = currentTime.toString();
    this.elements.video.currentTimeText.textContent = toHhMmSs(currentTime);
  }
  setState(state, timestamp) {
    if (state.src.includes(":")) {
      this.setSourceFromURL(state.src);
    } else {
      alert(`Please load the video source file: ${state.src}`);
    }
    this.setPaused(state.paused);
    let currentTime = state.currentTime;
    if (timestamp && !state.paused) {
      currentTime = clamp(currentTime - (Date.now() - timestamp) / 1000, 0, this.duration);
    }
    this.setCurrentTime(currentTime);
  }
  setStateFromMessage(message) {
    if (message.messageType !== MessageType.STATE) {
      return;
    }
    this.setState(JSON.parse(message.content), message.timestamp);
  }
  togglePause() {
    this.setPaused(!this.state.paused);
  }
  sendMessage(messageType, content) {
    let message = {
      senderId: "",
      senderName: this.nickname,
      timestamp: Date.now(),
      messageType,
      content
    };
    this.socket.send(JSON.stringify(message));
  }
  sendVideoMessage() {
    this.sendMessage(MessageType.STATE, JSON.stringify(this.state));
  }
  sendChatMessage() {
    this.sendMessage(MessageType.TEXT, this.elements.chat.input.value);
    this.elements.chat.input.value = "";
  }
  handleSocketOpen(event) {
    console.info(event);
  }
  handleSocketClose(event) {
    console.info(event);
  }
  handleSocketError(event) {
    console.error(event);
  }
  handleSocketMessage(event) {
    let message = JSON.parse(event.data);
    if (message.senderId == this.id) {
      return;
    }
    switch (message.messageType) {
      case MessageType.OPEN:
        this.log(`${message.content} has joined!`);
        break;
      case MessageType.CLOSE:
        this.log(`${message.content} has left!`);
        break;
      case MessageType.ASSIGN:
        this.id = message.content;
        this.log(`Your ID: ${message.content}!`);
        break;
      case MessageType.TEXT:
        this.log(`${message.senderName ?? message.senderId}: ${message.content}`);
        break;
      case MessageType.STATE:
        this.setStateFromMessage(message);
        break;
    }
  }
  handleVideoClick(event) {
    if (!this.interacted) {
      this.interacted = true;
      this.elements.video.videoBlocker.style.display = "none";
      this.elements.video.controlBlocker.style.display = "none";
      return;
    }
    this.togglePause();
  }
  setDuration(duration) {
    this.duration = duration;
    this.elements.video.timeInput.max = duration.toString();
    this.elements.video.timeInput.step = (duration / 100).toString();
    this.elements.video.durationText.textContent = toHhMmSs(duration);
  }
  handleVideoDurationChange(event) {
    this.setDuration(this.elements.video.video.duration);
  }
  handleVideoTimeUpdate(event) {
    this.elements.video.currentTimeText.textContent = toHhMmSs(this.elements.video.video.currentTime);
    console.log(`handleVideoTimeUpdate.isTrusted = ${event.isTrusted}`);
    if (!event.isTrusted) {
      return;
    }
    this.elements.video.timeInput.value = this.elements.video.video.currentTime.toString();
  }
  handleVideoVolumeInput(event) {
    this.elements.video.video.volume = parseInt(this.elements.video.volumeInput.value) / 100;
  }
  handleVideoTogglePauseButtonClick(event) {
    this.togglePause();
    this.sendVideoMessage();
  }
  handleVideoTimeInput(event) {
    console.log(`handleVideoTimeInput.isTrusted = ${event.isTrusted}`);
    if (!event.isTrusted) {
      return;
    }
    this.setCurrentTime(parseFloat(this.elements.video.timeInput.value));
    this.sendVideoMessage();
  }
  handleVideoLoadTextClick(event) {
    let src = prompt("Enter a video URL");
    if (!src) {
      return;
    }
    this.setSourceFromURL(src);
    this.sendVideoMessage();
  }
  handleVideoLoadFileChange(event) {
    let files = this.elements.video.loadFile.files;
    if (!files || !files[0]) {
      return;
    }
    this.elements.video.video.srcObject;
    this.setSourceFromFile(files[0]);
    this.sendVideoMessage();
  }
  handleChatInputKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.sendChatMessage();
    }
  }
  handleChatButtonClick(event) {
    this.sendChatMessage();
  }
}
var init_User = __esm(() => {
  init_Sources();
  init_Message();
  init_utility();
});

// src/main.ts
var require_main = __commonJS((exports) => {
  init_User();
  var WS_ADDRESS = `${location.protocol.includes("https") ? "wss:" : "ws:"}//${location.host}`;
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
  var blockerVideo = document.getElementById("blockerVideo");
  var blockerLoad = document.getElementById("blockerLoad");
  var socket = new WebSocket(WS_ADDRESS);
  var videoElements = {
    video: playVideo,
    source: playSource,
    togglePauseButton: pauseButton,
    volumeInput,
    timeInput,
    loadText,
    loadFile,
    durationText,
    currentTimeText,
    videoBlocker: blockerVideo,
    controlBlocker: blockerLoad
  };
  var chatElements = {
    area: chatArea,
    input: sendInput,
    button: sendButton
  };
  var elements = {
    video: videoElements,
    chat: chatElements
  };
  var user = new User(socket, elements);
  exports = { user, WebSocket };
});
export default require_main();
