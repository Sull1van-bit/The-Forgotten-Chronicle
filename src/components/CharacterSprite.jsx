import React from 'react';
import PropTypes from 'prop-types';
import SpriteSheet from './SpriteSheet';
import { isSpriteSheet, getSpriteMetadata } from '../utils/characterUtils';

/**
 * CharacterSprite Component
 * Renders character sprite - automatically handles both GIF and spritesheet
 *
 * @param {string} characterName - Name of the character (eugene, louise, alex)
 * @param {string} sprite - Sprite image source or spritesheet
 * @param {string} spriteType - Type of sprite (stand, walkUp, etc.)
 * @param {string} className - Additional CSS classes
 * @param {Object} style - Additional inline styles
 * @param {string} alt - Alt text for accessibility
 */
const CharacterSprite = ({
  characterName,
  sprite,
  spriteType = 'stand',
  className = '',
  style = {},
  alt = 'character sprite'
}) => {
  // Check if this sprite uses spritesheet
  const usesSpriteSheet = isSpriteSheet(characterName, spriteType);

  if (usesSpriteSheet) {
    // Get metadata for spritesheet rendering
    const metadata = getSpriteMetadata(characterName, spriteType);

    if (metadata) {
      return (
        <SpriteSheet
          image={metadata.image}
          frameCount={metadata.frameCount}
          frameWidth={metadata.frameWidth}
          frameHeight={metadata.frameHeight}
          fps={metadata.fps}
          className={className}
          style={style}
          alt={alt}
        />
      );
    }
  }

  // Fallback to regular image/GIF
  return (
    <img
      src={sprite}
      alt={alt}
      className={className}
      style={{
        imageRendering: 'pixelated',
        ...style
      }}
    />
  );
};

CharacterSprite.propTypes = {
  characterName: PropTypes.string.isRequired,
  sprite: PropTypes.string.isRequired,
  spriteType: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  alt: PropTypes.string
};

export default CharacterSprite;

