import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * SpriteSheet Component
 * Renders animated sprites from a horizontal spritesheet
 *
 * @param {string} image - Path to spritesheet image
 * @param {number} frameCount - Number of frames in the spritesheet
 * @param {number} frameWidth - Width of each frame in pixels
 * @param {number} frameHeight - Height of each frame in pixels
 * @param {number} fps - Frames per second for animation (default: 10)
 * @param {boolean} loop - Whether to loop the animation (default: true)
 * @param {string} className - Additional CSS classes
 * @param {Object} style - Additional inline styles
 */
const SpriteSheet = ({
  image,
  frameCount = 5,
  frameWidth = 26,
  frameHeight = 26,
  fps = 10,
  loop = true,
  className = '',
  style = {},
  alt = 'sprite animation'
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const animationRef = useRef(null);
  const lastFrameTimeRef = useRef(Date.now());

  useEffect(() => {
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - lastFrameTimeRef.current;
      const frameInterval = 1000 / fps;

      if (elapsed >= frameInterval) {
        setCurrentFrame(prevFrame => {
          const nextFrame = prevFrame + 1;
          if (nextFrame >= frameCount) {
            return loop ? 0 : frameCount - 1;
          }
          return nextFrame;
        });
        lastFrameTimeRef.current = currentTime;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [frameCount, fps, loop]);

  const spriteStyle = {
    width: `${frameWidth}px`,
    height: `${frameHeight}px`,
    backgroundImage: `url(${image})`,
    backgroundPosition: `-${currentFrame * frameWidth}px 0`,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated',
    ...style
  };

  return (
    <div
      className={`sprite-animation ${className}`}
      style={spriteStyle}
      role="img"
      aria-label={alt}
    />
  );
};

SpriteSheet.propTypes = {
  image: PropTypes.string.isRequired,
  frameCount: PropTypes.number,
  frameWidth: PropTypes.number,
  frameHeight: PropTypes.number,
  fps: PropTypes.number,
  loop: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  alt: PropTypes.string
};

export default SpriteSheet;

