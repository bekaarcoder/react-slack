import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";
import "firebase/firestore";

var firebaseConfig = {
  apiKey: "AIzaSyDi7h43KnC2RI_iqAQjwHyl7P4O_ttBb_c",
  authDomain: "gkeep-981eb.firebaseapp.com",
  databaseURL: "https://gkeep-981eb.firebaseio.com",
  projectId: "gkeep-981eb",
  storageBucket: "gkeep-981eb.appspot.com",
  messagingSenderId: "63191259742",
  appId: "1:63191259742:web:582211a0e23ace71eb72cf",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
