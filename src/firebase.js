//import firebase from 'firebase';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

var firebaseConfig = {
  apiKey: "AIzaSyDwYv06vmLRodVBWy7Duz6b7tsGOkIPt7o",
  authDomain: "audio-example-expo.firebaseapp.com",
  databaseURL: "https://audio-example-expo-default-rtdb.firebaseio.com",
  projectId: "audio-example-expo",
  storageBucket: "audio-example-expo.appspot.com",
  messagingSenderId: "99320940161",
  appId: "1:99320940161:web:5a7320e0516d8c1433ef80",
};
// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth();
const storage = getStorage(firebaseApp);
//const storageRef = ref(storage, "some-child");
export { auth, storage };
export default db;
