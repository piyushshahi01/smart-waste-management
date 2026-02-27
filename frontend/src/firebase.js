import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
    // NOTE: Add your Firebase Web API Key here!
    apiKey: "AIzaSyBNwUIYtUXU1RMZRL8NnFeU3_XcGckiFKo",
    databaseURL: "https://smart-waste-management-e1235-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, onValue };
