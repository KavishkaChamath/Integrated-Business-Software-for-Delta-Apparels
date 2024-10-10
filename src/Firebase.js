// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getDatabase } from 'firebase/database';

// const firebaseConfig = {
//     apiKey: "AIzaSyC3gMBeYl7pd9Z1CLfacz8iVlaDVYUpEkk",
//     authDomain: "delta-apparels-dee67.firebaseapp.com",
//     projectId: "delta-apparels-dee67",
//     storageBucket: "delta-apparels-dee67.appspot.com",
//     messagingSenderId: "740626810954",
//     appId: "1:740626810954:web:cb7d4b8bd1591e496f3eb3"
// };

// const app = initializeApp(firebaseConfig);

// export const auth = getAuth(app);
// export const database = getDatabase(app);
// export default firebase;

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD9ZiyXZ2iyNWEJxxEJ5yjKt9GZ2N3N3rU",
  authDomain: "delta-aperal.firebaseapp.com",
  databaseURL: "https://delta-aperal-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "delta-aperal",
  storageBucket: "delta-aperal.appspot.com",
  messagingSenderId: "1002041964384",
  appId: "1:1002041964384:web:ef57dbeb43e60dd01b1005",
  measurementId: "G-XVQDWVM27Z"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); 
export const database = getDatabase(app);
export const firestore = getFirestore(app);

export default app;
