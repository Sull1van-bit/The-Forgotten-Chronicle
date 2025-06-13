import React, { useState, useEffect, useRef } from 'react';
import castleTombInside from '../../assets/Interior/castle-tomb.png';
import royalDocumentIcon from '../../assets/items/royal-document.png';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
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
import CreditScene from '../../components/CreditScene';

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

// Define collision points for tomb interior (12x8 grid based on 100px grid size)
const TOMB_COLLISION_MAP = [
  // Top wall
  ...Array.from({ length: 12 }, (_, i) => ({ x: i, y: 0, type: 'full' })),
  // Bottom wall (except entrance)
  { x: 0, y: 7, type: 'full' },
  { x: 1, y: 7, type: 'full' },
  { x: 2, y: 7, type: 'full' },
  { x: 3, y: 7, type: 'full' },
  { x: 4, y: 7, type: 'full' },
  // x: 5, y: 7 is the entrance (center bottom)
  { x: 6, y: 7, type: 'full' },
  { x: 7, y: 7, type: 'full' },
  { x: 8, y: 7, type: 'full' },
  { x: 9, y: 7, type: 'full' },
  { x: 10, y: 7, type: 'full' },
  { x: 11, y: 7, type: 'full' },
  // Left wall
  ...Array.from({ length: 7 }, (_, i) => ({ x: 0, y: i, type: 'full' })),
  // Right wall
  ...Array.from({ length: 7 }, (_, i) => ({ x: 11, y: i, type: 'full' })),
  // Interior structures - tomb pillars/sarcophagi
  { x: 2, y: 2, type: 'full' },
  { x: 3, y: 2, type: 'full' },
  { x: 8, y: 2, type: 'full' },
  { x: 9, y: 2, type: 'full' },
  { x: 2, y: 5, type: 'full' },
  { x: 3, y: 5, type: 'full' },  { x: 8, y: 5, type: 'full' },
  { x: 9, y: 5, type: 'full' },
  // Additional vertical collision walls
  // Column from (4,0) to (4,6)
  ...Array.from({ length: 7 }, (_, i) => ({ x: 4, y: i, type: 'full' })),
  // Column from (7,0) to (7,6)
  ...Array.from({ length: 7 }, (_, i) => ({ x: 7, y: i, type: 'full' })),
];

const CastleTomb = ({ 
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
  saveGame,
  showEatAnimation,
  setShowEatAnimation,
  currentDay,
  setCurrentDay,
  plantedCrops,
  setPlantedCrops
}) => {
  const { user } = useAuth();
  const { removeItemFromInventory, addItemToInventory } = useGame();
  const { soundEnabled, setSoundEnabled, sfxVolume, setSfxVolume, playClick, playHover } = useSound();
  const { musicEnabled, setMusicEnabled, musicVolume, setMusicVolume } = useMusic();
  const { isDialogActive, currentDialog, dialogIndex, startDialog, advanceDialog, endDialog } = useDialog();

  const [facing, setFacing] = useState('stand');
  
  // Objective popup state
  const [completedObjectives, setCompletedObjectives] = useState([]);
  const [newObjectives, setNewObjectives] = useState([]);
  
  // Credits state
  const [showCredits, setShowCredits] = useState(false);

  const INTERIOR_WIDTH = 1200;   // Increased width for better visibility
  const INTERIOR_HEIGHT = 800;   // Increased height for better visibility
  const GRID_SIZE = 100;          // Standard grid size matching main game
  const PLAYER_SIZE = 26;
  const PLAYER_SCALE_INTERIOR = 3.5; // Scale to match main game
  const PLAYER_SCALED_SIZE = PLAYER_SIZE * PLAYER_SCALE_INTERIOR;
  const GRID_COLS = Math.floor(INTERIOR_WIDTH / GRID_SIZE); // 12 columns
  const GRID_ROWS = Math.floor(INTERIOR_HEIGHT / GRID_SIZE); // 8 rows

  // Add state to track pressed keys for diagonal movement
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [isMoving, setIsMoving] = useState(false);
  const moveSpeed = 10;
  const moveTimeoutRef = useRef(null);

  // Add state for royal document
  const [royalDocumentCollected, setRoyalDocumentCollected] = useState(false);
  const [nearRoyalDocument, setNearRoyalDocument] = useState(false);
  // Define Royal Document position (grid coordinates in tomb)
  const ROYAL_DOCUMENT_POSITION_GRID = { x: 5.5, y: 1 }; // Between (5,1) and (6,1)
  const ROYAL_DOCUMENT_POSITION_PIXEL = { 
    x: ROYAL_DOCUMENT_POSITION_GRID.x * GRID_SIZE, 
    y: ROYAL_DOCUMENT_POSITION_GRID.y * GRID_SIZE 
  };
  const ROYAL_DOCUMENT_SIZE = 32;

  // Define the exit areas (entrance to tomb at bottom center)
  const EXIT_AREAS = [
    { x: 5, y: 7 }, // Bottom center exit
    { x: 6, y: 7 }  // Additional exit point
  ];

  // Check if player is near any exit
  const isNearExit = (playerX, playerY) => {
    const playerGridX = Math.floor(playerX / GRID_SIZE);
    const playerGridY = Math.floor(playerY / GRID_SIZE);
    return EXIT_AREAS.some(exitArea => 
      playerGridX === exitArea.x && playerGridY === exitArea.y
    );  };

  // Collision detection for tomb
  const hasCollision = (x, y) => {
    const gridX = Math.floor(x / GRID_SIZE);
    const gridY = Math.floor(y / GRID_SIZE);

    // Check boundaries
    if (gridX < 0 || gridX >= GRID_COLS || gridY < 0 || gridY >= GRID_ROWS) {
      return true;
    }

    // Check collision map
    return TOMB_COLLISION_MAP.some(collision => 
      collision.x === gridX && collision.y === gridY
    );
  };

  // Handle exit
  const handleExitTomb = () => {
    onExit({ x: 57, y: 10 }); // Spawn point outside the tomb
  };
  // Check proximity to Royal Document
  const checkRoyalDocumentProximity = (playerX, playerY) => {
    if (royalDocumentCollected) {
      setNearRoyalDocument(false);
      return false;
    }
    
    // Allow interaction if player is in the tomb (no specific quest requirements)
    const playerCenterX = playerX + (PLAYER_SCALED_SIZE / 2);
    const playerCenterY = playerY + (PLAYER_SCALED_SIZE / 2);
    const documentCenterX = ROYAL_DOCUMENT_POSITION_PIXEL.x + (ROYAL_DOCUMENT_SIZE / 2);
    const documentCenterY = ROYAL_DOCUMENT_POSITION_PIXEL.y + (ROYAL_DOCUMENT_SIZE / 2);
    const distance = Math.sqrt(
      Math.pow(playerCenterX - documentCenterX, 2) + Math.pow(playerCenterY - documentCenterY, 2)
    );
    const proximityThreshold = GRID_SIZE * 1.5;    const isNear = distance < proximityThreshold;
    setNearRoyalDocument(isNear);
    return isNear;
  };

  // Handle Royal Document Collection with Dialog Sequences
  const handleRoyalDocumentCollection = () => {
    if (royalDocumentCollected) return;
    
    setRoyalDocumentCollected(true);
    addItemToInventory('Royal Document');
    
    // Royal Document Dialog Sequence
    const royalDocumentDialogs = [
      {
        speaker: typeof character === 'string' ? character : character?.name || 'Character',
        dialogue: [
          "An ancient parchment lies before me, covered in royal seals and faded ink.",
          "The text speaks of a prophecy... something about an heir to the throne.",
          "\"When the kingdom faces its darkest hour, one of common birth shall rise...\"",
          "\"...bearing the mark of wisdom and courage, to claim the crown that was lost.\"",
          "This document... it's a royal decree of succession. But who could it refer to?",
          "Wait... there's something else happening. The air grows cold..."
        ]
      },
      {
        speaker: "Ancient King",
        dialogue: [
          "*A spectral figure materializes before you, wearing a crown of fading light*",
          "So... after all these years, someone has found the decree.",
          "I am the last king of this realm, bound to this tomb until my successor is found.",
          "You who read these words... do you seek the truth of your destiny?",
          "The prophecy was written in blood and sealed with hope.",
          "Many have tried to claim the throne through force, but the crown chooses its bearer.",
          "If you are truly the one foretold, you must prove your worth through trials.",
          "Seek the three ancient artifacts: the Crown of Wisdom, the Blade of Courage, and the Heart of Compassion.",
          "Only when all three are united can the rightful heir ascend to the throne.",
          "But beware... others seek these relics for darker purposes.",
          "Go now, young one. Your journey as the heir apparent begins.",
          "*The king's spirit begins to fade, but his voice echoes one final warning*",
          "Trust few, question everything, and remember... true power comes from serving others."
        ]
      }
    ];    // Start the royal document dialog sequence
    let currentDialogIndex = 0;
    
    const startNextDialog = () => {
      if (currentDialogIndex < royalDocumentDialogs.length) {
        startDialog({
          characterName: royalDocumentDialogs[currentDialogIndex].speaker,
          expression: 'neutral',
          dialogue: royalDocumentDialogs[currentDialogIndex].dialogue,
          onComplete: () => {
            currentDialogIndex++;
            if (currentDialogIndex < royalDocumentDialogs.length) {
              // Continue to next dialog after a brief pause
              setTimeout(startNextDialog, 500);
            } else {
              // All dialogs complete - trigger new quest
              handleNewQuestUnlock();
            }
          }
        });
      }
    };
    
    startNextDialog();
  };

  // Handle unlocking the new quest after king's dialog
  const handleNewQuestUnlock = () => {
    // Find and complete "The Lost Ledger" quest
    setQuests(prevQuests => {
      const updatedQuests = prevQuests.map(quest => {
        if (quest.title === "The Lost Ledger") {
          const updatedObjectives = quest.objectives.map(obj => ({ ...obj, completed: true }));
          return { ...quest, objectives: updatedObjectives, completed: true };
        }
        return quest;
      });

      // Add the new quest "The Heir's Trial"
      const newQuest = {
        id: `quest-${Date.now()}`,
        title: "The Heir's Trial",
        description: "The ancient king has revealed your destiny as the prophesied heir. Seek the three legendary artifacts to prove your worth and claim the throne.",
        objectives: [
          { 
            id: 1, 
            description: "Find the Crown of Wisdom", 
            completed: false,
            clue: "Seek knowledge where scholars once gathered"
          },
          { 
            id: 2, 
            description: "Find the Blade of Courage", 
            completed: false,
            clue: "Where warriors proved their mettle in combat"
          },
          { 
            id: 3, 
            description: "Find the Heart of Compassion", 
            completed: false,
            clue: "Where the suffering found solace and healing"
          },
          { 
            id: 4, 
            description: "Unite the three artifacts at the ancient altar", 
            completed: false,
            clue: "Return to where the prophecy was first spoken"
          }
        ],
        completed: false,
        reward: {
          experience: 1000,
          gold: 500,
          items: ["Royal Crown", "Kingdom Seal"]
        }
      };

      return [...updatedQuests, newQuest];
    });

    // Show objective popup for the new quest
    setNewObjectives(prev => [...prev, "New Quest: The Heir's Trial"]);
    
    // Remove popup after delay
    setTimeout(() => {
      setNewObjectives(prev => prev.filter(obj => obj !== "New Quest: The Heir's Trial"));
    }, 4000);
  };

  // Movement handling
  const handleMovement = (direction) => {
    if (isDialogActive || isPaused) return;

    const currentX = position.x || 0;
    const currentY = position.y || 0;
    let newX = currentX;
    let newY = currentY;

    switch (direction) {
      case 'up':
        newY = Math.max(0, currentY - moveSpeed);
        setFacing('up');
        break;
      case 'down':
        newY = Math.min(INTERIOR_HEIGHT - PLAYER_SCALED_SIZE, currentY + moveSpeed);
        setFacing('down');
        break;
      case 'left':
        newX = Math.max(0, currentX - moveSpeed);
        setFacing('left');
        break;
      case 'right':
        newX = Math.min(INTERIOR_WIDTH - PLAYER_SCALED_SIZE, currentX + moveSpeed);
        setFacing('right');
        break;
    }

    if (!hasCollision(newX, newY)) {
      setPosition({ x: newX, y: newY });
      setIsMoving(true);

      // Check for exit
      if (isNearExit(newX, newY)) {
        handleExitTomb();
      }

      // Check proximity to Royal Document
      checkRoyalDocumentProximity(newX, newY);

      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
      moveTimeoutRef.current = setTimeout(() => {
        setIsMoving(false);
        setFacing('stand');
      }, 200);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isDialogActive || isPaused) return;

      const key = event.key.toLowerCase();
      if (!pressedKeys.has(key)) {
        setPressedKeys(prev => new Set(prev.add(key)));
      }

      switch (key) {
        case 'w':
        case 'arrowup':
          handleMovement('up');
          break;
        case 's':
        case 'arrowdown':
          handleMovement('down');
          break;
        case 'a':
        case 'arrowleft':
          handleMovement('left');
          break;
        case 'd':
        case 'arrowright':
          handleMovement('right');
          break;        case 'escape':
          if (!isDialogActive) {
            handlePause();
          }
          break;        case 'e':
          // Handle royal document interaction
          if (nearRoyalDocument && !royalDocumentCollected) {
            handleRoyalDocumentCollection();
          }
          break;
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });

      // Stop movement when key is released
      if (['w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        setIsMoving(false);
        setFacing('stand');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isDialogActive, isPaused, position]);

  // Get character sprites
  const getCharacterSprites = () => {
    const characterName = typeof character === 'string' ? character : character?.name;
    
    switch (characterName) {
      case 'Eugene':
        return {
          stand: eugeneStand,
          up: eugeneWalkUp,
          down: eugeneWalkDown,
          left: eugeneWalkLeft,
          right: eugeneWalkRight
        };
      case 'Louise':
        return {
          stand: louiseStand,
          up: louiseWalkUp,
          down: louiseWalkDown,
          left: louiseWalkLeft,
          right: louiseWalkRight
        };
      case 'Alex':
        return {
          stand: alexStand,
          up: alexWalkUp,
          down: alexWalkDown,
          left: alexWalkLeft,
          right: alexWalkRight
        };
      default:
        return {
          stand: eugeneStand,
          up: eugeneWalkUp,
          down: eugeneWalkDown,
          left: eugeneWalkLeft,
          right: eugeneWalkRight
        };
    }
  };

  const sprites = getCharacterSprites();
  const currentSprite = sprites[facing] || sprites.stand;
  const characterName = typeof character === 'string' ? character : character?.name;
  return (
    <div className="game-container">
      {/* Background */}
      <div 
        className="game-map"
        style={{
          backgroundImage: `url(${castleTombInside})`,
          backgroundSize: `${INTERIOR_WIDTH}px ${INTERIOR_HEIGHT}px`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          width: '100vw',
          height: '100vh',
          position: 'relative',
          imageRendering: 'pixelated',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >        {/* Tomb Container */}
        <div 
          style={{
            position: 'relative',
            width: `${INTERIOR_WIDTH}px`,
            height: `${INTERIOR_HEIGHT}px`,
            backgroundImage: `url(${castleTombInside})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            imageRendering: 'pixelated'
          }}
        >          {/* Debug Grid Overlay */}
          {Array.from({ length: GRID_ROWS }, (_, row) => 
            Array.from({ length: GRID_COLS }, (_, col) => (
              <div
                key={`grid-${row}-${col}`}
                style={{
                  position: 'absolute',
                  left: `${col * GRID_SIZE}px`,
                  top: `${row * GRID_SIZE}px`,
                  width: `${GRID_SIZE}px`,
                  height: `${GRID_SIZE}px`,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxSizing: 'border-box',
                  pointerEvents: 'none',
                  zIndex: 5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                }}
              >
                {col},{row}
              </div>
            ))
          )}

          {/* Collision Overlay */}
          {TOMB_COLLISION_MAP.map((collision, index) => (
            <div
              key={`collision-${index}`}
              style={{
                position: 'absolute',
                left: `${collision.x * GRID_SIZE}px`,
                top: `${collision.y * GRID_SIZE}px`,
                width: `${GRID_SIZE}px`,
                height: `${GRID_SIZE}px`,
                backgroundColor: 'rgba(255, 0, 0, 0.3)',
                border: '2px solid rgba(255, 0, 0, 0.6)',
                boxSizing: 'border-box',
                pointerEvents: 'none',
                zIndex: 6
              }}
            />
          ))}          {/* Exit Area Indicators */}
          {EXIT_AREAS.map((exitArea, index) => (
            <div
              key={`exit-${index}`}
              style={{
                position: 'absolute',
                left: `${exitArea.x * GRID_SIZE}px`,
                top: `${exitArea.y * GRID_SIZE}px`,
                width: `${GRID_SIZE}px`,
                height: `${GRID_SIZE}px`,
                backgroundColor: 'rgba(0, 255, 0, 0.3)',
                border: '2px solid rgba(0, 255, 0, 0.6)',
                boxSizing: 'border-box',
                pointerEvents: 'none',
                zIndex: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: 'white',
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
              }}
            >
              EXIT
            </div>
          ))}          {/* Royal Document Sprite */}
          {!royalDocumentCollected && (
            <img
              src={royalDocumentIcon}
              alt="Royal Document"
              className="absolute pixelated"
              style={{
                left: `${ROYAL_DOCUMENT_POSITION_PIXEL.x}px`,
                top: `${ROYAL_DOCUMENT_POSITION_PIXEL.y}px`,
                width: `${ROYAL_DOCUMENT_SIZE}px`,
                height: `${ROYAL_DOCUMENT_SIZE}px`,
                zIndex: 5,
              }}
            />
          )}

          {/* Player Character */}
          <div
            className="player"
            style={{
              position: 'absolute',
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${PLAYER_SIZE}px`,
              height: `${PLAYER_SIZE}px`,
              transform: `scale(${PLAYER_SCALE_INTERIOR})`,
              transformOrigin: 'top left',
              backgroundImage: `url(${currentSprite})`,
              backgroundSize: 'cover',
              imageRendering: 'pixelated',
              zIndex: 10,
            }}
          />          {/* Exit Indicator */}
          {isNearExit(position.x, position.y) && (
            <div
              style={{
                position: 'absolute',
                left: `${EXIT_AREAS[0].x * GRID_SIZE + 50}px`,
                top: `${EXIT_AREAS[0].y * GRID_SIZE - 20}px`,
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                zIndex: 15,
                pointerEvents: 'none'
              }}
            >
              Press any movement key to exit
            </div>
          )}

          {/* Royal Document Indicator */}
          {!royalDocumentCollected && (
            <div
              style={{
                position: 'absolute',
                left: `${ROYAL_DOCUMENT_POSITION_PIXEL.x}px`,
                top: `${ROYAL_DOCUMENT_POSITION_PIXEL.y}px`,
                width: `${ROYAL_DOCUMENT_SIZE}px`,
                height: `${ROYAL_DOCUMENT_SIZE}px`,
                backgroundColor: 'rgba(255, 255, 0, 0.8)',
                border: '2px solid rgba(255, 255, 0, 1)',
                borderRadius: '50%',
                boxShadow: '0 0 10px rgba(255, 255, 0, 0.8)',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',                justifyContent: 'center',
                cursor: 'default',
                pointerEvents: 'auto'
              }}
              onMouseEnter={() => setNearRoyalDocument(true)}
              onMouseLeave={() => setNearRoyalDocument(false)}
            >
              <span style={{
                color: 'black',
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(255, 255, 255, 0.8)',
                fontSize: '16px',
                pointerEvents: 'none'
              }}>
                📜
              </span>
            </div>
          )}
        </div>
      </div>

      {/* UI Elements */}
      {!isDialogActive && !showCredits && (
        <div className="ui-container" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 100
        }}>
          {/* Stats Bar */}
          {!isDialogActive && (
            <div className="stats-bar" style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              pointerEvents: 'auto'
            }}>
            <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <img src={heartIcon} alt="Health" style={{ width: '20px', height: '20px' }} />
              <span style={{ color: 'white', fontSize: '14px', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                {health}/100
              </span>
            </div>
            <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <img src={energyIcon} alt="Energy" style={{ width: '20px', height: '20px' }} />
              <span style={{ color: 'white', fontSize: '14px', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                {energy}/100
              </span>
            </div>
            <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <img src={hungerIcon} alt="Hunger" style={{ width: '20px', height: '20px' }} />
              <span style={{ color: 'white', fontSize: '14px', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                {hunger}/100
              </span>
            </div>
            <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <img src={happinessIcon} alt="Happiness" style={{ width: '20px', height: '20px' }} />
              <span style={{ color: 'white', fontSize: '14px', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                {happiness}/100
              </span>
            </div>
            <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <img src={hygieneIcon} alt="Cleanliness" style={{ width: '20px', height: '20px' }} />
              <span style={{ color: 'white', fontSize: '14px', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                {cleanliness}/100
              </span>
            </div>
            <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <img src={moneyIcon} alt="Money" style={{ width: '20px', height: '20px' }} />
              <span style={{ color: 'white', fontSize: '14px', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                ${money}
              </span>
            </div>
          </div>
          )}

          {/* Pause Button */}
          {!isDialogActive && (
            <button
              onClick={handlePause}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
            >
              <img 
                src={pauseButton} 
                alt="Pause" 
                style={{ 
                  width: '40px', 
                  height: '40px',
                  imageRendering: 'pixelated'
                }} 
              /> 
            </button>
          )}

          {/* Credit Button */}
          {!isDialogActive && (
            <button
              onClick={() => {
                playClick();
                setShowCredits(true);
              }}
              onMouseEnter={playHover}
              style={{
                position: 'absolute',
                top: '20px',
                right: '80px',
                background: 'rgba(0, 0, 0, 0.7)',
                border: '2px solid #F5DEB3',
                borderRadius: '8px',
                color: '#F5DEB3',
                padding: '8px 16px',
                cursor: 'pointer',
                pointerEvents: 'auto',
                fontSize: '14px',
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(245, 222, 179, 0.2)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(0, 0, 0, 0.7)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Credits
            </button>
          )}
        </div>
      )}

      {/* Dialog Box */}
      {isDialogActive && (
        <DialogBox
          character={characterName}
          dialogue={currentDialog?.dialogue || []}
          currentIndex={dialogIndex}
          onNext={advanceDialog}
          onSkip={endDialog}
          characterPortrait={
            characterName === 'Eugene' ? eugenePortrait :
            characterName === 'Louise' ? louisePortrait :
            characterName === 'Alex' ? alexPortrait :
            eugenePortrait
          }
        />
      )}

      {/* Settings Menu */}
      {showSettings && (
        <Settings
          onClose={handleCloseSettings}
          onExit={handleExit}
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

      {/* Objective Popups */}
      {!isDialogActive && !showCredits && (
        <AnimatePresence>
          {newObjectives.map((objective, index) => (
            <motion.div
              key={`${objective}-${index}`}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              style={{
                position: 'fixed',
                top: `${120 + index * 60}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '5px',
                fontSize: '16px',
                fontWeight: 'bold',
                zIndex: 1000,
                pointerEvents: 'none',
              }}
            >
              {objective}
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Royal Document Interaction Prompt */}
      {nearRoyalDocument && !royalDocumentCollected && !isDialogActive && (
        <div 
          className="absolute z-10 pointer-events-none"
          style={{
            left: `${ROYAL_DOCUMENT_POSITION_PIXEL.x + (ROYAL_DOCUMENT_SIZE / 2)}px`,
            top: `${ROYAL_DOCUMENT_POSITION_PIXEL.y - 40}px`,
            transform: 'translateX(-50%)',
          }}
        >          <div className="bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap">
            Press E to examine
          </div>
        </div>
      )}

      {/* Credits Modal */}
      {showCredits && (
        <CreditScene onComplete={() => setShowCredits(false)} />
      )}
    </div>
  );
};

export default CastleTomb;
