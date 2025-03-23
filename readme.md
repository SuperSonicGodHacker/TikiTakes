# Single-Player Basketball Hoop Practice Game

This document outlines the steps to build a simple single-player basketball hoop practice game. We'll focus on building it incrementally, one feature at a time.

## Phase 1: Basic Hoop and Ball Visualization

**Objective:** Render a static basketball hoop and a basketball on the screen.

**Prompts:**

1.  **Project Setup:**
    * "Initialize a new project with [JavaScript and Canvas]."
    * "Create a basic window/canvas with a suitable size for a basketball game."
2.  **Drawing the Hoop:**
    * "Draw a simple basketball hoop using basic shapes (e.g., rectangles, circles). Consider representing the backboard, rim, and net."
    * "Position the hoop at a suitable location on the screen (e.g., centered at the top)."
3.  **Drawing the Ball:**
    * "Draw a basketball as a circle."
    * "Position the ball at a starting location (e.g., bottom-center of the screen)."
    * "Give the ball a distinct color."

## Phase 2: Ball Movement and Shooting

**Objective:** Allow the player to control the ball's trajectory and simulate a shot.

**Prompts:**

1.  **Input Handling:**
    * "Implement keyboard or mouse input to control the ball's initial velocity (e.g., arrow keys for direction, spacebar for power)."
    * "Store the initial velocity components (x and y) based on the player's input."
2.  **Ball Trajectory:**
    * "Implement a simple physics simulation to update the ball's position over time, including gravity."
    * "Use the initial velocity and gravity to calculate the ball's new position in each frame."
3.  **Shooting Action:**
    * "Trigger the ball's trajectory when the player presses a specific key (e.g., spacebar)."
    * "Once the ball is shot, disable further input until it lands or goes off-screen."

## Phase 3: Collision Detection and Scoring

**Objective:** Detect collisions between the ball and the hoop, and implement scoring.

**Prompts:**

1.  **Collision Detection:**
    * "Implement collision detection between the ball and the rim."
    * "Implement collision detection between the ball and the backboard."
    * "Determine if the ball goes through the hoop."
2.  **Scoring:**
    * "If the ball goes through the hoop, increment the player's score."
    * "Display the player's score on the screen."
    * "Reset the ball's position after a successful shot or a miss."
3.  **Sound Effects (Optional):**
    * "Add sound effects for shooting, bouncing, and scoring."

## Phase 4: Game State and User Interface

**Objective:** Add game state management and basic UI elements.

**Prompts:**

1.  **Game State:**
    * "Implement a game state to track the player's score, number of shots, and game over condition."
    * "Add a 'game over' condition (e.g., after a certain number of missed shots)."
2.  **User Interface:**
    * "Display the player's score on the screen."
    * "Display the number of shots remaining (if applicable)."
    * "Display a 'game over' message when the game ends."
    * "Add a 'restart' button or key to start a new game."
3.  **Difficulty (Optional):**
    * "Implement different difficulty levels by adjusting the gravity or hoop position."
    * "Add a timer to increase difficulty over time."
