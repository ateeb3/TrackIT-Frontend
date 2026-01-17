import axios from "axios";

// Create the Axios instance
const api = axios.create({
  // priority: VITE_API_URL (from Vercel) -> Localhost (fallback)
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5292/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

// --- 1. REQUEST INTERCEPTOR (Outgoing) ---
// This injects the token into every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- 2. RESPONSE INTERCEPTOR (Incoming) ---
// This listens for errors coming back from the server
api.interceptors.response.use(
  (response) => {
    // If the request was successful, just pass the data through
    return response;
  },
  (error) => {
    // Check if it's a 401 Unauthorized error
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or unauthorized. Redirecting to login...");
      
      // 1. Clear local storage to remove the stale token
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 2. Force a redirect to the login page
      // We use window.location because we can't use useNavigate hooks outside a React component
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // Pass the error along so the specific component can still handle it (e.g., show a toast) if needed
    return Promise.reject(error);
  }
);

export default api;