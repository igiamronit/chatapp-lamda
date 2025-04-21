import './App.css';
import { io } from 'socket.io-client';
import React, { useEffect, useState } from 'react';
import Chat from './chat';
import Login from './login.js'
import { db } from './firebaseConfig';
import { doc, setDoc, getDoc} from 'firebase/firestore';
import { signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";

// backend URL
const socket = io("https://chatapp-lamda.onrender.com");





export default function App() {

  const [user, setUser] = useState(null); //for google auth
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

 
  //function to create a room
  const createRoom = async() =>{
    if( user && room.trim()!== ""){
      try{
        await setDoc(doc(db, "rooms", room), {roomID: room});
        //setRoom("");
        joinRoom();
      }catch(err){
      console.error(err);
      }
    }
    else{
      alert("Please enter a valid room ID");
    }
  }




  const handleSignOut = () => {
    signOut(auth).then(() => {
      setUser(null);
      setShowChat(false);
    });
  };

  // If not logged in, show login
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // function to join a room
  const joinRoom = async () => {
    if (user && room.trim() !== "") {
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

  //showing login window if not logged in
  if(!user){
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="App">
      {!showChat ? (
          <div className='appContainer'>
          <div className="app-title">
            <h1>ctrl-alt-elite</h1>
            <p>Your real-time messaging solution</p>
          </div>
        {/*//show this if setShowChat is false(home page)
        //container containing both create room and join room
        <div className='roomContainer'>*/} 
        <div className="Login">
            <span>
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google icon"
                style={{ width: '20px', height: '20px' }}
              />
              Signed in as: {user.displayName}
            </span>
            <button className="signOutButton" onClick={handleSignOut}>
              Sign out
            </button>
          </div>


          <div className="rooms-row">
          {/* Container for create room */}
          <div className='createRoomContainer'>
            <h1>Create Room</h1>
            <input
              type="text"
              placeholder="Enter room ID"
              onChange={(e) => setRoom(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, createRoom)}
            />
            <button onClick={createRoom}>Create</button>
          </div>
          
          {/* Container for join room */}
          <div className="joinChatContainer">
            <h3>Join Room</h3>
            <input
              type="text"
              placeholder="Enter room ID"
              onChange={(e) => setRoom(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, joinRoom)}
            />
            <button onClick={joinRoom}>Join</button>
          </div>
        </div>
      </div>
    ) : (
      <Chat socket={socket} username={user.displayName} room={room} userId={user.uid} />
    )}
  </div>
);

}