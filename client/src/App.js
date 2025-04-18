import './App.css';
import { io } from 'socket.io-client';
import React, { useEffect, useState } from 'react';
import Chat from './chat';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";

// backend URL
const socket = io("https://chatapp-ylh8.onrender.com");





function App() {
  const [user, setUser] = useState(null); //for google auth
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  useEffect(() =>{
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert("Google Sign-In failed.");
    }
  };

  const handleSignOut = async() => {
    try {
      await signOut(auth);
      setShowChat(false);
      setRoom("");
    } catch(error){
      alert("Sign out failed")
    }
  };

  const joinRoom = () => {
    if (user && room.trim() !== "") {
      socket.emit('join_room', room);
      setShowChat(true);
    }
  };

  return (
    <div className="App">
      {!user ? (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <button onClick={handleGoogleSignIn} style={{ fontSize: "18px", padding: "10px 20px" }}>
          Sign in with Google
        </button>
      </div>
    ):!showChat ? (
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
        <div style={{marginTop:"20px"}}>
          <span> Signed in as: {user.displayName}</span>
          <button onClick={handleSignOut} style={{marginLeft: "10px"}}> Sign Out</button>
        </div>
      </div>  
      ) : (
        <Chat socket={socket} username={user.displayName} room={room} />
      )}
    </div>
  );
}

export default App;
