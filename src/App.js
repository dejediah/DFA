import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./landingpage";
import DFA1 from "./components/DFA_Simulator";
import DFA2 from "./components/DFA2_Simulator";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/page1" element={<DFA1 />} />
      <Route path="/page2" element={<DFA2 />} />
    </Routes>
  );
};

export default App;