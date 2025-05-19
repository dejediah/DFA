import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import IntroPage from "./components/IntroPage";
import Landing from "./landingpage";
import DFA1 from "./components/DFA_Simulator";
import DFA2 from "./components/DFA2_Simulator";

const App = () => {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <>
      {showIntro ? (
        <IntroPage onAnimationComplete={handleIntroComplete} />
      ) : (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/page1" element={<DFA1 />} />
          <Route path="/page2" element={<DFA2 />} />
        </Routes>
      )}
    </>
  );
};

export default App;