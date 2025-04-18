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
    // Add these lines to configure popup behavior
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      // Use a more reliable approach
      const result = await signInWithPopup(auth, provider);
      // No need to call onLogin here - the onAuthStateChanged will handle it
      console.log("Sign-in successful");
    } catch (error) {
      // Improved error handling
      if (error.code === 'auth/popup-closed-by-user') {
        console.log("Sign-in popup was closed by the user");
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log("Sign-in popup request was cancelled");
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