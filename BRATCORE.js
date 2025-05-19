import React, { useState } from "react";
import './DFA_Simulator.css';

const DFA_Simulator = () => {
  const [input, setInput] = useState("");
  const [currentState, setCurrentState] = useState("q0");
  const [message, setMessage] = useState("");
  const [activeTransition, setActiveTransition] = useState(null);
  const [pulseLoop, setPulseLoop] = useState(null);

  const transitions = {
    q0: { a: "q1", b: "T" },
    q1: { a: "q2", b: "q3" },
    q2: { a: "q2", b: "q2" },
    q3: { a: "q3", b: "q3" },
    T: { a: "T", b: "T" },
  };

  const acceptingStates = ["q2", "q3"];

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const simulateDFA = async () => {
    let state = "q0";
    for (let char of input) {
      if (!transitions[state]) break;
      let nextState = transitions[state][char] || "T";

      setActiveTransition({ from: state, to: nextState });

      if (state === nextState) {
        setPulseLoop({ state, key: Date.now() }); 
        await new Promise((resolve) => setTimeout(resolve, 500));
        setPulseLoop(null);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      state = nextState;
      setCurrentState(state);
    }

    setActiveTransition(null);
    setMessage(acceptingStates.includes(state) ? "so brat!" : "fugly");
  };

  return (
    <div className="container">
      <h1 style={{ fontWeight: 'normal' }}>brat sim</h1>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="im so julia!"
      />
      <button onClick={simulateDFA}>Check String</button>
      <p>Current State: {currentState}</p>
      <p className={message === "so brat!" ? "accepted" : "rejected"}>{message}</p>
      <DFAVisualization
        currentState={currentState}
        activeTransition={activeTransition}
        acceptingStates={acceptingStates}
        pulseLoop={pulseLoop}
      />
    </div>
  );
};

const DFAVisualization = ({ currentState, activeTransition, acceptingStates, pulseLoop }) => {
  const states = {
    q0: { x: 200, y: 100 },
    q1: { x: 100, y: 200 },
    q2: { x: 200, y: 300 },
    q3: { x: 300, y: 200 },
    T: { x: 50, y: 100 },
  };

  const lines = [
    { from: "q0", to: "q1", label: "a" },
    { from: "q0", to: "T", label: "b" },
    { from: "q1", to: "q2", label: "a" },
    { from: "q1", to: "q3", label: "b" },
  ];

  const getMidpoint = (from, to) => {
    const fromState = states[from];
    const toState = states[to];
    return {
      x: (fromState.x + toState.x) / 2,
      y: (fromState.y + toState.y) / 2,
    };
  };

  const renderLoop = (stateName) => {
    const { x, y } = states[stateName];
    const isActive =
      activeTransition?.from === stateName &&
      activeTransition?.to === stateName;
    const shouldPulse = pulseLoop?.state === stateName;
  
    return (
      <React.Fragment key={pulseLoop?.state === stateName ? pulseLoop.key : stateName}>
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
          a/b
        </text>
      </React.Fragment>
    );
  };

  return (
    <svg width="500" height="500" className="dfa">
      {lines.map((line, index) => {
        const from = states[line.from];
        const to = states[line.to];
        const mid = getMidpoint(line.from, line.to);
        const isActive = activeTransition?.from === line.from && activeTransition?.to === line.to;

        return (
          <React.Fragment key={index}>
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className={`dfa-line ${isActive ? "active" : ""}`}
            />
            <text
              x={mid.x}
              y={mid.y - 10}
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
      {["q2", "q3", "T"].map((state) => renderLoop(state))}

      {/* States */}
      {Object.entries(states).map(([state, { x, y }]) => (
        <circle
          key={state}
          cx={x}
          cy={y}
          r={30}
          className={`dfa-state ${currentState === state ? "active" : ""} ${acceptingStates.includes(state) ? "accepting" : ""}`}
        />
      ))}

      {/* State Labels */}
      {Object.entries(states).map(([state, { x, y }]) => (
        <text key={state} x={x - 10} y={y + 5} fontSize="16">
          {state}
        </text>
      ))}
    </svg>
  );
};

export default DFA_Simulator;
