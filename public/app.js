var tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;
var videoDuration;
var playbackPercentage;

const socket = io();

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "390",
    width: "640",
    videoId: "_2JfRttukXU",
    playerVars: {
      playsinline: 1,
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      enablejsapi: 1,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: handlePlayerStateChange,
      onError: onPlayerError,
    },
  });
}

function onPlayerError(event) {
  console.error("Player error:", event.data);
}

function handleKeyPress(event) {
  if (event.key === "Enter") {
    sendMessage();
    document.getElementById("userMessage").value = "";
  }
}

function handlePlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    console.log("Video Ended - Clearing Chat");
    clearChat();
  }
}
socket.on("pause", () => {
  console.log("paused");
  if (player.getPlayerState() === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  }
  document.getElementById("status").innerHTML = "Video Paused";
});

socket.on("play", () => {
  console.log("playing");
  const playerState = player.getPlayerState();
  if (playerState === YT.PlayerState.PAUSED) {
    player.playVideo();
  }
  document.getElementById("status").innerHTML = "Video Playing";
});
function videoPause() {
  const playerState = player.getPlayerState();
  if (playerState === YT.PlayerState.PLAYING) {
    socket.emit("pause_request");
  }
}
function videoPlay() {
  if (player.getPlayerState() === -1 || player.getPlayerState() === 2) {
    socket.emit("play_request");
  }
}

function startVideo() {
  socket.emit("start_video_request");
}

socket.on("start_video", () => {
  console.log("Starting video");
  player.playVideo();
});

socket.on("seekingFB", (videoTime) => {
  console.log(videoTime);
  player.seekTo(videoTime, true);
});

function setProgressBarOnClick(event) {
  const progressBarContainer = document.getElementById("progressBarContainer");
  const progressBarWidth = progressBarContainer.offsetWidth;

  const clickX =
    event.clientX - progressBarContainer.getBoundingClientRect().left;
  playbackPercentage = (clickX / progressBarWidth) * 100;

  const changeTime = (playbackPercentage * videoDuration) / 100;
  console.log(
    "click registered",
    " percentage =",
    playbackPercentage,
    " time = ",
    changeTime
  );
  socket.emit("seekFB", changeTime);
  updateProgressBar();
}

function updateProgressBar() {
  const progressBarContainer = document.getElementById("progressBarContainer");
  const progressBarWidth = progressBarContainer.offsetWidth;
  playbackPercentage = (player.getCurrentTime() / videoDuration) * 100;
  const progressBar = document.getElementById("progressBar");
  progressBar.style.width =
    (playbackPercentage * progressBarWidth) / 100 + "px";
}

function muteUnmute() {
  if (player.isMuted()) {
    player.unMute();
    document.getElementById("muteButton").innerHTML = "Mute";
  } else {
    player.mute();
    document.getElementById("muteButton").innerHTML = "Unmute";
  }
}

function onPlayerReady() {
  videoDuration = player.getDuration();
  setTimeout(function () {
    setInterval(updateProgressBar, 1000);
  }, 1000);
}
