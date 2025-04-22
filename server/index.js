const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require("socket.io");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();


app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const personas = {
    Friendly: {
        prompt: "You are a friendly AI assistant. You are helpful, kind, and enthusiastic. You respond with positive energy and always try to be supportive. Keep responses concise and conversational."
    },
    Roaster: {
        prompt: "You are The Incinerator, an AI programmed for brutally honest and savage roasts. You don't pull punches. You find the weakest point and exploit it for maximum comedic (and slightly painful) effect. You're edgy, cynical, and find humor in ruthless takedowns."
    },
    "Tech Support": {
        prompt: "You are a professional tech support agent. Provide clear, helpful technical advice. Be patient with technical questions and offer step-by-step solutions. Maintain a professional but friendly tone. Keep responses concise and focused on solving problems."
    }
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/ai/ask', async (req, res) => {
    //console.log("Received AI request:", req.body);
    try {
        const { message, persona } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }
        
        // Get the selected persona, default to Friendly if not found
        const selectedPersona = personas[persona] || personas.Friendly;
        
        // Initialize the model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent([
            { text: selectedPersona.prompt }, 
            { text: message }                  
        ]);
        
        const response = result.response;
        const text = response.text();
        
        //console.log("AI response:", text);
        return res.status(200).json({ reply: text });
    } catch (error) {
        console.error('AI request failed:', error);
        return res.status(500).json({ 
            error: "Failed to get AI response", 
            details: error.message 
        });
    }
});

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
