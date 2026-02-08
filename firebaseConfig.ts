import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAldX9jSAAeqi4u_hXdI2WGmTRMrxmHTkM",
  authDomain: "bachelor-life-grocery.firebaseapp.com",
  projectId: "bachelor-life-grocery",
  storageBucket: "bachelor-life-grocery.firebasestorage.app",
  messagingSenderId: "78419016487",
  appId: "1:78419016487:web:a4dafa5505e3cd7ff50702",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
