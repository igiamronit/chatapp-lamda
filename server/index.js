const express = require('express');
const multer = require("multer");



const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require("socket.io");
// const chat = require('./chat'); // Uncomment this if you need chat.js
// const { initializeApp } = require('firebase/app'); // Not used currently
// const { getFirestore } = require('firebase/firestore'); // Not used currently

app.use(cors());
app.use("/uploads", express.static("uploads")); // serve static files

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    fileUrl: `http://localhost:5000/uploads/${req.file.filename}`,
  });
});


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

    socket.on('typing', (data) =>{
        socket.to(data.room).emit('typing', data);
    });

    socket.on('stop-typing', (data) =>{
        socket.to(data.room).emit('stop-typing', data);
    });


});

server.listen(3001, () => {
    console.log('Server running on port 3001');
});
