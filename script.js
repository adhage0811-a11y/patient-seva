

   
  

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCITf3NzUABQy1Gql8tMnKC-gDInPubVvs",
  authDomain: "patient-seva.firebaseapp.com",
  projectId: "patient-seva",
  storageBucket: "patient-seva.firebasestorage.app",
  messagingSenderId: "905796150041",
  appId: "1:905796150041:web:43edc91ce34bbee8871b88",
  measurementId: "G-CPEPM9V5ET"
};

// Connect to Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const get = (id) => document.getElementById(id);

function message(id, text) {
  const element = get(id);
  if (element) {
    element.textContent = text;
  } else {
    alert(text);
  }
}

function showPage(id) {
  document.querySelectorAll(
    "#loginPage, #patientLogin, #receptionistLogin, #patientDashboard, #receptionistDashboard"
  ).forEach((el) => el.classList.add("hidden"));

  const page = get(id);
  if (page) page.classList.remove("hidden");
}

// Patient signup
// HTML IDs: signupForm, signupEmail, signupPassword
if (get("signupForm")) {
  get("signupForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = get("signupEmail")?.value.trim();
    const password = get("signupPassword")?.value;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      message("signupMessage", "Account created successfully!");
    } catch (error) {
      message("signupMessage", error.message);
    }
  });
}

// Patient email/password login
// HTML IDs: loginForm, loginEmail, loginPassword
if (get("loginForm")) {
  get("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = get("loginEmail")?.value.trim();
    const password = get("loginPassword")?.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      message("loginMessage", "Login successful!");
      showPage("patientDashboard");
    } catch (error) {
      message("loginMessage", error.message);
    }
  });
}

// Logout
if (get("logoutButton")) {
  get("logoutButton").addEventListener("click", async () => {
    try {
      await signOut(auth);
      showPage("loginPage");
    } catch (error) {
      message("loginMessage", error.message);
    }
  });
}

// Watch authentication status
onAuthStateChanged(auth, (user) => {
  console.log(
    user ? "Firebase user signed in" : "No user signed in"
  );
});

console.log("Patient Seva Firebase connected.");
