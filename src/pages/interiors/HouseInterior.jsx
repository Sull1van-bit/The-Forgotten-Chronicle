import React, { useState, useEffect } from 'react';
import houseInside from '../../assets/Interior/house-inside.png';
import louiseStand from '../../assets/characters/louise/stand.gif';
import louiseWalkUp from '../../assets/characters/louise/walk-up.gif';
import louiseWalkDown from '../../assets/characters/louise/walk-down.gif';
import louiseWalkLeft from '../../assets/characters/louise/walk-left.gif';
import louiseWalkRight from '../../assets/characters/louise/walk-right.gif';

// Define collision points for interior
const INTERIOR_COLLISION_MAP = [
  // Dinding atas
  ...Array.from({ length: 8 }, (_, i) => ({ x: i, y: 0, type: 'full' })),
  ...Array.from({ length: 8 }, (_, i) => ({ x: i, y: 1, type: 'half-top' })),
  
  // Dinding bawah
  ...Array.from({ length: 5 }, (_, i) => ({ x: i, y: 5, type: 'half-bottom' })),
  {x: 6, y: 5, type: 'full'},
  // Dinding kiri
  ...Array.from({ length: 6 }, (_, i) => ({ x: 0, y: i, type: 'half-left' })),
  {x: 0, y: 6, type: 'full'},
  
  // Dinding kanan
  ...Array.from({ length: 6 }, (_, i) => ({ x: 7, y: i, type: 'half-right' })),
  {x: 7, y: 6, type: 'full'},
];

const HouseInterior = ({ position, setPosition, onExit, character }) => {
  const [facing, setFacing] = useState('stand');
  const INTERIOR_WIDTH = 800;
  const INTERIOR_HEIGHT = 600;
  const GRID_SIZE = 100;
  const PLAYER_SIZE = 26;
  const GRID_COLS = Math.floor(INTERIOR_WIDTH / GRID_SIZE);
  const GRID_ROWS = Math.floor(INTERIOR_HEIGHT / GRID_SIZE);

  // Status effects states (mirroring Game.jsx)
  const [health, setHealth] = useState(100);
  const [energy, setEnergy] = useState(100);
  const [hunger, setHunger] = useState(100);
  const [happiness, setHappiness] = useState(100);
  const [money, setMoney] = useState(0);
  const [showSleepButton, setShowSleepButton] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);

  // Status effects decay over time (same as Game.jsx)
  useEffect(() => {
    const decayInterval = setInterval(() => {
      if (!isSleeping) { // Pause decay while sleeping
        setHealth(prev => Math.max(0, prev - 0.1));
        setEnergy(prev => Math.max(0, prev - 0.2));
        setHunger(prev => Math.max(0, prev - 0.3));
        setHappiness(prev => Math.max(0, prev - 0.1));
      }
    }, 1000);

    return () => clearInterval(decayInterval);
  }, [isSleeping]);

  // Affect happiness based on hunger and health (same as Game.jsx)
  useEffect(() => {
    if (hunger < 30 || health < 30) {
      setHappiness(prev => Math.max(0, prev - 0.5));
    }
  }, [hunger, health]);

  // Define the sleep area (e.g., near a bed at grid position 2,2)
  const SLEEP_AREA = { x: 2, y: 2 };
  const SLEEP_AREA_PIXEL = { x: SLEEP_AREA.x * GRID_SIZE, y: SLEEP_AREA.y * GRID_SIZE };

  // Check if the player is near the sleep area
  const checkSleepProximity = (x, y) => {
    const playerCenterX = x + (PLAYER_SIZE / 2);
    const playerCenterY = y + (PLAYER_SIZE / 2);
    const sleepCenterX = SLEEP_AREA_PIXEL.x + (GRID_SIZE / 2);
    const sleepCenterY = SLEEP_AREA_PIXEL.y + (GRID_SIZE / 2);
    const distance = Math.sqrt(
      Math.pow(playerCenterX - sleepCenterX, 2) + Math.pow(playerCenterY - sleepCenterY, 2)
    );
    setShowSleepButton(distance < GRID_SIZE); // Show button if within 1 grid square
  };

  // Handle sleep action
  const handleSleep = () => {
    setIsSleeping(true);
    setTimeout(() => {
      // Restore energy and happiness after 3 seconds
      setEnergy(prev => Math.min(100, prev + 50)); // Restore 50 energy
      setHappiness(prev => Math.min(100, prev + 30)); // Restore 30 happiness
      setHunger(prev => Math.max(0, prev - 10)); // Hunger decreases while sleeping
      setIsSleeping(false);
    }, 3000);
  };

  // Get character-specific sprites
  const getCharacterSprites = () => {
    switch (character.name.toLowerCase()) {
      case 'eugene':
        return {
          stand: eugeneStand,
          walkUp: eugeneWalkUp,
          walkDown: eugeneWalkDown,
          walkLeft: eugeneWalkLeft,
          walkRight: eugeneWalkRight
        };
      case 'alex':
        return {
          stand: alexStand,
          walkUp: alexWalkUp,
          walkDown: alexWalkDown,
          walkLeft: alexWalkLeft,
          walkRight: alexWalkRight
        };
      case 'louise':
        return {
          stand: louiseStand,
          walkUp: louiseWalkUp,
          walkDown: louiseWalkDown,
          walkLeft: louiseWalkLeft,
          walkRight: louiseWalkRight
        };
      default:
        return {
          stand: eugeneStand,
          walkUp: eugeneWalkUp,
          walkDown: eugeneWalkDown,
          walkLeft: eugeneWalkLeft,
          walkRight: eugeneWalkRight
        };
    }
  };

  const characterSprites = getCharacterSprites();

  const getSprite = () => {
    switch (facing) {
      case 'up':
        return characterSprites.walkUp;
      case 'down':
        return characterSprites.walkDown;
      case 'left':
        return characterSprites.walkLeft;
      case 'right':
        return characterSprites.walkRight;
      default:
        return characterSprites.stand;
    }
  };

  // Check collision based on type
  const checkCollision = (playerX, playerY, collisionPoint) => {
    const gridX = collisionPoint.x * GRID_SIZE;
    const gridY = collisionPoint.y * GRID_SIZE;
    const playerCenterX = playerX + (PLAYER_SIZE / 2);
    const playerCenterY = playerY + (PLAYER_SIZE / 2);

    switch (collisionPoint.type) {
      case 'full':
        return (
          playerX < gridX + GRID_SIZE &&
          playerX + PLAYER_SIZE > gridX &&
          playerY < gridY + GRID_SIZE &&
          playerY + PLAYER_SIZE > gridY
        );

      case 'half-top':
        return (
          playerX < gridX + GRID_SIZE &&
          playerX + PLAYER_SIZE > gridX &&
          playerY < gridY + (GRID_SIZE / 2) &&
          playerY + PLAYER_SIZE > gridY
        );

      case 'half-bottom':
        return (
          playerX < gridX + GRID_SIZE &&
          playerX + PLAYER_SIZE > gridX &&
          playerY < gridY + GRID_SIZE &&
          playerY + PLAYER_SIZE > gridY + (GRID_SIZE / 2)
        );

      case 'half-left':
        return (
          playerX < gridX + (GRID_SIZE / 2) &&
          playerX + PLAYER_SIZE > gridX &&
          playerY < gridY + GRID_SIZE &&
          playerY + PLAYER_SIZE > gridY
        );

      case 'half-right':
        return (
          playerX < gridX + GRID_SIZE &&
          playerX + PLAYER_SIZE > gridX + (GRID_SIZE / 2) &&
          playerY < gridY + GRID_SIZE &&
          playerY + PLAYER_SIZE > gridY
        );

      default:
        return false;
    }
  };

  // Check if any collision occurs
  const hasCollision = (x, y) => {
    return INTERIOR_COLLISION_MAP.some(point => checkCollision(x, y, point));
  };

  // Handle exit point (door) collision
  const checkExitPoint = (x, y) => {
    const exitPoint = { x: 5, y: 5 };
    const playerGridPos = {
      x: Math.floor(x / GRID_SIZE),
      y: Math.floor(y / GRID_SIZE)
    };

    if (playerGridPos.x === exitPoint.x && playerGridPos.y === exitPoint.y) {
      onExit({ x: 6, y: 2 });
    }
  };

  const renderGrid = () => {
    const cells = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const isExitPoint = col === 5 && row === 5;
        const isSleepArea = col === SLEEP_AREA.x && row === SLEEP_AREA.y;
        const collisionPoint = INTERIOR_COLLISION_MAP.find(point => point.x === col && point.y === row);
        const collisionClass = collisionPoint ? `collision ${collisionPoint.type}` : '';
        
        cells.push(
          <div
            key={`${row}-${col}`}
            className={`grid-cell ${collisionClass} ${isExitPoint ? 'teleport' : ''} ${isSleepArea ? 'sleep-area' : ''}`}
            style={{
              left: col * GRID_SIZE,
              top: row * GRID_SIZE,
              width: GRID_SIZE,
              height: GRID_SIZE,
              position: 'absolute',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.3)',
              fontSize: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={`${col},${row}`}
          >
            {`${col},${row}`}
          </div>
        );
      }
    }
    return cells;
  };

  // Handle movement with collision check
  const handleKeyPress = (e) => {
    if (isSleeping) return; // Prevent movement while sleeping

    let newX = position.x;
    let newY = position.y;
    const speed = 20;
    const energyCost = 0.5;

    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        newY = Math.max(0, position.y - speed);
        setFacing('up');
        setEnergy(prev => Math.max(0, prev - energyCost));
        break;
      case 's':
      case 'arrowdown':
        newY = Math.min(INTERIOR_HEIGHT - PLAYER_SIZE, position.y + speed);
        setFacing('down');
        setEnergy(prev => Math.max(0, prev - energyCost));
        break;
      case 'a':
      case 'arrowleft':
        newX = Math.max(0, position.x - speed);
        setFacing('left');
        setEnergy(prev => Math.max(0, prev - energyCost));
        break;
      case 'd':
      case 'arrowright':
        newX = Math.min(INTERIOR_WIDTH - PLAYER_SIZE, position.x + speed);
        setFacing('right');
        setEnergy(prev => Math.max(0, prev - energyCost));
        break;
      default:
        return;
    }

    if (!hasCollision(newX, newY)) {
      checkExitPoint(newX, newY);
      setPosition({ x: newX, y: newY });
      checkSleepProximity(newX, newY);
    }
  };

  const handleKeyUp = (e) => {
    const movementKeys = ['w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
    if (movementKeys.includes(e.key.toLowerCase())) {
      setFacing('stand');
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [position, energy, isSleeping]);

  return (
    <div className="interior-container relative">
      {/* Status Effects UI (same as Game.jsx) */}
      <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 text-white">
        <div className="flex items-center gap-2">
          <span>❤️ Health: {Math.round(health)}</span>
          <div className="w-24 h-4 bg-gray-700 rounded">
            <div className="h-full bg-red-500 rounded" style={{ width: `${health}%` }}></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>⚡ Energy: {Math.round(energy)}</span>
          <div className="w-24 h-4 bg-gray-700 rounded">
            <div className="h-full bg-blue-500 rounded" style={{ width: `${energy}%` }}></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>🍽️ Hunger: {Math.round(hunger)}</span>
          <div className="w-24 h-4 bg-gray-700 rounded">
            <div className="h-full bg-yellow-500 rounded" style={{ width: `${hunger}%` }}></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>😊 Happiness: {Math.round(happiness)}</span>
          <div className="w-24 h-4 bg-gray-700 rounded">
            <div className="h-full bg-green-500 rounded" style={{ width: `${happiness}%` }}></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>💰 Money: {money}</span>
        </div>
      </div>

      {/* Sleep Button */}
      {showSleepButton && !isSleeping && (
        <button
          className="absolute z-50 bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600"
          style={{
            left: `${SLEEP_AREA_PIXEL.x + GRID_SIZE / 2}px`,
            top: `${SLEEP_AREA_PIXEL.y - 40}px`,
            transform: 'translateX(-50%)',
          }}
          onClick={handleSleep}
        >
          Sleep
        </button>
      )}

      {/* Sleep Indicator */}
      {isSleeping && (
        <div
          className="absolute z-50 bg-gray-800 text-white px-4 py-2 rounded shadow-lg"
          style={{
            left: `${SLEEP_AREA_PIXEL.x + GRID_SIZE / 2}px`,
            top: `${SLEEP_AREA_PIXEL.y - 40}px`,
            transform: 'translateX(-50%)',
          }}
        >
          Sleeping...
        </div>
      )}

      <div 
        className="interior"
        style={{
          width: `${INTERIOR_WIDTH}px`,
          height: `${INTERIOR_HEIGHT}px`,
          backgroundImage: `url(${houseInside})`,
          backgroundSize: '100% 100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="grid" style={{ position: 'absolute', width: '100%', height: '100%' }}>
          {renderGrid()}
        </div>
        <div
          className="player-interior"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: '26px',
            height: '26px',
            transform: 'scale(3.5)',
            backgroundImage: `url(${getSprite()})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            position: 'absolute',
            zIndex: 2,
            imageRendering: 'pixelated',
            transition: 'all 0.1s linear',
            transformOrigin: 'center',
          }}
        />
      </div>
    </div>
  );
};

export default HouseInterior;