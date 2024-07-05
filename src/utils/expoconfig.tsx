import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAjBBsur8WHlVvwMJgLdRBm1zK4wj4B9oI",
  authDomain: "finnhubtestapp.firebaseapp.com",
  projectId: "finnhubtestapp",
  storageBucket: "finnhubtestapp.appspot.com",
  messagingSenderId: "228399626634",
  appId: "1:228399626634:web:4ee9524f7df8aa6d16f073",
};

const app = initializeApp(firebaseConfig);
initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, firebaseConfig };
