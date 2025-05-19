import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import './DFA_Simulator.css';
import pdaImage from '../assets/placeholderv2.jpg';
// Assume DFAVisualization component is defined below or imported separately

const DFA2_Simulator = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [input, setInput] = useState("");
  const [currentState, setCurrentState] = useState("q0"); // Initial state might need adjustment if 'q1' is the true start based on your simulation logic
  const [message, setMessage] = useState("");
  const [activeTransition, setActiveTransition] = useState(null);
  const [pulseLoop, setPulseLoop] = useState(null);

  // --- New state for managing the view ---
  const [viewMode, setViewMode] = useState('dfa'); // 'dfa', 'cfg', 'pda'
  // --- End new state ---


  const transitions = {
    q1: { a: "q2", b: "q2" },
    q2: { a: "q3", b: "q3" },
    q3: { a: "q4", b: "q4" },
    q4: { a: "q5", b: "q6" },
    q5: { a: "q7", b: "q6" },
    q6: { a: "q5", b: "q7" },
    q7: { a: "q7", b: "q7" }, // Self-loop for q7 on 'a' and 'b'
  };

  const acceptingStates = ["q7"];

  const handleInputChange = (e) => {
    // Only allow input change if in DFA view mode
    if (viewMode === 'dfa') {
      setInput(e.target.value);
    }
  };

  const simulateDFA = async () => {
    // Only simulate if in DFA view mode
    if (viewMode !== 'dfa') return;

    // Reset state to the simulation start (q1)
    let state = "q1";
    setCurrentState("q1"); // Update the displayed state immediately

    if (!/^[ab]*$/.test(input)) {
      setMessage("invalid input: use only a and b");
      return;
    }
    setMessage(""); // Clear previous message

    // Reset active transition and pulse at the start of simulation
    setActiveTransition(null);
    setPulseLoop(null);


    for (let char of input) {
      if (!transitions[state]) {
         // Handle transition to undefined state if necessary, or break
         console.warn(`No transitions defined for state ${state}`);
         state = "T"; // Assuming 'T' is a trap state or similar
         setCurrentState(state);
         break; // Exit the loop if state is invalid
      }
      let nextState = transitions[state][char];

      if (nextState === undefined) {
         // Handle undefined transitions (e.g., move to a trap state 'T')
         console.warn(`No transition for state ${state} on input ${char}`);
         nextState = "T"; // Assuming 'T' is a trap state or similar
      }

      // Set the active transition for visualization
      setActiveTransition({ from: state, to: nextState, label: char }); // Include label for potential visualization use

      // Check for self-loop visualization logic
      if (state === nextState) {
        // Trigger pulse animation for self-loop
        setPulseLoop({ state, key: Date.now() }); // Use Date.now() to force re-render and re-trigger animation
        await new Promise((resolve) => setTimeout(resolve, 750)); // Pause for visualization
        setPulseLoop(null); // Stop pulse after timeout
      } else {
        // Pause for visualization of transition
        await new Promise((resolve) => setTimeout(resolve, 750));
      }

      state = nextState; // Move to the next state
      setCurrentState(state); // Update the displayed state
    }

    // Simulation finished
    setActiveTransition(null); // Clear active transition highlight
    // Check final state acceptance after the loop
    setMessage(acceptingStates.includes(state) ? "string: accepted" : "string: rejected");
  };

  // --- Handlers for view switching ---
  const handleShowCFG = () => {
    // Only switch if currently in DFA view
    if (viewMode === 'dfa') {
      setViewMode('cfg');
      // Optional: Clear simulation state when switching views
      // setInput(""); setMessage(""); setCurrentState("q0"); setActiveTransition(null); setPulseLoop(null);
    } else if (viewMode === 'cfg') {
       // If currently showing CFG, switch back to DFA
       handleBackToDFA();
    }
  };

  const handleShowPDA = () => {
      // Only switch if currently in DFA view
    if (viewMode === 'dfa') {
      setViewMode('pda');
       // Optional: Clear simulation state when switching views
       // setInput(""); setMessage(""); setCurrentState("q0"); setActiveTransition(null); setPulseLoop(null);
    } else if (viewMode === 'pda') {
       // If currently showing PDA, switch back to DFA
       handleBackToDFA();
    }
  };

  const handleBackToDFA = () => {
    setViewMode('dfa');
    // Optional: Reset simulation state when going back to DFA
    // setInput(""); setMessage(""); setCurrentState("q0"); setActiveTransition(null); setPulseLoop(null);
  };

  const handleGoBackLanding = () => {
    navigate('/'); // Navigate to the landing page route
  };
  // --- End handlers ---


  // --- Content for CFG and PDA ---
  // Replace with your actual CFG rules for the second regex
  const cfgContent = `
    S -> (A) (B)* (C) (D) (E) (F)*
    A -> aa | ab | ba | bb
    B -> a | b
    C -> aa A* | bb B*
    D -> (ba)* | (ab)* | (aa) | (bb)
    E -> aa | bb
    F -> a | b
  `; // Example CFG - replace with your actual grammar rules

  // Replace with the actual path to your PDA image for the second regex
  // Assuming you have a different image for this PDA, update the path.
  // If you want to use the same placeholder, keep it.
  const pdaImagePath = pdaImage; // <<< UPDATE THIS PATH if you have a different PDA image

  // --- End content ---


  return (
    <div className="container">
      {/* Back button container for positioning */}
      <div className="back-button-container">
          <button onClick={handleGoBackLanding} className="back-button">
            ← Back
          </button>
      </div>


      <h1>(aa + ab + ba + bb) (a + b)* (aa* + bb*) ((ba)* + (ab)* + (aa) + (bb)) (aa + bb) (a + b)*</h1>

      {/* Input and button group */}
      <div className="input-button-group">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type string here."
          disabled={viewMode !== 'dfa'} // Disable input when not showing DFA
        />

        {/* Buttons for validation and view switching */}
        {viewMode === 'dfa' ? (
          <> {/* Use a fragment to group buttons */}
            <button onClick={simulateDFA} disabled={viewMode !== 'dfa'}> {/* Disable button when not showing DFA */}
              validate string
            </button>
            <button onClick={handleShowCFG} className="button">Show CFG</button> {/* Apply button class */}
            <button onClick={handleShowPDA} className="button">Show PDA</button> {/* Apply button class */}
          </>
        ) : (
          /* When not in DFA view, show the back button for the current view */
          viewMode === 'cfg' ? (
              <button onClick={handleBackToDFA} className="button back-to-dfa-button">(back to DFA)</button>
          ) : ( // viewMode === 'pda'
              <button onClick={handleBackToDFA} className="button back-to-dfa-button">(back to DFA)</button>
          )
        )}
      </div>


      <p>state.current = {currentState}</p>
      <p className={message === "string: accepted" ? "accepted" : "rejected"}>{message}</p>

      {/* --- Conditional Rendering of Content --- */}
      <div className="visualization-area"> {/* Container for the dynamic content */}
        {viewMode === 'dfa' && (
           <DFAVisualization
            currentState={currentState}
            activeTransition={activeTransition}
            acceptingStates={acceptingStates}
            pulseLoop={pulseLoop} // Pass pulseLoop here
            // Pass other necessary props to DFAVisualization
          />
        )}

        {viewMode === 'cfg' && (
          <div className="cfg-content">
            <h2>Context-Free Grammar (CFG):</h2>
            <pre>{cfgContent}</pre> {/* Use pre for formatting */}
          </div>
        )}

        {viewMode === 'pda' && (
          <div className="pda-content">
              <h2>Pushdown Automaton (PDA):</h2>
              {/* Ensure the image path is correct and the image file exists */}
              <img src={pdaImagePath} alt="Pushdown Automaton Visualization" className="pda-image"/>
              <p>PDA visualization image goes here.</p> {/* Optional caption */}
          </div>
        )}
      </div>
      {/* --- End Conditional Rendering --- */}


    </div>
  );
};

// Keep your DFAVisualization component definition below this one
// or ensure it's imported if it's in a separate file.
const DFAVisualization = ({ currentState, activeTransition, acceptingStates, pulseLoop }) => {
  // Use the states specific to the second DFA
  const states = {
    q1: { x: 75, y: 300 },
    q2: { x: 275, y: 300 },
    q3: { x: 475, y: 300 },
    q4: { x: 675, y: 300 },
    q5: { x: 875, y: 200 },
    q6: { x: 875, y: 400 },
    q7: { x: 1275, y: 300 },
  };

  // Use the lines specific to the second DFA
  const lines = [
    { from: "q1", to: "q2", label: "a/b" },
    { from: "q2", to: "q3", label: "a/b" },
    { from: "q3", to: "q4", label: "a/b" },
    { from: "q4", to: "q5", label: "a" },
    { from: "q4", to: "q6", label: "b" },
    { from: "q5", to: "q7", label: "a" },
    { from: "q5", to: "q6", label: "b" },
    { from: "q6", to: "q5", label: "a" },
    { from: "q6", to: "q7", label: "b" },
  ];

  // Use the loop labels specific to the second DFA
  const loopLabels = {
    q7: "a/b"
  };

  const renderLoop = (stateName) => {
    const { x, y } = states[stateName];
    const isActive =
      activeTransition?.from === stateName &&
      activeTransition?.to === stateName;
    // Use the pulseLoop prop
    const shouldPulse = pulseLoop?.state === stateName;

    const loopLabel = loopLabels[stateName] ?? "";

    return (
      <React.Fragment key={shouldPulse ? pulseLoop.key : stateName}>
        <path
          d={`M ${x} ${y - 30} C ${x - 40} ${y - 80}, ${x + 40} ${y - 80}, ${x} ${y - 30}`}
          fill="none"
          className={`dfa-loop ${isActive ? "active" : ""} ${shouldPulse ? "pulsing" : ""}`}
        />
        <text
          x={x}
          y={y - 73}
          fontSize="14"
          textAnchor="middle"
          className={`dfa-label ${isActive ? "active" : ""}`}
        >
          {loopLabel}
        </text>
      </React.Fragment>
    );
  };

  return (
    <svg width="1400" height="600" className="dfa"> {/* Adjust SVG dimensions as needed */}
  <defs>
    <marker
      id="arrowhead"
      viewBox="0 0 10 10"
      refX="10"
      refY="5"
      markerWidth="6"
      markerHeight="6"
      orient="auto-start-reverse"
    >
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#5dd39e" />
    </marker>
  </defs>

  {/* Offset line function to avoid circles covering arrows */}
  {lines.map((line, index) => {
  const from = states[line.from];
  const to = states[line.to];
  const offset = 37; // Radius of the state circle

  function offsetLine(from, to, offset) {
    if (!from || !to) return null; // Add null check
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return from; // Prevent division by zero
    const ratio = (length - offset) / length;
    return {
      x: from.x + dx * ratio,
      y: from.y + dy * ratio,
    };
  }

  const adjustedTo = offsetLine(from, to, offset);

  // Add check if adjustedTo is null
  if (!adjustedTo) return null;

  const mid = {
    x: (from.x + adjustedTo.x) / 2,
    y: (from.y + adjustedTo.y) / 2,
  };

  const isActive =
    activeTransition?.from === line.from &&
    activeTransition?.to === line.to;

  // Calculate perpendicular offset for label position
  const dx = adjustedTo.x - from.x;
  const dy = adjustedTo.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  // Handle case where length is 0 to avoid NaN
  const normX = len === 0 ? 0 : -dy / len;
  const normY = len === 0 ? 0 : dx / len;
  const labelOffset = 20;

  const labelPos = {
    x: mid.x + normX * labelOffset,
    y: mid.y + normY * labelOffset,
  };

  const pointerOffset = 10; // Distance to stop before the label

  // Direction vector from mid to labelPos
  const pointerDx = labelPos.x - mid.x;
  const pointerDy = labelPos.y - mid.y;
  const pointerLength = Math.sqrt(pointerDx * pointerDx + pointerDy * pointerDy);
   // Adjust connector end if length is 0 to avoid NaN
  const connectorEnd = pointerLength === 0 ? mid : {
    x: mid.x + pointerDx * (pointerLength - pointerOffset) / pointerLength,
    y: mid.y + pointerDy * (pointerLength - pointerOffset) / pointerLength,
  };


  return (
    <React.Fragment key={index}>
      <line
        x1={from.x}
        y1={from.y}
        x2={adjustedTo.x}
        y2={adjustedTo.y}
        stroke="white"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
        className={`dfa-line ${isActive ? "active" : ""}`}
      />
      {/* Connector line from label to main line */}
      {/* Only render if len is not 0, as labelPos calculation might be off */}
      {len !== 0 && (
        <line
        x1={mid.x}
        y1={mid.y}
        x2={connectorEnd.x}
        y2={connectorEnd.y}
        stroke="#5dd39e"
        strokeWidth="3"
        strokeDasharray="3,2"
      />
      )}


      <text
        x={labelPos.x}
        y={labelPos.y}
        fontSize="14"
        textAnchor="middle"
        className={`dfa-label ${isActive ? "active" : ""}`}
      >
        {line.label}
      </text>
    </React.Fragment>
  );
})}

  {/* Render loop transitions */}
  {Object.keys(loopLabels).map((state) => renderLoop(state))} {/* Iterate based on loopLabels keys */}

  {/* States */}
  {Object.entries(states).map(([state, { x, y }]) => (
    <circle
      key={state}
      cx={x}
      cy={y}
      r={37}
      className={`dfa-state ${
        currentState === state ? "active" : ""
      } ${acceptingStates.includes(state) ? "accepting" : ""}`}
    />
  ))}

  {/* State Labels */}
  {Object.entries(states).map(([state, { x, y }]) => (
    <text
      key={`${state}-label`} // Unique key
      x={x - 11} // Adjust positioning as needed
      y={y + 7} // Adjust positioning as needed
      className={`circle-labels ${
        acceptingStates.includes(state) ? "accepting-label" : ""
      }`}
    >
      {state}
    </text>
  ))}
</svg>

  );
};

export default DFA2_Simulator;
