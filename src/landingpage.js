// LandingPage.js
import React, { useState } from "react"; // useEffect is no longer needed here
import { useNavigate } from "react-router-dom";
import "./landingpage.css";
import IntroPage from "./components/IntroPage"; // Assuming this component exists
import BinaryAnimation from './binaryanim'; // Import the new animation component

export default function LandingPage() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);

  // Handle intro animation completion - still needed to control showIntro
  const handleIntroComplete = () => setShowIntro(false);

  // --- Removed the entire useEffect animation logic from here ---

  // Show intro animation first
  if (showIntro) {
    return <IntroPage onAnimationComplete={handleIntroComplete} />;
  }

  // Render the main landing page content after intro
  // Including the BinaryAnimation component where the animation container was
  return (
    <div className="landing-page">
      <div className="landing-content">

        {/* Title */}
        <h1 className="landing-title">./home_page</h1>

        {/* Render the BinaryAnimation component. It contains the animation container */}
        {/* This component only mounts when showIntro is false */}
        <BinaryAnimation />

        {/* Regex options */}
        <div className="regex-box">
          <h2>Choose a regular expression:</h2>
          <pre className="regex-text">
1. (11+00)(11+00)*(1+0)(11+00+10+01)((101+111)+(00+11))(1*011*00)(0+1)*((11+00)+(111)+000)
<br></br><br></br>
2. (aa+ab+ba+bb)(a+b)*(aa*+bb*)((ba)*+(ab)*+(aa)+(bb))(aa+bb)(a+b)*
          </pre>
        </div>

        {/* Navigation buttons */}
        <div className="button-group">
          <button onClick={() => navigate("/page1")} className="nav-button">
            ➤ RegEx 1
          </button>
          <button onClick={() => navigate("/page2")} className="nav-button">
            ➤ RegEx 2
          </button>
        </div>

        {/* Brat mode button */}
        <button
          onClick={() => navigate("/brat")}
          className="brat-mode-button"
          aria-label="Brat Mode"
        >
          🧃 brat mode 💅
        </button>
      </div>
    </div>
  );
}