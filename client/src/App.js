import './App.css';
import { io } from 'socket.io-client';
import React, { useEffect, useState } from 'react';
import Chat from './chat';
import Login from './login.js'

// backend URL
const socket = io("https://chatapp-ylh8.onrender.com");





function App() {
  const [user, setUser] = useState(null); //for google auth
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);


  const joinRoom = () => {
    if (user && room.trim() !== "") {
      socket.emit('join_room', room);
      setShowChat(true);
    }
  };

  //showing login window if not logged in
  if(!user){
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="App">
      {!showChat ? (
        <div className='roomContainer'>
        <div className='createRoomContainer'>
          <h1>Create Room</h1>
          <input
            type="text"
            placeholder="Enter room ID"
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Join</button>
        </div>
        <div className="joinChatContainer">
          <h3>Join Room</h3>
          <input
            type="text"
            placeholder="Enter room ID"
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Join</button>
        </div>
        <Login user={user} onLogin={setUser} />
      </div>  
      ) : (
        <Chat socket={socket} username={user.displayName} room={room} />
      )}
    </div>
  );
}

export default App;
