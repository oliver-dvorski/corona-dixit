import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBWgWhXUkawceKMI0F4cbpYeSFccwR2ksI',
  authDomain: 'corona-dixit.firebaseapp.com',
  databaseURL: 'https://corona-dixit.firebaseio.com',
  projectId: 'corona-dixit',
  storageBucket: 'corona-dixit.appspot.com',
  messagingSenderId: '332480501702',
  appId: '1:332480501702:web:475c458ca7abf810df44c7',
};

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();
export const auth = firebase.auth();
export const storage = firebase.storage();
