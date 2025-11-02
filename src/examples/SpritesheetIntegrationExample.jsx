/**
 * EXAMPLE IMPLEMENTATION
 * How to integrate CharacterSprite in Game.jsx
 *
 * This file shows how to replace existing sprite rendering
 * with the new optimized spritesheet system
 */

import React from 'react';
import CharacterSprite from '../components/CharacterSprite';
import { getCharacterSprites } from '../utils/characterUtils';

// Example 1: Simple replacement in player rendering
function PlayerSpriteExample({ character, facing, position }) {
  const sprites = getCharacterSprites(character?.name);

  // Determine which sprite to show based on facing direction
  const getSpriteAndType = () => {
    switch (facing) {
      case 'up':
        return { sprite: sprites.walkUp, type: 'walkUp' };
      case 'down':
        return { sprite: sprites.walkDown, type: 'walkDown' };
      case 'left':
        return { sprite: sprites.walkLeft, type: 'walkLeft' };
      case 'right':
        return { sprite: sprites.walkRight, type: 'walkRight' };
      default:
        return { sprite: sprites.stand, type: 'stand' };
    }
  };

  const { sprite, type } = getSpriteAndType();

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: 100
      }}
    >
      <CharacterSprite
        characterName={character?.name || 'louise'}
        sprite={sprite}
        spriteType={type}
        className="game-player-sprite"
        style={{
          width: '26px',
          height: '26px',
          transform: 'scale(3.5)',
          transformOrigin: 'top left'
        }}
        alt={`${character?.name} ${facing}`}
      />
    </div>
  );
}

// Example 2: In Game.jsx render method
function GameRenderExample() {
  // Inside Game.jsx render():

  return (
    <div className="game-container">
      {/* Map and background */}

      {/* OLD WAY - Direct img tag */}
      {/*
      <img
        src={getSprite()}
        alt="player"
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          width: '26px',
          height: '26px',
          transform: 'scale(3.5)',
          imageRendering: 'pixelated'
        }}
      />
      */}

      {/* NEW WAY - Using CharacterSprite */}
      <div
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          width: '26px',
          height: '26px',
          transform: 'scale(3.5)',
          transformOrigin: 'top left',
          zIndex: 100
        }}
      >
        <CharacterSprite
          characterName={character?.name || 'louise'}
          sprite={characterSprites[facing === 'stand' ? 'stand' : `walk${facing.charAt(0).toUpperCase() + facing.slice(1)}`]}
          spriteType={facing === 'stand' ? 'stand' : facing}
        />
      </div>

      {/* NPCs, items, etc */}
    </div>
  );
}

// Example 3: Complete integration pattern
function CompleteGameExample() {
  const [character, setCharacter] = React.useState({ name: 'eugene' });
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [facing, setFacing] = React.useState('stand');

  const characterSprites = getCharacterSprites(character.name);

  // Helper to get current sprite
  const getCurrentSprite = () => {
    switch (facing) {
      case 'up': return { sprite: characterSprites.walkUp, type: 'walkUp' };
      case 'down': return { sprite: characterSprites.walkDown, type: 'walkDown' };
      case 'left': return { sprite: characterSprites.walkLeft, type: 'walkLeft' };
      case 'right': return { sprite: characterSprites.walkRight, type: 'walkRight' };
      default: return { sprite: characterSprites.stand, type: 'stand' };
    }
  };

  const currentSprite = getCurrentSprite();

  return (
    <div className="game-world">
      {/* Player Character */}
      <div
        className="player-container"
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          zIndex: 100
        }}
      >
        <CharacterSprite
          characterName={character.name}
          sprite={currentSprite.sprite}
          spriteType={currentSprite.type}
          className="player-sprite"
          style={{
            width: '26px',
            height: '26px',
            transform: 'scale(3.5)',
            transformOrigin: 'top left'
          }}
        />
      </div>
    </div>
  );
}

// Example 4: With conditional rendering (eating animation, etc)
function AdvancedExample({ character, showEatAnimation, facing }) {
  const sprites = getCharacterSprites(character?.name);

  const getSpriteInfo = () => {
    if (showEatAnimation) {
      return { sprite: sprites.eat, type: 'eat' };
    }

    // Normal movement sprites
    switch (facing) {
      case 'up': return { sprite: sprites.walkUp, type: 'walkUp' };
      case 'down': return { sprite: sprites.walkDown, type: 'walkDown' };
      case 'left': return { sprite: sprites.walkLeft, type: 'walkLeft' };
      case 'right': return { sprite: sprites.walkRight, type: 'walkRight' };
      default: return { sprite: sprites.stand, type: 'stand' };
    }
  };

  const { sprite, type } = getSpriteInfo();

  return (
    <CharacterSprite
      characterName={character?.name}
      sprite={sprite}
      spriteType={type}
      style={{
        width: '26px',
        height: '26px',
        transform: 'scale(3.5)'
      }}
    />
  );
}

// Example 5: Migration steps for existing Game.jsx
/*
STEP-BY-STEP MIGRATION:

1. Add import at top of Game.jsx:
   import CharacterSprite from '../components/CharacterSprite';

2. Find your player sprite rendering (usually in render/return):
   Look for: <img src={getSprite()} ...

3. Replace with:
   <CharacterSprite
     characterName={character?.name || 'louise'}
     sprite={getSprite()}
     spriteType={facing === 'stand' ? 'stand' : facing}
     style={{
       width: '26px',
       height: '26px',
       transform: 'scale(3.5)'
     }}
   />

4. Test with Eugene character - stand animation should use spritesheet

5. Verify other characters (Louise, Alex) still work with GIFs

6. Done! Eugene will automatically use optimized spritesheet
*/

export {
  PlayerSpriteExample,
  GameRenderExample,
  CompleteGameExample,
  AdvancedExample
};

