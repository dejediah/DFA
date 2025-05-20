// LandingPage.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// Assuming these CSS files and components exist as per the original code
import "./landingpage.css";
import IntroPage from "./components/IntroPage";
import BinaryAnimation from './binaryanim';

// Import the audio file here
import bratSoundFile from './assets/brat.mp3';

// Import your logo here
import yourLogo from './assets/pathfinder.png'; // Make sure this path is correct for your logo

// Declare a variable outside the component to track if the intro has been shown
let introHasBeenShownInSession = false;

export default function LandingPage() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(!introHasBeenShownInSession);
  const [isBratModeActive, setIsBratModeActive] = useState(false);

  const bratSound = useRef(new Audio(bratSoundFile));

  useEffect(() => {
    const audio = bratSound.current;

    const handleTimeUpdate = () => {
      // Pause and reset audio if current time exceeds 7.5 seconds
      if (audio.currentTime >= 7.5) {
        audio.pause();
        audio.currentTime = 0;
      }
    };

    // Add event listener for time updates
    audio.addEventListener('timeupdate', handleTimeUpdate);

    // Cleanup function: remove event listener and pause/reset audio on unmount
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.pause();
      audio.currentTime = 0;
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Callback function for when the intro animation completes
  const handleIntroComplete = () => {
    setShowIntro(false); // Hide the intro page
    introHasBeenShownInSession = true; // Mark intro as shown for the session
  };

  // Handler for the "Brat Mode" toggle button
  const handleBratButtonClick = () => {
    const newBratModeState = !isBratModeActive; // Toggle the state
    setIsBratModeActive(newBratModeState); // Update the state

    // Play or pause the sound based on the new state
    if (newBratModeState) {
      const audio = bratSound.current;
      audio.currentTime = 0; // Reset audio to start
      audio.play().catch(error => {
        console.error("Error playing sound:", error); // Log any errors during playback
      });
    } else {
      const audio = bratSound.current;
      audio.pause(); // Pause the audio
      audio.currentTime = 0; // Reset audio to start
    }
  };

  // Conditional rendering: show IntroPage if showIntro is true
  if (showIntro) {
    return <IntroPage onAnimationComplete={handleIntroComplete} />;
  }

  // Determine text content and titles based on brat mode
  const regexBoxTitle = isBratModeActive ? "choose a brat expression:" : "Choose a regular expression:";
  const regexBoxText = isBratModeActive ?
    `
guess ft. billie

Von dutch
    `
    :
    `
1. (11+00)(11+00)*(1+0)(11+00+10+01)((101+111)+(00+11))(1*011*00)(0+1)*((11+00)+(111)+000)

2. (aa+ab+ba+bb)(a+b)*(aa*+bb*)((ba)*+(ab)*+(aa)+(bb))(aa+bb)(a+b)*
    `;

  const navButton1Text = isBratModeActive ? "➤ 360" : "➤ RegEx 1";
  const navButton2Text = isBratModeActive ? "➤ party 4 u" : "➤ RegEx 2";
  const bratButtonText = isBratModeActive ? "party's over" : "brat mode";

  return (
    // Apply 'brat-active' class to the main container when brat mode is on
    <div className={`landing-page ${isBratModeActive ? 'brat-active' : ''}`}>
      {/* Logo positioned directly here */}
      {/* Conditionally hide the logo using a class when brat mode is active */}
      <img
        src={yourLogo}
        alt="Logo"
        className={`logo ${isBratModeActive ? 'hidden-logo' : ''}`} // Added 'hidden-logo' class
      />

      <div className="landing-content">
        {/* Title - now only text */}
        <h1 className="landing-title">
          {isBratModeActive ? './brat_page' : './home_page'}
        </h1>

        <BinaryAnimation isBratModeActive={isBratModeActive} />

        <div className="regex-box">
          <h2>{regexBoxTitle}</h2>
          {/* Using dangerouslySetInnerHTML for pre-formatted text */}
          <pre className="regex-text" dangerouslySetInnerHTML={{ __html: regexBoxText }} />
        </div>

        <div className="button-group">
          {/* Navigation buttons */}
          <button onClick={() => navigate("/page1")} className="nav-button">
            {navButton1Text}
          </button>
          <button onClick={() => navigate("/page2")} className="nav-button">
            {navButton2Text}
          </button>
        </div>
      </div>
      {/* Brat mode toggle button */}
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
