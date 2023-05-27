import http from 'http';
import { Server } from 'socket.io';
import express from 'express';
import { instrument } from '@socket.io/admin-ui'

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + "/views");
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (_, res) => res.render("home"));
app.get('*', (_, res) => res.redirect('/'));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);

// http server
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
      origin: ["https://admin.socket.io"],
      credentials: true
    }
});

instrument(wsServer, {
    auth: false,
    mode: "development",
});

const publicRooms = () => {
    const { sockets: { adapter: { sids, rooms }}} = wsServer;
    const publicRooms = [];
    rooms.forEach(((_, key) => {
        if (!sids.get(key)) {
            publicRooms.push(key);
        }
    }));
    return publicRooms;
}

const countRoom = (roomName) => {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anon"
    socket.onAny((envet) => {
        console.log(`socket event: ${envet}`)
    })
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => {
            // 떠나기 직전이기 때문에 떠날 룸까지 포함돼서 카운트됨
            socket.to(room).emit("bye", socket.nickname, countRoom(room)-1);
        });
    })
    socket.on("disconnect", ()=> {
        wsServer.sockets.emit("room_change", publicRooms());
    })
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    })
    socket.on("nickname", nickname => {
        socket["nickname"] = nickname;
    })
})

// // websocket server
// const wss = new WebSocket.Server({ server });

// localhost:3000로 http server or websocket server 돌림(두 개가 같은 포트에 있길 원함)
// http 서버위에 wss를 만들기 위함

// const sockets = [];

// wss.on('connection', (socket) => {
//     sockets.push(socket);
//     // 닉네임을 정하지 않은 사람을 위해
//     socket["nickname"] = "Anon";
//     console.log("Connected to Browser O");
//     socket.on("close", () => console.log("Disconnected to Browser X"));
//     socket.on("message", (msg) => {
//         const message = JSON.parse(msg);
//         switch (message.type) {
//             case "new_message":
//                 sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${message.payload.toString('utf-8')}`));
//                 break;
//             case "nickname":
//                 socket["nickname"] = message.payload;
//                 break;
//         }   
//     })
// });

httpServer.listen(3000, handleListen);
