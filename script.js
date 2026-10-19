

   
  
/* =========================================
   PATIENT SEVA - FIREBASE AUTHENTICATION
   ========================================= */

// STEP 1: Firebase configuration
// Replace every placeholder with the exact value
// from Firebase Console > Project settings > Your apps.

const firebaseConfig = {
  apiKey: "PASTE_YOUR_ACTUAL_API_KEY",
  authDomain: "PASTE_YOUR_ACTUAL_AUTH_DOMAIN",
  projectId: "patient-seva",
  storageBucket: "PASTE_YOUR_ACTUAL_STORAGE_BUCKET",
  messagingSenderId: "905796150041",
  appId: "PASTE_YOUR_ACTUAL_APP_ID"
};

// STEP 2: Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

// STEP 3: Find page elements safely
const byId = (id) => document.getElementById(id);

function showMessage(id, message, isError = false) {
  const element = byId(id);

  if (element) {
    element.textContent = message;
    element.style.color = isError ? "#c62828" : "#187443";
  } else {
    alert(message);
  }
}

function showPage(pageId) {
  document.querySelectorAll(
    ".page, .card, section"
  ).forEach((element) => {
    if (
      element.id &&
      /loginPage|otpPage|registerPage|paymentPage|pendingPage|trackingPage|patientLogin|receptionistLogin|patientDashboard|receptionistDashboard/.test(element.id)
    ) {
      element.classList.add("hidden");
    }
  });

  const page = byId(pageId);

  if (page) {
    page.classList.remove("hidden");
    page.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    showMessage(
      "loginMessage",
      "Login successful. Dashboard page abhi HTML mein add karna baaki hai."
    );
  }
}

// STEP 4: Login role selection
// Your HTML needs buttons with these IDs:
// patientLoginButton and receptionistLoginButton.

let selectedRole = "patient";

if (byId("patientLoginButton")) {
  byId("patientLoginButton").addEventListener("click", () => {
    selectedRole = "patient";
    showPage("patientLogin");
  });
}

if (byId("receptionistLoginButton")) {
  byId("receptionistLoginButton").addEventListener("click", () => {
    selectedRole = "receptionist";
    showPage("receptionistLogin");
  });
}

// STEP 5: Email/password registration
// Expected IDs: signupForm, signupEmail, signupPassword,
// signupMessage.

if (byId("signupForm")) {
  byId("signupForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = byId("signupEmail")?.value.trim();
    const password = byId("signupPassword")?.value;

    if (!email || !password) {
      showMessage("signupMessage", "Email aur password bharo.", true);
      return;
    }

    try {
      await auth.createUserWithEmailAndPassword(email, password);
      showMessage("signupMessage", "Account create ho gaya!");
    } catch (error) {
      showMessage("signupMessage", error.message, true);
    }
  });
}

// STEP 6: Email/password login
// Expected IDs: loginForm, loginEmail, loginPassword,
// loginMessage.
//
// Receptionist access must NOT be granted just because
// someone selects the receptionist role. A trusted backend
// must verify staff authorization.

if (byId("loginForm")) {
  byId("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = byId("loginEmail")?.value.trim();
    const password = byId("loginPassword")?.value;

    if (!email || !password) {
      showMessage("loginMessage", "Email aur password bharo.", true);
      return;
    }

    try {
      const result = await auth.signInWithEmailAndPassword(
        email,
        password
      );

      if (selectedRole === "receptionist") {
        // Fail closed: never show staff dashboard until
        // trusted staff-role verification is implemented.
        await auth.signOut();

        showMessage(
          "loginMessage",
          "Receptionist login ke liye secure staff authorization abhi configure karna baaki hai.",
          true
        );
        return;
      }

      showMessage(
        "loginMessage",
        "Patient account login successful: " + result.user.email
      );

      showPage("patientDashboard");
    } catch (error) {
      showMessage("loginMessage", error.message, true);
    }
  });
}

// STEP 7: Phone OTP setup
// Expected HTML IDs:
// phoneNumber, sendOtpButton, recaptcha-container,
// otpCode, verifyOtpButton, phoneMessage.
//
// Firebase Console > Authentication > Sign-in method:
// enable Phone. Configure authorized domains in settings.

let confirmationResult = null;
let recaptchaVerifier = null;

async function setupRecaptcha() {
  if (recaptchaVerifier) return;

  if (!byId("recaptcha-container")) {
    throw new Error("HTML mein recaptcha-container element missing hai.");
  }

  recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
    "recaptcha-container",
    { size: "normal" }
  );

  await recaptchaVerifier.render();
}

if (byId("sendOtpButton")) {
  byId("sendOtpButton").addEventListener("click", async () => {
    const phone = byId("phoneNumber")?.value.trim();

    if (!phone || !/^\+[1-9]\d{7,14}$/.test(phone)) {
      showMessage(
        "phoneMessage",
        "Country code ke saath number likho, jaise +919876543210.",
        true
      );
      return;
    }

    try {
      await setupRecaptcha();

      confirmationResult = await auth.signInWithPhoneNumber(
        phone,
        recaptchaVerifier
      );

      showMessage("phoneMessage", "OTP SMS bhej diya gaya hai.");
    } catch (error) {
      showMessage("phoneMessage", error.message, true);

      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        recaptchaVerifier = null;
      }
    }
  });
}

if (byId("verifyOtpButton")) {
  byId("verifyOtpButton").addEventListener("click", async () => {
    const code = byId("otpCode")?.value.trim();

    if (!confirmationResult) {
      showMessage("phoneMessage", "Pehle Send OTP dabao.", true);
      return;
    }

    if (!/^\d{6}$/.test(code || "")) {
      showMessage("phoneMessage", "6-digit OTP enter karo.", true);
      return;
    }

    try {
      await confirmationResult.confirm(code);
      showMessage("phoneMessage", "Phone verification successful!");
      showPage(
        selectedRole === "receptionist"
          ? "receptionistDashboard"
          : "patientDashboard"
      );
    } catch (error) {
      showMessage("phoneMessage", error.message, true);
    }
  });
}

// STEP 8: Logout
// Add a button with ID logoutButton to your HTML.

if (byId("logoutButton")) {
  byId("logoutButton").addEventListener("click", async () => {
    try {
      await auth.signOut();
      selectedRole = "patient";
      showPage("loginPage");
    } catch (error) {
      alert("Logout error: " + error.message);
    }
  });
}

// STEP 9: Authentication state
auth.onAuthStateChanged((user) => {
  console.log(
    user
      ? "Firebase user signed in."
      : "No Firebase user signed in."
  );
});

console.log("Patient Seva Firebase script loaded.");
