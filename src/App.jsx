import { useEffect, useState } from 'react'
import './App.css'

const BOARD_ROWS = 6;
const WORD_LENGTH = 5;

function getEmptyBoard() {
  return Array.from({ length: BOARD_ROWS }, () => Array(WORD_LENGTH).fill(''));
}

function getEmptyColors() {
  return Array.from({ length: BOARD_ROWS }, () => Array(WORD_LENGTH).fill(''));
}

// Check if a word has duplicate letters
function hasDuplicateLetters(word) {
  const letters = word.toLowerCase().split('');
  return letters.length !== new Set(letters).size;
}

function getGuessColors(guess, answer) {
  // Returns array of 'correct', 'present', 'absent' for each letter
  const colors = Array(WORD_LENGTH).fill('absent');
  const answerArr = answer.split('');
  const guessArr = guess.split('');

  // First pass: mark correct positions and remove from answer pool
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessArr[i] === answerArr[i]) {
      colors[i] = 'correct';
      answerArr[i] = null; // Mark as used
    }
  }

  // Second pass: mark present positions from remaining letters
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (colors[i] === 'correct') continue;
    const letterIndex = answerArr.indexOf(guessArr[i]);
    if (letterIndex !== -1) {
      colors[i] = 'present';
      answerArr[letterIndex] = null; // Mark as used
    }
  }

  return colors;
}

function App() {
  const [words, setWords] = useState([]); // For validating user input
  const [commonWords, setCommonWords] = useState([]); // For selecting answers
  const [answer, setAnswer] = useState('');
  const [board, setBoard] = useState(getEmptyBoard());
  const [boardColors, setBoardColors] = useState(getEmptyColors());
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [status, setStatus] = useState('playing'); // playing | win | lose
  const [keyColors, setKeyColors] = useState({}); // {A: 'correct', ...}
  const [message, setMessage] = useState('');

  // Load words and pick a random answer
  const loadWords = async () => {
    try {
      // Load comprehensive word list for validation
      const wordsRes = await fetch(`${import.meta.env.BASE_URL}words.json`);
      const wordsData = await wordsRes.json();
      setWords(wordsData.map(w => w.toUpperCase()));

      // Load common words for answers
      const commonRes = await fetch(`${import.meta.env.BASE_URL}5_letter_common.json`);
      const commonData = await commonRes.json();
      setCommonWords(commonData.map(w => w.toUpperCase()));

      // Filter common words without duplicate letters for answers
      const wordsWithoutDuplicates = commonData.filter(word => !hasDuplicateLetters(word));

      // Pick random answer from common words without duplicates
      const randomAnswer = wordsWithoutDuplicates[Math.floor(Math.random() * wordsWithoutDuplicates.length)];
      setAnswer(randomAnswer.toUpperCase());

      setBoard(getEmptyBoard());
      setBoardColors(getEmptyColors());
      setCurrentRow(0);
      setCurrentCol(0);
      setStatus('playing');
      setKeyColors({});
      setMessage('');
    } catch (error) {
      console.error('Error loading words:', error);
      setMessage('Error loading word lists');
    }
  };

  useEffect(() => {
    loadWords();
  }, []);

  // Keyboard letters
  const KEYS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['⏎', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
  ];

  // Map symbols to actions
  const keyToAction = (key) => {
    if (key === '⏎') return 'ENTER';
    if (key === '⌫') return 'DEL';
    return key;
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  const clearCurrentRow = () => {
    setBoard(prevBoard => {
      const newBoard = prevBoard.map(row => [...row]);
      newBoard[currentRow] = Array(WORD_LENGTH).fill('');
      return newBoard;
    });
    setCurrentCol(0);
  };

  // Handle key press
  const handleKey = (key) => {
    key = keyToAction(key);
    if (status !== 'playing') return;
    if (key === 'DEL') {
      if (currentCol > 0) {
        setBoard(prevBoard => {
          const newBoard = prevBoard.map(row => [...row]);
          newBoard[currentRow][currentCol - 1] = '';
          return newBoard;
        });
        setCurrentCol(currentCol - 1);
      }
    } else if (key === 'ENTER') {
      if (currentCol === WORD_LENGTH) {
        const guess = board[currentRow].join('').toUpperCase();

        // Check if the guess exists in word list (case insensitive)
        if (!words.includes(guess)) {
          showMessage('Not a valid word');
          clearCurrentRow();
          return;
        }

        const colors = getGuessColors(guess, answer);
        setBoardColors(prevColors => {
          const newColors = prevColors.map(row => [...row]);
          newColors[currentRow] = colors;
          return newColors;
        });
        setKeyColors(prev => {
          const updated = { ...prev };
          for (let i = 0; i < WORD_LENGTH; i++) {
            const letter = guess[i];
            const color = colors[i];
            const prevColor = updated[letter];
            if (
              color === 'correct' ||
              (color === 'present' && prevColor !== 'correct') ||
              (color === 'absent' && !prevColor)
            ) {
              updated[letter] = color;
            }
          }
          return updated;
        });
        if (guess === answer) {
          setStatus('win');
        } else if (currentRow === BOARD_ROWS - 1) {
          setStatus('lose');
        } else {
          setCurrentRow(currentRow + 1);
          setCurrentCol(0);
        }
      }
    } else if (/^[A-Z]$/.test(key)) {
      if (currentCol < WORD_LENGTH) {
        setBoard(prevBoard => {
          const newBoard = prevBoard.map(row => [...row]);
          newBoard[currentRow][currentCol] = key;
          return newBoard;
        });
        setCurrentCol(currentCol + 1);
      }
    }
  };

  // Get cell color for board
  const getCellColor = (rowIdx, colIdx) => {
    return boardColors[rowIdx][colIdx] || '';
  };

  // Get key color for keyboard
  const getKeyColor = (key) => {
    const action = keyToAction(key);
    if (action === 'ENTER' || action === 'DEL') return '';
    return keyColors[action] || '';
  };

  return (
    <div className="fiveletter-container">
      <div className="game-top">
        <header className="fiveletter-header">
          <button className="refresh-btn" onClick={loadWords} aria-label="Refresh">⟳</button>
          <h1>5 Letter</h1>
        </header>
        <div className="board">
          {board.map((row, rIdx) => (
            <div className="board-row" key={rIdx}>
              {row.map((cell, cIdx) => (
                <div className={`board-cell ${getCellColor(rIdx, cIdx)}`} key={cIdx}>{cell}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="status-message">
        {message && <span className="temp-message">{message}</span>}
        {status === 'win' && <span>🎉 You Win!</span>}
        {status === 'lose' && <span>😢 Answer: {answer}</span>}
      </div>

      <div className="keyboard">
        {KEYS.map((row, rIdx) => (
          <div className="keyboard-row" key={rIdx}>
            {row.map((key) => (
              <button
                className={`key ${getKeyColor(key)}`}
                key={key}
                onClick={() => handleKey(key)}
                disabled={status !== 'playing'}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App
