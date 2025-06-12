import React, { useState, useEffect } from 'react';
import '../styles/BlackjackGame.css';

const BlackjackGame = ({ onClose, money, setMoney }) => {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameState, setGameState] = useState('betting'); // betting, playing, dealerTurn, gameOver
  const [bet, setBet] = useState(1);
  const [message, setMessage] = useState('');

  // Initialize deck
  const initializeDeck = () => {
    const suits = ['♠', '♣', '♥', '♦'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const newDeck = [];
    
    for (let suit of suits) {
      for (let value of values) {
        newDeck.push({ suit, value });
      }
    }
    
    return shuffle(newDeck);
  };

  // Shuffle deck
  const shuffle = (array) => {
    let currentIndex = array.length;
    while (currentIndex !== 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  // Draw a card
  const drawCard = () => {
    const card = deck[0];
    setDeck(deck.slice(1));
    return card;
  };

  // Calculate hand value
  const calculateHand = (hand) => {
    let value = 0;
    let aces = 0;

    for (let card of hand) {
      if (card.value === 'A') {
        aces += 1;
      } else if (['K', 'Q', 'J'].includes(card.value)) {
        value += 10;
      } else {
        value += parseInt(card.value);
      }
    }

    for (let i = 0; i < aces; i++) {
      if (value + 11 <= 21) {
        value += 11;
      } else {
        value += 1;
      }
    }

    return value;
  };

  // Start new game
  const startGame = () => {
    if (money < bet) {
      setMessage("Not enough money!");
      return;
    }

    setMoney(money - bet);
    const newDeck = initializeDeck();
    setDeck(newDeck);
    
    const initialPlayerHand = [newDeck[0], newDeck[1]];
    const initialDealerHand = [newDeck[2]];
    
    setPlayerHand(initialPlayerHand);
    setDealerHand(initialDealerHand);
    setDeck(newDeck.slice(3));
    setGameState('playing');
    setMessage('');
  };

  // Hit
  const hit = () => {
    const card = drawCard();
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    
    if (calculateHand(newHand) > 21) {
      setGameState('gameOver');
      setMessage('Bust! You lose!');
    }
  };

  // Stand
  const stand = () => {
    setGameState('dealerTurn');
  };

  // Dealer's turn
  useEffect(() => {
    if (gameState === 'dealerTurn') {
      const dealerPlay = async () => {
        let currentHand = [...dealerHand];
        
        while (calculateHand(currentHand) < 17) {
          const card = deck[0];
          currentHand.push(card);
          setDealerHand(currentHand);
          setDeck(deck.slice(1));
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        const dealerValue = calculateHand(currentHand);
        const playerValue = calculateHand(playerHand);

        if (dealerValue > 21) {
          setMessage('Dealer busts! You win!');
          setMoney(money + bet * 2);
        } else if (dealerValue > playerValue) {
          setMessage('Dealer wins!');
        } else if (dealerValue < playerValue) {
          setMessage('You win!');
          setMoney(money + bet * 2);
        } else {
          setMessage('Push!');
          setMoney(money + bet);
        }
        
        setGameState('gameOver');
      };

      dealerPlay();
    }
  }, [gameState, dealerHand, deck]);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] blackjack-overlay" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div className="p-8 rounded-lg shadow-lg max-w-2xl w-full blackjack-table">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl text-yellow-300 font-bold tracking-wider">Blackjack</h2>
          <button 
            className="text-gray-300 hover:text-red-400 game-button"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-yellow-200">Money: ${money}</p>
          {gameState === 'betting' && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={bet}
                onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-20 px-2 py-1 rounded bet-input text-yellow-200"
                min="1"
              />
              <button
                className="bg-purple-700 text-yellow-200 px-4 py-2 rounded hover:bg-purple-600 game-button"
                onClick={startGame}
              >
                Place Bet
              </button>
            </div>
          )}
        </div>

        {gameState !== 'betting' && (
          <>
            <div className="mb-6">
              <h3 className="text-yellow-200 mb-2">Dealer's Hand ({calculateHand(dealerHand)})</h3>
              <div className="flex gap-2">
                {dealerHand.map((card, index) => (
                  <div key={index} className={`bg-white p-2 rounded card dealing ${card.suit === '♥' || card.suit === '♦' ? 'red' : 'black'}`} style={{animationDelay: `${index * 0.1}s`}}>
                    {card.value}{card.suit}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-yellow-200 mb-2">Your Hand ({calculateHand(playerHand)})</h3>
              <div className="flex gap-2">
                {playerHand.map((card, index) => (
                  <div key={index} className={`bg-white p-2 rounded card dealing ${card.suit === '♥' || card.suit === '♦' ? 'red' : 'black'}`} style={{animationDelay: `${index * 0.1}s`}}>
                    {card.value}{card.suit}
                  </div>
                ))}
              </div>
            </div>

            {gameState === 'playing' && (
              <div className="flex gap-2">
                <button
                  className="bg-emerald-600 text-yellow-200 px-6 py-2 rounded hover:bg-emerald-500 game-button"
                  onClick={hit}
                >
                  Hit
                </button>
                <button
                  className="bg-rose-700 text-yellow-200 px-6 py-2 rounded hover:bg-rose-600 game-button"
                  onClick={stand}
                >
                  Stand
                </button>
              </div>
            )}

            {message && (
              <div className="mt-4">
                <p className={`text-yellow-200 text-xl message ${message.includes('win') ? 'win-effect' : message.includes('lose') ? 'lose-effect' : ''}`}>
                  {message}
                </p>
                {gameState === 'gameOver' && (
                  <button
                    className="mt-2 bg-purple-700 text-yellow-200 px-4 py-2 rounded hover:bg-purple-600 game-button"
                    onClick={() => setGameState('betting')}
                  >
                    Play Again
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlackjackGame; 