// ────────────────────────────────────────────────
// Data & Storage
// ────────────────────────────────────────────────
let tasks = [];
let editingId = null;

const loadTasks = () => {
  const saved = localStorage.getItem("tasks");
  if (saved) tasks = JSON.parse(saved);
  renderTasks();
};

const saveTasks = () => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// ────────────────────────────────────────────────
// Render
// ────────────────────────────────────────────────
const renderTasks = () => {
  const tbody = document.getElementById("tasksBody");
  tbody.innerHTML = "";

  tasks.forEach((task) => {
    const tr = document.createElement("tr");
    if (task.completed) tr.classList.add("completed");

    tr.innerHTML = `
      <td>${task.name}</td>
      <td>${task.date || "—"}</td>
      <td>
        <input type="checkbox" ${task.completed ? "checked" : ""} 
               onchange="toggleComplete(${task.id})" />
      </td>
      <td class="actions">
        <button class="edit-btn" onclick="startEdit(${task.id})">Edit</button>
        <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
};

// ────────────────────────────────────────────────
// Validation
// ────────────────────────────────────────────────
const validateTask = (name, date) => {
  clearError();

  // 1. Task name is required
  if (!name.trim()) {
    showError("Task name is required");
    return false;
  }

  // 2. Date is required
  if (!date) {
    showError("Date is required");
    return false;
  }

  // 3. Date must be today or in the future
  const today = new Date().toISOString().split("T")[0];
  if (date < today) {
    showError("Date must be today or in the future");
    return false;
  }

  return true;
};

const showError = (msg) => {
  const errorEl = document.getElementById("error");
  errorEl.textContent = msg;
  errorEl.style.color = "#e74c3c";
  errorEl.style.fontWeight = "bold";
};

const clearError = () => {
  const errorEl = document.getElementById("error");
  errorEl.textContent = "";
};

// ────────────────────────────────────────────────
// Core Logic
// ────────────────────────────────────────────────
const addOrUpdateTask = () => {
  const nameInput = document.getElementById("taskName");
  const dateInput = document.getElementById("taskDate");

  const name = nameInput.value.trim();
  const date = dateInput.value;

  // Run validation → stop if anything is wrong
  if (!validateTask(name, date)) {
    return;
  }

  if (editingId !== null) {
    // Update existing task
    const task = tasks.find((t) => t.id === editingId);
    if (task) {
      task.name = name;
      task.date = date;
    }
    editingId = null;
    document.getElementById("addBtn").textContent = "Add Task";
  } else {
    // Add new task
    tasks.push({
      id: Date.now(),
      name,
      date,
      completed: false,
    });
  }

  saveTasks();
  renderTasks();

  // Clear form
  nameInput.value = "";
  dateInput.value = "";
  clearError();
};

const startEdit = (id) => {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  document.getElementById("taskName").value = task.name;
  document.getElementById("taskDate").value = task.date || "";
  editingId = id;
  document.getElementById("addBtn").textContent = "Update Task";
  clearError();
};

const deleteTask = (id) => {
  if (!confirm("Are you sure you want to delete this task?")) return;
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
};

const toggleComplete = (id) => {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
};

// ────────────────────────────────────────────────
// Sorting (updated: date newest first, completed first)
// ────────────────────────────────────────────────
const sortTasks = () => {
  const option = document.getElementById("sortOption").value;

  if (option === "name") {
    // A → Z (ascending - unchanged)
    tasks.sort((a, b) => a.name.localeCompare(b.name));
  } 
  else if (option === "date") {
    // Newest date first (descending)
    tasks.sort((a, b) => {
      const dateA = a.date || "0000-00-00"; // missing dates go to bottom
      const dateB = b.date || "0000-00-00";
      return dateB.localeCompare(dateA);   // reversed comparison
    });
  } 
  else if (option === "status") {
    // Completed first (true before false) → descending
    tasks.sort((a, b) => Number(b.completed) - Number(a.completed));
    // Alternative more readable way:
    // tasks.sort((a, b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0));
  }

  renderTasks();
};
// ────────────────────────────────────────────────
// Initialize
// ────────────────────────────────────────────────
window.addEventListener("load", () => {
  loadTasks();

  document.getElementById("addBtn").addEventListener("click", addOrUpdateTask);
  document.getElementById("sortOption").addEventListener("change", sortTasks);

  // Clear error when user types
  document.getElementById("taskName").addEventListener("input", clearError);
  document.getElementById("taskDate").addEventListener("input", clearError);

  // Press Enter in name field → add task
  document.getElementById("taskName").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addOrUpdateTask();
    }
  });
});