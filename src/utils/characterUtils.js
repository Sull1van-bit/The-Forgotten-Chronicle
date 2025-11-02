// Character sprite utilities
import louiseStand from '../assets/characters/louise/stand.gif';
import louiseWalkUp from '../assets/characters/louise/walk-up.gif';
import louiseWalkDown from '../assets/characters/louise/walk-down.gif';
import louiseWalkLeft from '../assets/characters/louise/walk-left.gif';
import louiseWalkRight from '../assets/characters/louise/walk-right.gif';
import louiseEat from '../assets/characters/louise/eat.gif';
import louiseDeath from '../assets/characters/louise/death.gif';

// Eugene - Using spritesheet for stand animation
import eugeneStandSheet from '../assets/characters/eugene/stand-spritesheet.png';
import eugeneWalkUp from '../assets/characters/eugene/walk-up.gif';
import eugeneWalkDown from '../assets/characters/eugene/walk-down.gif';
import eugeneWalkLeft from '../assets/characters/eugene/walk-left.gif';
import eugeneWalkRight from '../assets/characters/eugene/walk-right.gif';
import eugeneEat from '../assets/characters/eugene/eat.gif';
import eugeneDeath from '../assets/characters/eugene/death.gif';

import alexStand from '../assets/characters/alex/stand.gif';
import alexWalkUp from '../assets/characters/alex/walk-up.gif';
import alexWalkDown from '../assets/characters/alex/walk-down.gif';
import alexWalkLeft from '../assets/characters/alex/walk-left.gif';
import alexWalkRight from '../assets/characters/alex/walk-right.gif';
import alexEat from '../assets/characters/alex/eat.gif';
import alexDeath from '../assets/characters/alex/death.gif';

import louisePortrait from '../assets/characters/louise/character.png';
import eugenePortrait from '../assets/characters/eugene/character.png';
import alexPortrait from '../assets/characters/alex/character.png';

// Spritesheet metadata
export const SPRITE_METADATA = {
  eugene: {
    stand: {
      type: 'spritesheet',
      image: eugeneStandSheet,
      frameCount: 5,
      frameWidth: 26,
      frameHeight: 26,
      fps: 8 // Smooth idle animation
    }
  }
};

export const CHARACTER_SPRITES = {
  louise: {
    stand: louiseStand,
    walkUp: louiseWalkUp,
    walkDown: louiseWalkDown,
    walkLeft: louiseWalkLeft,
    walkRight: louiseWalkRight,
    eat: louiseEat,
    death: louiseDeath,
    portrait: louisePortrait
  },
  eugene: {
    stand: eugeneStandSheet, // Now using spritesheet
    standMeta: SPRITE_METADATA.eugene.stand, // Metadata for rendering
    walkUp: eugeneWalkUp,
    walkDown: eugeneWalkDown,
    walkLeft: eugeneWalkLeft,
    walkRight: eugeneWalkRight,
    eat: eugeneEat,
    death: eugeneDeath,
    portrait: eugenePortrait
  },
  alex: {
    stand: alexStand,
    walkUp: alexWalkUp,
    walkDown: alexWalkDown,
    walkLeft: alexWalkLeft,
    walkRight: alexWalkRight,
    eat: alexEat,
    death: alexDeath,
    portrait: alexPortrait
  }
};

/**
 * Get character sprites by name
 * @param {string} characterName - The name of the character
 * @returns {Object} Sprite object containing all character animations
 */
export const getCharacterSprites = (characterName) => {
  const name = characterName?.toLowerCase();
  return CHARACTER_SPRITES[name] || CHARACTER_SPRITES.louise;
};

/**
 * Get character portrait by name
 * @param {string} characterName - The name of the character
 * @returns {string} Portrait image path
 */
export const getCharacterPortrait = (characterName) => {
  const sprites = getCharacterSprites(characterName);
  return sprites.portrait;
};

/**
 * Check if a sprite uses spritesheet
 * @param {string} characterName - The name of the character
 * @param {string} spriteName - The sprite type (e.g., 'stand', 'walkUp')
 * @returns {boolean} True if sprite uses spritesheet
 */
export const isSpriteSheet = (characterName, spriteName) => {
  const name = characterName?.toLowerCase();
  return SPRITE_METADATA[name]?.[spriteName]?.type === 'spritesheet';
};

/**
 * Get spritesheet metadata
 * @param {string} characterName - The name of the character
 * @param {string} spriteName - The sprite type
 * @returns {Object|null} Spritesheet metadata or null
 */
export const getSpriteMetadata = (characterName, spriteName) => {
  const name = characterName?.toLowerCase();
  return SPRITE_METADATA[name]?.[spriteName] || null;
};

