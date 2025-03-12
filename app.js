/**********************************************
 * STARTER CODE
 **********************************************/

/**
 * shuffle()
 * Shuffle the contents of an array
 *   depending the datatype of the source
 * Makes a copy. Does NOT shuffle the original.
 * Based on Steve Griffith's array shuffle prototype
 * @Parameters: Array or string
 * @Return: Scrambled Array or string, based on the provided parameter
 */
function shuffle(src) {
  const copy = [...src]

  const length = copy.length
  for (let i = 0; i < length; i++) {
    const x = copy[i]
    const y = Math.floor(Math.random() * length)
    const z = copy[y]
    copy[i] = z
    copy[y] = x
  }

  if (typeof src === 'string') {
    return copy.join('')
  }

  return copy
}

/**********************************************
 * YOUR CODE BELOW
 **********************************************/

const WORDS = ['Breeze', 'Mellow', 'Cactus', 'Fusion', 'Glisten']

const Counter = ({ label, value }) => {
  return (
    <div className="counter">
      <div className="counter-points">{value}</div>
      <div className="counter-label">{label}</div>
    </div>
  )
}

const gameOverText = (points, strikes) =>
  `Game Over! Total Points: ${points}. Total Strikes: ${strikes}`

const GameOverText = {
  won: () => 'You win! You got all the points!',
  lost: () => `You lost! 3 strikes and you're out!`,
  gameover: (points, strikes) =>
    `Game Over! Total Points: ${points}. Total strikes: ${strikes}`,
}

const GameOver = ({ reset, mode, points, strikes }) => {
  const text = GameOverText[mode](points, strikes)

  return (
    <div>
      <p>{text}</p>
      <p>Would you like to play again?</p>
      <button onClick={reset}>Play again</button>
    </div>
  )
}

const newGameState = () => {
  const words = shuffle(WORDS)
  const current = words[0]
  const currentShuffled = shuffle(current)

  return {
    points: 0,
    strikes: 0,
    passes: Math.min(WORDS.length, 3),
    passesUsed: 0,
    allWords: WORDS,
    words,
    current,
    currentShuffled,
    mode: 'playing',
    lastAction: undefined,
  }
}

const pickWord = (state) => {
  const newWords = state.words.slice(1)
  const nextWord = newWords[0]
  return {
    ...state,
    words: newWords,
    current: nextWord,
    currentShuffled: shuffle(nextWord),
  }
}

const checkWord = (state, input) => {
  const isMatch = input.toLowerCase() === state.current.toLowerCase()
  const newPoints = isMatch ? state.points + 1 : state.points
  const newStrikes = isMatch ? state.strikes : state.strikes + 1

  const isLost = newStrikes >= Math.min(state.allWords.length, 3)
  const isWon = newPoints >= state.allWords.length
  const isGameOver = newPoints + newStrikes >= state.allWords.length

  let newMode = state.mode
  if (isWon) {
    newMode = 'won'
  } else if (isGameOver) {
    newMode = 'gameover'
  } else if (isLost) {
    newMode = 'lost'
  }

  return {
    ...state,
    points: newPoints,
    strikes: newStrikes,
    mode: newMode,
    lastAction: isMatch ? 'correct' : 'wrong',
  }
}

const passWord = (state) => {
  if (!state.passes) {
    return state
  }

  if (state.words.length) {
    const newWords = shuffle(state.words)
    const current = newWords[0]
    const currentShuffled = shuffle(current)
    return {
      ...state,
      words: newWords,
      current,
      currentShuffled,
      passes: state.passes - 1,
      passesUsed: state.passesUsed + 1,
      lastAction: 'pass',
    }
  }

  return {
    ...state,
    mode: 'won',
  }
}

const newGame = () => {
  const newState = newGameState()
  localStorage.setItem('state', JSON.stringify(newState))
  return newState
}

const initGame = () => {
  const fromStorage = localStorage.getItem('state')

  if (!fromStorage) {
    return newGame()
  }

  return JSON.parse(fromStorage)
}

const App = () => {
  const [gameState, setGamestate] = React.useState(initGame())
  const [input, setInput] = React.useState('')
  const [debug, setDebug] = React.useState(false)

  const updateState = (newState) => {
    localStorage.setItem('state', JSON.stringify(newState))
    setGamestate(newState)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setInput('')

    const stateAfterCheck = checkWord(gameState, input)

    if (stateAfterCheck.lastAction === 'wrong') {
      return updateState(stateAfterCheck)
    }

    if (stateAfterCheck.mode === 'playing') {
      return updateState(pickWord(stateAfterCheck))
    }

    updateState(stateAfterCheck)
  }

  const handleReset = () => {
    updateState(newGame())
  }

  const handlePass = () => {
    updateState(passWord(gameState))
  }

  const { mode, passes, words, current, points, strikes, currentShuffled } =
    gameState

  if (mode !== 'playing') {
    return (
      <GameOver
        mode={mode}
        reset={handleReset}
        points={points}
        strikes={strikes}
      />
    )
  }

  return (
    <div>
      <h1>Welcome to Scramble</h1>

      <div className="rules">
        <h2>Rules</h2>
        <ul>
          <li>Guess all 5 words correctly to win!</li>
          <li>Guess wrong 3 times and you lose!</li>
        </ul>
        <p>
          When there are no more words, the game will end and display player
          score
        </p>
        <p>If you lose, player score will not be displayed</p>
      </div>

      <div id="scoreboard">
        <Counter label="Points" value={points} />
        <Counter label="Strikes" value={strikes} />
      </div>

      <div>{currentShuffled.toUpperCase()}</div>

      {Boolean(gameState.lastAction) && (
        <div className={`last-action last-action-${gameState.lastAction}`}>
          {gameState.lastAction === 'correct' && 'You got it correct!'}
          {gameState.lastAction === 'wrong' && 'Uh oh, you got it wrong!'}
          {gameState.lastAction === 'pass' &&
            `You passed, we'll get to this word later`}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </form>

      <button disabled={!Boolean(passes)} onClick={handlePass}>
        {passes} Passes Remaining
      </button>

      <div class="debug-buton">
        <button onClick={() => setDebug(!debug)}>
          {debug ? 'Close' : 'Open'} Debug
        </button>
      </div>

      {debug && (
        <div class="debug">
          <h2>Debug</h2>
          <div>Mode: {mode}</div>
          <div>All words: {JSON.stringify(words)}</div>
          <div>Current word: {current}</div>
          <button
            onClick={() => {
              localStorage.removeItem('state')
            }}
          >
            Clear local storage
          </button>
        </div>
      )}
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)