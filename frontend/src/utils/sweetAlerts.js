import Swal from 'sweetalert2';

// Custom SweetAlert2 configuration for Observer theme
const observerTheme = (isDarkMode) => ({
  confirmButtonColor: '#10b981',
  cancelButtonColor: '#ef4444',
  background: isDarkMode ? '#1e293b' : '#ffffff',
  color: isDarkMode ? '#f1f5f9' : '#1e293b',
  iconColor: '#10b981',
  customClass: {
    popup: 'observer-swal-popup',
    confirmButton: 'observer-swal-confirm',
    cancelButton: 'observer-swal-cancel',
    title: 'observer-swal-title',
  },
});

// Success Alert
export const showSuccess = (title, text, isDarkMode = false) => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    ...observerTheme(isDarkMode),
    showConfirmButton: true,
    timer: 3000,
    timerProgressBar: true,
  });
};

// Error Alert
export const showError = (title, text, isDarkMode = false) => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    ...observerTheme(isDarkMode),
    confirmButtonText: 'OK',
  });
};

// Warning Alert
export const showWarning = (title, text, isDarkMode = false) => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    ...observerTheme(isDarkMode),
    showCancelButton: true,
    confirmButtonText: 'Proceed',
    cancelButtonText: 'Cancel',
  });
};

// Info Alert
export const showInfo = (title, text, isDarkMode = false) => {
  return Swal.fire({
    icon: 'info',
    title,
    text,
    ...observerTheme(isDarkMode),
    confirmButtonText: 'Got it',
  });
};

// Confirmation Dialog
export const showConfirmation = (title, text, isDarkMode = false, confirmText = 'Yes, proceed', cancelText = 'Cancel') => {
  return Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    ...observerTheme(isDarkMode),
  });
};

// Toast Notification (bottom-right corner)
export const showToast = (title, icon = 'success', isDarkMode = false) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
    ...observerTheme(isDarkMode),
  });

  return Toast.fire({
    icon,
    title,
  });
};

// Loading Alert
export const showLoading = (title = 'Loading...', text = 'Please wait', isDarkMode = false) => {
  return Swal.fire({
    title,
    text,
    ...observerTheme(isDarkMode),
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// Close any open alert
export const closeAlert = () => {
  Swal.close();
};

// Custom Alert with HTML content
export const showCustomAlert = (config, isDarkMode = false) => {
  return Swal.fire({
    ...observerTheme(isDarkMode),
    ...config,
  });
};

// Real-time Update Toast (for live election updates)
export const showLiveUpdate = (message, isDarkMode = false) => {
  return showToast(message, 'info', isDarkMode);
};

// Export Report Confirmation
export const confirmExport = (format = 'PDF', isDarkMode = false) => {
  return showConfirmation(
    'Export Report',
    `Are you sure you want to export this report as ${format}?`,
    isDarkMode,
    `Yes, export ${format}`,
    'Cancel'
  );
};

// Logout Confirmation
export const confirmLogout = (isDarkMode = false) => {
  return showConfirmation(
    'Logout',
    'Are you sure you want to logout?',
    isDarkMode,
    'Yes, logout',
    'Stay logged in'
  );
};

// Delete Confirmation
export const confirmDelete = (itemName, isDarkMode = false) => {
  return Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete "${itemName}". This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it',
    cancelButtonText: 'Cancel',
    ...observerTheme(isDarkMode),
    confirmButtonColor: '#ef4444',
  });
};

// Welcome Toast (on dashboard load)
export const showWelcomeToast = (userName, isDarkMode = false) => {
  return showToast(`Welcome back, ${userName}!`, 'success', isDarkMode);
};

// Network Error Alert
export const showNetworkError = (isDarkMode = false) => {
  return showError(
    'Network Error',
    'Unable to connect to the server. Please check your internet connection and try again.',
    isDarkMode
  );
};

// Session Expired Alert
export const showSessionExpired = (isDarkMode = false) => {
  return Swal.fire({
    title: 'Session Expired',
    text: 'Your session has expired. Please login again.',
    icon: 'warning',
    ...observerTheme(isDarkMode),
    allowOutsideClick: false,
    showCancelButton: false,
    confirmButtonText: 'Login',
  });
};

export default {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showConfirmation,
  showToast,
  showLoading,
  closeAlert,
  showCustomAlert,
  showLiveUpdate,
  confirmExport,
  confirmLogout,
  confirmDelete,
  showWelcomeToast,
  showNetworkError,
  showSessionExpired,
};
