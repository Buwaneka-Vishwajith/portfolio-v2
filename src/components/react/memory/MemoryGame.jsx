import useMemoryGame from './useMemoryGame.js';

// The only words in the game. Edit freely.
const COPY = {
  start: 'Fine, let’s play',
  lost: 'Never mind, keep scrolling!',
};

export default function MemoryGame() {
  const { active, clicked, gameState, pattern, gridSize, patternLength, cols, startGame, handleClick } =
    useMemoryGame();

  const lost = gameState === 'gameOver';
  const playing = gameState === 'playing';

  const tileState = (i) => {
    if (active.includes(i)) return 'flash';
    if (lost && clicked.includes(i) && !pattern.includes(i)) return 'wrong';
    if (lost && pattern.includes(i) && !clicked.includes(i)) return 'missed';
    if (clicked.includes(i)) return 'picked';
    return 'idle';
  };

  const progress = playing || lost ? clicked.length / patternLength : 0;

  return (
    <div className="memory-game" data-state={gameState}>
      <div
        className="memory-game__grid"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        role="group"
        aria-label={`Memory game, ${cols} by ${cols} grid`}
      >
        {Array.from({ length: gridSize }, (_, i) => (
          <button
            key={i}
            type="button"
            className="memory-game__tile"
            data-tile={tileState(i)}
            onClick={() => handleClick(i)}
            disabled={!playing}
            aria-label={`Tile ${i + 1}`}
            aria-pressed={clicked.includes(i)}
          />
        ))}
      </div>

      <div className="memory-game__bar" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>

      <div className="memory-game__foot" aria-live="polite">
        {gameState === 'waiting' && (
          <button type="button" className="memory-game__start" onClick={startGame}>
            {COPY.start}
          </button>
        )}
        {lost && <p className="memory-game__lost">{COPY.lost}</p>}
      </div>
    </div>
  );
}
