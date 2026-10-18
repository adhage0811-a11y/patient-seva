
const patientForm = document.getElementById("patientForm");
const formMessage = document.getElementById("formMessage");

let tokenCounter = 25;
let servingCounter = 18;

patientForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("patientName").value.trim();
  const age = Number(document.getElementById("patientAge").value);
  const phone = document.getElementById("patientPhone").value.trim();

  if (!name || age < 1 || age > 120 || !/^[0-9]{10}$/.test(phone)) {
    formMessage.textContent = "Please enter valid patient details.";
    formMessage.style.color = "#dc2626";
    return;
  }

  tokenCounter++;

  const token = "A-" + String(tokenCounter).padStart(3, "0");

  document.getElementById("yourToken").textContent = token;

  const ahead = Math.max(0, tokenCounter - servingCounter - 1);
  document.getElementById("patientsAhead").textContent = ahead;
  document.getElementById("waitTime").textContent = (ahead * 5) + " min";

  formMessage.textContent =
    "Thank you, " + name + "! Your demo token is " + token + ".";

  formMessage.style.color = "#0e9f6e";

  document.querySelector(".tracker").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

document.getElementById("refreshBtn").addEventListener("click", function () {
  if (servingCounter < tokenCounter) {
    servingCounter++;
  }

  const ahead = Math.max(0, tokenCounter - servingCounter);
  document.getElementById("nowServing").textContent =
    "A-" + String(servingCounter).padStart(3, "0");
  document.getElementById("patientsAhead").textContent = ahead;
  document.getElementById("waitTime").textContent = (ahead * 5) + " min";

  const steps = document.querySelectorAll(".queue-step");
  steps.forEach(step => step.classList.remove("current"));

  if (ahead === 0) {
    steps[3].classList.add("current");
  } else if (ahead <= 2) {
    steps[2].classList.add("current");
  } else {
    steps[1].classList.add("current");
  }
});

document.getElementById("themeBtn").addEventListener("click", function () {
  document.body.classList.toggle("dark");

  this.textContent = document.body.classList.contains("dark")
    ? "☀️ Light Mode"
    : "🌙 Theme";
});
