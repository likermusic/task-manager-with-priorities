let currentUser = null;
let taskData = JSON.parse(localStorage.getItem("taskData")) || { users: {} };

// DOM
const loginSection = document.getElementById("login-section");
const taskSection = document.getElementById("task-section");
const usernameInput = document.getElementById("username-input");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const welcomeText = document.getElementById("welcome-text");
const taskForm = document.getElementById("task-form");
const taskTitleInput = document.getElementById("task-title");
const taskPrioritySelect = document.getElementById("task-priority");
const taskList = document.getElementById("task-list");
const filterStatus = document.getElementById("filter-status");

// === Авторизация ===
loginBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  if (!username) return alert("Введите имя пользователя!");

  currentUser = username;
  localStorage.setItem("currentUser", currentUser);

  if (!taskData.users[currentUser]) {
    taskData.users[currentUser] = [];
    saveData();
  }

  showTaskSection();
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  currentUser = null;
  showLoginSection();
});

// === Инициализация ===
window.addEventListener("load", () => {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = savedUser;
    showTaskSection();
  } else {
    showLoginSection();
  }
});

// === UI переключатели ===
function showLoginSection() {
  loginSection.classList.remove("hidden");
  taskSection.classList.add("hidden");
}

function showTaskSection() {
  loginSection.classList.add("hidden");
  taskSection.classList.remove("hidden");
  welcomeText.textContent = `Привет, ${currentUser}!`;
  renderTasks();
}

// === LocalStorage ===
function saveData() {
  localStorage.setItem("taskData", JSON.stringify(taskData));
}

// === Добавление задачи ===
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = taskTitleInput.value.trim();
  const priority = taskPrioritySelect.value;
  if (!title) return;

  const newTask = {
    id: Date.now(),
    title,
    priority,
    done: false,
  };

  taskData.users[currentUser].push(newTask);
  saveData();
  taskTitleInput.value = "";
  renderTasks();
});

// === Рендер ===
function renderTasks() {
  let tasks = [...taskData.users[currentUser]];

  const filter = filterStatus.value;
  if (filter === "done") tasks = tasks.filter((t) => t.done);
  if (filter === "todo") tasks = tasks.filter((t) => !t.done);

  taskList.innerHTML = "";

  if (tasks.length === 0) {
    taskList.innerHTML = `<p class="empty">Нет задач</p>`;
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task ${task.done ? "done" : ""}`;

    li.innerHTML = `
      <span class="priority-${task.priority}">${task.title}</span>
      <div class="task-buttons">
        <input type="checkbox" class="toggle-done" data-id="${task.id}" ${
      task.done ? "checked" : ""
    }>
        <button class="edit-btn" data-id="${task.id}">✏️</button>
        <button class="delete-btn" data-id="${task.id}">🗑️</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

// === Управление задачами ===
taskList.addEventListener("click", (e) => {
  const id = Number(e.target.dataset.id);
  if (!id) return;

  if (e.target.classList.contains("delete-btn")) {
    taskData.users[currentUser] = taskData.users[currentUser].filter(
      (t) => t.id !== id
    );
  }

  if (e.target.classList.contains("edit-btn")) {
    const newTitle = prompt("Измените текст задачи:");
    if (newTitle) {
      const task = taskData.users[currentUser].find((t) => t.id === id);
      task.title = newTitle;
    }
  }

  if (e.target.classList.contains("toggle-done")) {
    const task = taskData.users[currentUser].find((t) => t.id === id);
    task.done = !task.done;
  }

  saveData();
  renderTasks();
});

filterStatus.addEventListener("change", renderTasks);
