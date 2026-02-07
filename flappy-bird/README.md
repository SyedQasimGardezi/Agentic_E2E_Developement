# Flappy Bird (KAN-17)

A simple Flappy Bird-style browser game built with **vanilla HTML, CSS, and JavaScript**.

## Features

- Single-page game rendered directly in the browser
- Bird controlled by keyboard, mouse, or touch
- Gravity and flap physics
- Continuously scrolling pipes with randomized gaps
- Collision detection with pipes and ground/ceiling
- Score and best score (stored in `localStorage`)
- Responsive layout for desktop and mobile

## Running the Game

1. Clone the repository and check out the `feature/KAN-17-flappy-bird` branch.
2. Navigate to the `flappy-bird` directory.
3. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).
   - No build step or server is required.

## Controls

- **Space** or **Arrow Up** – flap (move the bird upward)
- **Mouse click** on the game area – flap
- **Touch** on the game area (mobile) – flap

The game starts on the first flap. When you hit an obstacle or the ground/ceiling, the game ends and you can press **Play Again** or flap again to restart.

## Notes

- Best score is stored in `localStorage` under the key `kan17_best_score`.
- All logic is implemented in `script.js` using `requestAnimationFrame` for smooth animation.
