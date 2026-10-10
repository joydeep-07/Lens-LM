import React from "react";
import { useSelector } from "react-redux";
import ChatBot from "../ui/ChatBot";
import Auth from "./Auth";

const Home = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return isAuthenticated ? <ChatBot /> : <Auth />;
};

export default Home;
