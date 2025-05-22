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
  //kali diatas 30s (full collision)
  ...Array.from({ length: 10 }, (_, i) => ({ x: 30, y: i, type: 'full' })),
  ...Array.from({ length: 8 }, (_, i) => ({ x: 31, y: i, type: 'full' })),
  ...Array.from({ length: 3 }, (_, i) => ({ x: 32, y: i, type: 'full' })),

  // Contoh partial collision
  // { x: 33, y: 5, type: 'half-top' },    // Setengah atas
  // { x: 33, y: 6, type: 'half-bottom' }, // Setengah bawah
  // { x: 29, y: 7, type: 'half-right' },   // Setengah kiri
  // { x: 34, y: 6, type: 'half-left' },  // Setengah kanan


  { x: 29, y: 7, type: 'half-right' },   
  { x: 29, y: 8, type: 'half-right' },   
  { x: 29, y: 9, type: 'half-right' },   
  { x: 27, y: 44, type: 'half-left' },
  { x: 26, y: 43, type: 'half-left' },
  { x: 14, y: 37, type: 'half-bottom' },
  { x: 8, y: 35, type: 'half-left' },
  { x: 35, y: 36, type: 'half-right' },
  // { x: 30, y: 37, type: 'half-bottom' },
  // { x: 23, y: 42, type: 'half-left' },

  // ujung map
  ...Array.from({ length: 60 }, (_, i) => ({ x: i , y: 0, type: 'half-top' })), // atas
  ...Array.from({ length: 60 }, (_, i) => ({ x: i , y: 44, type: 'half-bottom' })), // bawah
  ...Array.from({ length: 60 }, (_, i) => ({ x: 59 , y: i, type: 'half-right' })), // kanan
  ...Array.from({ length: 60 }, (_, i) => ({ x: 0 , y: i, type: 'half-left' })), // kiri
// end ujung map


  // jembatan uhuy
  ...Array.from({ length: 3 }, (_, i) => ({ x: 41 , y: i+36, type: 'half-right' })),
  ...Array.from({ length: 3 }, (_, i) => ({ x: 39 , y: i+36, type: 'half-left' })),
  ...Array.from({ length: 3 }, (_, i) => ({ x: i+29 , y: 10, type: 'half-top'  })),
  ...Array.from({ length: 3 }, (_, i) => ({ x: i+29 , y: 11, type: 'half-bottom'  })),
  {x: 41, y: 22, type: 'half-right'},
  {x: 44, y: 23, type: 'half-top'},
  ...Array.from({ length: 2 }, (_, i) => ({ x: 42 , y: i+20, type: 'half-left'  })),
  ...Array.from({ length: 3 }, (_, i) => ({ x: 44 , y: i+20, type: 'half-right'  })),
  // end jembatan uhuy


  // buat danau + air (full collision)
  ...Array.from({ length: 3 }, (_, i) => ({ x: i+36 , y: 36, type: 'full' })),
  ...Array.from({ length: 8 }, (_, i) => ({ x: i+31 , y: 37, type: 'full' })),
  ...Array.from({ length: 3 }, (_, i) => ({ x: i +23, y: 42, type: 'half-bottom' })),
  ...Array.from({ length: 27 }, (_, i) => ({ x: i, y: 44, type: 'full' })),
  ...Array.from({ length: 26 }, (_, i) => ({ x: i, y: 43, type: 'full' })),
  ...Array.from({ length: 23 }, (_, i) => ({ x: i, y: 42, type: 'full' })),
  ...Array.from({ length: 22 }, (_, i) => ({ x: i, y: 41, type: 'full' })),
  ...Array.from({ length: 21 }, (_, i) => ({ x: i, y: 40, type: 'full' })),
  ...Array.from({ length: 27 }, (_, i) => ({ x: i, y: 39, type: 'full' })),
  ...Array.from({ length: 36 }, (_, i) => {
    if (i === 18 || i === 19) {
      return { x: i, y: 38, type: 'half-bottom' };
    }else if (i === 15 || i === 16 || i === 17) {
      return { x: i, y: 38, type: 'half-top' };
    }
    return { x: i, y: 38, type: 'full' };
  }).filter(Boolean),
  ...Array.from({ length: 14 }, (_, i) => ({ x: i, y: 37, type: 'full' })), 
  ...Array.from({ length: 10 }, (_, i) => ({ x: i, y: 36, type: 'full' })), 
  ...Array.from({ length: 10 }, (_, i) => ({ x: i, y: 36, type: 'full' })), 
  ...Array.from({ length: 6 }, (_, i) => ({ x: i+2, y: 35, type: 'full' })), 
  ...Array.from({ length: 6 }, (_, i) => ({ x: i+2, y: 35, type: 'full' })), 
  ...Array.from({ length: 3 }, (_, i) => ({ x: i+42, y: 37, type: 'half-top' })), 
  ...Array.from({ length: 7 }, (_, i) => ({ x: i+42, y: 35, type: i >= 3 ? 'full' : 'half-bottom' })), 
  ...Array.from({ length: 7 }, (_, i) => ({ x: 30, y: i+12, type: (i >= 4 && i <= 6) ? 'half-left' : 'full' })), 
  ...Array.from({ length: 8 }, (_, i) => ({ x: 31, y: i+12, type: (i >= 4 && i <= 8) ? 'full' : 'half-right' })), 
  ...Array.from({ length: 5 }, (_, i) => ({ x: 32, y: i+17, type: (i >= 4 && i <= 6) ? 'full' : 'half-right' })), 
  {x: 32, y: 16, type: 'half-left'},
  ...Array.from({ length: 4 }, (_, i) => ({ x: 29, y: i+12, type: 'half-right' })), 
  ...Array.from({ length: 3 }, (_, i) => ({ x: i+39, y: 20, type: 'half-top' })), 
  ...Array.from({ length: 7 }, (_, i) => ({ x: i+32, y: 20, type: (i >= 4 && i <= 8) ? 'half-top' : 'full' })), 
  ...Array.from({ length: 9 }, (_, i) => ({ x: i+33, y: 21, type: 'full' })), 
  ...Array.from({ length: 3 }, (_, i) => ({ x: i+33, y: 19, type: 'full' })), 
  
  {x: 45, y: 21, type: 'half-top'},
  {x: 46, y: 21, type: 'half-top'},
  {x: 46, y: 23, type: 'half-top'},
  {x: 45, y: 23, type: 'half-top'},
  {x: 47, y: 21, type: 'half-bottom'},
  {x: 51, y: 23, type: 'half-bottom'},
  {x: 48, y: 24, type: 'half-right'},
  ...Array.from({ length: 5 }, (_, i) => ({ x: i+45, y: 22, type: 'full' })), 
  ...Array.from({ length: 4 }, (_, i) => ({ x: i+47, y: 23  , type: 'full' })), 
  ...Array.from({ length: 4 }, (_, i) => ({ x: i+49, y: 24  , type: 'full' })), 
  ...Array.from({ length: 4 }, (_, i) => ({ x: 51, y: i+24  , type: 'full' })), 
  ...Array.from({ length: 6 }, (_, i) => ({ x: 50, y: i+25  , type: (i >= 2 && i <= 6) ? 'half-right' : 'full' })),  
  ...Array.from({ length: 6 }, (_, i) => ({ x: 49-i, y: 31+i, type: 'half-right' })),
  {x: 45, y: 34, type: 'half-bottom'},
  {x: 47, y: 36, type: 'half-bottom'},
  {x: 50, y: 34, type: 'half-left'},
  {x: 51, y: 33, type: 'full'},
  ...Array.from({ length: 2 }, (_, i) => ({ x: i+45 , y: 36  , type: 'full' })), 
  ...Array.from({ length: 3 }, (_, i) => ({ x: i+47 , y: 34  , type: 'full' })), 
  ...Array.from({ length: 5 }, (_, i) => ({ x: 53 , y: i+26  , type: 'half-left' })), 
  ...Array.from({ length: 2 }, (_, i) => ({ x: 52 , y: i+31  , type: 'half-right' })), 

  // end buat danau + air

];

const Game = () => {
  const [position, setPosition] = useState({ x: 350, y: 150 });
  const [facing, setFacing] = useState('stand');
  const speed = 20;
  const scale = 1.2;
  const GRID_SIZE = 40;
  const PLAYER_BASE_SIZE = 10;
  const PLAYER_SCALE = 1.3;
  const PLAYER_SIZE = PLAYER_BASE_SIZE * PLAYER_SCALE;
  const MAP_WIDTH = 2400;
  const MAP_HEIGHT = 1800;
  const GRID_COLS = Math.floor(MAP_WIDTH / GRID_SIZE);
  const GRID_ROWS = Math.floor(MAP_HEIGHT / GRID_SIZE);

  // Convert pixel position to grid coordinates
  const getGridPosition = (x, y) => ({
    gridX: Math.floor(x / GRID_SIZE),
    gridY: Math.floor(y / GRID_SIZE)
  });

  // Check collision based on type
  const checkCollision = (playerX, playerY, collisionPoint) => {
    const gridX = collisionPoint.x * GRID_SIZE;
    const gridY = collisionPoint.y * GRID_SIZE;
    const playerCenterX = playerX + (PLAYER_SIZE / 2);
    const playerCenterY = playerY + (PLAYER_SIZE / 2);

    switch (collisionPoint.type) {
      case 'full':
        // Full grid collision check
        return (
          playerX < gridX + GRID_SIZE &&
          playerX + PLAYER_SIZE > gridX &&
          playerY < gridY + GRID_SIZE &&
          playerY + PLAYER_SIZE > gridY
        );

      case 'half-top':
        // Only top half of the grid has collision
        return (
          playerX < gridX + GRID_SIZE &&
          playerX + PLAYER_SIZE > gridX &&
          playerY < gridY + (GRID_SIZE / 2) &&
          playerY + PLAYER_SIZE > gridY
        );

      case 'half-bottom':
        // Only bottom half of the grid has collision
        return (
          playerX < gridX + GRID_SIZE &&
          playerX + PLAYER_SIZE > gridX &&
          playerY < gridY + GRID_SIZE &&
          playerY + PLAYER_SIZE > gridY + (GRID_SIZE / 2)
        );

      case 'half-left':
        // Only left half of the grid has collision
        return (
          playerX < gridX + (GRID_SIZE / 2) &&
          playerX + PLAYER_SIZE > gridX &&
          playerY < gridY + GRID_SIZE &&
          playerY + PLAYER_SIZE > gridY
        );

      case 'half-right':
        // Only right half of the grid has collision
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

  // Check if any part of the player collides with a collision point
  const hasCollision = (x, y) => {
    return COLLISION_MAP.some(point => checkCollision(x, y, point));
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
        case 'arrowup':
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
        case 'arrowdown':
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
        case 'arrowleft':
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
        case 'arrowright':
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

    const handleKeyUp = (e) => {
      // Hanya set facing ke 'stand' jika key yang dilepas adalah WASD atau arrow key
      const movementKeys = ['w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
      if (movementKeys.includes(e.key.toLowerCase())) {
        setFacing('stand');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [position]);

  const getCameraStyle = () => {
    // Calculate the center position of the viewport
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;

    // Calculate the player's center position
    const playerCenterX = position.x + (PLAYER_SIZE / 2);
    const playerCenterY = position.y + (PLAYER_SIZE / 2);

    // Calculate the translation needed to center the player
    const translateX = viewportCenterX - (playerCenterX * scale);
    const translateY = viewportCenterY - (playerCenterY * scale);
    
    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      transformOrigin: '0 0',
    };
  };

  const renderGrid = () => {
    const cells = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const collisionPoint = COLLISION_MAP.find(point => point.x === col && point.y === row);
        const collisionClass = collisionPoint ? `collision ${collisionPoint.type}` : '';
        
        cells.push(
          <div
            key={`${row}-${col}`}
            className={`grid-cell ${collisionClass}`}
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
              backgroundImage: `url(${getSprite()})`,
              imageRendering: 'pixelated',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Game; 