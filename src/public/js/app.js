// 백앤드 scoket.io와 자동적으로 연결해주는 function
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

const room = document.getElementById("room");
room.hidden = true;

let roomName = "";

const showRoom = () => {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
}

const handleRoomSubmit = (event) => {
    event.preventDefault();
    const input = form.querySelector("input");
    // 이벤트 자체를 emit 가능, object도 가능
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit)