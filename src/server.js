import http from 'http';
import WebSocket from 'ws';
import express from 'express';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + "/views");
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (_, res) => res.render("home"));
app.get('*', (_, res) => res.redirect('/'));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);

// http server
const server = http.createServer(app);

// websocket server
const wss = new WebSocket.Server({ server });

// localhost:3000로 http server or websocket server 돌림(두 개가 같은 포트에 있길 원함)
// http 서버위에 wss를 만들기 위함

const sockets = [];

wss.on('connection', (socket) => {
    sockets.push(socket);
    // 닉네임을 정하지 않은 사람을 위해
    socket["nickname"] = "Anon";
    console.log("Connected to Browser O");
    socket.on("close", () => console.log("Disconnected to Browser X"));
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        switch (message.type) {
            case "new_message":
                sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${message.payload.toString('utf-8')}`));
                break;
            case "nickname":
                socket["nickname"] = message.payload;
                break;
        }   
    })
});

server.listen(3000, handleListen);
