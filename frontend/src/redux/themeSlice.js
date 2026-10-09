import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem("theme");

    return savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : "dark";
  } catch {
    return "dark";
  }
};

const themeSlice = createSlice({
  name: "theme",

  initialState: {
    mode: getInitialTheme(),
  },

  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark";
    },

    setTheme: (state, action) => {
      state.mode = action.payload;
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;

export default themeSlice.reducer;
