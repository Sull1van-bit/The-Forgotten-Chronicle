import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSound } from '../context/SoundContext';
import { useMusic } from '../context/MusicContext';
import { AnimatePresence } from 'framer-motion';
import LoadingScreen from '../components/LoadingScreen';
import Cutscene from '../components/Cutscene';
import DialogBox from '../components/DialogBox';
import Settings from '../components/Settings';
import '../styles/Game.css';
// Import character sprites
/*import eugeneStand from '../assets/characters/eugene/stand.gif';
import eugeneWalkUp from '../assets/characters/eugene/walk-up.gif';
import eugeneWalkDown from '../assets/characters/eugene/walk-down.gif';
import eugeneWalkLeft from '../assets/characters/eugene/walk-left.gif';
import eugeneWalkRight from '../assets/characters/eugene/walk-right.gif';

import alexStand from '../assets/characters/alex/stand.gif';
import alexWalkUp from '../assets/characters/alex/walk-up.gif';
import alexWalkDown from '../assets/characters/alex/walk-down.gif';
import alexWalkLeft from '../assets/characters/alex/walk-left.gif';
import alexWalkRight from '../assets/characters/alex/walk-right.gif';
*/

import louiseStand from '../assets/characters/louise/stand.gif';
import louiseWalkUp from '../assets/characters/louise/walk-up.gif';
import louiseWalkDown from '../assets/characters/louise/walk-down.gif';
import louiseWalkLeft from '../assets/characters/louise/walk-left.gif';
import louiseWalkRight from '../assets/characters/louise/walk-right.gif';

// Import maps
import allMap from '../assets/Maps/all-map.png';
import foregroundMap from '../assets/Maps/all-map-foreground.png';
import HouseInterior from './interiors/HouseInterior';

import { useAuth } from '../context/AuthContext';
import { saveFileService } from '../services/saveFileService';
import { createSaveFileData, loadSaveFileData } from '../utils/saveFileUtils';

import pauseButton from '../assets/menu/pause.png';
import pauseMenuBg from '../assets/menu/pauseMenu.png';

// Define collision points using grid coordinates
const COLLISION_MAP = [
  //kali diatas 30s (full collision)
  ...Array.from({ length: 10 }, (_, i) => ({ x: 30, y: i, type: 'full' })),
  ...Array.from({ length: 8 }, (_, i) => ({ x: 31, y: i, type: 'full' })),
  ...Array.from({ length: 3 }, (_, i) => ({ x: 32, y: i, type: 'full' })),
  
  // pagar
  ...Array.from({ length: 4 }, (_, i) => ({ x: i+1, y: 2, type: 'half-bottom' })),
  ...Array.from({ length: 4 }, (_, i) => ({ x: i+2, y: 4, type: 'half-bottom' })),
  ...Array.from({ length: 2 }, (_, i) => ({ x: 6, y: i+3, type: 'half-left' })),
  {x: 1, y: 3, type: 'full'},
  {x: 1, y: 4, type: 'full'},
  // end pagar
  
  // pillar
  ...Array.from({ length: 2 }, (_, i) => ({ x: 32, y: i+8, type: 'full' })),
  ...Array.from({ length: 2 }, (_, i) => ({ x: 33, y: i+8, type: 'full' })),
  ...Array.from({ length: 2 }, (_, i) => ({ x: i+32, y: 12, type: 'full' })),
  ...Array.from({ length: 2 }, (_, i) => ({ x: i+32, y: 13, type: 'half-top' })),
  ...Array.from({ length: 2 }, (_, i) => ({ x: i+40, y: 19, type: 'half-top' })),
  ...Array.from({ length: 3 }, (_, i) => ({ x: i+46, y: 20, type: 'half-top' })),
  ...Array.from({ length: 3 }, (_, i) => ({ x: i+44, y: 26, type: 'half-top' })),
  ...Array.from({ length: 3 }, (_, i) => ({ x: i+44, y: 25, type: 'half-bottom' })),
  {x: 46, y: 19, type: 'half-right'},
  {x: 47, y: 19, type: 'full'},
  {x: 48, y: 19, type: 'half-left'},
  {x: 39, y: 24, type: 'full'},
  {x: 40, y: 24, type: 'half-left'},
  {x: 38, y: 24, type: 'half-right'},
  
  ...Array.from({ length: 2 }, (_, i) => ({ x: i+36, y: 39, type: 'half-bottom' })),
  ...Array.from({ length: 2 }, (_, i) => ({ x: i+36, y: 40, type: 'half-bottom' })),
  {x: 43, y: 39, type: 'half-bottom'},
  {x: 44, y: 39, type: 'half-bottom'},


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
  {x: 36, y: 35, type: 'half-right'},
  {x: 37, y: 35, type: 'full'},
  {x: 42, y: 34, type: 'half-right'},
  {x: 43, y: 34, type: 'full'},
  {x: 44, y: 34, type: 'half-left'},
  ...Array.from({ length: 2 }, (_, i) => ({ x: i+14 , y: 25, type: 'full' })), 
  {x: 9, y: 27, type: 'full'},
  {x: 10, y: 27, type: 'half-left'},
  {x: 8, y: 27, type: 'half-right'},


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
  ...Array.from({ length: 6 }, (_, i) => ({ x: 50-i, y: 31+i, type: 'full' })),
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

// Monologue Script
const monologueScript = [
  "The air carries the scent of damp earth and firewood, familiar yet distant. This place… it should feel like home. But does it?",
  "The cottage stands behind me, quiet and worn. My inheritance—though it is more a burden than a gift. Once, hands worked this land, voices filled these walls. Now, only I remain.",
  "The village elder watches from afar, eyes filled with something unspoken. They remember my family, their deeds, their fall. I have returned, but for what purpose?",
  "Will I mend what was broken, rebuild what was lost? Or will I carve a new path, unshackled from their legacy?",
  "The village calls, the fields await, and somewhere, beneath stone and memory, a forgotten truth lingers. Today, my story begins.",
];

const Game = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const character = location.state?.character;
  const isLoadedGame = location.state?.isLoadedGame;
  const [isLoading, setIsLoading] = useState(true);
  const [showCutscene, setShowCutscene] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [saveFiles, setSaveFiles] = useState([]);
  const [canSave, setCanSave] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { soundEnabled, setSoundEnabled, sfxVolume, setSfxVolume } = useSound();

  // If no character is selected, redirect to main menu
  useEffect(() => {
    if (!character) {
      navigate('/');
    }
  }, [character, navigate]);

  // Load save files when user is authenticated
  useEffect(() => {
    const loadSaveFiles = async () => {
      if (user) {
        try {
          const files = await saveFileService.getUserSaveFiles(user.uid);
          setSaveFiles(files);
        } catch (error) {
          console.error('Error loading save files:', error);
        }
      }
    };

    loadSaveFiles();
  }, [user]);

  // Initial loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Show cutscene only for new games, not loaded games
      if (character && !isLoadedGame) {
        setShowCutscene(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [character, isLoadedGame]);

  const handleCutsceneComplete = () => {
    setShowCutscene(false);
    // Start monologue for new games after cutscene
    if (!isLoadedGame) {
      setShowDialog(true);
      setCurrentDialogueIndex(0);
    }
  };

  // Handle advancing the monologue
  const handleAdvanceMonologue = () => {
    if (currentDialogueIndex < monologueScript.length - 1) {
      setCurrentDialogueIndex(prevIndex => prevIndex + 1);
    } else {
      // End of monologue
      setShowDialog(false);
      setCurrentDialogueIndex(0); // Reset for next time if needed
    }
  };

  // Handle skipping the entire monologue
  const handleSkipMonologue = () => {
    setShowDialog(false);
    setCurrentDialogueIndex(0);
  };

  // Add save point coordinates
  const SAVE_POINTS = [
    { x: 0, y: 2 },
    { x: 0, y: 1 }
  ];

  // Check if player is at a save point
  const checkSavePoint = (x, y) => {
    const playerGridPos = getGridPosition(x, y);
    return SAVE_POINTS.some(point => 
      point.x === playerGridPos.gridX && point.y === playerGridPos.gridY
    );
  };

  // Update save game function
  const saveGame = async () => {
    if (!user || !canSave) return;

    try {
      const gameState = {
        character,
        position,
        facing,
        inventory: [], // Add your inventory state
        quests: [], // Add your quests state
        stats: {
          level: 1,
          playTime: '0:00'
        },
        settings: {
          // Add your game settings
        }
      };

      const saveData = createSaveFileData(gameState);
      await saveFileService.saveGame(user.uid, saveData);
      
      // Refresh save files list
      const files = await saveFileService.getUserSaveFiles(user.uid);
      setSaveFiles(files);
      setShowSavePrompt(false);
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  // Load game function
  const loadGame = async (saveId) => {
    try {
      const gameState = await loadSaveFileData(saveId);
      if (gameState) {
        setPosition(gameState.position);
        setFacing(gameState.facing);
        // Restore any other game state
      }
    } catch (error) {
      console.error('Error loading game:', error);
    }
  };

  const [position, setPosition] = useState({ x: 350, y: 150 });
  const [facing, setFacing] = useState('stand');
  const [isInInterior, setIsInInterior] = useState(false);
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

  // Teleport points
  const TELEPORT_POINTS = [
    { 
      x: 6, 
      y: 1, 
      destination: 'house', 
      spawnPoint: { x: 700, y: 300 }  
    }
  ];

  // Check if player is on teleport point
  const checkTeleport = (x, y) => {
    const playerGridPos = getGridPosition(x, y);
    const teleportPoint = TELEPORT_POINTS.find(
      point => point.x === playerGridPos.gridX && point.y === playerGridPos.gridY
    );

    if (teleportPoint) {
      setIsInInterior(true);
      setPosition(teleportPoint.spawnPoint);
    }
  };

  // Handle exit from interior
  const handleExitInterior = (spawnPoint) => {
    setIsInInterior(false);
    // Convert grid coordinates to pixel coordinates
    setPosition({ 
      x: spawnPoint.x * GRID_SIZE, 
      y: spawnPoint.y * GRID_SIZE 
    });
  };

  // Pause logic
  const handlePause = () => setIsPaused(true);
  const handleResume = () => setIsPaused(false);
  const handleSettings = () => setShowSettings(true);
  const handleCloseSettings = () => setShowSettings(false);
  const handleExit = () => navigate('/');

  // Prevent movement when paused
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isPaused) return;
      console.log('Key pressed:', e.key); // Debug log
      console.log('isInInterior:', isInInterior); // Debug log
      
      if (!isInInterior) {
        let newX = position.x;
        let newY = position.y;

        switch (e.key.toLowerCase()) {
          case 'w':
          case 'arrowup':
            console.log('Moving up'); // Debug log
            newY = position.y - speed;
            if (!hasCollision(newX, newY)) {
              setFacing('up');
              setPosition(prev => {
                console.log('New position:', { ...prev, y: Math.max(0, newY) }); // Debug log
                return { ...prev, y: Math.max(0, newY) };
              });
              // Check if player is at save point
              if (checkSavePoint(newX, newY)) {
                setCanSave(true);
                setShowSavePrompt(true);
              } else {
                setCanSave(false);
                setShowSavePrompt(false);
              }
            }
            break;
          case 's':
          case 'arrowdown':
            console.log('Moving down'); // Debug log
            newY = position.y + speed;
            if (!hasCollision(newX, newY)) {
              setFacing('down');
              setPosition(prev => {
                console.log('New position:', { ...prev, y: Math.min(MAP_HEIGHT - PLAYER_SIZE, newY) }); // Debug log
                return { ...prev, y: Math.min(MAP_HEIGHT - PLAYER_SIZE, newY) };
              });
              checkTeleport(newX, newY);
            }
            break;
          case 'a':
          case 'arrowleft':
            console.log('Moving left'); // Debug log
            newX = position.x - speed;
            if (!hasCollision(newX, newY)) {
              setFacing('left');
              setPosition(prev => {
                console.log('New position:', { ...prev, x: Math.max(0, newX) }); // Debug log
                return { ...prev, x: Math.max(0, newX) };
              });
              checkTeleport(newX, newY);
            }
            break;
          case 'd':
          case 'arrowright':
            console.log('Moving right'); // Debug log
            newX = position.x + speed;
            if (!hasCollision(newX, newY)) {
              setFacing('right');
              setPosition(prev => {
                console.log('New position:', { ...prev, x: Math.min(MAP_WIDTH - PLAYER_SIZE, newX) }); // Debug log
                return { ...prev, x: Math.min(MAP_WIDTH - PLAYER_SIZE, newX) };
              });
              checkTeleport(newX, newY);
            }
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [position, isInInterior, isPaused]);

  // ESC to pause
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsPaused((prev) => !prev);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

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
        const teleportPoint = TELEPORT_POINTS.find(point => point.x === col && point.y === row);
        const cellClass = collisionPoint ? `collision ${collisionPoint.type}` : '';
        const teleportClass = teleportPoint ? 'teleport' : '';
        
        cells.push(
          <div
            key={`${row}-${col}`}
            className={`grid-cell ${cellClass} ${teleportClass}`}
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

  // Add save prompt UI
  const renderSavePrompt = () => {
    if (!showSavePrompt || !canSave) return null;

    return (
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 p-4 rounded-lg text-white z-50">
        <p className="mb-2">Press 'S' to save your game</p>
        <button
          onClick={saveGame}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save Game
        </button>
      </div>
    );
  };

  if (isInInterior) {
    return <HouseInterior position={position} setPosition={setPosition} onExit={handleExitInterior} character={character} />;
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Loading Screen */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <div className="fixed inset-0 z-50">
            <LoadingScreen />
          </div>
        )}
      </AnimatePresence>

      {/* Cutscene */}
      <AnimatePresence mode="wait">
        {showCutscene && (
          <div className="fixed inset-0 z-50">
            <Cutscene onComplete={handleCutsceneComplete} />
          </div>
        )}
      </AnimatePresence>

      {/* Save Game UI */}
      {user && !isLoading && !showCutscene && renderSavePrompt()}

      {/* Dialog Box */}
      {showDialog && (
        <>
          {/* Skip button at the top center, always clickable */}
          <div
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[100] pointer-events-auto"
          >
            <button
              onClick={handleSkipMonologue}
              style={{ backgroundColor: 'rgba(55, 65, 81, 0.85)' }}
              className="px-4 py-2 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-lg"
            >
              Skip
            </button>
          </div>
          {/* Overlay that allows click anywhere to advance monologue */}
          <div
            className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-auto"
            onClick={handleAdvanceMonologue}
          >
            <div
              className="flex flex-col items-center pointer-events-auto"
            >
              <DialogBox
                key={currentDialogueIndex}
                dialogue={monologueScript[currentDialogueIndex]}
                onAdvance={handleAdvanceMonologue}
              />
            </div>
          </div>
        </>
      )}

      {/* Pause Button */}
      {!isPaused && !isLoading && !showCutscene && !showDialog && (
        <img
          src={pauseButton}
          alt="Pause"
          onClick={handlePause}
          className="fixed top-4 right-4 z-50 cursor-pointer"
          style={{ width: 64, height: 64, objectFit: 'contain' }}
        />
      )}

      {/* Pause Menu Popup */}
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
        </div>
      )}

      {/* Settings Popup (from pause menu or elsewhere) */}
      {showSettings && (
        <Settings
          onClose={handleCloseSettings}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          sfxVolume={sfxVolume}
          setSfxVolume={setSfxVolume}
        />
      )}

      {/* Rest of your game content */}
      {!isLoading && !showCutscene && !showDialog && (
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
              <div 
                className="map-foreground"
                style={{
                  width: `${MAP_WIDTH}px`,
                  height: `${MAP_HEIGHT}px`,
                  backgroundImage: `url(${foregroundMap})`,
                  backgroundSize: '100% 100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  pointerEvents: 'none',
                  zIndex: 3,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;

<style>
{`
.pause-menu-btn {
  background: linear-gradient(180deg, rgba(224,185,125,0.92) 0%, rgba(169,124,80,0.92) 100%);
  color: #3a220a;
  font-size: 1.25rem;
  font-weight: bold;
  border: 2.5px solid #7c4f21;
  border-radius: 18px;
  box-shadow: 0 4px 12px rgba(60, 40, 10, 0.18);
  padding: 0.75rem 0;
  margin: 0.5rem 0;
  transition: background 0.2s, color 0.2s, transform 0.1s;
  opacity: 0.96;
  width: 100%;
  max-width: 260px;
  letter-spacing: 1px;
}
.pause-menu-btn:hover {
  background: linear-gradient(180deg, rgba(245,215,161,0.98) 0%, rgba(196,154,108,0.98) 100%);
  color: #a97c50;
  transform: translateY(-2px) scale(1.04);
  opacity: 1;
}
`}
</style> 