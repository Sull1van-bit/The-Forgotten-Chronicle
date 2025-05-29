import React, { useState, useEffect, useRef } from 'react';
import houseInside from '../../assets/Interior/house-inside.png';
import { useAuth } from '../../context/AuthContext';
import { saveFileService } from '../../services/saveFileService';
import { useSound } from '../../context/SoundContext';
import { useMusic } from '../../context/MusicContext';
import { useDialog } from '../../context/DialogContext';
import { AnimatePresence, motion } from 'framer-motion';

// Import components
import Inventory from '../../components/Inventory';
import QuestFolder from '../../components/QuestFolder';
import ActiveQuestFolderUI from '../../components/ActiveQuestFolderUI';
import Settings from '../../components/Settings';
import DialogBox from '../../components/DialogBox';

// Import UI icons
import heartIcon from '../../assets/statbar/heart.png';
import hungerIcon from '../../assets/statbar/hunger.png';
import hygieneIcon from '../../assets/statbar/hygiene.png';
import happinessIcon from '../../assets/statbar/happiness.png';
import energyIcon from '../../assets/statbar/energy.png';
import moneyIcon from '../../assets/statbar/money.png';
import pauseButton from '../../assets/menu/pause.png';

// Import character portraits
import louisePortrait from '../../assets/characters/louise/character.png';
import eugenePortrait from '../../assets/characters/eugene/character.png';
import alexPortrait from '../../assets/characters/alex/character.png';

// Import character sprites
import eugeneStand from '../../assets/characters/eugene/stand.gif';
import eugeneWalkUp from '../../assets/characters/eugene/walk-up.gif';
import eugeneWalkDown from '../../assets/characters/eugene/walk-down.gif';
import eugeneWalkLeft from '../../assets/characters/eugene/walk-left.gif';
import eugeneWalkRight from '../../assets/characters/eugene/walk-right.gif';
import louiseStand from '../../assets/characters/louise/stand.gif';
import louiseWalkUp from '../../assets/characters/louise/walk-up.gif';
import louiseWalkDown from '../../assets/characters/louise/walk-down.gif';
import louiseWalkLeft from '../../assets/characters/louise/walk-left.gif';
import louiseWalkRight from '../../assets/characters/louise/walk-right.gif';
import alexStand from '../../assets/characters/alex/stand.gif';
import alexWalkUp from '../../assets/characters/alex/walk-up.gif';
import alexWalkDown from '../../assets/characters/alex/walk-down.gif';
import alexWalkLeft from '../../assets/characters/alex/walk-left.gif';
import alexWalkRight from '../../assets/characters/alex/walk-right.gif';
import eugeneSleep from '../../assets/characters/eugene/sleep.gif';
import louiseSleep from '../../assets/characters/louise/sleep.gif';
import alexSleep from '../../assets/characters/alex/sleep.gif';
import eugeneEat from '../../assets/characters/eugene/eat.gif';
import louiseEat from '../../assets/characters/louise/eat.gif';
import alexEat from '../../assets/characters/alex/eat.gif';

// Define collision points for interior
const INTERIOR_COLLISION_MAP = [
  ...Array.from({ length: 8 }, (_, i) => ({ x: i, y: 0, type: 'full' })),
  ...Array.from({ length: 8 }, (_, i) => ({ x: i, y: 1, type: 'half-top' })),
  ...Array.from({ length: 5 }, (_, i) => ({ x: i, y: 5, type: 'half-bottom' })),
  {x: 6, y: 5, type: 'full'},
  ...Array.from({ length: 6 }, (_, i) => ({ x: 0, y: i, type: 'half-left' })),
  {x: 0, y: 6, type: 'full'},
  ...Array.from({ length: 6 }, (_, i) => ({ x: 7, y: i, type: 'half-right' })),
  {x: 7, y: 6, type: 'full'},
];

const HouseInterior = ({ 
  position, 
  setPosition, 
  onExit, 
  character, 
  health,
  setHealth,
  energy, 
  setEnergy, 
  hunger, 
  setHunger, 
  happiness, 
  setHappiness, 
  money,
  setMoney,
  isSleeping, 
  setIsSleeping,
  cleanliness, 
  setCleanliness,
  gameTime,
  inventory,
  quests,
  setQuests,
  onUseItem,
  isPaused,
  handlePause,
  handleResume,
  handleSettings,
  handleCloseSettings,
  handleExit,
  showSettings,
  onTimeUpdate,
  hasSeenHouseDialog,
  setHasSeenHouseDialog,
  saveGame,  showEatAnimation,
  setShowEatAnimation,
  currentDay,
  setCurrentDay,
  plantedCrops,
  setPlantedCrops
}) => {
  const { user } = useAuth();
  const { soundEnabled, setSoundEnabled, sfxVolume, setSfxVolume, playClick, playHover } = useSound();
  const { musicEnabled, setMusicEnabled, musicVolume, setMusicVolume } = useMusic();
  const { isDialogActive, currentDialog, dialogIndex, startDialog, advanceDialog, endDialog } = useDialog();
  const [facing, setFacing] = useState('stand');  const [showSleepButton, setShowSleepButton] = useState(false);
  const [showSleepConfirmPopup, setShowSleepConfirmPopup] = useState(false);
  const [isNearSleepArea, setIsNearSleepArea] = useState(false);
  const prevIsNearSleepArea = useRef(false);
  const hasShownSleepPopup = useRef(false);
    // Objective popup state
  const [completedObjectives, setCompletedObjectives] = useState([]);
  const [newObjectives, setNewObjectives] = useState([]);
  const INTERIOR_WIDTH = 800;
  const INTERIOR_HEIGHT = 600;
  const GRID_SIZE = 100;
  const PLAYER_SIZE = 26;
  const PLAYER_SCALE_INTERIOR = 3.5; // Define the scale used in CSS
  const PLAYER_SCALED_SIZE = PLAYER_SIZE * PLAYER_SCALE_INTERIOR; // Calculate scaled size
  const GRID_COLS = Math.floor(INTERIOR_WIDTH / GRID_SIZE);
  const GRID_ROWS = Math.floor(INTERIOR_HEIGHT / GRID_SIZE);

  // Define the sleep area
  const SLEEP_AREA = { x: 2, y: 2 };
  const SLEEP_AREA_PIXEL = { x: SLEEP_AREA.x * GRID_SIZE, y: SLEEP_AREA.y * GRID_SIZE };

  // Check if it's sleep time (9 PM to 6 AM) - Moved up
  const isSleepTime = () => {
    const hour = gameTime.hours;
    return hour >= 21 || hour < 6; // 9 PM to 6 AM
  };

  // Monologue script for house entrance
  const houseEntranceMonologue = [
    "So this is it... Home. Or, at least, it once was.",
    "The walls have held stories—laughter, arguments, quiet moments by the fire. Now, only silence remains.",
    "Everything feels smaller than I remembered. Or perhaps, I have simply grown too much for this place.",
    "If I am to live here, it will need work. A roof that doesn't leak, fields that don't sit barren, a reason to stay.",
    "But before that, the elder waits. If anyone remembers what this place once was, it would be them."
  ];

  // Effect to trigger house entrance dialog on first entry
  useEffect(() => {
    console.log('HouseInterior useEffect running.'); // Debug log
    console.log('hasSeenHouseDialog:', hasSeenHouseDialog); // Debug log
    console.log('isDialogActive:', isDialogActive); // Debug log

    // Trigger dialog only if it hasn't been seen and no other dialog is active
    if (!hasSeenHouseDialog && !isDialogActive) {
      console.log("Triggering house entrance dialog."); // Debug log
      // Start the dialog first
      startDialog({
        characterName: character?.name || 'Character',
        expression: 'smile',
        dialogue: houseEntranceMonologue
      });
      
      // Use a small delay to ensure the dialog starts before marking it as seen
      setTimeout(() => {
        setHasSeenHouseDialog(true);
        console.log("hasSeenHouseDialog set to true."); // Debug log
      }, 100);
    }
  }, [hasSeenHouseDialog, isDialogActive, startDialog, character]); // Removed setHasSeenHouseDialog from dependencies

  // Handle advancing the monologue
  const handleAdvanceMonologue = () => {
    console.log('Advancing monologue, current index:', dialogIndex); // Debug log
    playClick();
    advanceDialog();
  };

  // Handle skipping the monologue
  const handleSkipMonologue = () => {
    console.log('Skipping monologue'); // Debug log
    playClick();
    endDialog();
  };

  // Effect to trigger popup when entering sleep area
  useEffect(() => {
    console.log('Sleep Popup Effect Triggered:', { isNearSleepArea, isSleepTime: isSleepTime(), isSleeping, showSleepConfirmPopup }); // Debug log
    // Show popup if player is near the sleep area and not already sleeping
    if (isNearSleepArea && !isSleeping) {
      // Only show the popup if it's not already visible. This prevents it from flickering.
      if (!showSleepConfirmPopup) {
        console.log('Conditions met, showing sleep confirm popup'); // Debug log
        setShowSleepConfirmPopup(true);
      }
    } else {
      // Hide the popup if conditions are not met (e.g., moved away or is sleeping)
      if (showSleepConfirmPopup) {
         console.log('Conditions not met, hiding sleep confirm popup'); // Debug log
         setShowSleepConfirmPopup(false);
      }
    }

    // The hasShownSleepPopup ref and prevIsNearSleepArea ref logic might need review 
    // depending on the exact desired behavior (once per session, once per entry, etc.)
    // For now, simplifying to show each time conditions are met.

  }, [isNearSleepArea, isSleeping, showSleepConfirmPopup]); // Dependencies - Removed gameTime and isSleepTime

  // The checkSleepProximity function should only set isNearSleepArea
  // The effect above will handle setting showSleepConfirmPopup
  const checkSleepProximity = (x, y) => {
    // Use scaled player size for center calculation
    const playerCenterX = x + (PLAYER_SCALED_SIZE / 2);
    const playerCenterY = y + (PLAYER_SCALED_SIZE / 2);
    // Set the sleep center point to be further left
    const sleepCenterX = SLEEP_AREA_PIXEL.x - 50; // Move 50 pixels to the left
    const sleepCenterY = SLEEP_AREA_PIXEL.y + (GRID_SIZE / 2);
    const distance = Math.sqrt(
      Math.pow(playerCenterX - sleepCenterX, 2) + Math.pow(playerCenterY - sleepCenterY, 2)
    );
    // Update proximity state - Increased threshold
    const proximityThreshold = 50; // Increased from 30
    const isNear = distance < proximityThreshold;
    console.log('Check Sleep Proximity:', { playerX: x, playerY: y, playerCenterX, playerCenterY, sleepCenterX, sleepCenterY, distance, isNear, proximityThreshold }); // Debug log
    setIsNearSleepArea(isNear);
    // Removed setShowSleepButton(isNear);
  };  // Add effect to check quest progress when entering house
  const hasShownHouseObjective = useRef(false);
  
  useEffect(() => {
    if (quests && quests.length > 0 && !hasShownHouseObjective.current) {
      const updatedQuests = quests.map(quest => {
        if (quest.title === "Welcome Home") {
          const updatedObjectives = quest.objectives.map(objective => {
            if (objective.description === "Enter your house" && !objective.completed) {              // Show completed objective popup when entering house - only once
              showChainedObjective("Enter your house", "Meet the village elder");
              hasShownHouseObjective.current = true; // Mark that we've shown this popup
              return { ...objective, completed: true };
            }
            return objective;
          });
          return { ...quest, objectives: updatedObjectives };
        }
        return quest;
      });
      setQuests(updatedQuests);
    }  }, [quests]); // Only re-run when quests change

  // Auto-hide completed objectives after 4 seconds, new objectives after 6 seconds
  useEffect(() => {
    if (completedObjectives.length > 0) {
      const timer = setTimeout(() => {
        setCompletedObjectives([]);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [completedObjectives]);

  useEffect(() => {
    if (newObjectives.length > 0) {
      const timer = setTimeout(() => {
        setNewObjectives([]);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [newObjectives]);

  // Handle sleep action
  const handleSleep = async () => {
    if (!isSleepTime()) {
      setShowSleepConfirmPopup(false);
      return;
    }

    setShowSleepConfirmPopup(false);
    setIsSleeping(true);
    
    // Save game state
    try {
      const gameState = {
        character,
        position,
        facing,
        stats: {
          health: 100,
          energy: Math.min(100, energy + 50),
          hunger: Math.max(0, hunger - 10),
          happiness: Math.min(100, happiness + 30),
          money: 0,
          cleanliness: Math.min(100, cleanliness + 50)
        },
        settings: {
          soundEnabled: true,
          sfxVolume: 0.5,
          musicEnabled: true,
          musicVolume: 0.5
        }
      };

      await saveFileService.saveGame(user.uid, gameState);
      console.log('Game saved after sleeping');
    } catch (error) {
      console.error('Error saving game after sleep:', error);
    }    // Calculate time until 6 AM
    const currentHour = gameTime.hours;
    const currentMinute = gameTime.minutes;
    let hoursUntilWake = 0;
    let shouldAdvanceDay = false;
      if (currentHour >= 21) { // If sleeping after 9 PM (21:00)
      hoursUntilWake = 24 - currentHour + 6; // Hours until 6 AM next day
      shouldAdvanceDay = true;
      console.log('Sleeping after 9 PM, will advance day. Current hour:', currentHour); // Debug log
    } else { // If sleeping before 6 AM
      hoursUntilWake = 6 - currentHour;
      console.log('Sleeping before 6 AM, will NOT advance day. Current hour:', currentHour); // Debug log
    }// Convert hours to milliseconds (1 hour = 1 second in game time)
    const sleepDuration = hoursUntilWake * 1000;

    // Track current time during sleep
    let currentSleepHour = currentHour;

    // Create an interval to update time every second
    const timeInterval = setInterval(() => {
      currentSleepHour = (currentSleepHour + 1) % 24;
      const newTime = {
        hours: currentSleepHour,
        minutes: 0
      };
      // Update the game time in the parent component
      if (typeof onTimeUpdate === 'function') {
        onTimeUpdate(newTime);
      }
    }, 1000);    // Update stats and wake up after sleep duration
    setTimeout(() => {
      clearInterval(timeInterval); // Stop the time updates
      setEnergy(prev => Math.min(100, prev + 50));
      setHappiness(prev => Math.min(100, prev + 30));
      setHunger(prev => Math.max(0, prev - 10));
      setCleanliness(prev => Math.min(100, prev + 50));      setIsSleeping(false);
      
      // Show objective popup after waking up - optional message that doesn't need to appear every time
      if (Math.random() > 0.5) { // Only show 50% of the time to reduce popup fatigue
        showObjective("Good morning! You feel refreshed and ready for a new day.");
      }
      
      // Set time to 6 AM
      const wakeTime = { hours: 6, minutes: 0 };
      if (typeof onTimeUpdate === 'function') {
        onTimeUpdate(wakeTime);      }      // Advance day if sleeping after 9 PM
      if (shouldAdvanceDay && typeof setCurrentDay === 'function') {
        setCurrentDay(prevDay => {
          const newDay = prevDay + 1;
          console.log('Day advanced to:', newDay); // Debug log
          
          // Update planted crops for the new day - reset watering needs and advance growth
          if (typeof setPlantedCrops === 'function') {
            setPlantedCrops(prevCrops => prevCrops.map(crop => {
              // Only process non-mature crops
              if (crop.stage < 3) {
                // Check if the crop was watered on the previous day
                const grewToday = !crop.needsWatering;
                
                // Advance stage if it grew today, otherwise keep current stage
                const nextStage = grewToday ? Math.min(3, crop.stage + 1) : crop.stage;
                
                // All non-mature crops need watering at the start of a new day
                const needsWateringForNewDay = nextStage < 3;
                
                return { ...crop, stage: nextStage, needsWatering: needsWateringForNewDay };
              }
              // Mature crops (stage 3) don't need watering and are ready for harvest
              return crop;
            }));
          }
          
          return newDay;
        });
      }

      // Update quest progress after sleeping
      if (quests && quests.length > 0) {
        const updatedQuests = quests.map(quest => {
          if (quest.title === "Welcome Home") {
            const updatedObjectives = quest.objectives.map(objective => {
              if (objective.description === "Meet the village elder" && !objective.completed) {
                return { ...objective, completed: true };
              }
              return objective;
            });
            return { ...quest, objectives: updatedObjectives };
          }
          return quest;
        });
        setQuests(updatedQuests);
      }    }, sleepDuration);
  };  // Helper functions for objective popups
  const showCompletedObjective = (text) => {
    setCompletedObjectives(prev => [...prev, { text, id: Date.now() }]);
  };
  
  // Function to show a chained objective (completed and next together)
  const showChainedObjective = (completedText, nextText) => {
    const chainId = Date.now(); // Use the same ID for related objectives
    setCompletedObjectives(prev => [...prev, { 
      text: completedText, 
      id: chainId,
      hasNextObjective: !!nextText // Flag indicating this is part of a chain
    }]);
    
    if (nextText) {
      setNewObjectives(prev => [...prev, { 
        text: nextText, 
        id: chainId,
        isChainedFromPrevious: true // Flag indicating this is chained from a previous objective
      }]);
    }
  };

  const showNewObjective = (text) => {
    setNewObjectives(prev => [...prev, { text, id: Date.now() }]);
  };

  // Backward compatibility function
  const showObjective = (text) => {
    showNewObjective(text);
  };
  // Get character-specific sprites
  const getCharacterSprites = () => {
    console.log('House Interior - Selected character:', character);
    
    const characterName = typeof character === 'object' && character !== null ? character.name : character;
    console.log('House Interior - Character name:', characterName);

    switch (String(characterName).toLowerCase()) {
      case 'eugene':
        console.log('Loading Eugene sprites in house');
        return {
          stand: eugeneStand,
          walkUp: eugeneWalkUp,
          walkDown: eugeneWalkDown,
          walkLeft: eugeneWalkLeft,
          walkRight: eugeneWalkRight,
          sleep: eugeneSleep,
          eat: eugeneEat
        };
      case 'alex':
        console.log('Loading Alex sprites in house');
        return {
          stand: alexStand,
          walkUp: alexWalkUp,
          walkDown: alexWalkDown,
          walkLeft: alexWalkLeft,
          walkRight: alexWalkRight,
          sleep: alexSleep,
          eat: alexEat
        };
      case 'louise':
        console.log('Loading Louise sprites in house');
        return {
          stand: louiseStand,
          walkUp: louiseWalkUp,
          walkDown: louiseWalkDown,
          walkLeft: louiseWalkLeft,
          walkRight: louiseWalkRight,
          sleep: louiseSleep,
          eat: louiseEat
        };
      default:
        console.log('No valid character selected in house, defaulting to Louise');
        return {
          stand: louiseStand,
          walkUp: louiseWalkUp,
          walkDown: louiseWalkDown,
          walkLeft: louiseWalkLeft,
          walkRight: louiseWalkRight,
          sleep: louiseSleep,
          eat: louiseEat
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
      onExit({ x: 6, y: 2 });
    }
  };

  const renderGrid = () => {
    const cells = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const isExitPoint = col === 5 && row === 5;
        const isSleepArea = col === SLEEP_AREA.x && row === SLEEP_AREA.y;
        const collisionPoint = INTERIOR_COLLISION_MAP.find(point => point.x === col && point.y === row);
        const collisionClass = collisionPoint ? `collision ${collisionPoint.type}` : '';
        
        cells.push(
          <div
            key={`${row}-${col}`}
            className={`grid-cell ${collisionClass} ${isExitPoint ? 'teleport' : ''} ${isSleepArea ? 'sleep-area' : ''}`}
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
    if (isSleeping || isPaused || isDialogActive) return; // Prevent action if sleeping, paused, or dialog is active

    let newX = position.x;
    let newY = position.y;
    const speed = 20;
    const energyCost = 0.5;
    const cleanlinessCost = 0.5;

    // Handle number keys for item slots (1-9)
    if (e.key >= '1' && e.key <= '9') {
      const slotIndex = parseInt(e.key) - 1;
      const item = inventory[slotIndex];
      if (item && onUseItem) {
        console.log(`Using item from slot ${e.key}:`, item);
        onUseItem(item);
        // Prevent default behavior if an item is used
        e.preventDefault();
      }
      return; // Stop processing other keys if a number key was pressed
    }

    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        newY = Math.max(0, position.y - speed);
        setFacing('up');
        setEnergy(prev => Math.max(0, prev - energyCost));
        setCleanliness(prev => Math.max(0, prev - cleanlinessCost));
        break;
      case 's':
      case 'arrowdown':
        newY = Math.min(INTERIOR_HEIGHT - PLAYER_SIZE, position.y + speed);
        setFacing('down');
        setEnergy(prev => Math.max(0, prev - energyCost));
        setCleanliness(prev => Math.max(0, prev - cleanlinessCost));
        break;
      case 'a':
      case 'arrowleft':
        newX = Math.max(0, position.x - speed);
        setFacing('left');
        setEnergy(prev => Math.max(0, prev - energyCost));
        setCleanliness(prev => Math.max(0, prev - cleanlinessCost));
        break;
      case 'd':
      case 'arrowright':
        newX = Math.min(INTERIOR_WIDTH - PLAYER_SIZE, position.x + speed);
        setFacing('right');
        setEnergy(prev => Math.max(0, prev - energyCost));
        setCleanliness(prev => Math.max(0, prev - cleanlinessCost));
        break;
      default:
        return;
    }

    if (!hasCollision(newX, newY)) {
      checkExitPoint(newX, newY);
      setPosition({ x: newX, y: newY });
      checkSleepProximity(newX, newY);
    }
  };

  const handleKeyUp = (e) => {
    const movementKeys = ['w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
    if (movementKeys.includes(e.key.toLowerCase())) {
      setFacing('stand');
    }
  };

  // Update the useEffect for keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      handleKeyPress(e);
    };

    const handleKeyUpEvent = (e) => {
      handleKeyUp(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUpEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUpEvent);
    };  }, [position, energy, cleanliness, isSleeping, isPaused, isDialogActive, inventory, onUseItem]); // Add all dependencies

  // Add getCharacterPortrait function
  const getCharacterPortrait = () => {
    const characterName = typeof character === 'object' && character !== null ? character.name : character;
    switch (String(characterName).toLowerCase()) {
      case 'eugene':
        return eugenePortrait;
      case 'alex':
        return alexPortrait;
      case 'louise':
      default:
        return louisePortrait;
    }
  };

  // Add formatTime function
  const formatTime = (time) => {
    let hours = time.hours;
    const minutes = time.minutes.toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    
    return `Day ${currentDay} - ${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="interior-container relative">
      {/* Add Dialog Box */}
      {isDialogActive && currentDialog && (
        <>
          <div
            className="fixed top-8 right-8 z-[100] pointer-events-auto"
          >
            <button
              onClick={handleSkipMonologue}
              onMouseEnter={playHover}
              style={{ backgroundColor: 'rgba(55, 65, 81, 0.85)' }}
              className="px-4 py-2 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-lg"
            >
              Skip
            </button>
          </div>
          <div
            className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-auto"
            onClick={() => {
              playClick();
              handleAdvanceMonologue();
            }}
          >
            <div className="flex flex-col items-center pointer-events-auto">
              <DialogBox
                key={dialogIndex}
                characterName={character?.name || 'Character'}
                expression="smile"
                dialogue={currentDialog[dialogIndex]}
                onAdvance={handleAdvanceMonologue}
              />
            </div>
          </div>
        </>
      )}

      {/* Add Eating Animation */}
      <AnimatePresence>
        {showEatAnimation && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <img 
              src={characterSprites.eat}
              alt="Eating"
              className="w-32 h-32 object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add UI Elements - Hide during dialog */}
      {!isDialogActive && !isSleeping && (
        <>          <div className="absolute top-4 left-4 z-50 text-white flex items-center border-8 border-[#D2B48C]" style={{ backgroundColor: '#8B4513', padding: '10px', borderRadius: '10px' }}>
            {/* Character Portrait */}
            <div className="w-24 h-28 rounded-lg border-2 border-yellow-500 overflow-hidden flex items-center justify-center bg-gray-700 shadow-lg">
              <img
                src={getCharacterPortrait()}
                alt={`${character?.name || character} Portrait`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Character Info and Stats */}
            <div className="ml-4 flex flex-col justify-center">              {/* Character Name */}
              <span className="text-base font-bold mb-1">{character?.name || 'Character Name'}</span>

              {/* Stat Bars - Left-aligned Inverted Pyramid Layout */}
              <div className="flex flex-col gap-1">
                {/* Health - Longest bar (top) */}
                <div className="flex items-center gap-3">
                  <span className="text-sm flex items-center w-24">
                    <img src={heartIcon} alt="HP" className="w-6 h-6 mr-1" /> {Math.round(health)}/100
                  </span>
                  <div className="w-32 h-4 bg-gray-700 rounded overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${health}%` }}></div>
                  </div>
                </div>

                {/* Hunger - Second longest */}
                <div className="flex items-center gap-3">
                  <span className="text-sm flex items-center w-24">
                    <img src={hungerIcon} alt="Hunger" className="w-6 h-6 mr-1" /> {Math.round(hunger)}/100
                  </span>
                  <div className="w-28 h-4 bg-gray-700 rounded overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: `${hunger}%` }}></div>
                  </div>
                </div>

                {/* Cleanliness - Third longest */}
                <div className="flex items-center gap-3">
                  <span className="text-sm flex items-center w-24">
                    <img src={hygieneIcon} alt="Cleanliness" className="w-6 h-6 mr-1" /> {Math.round(cleanliness)}/100
                  </span>
                  <div className="w-24 h-4 bg-gray-700 rounded overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${cleanliness}%` }}></div>
                  </div>
                </div>

                {/* Happiness - Fourth longest */}
                <div className="flex items-center gap-3">
                  <span className="text-sm flex items-center w-24">
                    <img src={happinessIcon} alt="Happiness" className="w-6 h-6 mr-1" /> {Math.round(happiness)}/100
                  </span>
                  <div className="w-20 h-4 bg-gray-700 rounded overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${happiness}%` }}></div>
                  </div>
                </div>

                {/* Energy - Shortest bar (bottom) */}
                <div className="flex items-center gap-3">
                  <span className="text-sm flex items-center w-24">
                    <img src={energyIcon} alt="Energy" className="w-6 h-6 mr-1" /> {Math.round(energy)}/100
                  </span>
                  <div className="w-16 h-4 bg-gray-700 rounded overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${energy}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>          {/* Money stat */}
          <div className="absolute top-[180px] left-4 z-50 flex flex-col gap-1 text-white text-xs">
            <div className="flex items-center gap-2 px-3 py-2">
              <img src={moneyIcon} alt="Money" className="w-8 h-8" />
              <span className="text-lg font-bold">{money}</span>
            </div>
          </div>

          {/* Time Display */}
          <div className="absolute top-[220px] left-4 z-50 text-white text-xs border-4 border-[#D2B48C]" style={{ backgroundColor: '#8B4513', padding: '5px', borderRadius: '5px' }}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{formatTime(gameTime)}</span>
            </div>
          </div>

          {/* Add Inventory */}
          <Inventory 
            items={inventory} 
            onUseItem={onUseItem}
          />

          {/* Add QuestFolder */}
          <QuestFolder quests={quests} />

          {/* Add ActiveQuestFolderUI */}
          <div className="fixed right-8 top-[25%] transform -translate-y-1/2 z-[90] scale-125">
            <ActiveQuestFolderUI quests={quests} />
          </div>

          {/* Add Pause Button */}
          {!isPaused && (
            <img
              src={pauseButton}
              alt="Pause"
              onClick={handlePause}
              className="fixed top-4 right-4 z-50 cursor-pointer"
              style={{ width: 96, height: 96, objectFit: 'contain' }}
            />
          )}
        </>
      )}

      {showSleepConfirmPopup && !isSleeping && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
          <div className="bg-[#8B4513] p-8 rounded-lg max-w-md w-full mx-4 relative border-8 border-[#D2B48C] shadow-lg flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold text-center text-[#F5DEB3]">Sleep or Save?</h2>
            {!isSleepTime() && (
              <p className="text-red-400 text-center text-sm">You can only sleep between 9 PM and 6 AM</p>
            )}
            <p className="text-[#F5DEB3] text-center text-sm">Sleep to restore energy and happiness, or just save your progress.</p>
            <div className="flex flex-col gap-2">
              <button 
                className="bg-[#8B4513] text-[#F5DEB3] px-6 py-2 rounded border-4 border-[#D2B48C] hover:bg-[#A0522D] hover:border-[#F5DEB3] hover:scale-105 transition-all duration-200 w-32"
                onClick={handleSleep}
                disabled={!isSleepTime()}
              >
                Sleep
              </button>              <button 
                className="bg-[#8B4513] text-[#F5DEB3] px-6 py-2 rounded border-4 border-[#D2B48C] hover:bg-[#A0522D] hover:border-[#F5DEB3] hover:scale-105 transition-all duration-200 w-32"
                onClick={() => { 
                  saveGame(); 
                  showObjective("Game saved! Your progress has been preserved.");
                  setShowSleepConfirmPopup(false); 
                }}
              >
                Save Game
              </button>
              <button 
                className="bg-[#8B4513] text-[#F5DEB3] px-6 py-2 rounded border-4 border-[#D2B48C] hover:bg-[#A0522D] hover:border-[#F5DEB3] hover:scale-105 transition-all duration-200 w-32"
                onClick={() => setShowSleepConfirmPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sleep Overlay */}
      <AnimatePresence>
        {isSleeping && (
          <motion.div
            className="fixed inset-0 bg-black z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }} // Reduced from 1 to 0.5 seconds
          />
        )}
      </AnimatePresence>

      {/* Sleep Animation */}
      <AnimatePresence>
        {isSleeping && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }} // Reduced from 1 to 0.5 seconds
          >
            <img 
              src={characterSprites.sleep}
              alt="Sleeping" 
              className="w-32 h-32 object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="interior"
        style={{
          width: `${INTERIOR_WIDTH}px`,
          height: `${INTERIOR_HEIGHT}px`,
          backgroundImage: `url(${houseInside})`,
          backgroundSize: '100% 100%',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <div className="grid" style={{ position: 'absolute', width: '100%', height: '100%' }}>
          {renderGrid()}
          {/* Add sleep detection marker */}
          {/* Recalculate marker position based on SLEEP_AREA_PIXEL and offset */}
          {(() => {
            const sleepMarkerX = SLEEP_AREA_PIXEL.x - 50; // Use the same offset as detection
            const sleepMarkerY = SLEEP_AREA_PIXEL.y + (GRID_SIZE / 2);
            return (
              <div
                key="sleep-marker"
                style={{
                  position: 'absolute',
                  left: sleepMarkerX - 5, // Adjust position to center the 10px marker
                  top: sleepMarkerY - 5, // Adjust position to center the 10px marker
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'red',
                  borderRadius: '50%',
                  border: '2px solid yellow',
                  zIndex: 10, // High z-index to be visible
                }}
              />
            );
          })()}
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
            display: isSleeping ? 'none' : 'block'
          }}
        />
      </div>

      {/* Add Pause Menu */}
      {isPaused && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
        >
          <div className="bg-[#8B4513] p-8 rounded-lg max-w-md w-full mx-4 relative border-8 border-[#D2B48C] shadow-lg flex flex-col items-center gap-8">
            <h2 className="text-2xl font-bold mb-2 text-center text-[#F5DEB3] tracking-widest">PAUSED</h2>
            <div className="flex flex-col items-center gap-6 w-full">
              <button className="pause-menu-btn w-56" onClick={handleResume}>Resume</button>
              <button className="pause-menu-btn w-56" onClick={handleSettings}>Settings</button>
              <button className="pause-menu-btn w-56" onClick={handleExit}>Exit</button>
            </div>
          </div>
        </div>      )}      {/* Skyrim-style Objective Popups - Top Middle - Posisi diturunkan sedikit */}
      <div className="fixed top-28 left-1/2 transform -translate-x-1/2 z-[60] pointer-events-none text-center">
        <AnimatePresence>
          {/* Objectives display - Supports both individual and chained objectives */}
          {completedObjectives.map((completedObj) => {
            // Find if there's a chained new objective
            const chainedObj = completedObj.hasNextObjective ? 
              newObjectives.find(newObj => newObj.id === completedObj.id) : null;
              
            return (              <motion.div
                key={`chain-${completedObj.id}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mb-3"
              >
                {/* Completed objective */}
                <p className="text-yellow-400 text-xl font-medium drop-shadow-lg tracking-wide">
                  <span className="line-through">✓ {completedObj.text}</span>
                </p>
                  {/* Chained new objective - only show if this completed objective has a chained one */}                {chainedObj && (
                  <div className="mt-2 pt-2">
                    <p className="text-white text-xl font-medium drop-shadow-lg tracking-wide">
                      ▶ {chainedObj.text}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
          
          {/* Standalone new objectives (those not chained from a completed objective) */}
          {newObjectives
            .filter(objective => !objective.isChainedFromPrevious)
            .map((objective) => (
              <motion.div
                key={`new-${objective.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="mb-3"
            >
              <p className="text-white text-xl font-medium drop-shadow-lg tracking-wide">
                {objective.text}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Settings Popup */}
      {showSettings && (
        <Settings
          onClose={handleCloseSettings}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          sfxVolume={sfxVolume}
          setSfxVolume={setSfxVolume}
          musicEnabled={musicEnabled}
          setMusicEnabled={setMusicEnabled}
          musicVolume={musicVolume}
          setMusicVolume={setMusicVolume}
        />
      )}
    </div>
  );
};

export default HouseInterior;