import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = "http://127.0.0.1:8000";

const INITIAL_AI_MESSAGE = {
  role: "assistant",
  content:
    "Hello! 👋 I am your StudyMate AI Assistant. Ask me anything about your studies, tasks, notes, programming, or study planning.",
};

function App() {
  /* =========================================================
     AUTH STATE
  ========================================================= */

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [user, setUser] = useState(null);

  /* =========================================================
     TASK STATE
  ========================================================= */

  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);

  /* =========================================================
     NOTE STATE
  ========================================================= */

  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteTitle, setEditNoteTitle] = useState("");
  const [editNoteContent, setEditNoteContent] = useState("");

  /* =========================================================
     PLANNER STATE
  ========================================================= */

  const [plannerItems, setPlannerItems] = useState([]);

  const [plannerTitle, setPlannerTitle] = useState("");
  const [plannerDescription, setPlannerDescription] = useState("");
  const [plannerDate, setPlannerDate] = useState("");
  const [plannerDuration, setPlannerDuration] = useState("");
  const [plannerLoading, setPlannerLoading] = useState(false);

  const [editingPlannerId, setEditingPlannerId] = useState(null);
  const [editPlannerTitle, setEditPlannerTitle] = useState("");
  const [editPlannerDescription, setEditPlannerDescription] =
    useState("");
  const [editPlannerDate, setEditPlannerDate] = useState("");
  const [editPlannerDuration, setEditPlannerDuration] =
    useState("");
  const [editPlannerStatus, setEditPlannerStatus] =
    useState("pending");

  /* =========================================================
     AI STATE
  ========================================================= */

  const [aiMessages, setAiMessages] = useState([
    INITIAL_AI_MESSAGE,
  ]);

  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  /* =========================================================
     COMMON HELPERS
  ========================================================= */

  const clearStatus = () => {
    setMessage("");
    setError("");
  };

  const getToken = () => {
    return localStorage.getItem("studymate_token");
  };

  const authHeaders = () => {
    const token = getToken();

    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const getResponseData = async (response) => {
    try {
      const text = await response.text();

      if (!text) {
        return {};
      }

      return JSON.parse(text);
    } catch {
      return {};
    }
  };

  const getApiErrorMessage = (
    data,
    fallbackMessage = "Something went wrong"
  ) => {
    if (!data) {
      return fallbackMessage;
    }

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item) => {
          const field = Array.isArray(item.loc)
            ? item.loc.join(" → ")
            : "field";

          return `${field}: ${item.msg}`;
        })
        .join(" | ");
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    if (typeof data.error === "string") {
      return data.error;
    }

    return fallbackMessage;
  };

  const handleUnauthorized = () => {
    localStorage.removeItem("studymate_user");
    localStorage.removeItem("studymate_token");

    setIsLoggedIn(false);
    setUser(null);

    setTasks([]);
    setNotes([]);
    setPlannerItems([]);

    setShowLogin(true);
    setActivePage("dashboard");

    setError("❌ Session expired. Please login again.");
  };

  /* =========================================================
     RESTORE LOGIN
  ========================================================= */

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("studymate_user");
      const savedToken = localStorage.getItem("studymate_token");

      if (!savedUser || !savedToken) {
        return;
      }

      const parsedUser = JSON.parse(savedUser);

      if (!parsedUser || typeof parsedUser !== "object") {
        throw new Error("Invalid saved user");
      }

      setUser(parsedUser);
      setIsLoggedIn(true);
    } catch (restoreError) {
      console.error(
        "Restore login error:",
        restoreError
      );

      localStorage.removeItem("studymate_user");
      localStorage.removeItem("studymate_token");

      setUser(null);
      setIsLoggedIn(false);
    }
  }, []);

  /* =========================================================
     FETCH TASKS
  ========================================================= */

  const fetchTasks = async () => {
    const token = getToken();

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await getResponseData(response);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            data,
            "Failed to fetch tasks"
          )
        );
      }

      setTasks(
        Array.isArray(data.tasks)
          ? data.tasks
          : []
      );
    } catch (fetchError) {
      console.error(
        "Fetch tasks error:",
        fetchError
      );

      setError(
        "❌ " +
          (fetchError.message ||
            "Failed to fetch tasks")
      );
    }
  };

  /* =========================================================
     FETCH NOTES
  ========================================================= */

  const fetchNotes = async () => {
    const token = getToken();

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/notes`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await getResponseData(response);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            data,
            "Failed to fetch notes"
          )
        );
      }

      setNotes(
        Array.isArray(data.notes)
          ? data.notes
          : []
      );
    } catch (fetchError) {
      console.error(
        "Fetch notes error:",
        fetchError
      );

      setError(
        "❌ " +
          (fetchError.message ||
            "Failed to fetch notes")
      );
    }
  };

  /* =========================================================
     FETCH PLANNER
  ========================================================= */

  const fetchPlanner = async () => {
    const token = getToken();

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/planner`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await getResponseData(response);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            data,
            "Failed to fetch planner"
          )
        );
      }

      if (Array.isArray(data.planners)) {
        setPlannerItems(data.planners);
      } else if (Array.isArray(data.planner)) {
        setPlannerItems(data.planner);
      } else {
        setPlannerItems([]);
      }
    } catch (fetchError) {
      console.error(
        "Fetch planner error:",
        fetchError
      );

      setError(
        "❌ " +
          (fetchError.message ||
            "Failed to fetch planner")
      );
    }
  };

  /* =========================================================
     LOAD USER DATA
  ========================================================= */

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const loadUserData = async () => {
      clearStatus();

      await Promise.all([
        fetchTasks(),
        fetchNotes(),
        fetchPlanner(),
      ]);
    };

    loadUserData();
  }, [isLoggedIn]);

  /* =========================================================
     SIGNUP
  ========================================================= */

  const handleSignup = async (e) => {
    e.preventDefault();

    clearStatus();
    setLoading(true);

    try {
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanName) {
        throw new Error("Name is required");
      }

      if (!cleanEmail) {
        throw new Error("Email is required");
      }

      if (!password) {
        throw new Error("Password is required");
      }

      const response = await fetch(
        `${API_BASE_URL}/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            password,
          }),
        }
      );

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            data,
            "Signup failed"
          )
        );
      }

      setMessage(
        "✅ Account created successfully. Please login."
      );

      setName("");
      setEmail("");
      setPassword("");

      setShowLogin(true);
    } catch (signupError) {
      console.error(
        "Signup error:",
        signupError
      );

      setError(
        "❌ " +
          (signupError.message ||
            "Signup failed")
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOGIN
  ========================================================= */

  const handleLogin = async (e) => {
    e.preventDefault();

    clearStatus();
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail) {
        throw new Error("Email is required");
      }

      if (!password) {
        throw new Error("Password is required");
      }

      const response = await fetch(
        `${API_BASE_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
            password,
          }),
        }
      );

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            data,
            "Login failed"
          )
        );
      }

      if (
        !data.access_token ||
        !data.user
      ) {
        throw new Error(
          "Invalid login response from server"
        );
      }

      localStorage.setItem(
        "studymate_token",
        data.access_token
      );

      localStorage.setItem(
        "studymate_user",
        JSON.stringify(data.user)
      );

      setUser(data.user);
      setIsLoggedIn(true);
      setActivePage("dashboard");

      setEmail("");
      setPassword("");

      setTasks([]);
      setNotes([]);
      setPlannerItems([]);

      setMessage("");
      setError("");
    } catch (loginError) {
      console.error(
        "Login error:",
        loginError
      );

      setError(
        "❌ " +
          (loginError.message ||
            "Login failed")
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("studymate_user");
    localStorage.removeItem("studymate_token");

    setIsLoggedIn(false);
    setUser(null);

    setTasks([]);
    setNotes([]);
    setPlannerItems([]);

    setTaskTitle("");
    setTaskDescription("");

    setNoteTitle("");
    setNoteContent("");

    setPlannerTitle("");
    setPlannerDescription("");
    setPlannerDate("");
    setPlannerDuration("");

    setEditingNoteId(null);
    setEditingPlannerId(null);

    setShowLogin(true);
    setActivePage("dashboard");

    setAiMessages([
      INITIAL_AI_MESSAGE,
    ]);

    setAiInput("");

    clearStatus();
  };

  /* =========================================================
     TASK - CREATE
  ========================================================= */

  const handleAddTask = async (e) => {
    e.preventDefault();

    setTaskLoading(true);
    clearStatus();

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "You are not logged in"
        );
      }

      const title = taskTitle.trim();
      const description =
        taskDescription.trim();

      if (!title) {
        throw new Error(
          "Task title is required"
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/tasks`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            title,
            description,
            status: "pending",
          }),
        }
      );

      const data = await getResponseData(response);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            data,
            "Failed to create task"
          )
        );
      }

      if (data.task) {
        setTasks((previousTasks) => [
          ...previousTasks,
          data.task,
        ]);
      } else {
        await fetchTasks();
      }

      setTaskTitle("");
      setTaskDescription("");

      setMessage(
        "✅ Task added successfully"
      );
    } catch (taskError) {
      console.error(
        "Add task error:",
        taskError
      );

      setError(
        "❌ " +
          (taskError.message ||
            "Failed to create task")
      );
    } finally {
      setTaskLoading(false);
    }
  };

  /* =========================================================
     TASK - COMPLETE
  ========================================================= */

  const handleUpdateTask = async (taskId) => {
    clearStatus();

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "You are not logged in"
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/tasks/${taskId}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            status: "completed",
          }),
        }
      );

      const data = await getResponseData(response);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            data,
            "Failed to update task"
          )
        );
      }

      if (data.task) {
        setTasks((previousTasks) =>
          previousTasks.map((task) =>
            task.id === taskId
              ? data.task
              : task
          )
        );
      } else {
        await fetchTasks();
      }

      setMessage(
        "✅ Task completed successfully"
      );
    } catch (updateError) {
      console.error(
        "Update task error:",
        updateError
      );

      setError(
        "❌ " +
          (updateError.message ||
            "Failed to update task")
      );
    }
  };

  /* =========================================================
     TASK - DELETE
  ========================================================= */

  const handleDeleteTask = async (taskId) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this task?"
      );

    if (!confirmDelete) {
      return;
    }

    clearStatus();

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "You are not logged in"
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      const data = await getResponseData(response);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            data,
            "Failed to delete task"
          )
        );
      }

      setTasks((previousTasks) =>
        previousTasks.filter(
          (task) => task.id !== taskId
        )
      );

      setMessage(
        "✅ Task deleted successfully"
      );
    } catch (deleteError) {
      console.error(
        "Delete task error:",
        deleteError
      );

      setError(
        "❌ " +
          (deleteError.message ||
            "Failed to delete task")
      );
    }
  };

  /* =========================================================
     NOTE - CREATE
  ========================================================= */

  const handleCreateNote = async (e) => {
    e.preventDefault();

    setNoteLoading(true);
    clearStatus();

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "You are not logged in"
        );
      }

      const title = noteTitle.trim();
      const content = noteContent.trim();

      if (!title) {
        throw new Error(
          "Note title is required"
        );
      }

      if (!content) {
        throw new Error(
          "Note content is required"
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/notes`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            title,
            content,
          }),
        }
      );

      const data = await getResponseData(response);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            data,
            "Failed to create note"
          )
        );
      }

      if (data.note) {
        setNotes((previousNotes) => [
          ...previousNotes,
          data.note,
        ]);
      } else {
        await fetchNotes();
      }

      setNoteTitle("");
      setNoteContent("");

      setMessage(
        "✅ Note created successfully"
      );
    } catch (noteError) {
      console.error(
        "Create note error:",
        noteError
      );

      setError(
        "❌ " +
          (noteError.message ||
            "Failed to create note")
      );
    } finally {
      setNoteLoading(false);
    }
  };

  /* =========================================================
     NOTE - START EDIT
  ========================================================= */

  const startEditNote = (note) => {
    setEditingNoteId(note.id);

    setEditNoteTitle(
      String(note.title ?? "")
    );

    setEditNoteContent(
      String(note.content ?? "")
    );

    clearStatus();
  };

  /* =========================================================
     NOTE - CANCEL EDIT
  ========================================================= */

  const cancelEditNote = () => {
    setEditingNoteId(null);
    setEditNoteTitle("");
    setEditNoteContent("");
  };

  /* =========================================================
     NOTE - UPDATE
  ========================================================= */

  const handleUpdateNote = async (e) => {
    e.preventDefault();

    clearStatus();

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "You are not logged in"
        );
      }

      const title =
        editNoteTitle.trim();

      const content =
        editNoteContent.trim();

      if (!title) {
        throw new Error(
          "Note title is required"
        );
      }

      if (!content) {
        throw new Error(
          "Note content is required"
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/notes/${editingNoteId}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            title,
            content,
          }),
        }
      );

      const data = await getResponseData(response);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            data,
            "Failed to update note"
          )
        );
      }

      if (data.note) {
        setNotes((previousNotes) =>
          previousNotes.map((note) =>
            note.id === editingNoteId
              ? data.note
              : note
          )
        );
      } else {
        await fetchNotes();
      }

      cancelEditNote();

      setMessage(
        "✅ Note updated successfully"
      );
    } catch (updateError) {
      console.error(
        "Update note error:",
        updateError
      );

      setError(
        "❌ " +
          (updateError.message ||
            "Failed to update note")
      );
    }
  };

  /* =========================================================
     NOTE - DELETE
  ========================================================= */

  const handleDeleteNote = async (noteId) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this note?"
      );

    if (!confirmDelete) {
      return;
    }

    clearStatus();

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "You are not logged in"
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/notes/${noteId}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      const data = await getResponseData(response);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            data,
            "Failed to delete note"
          )
        );
      }

      setNotes((previousNotes) =>
        previousNotes.filter(
          (note) => note.id !== noteId
        )
      );

      if (editingNoteId === noteId) {
        cancelEditNote();
      }

      setMessage(
        "✅ Note deleted successfully"
      );
    } catch (deleteError) {
      console.error(
        "Delete note error:",
        deleteError
      );

      setError(
        "❌ " +
          (deleteError.message ||
            "Failed to delete note")
      );
    }
  };

  /* =========================================================
     PLANNER - CREATE
  ========================================================= */

  const handleAddPlanner = async (e) => {
    e.preventDefault();

    setPlannerLoading(true);
    clearStatus();

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "You are not logged in"
        );
      }

      const title =
        plannerTitle.trim();

      const description =
        plannerDescription.trim();

      const date = plannerDate;

      if (!title) {
        throw new Error(
          "Study title is required"
        );
      }

      if (!date) {
        throw new Error(
          "Please select a date"
        );
      }

      if (!plannerDuration) {
        throw new Error(
          "Please enter study duration"
        );
      }

      const numericDuration =
        Number(plannerDuration);

      if (
        !Number.isFinite(
          numericDuration
        ) ||
        numericDuration <= 0
      ) {
        throw new Error(
          "Duration must be greater than 0"
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/planner`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            title,
            description,
            date,
            duration: numericDuration,
            status: "pending",
          }),
        }
      );

      const data = await getResponseData(response);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            data,
            "Failed to create study plan"
          )
        );
      }

      if (data.planner) {
        setPlannerItems(
          (previousItems) => [
            ...previousItems,
            data.planner,
          ]
        );
      } else {
        await fetchPlanner();
      }

      setPlannerTitle("");
      setPlannerDescription("");
      setPlannerDate("");
      setPlannerDuration("");

      setMessage(
        "✅ Study session added successfully"
      );
    } catch (plannerError) {
      console.error(
        "Add planner error:",
        plannerError
      );

      setError(
        "❌ " +
          (plannerError.message ||
            "Failed to create study plan")
      );
    } finally {
      setPlannerLoading(false);
    }
  };

  /* =========================================================
     PLANNER - START EDIT
  ========================================================= */

  const startEditPlanner = (item) => {
    setEditingPlannerId(item.id);

    setEditPlannerTitle(
      String(item.title ?? "")
    );

    setEditPlannerDescription(
      String(item.description ?? "")
    );

    setEditPlannerDate(
      String(item.date ?? "")
    );

    setEditPlannerDuration(
      String(item.duration ?? "")
    );

    setEditPlannerStatus(
      item.status || "pending"
    );

    clearStatus();
  };

  /* =========================================================
     PLANNER - CANCEL EDIT
  ========================================================= */

  const cancelEditPlanner = () => {
    setEditingPlannerId(null);
    setEditPlannerTitle("");
    setEditPlannerDescription("");
    setEditPlannerDate("");
    setEditPlannerDuration("");
    setEditPlannerStatus("pending");
  };

  /* =========================================================
     PLANNER - UPDATE
  ========================================================= */

  const handleUpdatePlanner = async (e) => {
    e.preventDefault();

    clearStatus();

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "You are not logged in"
        );
      }

      const title =
        editPlannerTitle.trim();

      const description =
        editPlannerDescription.trim();

      const date = editPlannerDate;

      const duration = Number(
        editPlannerDuration
      );

      if (!title) {
        throw new Error(
          "Study title is required"
        );
      }

      if (!date) {
        throw new Error(
          "Please select a date"
        );
      }

      if (
        !Number.isFinite(duration) ||
        duration <= 0
      ) {
        throw new Error(
          "Duration must be greater than 0"
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/planner/${editingPlannerId}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            title,
            description,
            date,
            duration,
            status: editPlannerStatus,
          }),
        }
      );

      const data = await getResponseData(response);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            data,
            "Failed to update study plan"
          )
        );
      }

      if (data.planner) {
        setPlannerItems(
          (previousItems) =>
            previousItems.map((item) =>
              item.id ===
              editingPlannerId
                ? data.planner
                : item
            )
        );
      } else {
        await fetchPlanner();
      }

      cancelEditPlanner();

      setMessage(
        "✅ Study plan updated successfully"
      );
    } catch (updateError) {
      console.error(
        "Update planner error:",
        updateError
      );

      setError(
        "❌ " +
          (updateError.message ||
            "Failed to update study plan")
      );
    }
  };

  /* =========================================================
     PLANNER - DELETE
  ========================================================= */

  const handleDeletePlanner = async (
    plannerId
  ) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this study session?"
      );

    if (!confirmDelete) {
      return;
    }

    clearStatus();

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "You are not logged in"
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/planner/${plannerId}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      const data = await getResponseData(response);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            data,
            "Failed to delete study plan"
          )
        );
      }

      setPlannerItems(
        (previousItems) =>
          previousItems.filter(
            (item) =>
              item.id !== plannerId
          )
      );

      if (
        editingPlannerId ===
        plannerId
      ) {
        cancelEditPlanner();
      }

      setMessage(
        "✅ Study session deleted successfully"
      );
    } catch (deleteError) {
      console.error(
        "Delete planner error:",
        deleteError
      );

      setError(
        "❌ " +
          (deleteError.message ||
            "Failed to delete study plan")
      );
    }
  };

  /* =========================================================
     AI CHAT
  ========================================================= */

  const handleAiChat = async (e) => {
    e.preventDefault();

    const question =
      aiInput.trim();

    if (!question || aiLoading) {
      return;
    }

    const userMessage = {
      role: "user",
      content: question,
    };

    setAiMessages(
      (previousMessages) => [
        ...previousMessages,
        userMessage,
      ]
    );

    setAiInput("");
    setAiLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "You are not logged in"
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/ai/chat`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            message: question,
          }),
        }
      );

      const data =
        await getResponseData(response);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            data,
            "AI Assistant request failed"
          )
        );
      }

      const aiReply =
        data.response ||
        data.message ||
        data.answer;

      if (!aiReply) {
        throw new Error(
          "AI returned an empty response"
        );
      }

      setAiMessages(
        (previousMessages) => [
          ...previousMessages,
          {
            role: "assistant",
            content: String(aiReply),
          },
        ]
      );
    } catch (aiError) {
      console.error(
        "AI Assistant error:",
        aiError
      );

      setAiMessages(
        (previousMessages) => [
          ...previousMessages,
          {
            role: "assistant",
            content:
              "❌ I could not connect to the AI Assistant right now. Please make sure the AI backend endpoint is running.",
          },
        ]
      );

      setError(
        "❌ " +
          (aiError.message ||
            "AI Assistant request failed")
      );
    } finally {
      setAiLoading(false);
    }
  };

  /* =========================================================
     CLEAR AI CHAT
  ========================================================= */

  const clearAiChat = () => {
    setAiMessages([
      INITIAL_AI_MESSAGE,
    ]);

    setAiInput("");

    clearStatus();
  };

  /* =========================================================
     CALCULATIONS
  ========================================================= */

  const totalTasks = tasks.length;

  const completedTasks =
    tasks.filter(
      (task) =>
        task?.status === "completed"
    ).length;

  const pendingTasks =
    tasks.filter(
      (task) =>
        task?.status === "pending"
    ).length;

  const totalNotes = notes.length;

  const totalPlannerItems =
    plannerItems.length;

  const completedPlannerItems =
    plannerItems.filter(
      (item) =>
        item?.status === "completed"
    ).length;

  const taskProgress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks /
            totalTasks) *
            100
        );

  /* =========================================================
     LOGGED-IN APPLICATION
  ========================================================= */

  if (isLoggedIn) {
    return (
      <div className="app-layout">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="sidebar">

          <div className="sidebar-brand">
            <h2>StudyMate AI</h2>
            <p>StudentOS</p>
          </div>

          <nav className="sidebar-nav">

            <button
              type="button"
              className={
                activePage === "dashboard"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActivePage("dashboard")
              }
            >
              🏠 Dashboard
            </button>

            <button
              type="button"
              className={
                activePage === "tasks"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActivePage("tasks")
              }
            >
              📋 Tasks
            </button>

            <button
              type="button"
              className={
                activePage === "notes"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActivePage("notes")
              }
            >
              📝 Notes
            </button>

            <button
              type="button"
              className={
                activePage === "planner"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActivePage("planner")
              }
            >
              📅 Planner
            </button>

            <button
              type="button"
              className={
                activePage === "progress"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActivePage("progress")
              }
            >
              📊 Progress
            </button>

            <button
              type="button"
              className={
                activePage === "ai"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActivePage("ai")
              }
            >
              🤖 AI Assistant
            </button>

          </nav>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>

        </aside>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

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

          {/* =================================================
              DASHBOARD
          ================================================= */}

          {activePage === "dashboard" && (
            <section className="page-section dashboard-page">

              <div className="dashboard-header">

                <div>

                  <p className="dashboard-eyebrow">
                    STUDY OVERVIEW
                  </p>

                  <h2>
                    Welcome back,{" "}
                    {user?.name ||
                      "Student"}! 👋
                  </h2>

                  <p className="page-subtitle">
                    Here's what's happening with
                    your studies today.
                  </p>

                </div>

                <div className="dashboard-date">
                  📚 Stay focused. Keep learning.
                </div>

              </div>

              <div className="stats-grid dashboard-stats">

                <div className="stat-card">
                  <div className="stat-icon">
                    📋
                  </div>

                  <h3>Total Tasks</h3>

                  <p>{totalTasks}</p>

                  <span>
                    All your tasks
                  </span>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    ⏳
                  </div>

                  <h3>Pending Tasks</h3>

                  <p>{pendingTasks}</p>

                  <span>
                    Need your attention
                  </span>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    ✅
                  </div>

                  <h3>Completed</h3>

                  <p>
                    {completedTasks}
                  </p>

                  <span>
                    Tasks completed
                  </span>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    📝
                  </div>

                  <h3>Total Notes</h3>

                  <p>{totalNotes}</p>

                  <span>
                    Your study notes
                  </span>
                </div>

              </div>

              <div className="dashboard-card progress-card">

                <div className="card-heading">

                  <div>
                    <h3>
                      🎯 Task Progress
                    </h3>

                    <p>
                      Keep completing your tasks
                      to stay on track.
                    </p>
                  </div>

                  <strong>
                    {taskProgress}%
                  </strong>

                </div>

                <div className="progress-bar">

                  <div
                    className="progress-fill"
                    style={{
                      width: `${taskProgress}%`,
                    }}
                  />

                </div>

              </div>

              <div className="dashboard-columns">

                {/* RECENT TASKS */}

                <div className="dashboard-card">

                  <div className="card-heading">

                    <div>
                      <h3>
                        📋 Recent Tasks
                      </h3>

                      <p>
                        Your latest study tasks.
                      </p>
                    </div>

                    <button
                      type="button"
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

                      <p>
                        No tasks yet.
                      </p>

                      <button
                        type="button"
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

                              <h4>
                                {task.title ||
                                  "Untitled Task"}
                              </h4>

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

                {/* RECENT NOTES */}

                <div className="dashboard-card">

                  <div className="card-heading">

                    <div>
                      <h3>
                        📝 Recent Notes
                      </h3>

                      <p>
                        Your latest study notes.
                      </p>
                    </div>

                    <button
                      type="button"
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

                      <p>
                        No notes yet.
                      </p>

                      <button
                        type="button"
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
                        .map((note) => {

                          const content =
                            String(
                              note.content ?? ""
                            );

                          return (
                            <div
                              key={note.id}
                              className="dashboard-list-item"
                            >

                              <div>

                                <h4>
                                  {note.title ||
                                    "Untitled Note"}
                                </h4>

                                <p>
                                  {content.length >
                                  80
                                    ? content.substring(
                                        0,
                                        80
                                      ) + "..."
                                    : content ||
                                      "No content added."}
                                </p>

                              </div>

                            </div>
                          );
                        })}

                    </div>

                  )}

                </div>

              </div>

              <div className="dashboard-card quick-actions">

                <div className="card-heading">

                  <div>
                    <h3>
                      ⚡ Quick Actions
                    </h3>

                    <p>
                      Jump directly to what you
                      want to do.
                    </p>
                  </div>

                </div>

                <div className="quick-action-buttons">

                  <button
                    type="button"
                    onClick={() =>
                      setActivePage("tasks")
                    }
                  >
                    📋 Add Task
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActivePage("notes")
                    }
                  >
                    📝 Create Note
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActivePage("planner")
                    }
                  >
                    📅 Open Planner
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActivePage("progress")
                    }
                  >
                    📊 View Progress
                  </button>

                  <button
                    type="button"
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

          {/* =================================================
              TASKS PAGE
          ================================================= */}

          {activePage === "tasks" && (
            <section className="page-section">

              <h2>📋 My Tasks</h2>

              <form
                onSubmit={handleAddTask}
                className="form-card"
              >

                <h3>Add New Task</h3>

                <div>
                  <label>
                    Task Title
                  </label>

                  <input
                    type="text"
                    placeholder="Enter task title"
                    value={taskTitle}
                    onChange={(e) =>
                      setTaskTitle(
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div>
                  <label>
                    Description
                  </label>

                  <textarea
                    placeholder="Enter task description"
                    value={taskDescription}
                    onChange={(e) =>
                      setTaskDescription(
                        e.target.value
                      )
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

                    <div className="empty-icon">
                      📋
                    </div>

                    <h3>
                      No tasks yet
                    </h3>

                    <p>
                      Add your first study task
                      and start making progress.
                    </p>

                  </div>

                ) : (

                  tasks.map((task) => (

                    <div
                      key={task.id}
                      className={`task-card ${
                        task.status ===
                        "completed"
                          ? "task-completed"
                          : ""
                      }`}
                    >

                      <div className="task-card-top">

                        <div className="task-info">

                          <h3>
                            {task.title ||
                              "Untitled Task"}
                          </h3>

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
                            ? "✓ Completed"
                            : "● Pending"}
                        </span>

                      </div>

                      <div className="task-card-bottom">

                        <span className="task-label">
                          {task.status ===
                          "completed"
                            ? "Great work! Keep going."
                            : "Needs your attention"}
                        </span>

                        <div className="task-actions">

                          {task.status ===
                            "pending" && (

                            <button
                              type="button"
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
                            type="button"
                            className="delete-btn"
                            onClick={() =>
                              handleDeleteTask(
                                task.id
                              )
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

          {/* =================================================
              NOTES PAGE
          ================================================= */}

          {activePage === "notes" && (
            <section className="page-section">

              <h2>📝 My Notes</h2>

              <form
                onSubmit={handleCreateNote}
                className="form-card"
              >

                <h3>
                  Create New Note
                </h3>

                <div>

                  <label>
                    Note Title
                  </label>

                  <input
                    type="text"
                    placeholder="Enter note title"
                    value={noteTitle}
                    onChange={(e) =>
                      setNoteTitle(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

                <div>

                  <label>
                    Note Content
                  </label>

                  <textarea
                    placeholder="Write your note..."
                    value={noteContent}
                    onChange={(e) =>
                      setNoteContent(
                        e.target.value
                      )
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

                    <div className="empty-icon">
                      📝
                    </div>

                    <h3>
                      No notes yet
                    </h3>

                    <p>
                      Create your first study note
                      to keep your learning organized.
                    </p>

                  </div>

                ) : (

                  notes.map((note) => {

                    const safeTitle =
                      String(
                        note.title ??
                          "Untitled Note"
                      );

                    const safeContent =
                      String(
                        note.content ?? ""
                      );

                    return (
                      <div
                        key={note.id}
                        className="note-card"
                      >

                        <div className="note-card-header">

                          <div className="note-icon">
                            📝
                          </div>

                          <div>

                            <h3>
                              {safeTitle}
                            </h3>

                            <span>
                              Study Note
                            </span>

                          </div>

                        </div>

                        <div className="note-content">

                          <p>
                            {safeContent ||
                              "No content added."}
                          </p>

                        </div>

                        <div className="note-actions">

                          <button
                            type="button"
                            className="edit-button"
                            onClick={() =>
                              startEditNote(
                                note
                              )
                            }
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              handleDeleteNote(
                                note.id
                              )
                            }
                          >
                            🗑️ Delete
                          </button>

                        </div>

                      </div>
                    );
                  })

                )}

              </div>

              {editingNoteId !== null && (

                <form
                  onSubmit={handleUpdateNote}
                  className="form-card edit-form"
                >

                  <h3>
                    ✏️ Edit Note
                  </h3>

                  <label>
                    Title
                  </label>

                  <input
                    type="text"
                    value={editNoteTitle}
                    onChange={(e) =>
                      setEditNoteTitle(
                        e.target.value
                      )
                    }
                    required
                  />

                  <label>
                    Content
                  </label>

                  <textarea
                    value={editNoteContent}
                    onChange={(e) =>
                      setEditNoteContent(
                        e.target.value
                      )
                    }
                    required
                  />

                  <div className="item-actions">

                    <button type="submit">
                      💾 Save Changes
                    </button>

                    <button
                      type="button"
                      onClick={
                        cancelEditNote
                      }
                    >
                      Cancel
                    </button>

                  </div>

                </form>

              )}

            </section>
          )}

          {/* =================================================
              PLANNER PAGE
          ================================================= */}

          {activePage === "planner" && (
            <section className="page-section">

              <div className="page-header">

                <div>

                  <h2>
                    📅 Study Planner
                  </h2>

                  <p className="page-subtitle">
                    Organize your study time and
                    stay consistent.
                  </p>

                </div>

                <div className="planner-date">

                  <span>
                    Today
                  </span>

                  <strong>
                    {new Date().toLocaleDateString()}
                  </strong>

                </div>

              </div>

              <form
                onSubmit={handleAddPlanner}
                className="form-card"
              >

                <h3>
                  Add Study Session
                </h3>

                <div>

                  <label>
                    Study Title
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Python Practice"
                    value={plannerTitle}
                    onChange={(e) =>
                      setPlannerTitle(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

                <div>

                  <label>
                    Description
                  </label>

                  <textarea
                    placeholder="What will you study?"
                    value={plannerDescription}
                    onChange={(e) =>
                      setPlannerDescription(
                        e.target.value
                      )
                    }
                  />

                </div>

                <div>

                  <label>
                    Date
                  </label>

                  <input
                    type="date"
                    value={plannerDate}
                    onChange={(e) =>
                      setPlannerDate(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

                <div>

                  <label>
                    Duration (hours)
                  </label>

                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    placeholder="e.g. 2"
                    value={plannerDuration}
                    onChange={(e) =>
                      setPlannerDuration(
                        e.target.value
                      )
                    }
                    required
                  />

                  <small>
                    Example: 2 or 1.5
                  </small>

                </div>

                <button
                  type="submit"
                  disabled={plannerLoading}
                >
                  {plannerLoading
                    ? "Adding..."
                    : "Add Study Session"}
                </button>

              </form>

              <div className="planner-grid">

                <div className="planner-card">

                  <div className="planner-card-icon">
                    🎯
                  </div>

                  <h3>
                    Study Sessions
                  </h3>

                  <p>
                    Total planned sessions:
                  </p>

                  <strong>
                    {totalPlannerItems}
                  </strong>

                </div>

                <div className="planner-card">

                  <div className="planner-card-icon">
                    ✅
                  </div>

                  <h3>
                    Completed
                  </h3>

                  <p>
                    Completed study sessions:
                  </p>

                  <strong>
                    {completedPlannerItems}
                  </strong>

                </div>

                <div className="planner-card">

                  <div className="planner-card-icon">
                    📚
                  </div>

                  <h3>
                    Stay Consistent
                  </h3>

                  <p>
                    Plan your study sessions
                    and follow your routine.
                  </p>

                </div>

              </div>

              {editingPlannerId !== null && (

                <form
                  onSubmit={handleUpdatePlanner}
                  className="form-card edit-form"
                >

                  <h3>
                    ✏️ Edit Study Session
                  </h3>

                  <label>
                    Study Title
                  </label>

                  <input
                    type="text"
                    value={editPlannerTitle}
                    onChange={(e) =>
                      setEditPlannerTitle(
                        e.target.value
                      )
                    }
                    required
                  />

                  <label>
                    Description
                  </label>

                  <textarea
                    value={editPlannerDescription}
                    onChange={(e) =>
                      setEditPlannerDescription(
                        e.target.value
                      )
                    }
                  />

                  <label>
                    Date
                  </label>

                  <input
                    type="date"
                    value={editPlannerDate}
                    onChange={(e) =>
                      setEditPlannerDate(
                        e.target.value
                      )
                    }
                    required
                  />

                  <label>
                    Duration (hours)
                  </label>

                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={editPlannerDuration}
                    onChange={(e) =>
                      setEditPlannerDuration(
                        e.target.value
                      )
                    }
                    required
                  />

                  <label>
                    Status
                  </label>

                  <select
                    value={editPlannerStatus}
                    onChange={(e) =>
                      setEditPlannerStatus(
                        e.target.value
                      )
                    }
                  >

                    <option value="pending">
                      Pending
                    </option>

                    <option value="completed">
                      Completed
                    </option>

                  </select>

                  <div className="item-actions">

                    <button type="submit">
                      💾 Save Changes
                    </button>

                    <button
                      type="button"
                      onClick={
                        cancelEditPlanner
                      }
                    >
                      Cancel
                    </button>

                  </div>

                </form>

              )}

              {plannerItems.length === 0 ? (

                <div className="planner-empty">

                  <div className="planner-empty-icon">
                    📅
                  </div>

                  <h3>
                    Your study plan is empty
                  </h3>

                  <p>
                    Start planning your study
                    sessions to build a
                    productive routine.
                  </p>

                </div>

              ) : (

                <div className="planner-list">

                  {plannerItems.map((item) => (

                    <div
                      key={item.id}
                      className="planner-card"
                    >

                      <div className="planner-card-icon">
                        📚
                      </div>

                      <h3>
                        {item.title ||
                          "Untitled Session"}
                      </h3>

                      <p>
                        {item.description ||
                          "No description added."}
                      </p>

                      <p>
                        📅{" "}
                        {item.date ||
                          "No date"}
                      </p>

                      <p>
                        ⏱{" "}
                        {item.duration ??
                          "No duration"}{" "}
                        hours
                      </p>

                      <span
                        className={`task-status ${
                          item.status ===
                          "completed"
                            ? "completed"
                            : "pending"
                        }`}
                      >
                        {item.status ===
                        "completed"
                          ? "Completed"
                          : "Pending"}
                      </span>

                      <div className="task-actions">

                        <button
                          type="button"
                          className="complete-btn"
                          onClick={() =>
                            startEditPlanner(
                              item
                            )
                          }
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() =>
                            handleDeletePlanner(
                              item.id
                            )
                          }
                        >
                          🗑 Delete
                        </button>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </section>
          )}

          {/* =================================================
              PROGRESS PAGE
          ================================================= */}

          {activePage === "progress" && (
            <section className="page-section">

              <div className="page-header">

                <div>

                  <h2>
                    📊 Your Progress
                  </h2>

                  <p className="page-subtitle">
                    Track your study progress
                    and stay consistent.
                  </p>

                </div>

              </div>

              <div className="progress-overview">

                <div className="progress-main-card">

                  <div className="progress-circle">

                    <strong>
                      {taskProgress}%
                    </strong>

                    <span>
                      Completed
                    </span>

                  </div>

                  <div className="progress-info">

                    <h3>
                      Overall Task Progress
                    </h3>

                    <p>
                      Keep completing your tasks
                      to improve your study progress.
                    </p>

                    <div className="progress-bar">

                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${taskProgress}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

              </div>

              <div className="progress-stats-grid">

                <div className="progress-stat-card">

                  <div className="progress-stat-icon">
                    📋
                  </div>

                  <span>
                    Total Tasks
                  </span>

                  <strong>
                    {totalTasks}
                  </strong>

                </div>

                <div className="progress-stat-card">

                  <div className="progress-stat-icon">
                    ⏳
                  </div>

                  <span>
                    Pending Tasks
                  </span>

                  <strong>
                    {pendingTasks}
                  </strong>

                </div>

                <div className="progress-stat-card">

                  <div className="progress-stat-icon">
                    ✅
                  </div>

                  <span>
                    Completed Tasks
                  </span>

                  <strong>
                    {completedTasks}
                  </strong>

                </div>

                <div className="progress-stat-card">

                  <div className="progress-stat-icon">
                    📝
                  </div>

                  <span>
                    Total Notes
                  </span>

                  <strong>
                    {totalNotes}
                  </strong>

                </div>

              </div>

              <div className="progress-activity-card">

                <div className="activity-header">

                  <div>

                    <h3>
                      📈 Study Activity
                    </h3>

                    <p>
                      Your current study activity
                      overview.
                    </p>

                  </div>

                </div>

                {tasks.length === 0 &&
                notes.length === 0 &&
                plannerItems.length === 0 ? (

                  <div className="activity-empty">

                    <div>
                      📚
                    </div>

                    <h3>
                      No activity yet
                    </h3>

                    <p>
                      Add some tasks, notes or
                      study sessions to start
                      tracking your progress.
                    </p>

                  </div>

                ) : (

                  <div className="activity-list">

                    <div className="activity-item">

                      <span>
                        📋 Tasks created
                      </span>

                      <strong>
                        {totalTasks}
                      </strong>

                    </div>

                    <div className="activity-item">

                      <span>
                        ✅ Tasks completed
                      </span>

                      <strong>
                        {completedTasks}
                      </strong>

                    </div>

                    <div className="activity-item">

                      <span>
                        📝 Notes created
                      </span>

                      <strong>
                        {totalNotes}
                      </strong>

                    </div>

                    <div className="activity-item">

                      <span>
                        📅 Study sessions
                      </span>

                      <strong>
                        {totalPlannerItems}
                      </strong>

                    </div>

                  </div>

                )}

              </div>

            </section>
          )}

          {/* =================================================
              AI PAGE
          ================================================= */}

          {activePage === "ai" && (
            <section className="page-section ai-page">

              <div className="ai-header">

                <div>

                  <p className="ai-eyebrow">
                    STUDYMATE AI
                  </p>

                  <h2>
                    🤖 AI Study Assistant
                  </h2>

                  <p className="page-subtitle">
                    Your personal AI assistant for
                    learning, planning and
                    productivity.
                  </p>

                </div>

                <button
                  type="button"
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

                    <h3>
                      StudyMate AI
                    </h3>

                    <span>
                      Your personal study
                      assistant
                    </span>

                  </div>

                  <div className="ai-online">

                    <span></span>

                    Online

                  </div>

                </div>

                <div className="ai-messages">

                  {aiMessages.map(
                    (chat, index) => (

                      <div
                        key={index}
                        className={`ai-message-row ${
                          chat.role === "user"
                            ? "user-message-row"
                            : "assistant-message-row"
                        }`}
                      >

                        {chat.role ===
                          "assistant" && (

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

                          <p>
                            {String(
                              chat.content ?? ""
                            )}
                          </p>

                        </div>

                        {chat.role ===
                          "user" && (

                          <div className="message-avatar user-avatar">
                            👤
                          </div>

                        )}

                      </div>

                    )
                  )}

                  {aiLoading && (

                    <div className="ai-message-row assistant-message-row">

                      <div className="message-avatar">
                        🤖
                      </div>

                      <div className="ai-message assistant-message">

                        <p>
                          Thinking... 🤔
                        </p>

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
                      setAiInput(
                        e.target.value
                      )
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
                  StudyMate AI can help with
                  learning, planning and general
                  study questions.
                </p>

              </div>

            </section>
          )}

        </main>
      </div>
    );
  }

  /* =========================================================
     AUTH PAGE
  ========================================================= */

  return (
    <div className="auth-page">

      <div className="auth-container">

        <div className="auth-header">

          <h1>
            StudyMate AI
          </h1>

          <p>
            Student Productivity Platform
          </p>

        </div>

        {!showLogin ? (

          <>
            <h2>
              Create Account
            </h2>

            <form
              onSubmit={handleSignup}
              className="auth-form"
            >

              <div>

                <label>
                  Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div>

                <label>
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div>

                <label>
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Creating Account..."
                  : "Sign Up"}
              </button>

            </form>

            <button
              type="button"
              className="auth-switch-button"
              onClick={() => {
                setShowLogin(true);
                clearStatus();
              }}
            >
              Already have an account? Login
            </button>

          </>

        ) : (

          <>
            <h2>
              Login
            </h2>

            <form
              onSubmit={handleLogin}
              className="auth-form"
            >

              <div>

                <label>
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div>

                <label>
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Logging in..."
                  : "Login"}
              </button>

            </form>

            <button
              type="button"
              className="auth-switch-button"
              onClick={() => {
                setShowLogin(false);
                clearStatus();
              }}
            >
              Don't have an account? Sign Up
            </button>

          </>

        )}

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

      </div>

    </div>
  );
}

export default App;

