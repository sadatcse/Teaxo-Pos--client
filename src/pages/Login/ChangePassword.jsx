import React, { useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../../providers/AuthProvider";

const ChangePasswordForm = () => {
  const { changePassword } = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset messages
    setMessage("");
    setError("");

    // Validate new password length
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    // Check if new password matches confirm new password
    if (newPassword !== confirmNewPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      const result = await changePassword(oldPassword, newPassword);
      setMessage(result.message); // Show success message
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Incorrect old password.");
      } else if (error.response?.status === 402 || error.response?.status === 403) {
        setError("Error changing password.");
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 dark:bg-zinc-950 text-gray-800 dark:text-zinc-100 p-4 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 shadow-2xl rounded-2xl p-6 sm:p-8">
        <h2 className="text-2xl font-black text-center text-blue-600 dark:text-blue-400 mb-6">
          Change Password
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label" htmlFor="oldPassword">
              <span className="label-text font-semibold text-gray-700 dark:text-zinc-300">Old Password</span>
            </label>
            <input
              type="password"
              id="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="input input-bordered w-full rounded-xl dark:bg-zinc-850 dark:border-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="newPassword">
              <span className="label-text font-semibold text-gray-700 dark:text-zinc-300">New Password</span>
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input input-bordered w-full rounded-xl dark:bg-zinc-850 dark:border-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="confirmNewPassword">
              <span className="label-text font-semibold text-gray-700 dark:text-zinc-300">Confirm New Password</span>
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="input input-bordered w-full rounded-xl dark:bg-zinc-850 dark:border-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl w-full mt-6 border-none shadow-md"
          >
            Change Password
          </button>
        </form>

        {error && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-4 font-semibold text-center bg-red-50 dark:bg-red-950/20 py-2.5 rounded-lg border border-red-100 dark:border-red-900/30">
            {error}
          </p>
        )}
        {message && (
          <p className="text-green-600 dark:text-emerald-400 text-sm mt-4 font-semibold text-center bg-green-50 dark:bg-green-950/20 py-2.5 rounded-lg border border-green-100 dark:border-green-900/30">
            {message}
          </p>
        )}
      </div>
    </div>
