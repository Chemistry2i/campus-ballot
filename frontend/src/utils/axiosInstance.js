import axios from "axios";
import Swal from "sweetalert2";

// Create an axios instance with a base URL and sensible timeout.
// Without a timeout, a cold-start or slow server causes the UI to
// spin indefinitely. 15s is generous but prevents infinite hangs.
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.campusballot.tech",
  timeout: 15000, // 15 seconds — fail fast, show error, let user retry
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the Authorization header
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  response => response,
  error => {
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data?.message &&
      error.response.data.message.includes("Session invalidated")
    ) {
      // Clear local storage and notify the user
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      Swal.fire({
        title: "Logged Out",
        text: "You have been logged out because your account was accessed from another device.",
        icon: "warning",
        confirmButtonText: "Login"
      }).then(() => {
        window.location.href = "/login";
      });
    }
    return Promise.reject(error);
  }
);

export default instance;
