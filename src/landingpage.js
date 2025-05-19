import React from "react";
import { useNavigate } from "react-router-dom";
import "./landingpage.css"; // link to the CSS file

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Title */}
      <h1 className="landing-title">Welcome to My Page</h1>

      {/* Video/Animation Box */}
      <div className="media-box">
        {/* Replace below with <iframe> or animation */}
        <span className="media-placeholder">Video/Animation Goes Here</span>
      </div>

      {/* Buttons */}
      <div className="button-group">
        <button onClick={() => navigate("/page1")} className="nav-button">
          Go to Page 1
        </button>
        <button onClick={() => navigate("/page2")} className="nav-button">
          Go to Page 2
        </button>
      </div>

      {/* Brat Mode */}
      <button
        onClick={() => navigate("/brat")}
        className="brat-mode-button"
        aria-label="Brat Mode"
      >
        brat mode
      </button>
    </div>
  );
}