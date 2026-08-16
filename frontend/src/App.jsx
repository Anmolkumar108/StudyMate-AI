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

  // Logged-in user
  const [user, setUser] = useState(null);

  // Task states
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);

  // Note states (Step 1)
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteTitle, setEditNoteTitle] = useState("");
  const [editNoteContent, setEditNoteContent] = useState("");

  // 1. Saved user check
  useEffect(() => {
    const savedUser = localStorage.getItem("studymate_user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // Step 2: FETCH NOTES Function
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

  // Step 3: Fetch Tasks and Notes when logged in
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
      fetchNotes(); // Fetching notes along with tasks
    }
  }, [isLoggedIn]);

  // POST /notes function (Create Note)
  const handleCreateNote = async (e) => {
    e.preventDefault();

    setNoteLoading(true);

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
    } catch (error) {
      console.error("Create note error:", error);
      setError("❌ " + error.message);
    } finally {
      setNoteLoading(false);
    }
  };

  // PUT /notes function (Edit Note)
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
    } catch (error) {
      console.error("Update note error:", error);
      setError("❌ " + error.message);
    }
  };

  // DELETE /notes function (Delete Note)
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

      // Deleted note ko frontend list se remove karo
      setNotes((previousNotes) =>
        previousNotes.filter((note) => note.id !== noteId)
      );
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
      localStorage.setItem("studymate_user", JSON.stringify(data.user));

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

      setTasks((previousTasks) => [...previousTasks, data.task]);

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
      <div>
        <h1>StudyMate AI</h1>

        <p>Student Productivity Platform</p>

        <h2>Welcome, {user?.name}! 👋</h2>

        <p>You are successfully logged in.</p>

        <hr />

        <h3>📚 Study Dashboard</h3>

        <h3>📋 My Tasks</h3>

        {/* Task Form */}
        <form onSubmit={handleAddTask}>
          <div>
            <label>Task Title</label>
            <br />

            <input
              type="text"
              placeholder="Enter task title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />
          </div>

          <br />

          <div>
            <label>Description</label>
            <br />

            <textarea
              placeholder="Enter task description"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
          </div>

          <br />

          <button type="submit" disabled={taskLoading}>
            {taskLoading ? "Adding Task..." : "Add Task"}
          </button>
        </form>

        <br />

        {/* Messages */}
        {message && <p>{message}</p>}
        {error && <p>{error}</p>}

        {/* Task List */}
        {tasks.length === 0 ? (
          <p>No tasks added yet.</p>
        ) : (
          <div>
            {tasks.map((task) => (
              <div key={task.id}>
                <h4>{task.title}</h4>

                <p>{task.description}</p>

                <p>Status: {task.status}</p>

                {task.status === "pending" && (
                  <button onClick={() => handleUpdateTask(task.id)}>
                    ✅ Mark as Completed
                  </button>
                )}

                {task.status === "completed" && (
                  <p>🎉 Completed</p>
                )}

                <br />

                <button onClick={() => handleDeleteTask(task.id)}>
                  🗑️ Delete
                </button>

                <hr />
              </div>
            ))}
          </div>
        )}

        <hr />

        <div>
          <h3>📝 My Notes</h3>

          <form onSubmit={handleCreateNote}>
            <div>
              <label>Note Title</label>
              <br />

              <input
                type="text"
                placeholder="Enter note title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                required
              />
            </div>

            <br />

            <div>
              <label>Note Content</label>
              <br />

              <textarea
                placeholder="Write your note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                required
              />
            </div>

            <br />

            <button type="submit" disabled={noteLoading}>
              {noteLoading ? "Creating Note..." : "Create Note"}
            </button>
          </form>

          <br />

          {notes.length === 0 ? (
            <p>No notes available.</p>
          ) : (
            notes.map((note) => (
              <div key={note.id}>
                <h4>{note.title}</h4>
                <p>{note.content}</p>

                <button
                  onClick={() => {
                    setEditingNoteId(note.id);
                    setEditNoteTitle(note.title);
                    setEditNoteContent(note.content);
                  }}
                >
                  Edit
                </button>

                <button onClick={() => handleDeleteNote(note.id)}>
                  Delete
                </button>

                <hr />
              </div>
            ))
          )}

          {editingNoteId !== null && (
            <form onSubmit={handleUpdateNote}>
              <h3>Edit Note</h3>

              <div>
                <label>Title</label>
                <br />

                <input
                  type="text"
                  value={editNoteTitle}
                  onChange={(e) => setEditNoteTitle(e.target.value)}
                  required
                />
              </div>

              <br />

              <div>
                <label>Content</label>
                <br />

                <textarea
                  value={editNoteContent}
                  onChange={(e) => setEditNoteContent(e.target.value)}
                  required
                />
              </div>

              <br />

              <button type="submit">
                Save Changes
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
            </form>
          )}
        </div>

        <p>📅 Study Planner: Coming Soon</p>
        <p>🤖 AI Study Assistant: Coming Soon</p>

        <br />

        <button onClick={handleLogout}>Logout</button>
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
                onChange={(e) => setName(e.target.value)}
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
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <br />

            <button type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
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
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <br />

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
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