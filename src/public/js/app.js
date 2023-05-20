const messageList = document.querySelector('ul');
const nickForm = document.querySelector('#nick');
const messageForm = document.querySelector('#message');

// 여기서 socket은 서버로의 연결
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
    console.log("Connected to Server O")
})

const makeMessage = (type, payload) => {
    const msg = {type, payload};
    return JSON.stringify(msg);
}

socket.addEventListener("message", (message) => {
    const li = document.createElement('li');
    li.innerText = message.data;
    messageList.append(li);
})

socket.addEventListener("close", () => {
    console.log("Disconnected to Server X");
})

const handleSubmit = (event) => {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    input.value = "";
}

const handleNickSubmit = (event) => {
    event.preventDefault();
    const input = nickForm.querySelector('input');
    socket.send(makeMessage("nickname", input.value));

}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);