// 백앤드 scoket.io와 자동적으로 연결해주는 function
const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;


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

getMedia();

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
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);