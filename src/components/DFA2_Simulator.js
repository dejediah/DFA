import React, { useState } from "react";
import './DFA_Simulator.css';

const DFA2_Simulator = () => {
  const [input, setInput] = useState("");
  const [currentState, setCurrentState] = useState("q0");
  const [message, setMessage] = useState("");
  const [activeTransition, setActiveTransition] = useState(null);
  const [pulseLoop, setPulseLoop] = useState(null);

  const transitions = {
    q1: { a: "q2", b: "q2" },
    q2: { a: "q3", b: "q3" },
    q3: { a: "q4", b: "q4" },
    q4: { a: "q5", b: "q6" },
    q5: { a: "q7", b: "q6" },
    q6: { a: "q5", b: "q7" },
    q7: { a: "q7", b: "q7" },
  };

  const acceptingStates = ["q7"];

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const simulateDFA = async () => {
    let state = "q1";
    if (!/^[ab]*$/.test(input)) {
      setMessage("invalid input: use only a and b");
      return;
    }
    for (let char of input) {
      if (!transitions[state]) break;
      let nextState = transitions[state][char] || "T";

      setActiveTransition({ from: state, to: nextState });

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
    setMessage(acceptingStates.includes(state) ? "string: accepted" : "string: rejected");
  };

  return (
    <div className="container">
      <h1>(aa + ab + ba + bb) (a + b)* (aa* + bb*) ((ba)* + (ab)* + (aa) + (bb)) (aa + bb) (a + b)*</h1>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="Type string here."
      />
      <button onClick={simulateDFA}>validate string</button>
      <p>state.current = {currentState}</p>
      <p className={message === "string: accepted" ? "accepted" : "rejected"}>{message}</p>
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
    <svg width="5000" height="5000" className="dfa">
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
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
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

  // Calculate perpendicular offset for label position
  const dx = adjustedTo.x - from.x;
  const dy = adjustedTo.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const normX = -dy / len;
  const normY = dx / len;
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
  const pointerRatio = (pointerLength - pointerOffset) / pointerLength;

  // Adjusted endpoint of the connector line (stops before label)
  const connectorEnd = {
    x: mid.x + pointerDx * pointerRatio,
    y: mid.y + pointerDy * pointerRatio,
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
      <line
      x1={mid.x}
      y1={mid.y}
      x2={connectorEnd.x}
      y2={connectorEnd.y}
      stroke="#5dd39e"
      strokeWidth="3"
      strokeDasharray="3,2"
    />

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
  {["q7"].map((state) => renderLoop(state))}

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
      key={state}
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
