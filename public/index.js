document.getElementById("loadStream").addEventListener("click", () => {
  const roomName = document.getElementById("roomName").value;
  const videoSrc = `/hls/${roomName}/index.m3u8`;
  const video = document.getElementById("video");

  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play();
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = videoSrc;
    video.addEventListener("canplay", () => {
      video.play();
    });
  }
});
