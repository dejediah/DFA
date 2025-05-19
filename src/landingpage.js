// LandingPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./landingpage.css";
import IntroPage from "./components/IntroPage"; // Assuming this component exists
import BinaryAnimation from './binaryanim'; // Import the animation component

// Declare a variable outside the component to track if the intro has been shown
let introHasBeenShownInSession = false;

export default function LandingPage() {
  const navigate = useNavigate();
  // Initialize showIntro based on the session flag
  const [showIntro, setShowIntro] = useState(!introHasBeenShownInSession);
  // New state to track if Brat mode is active on the page
  const [isBratModeActive, setIsBratModeActive] = useState(false); // Keep this state

  // Handle intro animation completion
  const handleIntroComplete = () => {
    setShowIntro(false);
    introHasBeenShownInSession = true;
  };

  // Handle clicking the Brat mode button
  const handleBratButtonClick = () => {
    // Toggle the brat mode state
    setIsBratModeActive(!isBratModeActive);
    // Optional: If you still want to navigate to a /brat page, you could add navigate('/brat') here,
    // but based on your request, it seems you want the effect on the current page.
    // navigate('/brat'); // Uncomment this line if you want to navigate AND apply the effect
  };


  // Show intro animation first based on the state
  if (showIntro) {
    return <IntroPage onAnimationComplete={handleIntroComplete} />;
  }

  // Define the text content for different sections based on brat mode
  const regexBoxTitle = isBratModeActive ? "choose a brat expression:" : "Choose a regular expression:";
  const regexBoxText = isBratModeActive ?
    `
guess ft. billie
<br></br>
Von dutch
    `
    :
    `
1. (11+00)(11+00)*(1+0)(11+00+10+01)((101+111)+(00+11))(1*011*00)(0+1)*((11+00)+(111)+000)
<br></br>
2. (aa+ab+ba+bb)(a+b)*(aa*+bb*)((ba)*+(ab)*+(aa)+(bb))(aa+bb)(a+b)*
    `;

  const navButton1Text = isBratModeActive ? "➤ 360" : "➤ RegEx 1";
  const navButton2Text = isBratModeActive ? "➤ party 4 u" : "➤ RegEx 2";
  const bratButtonText = isBratModeActive ? "party's over" : "brat mode"; // Change brat button text as well


  // Render the main landing page content after intro
  // Add a class to the main container based on isBratModeActive
  return (
    <div className={`landing-page ${isBratModeActive ? 'brat-active' : ''}`}>
      <div className="landing-content">

        {/* Title - conditionally change text based on isBratModeActive */}
        <h1 className="landing-title">
          {isBratModeActive ? './brat_page' : './home_page'}
        </h1>

        {/* Render the BinaryAnimation component */}
        {/* Pass the isBratModeActive state as a prop */}
        <BinaryAnimation isBratModeActive={isBratModeActive} /> {/* Pass the prop here */}

        {/* Regex options - use conditional text */}
        <div className="regex-box">
          <h2>{regexBoxTitle}</h2> {/* Use the variable here */}
          <pre className="regex-text" dangerouslySetInnerHTML={{ __html: regexBoxText }} /> {/* Use dangerouslySetInnerHTML to render <br> */}
        </div>

        {/* Navigation buttons - use conditional text */}
        <div className="button-group">
          <button onClick={() => navigate("/page1")} className="nav-button">
            {navButton1Text} {/* Use the variable here */}
          </button>
          <button onClick={() => navigate("/page2")} className="nav-button">
            {navButton2Text} {/* Use the variable here */}
          </button>
        </div>

        {/* Brat mode button - use conditional text */}
        {/* Use the handleBratButtonClick function */}
      </div>
      <button
        onClick={handleBratButtonClick} // Use the new handler
        className="brat-text-button"
        aria-label="Toggle Brat Mode" // Update aria-label for clarity
      >
         {bratButtonText}  {/* Use the variable here */}
      </button>
    </div>
  );
}
