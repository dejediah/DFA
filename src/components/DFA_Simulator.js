import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './DFA_Simulator.css';
import pdaImage from '../assets/Team3_PDA1.png';

const DFA_Simulator = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  // New state to manage inputs for multiple simulations
  const [inputs, setInputs] = useState(["", "", "", "", ""]); // 5 inputs, index 0 for the original
  const [currentState, setCurrentState] = useState("q0");
  const [messages, setMessages] = useState(["", "", "", "", ""]); // Messages for each simulation
  const [activeTransition, setActiveTransition] = useState(null);
  const [pulseLoop, setPulseLoop] = useState(null);
  const [viewMode, setViewMode] = useState('dfa');
  // New state to track if any simulation is running
  const [simulationRunning, setSimulationRunning] = useState(false);

  const transitions = {
    q1: { 0: "q18", 1: "q37" }, q2: { 0: "q57", 1: "q10" }, q3: { 0: "q11", 1: "q10" },
    q4: { 0: "q53", 1: "q9" }, q5: { 0: "q12", 1: "q13" }, q6: { 0: "q14", 1: "q6" },
    q7: { 0: "T1", 1: "q6" }, q8: { 0: "q59", 1: "q15" }, q9: { 0: "q16", 1: "q3" },
    q10: { 0: "q17", 1: "q6" }, q11: { 0: "q6", 1: "q19" }, q12: { 0: "q3", 1: "q20" },
    q13: { 0: "q21", 1: "q5" }, q14: { 0: "T9", 1: "q19" }, q15: { 0: "q22", 1: "q23" },
    q16: { 0: "q57", 1: "q24" }, q17: { 0: "T8", 1: "q25" }, q18: { 0: "q45", 1: "T4" },
    q19: { 0: "q26", 1: "q19" }, q20: { 0: "q26", 1: "q27" }, q21: { 0: "q53", 1: "q28" },
    q22: { 0: "q29", 1: "q52" }, q23: { 0: "q30", 1: "q31" }, q24: { 0: "q32", 1: "q25" },
    q25: { 0: "q33", 1: "q25" }, q26: { 0: "q29", 1: "T3" }, q27: { 0: "q34", 1: "q25" },
    q28: { 0: "q35", 1: "q36" }, q29: { 0: "q38", 1: "q39" }, q30: { 0: "q29", 1: "q9" },
    q31: { 0: "q40", 1: "q41" }, q32: { 0: "q29", 1: "q25" }, q33: { 0: "q29", 1: "q19" },
    q34: { 0: "q29", 1: "q6" }, q35: { 0: "q29", 1: "q24" }, q36: { 0: "q33", 1: "q24" },
    q37: { 0: "T4", 1: "q45" }, q38: { 0: "q42", 1: "q39" }, q39: { 0: "q38", 1: "q43" },
    q40: { 0: "q29", 1: "q20" }, q41: { 0: "q44", 1: "q31" }, q42: { 0: "q42", 1: "q39" },
    q43: { 0: "q38", 1: "q43" }, q44: { 0: "q29", 1: "q28" }, q45: { 0: "q46", 1: "q47" },
    q46: { 0: "q48", 1: "q49" }, q47: { 0: "q49", 1: "q48" }, q48: { 0: "q50", 1: "q51" },
    q49: { 0: "q52", 1: "q52" }, q50: { 0: "q53", 1: "q54" }, q51: { 0: "q55", 1: "q56" },
    q52: { 0: "q57", 1: "q58" }, q53: { 0: "q59", 1: "q51" }, q54: { 0: "q2", 1: "q3" },
    q55: { 0: "q3", 1: "q52" }, q56: { 0: "q4", 1: "q5" }, q57: { 0: "q6", 1: "T5" },
    q58: { 0: "q7", 1: "q6" }, q59: { 0: "q8", 1: "q9" },
    T1: { 0: "T1", 1: "T1" }, T2: { 0: "T2", 1: "T2" }, T3: { 0: "T3", 1: "T3" },
    T4: { 0: "T4", 1: "T4" }, T5: { 0: "T5", 1: "T5" }, T6: { 0: "T6", 1: "T6" },
    T7: { 0: "T7", 1: "T7" }, T8: { 0: "T8", 1: "T8" }, T9: { 0: "T9", 1: "T9" }
  };

  const acceptingStates = ["q42", "q43"];

  // Handle individual input changes
  const handleInputChange = (e, index) => {
    const newInputs = [...inputs];
    newInputs[index] = e.target.value;
    setInputs(newInputs);
    // Clear message for this input when it changes
    const newMessages = [...messages];
    newMessages[index] = "";
    setMessages(newMessages);
  };

  const simulateDFA = async (inputString, inputIndex) => {
    if (viewMode !== 'dfa') return;

    setSimulationRunning(true); // Disable all buttons

    // Reset state to the simulation start (q1)
    let state = "q1";
    setCurrentState("q1");

    if (!/^[01]*$/.test(inputString)) {
      const newMessages = [...messages];
      newMessages[inputIndex] = "invalid input: use only 0 and 1";
      setMessages(newMessages);
      setSimulationRunning(false); // Re-enable buttons
      return;
    }
    const newMessages = [...messages];
    newMessages[inputIndex] = "";
    setMessages(newMessages);

    setActiveTransition(null);
    setPulseLoop(null);

    for (let char of inputString) {
      if (!transitions[state]) {
        console.warn(`No transitions defined for state ${state}`);
        state = "T";
        setCurrentState(state);
        break;
      }
      let nextState = transitions[state][char];

      if (nextState === undefined) {
        console.warn(`No transition for state ${state} on input ${char}`);
        nextState = "T";
      }

      setActiveTransition({ from: state, to: nextState, label: char });

      if (state === nextState) {
        setPulseLoop({ state, key: Date.now() });
        await new Promise((resolve) => setTimeout(resolve, 750));
        setPulseLoop(null);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 750));
      }

      state = nextState;
      setCurrentState(state);
    }

    setActiveTransition(null);
    const resultMessage = acceptingStates.includes(state) ? "string: accepted" : "string: rejected";
    const finalMessages = [...messages];
    finalMessages[inputIndex] = resultMessage;
    setMessages(finalMessages);

    setSimulationRunning(false); // Re-enable buttons
  };

  const handleShowCFG = () => {
    setViewMode('cfg');
    setMessages(["", "", "", "", ""]);
    setCurrentState("q0");
    setActiveTransition(null);
    setPulseLoop(null);
    setSimulationRunning(false); // Ensure buttons are enabled if switching away from DFA
  };

  const handleShowPDA = () => {
    setViewMode('pda');
    setMessages(["", "", "", "", ""]);
    setCurrentState("q0");
    setActiveTransition(null);
    setPulseLoop(null);
    setSimulationRunning(false); // Ensure buttons are enabled if switching away from DFA
  };

  const handleBackToDFA = () => {
    setViewMode('dfa');
    setMessages(["", "", "", "", ""]);
    setCurrentState("q0");
    setActiveTransition(null);
    setPulseLoop(null);
    setSimulationRunning(false); // Ensure buttons are enabled when returning to DFA
  };

  const handleGoBackLanding = () => {
    navigate('/');
  };

  const complexRegex = /^(11|00)(11|00)*(1|0)(11|00|10|01)((101|111)|(00|11))(1*011*00)(0|1)*((11|00)|111|000)$/;

  const validateNonDFAInput = (inputString, inputIndex) => {
    if (!inputString) {
      const newMessages = [...messages];
      newMessages[inputIndex] = "Please enter a string.";
      setMessages(newMessages);
      return;
    }

    if (!/^[01]*$/.test(inputString)) {
      const newMessages = [...messages];
      newMessages[inputIndex] = "Invalid input format: use only 0 and 1.";
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

  const cfgContent = `
    S → ABCDEFHI

    A → 11 | 00

    B → 11B | 00B | Ω

    C → 1 | 0

    D → 11 | 00 | 10 | 01

    E → 101 | 111 | 00 | 11

    F → X01X00

    H → 0H | 1H | Ω

    I → 11 | 00 | 111 | 000

    X → 1X | Ω

    G = {(S,A,B,C,D,E,F,H,I,X),(a,b),
    (S → ABCDEFHI,A → 11 | 00,B → 11B | 00B | Ω,C → 1 | 0,
    D → 11 | 00 | 10 | 01,E → 101 | 111 | 00 | 11,F → X01X00,
    H → 0H | 1H | Ω,I → 11 | 00 | 111 | 000,X → 1X | Ω)}
  `;

  const pdaImagePath = pdaImage;

  return (
    <div className="container">
      <div className="back-button-container">
        <button onClick={handleGoBackLanding} className="back-button">
          ← Back
        </button>
      </div>

      <h1>(11+00) (11+00)* (1+0) (11+00+10+01) ((101+111) + (00+11)) (1*011*00) (0+1)* ((11+00) + (111) + 000))</h1>

      {/* Input and button group for DFA */}
      {viewMode === 'dfa' && (
        <>
          {[0, 1, 2, 3, 4].map((index) => (
            <div className="input-row" key={index}> {/* Changed to input-row */}
              <div className="input-button-group"> {/* This group keeps input and button together */}
                <input
                  type="text"
                  value={inputs[index]}
                  onChange={(e) => handleInputChange(e, index)}
                  placeholder={`Type string here for simulation ${index + 1}.`}
                  disabled={simulationRunning}
                />
                <button
                  onClick={() => simulateDFA(inputs[index], index)}
                  className="button"
                  disabled={simulationRunning}
                >
                  {simulationRunning ? 'Finish Ongoing Simulation' : 'Validate String'}
                </button>
              </div>
              {/* Message displayed below the input and button */}
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
        <div className="input-row"> {/* Use input-row for consistent styling */}
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
    q1: { x: 75, y: 700 }, q18: { x: 250, y: 450 }, q37: { x: 250, y: 1000 },
    q45: { x: 300, y: 700 }, q46: { x: 525, y: 575 }, q47: { x: 525, y: 825 },
    q48: { x: 725, y: 1000 }, q51: { x: 835, y: 1120 }, q55: { x: 775, y: 750 },
    q3: { x: 1075, y: 1625 }, q12: { x: 1075, y: 2225 }, q11: { x: 1075, y: 1225 },
    q56: { x: 805, y: 1625 }, q4: { x: 505, y: 1700 }, q5: { x: 595, y: 1950 },
    q13: { x: 1255, y: 1950 }, q21: { x: 1255, y: 1800 }, q28: { x: 1455, y: 1800 },
    q36: { x: 1655, y: 1700 }, q44: { x: 1655, y: 1460 }, q29: { x: 3055, y: 1460 },
    q38: { x: 3355, y: 1460 }, q42: { x: 3755, y: 1460 }, q43: { x: 3655, y: 1660 },
    q39: { x: 3555, y: 1260 }, q24: { x: 1905, y: 1700 }, q32: { x: 2255, y: 1565 },
    q35: { x: 1655, y: 1900 }, q50: { x: 725, y: 1275 }, q9: { x: 725, y: 1435 },
    q53: { x: 465, y: 1325 }, q59: { x: 485, y: 1125 }, q8: { x: 465, y: 925 },
    q15: { x: 2315, y: 925 }, q22: { x: 2315, y: 275 }, q23: { x: 2515, y: 1125 },
    q31: { x: 2715, y: 1125 }, q41: { x: 2515, y: 925 }, q40: { x: 2515, y: 1375 },
    q20: { x: 2150, y: 2025 }, q27: { x: 2900, y: 1655 }, q34: { x: 2900, y: 55 },
    q26: { x: 2150, y: 700 }, T3: { x: 2150, y: 500 }, q30: { x: 2315, y: 1225 },
    q54: { x: 1225, y: 1475 }, q2: { x: 1425, y: 1625 }, q49: { x: 725, y: 425 },
    q52: { x: 925, y: 425 }, q57: { x: 1050, y: 325 }, q58: { x: 1050, y: 525 },
    q7: { x: 1050, y: 775 }, T1: { x: 900, y: 675 }, T4: { x: 175, y: 700 },
    T5: { x: 1050, y: 155 }, q16: { x: 1375, y: 305 }, q6: { x: 1550, y: 700 },
    q14: { x: 1750, y: 700 }, T9: { x: 1750, y: 500 }, q19: { x: 1950, y: 700 },
    q10: { x: 1225, y: 1275 }, q17: { x: 1625, y: 1235 }, q25: { x: 1825, y: 1050 },
    q33: { x: 2025, y: 1050 }, T8: { x: 1465, y: 1135 },
  };

  const lines = [
    { from: "q1", to: "q18", label: "0" }, { from: "q1", to: "q37", label: "1" },
    { from: "q18", to: "q45", label: "0" }, { from: "q18", to: "T4", label: "1" },
    { from: "q37", to: "q45", label: "1" }, { from: "q37", to: "T4", label: "0" },
    { from: "q45", to: "q46", label: "0" }, { from: "q45", to: "q47", label: "1" },
    { from: "q46", to: "q48", label: "0" }, { from: "q46", to: "q49", label: "1" },
    { from: "q47", to: "q49", label: "0" }, { from: "q47", to: "q48", label: "1" },
    { from: "q48", to: "q50", label: "0" }, { from: "q48", to: "q51", label: "1" },
    { from: "q49", to: "q52", label: "0/1" }, { from: "q52", to: "q57", label: "0" },
    { from: "q52", to: "q58", label: "1" }, { from: "q57", to: "T5", label: "1" },
    { from: "q57", to: "q6", label: "0" }, { from: "q58", to: "q6", label: "1" },
    { from: "q58", to: "q7", label: "0" }, { from: "q7", to: "T1", label: "0" },
    { from: "q7", to: "q6", label: "1" }, { from: "q51", to: "q55", label: "0" },
    { from: "q51", to: "q56", label: "1" }, { from: "q50", to: "q53", label: "0" },
    { from: "q50", to: "q54", label: "1" }, { from: "q55", to: "q52", label: "1" },
    { from: "q55", to: "q3", label: "0" }, { from: "q54", to: "q2", label: "0" },
    { from: "q54", to: "q3", label: "1" }, { from: "q2", to: "q57", label: "0" },
    { from: "q3", to: "q10", label: "1" }, { from: "q2", to: "q10", label: "1" },
    { from: "q10", to: "q6", label: "1" }, { from: "q3", to: "q11", label: "0" },
    { from: "q11", to: "q6", label: "0" }, { from: "q10", to: "q17", label: "0" },
    { from: "q17", to: "T8", label: "0" }, { from: "q17", to: "q25", label: "1" },
    { from: "q14", to: "T9", label: "0" }, { from: "q6", to: "q14", label: "0" },
    { from: "q14", to: "q19", label: "1" }, { from: "q25", to: "q33", label: "0" },
    { from: "q33", to: "q19", label: "1" }, { from: "q11", to: "q19", label: "1" },
    { from: "q56", to: "q4", label: "0" }, { from: "q56", to: "q5", label: "1" },
    { from: "q4", to: "q53", label: "0" }, { from: "q5", to: "q13", label: "1" },
    { from: "q13", to: "q5", label: "1" }, { from: "q5", to: "q12", label: "0" },
    { from: "q12", to: "q3", label: "0" }, { from: "q13", to: "q21", label: "0" },
    { from: "q21", to: "q53", label: "0" }, { from: "q21", to: "q28", label: "1" },
    { from: "q28", to: "q36", label: "1" }, { from: "q28", to: "q35", label: "0" },
    { from: "q36", to: "q33", label: "0" }, { from: "q36", to: "q24", label: "1" },
    { from: "q16", to: "q24", label: "1" }, { from: "q16", to: "q57", label: "0" },
    { from: "q9", to: "q16", label: "0" }, { from: "q9", to: "q3", label: "1" },
    { from: "q53", to: "q51", label: "1" }, { from: "q53", to: "q59", label: "0" },
    { from: "q59", to: "q8", label: "0" }, { from: "q8", to: "q59", label: "0" },
    { from: "q59", to: "q9", label: "1" }, { from: "q4", to: "q9", label: "1" },
    { from: "q8", to: "q15", label: "1" }, { from: "q15", to: "q22", label: "0" },
    { from: "q15", to: "q23", label: "1" }, { from: "q22", to: "q52", label: "1" },
    { from: "q35", to: "q24", label: "1" }, { from: "q23", to: "q30", label: "0" },
    { from: "q30", to: "q9", label: "1" }, { from: "q23", to: "q31", label: "1" },
    { from: "q41", to: "q31", label: "1" }, { from: "q31", to: "q41", label: "1" },
    { from: "q31", to: "q40", label: "0" }, { from: "q40", to: "q20", label: "1" },
    { from: "q20", to: "q26", label: "0" }, { from: "q12", to: "q20", label: "1" },
    { from: "q41", to: "q44", label: "0" }, { from: "q44", to: "q28", label: "1" },
    { from: "q44", to: "q29", label: "0" }, { from: "q40", to: "q29", label: "0" },
    { from: "q35", to: "q29", label: "0" }, { from: "q30", to: "q29", label: "0" },
    { from: "q24", to: "q25", label: "1" }, { from: "q24", to: "q32", label: "0" },
    { from: "q32", to: "q25", label: "1" }, { from: "q32", to: "q29", label: "0" },
    { from: "q33", to: "q29", label: "0" }, { from: "q26", to: "q29", label: "0" },
    { from: "q26", to: "T3", label: "0" }, { from: "q22", to: "q29", label: "0" },
    { from: "q20", to: "q27", label: "1" }, { from: "q27", to: "q25", label: "1" },
    { from: "q27", to: "q34", label: "0" }, { from: "q34", to: "q29", label: "0" },
    { from: "q34", to: "q6", label: "1" }, { from: "q19", to: "q26", label: "0" },
    { from: "q38", to: "q42", label: "0" }, { from: "q42", to: "q39", label: "1" },
    { from: "q38", to: "q39", label: "1" }, { from: "q39", to: "q38", label: "0" },
    { from: "q29", to: "q39", label: "0" }, { from: "q39", to: "q43", label: "1" },
    { from: "q43", to: "q38", label: "0" }, { from: "q29", to: "q38", label: "0" }
  ];
  const loopLabels = {
    T4: "0/1", T8: "0/1", T5: "0/1", T1: "0/1", T9: "0/1", T3: "0/1",
    q6: "1", q25: "1", q19: "1", q42: "0", q43: "1"
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
    <svg width="5000" height="5000" className="dfa">
      <defs>
        <marker
          id="arrowhead" viewBox="0 0 10 10" refX="10" refY="5"
          markerWidth="6" markerHeight="6" orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#5dd39e" />
        </marker>
      </defs>

      {lines.map((line, index) => {
        const from = states[line.from];
        const to = states[line.to];
        const offset = 37;

        function offsetLine(from, to, offset) {
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
              x1={from.x} y1={from.y} x2={adjustedTo.x} y2={adjustedTo.y}
              stroke="white" strokeWidth="2" markerEnd="url(#arrowhead)"
              className={`dfa-line ${isActive ? "active" : ""}`}
            />
            {len !== 0 && (
              <line
                x1={mid.x} y1={mid.y} x2={connectorEnd.x} y2={connectorEnd.y}
                stroke="#5dd39e" strokeWidth="3" strokeDasharray="3,2"
              />
            )}
            <text
              x={labelPos.x} y={labelPos.y} fontSize="14" textAnchor="middle"
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
          key={state} cx={x} cy={y} r={37}
          className={`dfa-state ${
            currentState === state ? "active" : ""
          } ${acceptingStates.includes(state) ? "accepting" : ""}`}
        />
      ))}

      {Object.entries(states).map(([state, { x, y }]) => (
        <text
          key={`${state}-label`}
          x={x - 11} y={y + 7}
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

export default DFA_Simulator;