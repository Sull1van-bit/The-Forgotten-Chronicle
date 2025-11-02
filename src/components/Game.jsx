import React, { useState, useEffect } from 'react';
import '../styles/Game.css';
import playerStand from '../assets/Character/player-a-stand.gif';
import playerWalkUp from '../assets/Character/player-a-wu.gif';
import playerWalkDown from '../assets/Character/player-a-wd.gif';
import playerWalkLeft from '../assets/Character/player-a-wl.gif';
import playerWalkRight from '../assets/Character/player-a-wr.gif';

// Definisikan collision map menggunakan koordinat grid
const COLLISION_MAP = [
  // Collision untuk x=30
  { x:29,  y:12  },
  { x: 30, y: 0 },
  { x: 30, y: 1 },
  { x: 30, y: 2 },
  { x: 30, y: 3 },
  { x: 30, y: 4 },
  { x: 30, y: 5 },
  { x: 30, y: 6 },
  { x: 30, y: 7 },
  { x: 30, y: 8 },
  { x: 30, y: 9 },
  { x: 30, y: 10 },
  { x: 30, y: 11 },
  { x: 30, y: 12 },
  // Collision untuk x=31
  { x: 31, y: 0 },
  { x: 31, y: 1 },
  { x: 31, y: 2 },
  { x: 31, y: 3 },
  { x: 31, y: 4 },
  { x: 31, y: 5 },
  { x: 31, y: 6 },
  { x: 31, y: 7 },
  { x: 31, y: 8 },
  { x: 31, y: 9 },
  { x: 31, y: 10 },
  { x: 31, y: 11 },
  { x: 31, y: 12 },
];

const Game = () => {
  const [position, setPosition] = useState({ x: 1200, y: 1200 }); // Center of 2400x2400 map
  const [facing, setFacing] = useState('stand');
  const speed = 10;
  const scale = 1.2;
  const GRID_SIZE = 40;
  const GRID_COLS = 60; // 2400/40 = 60
  const GRID_ROWS = 60; // 2400/40 = 60

  // Convert pixel position to grid position
  const getGridPosition = (x, y) => ({
    gridX: Math.floor(x / GRID_SIZE),
    gridY: Math.floor(y / GRID_SIZE)
  });

  // Check if a position has collision
  const hasCollision = (x, y) => {
    const { gridX, gridY } = getGridPosition(x, y);
    return COLLISION_MAP.some(point => point.x === gridX && point.y === gridY);
  };

  const getSprite = () => {
    switch (facing) {
      case 'up':
        return playerWalkUp;
      case 'down':
        return playerWalkDown;
      case 'left':
        return playerWalkLeft;
      case 'right':
        return playerWalkRight;
      default:
        return playerStand;
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      let newX = position.x;
      let newY = position.y;

      switch (e.key.toLowerCase()) {
        case 'w':
          newY = position.y - speed;
          if (!hasCollision(newX, newY)) {
            setFacing('up');
            setPosition(prev => ({ 
              ...prev, 
              y: Math.max(0, newY)
            }));
          }
          break;
        case 's':
          newY = position.y + speed;
          if (!hasCollision(newX, newY)) {
            setFacing('down');
            setPosition(prev => ({ 
              ...prev, 
              y: Math.min(2400 - GRID_SIZE, newY)
            }));
          }
          break;
        case 'a':
          newX = position.x - speed;
          if (!hasCollision(newX, newY)) {
            setFacing('left');
            setPosition(prev => ({ 
              ...prev, 
              x: Math.max(0, newX)
            }));
          }
          break;
        case 'd':
          newX = position.x + speed;
          if (!hasCollision(newX, newY)) {
            setFacing('right');
            setPosition(prev => ({ 
              ...prev, 
              x: Math.min(2400 - GRID_SIZE, newX)
            }));
          }
          break;
        default:
          break;
      }
    };

    const handleKeyUp = () => {
      setFacing('stand');
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [position]);

  const getCameraStyle = () => {
    const x = position.x;
    const y = position.y;
    
    return {
      transform: `
        translate(${-x + window.innerWidth / 2}px, ${-y + window.innerHeight / 2}px)
        scale(${scale})
      `
    };
  };

  const renderGrid = () => {
    const cells = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const isCollision = COLLISION_MAP.some(point => point.x === col && point.y === row);
        cells.push(
          <div
            key={`${row}-${col}`}
            className={`grid-cell ${isCollision ? 'collision' : ''}`}
            title={`${col},${row}`}
          >
            {`${col},${row}`}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="game-container">
      <div className="camera">
        <div className="map" style={getCameraStyle()}>
          <div className="grid">
            {renderGrid()}
          </div>
          <div
            className="player"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              backgroundImage: `url(${getSprite()})`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Game; 