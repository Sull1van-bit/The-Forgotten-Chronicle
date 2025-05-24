import React, { useState } from 'react';
import houseInside from '../../assets/Interior/house-inside.png';
// Import character sprites
import eugeneStand from '../../assets/characters/eugene/stand.gif';
import eugeneWalkUp from '../../assets/characters/eugene/walk-up.gif';
import eugeneWalkDown from '../../assets/characters/eugene/walk-down.gif';
import eugeneWalkLeft from '../../assets/characters/eugene/walk-left.gif';
import eugeneWalkRight from '../../assets/characters/eugene/walk-right.gif';
/*
import alexStand from '../../assets/characters/alex/stand.gif';
import alexWalkUp from '../../assets/characters/alex/walk-up.gif';
import alexWalkDown from '../../assets/characters/alex/walk-down.gif';
import alexWalkLeft from '../../assets/characters/alex/walk-left.gif';
import alexWalkRight from '../../assets/characters/alex/walk-right.gif';
*/
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
      // Spawn player at x:6, y:2 when exiting
      onExit({ x: 6, y: 2 });
    }
  };

  const renderGrid = () => {
    const cells = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const isExitPoint = col === 5 && row === 5;
        const collisionPoint = INTERIOR_COLLISION_MAP.find(point => point.x === col && point.y === row);
        const collisionClass = collisionPoint ? `collision ${collisionPoint.type}` : '';
        
        cells.push(
          <div
            key={`${row}-${col}`}
            className={`grid-cell ${collisionClass} ${isExitPoint ? 'teleport' : ''}`}
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
    let newX = position.x;
    let newY = position.y;
    const speed = 20;

    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        newY = Math.max(0, position.y - speed);
        setFacing('up');
        break;
      case 's':
      case 'arrowdown':
        newY = Math.min(INTERIOR_HEIGHT - PLAYER_SIZE, position.y + speed);
        setFacing('down');
        break;
      case 'a':
      case 'arrowleft':
        newX = Math.max(0, position.x - speed);
        setFacing('left');
        break;
      case 'd':
      case 'arrowright':
        newX = Math.min(INTERIOR_WIDTH - PLAYER_SIZE, position.x + speed);
        setFacing('right');
        break;
      default:
        return;
    }

    if (!hasCollision(newX, newY)) {
      checkExitPoint(newX, newY);
      setPosition({ x: newX, y: newY });
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
  }, [position]);

  return (
    <div className="interior-container">
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