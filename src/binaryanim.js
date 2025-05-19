// BinaryAnimation.js
import React, { useEffect, useRef } from 'react';
import './landingpage.css'; // Assuming binaryanim uses styles from landingpage.css

// Define the characters/text to float
// eslint-disable-next-line no-unused-vars
const defaultCharacters = ['0', '1']; // Keep default characters (used when not in brat mode)
const bratText = 'brat'; // The text to show in brat mode

// Accept the isBratModeActive prop
const BinaryAnimation = ({ isBratModeActive }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            console.error("BinaryAnimation: Animation container not found on mount!");
            return;
        }

        const binaries = []; // Array to store binary elements and their state
        let animationId; // Stores the requestAnimationFrame ID
        let spawnSpeed = 200; // Initial speed for spawning new binaries (ms)
        const hoveredSpawnSpeed = 80; // Speed when hovered (ms)
        let hovered = false; // Flag to check if the container is hovered
        let mouseX = 0; // Stores the mouse's X position relative to the container
        // We need mouseY to calculate the vector away from the mouse
        let mouseY = 0; // Stores the mouse's Y position relative to the container (from the top)


        // Animation Constants
        // targetOverallMultiplier is used here to potentially affect speed based on hover
        const hoverSpeedMultiplier = 6; // Speed multiplier when hovered
        const influenceRadius = 200; // Radius of the mouse influence zone (adjust as needed)
        // speedLerp controls how quickly the base upward speed changes on hover
        // A smaller value makes the speed-up gradient slower (approx 3 seconds to reach max speed)
        const speedLerp = 0.02; // <<< Adjusted for slower speed-up gradient
        // displacementLerp controls how quickly the elements respond to the push effect
        // Increase this value for snappier push, decrease for smoother movement.
        const displacementLerp = 0.15; // Adjusted for push effect (experiment with this)
        // How strongly elements are pushed away from the mouse
        const pushStrength = 150; // <<< Added constant for push magnitude


        // Function to create a single binary character element
        const createBinary = () => {
            const span = document.createElement("span");
            span.classList.add("binary");
            // Conditionally set text content based on isBratModeActive prop
            span.textContent = isBratModeActive ? bratText : (Math.random() > 0.5 ? "0" : "1");

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
                x: left, // Initial horizontal position (relative to container left)
                y: 0, // Current vertical position (distance from bottom) - this tracks the base upward movement
                baseSpeed: 0.5 + depth * 1.5, // Base speed varies by depth

                // --- Properties for gradual changes ---
                currentOverallMultiplier: 1, // Used for base speed lerping
                currentDispX: 0, // Current additional horizontal displacement from natural path
                currentDispY: 0, // Current additional vertical displacement from natural path
                // --- End new properties ---

                depth,
            };

            binaries.push(binary);
            container.appendChild(span);
        };

        // Animation update function
        const update = () => {
             // targetOverallMultiplier is used here to potentially affect speed based on hover
            // eslint-disable-next-line no-unused-vars
            const targetOverallMultiplier = hovered ? hoverSpeedMultiplier : 1; // Used in base speed calculation below

            for (let i = binaries.length - 1; i >= 0; i--) {
                const b = binaries[i];

                // Continue base upward motion, potentially affected by hover speed multiplier
                // Lerp the overall speed multiplier
                b.currentOverallMultiplier += ((hovered ? hoverSpeedMultiplier : 1) - b.currentOverallMultiplier) * speedLerp; // Uses speedLerp
                b.y += b.baseSpeed * b.currentOverallMultiplier; // Updates base vertical position


                let targetAdditionalDispX = 0; // Target additional horizontal displacement
                let targetAdditionalDispY = 0; // Target additional vertical displacement

                if (hovered) {
                    // Calculate the vector from the binary's current position to the mouse position
                    // Binary's screen position (from top) is (b.x + b.currentDispX, container.clientHeight - b.y + b.currentDispY).
                    // Mouse screen position (from top) is (mouseX, mouseY).
                    const dx_from_mouse = (b.x + b.currentDispX) - mouseX; // Distance from mouse X to element's current screen X
                    const dy_from_mouse = (container.clientHeight - b.y + b.currentDispY) - mouseY; // Distance from mouse Y to element's current screen Y
                    const distanceToMouse = Math.sqrt(dx_from_mouse * dx_from_mouse + dy_from_mouse * dy_from_mouse);

                    // Calculate influence based on distance to mouse
                    // Influence is stronger when closer to the mouse
                    const influence = 1 - Math.min(distanceToMouse / influenceRadius, 1);

                    if (influence > 0) {
                        // Calculate normalized direction vector AWAY from the mouse
                        const safeDistance = distanceToMouse < 1 ? 1 : distanceToMouse; // Prevent division by zero
                        const dirX = safeDistance === 0 ? 0 : dx_from_mouse / safeDistance; // Added check for safeDistance
                        const dirY = safeDistance === 0 ? 0 : dy_from_mouse / safeDistance; // Added check for safeDistance

                        // Calculate target displacement based on direction and influence/pushStrength
                        // This pushes elements away from the mouse within the influence zone
                        targetAdditionalDispX = dirX * influence * pushStrength; // Scale by influence and pushStrength
                        targetAdditionalDispY = dirY * influence * pushStrength; // Scale by influence and pushStrength

                         // Lerp towards the calculated target displacement
                         b.currentDispX += (targetAdditionalDispX - b.currentDispX) * displacementLerp; // Uses displacementLerp
                         b.currentDispY += (targetAdditionalDispY - b.currentDispY) * displacementLerp; // Uses displacementLerp

                    } else {
                        // If outside influence, lerp current displacement back to 0
                         b.currentDispX += (0 - b.currentDispX) * displacementLerp;
                         b.currentDispY += (0 - b.currentDispY) * displacementLerp;
                    }

                } else {
                    // If not hovered, lerp current displacement back to 0
                     b.currentDispX += (0 - b.currentDispX) * displacementLerp;
                     b.currentDispY += (0 - b.currentDispY) * displacementLerp;
                }


                // Apply the base upward motion and the *additional* displacement using transform
                // The translateY transform moves relative to the element's natural position.
                // Natural Y position from top is container.clientHeight - b.y.
                // We want the final Y position from top to be container.clientHeight - b.y + b.currentDispY.
                // So the translateY needed is b.currentDispY.
                // The translateX needed is b.currentDispX.

                // Corrected transform: combine base upward motion (-b.y) with additional displacement (b.currentDispY)
                b.el.style.transform = `translateY(${-b.y + b.currentDispY}px) translateX(${b.currentDispX}px) scale(${1 + b.depth * 0.2})`;
                // Calculate opacity based on the base vertical position (b.y)
                b.el.style.opacity = Math.max(0, 1 - b.y / container.clientHeight);

                // Remove elements that have gone off screen (based on base vertical position)
                if (b.y > container.clientHeight + 50) {
                    container.removeChild(b.el);
                    binaries.splice(i, 1);
                }
            }

            animationId = requestAnimationFrame(update);
        };

        // Initial creation of binaries (optional, can rely solely on interval)
        // for (let i = 0; i < 20; i++) { // Adjust number of initial elements
        //     createBinary();
        // }

        let spawnInterval = setInterval(createBinary, spawnSpeed);
        animationId = requestAnimationFrame(update);

        // Mouse event handlers
        const onMouseMove = (e) => {
            const rect = container.getBoundingClientRect();
            mouseX = e.clientX - rect.left; // X relative to container left
            mouseY = e.clientY - rect.top; // Y relative to container top
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

        // Cleanup function
        return () => {
            cancelAnimationFrame(animationId);
            clearInterval(spawnInterval);
            if (container) { // Check if container still exists before removing listeners/children
                container.removeEventListener("mousemove", onMouseMove);
                container.removeEventListener("mouseenter", onMouseEnter);
                container.removeEventListener("mouseleave", onMouseLeave);
                binaries.forEach(b => {
                    if (b.el && b.el.parentNode === container) {
                        container.removeChild(b.el);
                    }
                });
            }
        };

    }, [isBratModeActive]); // Re-run effect when isBratModeActive changes

    return (
        // The media-box class provides the container for the animation
        <div className="media-box" ref={containerRef}>
             {/* The binary elements are added directly to the DOM by the useEffect hook */}
            {/* Fisheye layer remains */}
            <div className="fisheye-layer"></div>
        </div>
    );
};

export default BinaryAnimation;
