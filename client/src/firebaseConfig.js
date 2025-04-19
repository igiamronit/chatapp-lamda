// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


//importing for authentication
import { getAuth } from "firebase/auth"; 

// TODO: Add SDKs for Firebase products that you want to use


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3GMumLorZmr8ZuxwVxCx3aSSCCS3kXsI",
  authDomain: "chatapp-c0308.firebaseapp.com",
  projectId: "chatapp-c0308",
  storageBucket: "chatapp-c0308.appspot.com",
  messagingSenderId: "405739302457",
  appId: "1:405739302457:web:50e2933f7f9103af1827e8",
  measurementId: "G-FVQPP1YLJB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); 

export{db, auth};


