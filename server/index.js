const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require("socket.io");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(cors()); //allows cross-origin requests
app.use(express.json()); //parses the json data

const server = http.createServer(app); //creates a server instance

//personas for the AI
const personas = {
    Friendly: {
        prompt: "You are a friendly AI assistant. You are helpful, kind, and enthusiastic. You respond with positive energy and always try to be supportive. Keep responses concise and conversational." //me :)
    },
    Roaster: {
        prompt: "You are The Incinerator, an AI programmed for brutally honest and savage roasts. You don't pull punches. You find the weakest point and exploit it for maximum comedic (and slightly painful) effect. You're edgy, cynical, and find humor in ruthless takedowns." //not me
    },
    "Tech Support": {
        prompt: "You are a professional tech support agent. Provide clear, helpful technical advice. Be patient with technical questions and offer step-by-step solutions. Maintain a professional but friendly tone. Keep responses concise and focused on solving problems." 
    }
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); //intializes the gen AI

app.post('/api/ai/ask', async (req, res) => {
    try {
        const { message, persona } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: "Message is required" }); //if no message is provided
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
}); //new socket.io server

//socket.io connection
io.on('connection', (socket) => {
    //console.log(`User Connected: ${socket.id}`);
    
    //connection for joinroom
    socket.on('join_room', (data) => {
        socket.join(data); //adds the user to the room
        //console.log(`User with ID: ${socket.id} joined room: ${data}`);
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

const PORT = process.env.PORT || 3001; //default port is 3001
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
