import './App.css';
import { io } from 'socket.io-client';
import React, { useState } from 'react';
import Chat from './chat';
import { db } from './firebaseConfig';
import { doc, setDoc, getDoc} from 'firebase/firestore';

// backend URL
const socket = io("https://chatapp-ylh8.onrender.com");

function App() {
  //use state to manage username, room, and chat visibility
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  //function to create a room
  const createRoom = async() =>{
    if(username.trim() !== "" && room.trim()!== ""){
      try{
        await setDoc(doc(db, "rooms", room), {roomID: room});
        setUsername("");
        setRoom("");
        joinRoom();
      }catch(err){
      console.error(err);
      }
    }
    else{
      alert("Please enter a valid room ID");
    }
  }
  // function to join a room
  const joinRoom = async () => {
    if (username.trim() !== "" && room.trim() !== "") {
      try {
        const roomDoc = await getDoc(doc(db, "rooms", room)); // Check if room exists in Firestore
        if (roomDoc.exists()) {
          socket.emit('join_room', room);
          setShowChat(true); // Show the chat component
        } else {
          alert("Enter a valid room ID.");
        }
      } catch (error) {
        console.error("Error joining room:", error);
        alert("Failed to join room. Please try again.");
      }
    } else {
      alert("Please enter your name and room ID to join a room.");
    }
  };

  const handleKeyDown = (e, action) => {
    if (e.key === "Enter") {
      action(); // Call the respective action (createRoom or joinRoom)
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
            onKeyDown={(e) => handleKeyDown(e, createRoom)} // Call createRoom on Enter key
          />
          <input
            type="text"
            placeholder="Enter room ID"
            onChange={(e) => setRoom(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, createRoom)} // Call createRoom on Enter key
          />
          <button onClick={createRoom}>Create</button>
        </div>
        {/*container for join room*/}
        <div className="joinChatContainer">
          <h3>Join Room</h3>
          <input
            type="text"
            placeholder="Enter your name"
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, joinRoom)}
          />
          <input
            type="text"
            placeholder="Enter room ID"
            onChange={(e) => setRoom(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, joinRoom)}
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
