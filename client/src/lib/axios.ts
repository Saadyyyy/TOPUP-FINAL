import axios from "axios";

// Strict Pattern: All API calls MUST use this instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data, // Automate data unpacking specific to user request in previous interactions? No, let's keep it standard unless requested. Wait, Step 1 mentions "return response.data". I will stick to standard for now, but user requested "axios instance -> hook -> component".
  (error) => {
    // Handle global errors here if needed
    return Promise.reject(error);
  },
);

export default api;
