import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export const showSuccess = (title, text) => {
  Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonColor: '#3085d6',
  });
};

export const showError = (title, text) => {
  Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonColor: '#d33',
  });
};

export const showInfo = (title, text) => {
  Swal.fire({
    icon: 'info',
    title,
    text,
    confirmButtonColor: '#3085d6',
  });
};

export const showConfirm = (title, text, confirmButtonText = 'Yes', cancelButtonText = 'Cancel') => {
  return Swal.fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
  });
};
