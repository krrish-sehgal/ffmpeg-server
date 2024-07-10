document.addEventListener("DOMContentLoaded", () => {
  const videoContainer = document.getElementById("videoContainer");
  const video = document.getElementById("video");
  const roomsDiv = document.getElementById("rooms");
  const noStreams = document.getElementById("noStreams");

  // Function to fetch available rooms
  const fetchRooms = async () => {
    try {
      const response = await fetch("http://35.200.142.251:80/rooms");
      const rooms = await response.json();
      return rooms;
    } catch (error) {
      console.error("Error fetching rooms:", error);
      return [];
    }
  };

  // Function to display rooms
  const displayRooms = (rooms) => {
    roomsDiv.innerHTML = ""; // Clear the existing content

    if (rooms.length === 0) {
      noStreams.style.display = "block";
    } else {
      noStreams.style.display = "none";
    }

    rooms.forEach((room) => {
      const roomDiv = document.createElement("div");
      roomDiv.className = "room";

      const thumbnail = document.createElement("img");
      thumbnail.src = `http://35.200.142.251:80/thumbnails/${room.name}.jpg`; // Prevent caching
      thumbnail.alt = `Thumbnail for ${room.name}`;
      thumbnail.className = "thumbnail";

      const roomName = document.createElement("span");
      roomName.textContent = room.name;
      roomName.className = "room-name";

      const onClick = () => {
        roomsDiv.style.display = "none"; // Hide the rooms list
        const videoSrc = `http://35.200.142.251:80/output/${room.name}/index.m3u8`;

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

        videoContainer.style.display = "block"; // Show the video element
      };

      thumbnail.addEventListener("click", onClick);
      roomName.addEventListener("click", onClick);

      roomDiv.appendChild(thumbnail);
      roomDiv.appendChild(roomName);
      roomsDiv.appendChild(roomDiv);
    });
  };

  // Function to update thumbnails periodically
  const updateThumbnails = () => {
    fetchRooms().then(displayRooms);
  };

  // Initial load of rooms
  fetchRooms().then(displayRooms);

  // Update thumbnails every 30 seconds
  setInterval(updateThumbnails, 30000);
});
