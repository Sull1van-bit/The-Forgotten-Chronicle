import React, { useState, useEffect } from 'react';
import '../../styles/Game.css';
import playerStand from '../../assets/Character/player-a-stand.gif';
import playerWalkUp from '../../assets/Character/player-a-wu.gif';
import playerWalkDown from '../../assets/Character/player-a-wd.gif';
import playerWalkLeft from '../../assets/Character/player-a-wl.gif';
import playerWalkRight from '../../assets/Character/player-a-wr.gif';
import allMap from '../../assets/maps/all-map.png';

// Define collision points using grid coordinates
const COLLISION_MAP = [
  // Vertical wall
  { x: 10, y: 5 },
  { x: 10, y: 6 },
  { x: 10, y: 7 },
  { x: 10, y: 8 },
  { x: 10, y: 9 },
  
  // Horizontal wall
  { x: 11, y: 5 },
  { x: 12, y: 5 },
  { x: 13, y: 5 },
  { x: 14, y: 5 },
  { x: 15, y: 5 },
];

const Game = () => {
  const [position, setPosition] = useState({ x: 350, y: 150 });
  const [facing, setFacing] = useState('stand');
  const speed = 5;
  const scale = 1.2;
  const GRID_SIZE = 40;
  const PLAYER_SIZE = 40;
  const MAP_WIDTH = 2400;
  const MAP_HEIGHT = 1800;
  const GRID_COLS = Math.floor(MAP_WIDTH / GRID_SIZE);
  const GRID_ROWS = Math.floor(MAP_HEIGHT / GRID_SIZE);

  // Convert pixel position to grid coordinates
  const getGridPosition = (x, y) => ({
    gridX: Math.floor(x / GRID_SIZE),
    gridY: Math.floor(y / GRID_SIZE)
  });

  // Check if any corner of the player collides with a collision point
  const hasCollision = (x, y) => {
    // Check all four corners of the player
    const corners = [
      { x: x, y: y }, // Top-left
      { x: x + PLAYER_SIZE - 1, y: y }, // Top-right
      { x: x, y: y + PLAYER_SIZE - 1 }, // Bottom-left
      { x: x + PLAYER_SIZE - 1, y: y + PLAYER_SIZE - 1 } // Bottom-right
    ];

    return corners.some(corner => {
      const { gridX, gridY } = getGridPosition(corner.x, corner.y);
      return COLLISION_MAP.some(point => point.x === gridX && point.y === gridY);
    });
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
              y: Math.min(MAP_HEIGHT - PLAYER_SIZE, newY)
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
              x: Math.min(MAP_WIDTH - PLAYER_SIZE, newX)
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
            style={{
              left: col * GRID_SIZE,
              top: row * GRID_SIZE,
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

  return (
    <div className="game-container">
      <div className="camera">
        <div className="map" style={getCameraStyle()}>
          <div 
            className="map-background"
            style={{
              width: `${MAP_WIDTH}px`,
              height: `${MAP_HEIGHT}px`,
              backgroundImage: `url(${allMap})`,
              backgroundSize: '100% 100%',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
          <div className="grid" style={{ width: `${MAP_WIDTH}px`, height: `${MAP_HEIGHT}px` }}>
            {renderGrid()}
          </div>
          <div
            className="player"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${PLAYER_SIZE}px`,
              height: `${PLAYER_SIZE}px`,
              backgroundImage: `url(${getSprite()})`,
              backgroundSize: 'contain',
              position: 'absolute',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Game; 