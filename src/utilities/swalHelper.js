import Swal from "sweetalert2";

/**
 * Enterprise SweetAlert2 Helper Utility
 */
export const swalHelper = {
  /**
   * Success dialog
   */
  success: (title, text = "") => {
    return Swal.fire({
      icon: "success",
      title: title,
      text: text,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      background: "#fff",
      color: "#1e293b",
      customClass: {
        popup: "rounded-2xl shadow-xl border border-slate-100",
      },
    });
  },

  /**
   * Error dialog
   */
  error: (title, text = "") => {
    return Swal.fire({
      icon: "error",
      title: title,
      text: text,
      background: "#fff",
      color: "#1e293b",
      confirmButtonColor: "#ef4444",
      customClass: {
        popup: "rounded-2xl shadow-xl border border-slate-100",
        confirmButton: "px-6 py-2.5 rounded-lg text-sm font-semibold text-white",
      },
    });
  },

  /**
   * Warning dialog
   */
  warning: (title, text = "") => {
    return Swal.fire({
      icon: "warning",
      title: title,
      text: text,
      background: "#fff",
      color: "#1e293b",
      confirmButtonColor: "#f59e0b",
      customClass: {
        popup: "rounded-2xl shadow-xl border border-slate-100",
        confirmButton: "px-6 py-2.5 rounded-lg text-sm font-semibold text-white",
      },
    });
  },

  /**
   * Confirmation dialog (e.g. Delete, Void Order, Logout)
   */
  confirm: async ({
    title = "Are you sure?",
    text = "You won't be able to revert this!",
    confirmText = "Yes, proceed",
    cancelText = "No, cancel",
    danger = false,
  }) => {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: danger ? "warning" : "question",
      showCancelButton: true,
      confirmButtonColor: danger ? "#ef4444" : "#3b82f6",
      cancelButtonColor: "#64748b",
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      background: "#fff",
      color: "#1e293b",
      customClass: {
        popup: "rounded-2xl shadow-xl border border-slate-100",
        confirmButton: "px-5 py-2.5 rounded-lg text-sm font-semibold text-white mx-2",
        cancelButton: "px-5 py-2.5 rounded-lg text-sm font-semibold text-white mx-2",
      },
    });
    return result.isConfirmed;
  },

  /**
   * Loading state dialog
   */
  loading: (title = "Processing...", text = "Please wait") => {
    Swal.fire({
      title: title,
      text: text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      background: "#fff",
      color: "#1e293b",
      customClass: {
        popup: "rounded-2xl shadow-xl border border-slate-100",
      },
      didOpen: () => {
        Swal.showLoading();
      },
    });
  },

  /**
   * Close active alert
   */
  close: () => {
    Swal.close();
  },
};

export default swalHelper;
