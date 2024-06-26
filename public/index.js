document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("video");

  const joinBtn = document.getElementById("joinRoom");

  joinBtn.addEventListener("click", () => {
    const roomName = document.getElementById("roomName").value;
    const videoSrc = `http://localhost:9000/output/${roomName}/index.m3u8`; // Replace with your actual video filename

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
});
