// Shared Firebase initialization for Apni Dukan
// Loaded as an ES module by both admin.js and script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCD_hingWScbZToCWbMttPJ_TUTekSfN2w",
  authDomain: "apni-dukan-c5a29.firebaseapp.com",
  projectId: "apni-dukan-c5a29",
  storageBucket: "apni-dukan-c5a29.firebasestorage.app",
  messagingSenderId: "398816078746",
  appId: "1:398816078746:web:4ffaa29ae58ef396062823",
  measurementId: "G-M7GD1SGN1Z"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc
};
