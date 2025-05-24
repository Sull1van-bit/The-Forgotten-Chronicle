import React, { useState, useEffect } from 'react';
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
import eugeneStand from '../assets/characters/eugene/stand.gif';
import eugeneWalkUp from '../assets/characters/eugene/walk-up.gif';
import eugeneWalkDown from '../assets/characters/eugene/walk-down.gif';
import eugeneWalkLeft from '../assets/characters/eugene/walk-left.gif';
import eugeneWalkRight from '../assets/characters/eugene/walk-right.gif';
/*
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

import Minimap from '../components/Minimap';

// Define collision points using grid coordinates
const COLLISION_MAP = [
  ...Array.from({ length: 10 }, (_, i) => ({ x: 30, y: i, type: 'full' })),
  ...Array.from({ length: 8 }, (_, i) => ({ x: 31, y: i, type: 'full' })),
  ...Array.from({ length: 3 }, (_, i) => ({ x: 32, y: i, type: 'full' })),
  ...Array.from({ length: 4 }, (_, i) => ({ x: i+1, y: 2, type: 'half-bottom' })),
  ...Array.from({ length: 4 }, (_, i) => ({ x: i+2, y: 4, type: 'half-bottom' })),
  ...Array.from({ length: 2 }, (_, i) => ({ x: 6, y: i+3, type: 'half-left' })),
  {x: 1, y: 3, type: 'full'},
  {x: 1, y: 4, type: 'full'},
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
  {x: 36, y: 35, type: 'half-right'},
  {x: 37, y: 35, type: 'full'},
  {x: 42, y: 34, type: 'half-right'},
  {x: 43, y: 34, type: 'full'},
  {x: 44, y: 34, type: 'half-left'},
  ...Array.from({ length: 2 }, (_, i) => ({ x: i+14 , y: 25, type: 'full' })), 
  {x: 9, y: 27, type: 'full'},
  {x: 10, y: 27, type: 'half-left'},
  {x: 8, y: 27, type: 'half-right'},
  ...Array.from({ length: 60 }, (_, i) => ({ x: i , y: 0, type: 'half-top' })), // atas
  ...Array.from({ length: 60 }, (_, i) => ({ x: i , y: 44, type: 'half-bottom' })), // bawah
  ...Array.from({ length: 60 }, (_, i) => ({ x: 59 , y: i, type: 'half-right' })), // kanan
  ...Array.from({ length: 60 }, (_, i) => ({ x: 0 , y: i, type: 'half-left' })), // kiri
  ...Array.from({ length: 3 }, (_, i) => ({ x: 41 , y: i+36, type: 'half-right' })),
  ...Array.from({ length: 3 }, (_, i) => ({ x: 39 , y: i+36, type: 'half-left' })),
  ...Array.from({ length: 3 }, (_, i) => ({ x: i+29 , y: 10, type: 'half-top'  })),
  ...Array.from({ length: 3 }, (_, i) => ({ x: i+29 , y: 11, type: 'half-bottom'  })),
  {x: 41, y: 22, type: 'half-right'},
  {x: 44, y: 23, type: 'half-top'},
  ...Array.from({ length: 2 }, (_, i) => ({ x: 42 , y: i+20, type: 'half-left'  })),
  ...Array.from({ length: 3 }, (_, i) => ({ x: 44 , y: i+20, type: 'half-right'  })),
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
    } else if (i === 15 || i === 16 || i === 17) {
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
  ...Array.from({ length: 4 }, (_, i) => ({ x: i+47, y: 23 , type: 'full' })), 
  ...Array.from({ length: 4 }, (_, i) => ({ x: i+49, y: 24 , type: 'full' })), 
  ...Array.from({ length: 4 }, (_, i) => ({ x: 51, y: i+24 , type: 'full' })), 
  ...Array.from({ length: 6 }, (_, i) => ({ x: 50, y: i+25 , type: (i >= 2 && i <= 6) ? 'half-right' : 'full' })),  
  ...Array.from({ length: 6 }, (_, i) => ({ x: 49-i, y: 31+i, type: 'half-right' })),
  ...Array.from({ length: 6 }, (_, i) => ({ x: 50-i, y: 31+i, type: 'full' })),
  {x: 45, y: 34, type: 'half-bottom'},
  {x: 47, y: 36, type: 'half-bottom'},
  {x: 50, y: 34, type: 'half-left'},
  {x: 51, y: 33, type: 'full'},
  ...Array.from({ length: 2 }, (_, i) => ({ x: i+45 , y: 36 , type: 'full' })), 
  ...Array.from({ length: 3 }, (_, i) => ({ x: i+47 , y: 34 , type: 'full' })), 
  ...Array.from({ length: 5 }, (_, i) => ({ x: 53 , y: i+26 , type: 'half-left' })), 
  ...Array.from({ length: 2 }, (_, i) => ({ x: 52 , y: i+31 , type: 'half-right' })), 
];

// Sample monologue script for the dialogue system
const monologueScript = [
  {
    speaker: 'Louise',
    text: 'Where am I? This place feels... strangely familiar.',
    emotion: 'confused'
  },
  {
    speaker: 'Louise',
    text: 'I need to find out what’s going on here.',
    emotion: 'determined'
  },
  {
    speaker: 'Louise',
    text: 'Let’s explore and see what this world has in store.',
    emotion: 'curious'
  }
];

const Game = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { soundEnabled, setSoundEnabled, sfxVolume, setSfxVolume } = useSound();
  const { musicEnabled, setMusicEnabled, musicVolume, setMusicVolume } = useMusic();
  const character = location.state?.character;
  const isLoadedGame = location.state?.isLoadedGame;
  const [isLoading, setIsLoading] = useState(true);
  const [showCutscene, setShowCutscene] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [saveFiles, setSaveFiles] = useState([]);
  const [canSave, setCanSave] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Added isPaused state
  const [showSettings, setShowSettings] = useState(false); // Added showSettings state

  // Status effects states
  const [health, setHealth] = useState(100);
  const [energy, setEnergy] = useState(100);
  const [hunger, setHunger] = useState(100);
  const [happiness, setHappiness] = useState(100);
  const [money, setMoney] = useState(0);
  const [cleanliness, setCleanliness] = useState(100);

  // Status effects decay over time
  useEffect(() => {
    const decayInterval = setInterval(() => {
      if (!isSleeping && !isPaused) { // Pause decay when game is paused
        setHealth(prev => Math.max(0, prev - 0.1));
        setEnergy(prev => Math.max(0, prev - 0.2));
        setHunger(prev => Math.max(0, prev - 0.3));
        setHappiness(prev => Math.max(0, prev - 0.1));
        setCleanliness(prev => Math.max(0, prev - 0.2));
      }
    }, 1000);

    return () => clearInterval(decayInterval);
  }, [isSleeping, isPaused]);

  // Affect happiness based on hunger, health, and cleanliness
  useEffect(() => {
    if (hunger < 30 || health < 30 || cleanliness < 30) {
      setHappiness(prev => Math.max(0, prev - 0.5));
    }
  }, [hunger, health, cleanliness]);

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
        inventory: [],
        quests: [],
        stats: {
          level: 1,
          playTime: '0:00',
          health,
          energy,
          hunger,
          happiness,
          money,
          cleanliness
        },
        settings: {
          soundEnabled,
          sfxVolume,
          musicEnabled,
          musicVolume
        }
      };

      const saveData = createSaveFileData(gameState);
      await saveFileService.saveGame(user.uid, saveData);
      
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
        setHealth(gameState.stats.health || 100);
        setEnergy(gameState.stats.energy || 100);
        setHunger(gameState.stats.hunger || 100);
        setHappiness(gameState.stats.happiness || 100);
        setMoney(gameState.stats.money || 0);
        setCleanliness(gameState.stats.cleanliness || 100);
        // Load settings if they exist
        if (gameState.settings) {
          setSoundEnabled(gameState.settings.soundEnabled ?? true);
          setSfxVolume(gameState.settings.sfxVolume ?? 0.5);
          setMusicEnabled(gameState.settings.musicEnabled ?? true);
          setMusicVolume(gameState.settings.musicVolume ?? 0.5);
        }
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

  // Get character-specific sprites (only louise for now)
  const getCharacterSprites = () => {
    return {
      stand: louiseStand,
      walkUp: louiseWalkUp,
      walkDown: louiseWalkDown,
      walkLeft: louiseWalkLeft,
      walkRight: louiseWalkRight
    };
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

  // Prevent movement and interactions when paused or in dialogue
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isSleeping || isPaused || showDialog) return; // Block movement when paused or in dialogue
      console.log('Key pressed:', e.key);
      console.log('isInInterior:', isInInterior);

      if (isInInterior) return;

      let newX = position.x;
      let newY = position.y;
      const energyCost = 0.5;
      const cleanlinessCost = 0.5;

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          console.log('Moving up');
          newY = position.y - speed;
          if (!hasCollision(newX, newY)) {
            setFacing('up');
            setPosition((prev) => ({
              ...prev,
              y: Math.max(0, newY),
            }));
            setEnergy((prev) => Math.max(0, prev - energyCost));
            setCleanliness((prev) => Math.max(0, prev - cleanlinessCost));
            if (checkSavePoint(newX, newY)) {
              setCanSave(true);
              setShowSavePrompt(true);
            } else {
              setCanSave(false);
              setShowSavePrompt(false);
            }
            checkTeleport(newX, newY);
          }
          break;
        case 's':
        case 'arrowdown':
          console.log('Moving down');
          newY = position.y + speed;
          if (!hasCollision(newX, newY)) {
            setFacing('down');
            setPosition((prev) => ({
              ...prev,
              y: Math.min(MAP_HEIGHT - PLAYER_SIZE, newY),
            }));
            setEnergy((prev) => Math.max(0, prev - energyCost));
            setCleanliness((prev) => Math.max(0, prev - cleanlinessCost));
            checkTeleport(newX, newY);
          }
          break;
        case 'a':
        case 'arrowleft':
          console.log('Moving left');
          newX = position.x - speed;
          if (!hasCollision(newX, newY)) {
            setFacing('left');
            setPosition((prev) => ({
              ...prev,
              x: Math.max(0, newX),
            }));
            setEnergy((prev) => Math.max(0, prev - energyCost));
            setCleanliness((prev) => Math.max(0, prev - cleanlinessCost));
            checkTeleport(newX, newY);
          }
          break;
        case 'd':
        case 'arrowright':
          console.log('Moving right');
          newX = position.x + speed;
          if (!hasCollision(newX, newY)) {
            setFacing('right');
            setPosition((prev) => ({
              ...prev,
              x: Math.min(MAP_WIDTH - PLAYER_SIZE, newX),
            }));
            setEnergy((prev) => Math.max(0, prev - energyCost));
            setCleanliness((prev) => Math.max(0, prev - cleanlinessCost));
            checkTeleport(newX, newY);
          }
          break;
        case 'p': // Pause with 'P' key
          setIsPaused(true);
          break;
        case 's': // Save game when at save point
          if (canSave && !showDialog) {
            saveGame();
          }
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      const movementKeys = ['w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
      if (movementKeys.includes(e.key.toLowerCase())) {
        setFacing('stand');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [position, isInInterior, speed, MAP_HEIGHT, MAP_WIDTH, PLAYER_SIZE, isSleeping, isPaused, showDialog, canSave, setEnergy, setCleanliness, setFacing, setPosition, checkSavePoint, setCanSave, setShowSavePrompt, checkTeleport]);

  const getCameraStyle = () => {
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    const playerCenterX = position.x + (PLAYER_SIZE / 2);
    const playerCenterY = position.y + (PLAYER_SIZE / 2);
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
        
        // Check for shop trigger points
        const isShopPoint = checkShopTrigger({ x: col * GRID_SIZE, y: row * GRID_SIZE }, true); // Pass coordinates and a flag to just check without triggering state change

        const cellClass = collisionPoint ? `collision ${collisionPoint.type}` : '';
        const teleportClass = teleportPoint ? 'teleport' : '';
        const interactiveClass = (teleportPoint || isShopPoint) ? 'interactive-cell' : '';

        cells.push(
          <div
            key={`${row}-${col}`}
            className={`grid-cell ${cellClass} ${teleportClass} ${interactiveClass}`}
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

  const renderSavePrompt = () => {
    if (!showSavePrompt || !canSave || isPaused || showDialog) return null;

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

  // Check if player is at a shop trigger point
  const checkShopTrigger = (x, y, justCheck = false) => {
    const playerGridPos = getGridPosition(x, y);

    const isAtShop = shopPoints.some(point =>
      point.x === playerGridPos.gridX && point.y === playerGridPos.gridY
    );

    if (isAtShop && !justCheck) {
      setShowShop(true);
    } else {
      // Optionally hide shop if player moves away
      // setShowShop(false);
    }
  };

  if (isInInterior) {
    return (
      <HouseInterior 
        position={position} 
        setPosition={setPosition} 
        onExit={handleExitInterior} 
        character={character}
        health={health}
        setHealth={setHealth}
        energy={energy}
        setEnergy={setEnergy}
        hunger={hunger}
        setHunger={setHunger}
        happiness={happiness}
        setHappiness={setHappiness}
        money={money}
        setMoney={setMoney}
        isSleeping={isSleeping}
        setIsSleeping={setIsSleeping}
        cleanliness={cleanliness}
        setCleanliness={setCleanliness}
      />
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Status Effects UI */}
      <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 text-white">
        <div className="flex items-center gap-2">
          <span>❤️ Health: {Math.round(health)}</span>
          <div className="w-24 h-4 bg-gray-700 rounded">
            <div className="h-full bg-red-500 rounded" style={{ width: `${health}%` }}></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>⚡ Energy: {Math.round(energy)}</span>
          <div className="w-24 h-4 bg-gray-700 rounded">
            <div className="h-full bg-blue-500 rounded" style={{ width: `${energy}%` }}></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>🍽️ Hunger: {Math.round(hunger)}</span>
          <div className="w-24 h-4 bg-gray-700 rounded">
            <div className="h-full bg-yellow-500 rounded" style={{ width: `${hunger}%` }}></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>😊 Happiness: {Math.round(happiness)}</span>
          <div className="h-4 bg-gray-700 rounded">
            <div className="h-full bg-green-500 rounded" style={{ width: `${happiness}%` }}></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>🛁 Cleanliness: {Math.round(cleanliness)}</span>
          <div className="w-24 h-4 bg-gray-700 rounded">
            <div className="h-full bg-cyan-500 rounded" style={{ width: `${cleanliness}%` }}></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>💰 Money: {money}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading && (
          <div className="fixed inset-0 z-50">
            <LoadingScreen />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showCutscene && (
          <div className="fixed inset-0 z-50">
            <Cutscene onComplete={handleCutsceneComplete} />
          </div>
        )}
      </AnimatePresence>

      {user && !isLoading && !showCutscene && !isPaused && !showDialog && renderSavePrompt()}

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

      {/* Settings Popup */}
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

      {/* Shop Popup Placeholder */}
      {showShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#8B4513] p-8 rounded-lg text-white border-8 border-[#D2B48C] shadow-lg">
            <h2 className="text-2xl mb-4">Shop</h2>
            <p>This is the shop!</p>
            {/* Add shop content here */}
            <button onClick={() => setShowShop(false)} className="mt-4 px-4 py-2 bg-yellow-600 rounded">Close Shop</button>
          </div>
        </div>
      )}

      {/* Rest of your game content */}
      {!isLoading && !showCutscene && !showDialog && !isInInterior && (
        <>
          <Minimap position={position} shopPoints={shopPoints} />
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
        </>
      )}
    </div>
  );
};

export default Game;

<style>
{`
.grid-cell.interactive-cell {
  background-color: rgba(255, 215, 0, 0.6) !important; /* Semi-transparent gold - increased opacity */
  border: 1px solid rgba(255, 215, 0, 0.9) !important;
}

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