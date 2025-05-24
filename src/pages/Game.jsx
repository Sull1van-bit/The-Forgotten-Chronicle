import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSound } from '../context/SoundContext';
import { useMusic } from '../context/MusicContext';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import LoadingScreen from '../components/LoadingScreen';
import Cutscene from '../components/Cutscene';
import DialogBox from '../components/DialogBox';
import Settings from '../components/Settings';
import Minimap from '../components/Minimap';
import '../styles/Game.css';
import { DialogProvider, useDialog } from '../context/DialogContext';

// Import character sprites
import louiseStand from '../assets/characters/louise/stand.gif';
import louiseWalkUp from '../assets/characters/louise/walk-up.gif';
import louiseWalkDown from '../assets/characters/louise/walk-down.gif';
import louiseWalkLeft from '../assets/characters/louise/walk-left.gif';
import louiseWalkRight from '../assets/characters/louise/walk-right.gif';
import louiseEat from '../assets/characters/louise/eat.gif';

import eugeneStand from '../assets/characters/eugene/stand.gif';
import eugeneWalkUp from '../assets/characters/eugene/walk-up.gif';
import eugeneWalkDown from '../assets/characters/eugene/walk-down.gif';
import eugeneWalkLeft from '../assets/characters/eugene/walk-left.gif';
import eugeneWalkRight from '../assets/characters/eugene/walk-right.gif';
import eugeneEat from '../assets/characters/eugene/eat.gif';

// Import elder assets (assuming these paths exist)
// import elderStand from '../assets/characters/elder/stand.gif'; // Commented out
import elderPortrait from '../assets/npc/elder/character.png';

// Import character portraits
import louisePortrait from '../assets/characters/louise/character.png';
import eugenePortrait from '../assets/characters/eugene/character.png';

// Import maps
import allMap from '../assets/Maps/all-map.png';
import foregroundMap from '../assets/Maps/all-map-foreground.png';
import HouseInterior from './interiors/HouseInterior';

import { useAuth } from '../context/AuthContext';
import { saveFileService } from '../services/saveFileService';
import { createSaveFileData, loadSaveFileData } from '../utils/saveFileUtils';

import pauseButton from '../assets/menu/pause.png';
import pauseMenuBg from '../assets/menu/pauseMenu.png';

import Inventory from '../components/Inventory';
import QuestFolder from '../components/QuestFolder';
import ActiveQuestFolderUI from '../components/ActiveQuestFolderUI';

// Import item images
import seedsIcon from '../assets/items/seeds.png';
import wheatIcon from '../assets/items/wheat.png';
import breadIcon from '../assets/items/bread.png';
import stewIcon from '../assets/items/stew.png';
import ledgerIcon from '../assets/items/ledger.png';
import royalDocumentIcon from '../assets/items/royal-document.png';
import meatIcon from '../assets/items/meat.png';
import mushroomIcon from '../assets/items/mushroom.png';

// Import UI icons
import heartIcon from '../assets/statbar/heart.png';
import hungerIcon from '../assets/statbar/hunger.png';
import hygieneIcon from '../assets/statbar/hygiene.png';
import happinessIcon from '../assets/statbar/happiness.png';
import energyIcon from '../assets/statbar/energy.png';
import moneyIcon from '../assets/statbar/money.png';

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
    
    
    //props
    // {x: 25, y: 29, type: 'full'},
    ...Array.from({ length: 3 }, (_, i) => ({ x: 25+i , y: 29, type: 'half-bottom'  })),
  
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
    
    // rumah
    ...Array.from({ length: 2 }, (_, i) => ({ x: i+14 , y: 14  , type: 'full' })), 
    ...Array.from({ length: 2 }, (_, i) => ({ x: i+14 , y: 15  , type: 'full' })), 
    ...Array.from({ length: 2 }, (_, i) => ({ x: i+22 , y: 24  , type: 'full' })), 
    ...Array.from({ length: 2 }, (_, i) => ({ x: i+22 , y: 25  , type: 'full' })), 
    ...Array.from({ length: 2 }, (_, i) => ({ x: i+26 , y: 27  , type: 'full' })), 
    ...Array.from({ length: 2 }, (_, i) => ({ x: i+26 , y: 26  , type: 'full' })), 
    ...Array.from({ length: 2 }, (_, i) => ({ x: i+29 , y: 24  , type: 'full' })), 
    ...Array.from({ length: 2 }, (_, i) => ({ x: i+29 , y: 23  , type: 'full' })), 
    ...Array.from({ length: 3 }, (_, i) => ({ x: i+34 , y: 25  , type: 'full' })), 
    ...Array.from({ length: 3 }, (_, i) => ({ x: i+34 , y: 24  , type: 'full' })), 
    ...Array.from({ length: 3 }, (_, i) => ({ x: i+33 , y: 27  , type: 'full' })), 
    ...Array.from({ length: 3 }, (_, i) => ({ x: i+28 , y: 35  , type: 'full' })), 
    ...Array.from({ length: 2 }, (_, i) => ({ x: i+28 , y: 36  , type: 'half-top' })), 
    ...Array.from({ length: 3 }, (_, i) => ({ x: i+31 , y: 33  , type: 'half-bottom' })),
    {x: 35, y: 32, type: 'half-right'},
    {x: 36, y: 32, type: 'half-left'},
    {x: 17, y: 26, type: 'half-right'},
    {x: 18, y: 26, type: 'half-left'},
    {x: 29, y: 28, type: 'full'},
    ...Array.from({ length: 2 }, (_, i) => ({ x: i+23 , y: 34  , type: 'half-top' })),
    ...Array.from({ length: 2 }, (_, i) => ({ x: i+23 , y: 33  , type: 'half-bottom' })),
    ...Array.from({ length: 2 }, (_, i) => ({ x: i+15 , y: 35  , type: 'half-bottom' })),
    ...Array.from({ length: 2 }, (_, i) => ({ x: i+15 , y: 34  , type: 'half-bottom' })),
    // ...Array.from({ length: 2 }, (_, i) => ({ x: 17 , y: i+34  , type: 'half-left' })),
    {x: 17, y: 35, type: 'half-left'},
    ...Array.from({ length: 2 }, (_, i) => ({ x: i+9 , y: 30  , type: 'half-bottom' })),
    ...Array.from({ length: 5 }, (_, i) => ({ x: i+9 , y: 29  , type: 'half-bottom' })),
    ...Array.from({ length: 3 }, (_, i) => ({ x: i+45 , y: 30  , type: 'half-bottom' })),
    ...Array.from({ length: 2 }, (_, i) => ({ x: i+45 , y: 31  , type: 'half-top' })),
    ...Array.from({ length: 17 }, (_, i) => ({ x: i+39 , y: 10  , type: 'half-top' })),
    ...Array.from({ length: 2 }, (_, i) => ({ x: 55 , y: i+8  , type: 'half-right' })),
    ...Array.from({ length: 3 }, (_, i) => ({ x: i+56 , y: 8  , type: 'half-bottom' })),
    ...Array.from({ length: 4 }, (_, i) => ({ x: 39 , y: 6+i  , type: 'half-left' })),
    ...Array.from({ length: 4 }, (_, i) => ({ x: i+36 , y: 6  , type: 'half-bottom' })),
    ...Array.from({ length: 4 }, (_, i) => ({ x: 36 , y: 4+i  , type: 'full' })),
    ...Array.from({ length: 24 }, (_, i) => ({ x: 36+i , y: 4  , type: 'full' })),
  
    
  ];

// Add monologue script
const monologueScript = [
  "The air carries the scent of damp earth and firewood, familiar yet distant. This place… it should feel like home. But does it?",
  "The cottage stands behind me, quiet and worn. My inheritance—though it is more a burden than a gift. Once, hands worked this land, voices filled these walls. Now, only I remain.",
  "The village elder watches from afar, eyes filled with something unspoken. They remember my family, their deeds, their fall. I have returned, but for what purpose?",
  "Will I mend what was broken, rebuild what was lost? Or will I carve a new path, unshackled from their legacy?",
  "The village calls, the fields await, and somewhere, beneath stone and memory, a forgotten truth lingers. Today, my story begins."
];

// Define all possible items
const ITEMS = {
  seeds: {
    id: 1,
    name: 'Seeds',
    icon: seedsIcon,
    type: 'material',
    description: 'Plant these to grow crops'
  },
  wheat: {
    id: 2,
    name: 'Wheat',
    icon: wheatIcon,
    type: 'material',
    description: 'Raw wheat, can be used to make bread'
  },
  bread: {
    id: 3,
    name: 'Bread',
    icon: breadIcon,
    type: 'consumable',
    description: 'Freshly baked bread',
    effect: { hunger: 30, energy: 10 }
  },
  stew: {
    id: 4,
    name: 'Stew',
    icon: stewIcon,
    type: 'quest',
    description: 'A special stew that holds significance in the village\'s history'
  },
  ledger: {
    id: 5,
    name: 'Ledger',
    icon: ledgerIcon,
    type: 'quest',
    description: 'An old ledger containing important information'
  },
  royalDocument: {
    id: 6,
    name: 'Royal Document',
    icon: royalDocumentIcon,
    type: 'quest',
    description: 'An official document from the royal family'
  },
  meat: {
    id: 7,
    name: 'Meat',
    icon: meatIcon,
    type: 'material',
    description: 'Raw meat, can be cooked'
  },
  mushroom: {
    id: 8,
    name: 'Mushroom',
    icon: mushroomIcon,
    type: 'material',
    description: 'A wild mushroom, can be used in cooking'
  }
};

const Game = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { soundEnabled, setSoundEnabled, sfxVolume, setSfxVolume } = useSound();
  const { musicEnabled, setMusicEnabled, musicVolume, setMusicVolume } = useMusic();
  const { startDialog, advanceDialog, endDialog, isDialogActive, currentDialog, dialogIndex } = useDialog();
  const character = location.state?.character;
  const isLoadedGame = location.state?.isLoadedGame;
  const [isLoading, setIsLoading] = useState(true);
  const [showCutscene, setShowCutscene] = useState(false);
  const [saveFiles, setSaveFiles] = useState([]);
  const [canSave, setCanSave] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShop, setShowShop] = useState(false);

  // State for new quest pop-up - MOVED HERE
  const [showNewQuestPopup, setShowNewQuestPopup] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [showEatAnimation, setShowEatAnimation] = useState(false);

  // Ref to store previous quests state for comparison - MOVED HERE
  const prevQuestsRef = useRef([]);

  // Add character stats state
  const [health, setHealth] = useState(100);
  const [energy, setEnergy] = useState(100);
  const [hunger, setHunger] = useState(100);
  const [happiness, setHappiness] = useState(100);
  const [money, setMoney] = useState(0);
  const [cleanliness, setCleanliness] = useState(100);
  const [gameTime, setGameTime] = useState({ hours: 6, minutes: 0 }); // Start at 6:00 AM

  // Add state for house dialog
  const [hasSeenHouseDialog, setHasSeenHouseDialog] = useState(false);

  // Add state for elder talk popup
  const [showElderTalkPopup, setShowElderTalkPopup] = useState(false);

  // Define basic game constants and initial player state - Moved up
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

  // Define shop trigger points
  const shopPoints = [
    { x: 32, y: 30 },
    { x: 33, y: 30 }
  ];

  // Initialize inventory with 2 bread
  const [inventory, setInventory] = useState([
    { ...ITEMS.bread, quantity: 2 }
  ]);

  // Add quest state
  const [quests, setQuests] = useState([]);

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

  // Effect to auto-hide new quest pop-up
  useEffect(() => {
    let timer;
    if (showNewQuestPopup) {
      timer = setTimeout(() => {
        setShowNewQuestPopup(false);
        setNewQuestTitle(''); // Clear title after hiding
      }, 5000); // Show for 5 seconds
    }
    return () => clearTimeout(timer);
  }, [showNewQuestPopup]);

  const handleCutsceneComplete = () => {
    setShowCutscene(false);
    if (!isLoadedGame) {
      // Use the new dialog system
      startDialog({
        characterName: character?.name || 'Character',
        expression: 'smile',
        dialogue: monologueScript
      });
    }
  };

  // Handle advancing the monologue
  const handleAdvanceMonologue = () => {
    if (dialogIndex < monologueScript.length - 1) {
      advanceDialog();
    } else {
      // Dialogue ends here
      endDialog();
      // Add the initial quest after dialogue
      setQuests(prevQuests => [
        ...prevQuests,
        {
          title: "Welcome Home",
          description: "Get settled in your new home and explore the village.",
          objectives: [
            {
              description: "Enter your house",
              completed: false
            },
            {
              description: "Meet the village elder",
              completed: false
            }
          ]
        }
      ]);
      // Directly trigger the popup after adding the quest
      setNewQuestTitle("Welcome Home"); // Set the title directly
      setShowNewQuestPopup(true); // Show the popup directly
    }
  };

  // Handle skipping the entire monologue
  const handleSkipMonologue = () => {
    endDialog();
    // Add the initial quest and trigger popup when skipping
    setQuests(prevQuests => [
      ...prevQuests,
      {
        title: "Welcome Home",
        description: "Get settled in your new home and explore the village.",
        objectives: [
          {
            description: "Enter your house",
            completed: false
          },
          {
            description: "Meet the village elder",
            completed: false
          }
        ]
      }
    ]);
    setNewQuestTitle("Welcome Home");
    setShowNewQuestPopup(true);
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

  // Define Elder position (grid coordinates)
  const ELDER_POSITION_GRID = { x: 15, y: 16 };
  // Calculate Elder pixel position
  const ELDER_POSITION_PIXEL = { x: ELDER_POSITION_GRID.x * GRID_SIZE, y: ELDER_POSITION_GRID.y * GRID_SIZE };
  const ELDER_SIZE = 26; // Assuming similar size to player for positioning

  // Check proximity to Elder
  const checkElderProximity = (playerX, playerY) => {
    const playerCenterX = playerX + (PLAYER_SIZE / 2);
    const playerCenterY = playerY + (PLAYER_SIZE / 2);
    const elderCenterX = ELDER_POSITION_PIXEL.x + (ELDER_SIZE / 2);
    const elderCenterY = ELDER_POSITION_PIXEL.y + (ELDER_SIZE / 2);
    const distance = Math.sqrt(
      Math.pow(playerCenterX - elderCenterX, 2) + Math.pow(playerCenterY - elderCenterY, 2)
    );
    const proximityThreshold = GRID_SIZE / 2; // Half a grid cell away
    return distance < proximityThreshold;
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
        },
        hasSeenHouseDialog,
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
        if (gameState.settings) {
          setSoundEnabled(gameState.settings.soundEnabled ?? true);
          setSfxVolume(gameState.settings.sfxVolume ?? 0.5);
          setMusicEnabled(gameState.settings.musicEnabled ?? true);
          setMusicVolume(gameState.settings.musicVolume ?? 0.5);
        }
        setHasSeenHouseDialog(gameState.hasSeenHouseDialog ?? false);
      }
    } catch (error) {
      console.error('Error loading game:', error);
    }
  };

  // Get character-specific sprites
  const getCharacterSprites = () => {
    console.log('Selected character:', character); // Debug log to see what we're receiving
    
    // Handle case where character might be an object with a name property
    const characterName = typeof character === 'object' && character !== null ? character.name : character;
    console.log('Character name:', characterName);

    switch (String(characterName).toLowerCase()) {
      case 'eugene':
        console.log('Loading Eugene sprites');
        return {
          stand: eugeneStand,
          walkUp: eugeneWalkUp,
          walkDown: eugeneWalkDown,
          walkLeft: eugeneWalkLeft,
          walkRight: eugeneWalkRight,
          eat: eugeneEat
        };
      case 'louise':
        console.log('Loading Louise sprites');
        return {
          stand: louiseStand,
          walkUp: louiseWalkUp,
          walkDown: louiseWalkDown,
          walkLeft: louiseWalkLeft,
          walkRight: louiseWalkRight,
          eat: louiseEat
        };
      default:
        console.log('No valid character selected, defaulting to Louise');
        return {
          stand: louiseStand,
          walkUp: louiseWalkUp,
          walkDown: louiseWalkDown,
          walkLeft: louiseWalkLeft,
          walkRight: louiseWalkRight,
          eat: louiseEat
        };
    }
  };

  const characterSprites = getCharacterSprites();
  console.log('Current sprites:', characterSprites); // Debug log

  // Get character-specific portrait
  const getCharacterPortrait = () => {
    const characterName = typeof character === 'object' && character !== null ? character.name : character;
    switch (String(characterName).toLowerCase()) {
      case 'eugene':
        return eugenePortrait;
      case 'louise':
      default:
        return louisePortrait; // Default to louise
    }
  };

  const getSprite = () => {
    const sprite = characterSprites[facing === 'stand' ? 'stand' : `walk${facing.charAt(0).toUpperCase() + facing.slice(1)}`];
    console.log('Current facing:', facing, 'Using sprite:', sprite); // Debug log
    return sprite;
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

  // Check if player is at a shop trigger point
  const checkShopTrigger = useMemo(() => (x, y, justCheck = false) => {
    const playerGridPos = getGridPosition(x, y);
    const isAtShop = shopPoints.some(point =>
      point.x === playerGridPos.gridX && point.y === playerGridPos.gridY
    );

    if (!justCheck) {
      setShowShop(isAtShop);
    }
    return isAtShop;
  }, [shopPoints, setShowShop, getGridPosition]);

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

  // Prevent movement and interactions when paused, in dialogue, in shop, or talking to elder
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isSleeping || isPaused || isDialogActive || showShop || showElderTalkPopup) return;
      console.log('Key pressed:', e.key);
      console.log('isInInterior:', isInInterior);

      if (isInInterior) return;

      let newX = position.x;
      let newY = position.y;
      const energyCost = 0.5;
      const cleanlinessCost = 0.5;

      // Handle number keys for item slots (1-9)
      if (e.key >= '1' && e.key <= '9') {
        const slotIndex = parseInt(e.key) - 1;
        const item = inventory[slotIndex];
        if (item) {
          handleUseItem(item);
        }
        return;
      }

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
            checkShopTrigger(newX, newY);
            // Check proximity to Elder after movement
            if (checkElderProximity(newX, newY)) {
              setShowElderTalkPopup(true);
            }
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
            checkShopTrigger(newX, newY);
            // Check proximity to Elder after movement
            if (checkElderProximity(newX, newY)) {
              setShowElderTalkPopup(true);
            }
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
            checkShopTrigger(newX, newY);
            // Check proximity to Elder after movement
            if (checkElderProximity(newX, newY)) {
              setShowElderTalkPopup(true);
            }
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
            checkShopTrigger(newX, newY);
            // Check proximity to Elder after movement
            if (checkElderProximity(newX, newY)) {
              setShowElderTalkPopup(true);
            }
          }
          break;
        case 'p':
          setIsPaused(true);
          break;
        case 's':
          if (canSave && !isDialogActive) {
            saveGame();
          }
          break;
        case 'e':
          checkShopTrigger(position.x, position.y);
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
  }, [position, isInInterior, speed, MAP_HEIGHT, MAP_WIDTH, PLAYER_SIZE, isSleeping, isPaused, isDialogActive, showShop, canSave, showElderTalkPopup]);

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

  // Pre-compute shop point coordinates for fast lookup
  const shopPointSet = useMemo(() => {
    const set = new Set();
    shopPoints.forEach(point => set.add(`${point.x},${point.y}`));
    return set;
  }, []);

  const renderGrid = useMemo(() => {
    const cells = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const collisionPoint = COLLISION_MAP.find(point => point.x === col && point.y === row);
        const teleportPoint = TELEPORT_POINTS.find(point => point.x === col && point.y === row);
        const isShopPoint = shopPointSet.has(`${col},${row}`);

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
  }, [shopPointSet]);

  const renderSavePrompt = () => {
    if (!showSavePrompt || !canSave || isPaused || isDialogActive || showShop) return null;

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

  const handleUseItem = (item) => {
    if (item.type === 'consumable') {
      // Show eating animation
      setShowEatAnimation(true);
      setTimeout(() => setShowEatAnimation(false), 1000); // Hide after 1 second

      // Apply item effects
      if (item.effect.health) {
        setHealth(prev => Math.min(100, prev + item.effect.health));
      }
      if (item.effect.energy) {
        setEnergy(prev => Math.min(100, prev + item.effect.energy));
      }
      if (item.effect.hunger) {
        setHunger(prev => Math.min(100, prev + item.effect.hunger));
      }
      
      // Update item quantity or remove if last one
      setInventory(prev => {
        const newInventory = prev.map(invItem => {
          if (invItem.id === item.id) {
            return {
              ...invItem,
              quantity: invItem.quantity - 1
            };
          }
          return invItem;
        });
        
        // Remove items with quantity 0
        return newInventory.filter(invItem => invItem.quantity > 0);
      });
    }
  };

  // Function to add item to inventory
  const addItemToInventory = (itemId, quantity = 1) => {
    setInventory(prev => {
      const existingItem = prev.find(item => item.id === itemId);
      if (existingItem) {
        // Update quantity if item exists
        return prev.map(item => 
          item.id === itemId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [...prev, { ...ITEMS[itemId], quantity }];
      }
    });
  };

  // Add time system effect
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setGameTime(prevTime => {
        let newMinutes = prevTime.minutes + 1;
        let newHours = prevTime.hours;

        if (newMinutes >= 60) {
          newMinutes = 0;
          newHours = (newHours + 1) % 24;
        }

        return { hours: newHours, minutes: newMinutes };
      });
    }, 1000); // Update every second

    return () => clearInterval(timeInterval);
  }, []);

  // Add onTimeUpdate function
  const onTimeUpdate = (newTime) => {
    setGameTime(newTime);
  };

  // Format time for display
  const formatTime = (time) => {
    let hours = time.hours;
    const minutes = time.minutes.toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    
    return `${hours}:${minutes} ${ampm}`;
  };

  // Calculate darkness level based on time
  const getDarknessLevel = (time) => {
    const hour = time.hours;
    const minute = time.minutes;
    const totalMinutes = hour * 60 + minute;

    // Define time periods
    const sunriseStart = 5 * 60; // 5:00 AM
    const sunriseEnd = 7 * 60;   // 7:00 AM
    const sunsetStart = 17 * 60; // 5:00 PM
    const sunsetEnd = 19 * 60;   // 7:00 PM
    const nightStart = 20 * 60;  // 8:00 PM
    const nightEnd = 4 * 60;     // 4:00 AM

    // Calculate darkness level with smoother transitions
    if (totalMinutes >= nightStart || totalMinutes < nightEnd) {
      // Night time - very dark
      return 0.8;
    } else if (totalMinutes >= sunsetStart && totalMinutes < sunsetEnd) {
      // Sunset transition - smooth gradient from day to dusk
      const progress = (totalMinutes - sunsetStart) / (sunsetEnd - sunsetStart);
      // Use a smooth easing function (cubic)
      const easedProgress = progress * progress * (3 - 2 * progress);
      return 0.4 + (easedProgress * 0.4);
    } else if (totalMinutes >= sunriseStart && totalMinutes < sunriseEnd) {
      // Sunrise transition - smooth gradient from night to day
      const progress = (totalMinutes - sunriseStart) / (sunriseEnd - sunriseStart);
      // Use a smooth easing function (cubic)
      const easedProgress = progress * progress * (3 - 2 * progress);
      return 0.8 - (easedProgress * 0.4);
    } else if (totalMinutes >= sunsetEnd && totalMinutes < nightStart) {
      // Dusk - moderately dark
      return 0.4;
    } else {
      // Day time - no darkness
      return 0;
    }
  };

  if (isInInterior) {
    return (
      <DialogProvider>
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
          inventory={inventory}
          quests={quests}
          setQuests={setQuests}
          onUseItem={handleUseItem}
          isPaused={isPaused}
          handlePause={handlePause}
          handleResume={handleResume}
          handleSettings={handleSettings}
          handleCloseSettings={handleCloseSettings}
          handleExit={handleExit}
          showSettings={showSettings}
          gameTime={gameTime}
          onTimeUpdate={onTimeUpdate}
          hasSeenHouseDialog={hasSeenHouseDialog}
          setHasSeenHouseDialog={setHasSeenHouseDialog}
          saveGame={saveGame}
          showEatAnimation={showEatAnimation}
          setShowEatAnimation={setShowEatAnimation}
        />
      </DialogProvider>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Styled Status Bar (HP, Hunger, Hygiene, Happiness) */}
      {!isDialogActive && !isLoading && !showCutscene && (
        <>
          <div className="absolute top-4 left-4 z-50 text-white flex items-center border-8 border-[#D2B48C]" style={{ backgroundColor: '#8B4513', padding: '10px', borderRadius: '10px' }}>
            {/* Character Portrait */}
            <div className="w-16 h-16 rounded-full border-2 border-yellow-500 overflow-hidden flex items-center justify-center bg-gray-700">
              <img
                src={getCharacterPortrait()}
                alt={`${character?.name || character} Portrait`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Character Info and Stats */}
            <div className="ml-4 flex flex-col justify-center">
              {/* Character Name */}
              <span className="text-base font-bold mb-1">{character?.name || 'Character Name'}</span>

              {/* Stat Bars */}
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm flex items-center">
                  <img src={heartIcon} alt="HP" className="w-6 h-6 mr-1" /> {Math.round(health)}/100
                </span>
                <div className="w-28 h-4 bg-gray-700 rounded overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${health}%` }}></div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm flex items-center">
                  <img src={hungerIcon} alt="Hunger" className="w-6 h-6 mr-1" /> {Math.round(hunger)}/100
                </span>
                <div className="w-28 h-4 bg-gray-700 rounded overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: `${hunger}%` }}></div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm flex items-center">
                  <img src={hygieneIcon} alt="Cleanliness" className="w-6 h-6 mr-1" /> {Math.round(cleanliness)}/100
                </span>
                <div className="w-28 h-4 bg-gray-700 rounded overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${cleanliness}%` }}></div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm flex items-center">
                  <img src={happinessIcon} alt="Happiness" className="w-6 h-6 mr-1" /> {Math.round(happiness)}/100
                </span>
                <div className="w-28 h-4 bg-gray-700 rounded overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${happiness}%` }}></div>
                </div>
              </div>

              {/* Energy Stat Bar */}
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm flex items-center">
                  <img src={energyIcon} alt="Energy" className="w-6 h-6 mr-1" /> {Math.round(energy)}/100
                </span>
                <div className="w-28 h-4 bg-gray-700 rounded overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${energy}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Money stat below the styled bar */}
          <div className="absolute top-[180px] left-4 z-50 flex flex-col gap-1 text-white text-xs border-4 border-[#D2B48C]" style={{ backgroundColor: '#8B4513', padding: '5px', borderRadius: '5px' }}>
            <div className="flex items-center gap-2">
              <img src={moneyIcon} alt="Money" className="w-6 h-6 mr-1" />
              <span>{money}</span>
            </div>
          </div>

          {/* Time Display */}
          <div className="absolute top-[220px] left-4 z-50 text-white text-xs border-4 border-[#D2B48C]" style={{ backgroundColor: '#8B4513', padding: '5px', borderRadius: '5px' }}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{formatTime(gameTime)}</span>
            </div>
          </div>

          {/* Wrap ActiveQuestFolderUI for positioning */}
          <div className="fixed right-8 top-[25%] transform -translate-y-1/2 z-[90] scale-125">
            <ActiveQuestFolderUI quests={quests} />
          </div>
          <QuestFolder quests={quests} />
        </>
      )}

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

      {user && !isLoading && !showCutscene && !isPaused && !isDialogActive && renderSavePrompt()}

      {/* Dialog Box */}
      {isDialogActive && currentDialog && (
        <>
          <div
            className="fixed top-8 right-8 z-[100] pointer-events-auto"
          >
            <button
              onClick={handleSkipMonologue}
              style={{ backgroundColor: 'rgba(55, 65, 81, 0.85)' }}
              className="px-4 py-2 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-lg"
            >
              Skip
            </button>
          </div>
          <div
            className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-auto"
            onClick={handleAdvanceMonologue}
          >
            <div className="flex flex-col items-center pointer-events-auto">
              <DialogBox
                key={dialogIndex}
                onAdvance={handleAdvanceMonologue}
              />
            </div>
          </div>
        </>
      )}

      {/* Pause Button */}
      {!isPaused && !isLoading && !showCutscene && !isDialogActive && !showShop && !isInInterior && (
        <img
          src={pauseButton}
          alt="Pause"
          onClick={handlePause}
          className="fixed top-4 right-4 z-50 cursor-pointer"
          style={{ width: 96, height: 96, objectFit: 'contain' }}
        />
      )}

      {/* Pause Menu Popup */}
      {isPaused && !isInInterior && (
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
      {showSettings && !isInInterior && (
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

      {/* Shop Popup */}
      {showShop && !isInInterior && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#8B4513] p-8 rounded-lg text-white border-8 border-[#D2B48C] shadow-lg">
            <h2 className="text-2xl mb-4">Shop</h2>
            <p>Welcome to the shop! (Placeholder)</p>
            <button
              onClick={() => setShowShop(false)}
              className="mt-4 px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700"
            >
              Close Shop
            </button>
          </div>
        </div>
      )}

      {/* Add Inventory */}
      {!isDialogActive && !isPaused && !isLoading && !showCutscene && (
        <Inventory 
          items={inventory} 
          onUseItem={handleUseItem}
        />
      )}

      {/* New Quest Pop-up */}
      <AnimatePresence>
      {showNewQuestPopup && (
        <motion.div
          className="fixed inset-x-0 top-4 z-[110] flex justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="text-white text-center text-3xl font-bold leading-tight">
            <p>New Quest Added</p>
            <p>{newQuestTitle}</p>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

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

      {/* Day/Night Cycle Overlay */}
      <div 
        className="fixed inset-0 z-[40] pointer-events-none"
        style={{
          backgroundColor: 'black',
          opacity: getDarknessLevel(gameTime),
          transition: 'opacity 2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />

      {/* Render HouseInterior or Main Game */}
      {isInInterior ? (
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
          inventory={inventory}
          quests={quests}
          setQuests={setQuests}
          onUseItem={handleUseItem}
          isPaused={isPaused}
          handlePause={handlePause}
          handleResume={handleResume}
          handleSettings={handleSettings}
          handleCloseSettings={handleCloseSettings}
          handleExit={handleExit}
          showSettings={showSettings}
          gameTime={gameTime}
          onTimeUpdate={onTimeUpdate}
          hasSeenHouseDialog={hasSeenHouseDialog}
          setHasSeenHouseDialog={setHasSeenHouseDialog}
          saveGame={saveGame}
          showEatAnimation={showEatAnimation}
          setShowEatAnimation={setShowEatAnimation}
        />
      ) : (
        <>
          {/* Minimap */}
          <Minimap position={position} shopPoints={shopPoints} />

          {/* Elder NPC Sprite */}
          {/* Commented out because asset is not ready */}
          {/*
          {!isLoading && !showCutscene && (
            <img
              src={elderStand}
              alt="Village Elder"
              className="absolute pixelated"
              style={{
                left: `${ELDER_POSITION_PIXEL.x}px`,
                top: `${ELDER_POSITION_PIXEL.y}px`,
                width: `${ELDER_SIZE}px`,
                height: `${ELDER_SIZE}px`,
                zIndex: 2, // Ensure elder is above background
              }}
            />
          )}
          */}

          {/* Elder Talk Confirmation Popup */}
          {showElderTalkPopup && !isPaused && !isDialogActive && !showShop && (
            <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
              <div className="bg-[#8B4513] p-8 rounded-lg max-w-md w-full mx-4 relative border-8 border-[#D2B48C] shadow-lg flex flex-col items-center gap-4">
                <h2 className="text-2xl font-bold text-center text-[#F5DEB3]">Talk to Elder?</h2>
                <div className="flex flex-col gap-2">
                  <button 
                    className="bg-[#8B4513] text-[#F5DEB3] px-6 py-2 rounded border-4 border-[#D2B48C] hover:bg-[#A0522D] hover:border-[#F5DEB3] hover:scale-105 transition-all duration-200 w-32"
                    onClick={() => { /* Add talk logic here later */ setShowElderTalkPopup(false); console.log('Talking to Elder...'); }}
                  >
                    Yes
                  </button>
                  <button 
                    className="bg-[#8B4513] text-[#F5DEB3] px-6 py-2 rounded border-4 border-[#D2B48C] hover:bg-[#A0522D] hover:border-[#F5DEB3] hover:scale-105 transition-all duration-200 w-32"
                    onClick={() => setShowElderTalkPopup(false)}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rest of your game content (excluding UI moved to HouseInterior) */}
          {!isLoading && !showCutscene && (
            <div className="game-container">
              <div className="camera">
                <div 
                  className="map" 
                  style={getCameraStyle()}
                >
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
                    {renderGrid}
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
        </>
      )}
    </div>
  );
};

export default Game;