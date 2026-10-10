import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { LogOut, LoaderCircle } from "lucide-react";
import { logoutSuccess } from "../redux/authSlice";
import api from "../api/axios";
import endpoints from "../api/endpoints";

const Logout = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;

    setLoading(true);

    try {
      // Ask the backend to invalidate the session.
      await api.post(endpoints.logout);
    } catch (error) {
      console.error("Backend logout failed:", error);
    } finally {
      // Clear Redux state and authentication data from localStorage.
      dispatch(logoutSuccess());

      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="
        group inline-flex items-center justify-center gap-2
        m-4 rounded-sm
        bg-[var(--google-red)] px-4 py-2.5
        text-xs font-semibold text-white
        transition-all duration-200
        active:scale-[0.98]
        disabled:cursor-not-allowed disabled:opacity-60
      "
    >
      {loading ? (
        <LoaderCircle size={15} className="animate-spin" />
      ) : (
        <LogOut
          size={15}
          className="transition-transform duration-200 group-hover:-translate-x-0.5"
        />
      )}

      <span>{loading ? "Logging out..." : "Logout"}</span>
    </button>
  );
};

export default Logout;
