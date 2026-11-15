import { useEffect, useState } from 'react';

/**
 * The memory game's rules, timings and state — moved unchanged from the
 * original v1 component (src/components/react/Game.jsx, which stays in the
 * project untouched). Only the JSX was left behind; this hook returns the
 * state so any UI can draw it.
 */
export default function useMemoryGame() {
  const [active, setActive] = useState([]);
  const [clicked, setClicked] = useState([]);
  const [gameState, setGameState] = useState("waiting");
  const [level, setLevel] = useState(1);
  const [pattern, setPattern] = useState([]);

  const getGridSize = (level) => {
    if(level >= 6) {
      return 25; // 5x5 grid
    } else if (level >= 3) {
      return 16; // 4x4 grid
    } else {
      return 9;  // 3x3 grid
    }
  };

  const getPatternLength = (level) => {
    return Math.min(2 + level, 6); // Start with 3, max 6
  };

  const getRandom = () => {
    const random = new Set();
    const gridSize = getGridSize(level);
    const patternLength = getPatternLength(level);

    while (random.size < patternLength) {
      const randomIndex = Math.floor(Math.random() * gridSize);
      random.add(randomIndex);
    }

    return Array.from(random);
  };

  const startGame = () => {
    setGameState("starting");
    setLevel(1);
  };

  // Generate and show pattern
  useEffect(() => {
    if (gameState === "starting" || gameState === "nextLevel") {
      const startTimer = setTimeout(() => {
        const newPattern = getRandom();
        setPattern(newPattern);
        setActive(newPattern);
        setGameState("showing");
      }, 500);
      return () => clearTimeout(startTimer);
    }
  }, [gameState, level]);

  // Hide pattern after showing
  useEffect(() => {
    if (gameState === "showing" && active.length > 0) {
      const hideTimer = setTimeout(() => {
        setActive([]);
        setGameState("playing");
      }, 300 + (level * 100)); // Show longer for higher levels
      return () => clearTimeout(hideTimer);
    }
  }, [gameState, active, level]);

  // Reset game after game over
  useEffect(() => {
    if (gameState === "gameOver") {
      const resetTimer = setTimeout(() => {
        setClicked([]);
        setLevel(1);
        setPattern([]);
        setGameState("waiting");
      }, 2000);
      return () => clearTimeout(resetTimer);
    }
  }, [gameState]);

  const handleClick = (index) => {
    const patternLength = getPatternLength(level);
    if (
      gameState !== "playing" ||
      clicked.includes(index) ||
      clicked.length >= patternLength
    )
      return;

    const newClicked = [...clicked, index];
    setClicked(newClicked);

    if (newClicked.length === patternLength) {
      if (newClicked.sort().join(",") === pattern.sort().join(",")) {
        // Correct! Move to next level
        setLevel(level + 1);
        setClicked([]);
        setGameState("nextLevel");
      } else {
        // Wrong pattern
        setGameState("gameOver");
      }
    }
  };

  const getGridCols = () => {
    if(level >= 6) return 5;
    if(level >= 3) return 4;
    return 3;
  };

  return {
    active,
    clicked,
    gameState,
    level,
    pattern,
    gridSize: getGridSize(level),
    patternLength: getPatternLength(level),
    cols: getGridCols(),
    startGame,
    handleClick,
  };
}
