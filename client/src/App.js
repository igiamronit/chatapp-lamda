import './App.css';
import { io } from 'socket.io-client';
import React, { useState } from 'react';
import Chat from './chat';

// backend URL
const socket = io("https://chatapp-ylh8.onrender.com");

function App() {
  //use state to manage username, room, and chat visibility
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  // function to join a room
  const joinRoom = () => {
    if (username.trim() !== "" && room.trim() !== "") {
      socket.emit('join_room', room);
      setShowChat(true);
    }
  };

  return (
    <div className="App">
      {!showChat ? (
        //show this if setShowChat is false(home page)
        //container containing both create room and join room
        <div className='roomContainer'> 
        {/*container for create room*/}
        <div className='createRoomContainer'>
          <h1>Create Room</h1>
          <input
            type="text"
            placeholder="Enter your name"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter room ID"
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Join</button>
        </div>
        {/*container for join room*/}
        <div className="joinChatContainer">
          <h3>Join Room</h3>
          <input
            type="text"
            placeholder="Enter your name"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter room ID"
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Join</button>
        </div>
      </div>  
      ) : (
        <Chat socket={socket} username={username} room={room} />
      //show this if setShowChat is true
      //Chat component
      )}
    </div>
  );
}

export default App;
