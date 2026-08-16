import { useState, useEffect } from "react";
import "./App.css";

function App() {
  // Signup states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Common states
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Page states
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  // Logged-in user
  const [user, setUser] = useState(null);

  // Task states
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);

  // Note states
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteTitle, setEditNoteTitle] = useState("");
  const [editNoteContent, setEditNoteContent] = useState("");

  // AI Assistant states
  const [aiMessages, setAiMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! 👋 I am your StudyMate AI Assistant. Ask me anything about your studies, tasks, notes, programming, or study planning.",
    },
  ]);

  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // -------------------------
  // SAVED USER CHECK
  // -------------------------
  useEffect(() => {
    const savedUser = localStorage.getItem("studymate_user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // -------------------------
  // FETCH NOTES
  // -------------------------
  const fetchNotes = async () => {
    const token = localStorage.getItem("studymate_token");

    if (!token) {
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/notes", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch notes");
      }

      setNotes(data.notes);
    } catch (error) {
      console.error(error);
      setError("❌ " + error.message);
    }
  };

  // -------------------------
  // FETCH TASKS AND NOTES
  // -------------------------
  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("studymate_token");

      if (!token) {
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/tasks", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to fetch tasks");
        }

        setTasks(data.tasks);
      } catch (error) {
        console.error(error);
        setError("❌ " + error.message);
      }
    };

    if (isLoggedIn) {
      fetchTasks();
      fetchNotes();
    }
  }, [isLoggedIn]);

  // -------------------------
  // CREATE NOTE
  // -------------------------
  const handleCreateNote = async (e) => {
    e.preventDefault();

    setNoteLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("studymate_token");

      if (!token) {
        throw new Error("You are not logged in");
      }

      const response = await fetch("http://127.0.0.1:8000/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create note");
      }

      setNotes((previousNotes) => [...previousNotes, data.note]);

      setNoteTitle("");
      setNoteContent("");
      setMessage("✅ Note created successfully");
    } catch (error) {
      console.error("Create note error:", error);
      setError("❌ " + error.message);
    } finally {
      setNoteLoading(false);
    }
  };

  // -------------------------
  // UPDATE NOTE
  // -------------------------
  const handleUpdateNote = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("studymate_token");

      if (!token) {
        throw new Error("You are not logged in");
      }

      const response = await fetch(
        `http://127.0.0.1:8000/notes/${editingNoteId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editNoteTitle,
            content: editNoteContent,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update note");
      }

      setNotes((previousNotes) =>
        previousNotes.map((note) =>
          note.id === editingNoteId ? data.note : note
        )
      );

      setEditingNoteId(null);
      setEditNoteTitle("");
      setEditNoteContent("");

      setMessage("✅ Note updated successfully");
    } catch (error) {
      console.error("Update note error:", error);
      setError("❌ " + error.message);
    }
  };

  // -------------------------
  // DELETE NOTE
  // -------------------------
  const handleDeleteNote = async (noteId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("studymate_token");

      if (!token) {
        throw new Error("You are not logged in");
      }

      const response = await fetch(
        `http://127.0.0.1:8000/notes/${noteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete note");
      }

      setNotes((previousNotes) =>
        previousNotes.filter((note) => note.id !== noteId)
      );

      setMessage("✅ Note deleted successfully");
    } catch (error) {
      console.error("Delete note error:", error);
      setError("❌ " + error.message);
    }
  };

  // -------------------------
  // SIGNUP
  // -------------------------
  const handleSignup = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Signup failed");
      }

      setMessage("✅ " + data.message);

      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error(error);
      setError("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // LOGIN
  // -------------------------
  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      localStorage.setItem("studymate_token", data.access_token);

      setUser(data.user);
      setIsLoggedIn(true);

      localStorage.setItem(
        "studymate_user",
        JSON.stringify(data.user)
      );

      fetchNotes();

      setMessage("");
      setError("");

      setEmail("");
      setPassword("");
    } catch (error) {
      console.error(error);
      setError("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // ADD TASK
  // -------------------------
  const handleAddTask = async (e) => {
    e.preventDefault();

    setTaskLoading(true);
    setError("");
    setMessage("");

    const token = localStorage.getItem("studymate_token");

    try {
      const response = await fetch("http://127.0.0.1:8000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          status: "pending",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create task");
      }

      setTasks((previousTasks) => [
        ...previousTasks,
        data.task,
      ]);

      setTaskTitle("");
      setTaskDescription("");

      setMessage("✅ Task added successfully");
    } catch (error) {
      console.error(error);
      setError("❌ " + error.message);
    } finally {
      setTaskLoading(false);
    }
  };

  // -------------------------
  // UPDATE TASK
  // -------------------------
  const handleUpdateTask = async (taskId) => {
    const token = localStorage.getItem("studymate_token");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "completed",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update task");
      }

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === taskId ? data.task : task
        )
      );

      setMessage("✅ Task completed successfully");
    } catch (error) {
      console.error(error);
      setError("❌ " + error.message);
    }
  };

  // -------------------------
  // DELETE TASK
  // -------------------------
  const handleDeleteTask = async (taskId) => {
    const token = localStorage.getItem("studymate_token");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete task");
      }

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task.id !== taskId)
      );

      setMessage("✅ Task deleted successfully");
    } catch (error) {
      console.error(error);
      setError("❌ " + error.message);
    }
  };

  // -------------------------
  // AI ASSISTANT
  // -------------------------
  const handleAiChat = async (e) => {
    e.preventDefault();

    const question = aiInput.trim();

    if (!question) {
      return;
    }

    const userMessage = {
      role: "user",
      content: question,
    };

    setAiMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    setAiInput("");
    setAiLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("studymate_token");

      if (!token) {
        throw new Error("You are not logged in");
      }

      const response = await fetch(
        "http://127.0.0.1:8000/ai/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: question,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "AI Assistant request failed"
        );
      }

      const aiReply =
        data.response ||
        data.message ||
        data.answer ||
        "Sorry, I could not generate a response.";

      setAiMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "assistant",
          content: aiReply,
        },
      ]);
    } catch (error) {
      console.error("AI Assistant error:", error);

      setAiMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "assistant",
          content:
            "❌ I could not connect to the AI Assistant right now. Please make sure the backend AI endpoint is running.",
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // -------------------------
  // CLEAR AI CHAT
  // -------------------------
  const clearAiChat = () => {
    setAiMessages([
      {
        role: "assistant",
        content:
          "Hello! 👋 I am your StudyMate AI Assistant. Ask me anything about your studies, tasks, notes, programming, or study planning.",
      },
    ]);

    setAiInput("");
    setError("");
  };

  // -------------------------
  // LOGOUT
  // -------------------------
  const handleLogout = () => {
    localStorage.removeItem("studymate_user");
    localStorage.removeItem("studymate_token");

    setIsLoggedIn(false);
    setUser(null);
    setShowLogin(true);
    setMessage("");
    setError("");
  };

  // -------------------------
  // DASHBOARD
  // -------------------------
  if (isLoggedIn) {
    return (
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <h2>StudyMate AI</h2>
            <p>StudentOS</p>
          </div>

          <nav className="sidebar-nav">
            <button
              className={
                activePage === "dashboard" ? "active" : ""
              }
              onClick={() => setActivePage("dashboard")}
            >
              🏠 Dashboard
            </button>

            <button
              className={
                activePage === "tasks" ? "active" : ""
              }
              onClick={() => setActivePage("tasks")}
            >
              📋 Tasks
            </button>

            <button
              className={
                activePage === "notes" ? "active" : ""
              }
              onClick={() => setActivePage("notes")}
            >
              📝 Notes
            </button>

            <button
              className={
                activePage === "planner" ? "active" : ""
              }
              onClick={() => setActivePage("planner")}
            >
              📅 Planner
            </button>

            <button
              className={
                activePage === "progress" ? "active" : ""
              }
              onClick={() => setActivePage("progress")}
            >
              📊 Progress
            </button>

            <button
              className={
                activePage === "ai" ? "active" : ""
              }
              onClick={() => setActivePage("ai")}
            >
              🤖 AI Assistant
            </button>
          </nav>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </aside>

        <main className="main-content">
          <h1>StudyMate AI</h1>

          {message && (
            <p className="status-message success">
              {message}
            </p>
          )}

          {error && (
            <p className="status-message error">
              {error}
            </p>
          )}

          {/* =========================
              DASHBOARD
          ========================= */}
          {activePage === "dashboard" && (
            <section className="page-section dashboard-page">
              <div className="dashboard-header">
                <div>
                  <p className="dashboard-eyebrow">
                    STUDY OVERVIEW
                  </p>

                  <h2>
                    Welcome back, {user?.name}! 👋
                  </h2>

                  <p className="page-subtitle">
                    Here's what's happening with your
                    studies today.
                  </p>
                </div>

                <div className="dashboard-date">
                  📚 Stay focused. Keep learning.
                </div>
              </div>

              <div className="stats-grid dashboard-stats">
                <div className="stat-card">
                  <div className="stat-icon">📋</div>
                  <h3>Total Tasks</h3>
                  <p>{tasks.length}</p>
                  <span>All your tasks</span>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">⏳</div>
                  <h3>Pending Tasks</h3>
                  <p>
                    {
                      tasks.filter(
                        (task) =>
                          task.status === "pending"
                      ).length
                    }
                  </p>
                  <span>Need your attention</span>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <h3>Completed</h3>
                  <p>
                    {
                      tasks.filter(
                        (task) =>
                          task.status === "completed"
                      ).length
                    }
                  </p>
                  <span>Tasks completed</span>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📝</div>
                  <h3>Total Notes</h3>
                  <p>{notes.length}</p>
                  <span>Your study notes</span>
                </div>
              </div>

              <div className="dashboard-card progress-card">
                <div className="card-heading">
                  <div>
                    <h3>🎯 Task Progress</h3>
                    <p>
                      Keep completing your tasks to stay
                      on track.
                    </p>
                  </div>

                  <strong>
                    {tasks.length === 0
                      ? 0
                      : Math.round(
                          (tasks.filter(
                            (task) =>
                              task.status ===
                              "completed"
                          ).length /
                            tasks.length) *
                            100
                        )}
                    %
                  </strong>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        tasks.length === 0
                          ? 0
                          : Math.round(
                              (tasks.filter(
                                (task) =>
                                  task.status ===
                                  "completed"
                              ).length /
                                tasks.length) *
                                100
                            )
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="dashboard-columns">
                <div className="dashboard-card">
                  <div className="card-heading">
                    <div>
                      <h3>📋 Recent Tasks</h3>
                      <p>Your latest study tasks.</p>
                    </div>

                    <button
                      onClick={() =>
                        setActivePage("tasks")
                      }
                    >
                      View All
                    </button>
                  </div>

                  {tasks.length === 0 ? (
                    <div className="empty-dashboard">
                      <span>📋</span>
                      <p>No tasks yet.</p>

                      <button
                        onClick={() =>
                          setActivePage("tasks")
                        }
                      >
                        Create Task
                      </button>
                    </div>
                  ) : (
                    <div className="dashboard-list">
                      {tasks
                        .slice(-4)
                        .reverse()
                        .map((task) => (
                          <div
                            key={task.id}
                            className="dashboard-list-item"
                          >
                            <div>
                              <h4>{task.title}</h4>

                              <p>
                                {task.description ||
                                  "No description added."}
                              </p>
                            </div>

                            <span
                              className={`task-status ${
                                task.status ===
                                "completed"
                                  ? "completed"
                                  : "pending"
                              }`}
                            >
                              {task.status ===
                              "completed"
                                ? "Completed"
                                : "Pending"}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="dashboard-card">
                  <div className="card-heading">
                    <div>
                      <h3>📝 Recent Notes</h3>
                      <p>Your latest study notes.</p>
                    </div>

                    <button
                      onClick={() =>
                        setActivePage("notes")
                      }
                    >
                      View All
                    </button>
                  </div>

                  {notes.length === 0 ? (
                    <div className="empty-dashboard">
                      <span>📝</span>
                      <p>No notes yet.</p>

                      <button
                        onClick={() =>
                          setActivePage("notes")
                        }
                      >
                        Create Note
                      </button>
                    </div>
                  ) : (
                    <div className="dashboard-list">
                      {notes
                        .slice(-4)
                        .reverse()
                        .map((note) => (
                          <div
                            key={note.id}
                            className="dashboard-list-item"
                          >
                            <div>
                              <h4>{note.title}</h4>

                              <p>
                                {note.content.length >
                                80
                                  ? note.content.substring(
                                      0,
                                      80
                                    ) + "..."
                                  : note.content}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="dashboard-card quick-actions">
                <div className="card-heading">
                  <div>
                    <h3>⚡ Quick Actions</h3>
                    <p>
                      Jump directly to what you want to
                      do.
                    </p>
                  </div>
                </div>

                <div className="quick-action-buttons">
                  <button
                    onClick={() =>
                      setActivePage("tasks")
                    }
                  >
                    📋 Add Task
                  </button>

                  <button
                    onClick={() =>
                      setActivePage("notes")
                    }
                  >
                    📝 Create Note
                  </button>

                  <button
                    onClick={() =>
                      setActivePage("planner")
                    }
                  >
                    📅 Open Planner
                  </button>

                  <button
                    onClick={() =>
                      setActivePage("progress")
                    }
                  >
                    📊 View Progress
                  </button>

                  <button
                    onClick={() =>
                      setActivePage("ai")
                    }
                  >
                    🤖 Ask AI
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* =========================
              TASKS
          ========================= */}
          {activePage === "tasks" && (
            <section className="page-section">
              <h2>📋 My Tasks</h2>

              <form
                onSubmit={handleAddTask}
                className="form-card"
              >
                <h3>Add New Task</h3>

                <div>
                  <label>Task Title</label>

                  <input
                    type="text"
                    placeholder="Enter task title"
                    value={taskTitle}
                    onChange={(e) =>
                      setTaskTitle(e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label>Description</label>

                  <textarea
                    placeholder="Enter task description"
                    value={taskDescription}
                    onChange={(e) =>
                      setTaskDescription(e.target.value)
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={taskLoading}
                >
                  {taskLoading
                    ? "Adding Task..."
                    : "Add Task"}
                </button>
              </form>

              <div className="tasks-list">
                {tasks.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>No tasks yet</h3>
                    <p>
                      Add your first study task and start
                      making progress.
                    </p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`task-card ${
                        task.status === "completed"
                          ? "task-completed"
                          : ""
                      }`}
                    >
                      <div className="task-card-top">
                        <div className="task-info">
                          <h3>{task.title}</h3>
                          <p>
                            {task.description ||
                              "No description added."}
                          </p>
                        </div>

                        <span
                          className={`task-status ${
                            task.status ===
                            "completed"
                              ? "completed"
                              : "pending"
                          }`}
                        >
                          {task.status === "completed"
                            ? "✓ Completed"
                            : "● Pending"}
                        </span>
                      </div>

                      <div className="task-card-bottom">
                        <span className="task-label">
                          {task.status === "completed"
                            ? "Great work! Keep going."
                            : "Needs your attention"}
                        </span>

                        <div className="task-actions">
                          {task.status === "pending" && (
                            <button
                              className="complete-btn"
                              onClick={() =>
                                handleUpdateTask(
                                  task.id
                                )
                              }
                            >
                              ✓ Complete
                            </button>
                          )}

                          <button
                            className="delete-btn"
                            onClick={() =>
                              handleDeleteTask(task.id)
                            }
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* =========================
              NOTES
          ========================= */}
          {activePage === "notes" && (
            <section className="page-section">
              <h2>📝 My Notes</h2>

              <form
                onSubmit={handleCreateNote}
                className="form-card"
              >
                <h3>Create New Note</h3>

                <div>
                  <label>Note Title</label>

                  <input
                    type="text"
                    placeholder="Enter note title"
                    value={noteTitle}
                    onChange={(e) =>
                      setNoteTitle(e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label>Note Content</label>

                  <textarea
                    placeholder="Write your note..."
                    value={noteContent}
                    onChange={(e) =>
                      setNoteContent(e.target.value)
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={noteLoading}
                >
                  {noteLoading
                    ? "Creating Note..."
                    : "Create Note"}
                </button>
              </form>

              <div className="notes-grid">
                {notes.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <h3>No notes yet</h3>
                    <p>
                      Create your first study note to keep
                      your learning organized.
                    </p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="note-card"
                    >
                      <div className="note-card-header">
                        <div className="note-icon">📝</div>

                        <div>
                          <h3>{note.title}</h3>
                          <span>Study Note</span>
                        </div>
                      </div>

                      <div className="note-content">
                        <p>{note.content}</p>
                      </div>

                      <div className="note-actions">
                        <button
                          className="edit-button"
                          onClick={() => {
                            setEditingNoteId(note.id);
                            setEditNoteTitle(
                              note.title
                            );
                            setEditNoteContent(
                              note.content
                            );
                          }}
                        >
                          ✏️ Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDeleteNote(note.id)
                          }
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {editingNoteId !== null && (
                <form
                  onSubmit={handleUpdateNote}
                  className="form-card edit-form"
                >
                  <h3>✏️ Edit Note</h3>

                  <label>Title</label>

                  <input
                    type="text"
                    value={editNoteTitle}
                    onChange={(e) =>
                      setEditNoteTitle(e.target.value)
                    }
                    required
                  />

                  <label>Content</label>

                  <textarea
                    value={editNoteContent}
                    onChange={(e) =>
                      setEditNoteContent(e.target.value)
                    }
                    required
                  />

                  <div className="item-actions">
                    <button type="submit">
                      💾 Save Changes
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingNoteId(null);
                        setEditNoteTitle("");
                        setEditNoteContent("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}

          {/* =========================
              PLANNER
          ========================= */}
          {activePage === "planner" && (
            <section className="page-section">
              <div className="page-header">
                <div>
                  <h2>📅 Study Planner</h2>

                  <p className="page-subtitle">
                    Organize your study time and stay
                    consistent.
                  </p>
                </div>

                <div className="planner-date">
                  <span>Today</span>

                  <strong>
                    {new Date().toLocaleDateString()}
                  </strong>
                </div>
              </div>

              <div className="planner-grid">
                <div className="planner-card">
                  <div className="planner-card-icon">
                    🎯
                  </div>

                  <h3>Today's Goal</h3>

                  <p>
                    Set a clear study goal for today.
                  </p>

                  <button className="planner-action">
                    + Add Goal
                  </button>
                </div>

                <div className="planner-card">
                  <div className="planner-card-icon">
                    ⏰
                  </div>

                  <h3>Study Sessions</h3>

                  <p>
                    Plan focused sessions for your
                    subjects.
                  </p>

                  <button className="planner-action">
                    + Add Session
                  </button>
                </div>

                <div className="planner-card">
                  <div className="planner-card-icon">
                    📚
                  </div>

                  <h3>Subjects</h3>

                  <p>
                    Organize your study schedule by
                    subject.
                  </p>

                  <button className="planner-action">
                    + Add Subject
                  </button>
                </div>
              </div>

              <div className="planner-empty">
                <div className="planner-empty-icon">
                  📅
                </div>

                <h3>Your study plan is empty</h3>

                <p>
                  Start planning your study sessions to
                  build a productive routine.
                </p>
              </div>
            </section>
          )}

          {/* =========================
              PROGRESS
          ========================= */}
          {activePage === "progress" && (
            <section className="page-section">
              <div className="page-header">
                <div>
                  <h2>📊 Your Progress</h2>

                  <p className="page-subtitle">
                    Track your study progress and stay
                    consistent.
                  </p>
                </div>
              </div>

              <div className="progress-overview">
                <div className="progress-main-card">
                  <div className="progress-circle">
                    <strong>
                      {tasks.length === 0
                        ? 0
                        : Math.round(
                            (tasks.filter(
                              (task) =>
                                task.status ===
                                "completed"
                            ).length /
                              tasks.length) *
                              100
                          )}
                      %
                    </strong>

                    <span>Completed</span>
                  </div>

                  <div className="progress-info">
                    <h3>
                      Overall Task Progress
                    </h3>

                    <p>
                      Keep completing your tasks to
                      improve your study progress.
                    </p>

                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${
                            tasks.length === 0
                              ? 0
                              : Math.round(
                                  (tasks.filter(
                                    (task) =>
                                      task.status ===
                                      "completed"
                                  ).length /
                                    tasks.length) *
                                    100
                                )
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="progress-stats-grid">
                <div className="progress-stat-card">
                  <div className="progress-stat-icon">
                    📋
                  </div>

                  <span>Total Tasks</span>

                  <strong>{tasks.length}</strong>
                </div>

                <div className="progress-stat-card">
                  <div className="progress-stat-icon">
                    ⏳
                  </div>

                  <span>Pending Tasks</span>

                  <strong>
                    {
                      tasks.filter(
                        (task) =>
                          task.status === "pending"
                      ).length
                    }
                  </strong>
                </div>

                <div className="progress-stat-card">
                  <div className="progress-stat-icon">
                    ✅
                  </div>

                  <span>Completed Tasks</span>

                  <strong>
                    {
                      tasks.filter(
                        (task) =>
                          task.status === "completed"
                      ).length
                    }
                  </strong>
                </div>

                <div className="progress-stat-card">
                  <div className="progress-stat-icon">
                    📝
                  </div>

                  <span>Total Notes</span>

                  <strong>{notes.length}</strong>
                </div>
              </div>

              <div className="progress-activity-card">
                <div className="activity-header">
                  <div>
                    <h3>📈 Study Activity</h3>

                    <p>
                      Your current study activity
                      overview.
                    </p>
                  </div>
                </div>

                {tasks.length === 0 &&
                notes.length === 0 ? (
                  <div className="activity-empty">
                    <div>📚</div>

                    <h3>No activity yet</h3>

                    <p>
                      Add some tasks and notes to start
                      tracking your progress.
                    </p>
                  </div>
                ) : (
                  <div className="activity-list">
                    <div className="activity-item">
                      <span>📋 Tasks created</span>

                      <strong>{tasks.length}</strong>
                    </div>

                    <div className="activity-item">
                      <span>
                        ✅ Tasks completed
                      </span>

                      <strong>
                        {
                          tasks.filter(
                            (task) =>
                              task.status ===
                              "completed"
                          ).length
                        }
                      </strong>
                    </div>

                    <div className="activity-item">
                      <span>📝 Notes created</span>

                      <strong>{notes.length}</strong>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* =========================
              AI ASSISTANT
          ========================= */}
          {activePage === "ai" && (
            <section className="page-section ai-page">
              <div className="ai-header">
                <div>
                  <p className="ai-eyebrow">
                    STUDYMATE AI
                  </p>

                  <h2>🤖 AI Study Assistant</h2>

                  <p className="page-subtitle">
                    Your personal AI assistant for
                    learning, planning and productivity.
                  </p>
                </div>

                <button
                  className="clear-chat-button"
                  onClick={clearAiChat}
                >
                  🗑 Clear Chat
                </button>
              </div>

              <div className="ai-chat-card">
                <div className="ai-chat-header">
                  <div className="ai-avatar">
                    🤖
                  </div>

                  <div>
                    <h3>StudyMate AI</h3>
                    <span>
                      Your personal study assistant
                    </span>
                  </div>

                  <div className="ai-online">
                    <span></span>
                    Online
                  </div>
                </div>

                <div className="ai-messages">
                  {aiMessages.map((chat, index) => (
                    <div
                      key={index}
                      className={`ai-message-row ${
                        chat.role === "user"
                          ? "user-message-row"
                          : "assistant-message-row"
                      }`}
                    >
                      {chat.role === "assistant" && (
                        <div className="message-avatar">
                          🤖
                        </div>
                      )}

                      <div
                        className={`ai-message ${
                          chat.role === "user"
                            ? "user-message"
                            : "assistant-message"
                        }`}
                      >
                        <p>{chat.content}</p>
                      </div>

                      {chat.role === "user" && (
                        <div className="message-avatar user-avatar">
                          👤
                        </div>
                      )}
                    </div>
                  ))}

                  {aiLoading && (
                    <div className="ai-message-row assistant-message-row">
                      <div className="message-avatar">
                        🤖
                      </div>

                      <div className="ai-message assistant-message">
                        <p>Thinking... 🤔</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="ai-suggestions">
                  <button
                    type="button"
                    onClick={() =>
                      setAiInput(
                        "Make a study plan for today"
                      )
                    }
                  >
                    📚 Make Study Plan
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setAiInput(
                        "Explain Python in simple words"
                      )
                    }
                  >
                    🐍 Explain Python
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setAiInput(
                        "Give me tips to study consistently"
                      )
                    }
                  >
                    🎯 Study Tips
                  </button>
                </div>

                <form
                  onSubmit={handleAiChat}
                  className="ai-input-area"
                >
                  <textarea
                    value={aiInput}
                    onChange={(e) =>
                      setAiInput(e.target.value)
                    }
                    placeholder="Ask StudyMate AI anything..."
                    rows="2"
                    disabled={aiLoading}
                  />

                  <button
                    type="submit"
                    disabled={
                      aiLoading ||
                      aiInput.trim() === ""
                    }
                  >
                    {aiLoading
                      ? "..."
                      : "Send 🚀"}
                  </button>
                </form>

                <p className="ai-disclaimer">
                  StudyMate AI can help with learning,
                  planning and general study questions.
                </p>
              </div>
            </section>
          )}
        </main>
      </div>
    );
  }

  // -------------------------
  // SIGNUP / LOGIN
  // -------------------------
  return (
    <div>
      <h1>StudyMate AI</h1>

      <p>Student Productivity Platform</p>

      {!showLogin ? (
        <>
          <h2>Create Account</h2>

          <form onSubmit={handleSignup}>
            <div>
              <label>Name</label>
              <br />

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />
            </div>

            <br />

            <div>
              <label>Email</label>
              <br />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>

            <br />

            <div>
              <label>Password</label>
              <br />

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>

            <br />

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Sign Up"}
            </button>
          </form>

          <br />

          <button
            onClick={() => {
              setShowLogin(true);
              setMessage("");
              setError("");
            }}
          >
            Already have an account? Login
          </button>
        </>
      ) : (
        <>
          <h2>Login</h2>

          <form onSubmit={handleLogin}>
            <div>
              <label>Email</label>
              <br />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>

            <br />

            <div>
              <label>Password</label>
              <br />

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>

            <br />

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>
          </form>

          <br />

          <button
            onClick={() => {
              setShowLogin(false);
              setMessage("");
              setError("");
            }}
          >
            Don't have an account? Sign Up
          </button>
        </>
      )}

      {message && <p>{message}</p>}

      {error && <p>{error}</p>}
    </div>
  );
}

export default App;

