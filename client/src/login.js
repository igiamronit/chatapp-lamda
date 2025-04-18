import React, { useEffect } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import "./login.css";

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
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert("Google Sign-In failed.");
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
          <h2 className="login-title">Welcome to ChatApp</h2>
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
    );
  }

  // Only a slim bar after login
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