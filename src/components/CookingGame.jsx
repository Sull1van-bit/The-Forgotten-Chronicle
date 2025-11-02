import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import item icons
import potatoIcon from '../assets/items/potato.png';
import meatIcon from '../assets/items/meat.png';
import mushroomIcon from '../assets/items/mushroom.png';

const CookingGame = ({ onClose, onSuccess, onFail, inventory, removeItemFromInventory }) => {
  const [gameState, setGameState] = useState('preparing'); // preparing, cooking, success, fail
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(30);
  const [temperature, setTemperature] = useState(50);
  const [stirProgress, setStirProgress] = useState(0);  const [ingredients, setIngredients] = useState([]);
  const [cookingPhase, setCookingPhase] = useState('prep'); // prep, heating, stirring, seasoning
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isStirring, setIsStirring] = useState(false);
  const [stirDirection, setStirDirection] = useState(0);
  const [seasoningAdded, setSeasoningAdded] = useState(false);
  const [perfectTiming, setPerfectTiming] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [failureReason, setFailureReason] = useState(''); // Track why cooking failed

  const stirAreaRef = useRef(null);
  const gameIntervalRef = useRef(null);
  const stirCenterRef = useRef({ x: 0, y: 0 });  // Required ingredients for Hearty Stew
  const requiredIngredients = [
    { id: 2, name: 'Potato', required: 1, icon: potatoIcon },
    { id: 7, name: 'Meat', required: 1, icon: meatIcon },
    { id: 8, name: 'Mushroom', required: 2, icon: mushroomIcon }
  ];// Check if player has all required ingredients
  const checkIngredients = () => {
    const availableIngredients = [];
    let hasAllIngredients = true;
    
    console.log('CookingGame - Checking ingredients:', { inventory, requiredIngredients });
    
    requiredIngredients.forEach(req => {
      // Sum up all quantities of items with this ID
      const count = inventory
        .filter(item => item.id === req.id)
        .reduce((total, item) => total + item.quantity, 0);
      
      availableIngredients.push({ ...req, available: count });
      
      console.log(`CookingGame - ${req.name} (ID: ${req.id}): need ${req.required}, have ${count}`);
      
      if (count < req.required) {
        hasAllIngredients = false;
      }
    });
    
    console.log('CookingGame - Has all ingredients:', hasAllIngredients);
    return { availableIngredients, hasAllIngredients };
  };  // Cooking steps
  const cookingSteps = [
    { phase: 'prep', instruction: 'Add ingredients to the pot', duration: 0 },
    { phase: 'heating', instruction: 'Heat the pot to the perfect temperature (75-85°C)', duration: 15 },
    { phase: 'stirring', instruction: 'Stir the stew by moving your mouse in circles', duration: 0 }, // No timer
    { phase: 'seasoning', instruction: 'Add seasoning when ready!', duration: 0 } // No timer
  ];// Define handlePhaseComplete first before using it in useEffect
  const handlePhaseComplete = useCallback(() => {
    switch (cookingPhase) {
      case 'heating':        if (temperature >= 75 && temperature <= 85) {
          console.log('CookingGame - Heating phase completed successfully');
          setCookingPhase('stirring');
          // Use setTimeout to ensure state update happens before timer reset
          setTimeout(() => {
            setTimer(0); // No timer for stirring phase
            setStirProgress(0);
          }, 50);
        } else {
          console.log('CookingGame - Heating phase failed, temperature:', temperature);
          setFailureReason('temperature');
          setGameState('fail');
        }
        break;
      case 'stirring':        // No timer for stirring - player can take their time
        if (stirProgress >= 80) {
          console.log('CookingGame - Stirring phase completed successfully');
          setCookingPhase('seasoning');
          setTimeout(() => {
            setTimer(0); // No timer for seasoning phase
          }, 50);
        } else {
          console.log('CookingGame - Stirring phase failed, progress:', stirProgress);
          setFailureReason('stirring');
          setGameState('fail');
        }
        break;
      case 'seasoning':
        // No timer for seasoning - player can add seasoning when ready
        if (seasoningAdded) {
          console.log('CookingGame - Seasoning phase completed successfully');
          setGameState('success');
        } else {
          console.log('CookingGame - Seasoning phase failed, seasoning not added:', seasoningAdded);
          setFailureReason('seasoning');
          setGameState('fail');
        }
        break;
    }
  }, [cookingPhase, temperature, stirProgress, seasoningAdded]);

  useEffect(() => {
    const { availableIngredients, hasAllIngredients } = checkIngredients();
    if (!hasAllIngredients) {
      console.log('CookingGame - Missing ingredients, setting fail state');
      setFailureReason('missing_ingredients');
      setGameState('fail');
      return;
    }
    console.log('CookingGame - All ingredients available, setting ingredients state');
    setIngredients(availableIngredients);
  }, []);    useEffect(() => {
    // Only run timer for heating phase
    if (gameState === 'cooking' && cookingPhase === 'heating') {
      // Clear any existing interval first
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
      
      gameIntervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (gameIntervalRef.current) {
          clearInterval(gameIntervalRef.current);
        }
      };
    }
  }, [gameState, cookingPhase, handlePhaseComplete]);
  // Handle mouse movement for stirring
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cookingPhase === 'stirring' && stirAreaRef.current) {
        const rect = stirAreaRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const x = e.clientX - centerX;
        const y = e.clientY - centerY;
        
        setMousePosition({ x, y });

        // Calculate stirring progress based on circular motion
        const distance = Math.sqrt(x * x + y * y);
        const angle = Math.atan2(y, x);
        
        if (distance > 20 && distance < 80) {
          setIsStirring(true);
          const newDirection = angle;
          const directionDiff = Math.abs(newDirection - stirDirection);
          
          if (directionDiff > 0.3) {
            setStirProgress(prev => {
              const newProgress = Math.min(100, prev + 2);
              // Auto-progress to seasoning when stirring is complete
              if (newProgress >= 80 && prev < 80) {
                setTimeout(() => {
                  setCookingPhase('seasoning');
                }, 500);
              }
              return newProgress;
            });
          }
          
          setStirDirection(newDirection);
        } else {
          setIsStirring(false);
        }
      }
    };

    if (cookingPhase === 'stirring') {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [cookingPhase, stirDirection]);
  const startCooking = () => {
    // Remove ingredients from inventory
    requiredIngredients.forEach(req => {
      removeItemFromInventory(req.id, req.required);
    });
    
    setGameState('cooking');
    setCookingPhase('heating');
    setTimer(15);
    setShowInstructions(false);
  };
  const handleTemperatureControl = (direction) => {
    if (cookingPhase !== 'heating') return;
    
    setTemperature(prev => {
      const newTemp = direction === 'up' ? prev + 5 : prev - 5;
      return Math.max(0, Math.min(100, newTemp));
    });
  };
  const handleSeasoning = () => {
    if (cookingPhase !== 'seasoning') return;
    
    setSeasoningAdded(true);
    // No perfect timing requirement - player can add seasoning anytime
    console.log('CookingGame - Seasoning added');
    setTimeout(() => setGameState('success'), 1000);
  };

  const handleGameEnd = () => {
    if (gameState === 'success') {
      onSuccess();
    } else {
      onFail();
    }
    onClose();
  };  const getFailureMessage = () => {
    switch (failureReason) {
      case 'missing_ingredients':
        return "You don't have all the required ingredients.";
      case 'temperature':
        return "The temperature wasn't right! Keep it between 75-85°C.";
      case 'stirring':
        return "You didn't stir enough! Keep stirring until the progress bar is at least 80%.";
      case 'seasoning':
        return "You forgot to add the seasoning! Click the seasoning button to complete the stew.";
      default:
        return "The stew didn't turn out right. Try again!";
    }
  };const getTemperatureColor = () => {
    if (temperature >= 75 && temperature <= 85) return '#22c55e'; // green
    if (temperature >= 65 && temperature <= 95) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.3)'}}>
      <motion.div
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#8B4513] border-8 border-[#D2B48C] rounded-lg p-6 max-w-lg w-full mx-4 text-white max-h-[80vh] overflow-y-auto"
      ><h2 className="text-2xl font-bold text-center text-[#F5DEB3] mb-4">
          🍲 Cooking: Hearty Stew
        </h2>        {showInstructions && gameState === 'preparing' && (
          <div className="text-center">            <div className="mb-3">
              <h3 className="text-base mb-1 text-[#F5DEB3]">Ingredients:</h3>
              <div className="flex gap-2 justify-center mb-2">
                {requiredIngredients.map(req => {
                  const available = inventory
                    .filter(item => item.id === req.id)
                    .reduce((total, item) => total + item.quantity, 0);
                  const hasEnough = available >= req.required;
                  return (
                    <div key={req.id} className={`px-2 py-1.5 rounded flex flex-col items-center ${hasEnough ? 'bg-green-700' : 'bg-red-700'}`}>
                      <img src={req.icon} alt={req.name} className="w-10 h-10 object-contain" />
                      <div className="text-sm text-white font-medium">{req.required}/{available}</div>
                    </div>
                  );
                })}
              </div>
            </div>
              {ingredients.length === requiredIngredients.length ? (
              <div>
                <p className="mb-3 text-[#F5DEB3]">
                  Perfect! You have all the ingredients needed to cook a Hearty Stew.
                </p>
                <button
                  onClick={startCooking}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-bold text-lg"
                >
                  Start Cooking! 🔥
                </button>
              </div>
            ) : (
              <div>
                <p className="text-red-400 mb-3">
                  You don't have all the required ingredients!
                </p>
                <button
                  onClick={onClose}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-bold"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}        {gameState === 'cooking' && (
          <div>
            <div className="text-center mb-4">
              <div className="text-lg mb-2 text-[#F5DEB3]">
                {cookingSteps.find(step => step.phase === cookingPhase)?.instruction}
              </div>
              {cookingPhase === 'heating' && (
                <div className="text-md">
                  ⏰ Time: {timer}s
                </div>
              )}
            </div>{cookingPhase === 'heating' && (
              <div className="text-center">
                <div className="mb-4">
                  <div className="text-xl mb-3">🌡️ Temperature: {temperature}°C</div>
                  <div 
                    className="w-full h-6 bg-gray-700 rounded-lg overflow-hidden mb-3"
                  >
                    <div 
                      className="h-full transition-all duration-300"
                      style={{ 
                        width: `${temperature}%`,
                        backgroundColor: getTemperatureColor()
                      }}
                    />
                  </div>
                  <div className="text-sm text-[#F5DEB3] mb-3">
                    Target: 75-85°C (Green Zone)
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => handleTemperatureControl('down')}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold text-lg"
                  >
                    🔽 Cool Down
                  </button>
                  <button
                    onClick={() => handleTemperatureControl('up')}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-bold text-lg"
                  >
                    🔥 Heat Up
                  </button>
                </div>
              </div>
            )}

            {cookingPhase === 'stirring' && (
              <div className="text-center">
                <div className="mb-4">
                  <div className="text-xl mb-2">Stir Progress: {Math.round(stirProgress)}%</div>
                  <div className="w-full h-4 bg-gray-700 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 transition-all duration-300"
                      style={{ width: `${stirProgress}%` }}
                    />
                  </div>
                </div>                <div 
                  ref={stirAreaRef}
                  className="relative w-48 h-48 mx-auto bg-[#654321] rounded-full border-8 border-[#8B4513] cursor-none"
                  style={{
                    background: `radial-gradient(circle, #8B4513 30%, #654321 70%)`
                  }}
                >
                  <div className="absolute inset-4 rounded-full border-2 border-dashed border-yellow-400 opacity-50" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">
                    🥄
                  </div>
                  {isStirring && (
                    <div 
                      className="absolute w-4 h-4 bg-yellow-400 rounded-full"
                      style={{
                        left: `calc(50% + ${mousePosition.x}px - 8px)`,
                        top: `calc(50% + ${mousePosition.y}px - 8px)`,
                      }}
                    />
                  )}
                </div>
                <p className="mt-4 text-[#F5DEB3]">
                  Move your mouse in circles around the pot to stir!
                </p>
              </div>
            )}            {cookingPhase === 'seasoning' && (
              <div className="text-center">
                <div className="mb-4">
                  <div className="text-xl mb-3">🧂 Add Seasoning</div>
                  <div className="text-md mb-3">
                    Your stew is perfectly stirred! Add seasoning to complete it.
                  </div>
                  <div className="text-lg text-green-400">
                    ✨ Ready for seasoning!
                  </div>
                </div>
                <button
                  onClick={handleSeasoning}
                  disabled={seasoningAdded}
                  className={`px-6 py-3 rounded-lg font-bold text-lg ${
                    seasoningAdded 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {seasoningAdded ? '✓ Seasoning Added' : '🧂 Add Seasoning'}
                </button>
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {gameState === 'success' && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-2xl text-green-400 mb-3">Perfect Stew!</h3>
              <p className="text-[#F5DEB3] mb-4">
                You've successfully cooked a delicious Hearty Stew! The elder will love this.
              </p>
              <button
                onClick={handleGameEnd}
                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold text-lg"
              >
                Continue
              </button>
            </motion.div>
          )}

          {gameState === 'fail' && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >              <div className="text-4xl mb-3">😞</div>              <h3 className="text-2xl text-red-400 mb-3">Cooking Failed!</h3>
              <p className="text-[#F5DEB3] mb-4">
                {getFailureMessage()}
              </p>
              <button
                onClick={handleGameEnd}
                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold text-lg"
              >
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CookingGame;
