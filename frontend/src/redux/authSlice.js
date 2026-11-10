import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "lenslm_auth";

// Load authentication data from localStorage.
const loadAuthState = () => {
  try {
    const storedAuth = localStorage.getItem(STORAGE_KEY);

    if (!storedAuth) {
      return {
        user: null,
        token: null,
        isAuthenticated: false,
      };
    }

    const parsedAuth = JSON.parse(storedAuth);

    return {
      user: parsedAuth.user || null,
      token: parsedAuth.token || null,
      isAuthenticated: Boolean(parsedAuth.user),
    };
  } catch (error) {
    console.error("Failed to load authentication data:", error);

    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: loadAuthState(),

  reducers: {
    // Call after successful authentication. Supports both loginSuccess(user) and loginSuccess({ user, token }).
    loginSuccess: (state, action) => {
      const payload = action.payload || {};
      const user = payload.user !== undefined ? payload.user : payload;
      const token = payload.token || state.token || null;

      state.user = user;
      state.token = token;
      state.isAuthenticated = Boolean(user);

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            user,
            token,
          }),
        );
      } catch (error) {
        console.error("Failed to save authentication data:", error);
      }
    },

    // Clear authentication data on logout.
    logoutSuccess: (state) => {
      state.user = null;
      state.token = null;
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
            token: state.token,
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
