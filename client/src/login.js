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
      <div className="login-container">
        <div className="login-card">
          <img src={lambdaLogo} alt="Lambda Logo" className="lambda-logo" />
          <h2 className="login-title">Ctrl-Alt- Elite</h2>
          <button className="google-btn" onClick={handleGoogleSignIn}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/240px-Google_%22G%22_logo.svg.png"
              alt="Google"
              className="google-icon"
            />
            Sign in with Google
          </button>

          <div className="features">
            <h4>✨ Features</h4>
            <ul>
              <li>🔒 Secure Login</li>
              <li>💬 Real-time Messaging</li>
              <li>👽Join Room and create room</li>
              <li>📱Chat History</li>
            </ul>
          </div>

          <div className="chat-preview">
            <div className="message left">Hey, are we meeting today?</div>
            <div className="message right">Yeah! 5 PM as planned 🙂</div>
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