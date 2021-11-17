let connected = false;
let room;

const addLocalVideo = () => {
  Twilio.Video.createLocalVideoTrack().then((track) => {
    const video = document.getElementById("local").firstChild;
    video.appendChild(track.attach());
  });
};

const connectButtonHandler = (event) => {
  event.preventDefault();
  if (!connected) {
    const username = document.getElementById("username").value;
    if (!username) {
      alert("Please enter a username");
      return;
    }
    const joinLeaveButton = document.getElementById("join_leave");
    joinLeaveButton.disabled = true;
    joinLeaveButton.innerText = "Connecting...";
    connect(username)
      .then(() => {
        joinLeaveButton.innerText = "Leave call";
        joinLeaveButton.disabled = false;
      })
      .catch(() => {
        alert("Could not connect to the room. Is the backend running?");
        joinLeaveButton.innerText = "Join call";
        joinLeaveButton.disabled = false;
      });
  } else {
    disconnect();
    document.getElementById("join_leave").innerText = "Join call";
    connected = false;
  }
};

const connect = (username) =>
  new Promise((resolve, reject) => {
    fetch("/login", {
      method: "POST",
      body: JSON.stringify({ username: username }),
    })
      .then((res) => res.json())
      .then((data) => {
        return Twilio.Video.connect(data.token);
      })
      .then((_room) => {
        room = _room;
        room.participants.forEach(participantConnected);
        room.on("participantConnected", participantConnected);
        room.on("participantDisconnected", participantDisconnected);
        connected = true;
        updateParticipantCount();
        resolve();
      })
      .catch((err) => {
        console.log(err);
        reject();
      });
  });

const updateParticipantCount = () => {
  if (!connected) document.getElementById("count").innerText = "Disconnected.";
  else
    document.getElementById("count").innerText = `${
      room.participants.size + 1
    } participants online.`;
};

const participantConnected = (participant) => {
  let participantDiv = document.createElement("div");
  participantDiv.setAttribute("id", participant.sid);
  participantDiv.setAttribute("class", "participant");

  let tracksDiv = document.createElement("div");
  participantDiv.appendChild(tracksDiv);

  let labelDiv = document.createElement("div");
  labelDiv.innerHTML = participant.identity;
  participantDiv.appendChild(labelDiv);

  document.getElementById("container").appendChild(participantDiv);

  participant.tracks.forEach((publication) => {
    if (publication.isSubscribed) trackSubscribed(tracksDiv, publication.track);
  });
  participant.on("trackSubscribed", (track) =>
    trackSubscribed(tracksDiv, track)
  );
  participant.on("trackUnsubscribed", trackUnsubscribed);

  updateParticipantCount();
};

const participantDisconnected = (participant) => {
  document.getElementById(participant.sid).remove();
  updateParticipantCount();
};

const trackSubscribed = (div, track) => {
  div.appendChild(track.attach());
};

const trackUnsubscribed = (track) => {
  track.detach().forEach((element) => element.remove());
};

const disconnect = () => {
  room.disconnect();
  const container = document.getElementById("container");
  while (container.lastChild.id != "local")
    container.removeChild(container.lastChild);
  document.getElementById("join_leave").setAttribute("innerHTML", "Join call");
  connected = false;
  updateParticipantCount();
};
addLocalVideo();
document
  .getElementById("join_leave")
  .addEventListener("click", connectButtonHandler);
