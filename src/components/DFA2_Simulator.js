import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import './DFA_Simulator.css'; // Assuming the same CSS file is used
import pdaImage from '../assets/Team3_P2-PDA-Final.png'; // Assuming the same placeholder image

const DFA2_Simulator = () => {
  const navigate = useNavigate(); // Initialize navigate
  // New state to manage inputs for multiple simulations
  const [inputs, setInputs] = useState(["", "", "", "", ""]); // 5 inputs, initialized empty
  const [currentState, setCurrentState] = useState("q0"); // Initial state for visualization
  // Messages for each simulation input
  const [messages, setMessages] = useState(["", "", "", "", ""]);
  const [activeTransition, setActiveTransition] = useState(null);
  const [pulseLoop, setPulseLoop] = useState(null);
  const [viewMode, setViewMode] = useState('dfa'); // 'dfa', 'cfg', 'pda'
  // New state to track if any simulation is running to disable buttons
  const [simulationRunning, setSimulationRunning] = useState(false);

  // --- DFA Transitions for the second automaton ---
  const transitions = {
    q1: { a: "q2", b: "q2" },
    q2: { a: "q3", b: "q3" },
    q3: { a: "q4", b: "q4" },
    q4: { a: "q5", b: "q6" },
    q5: { a: "q7", b: "q6" },
    q6: { a: "q5", b: "q7" },
    q7: { a: "q7", b: "q7" }, // Self-loop for q7 on 'a' and 'b'
  };

  // --- Accepting States for the second DFA ---
  const acceptingStates = ["q7"];

  // --- Handle individual input changes ---
  const handleInputChange = (e, index) => {
    const newInputs = [...inputs];
    newInputs[index] = e.target.value;
    setInputs(newInputs);
    // Clear message for this input when it changes
    const newMessages = [...messages];
    newMessages[index] = "";
    setMessages(newMessages);
  };

  // --- DFA Simulation Function ---
  const simulateDFA = async (inputString, inputIndex) => {
    if (viewMode !== 'dfa') return; // Only simulate if in DFA view mode

    setSimulationRunning(true); // Disable all buttons while simulation runs

    // Reset state to the simulation start (q1)
    let state = "q1";
    // Only update the displayed current state if it's the *first* simulation,
    // or if you want the visualization to reflect only the currently active simulation.
    // For multiple concurrent visuals, you'd need multiple DFAVisualization components.
    setCurrentState("q1");

    if (!/^[ab]*$/.test(inputString)) {
      const newMessages = [...messages];
      newMessages[inputIndex] = "invalid input: use only a and b";
      setMessages(newMessages);
      setSimulationRunning(false); // Re-enable buttons
      return;
    }
    const newMessages = [...messages];
    newMessages[inputIndex] = ""; // Clear previous message for this specific input
    setMessages(newMessages);


    setActiveTransition(null);
    setPulseLoop(null);

    for (let char of inputString) {
      if (!transitions[state]) {
        console.warn(`No transitions defined for state ${state}`);
        state = "T"; // Assuming 'T' is a trap state
        setCurrentState(state); // Update displayed state to trap state
        break;
      }
      let nextState = transitions[state][char];

      if (nextState === undefined) {
        console.warn(`No transition for state ${state} on input ${char}`);
        nextState = "T"; // Assuming 'T' is a trap state
      }

      // Set the active transition for visualization
      setActiveTransition({ from: state, to: nextState, label: char });

      // Check for self-loop visualization logic
      if (state === nextState) {
        setPulseLoop({ state, key: Date.now() });
        await new Promise((resolve) => setTimeout(resolve, 750));
        setPulseLoop(null);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 750));
      }

      state = nextState;
      setCurrentState(state); // Update the displayed state
    }

    setActiveTransition(null); // Clear active transition highlight
    const resultMessage = acceptingStates.includes(state) ? "string: accepted" : "string: rejected";
    const finalMessages = [...messages];
    finalMessages[inputIndex] = resultMessage;
    setMessages(finalMessages);

    setSimulationRunning(false); // Re-enable buttons after simulation completes
  };

  // --- Handlers for view switching ---
  const handleShowCFG = () => {
    setViewMode('cfg');
    // Clear simulation state when switching views
    setMessages(["", "", "", "", ""]); // Clear all messages
    setCurrentState("q0");
    setActiveTransition(null);
    setPulseLoop(null);
    setSimulationRunning(false); // Ensure buttons are enabled if switching away from DFA
  };

  const handleShowPDA = () => {
    setViewMode('pda');
    // Clear simulation state when switching views
    setMessages(["", "", "", "", ""]); // Clear all messages
    setCurrentState("q0");
    setActiveTransition(null);
    setPulseLoop(null);
    setSimulationRunning(false); // Ensure buttons are enabled if switching away from DFA
  };

  const handleBackToDFA = () => {
    setViewMode('dfa');
    // Reset simulation state when going back to DFA
    setMessages(["", "", "", "", ""]); // Clear all messages
    setCurrentState("q0");
    setActiveTransition(null);
    setPulseLoop(null);
    setSimulationRunning(false); // Ensure buttons are enabled when returning to DFA
  };

  // --- Handler for going back to Landing Page ---
  const handleGoBackLanding = () => {
    navigate('/'); // Navigate to the landing page route
  };

  // --- REGEX FOR CFG/PDA VALIDATION (Based on the h1 content) ---
  const complexRegex = /^(aa|ab|ba|bb)(a|b)*(aa*|bb*)((ba)*|(ab)*|aa|bb)(aa|bb)(a|b)*$/;

  // --- Validation function for CFG/PDA inputs using Regex ---
  const validateNonDFAInput = (inputString, inputIndex) => {
    if (!inputString) {
      const newMessages = [...messages];
      newMessages[inputIndex] = "Please enter a string.";
      setMessages(newMessages);
      return;
    }

    if (!/^[ab]*$/.test(inputString)) {
      const newMessages = [...messages];
      newMessages[inputIndex] = "Invalid input format: use only a and b.";
      setMessages(newMessages);
      return;
    }

    const newMessages = [...messages];
    if (complexRegex.test(inputString)) {
      newMessages[inputIndex] = "string: accepted!";
    } else {
      newMessages[inputIndex] = "string: rejected.";
    }
    setMessages(newMessages);
  };

  // --- Content for CFG and PDA Views ---
  const cfgContent = `
  S → ABCDEF

  A → aa | ab | ba | bb

  B → aB | bB | Ω

  C → aW | bX | Ω

  D → Y | Z | aa | bb

  E → aa | bb

  F → aF | bF | Ω

  W → aW | Ω

  X → bX | Ω

  Y → baY | Ω
  
  Z → abZ | Ω

  G = {(S,A, B, C, D, E,F, W,X, Y, Z), (a, b), (S → ABCDEF,A → aa | ab | ba | bb, B
  → aB | bB | Ω, C → aW | bX | Ω, D → Y | Z | aa | bb,E → aa | bb, F
  → aF | bF | Ω, W → aW | Ω,X → bX | Ω, Y → baY | Ω, Z → abZ | Ω)}
  `;

  const pdaImagePath = pdaImage;

  return (
    <div className="container">
      {/* Back button container for positioning */}
      <div className="back-button-container">
        <button onClick={handleGoBackLanding} className="back-button">
          ← Back
        </button>
      </div>

      <h1>(aa + ab + ba + bb) (a + b)* (aa* + bb*) ((ba)* + (ab)* + (aa) + (bb)) (aa + bb) (a + b)*</h1>

      {/* Input and button group for DFA */}
      {viewMode === 'dfa' && (
        <>
          {[0, 1, 2, 3, 4].map((index) => (
            <div className="input-row" key={index}>
              <div className="input-button-group">
                <input
                  type="text"
                  value={inputs[index]}
                  onChange={(e) => handleInputChange(e, index)}
                  placeholder={`Type string here for simulation ${index + 1}.`}
                  disabled={simulationRunning} // Disable input while any simulation runs
                />
                <button
                  onClick={() => simulateDFA(inputs[index], index)}
                  className="button"
                  disabled={simulationRunning} // Disable button while any simulation runs
                >
                  {simulationRunning ? 'Simulation Running...' : 'Validate String'}
                </button>
              </div>
              <p className={messages[index].includes("accepted") ? "accepted" : "rejected"}>{messages[index]}</p>
            </div>
          ))}
          <div className="button-row">
            <button
              onClick={handleShowCFG}
              className="button"
              disabled={simulationRunning}
            >
              Show CFG
            </button>
            <button
              onClick={handleShowPDA}
              className="button"
              disabled={simulationRunning}
            >
              Show PDA
            </button>
          </div>
        </>
      )}

      {/* Input and button group for CFG/PDA */}
      {viewMode !== 'dfa' && (
        <div className="input-row">
          <div className="input-button-group">
            <input
              type="text"
              value={inputs[0]} // Use the first input for CFG/PDA validation
              onChange={(e) => handleInputChange(e, 0)}
              placeholder="Type string here."
            />
            <button
              onClick={() => validateNonDFAInput(inputs[0], 0)}
              className="button"
            >
              Validate Input
            </button>
          </div>
          <p className={messages[0].includes("accepted") ? "accepted" : "rejected"}>{messages[0]}</p>
          <button
            onClick={handleBackToDFA}
            className="button back-to-dfa-button"
          >
            (back to DFA)
          </button>
        </div>
      )}

      {/* Message output for DFA and CFG/PDA */}
      {viewMode === 'dfa' && <p>state.current = {currentState}</p>}

      {/* --- Conditional Rendering of Content --- */}
      <div className="visualization-area">
        {viewMode === 'dfa' && (
          <DFAVisualization
            currentState={currentState}
            activeTransition={activeTransition}
            acceptingStates={acceptingStates}
            pulseLoop={pulseLoop}
          />
        )}

        {viewMode === 'cfg' && (
          <div className="cfg-content">
            <h2>Context-Free Grammar (CFG):</h2>
            <pre>{cfgContent}</pre>
          </div>
        )}

        {viewMode === 'pda' && (
          <div className="pda-content">
            <h2>Pushdown Automaton (PDA):</h2>
            <img src={pdaImagePath} alt="Pushdown Automaton Visualization" className="pda-image" />
          </div>
        )}
      </div>
    </div>
  );
};

const DFAVisualization = ({ currentState, activeTransition, acceptingStates, pulseLoop }) => {
  const states = {
    q1: { x: 75, y: 300 },
    q2: { x: 275, y: 300 },
    q3: { x: 475, y: 300 },
    q4: { x: 675, y: 300 },
    q5: { x: 875, y: 200 },
    q6: { x: 875, y: 400 },
    q7: { x: 1275, y: 300 },
  };

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

  const loopLabels = {
    q7: "a/b"
  };

  const renderLoop = (stateName) => {
    const { x, y } = states[stateName];
    const isActive =
      activeTransition?.from === stateName &&
      activeTransition?.to === stateName;
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
    <svg width="1400" height="600" className="dfa">
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

      {lines.map((line, index) => {
        const from = states[line.from];
        const to = states[line.to];
        const offset = 37;

        function offsetLine(from, to, offset) {
          if (!from || !to) return null;
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          if (length === 0) return from;
          const ratio = (length - offset) / length;
          return {
            x: from.x + dx * ratio,
            y: from.y + dy * ratio,
          };
        }

        const adjustedTo = offsetLine(from, to, offset);

        if (!adjustedTo) return null;

        const mid = {
          x: (from.x + adjustedTo.x) / 2,
          y: (from.y + adjustedTo.y) / 2,
        };

        const isActive =
          activeTransition?.from === line.from &&
          activeTransition?.to === line.to;

        const dx = adjustedTo.x - from.x;
        const dy = adjustedTo.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const normX = len === 0 ? 0 : -dy / len;
        const normY = len === 0 ? 0 : dx / len;
        const labelOffset = 20;

        const labelPos = {
          x: mid.x + normX * labelOffset,
          y: mid.y + normY * labelOffset,
        };

        const pointerOffset = 10;
        const pointerDx = labelPos.x - mid.x;
        const pointerDy = labelPos.y - mid.y;
        const pointerLength = Math.sqrt(pointerDx * pointerDx + pointerDy * pointerDy);
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

      {Object.keys(loopLabels).map((state) => renderLoop(state))}

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

      {Object.entries(states).map(([state, { x, y }]) => (
        <text
          key={`${state}-label`}
          x={x - 11}
          y={y + 7}
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