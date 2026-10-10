import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "lenslm_auth";

// Load authentication data from localStorage.
const loadAuthState = () => {
  try {
    const storedAuth = localStorage.getItem(STORAGE_KEY);

    if (!storedAuth) {
      return {
        user: null,
        isAuthenticated: false,
      };
    }

    const parsedAuth = JSON.parse(storedAuth);

    return {
      user: parsedAuth.user || null,
      isAuthenticated: Boolean(parsedAuth.user),
    };
  } catch (error) {
    console.error("Failed to load authentication data:", error);

    return {
      user: null,
      isAuthenticated: false,
    };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: loadAuthState(),

  reducers: {
    // Call after successful authentication.
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            user: action.payload,
          }),
        );
      } catch (error) {
        console.error("Failed to save authentication data:", error);
      }
    },

    // Clear authentication data on logout.
    logoutSuccess: (state) => {
      state.user = null;
      state.isAuthenticated = false;

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Failed to clear authentication data:", error);
      }
    },

    // Update the user's profile information.
    updateUser: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
      };

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            user: state.user,
          }),
        );
      } catch (error) {
        console.error("Failed to update user data:", error);
      }
    },
  },
});

export const { loginSuccess, logoutSuccess, updateUser } = authSlice.actions;

export default authSlice.reducer;
