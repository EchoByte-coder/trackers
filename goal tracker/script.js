let goals = JSON.parse(localStorage.getItem("goals")) || [];
let year = localStorage.getItem("year");
let darkMode = localStorage.getItem("theme") !== "light";
let percentView = true;

const goalList = document.getElementById("goalList");
const status = document.getElementById("status");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const themeToggle = document.getElementById("themeToggle");

if (year) document.getElementById("yearInput").value = year;
if (!darkMode) document.body.classList.add("light");

themeToggle.onclick = () => {
  document.body.classList.toggle("light");
  darkMode = !darkMode;
  localStorage.setItem("theme", darkMode ? "dark" : "light");
};

function saveYear() {
  year = document.getElementById("yearInput").value;
  if (!year) return alert("Enter year");
  localStorage.setItem("year", year);
  checkNotification();
  render();
}

function addGoal() {
  const text = document.getElementById("goalInput").value;
  if (!text) return;
  goals.push({ text, done: false });
  localStorage.setItem("goals", JSON.stringify(goals));
  document.getElementById("goalInput").value = "";
  render();
}

function deleteGoal(i) {
  goals.splice(i, 1);
  localStorage.setItem("goals", JSON.stringify(goals));
  render();
}

function toggleDone(i) {
  goals[i].done = !goals[i].done;
  localStorage.setItem("goals", JSON.stringify(goals));
  render();
}

function addOtherThing() {
  const text = prompt("What else did you achieve?");
  if (!text) return;
  goals.push({ text: "✨ " + text, done: true });
  localStorage.setItem("goals", JSON.stringify(goals));
  render();
}

function toggleProgressView() {
  percentView = !percentView;
  renderProgress();
}

function render() {
  goalList.innerHTML = "";
  const yearDone = year && new Date().getFullYear() > year;

  goals.forEach((g, i) => {
    const li = document.createElement("li");
    if (g.done) li.classList.add("done");

    li.innerHTML = `
      <span>${g.text}</span>
      <div>
        ${yearDone ? `<input type="checkbox" ${g.done ? "checked" : ""} onclick="toggleDone(${i})">` : ""}
        <button onclick="deleteGoal(${i})">✖</button>
      </div>
    `;
    goalList.appendChild(li);
  });

  status.textContent = yearDone
    ? "✅ Year completed! Check what you achieved"
    : "⏳ Goals will unlock after 1 year";

  renderProgress();
}

function renderProgress() {
  if (goals.length === 0) {
    progressFill.style.width = "0%";
    progressText.textContent = "0%";
    return;
  }

  const done = goals.filter(g => g.done).length;
  const percent = Math.round((done / goals.length) * 100);

  progressFill.style.width = percent + "%";
  progressText.textContent = percentView ? percent + "%" : `${done}/${goals.length}`;
}

function checkNotification() {
  if (!("Notification" in window)) return;

  Notification.requestPermission().then(p => {
    if (p === "granted") {
      const currentYear = new Date().getFullYear();
      if (currentYear > year) {
        new Notification("🎯 Goal Tracker", {
          body: "1 year completed! Check your goals now."
        });
      }
    }
  });
}

render();
checkNotification();
function shareGoals() {
  const data = {
    year: year,
    goals: goals
  };

  const encoded = btoa(JSON.stringify(data));
  const shareURL = `${location.origin}${location.pathname}?data=${encoded}`;

  navigator.clipboard.writeText(shareURL)
    .then(() => alert("Share link copied! 📋"))
    .catch(() => prompt("Copy this link:", shareURL));
}

// Load shared data from URL
(function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const data = params.get("data");

  if (data) {
    try {
      const decoded = JSON.parse(atob(data));
      year = decoded.year;
      goals = decoded.goals;

      localStorage.setItem("year", year);
      localStorage.setItem("goals", JSON.stringify(goals));

      document.getElementById("yearInput").value = year;
      render();
    } catch (e) {
      console.error("Invalid share link");
    }
  }
})();
// ===== ENTER KEY PATCH (NON-BREAKING) =====
(function () {
  function attachEnter(id, fn) {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("keyup", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        fn();
      }
    });
  }

  // attach safely
  attachEnter("yearInput", window.saveYear);
  attachEnter("goalInput", window.addGoal);
})();

