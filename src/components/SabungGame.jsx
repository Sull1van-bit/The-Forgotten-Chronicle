import React, { useState, useEffect, useRef } from 'react';
import { useSound } from '../context/SoundContext';

// Import chicken sprites
import chickenSpriteDefault from '../assets/sabung/Chicken_Sprite_Sheet.png';
import chickenSpriteBlack from '../assets/sabung/Chicken_Sprite_Sheet_Black.png';
import chickenSpriteDarkBrown from '../assets/sabung/Chicken_Sprite_Sheet_Dark_Brown.png';
import chickenSpriteLightBrown from '../assets/sabung/Chicken_Sprite_Sheet_Light_Brown.png';

const SabungGame = ({ onClose, money, setMoney }) => {
  const { playClick, playHover, playCash } = useSound();

  // Game states
  const [gamePhase, setGamePhase] = useState('betting'); // 'betting', 'fighting', 'result'
  const [betAmount, setBetAmount] = useState(10);
  const [selectedChicken, setSelectedChicken] = useState(null);
  const [playerChicken, setPlayerChicken] = useState(null);
  const [opponentChicken, setOpponentChicken] = useState(null);
  const [fightResult, setFightResult] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [opponentHealth, setOpponentHealth] = useState(100);
  const [currentRound, setCurrentRound] = useState(1);
  const [fightLog, setFightLog] = useState([]);

  // Animation refs
  const playerChickenRef = useRef(null);
  const opponentChickenRef = useRef(null);

  // Chicken types with stats
  const chickenTypes = [
    {
      id: 'default',
      name: 'Rambo',
      sprite: chickenSpriteDefault,
      attack: 15,
      defense: 12,
      speed: 10,
      color: '#D2691E'
    },
    {
      id: 'black',
      name: 'Udin',
      sprite: chickenSpriteBlack,
      attack: 18,
      defense: 8,
      speed: 14,
      color: '#2F2F2F'
    },
    {
      id: 'darkbrown',
      name: 'Nopal',
      sprite: chickenSpriteDarkBrown,
      attack: 12,
      defense: 18,
      speed: 8,
      color: '#8B4513'
    },
    {
      id: 'lightbrown',
      name: 'Asep',
      sprite: chickenSpriteLightBrown,
      attack: 16,
      defense: 10,
      speed: 12,
      color: '#DAA520'
    }
  ];

  // Initialize opponent chicken randomly
  useEffect(() => {
    const randomOpponent = chickenTypes[Math.floor(Math.random() * chickenTypes.length)];
    setOpponentChicken(randomOpponent);
  }, []);

  // Handle chicken selection
  const handleChickenSelect = (chicken) => {
    if (gamePhase !== 'betting') return;
    setSelectedChicken(chicken);
    setPlayerChicken(chicken);
    playClick();
  };
  // Handle bet amount change
  const handleBetChange = (amount) => {
    if (gamePhase !== 'betting') return;
    const newBet = Math.max(5, Math.min(money, betAmount + amount));
    setBetAmount(newBet);
    playClick();
  };

  // Start the fight
  const startFight = () => {
    if (!selectedChicken || betAmount > money) return;
    
    setMoney(prev => prev - betAmount);
    setGamePhase('fighting');
    setPlayerHealth(100);
    setOpponentHealth(100);
    setCurrentRound(1);
    setFightLog([]);
    setIsAnimating(true);
    
    // Start the fighting sequence
    setTimeout(() => {
      fightSequence();
    }, 1000);
  };
  // Fight sequence
  const fightSequence = () => {
    let pHealth = 100;
    let oHealth = 100;
    let log = [];
    let round = 1;

    const simulateRound = () => {
      if (pHealth <= 0 || oHealth <= 0) {
        // Fight is over
        const playerWins = pHealth > oHealth;
        const isDraw = pHealth === oHealth;
        
        let result;
        let winnings = 0;
        
        if (isDraw) {
          result = 'draw';
          winnings = betAmount; // Return bet
        } else if (playerWins) {
          result = 'win';
          winnings = betAmount * 2; // Double the bet
        } else {
          result = 'lose';
          winnings = 0; // Lose the bet
        }
        
        setFightResult(result);
        setMoney(prev => prev + winnings);
        setGamePhase('result');
        setIsAnimating(false);
        
        if (result === 'win') {
          playCash();
        }
        
        return;
      }

      // Calculate damage based on stats
      const playerDamage = Math.max(1, playerChicken.attack - opponentChicken.defense + Math.random() * 10);
      const opponentDamage = Math.max(1, opponentChicken.attack - playerChicken.defense + Math.random() * 10);

      // Apply damage
      oHealth = Math.max(0, oHealth - playerDamage);
      pHealth = Math.max(0, pHealth - opponentDamage);

      // Add to log
      log.push(`Round ${round}: ${playerChicken.name} deals ${Math.round(playerDamage)} damage!`);
      log.push(`Round ${round}: ${opponentChicken.name} deals ${Math.round(opponentDamage)} damage!`);

      setPlayerHealth(pHealth);
      setOpponentHealth(oHealth);
      setCurrentRound(round);
      setFightLog([...log]);

      // Animate chickens
      animateChickens();

      round++;
      setTimeout(simulateRound, 1500);
    };

    simulateRound();
  };  // Animate chicken attacks with shake effect based on attack power
  const animateChickens = () => {
    // Calculate shake intensity based on attack power (higher attack = more shake)
    const playerShakeIntensity = Math.min(playerChicken.attack * 0.8, 15); // Cap at 15px
    const opponentShakeIntensity = Math.min(opponentChicken.attack * 0.8, 15); // Cap at 15px
    
    if (playerChickenRef.current) {
      // Player chicken attack animation with shake
      playerChickenRef.current.style.transform = 'scaleX(-1) translateX(20px) scale(1.1)';
      
      // Add shake effect to opponent based on player attack
      if (opponentChickenRef.current) {
        const shakeKeyframes = [
          { transform: `translateX(${playerShakeIntensity}px)` },
          { transform: `translateX(-${playerShakeIntensity}px)` },
          { transform: `translateX(${playerShakeIntensity * 0.7}px)` },
          { transform: `translateX(-${playerShakeIntensity * 0.7}px)` },
          { transform: 'translateX(0)' }
        ];
        
        opponentChickenRef.current.animate(shakeKeyframes, {
          duration: 400,
          easing: 'ease-out'
        });
      }
      
      setTimeout(() => {
        if (playerChickenRef.current) {
          playerChickenRef.current.style.transform = 'scaleX(-1) translateX(0) scale(1)';
        }
      }, 300);
    }

    setTimeout(() => {
      if (opponentChickenRef.current) {
        // Opponent chicken attack animation with shake
        opponentChickenRef.current.style.transform = 'translateX(-20px) scale(1.1)';
        
        // Add shake effect to player based on opponent attack
        if (playerChickenRef.current) {
          const shakeKeyframes = [
            { transform: `scaleX(-1) translateX(${opponentShakeIntensity}px)` },
            { transform: `scaleX(-1) translateX(-${opponentShakeIntensity}px)` },
            { transform: `scaleX(-1) translateX(${opponentShakeIntensity * 0.7}px)` },
            { transform: `scaleX(-1) translateX(-${opponentShakeIntensity * 0.7}px)` },
            { transform: 'scaleX(-1) translateX(0)' }
          ];
          
          playerChickenRef.current.animate(shakeKeyframes, {
            duration: 400,
            easing: 'ease-out'
          });
        }
        
        setTimeout(() => {
          if (opponentChickenRef.current) {
            opponentChickenRef.current.style.transform = 'translateX(0) scale(1)';
          }
        }, 300);
      }
    }, 600); // Stagger the opponent attack
  };

  // Reset game
  const resetGame = () => {
    setGamePhase('betting');
    setSelectedChicken(null);
    setPlayerChicken(null);
    setFightResult(null);
    setBetAmount(10);
    setPlayerHealth(100);
    setOpponentHealth(100);
    setCurrentRound(1);
    setFightLog([]);
    setIsAnimating(false);
    
    // Generate new opponent
    const randomOpponent = chickenTypes[Math.floor(Math.random() * chickenTypes.length)];
    setOpponentChicken(randomOpponent);
  };  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div className="bg-[#8B4513] rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] border-4 border-[#D2B48C] overflow-hidden">
        <div className="overflow-y-auto max-h-[90vh] p-6">
          <style dangerouslySetInnerHTML={{
            __html: `
              input[type="number"]::-webkit-outer-spin-button,
              input[type="number"]::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
              }
            `
          }} />
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl text-[#F5DEB3] font-bold tracking-wider">Sabung Ayam</h2>
            <button 
              className="text-[#F5DEB3] hover:text-red-400 text-2xl font-bold transition-colors"
              onClick={() => {
                playClick();
                onClose();
              }}
              onMouseEnter={playHover}
            >
              ✕
            </button>
          </div>

        {/* Money Display */}
        <div className="mb-4 text-center">
          <span className="text-[#F5DEB3] text-xl font-bold">Money: {money} coins</span>
        </div>

        {/* Betting Phase */}
        {gamePhase === 'betting' && (
          <div className="space-y-6">            {/* Chicken Selection */}
            <div>
              <h3 className="text-[#F5DEB3] text-xl font-bold mb-4 text-center">Choose Your Fighter</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {chickenTypes.map((chicken) => (
                  <div
                    key={chicken.id}
                    className={`bg-[#A0522D] p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 flex-shrink-0 ${
                      selectedChicken?.id === chicken.id
                        ? 'border-[#F5DEB3] bg-[#D2B48C]'
                        : 'border-[#D2B48C] hover:border-[#F5DEB3]'
                    }`}
                    onClick={() => handleChickenSelect(chicken)}
                    onMouseEnter={playHover}
                    style={{ width: '120px' }}
                  >
                    <div className="text-center">                      <div
                        className="w-12 h-12 mx-auto mb-3 bg-no-repeat overflow-hidden rounded"
                        style={{
                          backgroundImage: `url(${chicken.sprite})`,
                          backgroundPosition: '0 0',
                          backgroundSize: 'contain',
                          imageRendering: 'pixelated',
                        }}
                      />
                      <h4 className="text-[#F5DEB3] font-bold text-sm">{chicken.name}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>            {/* Betting */}
            <div className="text-center">
              <h3 className="text-[#F5DEB3] text-xl font-bold mb-4">Place Your Bet</h3>              <div className="flex items-center justify-center gap-4 mb-4">                <button
                  className="bg-[#8B4513] text-[#F5DEB3] px-4 py-2 rounded border-2 border-[#D2B48C] hover:bg-[#A0522D] hover:border-[#F5DEB3] transition-all"
                  onClick={() => handleBetChange(-1)}
                  onMouseEnter={playHover}
                >
                  -
                </button><input
                  type="number"
                  min="5"
                  max={money}
                  value={betAmount}
                  onChange={(e) => {
                    const value = Math.max(5, Math.min(money, parseInt(e.target.value) || 5));
                    setBetAmount(value);
                  }}
                  className="bg-[#A0522D] text-[#F5DEB3] text-2xl font-bold text-center border-2 border-[#D2B48C] rounded px-4 py-2 w-24 focus:outline-none focus:border-[#F5DEB3]"
                  style={{
                    MozAppearance: 'textfield'
                  }}
                  onWheel={(e) => e.target.blur()}
                />                <button
                  className="bg-[#8B4513] text-[#F5DEB3] px-4 py-2 rounded border-2 border-[#D2B48C] hover:bg-[#A0522D] hover:border-[#F5DEB3] transition-all"
                  onClick={() => handleBetChange(1)}
                  onMouseEnter={playHover}
                >
                  +
                </button>
              </div>
              <button
                className={`bg-[#8B4513] text-[#F5DEB3] px-8 py-3 rounded border-4 border-[#D2B48C] font-bold text-lg transition-all ${
                  selectedChicken && betAmount <= money
                    ? 'hover:bg-[#A0522D] hover:border-[#F5DEB3] hover:scale-105 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={startFight}
                onMouseEnter={selectedChicken && betAmount <= money ? playHover : undefined}
                disabled={!selectedChicken || betAmount > money}
              >
                Start Fight!
              </button>
            </div>
          </div>
        )}        {/* Fighting Phase */}
        {gamePhase === 'fighting' && (
          <div className="space-y-6">
            {/* Fighting Arena */}
            <div className="bg-[#A0522D] p-6 rounded-lg border-2 border-[#D2B48C]">
              <div className="flex justify-between items-center">                {/* Player Chicken */}                <div className="text-center">                  <div
                    ref={playerChickenRef}
                    className="w-20 h-20 mx-auto mb-2 bg-no-repeat transition-transform duration-300 overflow-hidden rounded"
                    style={{
                      backgroundImage: `url(${playerChicken.sprite})`,
                      backgroundPosition: '0 0',
                      backgroundSize: 'contain',
                      imageRendering: 'pixelated',
                      transform: 'scaleX(-1)', // Flip to face the opponent
                    }}
                  />
                  <h4 className="text-[#F5DEB3] font-bold">{playerChicken.name}</h4>
                  <div className="w-32 h-4 bg-gray-700 rounded overflow-hidden mt-2">
                    <div 
                      className="h-full bg-green-500 transition-all duration-500" 
                      style={{ width: `${playerHealth}%` }}
                    />
                  </div>
                  <span className="text-[#F5DEB3] text-sm">{Math.round(playerHealth)}/100</span>
                </div>

                {/* VS */}
                <div className="text-[#F5DEB3] text-3xl font-bold">VS</div>                {/* Opponent Chicken */}                <div className="text-center">                  <div
                    ref={opponentChickenRef}
                    className="w-20 h-20 mx-auto mb-2 bg-no-repeat transition-transform duration-300 overflow-hidden rounded"
                    style={{
                      backgroundImage: `url(${opponentChicken.sprite})`,
                      backgroundPosition: '0 0',
                      backgroundSize: 'contain',
                      imageRendering: 'pixelated',
                    }}
                  />
                  <h4 className="text-[#F5DEB3] font-bold">{opponentChicken.name}</h4>
                  <div className="w-32 h-4 bg-gray-700 rounded overflow-hidden mt-2">
                    <div 
                      className="h-full bg-red-500 transition-all duration-500" 
                      style={{ width: `${opponentHealth}%` }}
                    />
                  </div>
                  <span className="text-[#F5DEB3] text-sm">{Math.round(opponentHealth)}/100</span>
                </div>
              </div>            </div>
          </div>
        )}

        {/* Result Phase */}
        {gamePhase === 'result' && (
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-[#F5DEB3] text-3xl font-bold mb-4">
                {fightResult === 'win' && '🎉 Victory! 🎉'}
                {fightResult === 'lose' && '💔 Defeat 💔'}
                {fightResult === 'draw' && '🤝 Draw 🤝'}
              </h3>
              
              <div className="text-[#F5DEB3] text-xl mb-4">
                {fightResult === 'win' && `You won ${betAmount * 2} coins!`}
                {fightResult === 'lose' && `You lost ${betAmount} coins.`}
                {fightResult === 'draw' && `Your bet of ${betAmount} coins was returned.`}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                className="bg-[#8B4513] text-[#F5DEB3] px-6 py-3 rounded border-4 border-[#D2B48C] hover:bg-[#A0522D] hover:border-[#F5DEB3] hover:scale-105 transition-all duration-200 font-bold"
                onClick={resetGame}
                onMouseEnter={playHover}
              >
                Play Again
              </button>
              <button
                className="bg-[#8B4513] text-[#F5DEB3] px-6 py-3 rounded border-4 border-[#D2B48C] hover:bg-[#A0522D] hover:border-[#F5DEB3] hover:scale-105 transition-all duration-200 font-bold"
                onClick={() => {
                  playClick();
                  onClose();
                }}
                onMouseEnter={playHover}
              >
                Exit
              </button>            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default SabungGame;
