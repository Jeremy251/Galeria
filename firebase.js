import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDL2fGCvbAq3MFqUu1kdoNH5QujrBgdIL0",
    authDomain: "galeria-virtual-ca31e.firebaseapp.com",
    projectId: "galeria-virtual-ca31e",
    storageBucket: "galeria-virtual-ca31e.appspot.com",
    messagingSenderId: "995853556041",
    appId: "1:995853556041:web:e33cfc53d0566ec68c6298",
    measurementId: "G-HLNF9Q89VQ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

