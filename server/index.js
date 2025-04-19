const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require("socket.io");
// const chat = require('./chat'); // Uncomment this if you need chat.js
// const { initializeApp } = require('firebase/app'); // Not used currently
// const { getFirestore } = require('firebase/firestore'); // Not used currently

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join_room', (data) => {
        socket.join(data);
        console.log(`User with ID: ${socket.id} joined room: ${data}`);
    });

    socket.on('send_message', (data) => {
        socket.to(data.room).emit('receive_message', data);
    });


    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
