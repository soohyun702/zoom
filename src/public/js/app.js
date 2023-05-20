// 여기서 socket은 서버로의 연결
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
    console.log("Connected to Server O")
})

socket.addEventListener("message", (message) => {
    console.log("New Message: ", message.data)
})

socket.addEventListener("close", () => {
    console.log("Disconnected to Server X");
})

setTimeout(() => {
    socket.send("hello from the browser!");
}, 10000);