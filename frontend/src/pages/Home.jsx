import React, { useState } from "react";
import Banner from "../ui/Banner";
import ChatBot from "../ui/ChatBot";

const Home = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      {isLogin ? (
        <>
          <ChatBot />
        </>
      ) : (
        <>
          <Banner />
        </>
      )}
    </>
  );
};

export default Home;
