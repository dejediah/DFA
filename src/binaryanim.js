// BinaryAnimation.js
import React, { useEffect } from 'react';
import './landingpage.css'; // Assuming styles are here

const BinaryAnimation = () => {
  useEffect(() => {
    const container = document.getElementById("animation-container");

    if (!container) {
      console.error("BinaryAnimation: Animation container not found on mount!");
      return;
    }

    const binaries = []; // Array to store binary elements and their state
    let animationId; // Stores the requestAnimationFrame ID
    let spawnSpeed = 200; // **Adjusted:** Initial speed for spawning new binaries (ms) - Faster
    const hoveredSpawnSpeed = 80; // **Adjusted:** Speed when hovered (ms) - Faster
    let hovered = false; // Flag to check if the container is hovered
    let mouseX = 0; // Stores the mouse's X position relative to the container

    // Animation Constants
    const hoverSpeedMultiplier = 3; // Target speed multiplier when hovered (3x normal speed)
    const maxArcDisplacement = 100; // Maximum displacement magnitude for the arc effect
    const influenceRadius = 150; // Horizontal radius of the mouse influence zone (for arc magnitude)
    const speedLerp = 0.05; // Interpolation factor for gradual speed change (smaller = slower transition)
    const displacementLerp = 0.08; // Interpolation factor for gradual displacement change (smaller = slower transition)


    // Function to create a single binary character element
    const createBinary = () => {
      const span = document.createElement("span");
      span.classList.add("binary");
      span.textContent = Math.random() > 0.5 ? "0" : "1";

      const left = Math.random() * container.clientWidth;
      const depth = Math.random(); // Random depth for parallax/speed variation (0 to 1)
      const size = 0.8 + depth * 1.2; // Size variation based on depth

      span.style.position = "absolute";
      span.style.left = `${left}px`;
      span.style.bottom = `0px`; // Start from the bottom
      span.style.fontSize = `${size}rem`;
      span.style.pointerEvents = 'none';
      span.style.whiteSpace = 'nowrap';
      span.style.willChange = 'transform, opacity'; // Optimize animation performance

      const binary = {
        el: span,
        x: left, // Initial horizontal position
        y: 0, // Current vertical position (distance from bottom)
        baseSpeed: 0.5 + depth * 1.5, // Base speed varies by depth

        // --- Properties for gradual changes ---
        currentOverallMultiplier: 1,
        currentDispX: 0,
        currentDispY: 0,
        // --- End new properties ---

        depth,
      };

      binaries.push(binary);
      container.appendChild(span);
    };

    // Animation update function
    const update = () => {
      const targetOverallMultiplier = hovered ? hoverSpeedMultiplier : 1;

      for (let i = binaries.length - 1; i >= 0; i--) {
        const b = binaries[i];

        b.currentOverallMultiplier += (targetOverallMultiplier - b.currentOverallMultiplier) * speedLerp;
        b.y += b.baseSpeed * b.currentOverallMultiplier;

        const dx = b.x - mouseX;
        const horizontalInfluence = 1 - Math.min(Math.abs(dx) / influenceRadius, 1);

        let targetDispX = 0;
        let targetDispY = 0;

        if (hovered && horizontalInfluence > 0) {
          // Calculate vector from mouse position (mouseX, 0) to binary's screen position (b.x, dyScreen)
          const dyScreen = container.clientHeight - b.y;
          const distanceToMouse = Math.sqrt(dx * dx + dyScreen * dyScreen);
          const safeDistance = distanceToMouse < 1 ? 1 : distanceToMouse;

          // Calculate normalized direction vector AWAY from the mouse.
          // BASED ON OBSERVATION, the signs needed seem to be the opposite of standard vector math
          // for 'away from mouse (mouseX, 0) to binary'.
          const dirX = dx / safeDistance; // Using dx/safeDistance instead of -dx/safeDistance
          const dirY = dyScreen / safeDistance; // Using dyScreen/safeDistance instead of -dyScreen/safeDistance


          const arcMagnitude = horizontalInfluence * maxArcDisplacement;

          targetDispX = dirX * arcMagnitude;
          targetDispY = dirY * arcMagnitude;
        }

        b.currentDispX += (targetDispX - b.currentDispX) * displacementLerp;
        b.currentDispY += (targetDispY - b.currentDispY) * displacementLerp;

        b.el.style.transform = `translateY(${-b.y + b.currentDispY}px) translateX(${b.currentDispX}px) scale(${1 + b.depth * 0.2})`;
        b.el.style.opacity = Math.max(0, 1 - b.y / container.clientHeight);

        if (b.y > container.clientHeight + 50) {
          container.removeChild(b.el);
          binaries.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(update);
    };

    let spawnInterval = setInterval(createBinary, spawnSpeed);
    animationId = requestAnimationFrame(update);

    // Mouse event handlers
    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
    };

    const onMouseEnter = () => {
      hovered = true;
      clearInterval(spawnInterval);
      spawnInterval = setInterval(createBinary, hoveredSpawnSpeed); // Faster spawn rate
    };

    const onMouseLeave = () => {
      hovered = false;
      clearInterval(spawnInterval);
      spawnInterval = setInterval(createBinary, spawnSpeed); // Normal spawn rate
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseenter", onMouseEnter);
    container.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(spawnInterval);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseenter", onMouseEnter);
      container.removeEventListener("mouseleave", onMouseLeave);
      binaries.forEach(b => {
          if (b.el && b.el.parentNode === container) {
              container.removeChild(b.el);
          }
      });
    };

  }, []); // EMPTY dependency array

  return (
    <div className="media-box">
      <div className="media-placeholder" id="animation-container">
        <div className="fisheye-layer"></div>
      </div>
    </div>
  );
};

export default BinaryAnimation;