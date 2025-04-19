import React, { useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./firebaseConfig";
import "./login.css";
import lambdaLogo from "./lambda.png"; // Add your lambda image in `src` or `public` and adjust import

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
      <div className="container">
        <div className="left-section">
          <div className="logo-box">
            <h1 className="login-title">Ctrl-Alt-Elite</h1>
            <p className="subtitle">Instant chat with anyone</p>
            <button className="google-btn" onClick={handleGoogleSignIn}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/240px-Google_%22G%22_logo.svg.png"
                alt="Google"
                className="google-icon"
              />
              Sign in with Google
            </button>
          </div>
        </div>
        <div className="right-section">
          <div className="chat-window">
            <div className="chat-header">
              <h3>Chat</h3>
            </div>
            <div className="chat-body">
              <div className="message left">Hi</div>
              <div className="message right">Hello</div>
              <div className="message left">How are you doing?</div>
              <div className="message right">I am fine!</div>
              <div className="message left">That's great to hear!</div>
              <div className="message right">Thanks!</div>
            </div>
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