const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', 
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    console.log('Nowy użytkownik połączony:', socket.id);

    socket.on('message', (msg) => {
        console.log('Otrzymano wiadomość:', msg);
        io.emit('message', msg);
    });

    socket.on('disconnect', () => {
        console.log('Użytkownik rozłączony:', socket.id);
    });
});

server.listen(3001, () => {
    console.log('Serwer działa na http://localhost:3001');
});
