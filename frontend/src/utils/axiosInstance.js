import axios from "axios";
import Swal from "sweetalert2";

// Create an axios instance
const instance = axios.create();

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
