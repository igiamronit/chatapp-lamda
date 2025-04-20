import React, { useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./firebaseConfig";
import "./login.css";
import lambdaLogo from "./lambda.png"; // Ensure the lambda logo is in the correct path

function Login({ user, onLogin }) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        onLogin(currentUser);
      }
    });
    return () => unsubscribe();
  }, [onLogin]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        console.log("Sign-in popup was closed by the user");
      } else {
        console.error("Google Sign-In failed:", error);
        alert("Google Sign-In failed. Please try again.");
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      alert("Sign out failed");
    }
  };

  if (!user) {
    return (
      <div className="main-wrapper">
        {/* {left} */}
        <div className="left-section">
          <div className="lambda-logo">λ</div>
          <h1 className="app-title">Ctrl-Alt-Elite</h1>
          <p className="subtitle">Instant chat with anyone</p>
          <button className="google-signin" onClick={handleGoogleSignIn}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"/>
            Sign in with Google
          </button>
        </div>

        {/* right section */}
        <div className="chat-container">
          <div className="chat-header">
            <span>Chat</span>
            <div className="profile-icon">👤</div>
          </div>
          <div className="chat-messages">
            <div className="message received">Hello!</div>
            <div className="message sent">Hi! How are you?</div>
            <div className="message received">I'm great, thanks for asking about me.</div>
            <div className="message sent">Sounds good!</div>
            <div className="message received">Great!</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signed-in-bar">
      <span>Signed in as: {user.displayName}</span>
      <button className="logout-btn" onClick={handleSignOut}>
        Sign Out
      </button>
    </div>
  );
}

export default Login;