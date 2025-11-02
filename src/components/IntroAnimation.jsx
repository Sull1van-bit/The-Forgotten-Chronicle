import React, { useState, useEffect } from 'react';
import './IntroAnimation.css';

const IntroAnimation = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);  useEffect(() => {
    // Start fade out after P.U.N.K animation + 1 second pause (9 seconds total)
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 9000);

    // Complete after fade out animation (9.5 seconds total)
    const autoCompleteTimer = setTimeout(() => {
      onComplete();
    }, 9500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(autoCompleteTimer);
    };
  }, [onComplete]);return (
    <div className={`intro-animation-container ${fadeOut ? 'fade-out' : ''}`}>
      <input 
        type="radio" 
        name="rerun" 
        id="retrigger--1" 
        className="retrigger"
        checked={true}
        readOnly
      />

      <div className="bg"></div>      <div className="pane">
        <div className="rotate">
          {[...Array(20)].map((_, index) => (
            <div key={index} className="logo">P.U.N.K</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntroAnimation;
