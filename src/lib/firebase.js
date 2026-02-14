// Firebase Configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyB9pPrqqRqQbhcr8sLLXNgPIPLbr3uA6Rc",
    authDomain: "heaven-sbakery.firebaseapp.com",
    projectId: "heaven-sbakery",
    storageBucket: "heaven-sbakery.firebasestorage.app",
    messagingSenderId: "964076361987",
    appId: "1:964076361987:web:44e547c9229fa518de3136",
    measurementId: "G-VVTPK2H5L0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a a time.
        console.log('Firebase persistence failed: multiple tabs open');
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.log('Firebase persistence not supported by browser');
    }
});

export default app;
