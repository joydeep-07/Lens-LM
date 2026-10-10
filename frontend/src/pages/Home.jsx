import React, { useState } from "react";
import Banner from "../ui/Banner";
import ChatBot from "../ui/ChatBot";
import Auth from "./Auth";

const Home = () => {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <>
      {isLogin ? (
        <>
          <ChatBot />
        </>
      ) : (
        <>
          <Auth />
        </>
      )}
    </>
  );
};

export default Home;
