// LandingPage.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./landingpage.css";
import IntroPage from "./components/IntroPage";
import BinaryAnimation from './binaryanim';

// Import the audio file here
import bratSoundFile from './assets/brat.mp3'; // Adjust path if your 'assets' folder is located differently

// Declare a variable outside the component to track if the intro has been shown
let introHasBeenShownInSession = false;

export default function LandingPage() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(!introHasBeenShownInSession);
  const [isBratModeActive, setIsBratModeActive] = useState(false);

  // Use the imported 'bratSoundFile' variable for the Audio object
  const bratSound = useRef(new Audio(bratSoundFile));

  // Use useEffect to add and clean up the timeupdate event listener
  useEffect(() => {
    const audio = bratSound.current;

    const handleTimeUpdate = () => {
      // If the current time exceeds 7.5 seconds, pause the audio
      if (audio.currentTime >= 7.5) {
        audio.pause();
        audio.currentTime = 0; // Optionally reset to start for next play
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);

    // Clean up the event listener and pause/reset audio when the component unmounts
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.pause(); // Ensure sound stops if component unmounts
      audio.currentTime = 0;
    };
  }, []);

  // Handle intro animation completion
  const handleIntroComplete = () => {
    setShowIntro(false);
    introHasBeenShownInSession = true;
  };

  // Handle clicking the Brat mode button
  const handleBratButtonClick = () => {
    // Determine the *new* state for brat mode
    const newBratModeState = !isBratModeActive;

    // Toggle the brat mode state
    setIsBratModeActive(newBratModeState);

    // Play the sound ONLY if switching TO brat mode (i.e., newBratModeState is true)
    if (newBratModeState) {
      const audio = bratSound.current;
      audio.currentTime = 0; // Rewind to the start
      audio.play().catch(error => {
        console.error("Error playing sound:", error);
      });
    } else {
      // If switching OFF brat mode, pause the sound immediately
      const audio = bratSound.current;
      audio.pause();
      audio.currentTime = 0; // Reset for next time
    }
  };

  // Show intro animation first based on the state
  if (showIntro) {
    return <IntroPage onAnimationComplete={handleIntroComplete} />;
  }

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
  const bratButtonText = isBratModeActive ? "party's over" : "brat mode";

  return (
    <div className={`landing-page ${isBratModeActive ? 'brat-active' : ''}`}>
      <div className="landing-content">
        {/* Title - conditionally change text based on isBratModeActive */}
        <h1 className="landing-title">
          {isBratModeActive ? './brat_page' : './home_page'}
        </h1>

        {/* Render the BinaryAnimation component */}
        <BinaryAnimation isBratModeActive={isBratModeActive} />

        {/* Regex options - use conditional text */}
        <div className="regex-box">
          <h2>{regexBoxTitle}</h2>
          <pre className="regex-text" dangerouslySetInnerHTML={{ __html: regexBoxText }} />
        </div>

        {/* Navigation buttons - use conditional text */}
        <div className="button-group">
          <button onClick={() => navigate("/page1")} className="nav-button">
            {navButton1Text}
          </button>
          <button onClick={() => navigate("/page2")} className="nav-button">
            {navButton2Text}
          </button>
        </div>

        {/* Brat mode button - use conditional text */}
      </div>
      <button
        onClick={handleBratButtonClick}
        className="brat-text-button"
        aria-label="Toggle Brat Mode"
      >
        {bratButtonText}
      </button>
    </div>
  );
}