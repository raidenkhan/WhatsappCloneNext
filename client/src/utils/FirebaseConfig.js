import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import {getAuth} from 'firebase/auth'
const firebaseConfig = {
    apiKey: "AIzaSyAPEYdtfzlI_kQELuuu_GXFRC_ctHBqiQA",
    authDomain: "whatsapp-clone-1bce5.firebaseapp.com",
    projectId: "whatsapp-clone-1bce5",
    storageBucket: "whatsapp-clone-1bce5.appspot.com",
    messagingSenderId: "204124978378",
    appId: "1:204124978378:web:bef42922df69040d26c833",
    measurementId: "G-G4ENMBXW5M"
  };  
  const app=initializeApp(firebaseConfig);
  export const firebaseAuth=getAuth(app);