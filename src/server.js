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

const handleConnection = (socket) => {
    // 여기서 받는 socket은 연결된 브라우저
    // Websocket은 브라우저와 서버 사이의 연결
    // 여기 가져온 socket으로 프론트엔드와 실시간 소통을 할 수 있게 됨.
    console.log(socket)
}

wss.on('connection', handleConnection);

server.listen(3000, handleListen);