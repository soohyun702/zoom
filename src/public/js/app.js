// 백앤드 scoket.io와 자동적으로 연결해주는 function
const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;

const getCameras = async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(d => d.kind === 'videoinput');
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if (currentCamera.label == camera.label) {
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        })
    } catch (error) {
        console.log(error);
    }
}


const getMedia = async (deviceId) => {
    const initialConstrains = {
        audio: true,
        video: { facingMode: "user" },
    }
    const cameraConstrains = {
        audio: true,
        video: {
            deviceId: {
                exact: deviceId,
            }
        },
    }
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstrains : initialConstrains
        )
        myFace.srcObject = myStream;
        if (!deviceId) {
            await getCameras();
        }
    } catch (error) {
        console.log(error);
    }
}


const handleMuteClick = () => {
    myStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
    });
    if (!muted) {
        muteBtn.innerText = "Unmute";
        muted = true;
    } else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}
 
const handleCameraClick = () => {
    myStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
    });
    if (cameraOff) {
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    } else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}


const handleCameraChange = async () => {
   await getMedia(camerasSelect.value);
   if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
        .getSenders()
        .find((sender) => sender.track.kind == "video");
        videoSender.replaceTrack(videoTrack);
   }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form (join a room)
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

const initCall = async () => {
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

const handleWelcomeSubmit = async (event) => {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room", input.value);
    roomName = input.value;
    input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code

// A 브라우저
socket.on("welcome", async () => {
    // 데이터 채널 만들어줌(한 번만 만들어주면 됨)
    myDataChannel = myPeerConnection.createDataChannel("chat");
    myDataChannel.addEventListener("message", console.log)

    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("sent ")
    socket.emit("offer", offer, roomName);
})

// B 브라우저
socket.on("offer", async (offer) => {
    myPeerConnection.addEventListener("datachannel", (evnet) => {
        myDataChannel = event.channel;
        myDataChannel.addEventListener("message", console.log)
    })
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
})

// A 브라우저
socket.on("answer", async (answer) => {
    myPeerConnection.setRemoteDescription(answer);
})

// A 브라우저 & B 브라우저
socket.on("ice", async (ice) => {
    myPeerConnection.addIceCandidate(ice)
})

// RTC Code

const makeConnection = () => {
    myPeerConnection = new RTCPeerConnection();
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    // 기존에는 addStream 사용했으나 낡은 코드 현재는 addTrack
    myStream
    .getTracks()
    .forEach(track => myPeerConnection.addTrack(track, myStream));
}

const handleIce = async (data) => {
    socket.emit("ice", data.candidate, roomName);
}

const handleAddStream = async (data) => {
    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.stream;
}