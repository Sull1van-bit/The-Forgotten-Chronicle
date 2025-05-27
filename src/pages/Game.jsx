import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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

// Import elder assets
import elderStand from '../assets/npc/elder/stand.gif';
import elderPortrait from '../assets/npc/elder/character.png';

// Import guard assets
import guardStand from '../assets/npc/guard/stand.gif';

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
import breadIcon from '../assets/items/bread.png';
import stewIcon from '../assets/items/stew.png';
import ledgerIcon from '../assets/items/royal-document.png';
import royalDocumentIcon from '../assets/items/royal-document.png';
import meatIcon from '../assets/items/meat.png';
import mushroomIcon from '../assets/items/mushroom.png';
import potatoIcon from '../assets/items/potato.png'
import potato1 from '../assets/crops/potato1.png';
import potato2 from '../assets/crops/potato2.png';
import potato3 from '../assets/crops/potato3.png';
import hoeIcon from '../assets/items/hoe.png';
import wateringCanIcon from '../assets/items/WateringCan.png'; // Import watering can icon
import sickleIcon from '../assets/items/sickle.png'; // Import sickle icon

// Import UI icons
import heartIcon from '../assets/statbar/heart.png';
import hungerIcon from '../assets/statbar/hunger.png';
import hygieneIcon from '../assets/statbar/hygiene.png';
import happinessIcon from '../assets/statbar/happiness.png';
import energyIcon from '../assets/statbar/energy.png';
import moneyIcon from '../assets/statbar/money.png';

// Import Counter component
import Counter from '../components/Counter';

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
  // end ujung map
  
  
    // jembatan uhuy
    ...Array.from({ length: 3 }, (_, i) => ({ x: 41 , y: i+36, type: 'half-right' })),
    ...Array.from({ length: 3 }, (_, i) => ({ x: 39 , y: i+36, type: 'half-left' })),    ...Array.from({ length: 3 }, (_, i) => ({ x: i+29 , y: 10, type: 'half-top'  })),
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
    // ...Array.from({ length: 3 }, (_, i) => ({ x: i+36 , y: 36, type: 'full' })),
    // ...Array.from({ length: 8 }, (_, i) => ({ x: i+31 , y: 37, type: 'full' })),
    // ...Array.from({ length: 3 }, (_, i) => ({ x: i +23, y: 42, type: 'half-bottom' })),
    // ...Array.from({ length: 27 }, (_, i) => ({ x: i, y: 44, type: 'full' })),
    // ...Array.from({ length: 26 }, (_, i) => ({ x: i, y: 43, type: 'full' })),
    // ...Array.from({ length: 23 }, (_, i) => ({ x: i, y: 42, type: 'full' })),
    // ...Array.from({ length: 22 }, (_, i) => ({ x: i, y: 41, type: 'full' })),
    // ...Array.from({ length: 21 }, (_, i) => ({ x: i, y: 40, type: 'full' })),
    // ...Array.from({ length: 27 }, (_, i) => ({ x: i, y: 39, type: 'full' })),
    // ...Array.from({ length: 36 }, (_, i) => {
    //   if (i === 18 || i === 19) {
    //     return { x: i, y: 38, type: 'half-bottom' };
    //   }else if (i === 15 || i === 16 || i === 17) {
    //     return { x: i, y: 38, type: 'half-top' };
    //   }
    //   return { x: i, y: 38, type: 'full' };
    // }).filter(Boolean),
    // ...Array.from({ length: 14 }, (_, i) => ({ x: i, y: 37, type: 'full' })), 
    // ...Array.from({ length: 10 }, (_, i) => ({ x: i, y: 36, type: 'full' })), 
    // ...Array.from({ length: 10 }, (_, i) => ({ x: i, y: 36, type: 'full' })), 
    // ...Array.from({ length: 6 }, (_, i) => ({ x: i+2, y: 35, type: 'full' })), 
    // ...Array.from({ length: 6 }, (_, i) => ({ x: i+2, y: 35, type: 'full' })), 
    // ...Array.from({ length: 3 }, (_, i) => ({ x: i+42, y: 37, type: 'half-top' })), 
    // ...Array.from({ length: 7 }, (_, i) => ({ x: i+42, y: 35, type: i >= 3 ? 'full' : 'half-bottom' })), 
    // ...Array.from({ length: 7 }, (_, i) => ({ x: 30, y: i+12, type: (i >= 4 && i <= 6) ? 'half-left' : 'full' })), 
    // ...Array.from({ length: 8 }, (_, i) => ({ x: 31, y: i+12, type: (i >= 4 && i <= 8) ? 'full' : 'half-right' })), 
    // ...Array.from({ length: 5 }, (_, i) => ({ x: 32, y: i+17, type: (i >= 4 && i <= 6) ? 'full' : 'half-right' })), 
    // {x: 32, y: 16, type: 'half-left'},
    // ...Array.from({ length: 4 }, (_, i) => ({ x: 29, y: i+12, type: 'half-right' })), 
    // ...Array.from({ length: 3 }, (_, i) => ({ x: i+39, y: 20, type: 'half-top' })), 
    // ...Array.from({ length: 7 }, (_, i) => ({ x: i+32, y: 20, type: (i >= 4 && i <= 8) ? 'half-top' : 'full' })), 
    // ...Array.from({ length: 9 }, (_, i) => ({ x: i+33, y: 21, type: 'full' })), 
    // ...Array.from({ length: 3 }, (_, i) => ({ x: i+33, y: 19, type: 'full' })), 

    
    // {x: 45, y: 21, type: 'half-top'},
    // {x: 46, y: 21, type: 'half-top'},
    // {x: 46, y: 23, type: 'half-top'},
    // {x: 45, y: 23, type: 'half-top'},
    // {x: 47, y: 21, type: 'half-bottom'},
    // {x: 51, y: 23, type: 'half-bottom'},
    // {x: 48, y: 24, type: 'half-right'},
    // ...Array.from({ length: 5 }, (_, i) => ({ x: i+45, y: 22, type: 'full' })), 
    // ...Array.from({ length: 4 }, (_, i) => ({ x: i+47, y: 23  , type: 'full' })), 
    // ...Array.from({ length: 4 }, (_, i) => ({ x: i+49, y: 24  , type: 'full' })), 
    // ...Array.from({ length: 4 }, (_, i) => ({ x: 51, y: i+24  , type: 'full' })), 
    // ...Array.from({ length: 6 }, (_, i) => ({ x: 50, y: i+25  , type: (i >= 2 && i <= 6) ? 'half-right' : 'full' })),  
    // ...Array.from({ length: 6 }, (_, i) => ({ x: 49-i, y: 31+i, type: 'half-right' })),
    // ...Array.from({ length: 6 }, (_, i) => ({ x: 50-i, y: 31+i, type: 'full' })),
    // {x: 45, y: 34, type: 'half-bottom'},
    // {x: 47, y: 36, type: 'half-bottom'},
    // {x: 50, y: 34, type: 'half-left'},
    // {x: 51, y: 33, type: 'full'},
    ...Array.from({ length: 2 }, (_, i) => ({ x: i+45 , y: 36  , type: 'full' })), 
    ...Array.from({ length: 3 }, (_, i) => ({ x: i+47 , y: 34  , type: 'full' })), 
    ...Array.from({ length: 5 }, (_, i) => ({ x: 53 , y: i+26  , type: 'half-left' })), 
    ...Array.from({ length: 2 }, (_, i) => ({ x: 52 , y: i+31  , type: 'half-right' })), 
    ...Array.from({ length: 13 }, (_, i) => ({ x: i + 16 , y: 12 , type: 'half-bottom' })), 
    ...Array.from({ length: 13 }, (_, i) => ({ x: i + 18 , y: 12 , type: 'half-top' })), 
    ...Array.from({ length: 1 }, (_, i) => ({ x: i + 17 , y: 11 , type: 'half-bottom' })), 
    
    
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
    ...Array.from({ length: 24 }, (_, i) => ({ x: 36+i , y: 4  , type: 'full' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x: 4+i , y: 5  , type: 'full' })),
    ...Array.from({ length: 3 }, (_, i) => ({ x: i+10 , y: 6  , type: 'full' })),
    ...Array.from({ length: 3 }, (_, i) => ({ x: 11 , y: 7+i  , type: 'half-right' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x: 16 , y: 16  , type: 'full' })),
    ...Array.from({ length: 2 }, (_, i) => ({ x: i+14 , y: 17  , type: 'full' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x: i+6 , y: 16  , type: 'full' })),
    ...Array.from({ length: 7 }, (_, i) => ({ x: 13 , y: i+18  , type: 'full' })),
    ...Array.from({ length: 6 }, (_, i) => ({ x: 12 , y: i+18  , type: 'half-right' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x: 16 , y: 13  , type: 'half-left' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x: 16 , y: 13  , type: 'half-left' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x: 8 , y: 17  , type: 'half-bottom' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x: 6 , y: 11  , type: 'half-bottom' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x: 11 , y: 17  , type: 'half-bottom' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x: 16 , y: 26  , type: 'half-bottom' })),
    ...Array.from({ length: 25 }, (_, i) => ({ x: i+16 , y: 23  , type: 'half-bottom' })),
    ...Array.from({ length: 11 }, (_, i) => ({ x: 45 , y: 24  , type: 'full' })),
    ...Array.from({ length: 9 }, (_, i) => ({ x: 44 , y: i+25  , type: 'half-left' })),
    ...Array.from({ length: 17 }, (_, i) => ({ x: i + 12 , y: 9 , type: 'half-bottom' })), 
    ...Array.from({ length: 1 }, (_, i) => ({ x: i + 11 , y: 9 , type: 'half-right' })), 
    ...Array.from({ length: 7 }, (_, i) => ({ x:10 , y: i , type: 'half-left' })), 
    ...Array.from({ length: 1 }, (_, i) => ({ x:2 , y: i+2 , type: 'half-right' })), 
    ...Array.from({ length: 3 }, (_, i) => ({ x:i+3 , y: 1 , type: 'half-bottom' })), 
    ...Array.from({ length: 3 }, (_, i) => ({ x:i+7 , y: 1 , type: 'half-top' })), 
    ...Array.from({ length: 29 }, (_, i) => ({ x:5 , y: i+6 , type: 'half-right' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x:6 , y: i+17 , type: 'half-top' })),
    ...Array.from({ length: 4 }, (_, i) => ({ x:i+38 , y: 36 , type: 'half-top' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x:42 , y: 35 , type: 'half-left' })),
    ...Array.from({ length: 2 }, (_, i) => ({ x:i+6 , y: 35 , type: 'half-bottom' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x:i+5 , y: 35 , type: 'half-right' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x:i+28 , y: 10 , type: 'half-top' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x:i+41 , y: 23 , type: 'half-left' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x:i+15 , y: 16 , type: 'half-right' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x:i+13 , y: 25 , type: 'half-right' })),
    ...Array.from({ length: 2 }, (_, i) => ({ x:i+32 , y: 30 , type: 'half-top' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x:i+20 , y: 24 , type: 'half-bottom' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x:i+38 , y: 25 , type: 'half-top' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x:i+43 , y: 28 , type: 'half-right' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x:i+6 , y: 9 , type: 'full' })),
    ...Array.from({ length: 2 }, (_, i) => ({ x:21 , y: i+24 , type: 'half-right' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x:41 , y: i+34 , type: 'half-right' })),
    ...Array.from({ length: 3 }, (_, i) => ({ x:i+6 , y: 26 , type: 'full' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x:i+6 , y: 30 , type: 'full' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x:i+6 , y: 33 , type: 'full' })),
    ...Array.from({ length: 2 }, (_, i) => ({ x:i+7 , y: 25 , type: 'half-bottom' })),
    ...Array.from({ length: 13 }, (_, i) => ({ x:i+34 , y: 13 , type: 'half-top' })),
    ...Array.from({ length: 1 }, (_, i) => ({ x:i+45 , y: 14 , type: 'half-right' })),
  ];
  
  // Define plantable points using grid coordinates
  const PLANTABLE_SPOTS = [
  { x: 2, y: 3 },
  { x: 3, y: 3 },
  { x: 4, y: 3 },
];

// Define crop growth stages and their corresponding images
const CROP_STAGES = {
  potato: [
    null, // Stage 0: No plant visible (empty spot)
    potato1, // Stage 1: Seedling
    potato2, // Stage 2: Growing
    potato3 // Stage 3: Mature
  ]
  // Add other crops here as needed
};

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
    description: 'Plant these to grow crops',
    price: 10, // Buy price
    sellPrice: 5 // Placeholder sell price
  },
  potato: {
    id: 2,
    name: 'Potato',
    icon: potatoIcon,
    type: 'material',
    description: 'Raw potato, can be eaten or sell it to get money',
    price: 1, // Buy price
    sellPrice: 13 // Increased sell price
  },
  bread: {
    id: 3,
    name: 'Bread',
    icon: breadIcon,
    type: 'consumable',
    description: 'Freshly baked bread',
    effect: { hunger: 30, energy: 10 },
    price: 15, // Buy price
    sellPrice: 7 // Placeholder sell price
  },
  stew: {
    id: 4,
    name: 'Stew',
    icon: stewIcon,
    type: 'quest',
    description: 'A special stew that holds significance in the village\'s history',
    // price: -1, // Not buyable - removed
    // sellPrice: -1 // Not sellable - removed
  },
  ledger: {
    id: 5,
    name: 'Ledger',
    icon: ledgerIcon,
    type: 'quest',
    description: 'An old ledger containing important information',
    // price: -1, // Not buyable - removed
    // sellPrice: -1 // Not sellable - removed
  },
  royalDocument: {
    id: 6,
    name: 'Royal Document',
    icon: royalDocumentIcon,
    type: 'quest',
    description: 'An official document from the royal family',
    // price: -1, // Not buyable - removed
    // sellPrice: -1 // Not sellable - removed
  },
  meat: {
    id: 7,
    name: 'Meat',
    icon: meatIcon,
    type: 'material',
    description: 'Raw meat, can be cooked',
    // price: 20, // Placeholder buy price - removed
    sellPrice: 10 // Placeholder sell price
  },
  mushroom: {
    id: 8,
    name: 'Mushroom',
    icon: mushroomIcon,
    type: 'material',
    description: 'A wild mushroom, can be used in cooking',
    // price: 12, // Placeholder buy price - removed
    sellPrice: 6 // Placeholder sell price
  }
};

// Helper function to get item details by ID
const getItemById = (id) => {
  const itemKeys = Object.keys(ITEMS);
  for (let i = 0; i < itemKeys.length; i++) {
    const item = ITEMS[itemKeys[i]];
    if (item.id === id) {
      return item;
    }
  }
  return undefined; // Return undefined if item not found
};

// Helper function to check if a grid position is a plantable spot
const isPlantableSpot = (gridX, gridY) => {
  return PLANTABLE_SPOTS.some(point => point.x === gridX && point.y === gridY);
};

// Define time constants for day/night cycle
const sunriseStart = 5 * 60; // 5:00 AM
const sunriseEnd = 7 * 60;   // 7:00 AM
const sunsetStart = 17 * 60; // 5:00 PM
const sunsetEnd = 19 * 60;   // 7:00 PM
const nightStart = 20 * 60;  // 8:00 PM
const nightEnd = 4 * 60;     // 4:00 AM

const Game = () => {  
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { soundEnabled, setSoundEnabled, sfxVolume, setSfxVolume, playClick, playHover, playCash } = useSound();
  const { musicEnabled, setMusicEnabled, musicVolume, setMusicVolume, startMusicPlayback } = useMusic();
  const { startDialog, advanceDialog, endDialog, isDialogActive, currentDialog, dialogIndex } = useDialog();  const character = location.state?.character;
  const isLoadedGame = location.state?.isLoadedGame;
  const initialSaveData = location.state?.saveData;
  const [isLoading, setIsLoading] = useState(true);
  const [showCutscene, setShowCutscene] = useState(false);
  const [saveFiles, setSaveFiles] = useState([]);
  const [canSave, setCanSave] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showShopConfirm, setShowShopConfirm] = useState(false);
  const [showTimeSkipPopup, setShowTimeSkipPopup] = useState(false);
  const [timeSkipHours, setTimeSkipHours] = useState('');

  // State for new quest pop-up - MOVED HERE
  const [showNewQuestPopup, setShowNewQuestPopup] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [showEatAnimation, setShowEatAnimation] = useState(false);

  // Add plantedCrops state
  const [plantedCrops, setPlantedCrops] = useState([]);
  // Add state to control visibility of interactive icons on plantable spots (hoe or watering can)
  const [interactiveIcons, setInteractiveIcons] = useState({});

  // Add state to track if player has harvested their first crop
  const [hasHarvestedFirstCrop, setHasHarvestedFirstCrop] = useState(false);

  // Ref to store previous quests state for comparison - MOVED HERE
  const prevQuestsRef = useRef([]);

  // Add character stats state
  const [health, setHealth] = useState(100);  const [energy, setEnergy] = useState(100);
  const [hunger, setHunger] = useState(100);
  const [happiness, setHappiness] = useState(100);
  const [money, setMoney] = useState(0);
  const [cleanliness, setCleanliness] = useState(100);
  const [gameTime, setGameTime] = useState({ hours: 6, minutes: 0 }); // Start at 6:00 AM
  const [currentDay, setCurrentDay] = useState(1); // Add day counter
  
  // Quest progress tracking
  const [wateringProgress, setWateringProgress] = useState(0); // Track days watered (0/3)
  const [wateringDaysCompleted, setWateringDaysCompleted] = useState(new Set()); // Track which days watering was completed

  // Add state to control visibility of hoe icons on plantable spots
  const [showHoeIcon, setShowHoeIcon] = useState({});
  // Add state for house dialog
  const [hasSeenHouseDialog, setHasSeenHouseDialog] = useState(false);

  // Add state for first shop dialogue
  const [hasSeenFirstShopDialogue, setHasSeenFirstShopDialogue] = useState(false);

  // Add state for elder talk popup
  const [showElderTalkPopup, setShowElderTalkPopup] = useState(false);

  // Add state for shop confirmation and mode
  const [shopMode, setShopMode] = useState('buy'); // 'buy' or 'sell'

  // Define basic game constants and initial player state - Moved up
  const [position, setPosition] = useState({ x: 350, y: 150 });
  const [facing, setFacing] = useState('stand');
  const [isInInterior, setIsInInterior] = useState(false);
  const speed = 25;
  const scale = 2;
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
  // Log inventory state whenever it changes
  useEffect(() => {
  }, [inventory]);

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
          setSaveFiles(files);        } catch (error) {
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
        // Give player money to buy 5 breads (5 * 15 = 75)
        setMoney(75);
      }
    }, 2000);    return () => clearTimeout(timer);
  }, [character, isLoadedGame]);

  // Initialize game state from loaded save data
  useEffect(() => {
    if (isLoadedGame && initialSaveData) {
      // Set all game state from save data
      setPosition(initialSaveData.position || { x: 1200, y: 900 });
      setFacing(initialSaveData.facing || 'down');
      setQuests(initialSaveData.quests || []);
      setWateringProgress(initialSaveData.wateringProgress || 0);
      setWateringDaysCompleted(new Set(initialSaveData.wateringDaysCompleted || []));
      setCurrentDay(initialSaveData.currentDay || 1);
      setPlantedCrops(initialSaveData.plantedCrops || []);
      setGameTime(initialSaveData.gameTime || { hours: 6, minutes: 0 });
      
      if (initialSaveData.stats) {
        setHealth(initialSaveData.stats.health || 100);
        setEnergy(initialSaveData.stats.energy || 100);
        setHunger(initialSaveData.stats.hunger || 100);
        setHappiness(initialSaveData.stats.happiness || 100);
        setMoney(initialSaveData.stats.money || 0);
        setCleanliness(initialSaveData.stats.cleanliness || 100);
      }        setHasSeenHouseDialog(initialSaveData.hasSeenHouseDialog ?? false);
      setHasSeenFirstShopDialogue(initialSaveData.hasSeenFirstShopDialogue ?? false);
      setHasHarvestedFirstCrop(initialSaveData.hasHarvestedFirstCrop ?? false);
    }
  }, [isLoadedGame, initialSaveData]);

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
  };  // Handle advancing the monologue
  const handleAdvanceMonologue = () => {
    if (dialogIndex < monologueScript.length - 1) {
      advanceDialog();
    } else {      // Dialogue ends here
      endDialog();
      // Add the initial quest after dialogue only if it doesn't exist
      setQuests(prevQuests => {
        // Check if Welcome Home quest already exists
        const welcomeHomeExists = prevQuests.some(quest => quest.title === "Welcome Home");
        if (welcomeHomeExists) {
          return prevQuests;
        }
        
        // Quest doesn't exist, so add it and trigger popup outside of setQuests
        setTimeout(() => {
          setNewQuestTitle("Welcome Home");
          setShowNewQuestPopup(true);
        }, 100);
        
        // Add the quest
        return [
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
        ];
      });
    }
  };// Handle skipping the entire monologue
  const handleSkipMonologue = () => {
    endDialog();
    // Add the initial quest and trigger popup when skipping only if it doesn't exist
    setQuests(prevQuests => {
      // Check if Welcome Home quest already exists
      const welcomeHomeExists = prevQuests.some(quest => quest.title === "Welcome Home");
      if (welcomeHomeExists) {
        return prevQuests;
      }
      
      // Quest doesn't exist, so add it and trigger popup outside of setQuests
      setTimeout(() => {
        setNewQuestTitle("Welcome Home");
        setShowNewQuestPopup(true);
      }, 100);
      
      // Add the quest if it doesn't exist
      return [
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
      ];
    });
  };

  // Convert pixel position to grid coordinates
  const getGridPosition = useCallback((x, y) => ({
    gridX: Math.floor(x / GRID_SIZE),
    gridY: Math.floor(y / GRID_SIZE)
  }), [GRID_SIZE]);

  // Add save point coordinates
  const SAVE_POINTS = [
    { x: 0, y: 2 },
    { x: 0, y: 1 }
  ];
  // Check if player is at a save point
  const checkSavePoint = useCallback((x, y) => {
    const playerGridPos = getGridPosition(x, y);
    return SAVE_POINTS.some(point => 
      point.x === playerGridPos.gridX && point.y === playerGridPos.gridY
    );
  }, [getGridPosition]);
  // Define Elder position (grid coordinates)
  const ELDER_POSITION_GRID = { x: 15, y: 16 };
  // Calculate Elder pixel position
  const ELDER_POSITION_PIXEL = { x: ELDER_POSITION_GRID.x * GRID_SIZE, y: ELDER_POSITION_GRID.y * GRID_SIZE };
  const ELDER_SIZE = 32; // Assuming similar size to player for positioning
  // Define Guard position (grid coordinates)
  const GUARD_POSITION_GRID = { x: 28, y: 10 };
  // Calculate Guard pixel position
  const GUARD_POSITION_PIXEL = { x: GUARD_POSITION_GRID.x * GRID_SIZE, y: GUARD_POSITION_GRID.y * GRID_SIZE };
  const GUARD_SIZE = 32; // Similar size to other NPCs
  // Define Second Guard position (grid coordinates)
  const GUARD2_POSITION_GRID = { x: 41, y: 23 };
  // Calculate Second Guard pixel position
  const GUARD2_POSITION_PIXEL = { x: GUARD2_POSITION_GRID.x * GRID_SIZE, y: GUARD2_POSITION_GRID.y * GRID_SIZE };
  const GUARD2_SIZE = 32; // Similar size to other NPCs
  // Define Third Guard position (grid coordinates)
  const GUARD3_POSITION_GRID = { x: 41, y: 34 };
  // Calculate Third Guard pixel position
  const GUARD3_POSITION_PIXEL = { x: GUARD3_POSITION_GRID.x * GRID_SIZE, y: GUARD3_POSITION_GRID.y * GRID_SIZE };
  const GUARD3_SIZE = 32; // Similar size to other NPCs

  // Define Fourth Guard position (grid coordinates)
  const GUARD4_POSITION_GRID = { x: 13, y: 25 };
  // Calculate Fourth Guard pixel position
  const GUARD4_POSITION_PIXEL = { x: GUARD4_POSITION_GRID.x * GRID_SIZE, y: GUARD4_POSITION_GRID.y * GRID_SIZE };
  const GUARD4_SIZE = 32; // Similar size to other NPCs

  // Check proximity to Elder
  const checkElderProximity = useCallback((playerX, playerY) => {
    const playerCenterX = playerX + (PLAYER_SIZE / 2);
    const playerCenterY = playerY + (PLAYER_SIZE / 2);
    const elderCenterX = ELDER_POSITION_PIXEL.x + (ELDER_SIZE / 2);
    const elderCenterY = ELDER_POSITION_PIXEL.y + (ELDER_SIZE / 2);
    const distance = Math.sqrt(
      Math.pow(playerCenterX - elderCenterX, 2) + Math.pow(playerCenterY - elderCenterY, 2)
    );
    const proximityThreshold = GRID_SIZE * 1.5; // Increased threshold for easier interaction
    
    // Debug logging
    console.log('Elder Proximity Check:', {
      playerPosition: { x: playerX, y: playerY },
      playerCenter: { x: playerCenterX, y: playerCenterY },
      elderPosition: ELDER_POSITION_PIXEL,
      elderCenter: { x: elderCenterX, y: elderCenterY },
      distance,
      threshold: proximityThreshold,
      isClose: distance < proximityThreshold
    });
    
    return distance < proximityThreshold;
  }, [ELDER_POSITION_PIXEL.x, ELDER_POSITION_PIXEL.y, ELDER_SIZE, PLAYER_SIZE, GRID_SIZE]);

  // Update save game function
  const saveGame = async () => {
    if (!user || !canSave) return;

    try {      const gameState = {
        character,
        position,
        facing,
        inventory: inventory || [],
        quests: quests || [],
        wateringProgress,
        wateringDaysCompleted: Array.from(wateringDaysCompleted),
        currentDay,
        plantedCrops,
        gameTime,
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
          musicVolume        },
        hasSeenHouseDialog,
        hasSeenFirstShopDialogue,
        hasHarvestedFirstCrop,
      };

      const saveData = createSaveFileData(gameState);
      await saveFileService.saveGame(user.uid, saveData);
      
      const files = await saveFileService.getUserSaveFiles(user.uid);
      setSaveFiles(files);
      setShowSavePrompt(false);    } catch (error) {
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
        
        // Restore quest and watering progress
        setQuests(gameState.quests || []);
        setWateringProgress(gameState.wateringProgress || 0);
        setWateringDaysCompleted(new Set(gameState.wateringDaysCompleted || []));
        setCurrentDay(gameState.currentDay || 1);
        setPlantedCrops(gameState.plantedCrops || []);
        setGameTime(gameState.gameTime || { hours: 6, minutes: 0 });
        
        if (gameState.settings) {
          setSoundEnabled(gameState.settings.soundEnabled ?? true);
          setSfxVolume(gameState.settings.sfxVolume ?? 0.5);
          setMusicEnabled(gameState.settings.musicEnabled ?? true);
          setMusicVolume(gameState.settings.musicVolume ?? 0.5);        }
        setHasSeenHouseDialog(gameState.hasSeenHouseDialog ?? false);
        setHasSeenFirstShopDialogue(gameState.hasSeenFirstShopDialogue ?? false);}
    } catch (error) {
    }
  };

  // Get character-specific sprites
  const getCharacterSprites = () => {
    
    // Handle case where character might be an object with a name property
    const characterName = typeof character === 'object' && character !== null ? character.name : character;    switch (String(characterName).toLowerCase()) {
      case 'eugene':
        return {
          stand: eugeneStand,
          walkUp: eugeneWalkUp,
          walkDown: eugeneWalkDown,
          walkLeft: eugeneWalkLeft,
          walkRight: eugeneWalkRight,
          eat: eugeneEat
        };
      case 'louise':
        return {
          stand: louiseStand,
          walkUp: louiseWalkUp,
          walkDown: louiseWalkDown,
          walkLeft: louiseWalkLeft,
          walkRight: louiseWalkRight,
          eat: louiseEat        };
      default:
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
    return sprite;  };
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
  const checkTeleport = useCallback((x, y) => {
    const playerGridPos = getGridPosition(x, y);
    const teleportPoint = TELEPORT_POINTS.find(
      point => point.x === playerGridPos.gridX && point.y === playerGridPos.gridY
    );

    if (teleportPoint) {
      setIsInInterior(true);
      setPosition(teleportPoint.spawnPoint);
    }
  }, [getGridPosition]);

  // Check if player is at a shop trigger point
  const checkShopTrigger = useMemo(() => (x, y, justCheck = false) => {
    const playerGridPos = getGridPosition(x, y);
    const isAtShop = shopPoints.some(point =>
      point.x === playerGridPos.gridX && point.y === playerGridPos.gridY
    );

    if (!justCheck && isAtShop) {
      setShowShopConfirm(true);
    }
    return isAtShop;
  }, [shopPoints, getGridPosition]);

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
  const handleCloseSettings = () => setShowSettings(false);  const handleExit = () => {
    // Force a page reload when navigating to main menu
    window.location.href = '/';
  };

  // Handle item usage
  const handleUseItem = useCallback((item) => {
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
  }, []);

  // Prevent movement and interactions when paused, in dialogue, in shop, or talking to elder
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isSleeping || isPaused || isDialogActive || showShop || showElderTalkPopup) return;

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
        case 't': // Time skip
          if (!isDialogActive && !isPaused && !showShop) {
            setShowTimeSkipPopup(true);
          }
          break;
        case 'w':
        case 'arrowup':
          newY = position.y - speed;
          if (!hasCollision(newX, newY)) {
            setFacing('up');
            setPosition((prev) => ({
              ...prev,
              y: Math.max(0, newY),
            }));
            // Batch state updates to reduce re-renders
            setEnergy((prev) => Math.max(0, prev - energyCost));
            setCleanliness((prev) => Math.max(0, prev - cleanlinessCost));
            
            // Check save point and update save state
            const isAtSavePoint = checkSavePoint(newX, newY);
            setCanSave(isAtSavePoint);
            setShowSavePrompt(isAtSavePoint);
            
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
        case 'p': // Handle planting
          const playerGridPos = getGridPosition(position.x, position.y);
          if (isPlantableSpot(playerGridPos.gridX, playerGridPos.gridY)) {
            // Check if player has seeds
            const seedItem = inventory.find(item => item.name === 'Seeds');
            if (seedItem && seedItem.quantity > 0) {
              // Check if a crop is already planted here
              const existingCrop = plantedCrops.find(crop => crop.x === playerGridPos.gridX && crop.y === playerGridPos.gridY);
              if (!existingCrop) {
                // Consume one seed
                setInventory(prev => prev.map(item => 
                  item.name === 'Seeds' ? { ...item, quantity: item.quantity - 1 } : item
                ).filter(item => item.quantity > 0));

                // Add new planted crop (start at stage 1)
                setPlantedCrops(prev => [...prev, {
                  x: playerGridPos.gridX,
                  y: playerGridPos.gridY,
                  type: 'potato',
                  stage: 1,
                  plantTime: Date.now() // Track planting time for growth
                }]);
              }
            }
          }
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
  }, [
    position, 
    isInInterior, 
    isSleeping, 
    isPaused, 
    isDialogActive, 
    showShop, 
    showElderTalkPopup, 
    canSave,
    inventory,
    plantedCrops,
    checkSavePoint,
    checkTeleport,
    checkShopTrigger,
    checkElderProximity,
    getGridPosition,
    handleUseItem
  ]); // Reduced and memoized dependencies

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
    );  };

  // Function to add item to inventory
  const addItemToInventory = (itemId, quantity = 1) => {
    setInventory(prev => {
      const existingItemIndex = prev.findIndex(item => item.id === itemId);

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const newInventory = [...prev];
        newInventory[existingItemIndex] = {
          ...newInventory[existingItemIndex],
          quantity: newInventory[existingItemIndex].quantity + quantity
        };
        return newInventory;
      } else {
        // Add new item if it doesn't exist
        const itemDetails = getItemById(itemId);
        if (itemDetails) {
          // Ensure icon and other necessary properties are included
          return [...prev, { 
            id: itemDetails.id,
            name: itemDetails.name,
            icon: itemDetails.icon, // Explicitly include the icon
            type: itemDetails.type,
            description: itemDetails.description,
            quantity: quantity,
            // Include price/sellPrice if needed for inventory display later
            price: itemDetails.price,
            sellPrice: itemDetails.sellPrice           }];
        } else {
          return prev; // Return previous state if item ID is invalid
        }
      }
    });
  };

  // Add a function to check proximity to plantable spots and update showHoeIcon state
  const checkPlantableProximity = useMemo(() => (playerX, playerY) => {
    const playerGridPos = getGridPosition(playerX, playerY);
    const proximityThreshold = 1.5; // Show icon when player is within 1.5 grid cells

    const spotsToShowIcon = {};
    PLANTABLE_SPOTS.forEach(spot => {
      const distance = Math.sqrt(
        Math.pow(playerGridPos.gridX - spot.x, 2) + Math.pow(playerGridPos.gridY - spot.y, 2)
      );
      // Check proximity and if the spot is not already planted
      const isPlanted = plantedCrops.some(crop => crop.x === spot.x && crop.y === spot.y);
      if (distance < proximityThreshold && !isPlanted) {
        spotsToShowIcon[`${spot.x},${spot.y}`] = true;
      }
    });
    setShowHoeIcon(spotsToShowIcon);
  }, [PLANTABLE_SPOTS, plantedCrops, getGridPosition]); // Dependencies for useMemo

  // Effect to update hoe icon visibility when player position or plantedCrops changes
  useEffect(() => {
    checkPlantableProximity(position.x, position.y);
  }, [position, plantedCrops, checkPlantableProximity]);

  // Add a function to check proximity to plantable spots and update interactiveIcons state
  const checkInteractiveIcons = useMemo(() => (playerX, playerY) => {
    const playerGridPos = getGridPosition(playerX, playerY);
    const proximityThreshold = 1.5; // Show icon when player is within 1.5 grid cells

    const iconsToShow = {};
    PLANTABLE_SPOTS.forEach(spot => {
      const distance = Math.sqrt(
        Math.pow(playerGridPos.gridX - spot.x, 2) + Math.pow(playerGridPos.gridY - spot.y, 2)
      );
      const isPlanted = plantedCrops.find(crop => crop.x === spot.x && crop.y === spot.y);

      if (distance < proximityThreshold) {
        if (!isPlanted) {
          // Show hoe icon if spot is empty and near
          iconsToShow[`${spot.x},${spot.y}`] = 'hoe';
        } else if (isPlanted.stage === 3) {
          // Show sickle icon if crop is mature (stage 3)
          iconsToShow[`${spot.x},${spot.y}`] = 'sickle';
        } else if (isPlanted.needsWatering) {
          // Show watering can icon if spot has a crop that needs watering and is near
          iconsToShow[`${spot.x},${spot.y}`] = 'wateringCan';
        }
      }
    });
    setInteractiveIcons(iconsToShow);
  }, [PLANTABLE_SPOTS, plantedCrops, getGridPosition]); // Dependencies for useMemo

  // Effect to update interactive icon visibility when player position or plantedCrops changes
  useEffect(() => {
    checkInteractiveIcons(position.x, position.y);
  }, [position, plantedCrops, checkInteractiveIcons]);

  // Refs to hold the latest state for the time interval
  const plantedCropsRef = useRef(plantedCrops);
  const currentDayRef = useRef(currentDay);

  // Update refs whenever state changes
  useEffect(() => {
    plantedCropsRef.current = plantedCrops;
  }, [plantedCrops]);

  useEffect(() => {
    currentDayRef.current = currentDay;
  }, [currentDay]);

  // Update time system effect to handle days and watering reset
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setGameTime(prevTime => {
        let newMinutes = prevTime.minutes + 1;
        let newHours = prevTime.hours;

        if (newMinutes >= 60) {
          newMinutes = 0;          newHours = (newHours + 1) % 24;

          // Check if day has changed
          if (newHours === 0) {
            setCurrentDay(prevDay => {
              const newDay = prevDay + 1;

             
              // Update crop state based on watering and day progression
              setPlantedCrops(prevCrops => prevCrops.map(crop => {
                // Only process non-mature crops
                if (crop.stage < 3) {
                  // Check if the crop was watered on the previous day
                  const grewToday = !crop.needsWatering;

                  // Advance stage if it grew today, otherwise keep current stage
                  const nextStage = grewToday ? Math.min(3, crop.stage + 1) : crop.stage;                  // All non-mature crops need watering at the start of a new simulated day
                  const needsWateringForNewDay = nextStage < 3; // Needs watering only if not mature after growth

                  return { ...crop, stage: nextStage, needsWatering: needsWateringForNewDay };
                }
                // Mature crops (stage 3) don't need watering and are ready for harvest
                return crop; // Keep mature crops as they are, waiting for harvest
              }));

              return newDay;
            });
          }
        }

        return { hours: newHours, minutes: newMinutes };
      });
    }, 1000); // Update every second

    return () => clearInterval(timeInterval);
  }, []); // Empty dependency array as interval logic reads from refs

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
    
    return `Day ${currentDay} - ${hours}:${minutes} ${ampm}`;
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
      return 0.4;    } else {
      // Day time - no darkness
      return 0;
    }
  };

  // Add this before the return statement
  const handleTimeSkip = (hours) => {
    const hoursToSkip = parseInt(hours);
    if (isNaN(hoursToSkip) || hoursToSkip <= 0) {
      alert('Please enter a valid number of hours');
      return;
    }    const totalMinutesToSkip = hoursToSkip * 60;
    
    setGameTime(prevTime => {
      let currentTotalMinutes = prevTime.hours * 60 + prevTime.minutes;
      let newTotalMinutes = currentTotalMinutes + totalMinutesToSkip;

      let daysToAdd = Math.floor(newTotalMinutes / (24 * 60)) - Math.floor(currentTotalMinutes / (24 * 60));      // Only update day and simulate crop growth if at least one full day has passed
      if (daysToAdd > 0) {
        setCurrentDay(prevDay => {
          const newDay = prevDay + daysToAdd;

          // Simulate daily growth and watering needs for each skipped day
          setPlantedCrops(prevCrops => {
            let updatedCrops = [...prevCrops];
            for (let i = 0; i < daysToAdd; i++) {
              updatedCrops = updatedCrops.map(crop => {
                if (crop.stage < 3) {
                  const grewToday = !crop.needsWatering;
                  const nextStage = grewToday ? Math.min(3, crop.stage + 1) : crop.stage;                  const needsWateringForNewDay = nextStage < 3;
                  return { ...crop, stage: nextStage, needsWatering: needsWateringForNewDay };
                }
                return crop;
              });
            }
            return updatedCrops;
          });

          return newDay;
        });
      }

      // Calculate the final time within the day
      newTotalMinutes = newTotalMinutes % (24 * 60);
      const finalHours = Math.floor(newTotalMinutes / 60);
      const finalMinutes = newTotalMinutes % 60;

      return { hours: finalHours, minutes: finalMinutes };
    });

    setTimeSkipHours('');
    setShowTimeSkipPopup(false);
  };

  // Add effect to handle music transition
  useEffect(() => {
    // Stop current music
    setMusicEnabled(false);
    
    // Start game music after a short delay
    const timer = setTimeout(() => {
      if (musicEnabled) {
        startMusicPlayback();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []); // Empty dependency array means this runs once when component mounts

  // Bath tile coordinates
const BATH_TILES = [
  { x: 10, y: 36 },
  { x: 11, y: 36 },
  { x: 12, y: 36 },
  { x: 13, y: 36 },
];

// Check if player is on a bath tile
const isOnBathTile = () => {
  const playerGridPos = getGridPosition(position.x, position.y);
  return BATH_TILES.some(tile => tile.x === playerGridPos.gridX && tile.y === playerGridPos.gridY);
};

const [showBathPopup, setShowBathPopup] = useState(false);

// Show/hide bath popup based on player position
useEffect(() => {
  if (!isPaused && !isDialogActive && !showShop && !isSleeping && isOnBathTile()) {
    setShowBathPopup(true);
  } else {
    setShowBathPopup(false);
  }
}, [position, isPaused, isDialogActive, showShop, isSleeping]);

// Bath action handler
const handleBath = () => {
  playClick();
  setCleanliness(prev => Math.min(100, prev + 40)); // Increase cleanliness
  setShowBathPopup(false);
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
          currentDay={currentDay}
          setCurrentDay={setCurrentDay}
        />
      </DialogProvider>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Styled Status Bar (HP, Hunger, Hygiene, Happiness) */}
      {!isDialogActive && !isLoading && !showCutscene && !showShop && !isSleeping && (
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
                  <img src={hungerIcon} alt="Hunger" className="w-6 h-a6 mr-1" /> {Math.round(hunger)}/100
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
            {!isDialogActive && !isLoading && !showCutscene && !showShop && !isSleeping && <ActiveQuestFolderUI quests={quests} />}
          </div>
          {!isDialogActive && !isLoading && !showCutscene && !showShop && !isSleeping && <QuestFolder quests={quests} />}

          {/* Minimap */}
          {!isLoading && !showCutscene && !showShop && !isSleeping && (
            <div className="z-[50]"> {/* Added wrapper with higher z-index */}
              <Minimap position={position} shopPoints={shopPoints} />
            </div>
          )}
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
              onClick={() => {
                playClick();
                handleSkipMonologue();
              }}
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
          onClick={() => {
            playClick();
            handlePause();
          }}
          onMouseEnter={playHover}
          className="fixed top-4 right-4 z-50 cursor-pointer hover:scale-110 transition-transform duration-200"
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
              <button 
                className="pause-menu-btn w-56" 
                onClick={() => {
                  playClick();
                  handleResume();
                }}
                onMouseEnter={playHover}
              >
                Resume
              </button>
              <button 
                className="pause-menu-btn w-56" 
                onClick={() => {
                  playClick();
                  handleSettings();
                }}
                onMouseEnter={playHover}
              >
                Settings
              </button>
              <button 
                className="pause-menu-btn w-56" 
                onClick={() => {
                  playClick();
                  handleExit();
                }}
                onMouseEnter={playHover}
              >
                Exit
              </button>
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
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-[#8B4513] p-3 rounded-lg text-white border-3 border-[#D2B48C] shadow-lg w-[280px] h-fit">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-base font-bold text-[#F5DEB3]">Shop ({shopMode === 'buy' ? 'Buying' : 'Selling'})</h2>              <button
                onClick={() => {
                  playClick();
                  setShowShop(false);
                  // Show merchant cancel dialogue
                  setTimeout(() => {
                    startDialog({
                      characterName: 'merchant',
                      expression: 'neutral',
                      dialogue: ["No need to rush—just remember, a farm doesn't grow itself."]
                    });
                  }, 100);
                }}
                className="bg-red-500 text-white px-1 py-[2px] rounded hover:bg-red-600 transition-colors text-xs"
              >
                Close
              </button>
            </div>

            {/* Shop Content - Conditional Rendering based on shopMode */}
            {shopMode === 'buy' && (
              <div className="flex flex-col gap-2 mb-2 max-h-[150px] overflow-y-auto">
                {/* Container for items */}
                <div className="flex flex-col gap-2">
                  {/* Seeds */}
                  <div 
                    className="bg-[#A0522D] p-2 rounded border border-[#D2B48C] hover:border-[#F5DEB3] transition-colors cursor-pointer flex items-center gap-2"
                    onClick={() => {
                      const seedItem = getItemById(1); // Use getItemById with ID 1 for Seeds
                      if (seedItem && money >= seedItem.price) {
                        playCash();
                        setMoney(prevMoney => prevMoney - seedItem.price);
                        addItemToInventory(seedItem.id, 1);


                        // Update quest objective: Buy seeds from the shop
                        setQuests(prevQuests => {
                          const updatedQuests = prevQuests.map(quest => {
                            if (quest.title === "The First Harvest") {
                              return {
                                ...quest,
                                objectives: quest.objectives.map(objective => {
                                  if (objective.description === "Buy seeds from the shop") {
                                    return { ...objective, completed: true };
                                  }
                                  return objective;
                                })
                              };
                            }
                            return quest;
                          });
                          return updatedQuests;
                        });

                      } else if (seedItem) {

                      } else {

                      }
                    }}
                  >
                    <img src={seedsIcon} alt="Seeds" className="w-8 h-8 object-contain" />
                    <div className="flex-grow">
                      <p className="text-sm font-bold text-[#F5DEB3]">Seeds</p>
                      <p className="text-xs">Price: {ITEMS.seeds.price}</p>
                    </div>
                  </div>

                  {/* Bread */}
                  <div 
                    className="bg-[#A0522D] p-2 rounded border border-[#D2B48C] hover:border-[#F5DEB3] transition-colors cursor-pointer flex items-center gap-2"
                    onClick={() => {
                      const breadItem = getItemById(3); // Use getItemById with ID 3 for Bread
                      if (breadItem && money >= breadItem.price) {
                        playCash();
                        setMoney(prevMoney => prevMoney - breadItem.price);
                        addItemToInventory(breadItem.id, 1);

                      } else if (breadItem) {

                      } else {

                      }
                    }}
                  >
                    <img src={breadIcon} alt="Bread" className="w-8 h-8 object-contain" />
                    <div className="flex-grow">
                      <p className="text-sm font-bold text-[#F5DEB3]">Bread</p>
                      <p className="text-xs">Price: 15</p>
                    </div>
                  </div>

                  {/* Empty slots for aesthetic */}
                  {[...Array(4)].map((_, i) => (
                    <div key={`empty-${i}`} className="bg-[#A0522D] p-2 rounded border border-[#D2B48C] opacity-50" style={{ height: '64px' }}>{/* Added height for consistency */}</div>
                  ))}
                </div>
              </div>
            )}

            {shopMode === 'sell' && (
              <div className="flex flex-col gap-2 mb-2 max-h-[150px] overflow-y-auto">
                {/* Inventory items to sell */}
                {inventory.length > 0 ? (
                  inventory.map((item, index) => (
                    <div 
                      key={index} 
                      className="bg-[#A0522D] p-2 rounded border border-[#D2B48C] hover:border-[#F5DEB3] transition-colors cursor-pointer flex items-center gap-2"                      onClick={() => {
                        if (item.sellPrice !== -1) {
                          playCash();
                          setMoney(prevMoney => prevMoney + item.sellPrice);
                          setInventory(prevInventory => {
                            const newInventory = [...prevInventory];
                            if (newInventory[index].quantity > 1) {
                              newInventory[index] = {
                                ...newInventory[index],
                                quantity: newInventory[index].quantity - 1
                              };
                            } else {
                              newInventory.splice(index, 1);
                            }
                            return newInventory;
                          });                          // Update quest objective: Sell the potato at the shop (if selling a potato)
                          if (item.name === 'Potato') {
                            setQuests(prevQuests => {
                              return prevQuests.map(quest => {
                                if (quest.title === "The First Harvest") {
                                  return {
                                    ...quest,
                                    objectives: quest.objectives.map(objective => {
                                      if (objective.description === "Sell the potato at the shop") {
                                        return { ...objective, completed: true };
                                      }
                                      return objective;
                                    })
                                  };
                                }
                                return quest;
                              });
                            });
                          }

                        }
                      }}
                    >
                      <img src={item.icon} alt={item.name} className="w-8 h-8 object-contain" />
                      <div className="flex-grow">
                        <p className="text-sm font-bold text-[#F5DEB3]">{item.name} (x{item.quantity})</p>
                        {item.sellPrice !== -1 && (
                          <p className="text-xs">Sell Price: {item.sellPrice}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-[#F5DEB3] opacity-75">Your inventory is empty.</div>
                )}
              </div>
            )}

            {/* Player's Money */}
            <div className="flex items-center gap-1 bg-[#A0522D] p-1 rounded border border-[#D2B48C]">
              <img src={moneyIcon} alt="Money" className="w-3 h-3" />
              <span className="text-xs text-[#F5DEB3] font-bold">{money}</span>
            </div>
          </div>
        </div>
      )}

      {/* Add Inventory */}
      {!isDialogActive && !isPaused && !isLoading && !showCutscene && !showShop && !isSleeping && (
        <Inventory 
          items={inventory} 
          onUseItem={handleUseItem}
        />
      )}

      {/* Bath Popup Button */}
      {showBathPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}>
          <div className="bg-[#8B4513] p-6 rounded-lg border-8 border-[#D2B48C] shadow-lg flex flex-col items-center gap-4">
            <h2 className="text-xl font-bold text-[#F5DEB3]">Take a Bath?</h2>
            <button
              className="bg-[#8B4513] text-[#F5DEB3] px-8 py-2 rounded border-4 border-[#D2B48C] hover:bg-[#A0522D] hover:border-[#F5DEB3] hover:scale-105 transition-all duration-200 text-lg font-bold"
              onClick={handleBath}
              onMouseEnter={playHover}
            >
              Bath
            </button>
            <button
              className="bg-[#8B4513] text-[#F5DEB3] px-8 py-2 rounded border-4 border-[#D2B48C] hover:bg-[#A0522D] hover:border-[#F5DEB3] hover:scale-105 transition-all duration-200 text-lg"
              onClick={() => setShowBathPopup(false)}
              onMouseEnter={playHover}
            >
              Cancel
            </button>
          </div>
        </div>
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
      {(() => {
        const totalMinutes = gameTime.hours * 60 + gameTime.minutes;
        return (
          <div 
            className={`fixed inset-0 pointer-events-none z-[45] transition-colors duration-1000 ${
              totalMinutes >= nightStart || totalMinutes < sunriseStart ? 'bg-black/50' :
              totalMinutes >= sunsetEnd && totalMinutes < nightStart ? 'bg-black/30' :
              totalMinutes >= sunriseStart && totalMinutes < sunriseEnd ? 'bg-black/20' :
              'bg-transparent'
            }`}
          />
        );
      })()}

      {/* Render HouseInterior or Main Game */}
      {isInInterior ? (
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
            currentDay={currentDay}
            setCurrentDay={setCurrentDay}
          />
        </DialogProvider>
      ) : (        <>
          {/* Elder Talk Confirmation Popup */}
          {showElderTalkPopup && !isPaused && !isDialogActive && !showShop && (
            <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
              <div className="bg-[#8B4513] p-8 rounded-lg max-w-md w-full mx-4 relative border-8 border-[#D2B48C] shadow-lg flex flex-col items-center gap-4">
                <h2 className="text-2xl font-bold text-center text-[#F5DEB3]">Talk to Elder?</h2>
                <div className="flex flex-col gap-2">
                  <button 
                    className="bg-[#8B4513] text-[#F5DEB3] px-6 py-2 rounded border-4 border-[#D2B48C] hover:bg-[#A0522D] hover:border-[#F5DEB3] hover:scale-105 transition-all duration-200 w-32"
                    onClick={() => {
                      // Start elder dialog
                      startDialog({
                        characterName: "Village Elder",
                        expression: "neutral",
                        dialogue: [
                          "Ah… so you have returned.",
                          "Your family's cottage still stands, though time has not been kind to it. Much like the land… and its people.",
                          "The village remembers your name, but memories fade. If you wish to stay, you must build more than a home—you must build trust.",
                          "The fields need tending. The forge waits for skillful hands. And somewhere in the shadows of this land, echoes of your past linger still.",
                          "Will you work the soil, forge your own tools, or seek the knowledge buried beneath stone and dust?"
                        ],
                        onComplete: () => {
                          // Add new quest after dialogue ends
                          setQuests(prevQuests => {
                            // First update the Welcome Home quest
                            const updatedQuests = prevQuests.map(quest => {
                              if (quest.title === "Welcome Home") {
                                return {
                                  ...quest,
                                  objectives: quest.objectives.map(objective => {
                                    if (objective.description === "Meet the village elder") {
                                      return { ...objective, completed: true };
                                    }
                                    return objective;
                                  })
                                };
                              }
                              return quest;
                            });
                            
                            // Then add the new quest
                            const firstHarvestQuestExists = updatedQuests.some(quest => quest.title === "The First Harvest");                            if (!firstHarvestQuestExists) {
                              return [
                                ...updatedQuests,
                                {
                                  title: "The First Harvest",
                                  description: "Begin your farming journey by purchasing seeds from the shop.",
                                  objectives: [
                                    {
                                      description: "Buy seeds from the shop",
                                      completed: false
                                    },
                                    {
                                      description: "Plant the seed",
                                      completed: false                                    },
                                    {
                                      description: "Water your planted crops for 2 day (0/2)",
                                      completed: false                                    },
                                    {
                                      description: "Harvest the mature potato",
                                      completed: false
                                    },
                                    {
                                      description: "Sell the potato at the shop",
                                      completed: false
                                    }
                                  ]
                                }
                              ];
                            } else {
                              // If quest already exists, just return updated quests (Welcome Home)
                              return updatedQuests;
                            }
                          });
                          
                          // Show new quest popup
                          setNewQuestTitle("The First Harvest");
                          setShowNewQuestPopup(true);
                        }
                      });
                      
                      setShowElderTalkPopup(false);
                    }}
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
                  {/* Render planted crops */}
                  {plantedCrops.map((crop, index) => (
                    <div
                      key={`crop-${index}`}
                      className="crop"
                      style={{
                        position: 'absolute',
                        left: `${crop.x * GRID_SIZE}px`,
                        top: `${crop.y * GRID_SIZE + 12}px`,
                        width: `${GRID_SIZE * 1}px`,
                        height: `${GRID_SIZE * 0.8}px`,
                        backgroundImage: `url(${CROP_STAGES[crop.type][crop.stage]})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        zIndex: 2
                      }}
                    />
                  ))}
                  {/* Render hoe icons on plantable spots */}
                  {PLANTABLE_SPOTS.map(spot => {
                    const spotKey = `${spot.x},${spot.y}`;
                    const iconType = interactiveIcons[spotKey];                    if (iconType) {
                      const iconSrc = iconType === 'hoe' ? hoeIcon : 
                                     iconType === 'wateringCan' ? wateringCanIcon : 
                                     iconType === 'sickle' ? sickleIcon : hoeIcon;
                      const altText = iconType === 'hoe' ? 'Plant' : 
                                     iconType === 'wateringCan' ? 'Water' : 
                                     iconType === 'sickle' ? 'Harvest' : 'Plant';

                      return (
                        <img
                          key={`${iconType}-${spotKey}`}
                          src={iconSrc}
                          alt={altText}
                          className="absolute pixelated z-50 hover:scale-110 transition-transform duration-100"
                          style={{
                            left: `${spot.x * GRID_SIZE + GRID_SIZE / 4}px`,
                            top: `${spot.y * GRID_SIZE + GRID_SIZE / 4}px`,
                            width: `${GRID_SIZE / 2}px`,
                            height: `${GRID_SIZE / 2}px`,
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            const playerGridPos = getGridPosition(position.x, position.y);
                            const isCurrentlyPlanted = plantedCrops.find(crop => crop.x === spot.x && crop.y === spot.y);

                            if (iconType === 'hoe') {
                              // Planting logic
                              const isCurrentlyPlantable = PLANTABLE_SPOTS.some(p => p.x === playerGridPos.gridX && p.y === playerGridPos.gridY);

                              if (isCurrentlyPlantable && !isCurrentlyPlanted) {
                                const seedItem = inventory.find(item => item.name === 'Seeds');
                                if (seedItem && seedItem.quantity > 0) {
                                  setInventory(prev => prev.map(item => 
                                    item.name === 'Seeds' ? { ...item, quantity: item.quantity - 1 } : item
                                  ).filter(item => item.quantity > 0));

                                  setPlantedCrops(prev => [...prev, {
                                    x: spot.x,
                                    y: spot.y,
                                    type: 'potato',
                                    stage: 1,
                                    plantTime: Date.now(), // Not strictly needed for day-based growth, but good to keep
                                    plantDay: currentDay, // Record the day it was planted
                                    needsWatering: true, // Needs watering immediately on day 1
                                  }]);


                                  // Update quest objective: Plant the seed (assuming this quest exists and objective matches)
                                  setQuests(prevQuests => {
                                    const updatedQuests = prevQuests.map(quest => {
                                      if (quest.title === "The First Harvest") { // Adjust quest title if needed
                                        return {
                                          ...quest,
                                          objectives: quest.objectives.map(objective => {
                                            if (objective.description === "Plant the seed") { // Adjust objective description if needed
                                              return { ...objective, completed: true };
                                            }
                                            return objective;
                                          })
                                        };
                                      }
                                      return quest;
                                    });
                                    return updatedQuests;
                                  });

                                } else {

                                }
                              } else {

                              }                            } else if (iconType === 'wateringCan' && isCurrentlyPlanted && isCurrentlyPlanted.needsWatering) {
                              // Watering logic
                              setPlantedCrops(prevCrops => prevCrops.map(crop => {
                                if (crop.x === spot.x && crop.y === spot.y) {
                                  return { ...crop, needsWatering: false }; // Mark as watered for the current day
                                }
                                return crop;
                              }));

                              // Track watering progress for quest (only count once per day)
                              if (!wateringDaysCompleted.has(currentDay)) {
                                const newWateringDaysCompleted = new Set(wateringDaysCompleted);
                                newWateringDaysCompleted.add(currentDay);
                                setWateringDaysCompleted(newWateringDaysCompleted);
                                
                                const newProgress = newWateringDaysCompleted.size;
                                setWateringProgress(newProgress);
                                  // Update quest objective description and completion status
                                setQuests(prevQuests => {
                                  return prevQuests.map(quest => {
                                    if (quest.title === "The First Harvest") {
                                      return {
                                        ...quest,                                        objectives: quest.objectives.map(objective => {                                          if (objective.description.includes("Water your planted crops for 2 day")) {
                                            return { 
                                              ...objective, 
                                              description: `Water your planted crops for 2 day (${newProgress}/2)`,
                                              completed: newProgress >= 2
                                            };
                                          }
                                          return objective;
                                        })
                                      };
                                    }
                                    return quest;
                                  });
                                });
                              }                            } else if (iconType === 'sickle' && isCurrentlyPlanted && isCurrentlyPlanted.stage === 3) {
                              // Harvest logic                              // Add harvested item (Potato) to inventory
                              addItemToInventory(2); // Assuming Potato has ID 2 based on ITEMS definition
                              // Remove the crop from plantedCrops
                              setPlantedCrops(prevCrops => prevCrops.filter(crop => !(crop.x === spot.x && crop.y === spot.y)));
                              
                              // Trigger first harvest dialogue (only on first harvest)
                              if (!hasHarvestedFirstCrop) {
                                startDialog({
                                  characterName: character?.name || 'Character',
                                  expression: 'smile',
                                  dialogue: [
                                    "Ah… my first harvest. It may not be much, but it's mine.",
                                    "Time to see if these are worth anything at the market."
                                  ]
                                });
                                setHasHarvestedFirstCrop(true);
                              }

                              // Update quest objective: Harvest the mature potato
                              setQuests(prevQuests => {
                                return prevQuests.map(quest => {
                                  if (quest.title === "The First Harvest") {
                                    return {
                                      ...quest,
                                      objectives: quest.objectives.map(objective => {
                                        if (objective.description === "Harvest the mature potato") {
                                          return { ...objective, completed: true };
                                        }
                                        return objective;
                                      })
                                    };
                                  }
                                  return quest;
                                });
                              });
                            }
                          }}
                        />
                      );
                    }
                    return null;
                  })}                  {!isSleeping && (
                    <div
                      className="player"
                      style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                        backgroundImage: `url(${getSprite()})`,
                        imageRendering: 'pixelated',
                      }}
                    />
                  )}                  {/* Elder NPC Sprite */}
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
                  )}                  {/* Guard NPC Sprite */}
                  {!isLoading && !showCutscene && (
                    <img
                      src={guardStand}
                      alt="Guard"
                      className="absolute pixelated"
                      style={{
                        left: `${GUARD_POSITION_PIXEL.x}px`,
                        top: `${GUARD_POSITION_PIXEL.y}px`,
                        width: `${GUARD_SIZE}px`,
                        height: `${GUARD_SIZE}px`,
                        zIndex: 2, // Ensure guard is above background
                      }}
                    />
                  )}                  {/* Second Guard NPC Sprite */}
                  {!isLoading && !showCutscene && (
                    <img
                      src={guardStand}
                      alt="Guard 2"
                      className="absolute pixelated"
                      style={{
                        left: `${GUARD2_POSITION_PIXEL.x}px`,
                        top: `${GUARD2_POSITION_PIXEL.y}px`,
                        width: `${GUARD2_SIZE}px`,
                        height: `${GUARD2_SIZE}px`,
                        zIndex: 2, // Ensure guard is above background
                      }}
                    />
                  )}                  {/* Third Guard NPC Sprite */}
                  {!isLoading && !showCutscene && (
                    <img
                      src={guardStand}
                      alt="Guard 3"
                      className="absolute pixelated"
                      style={{
                        left: `${GUARD3_POSITION_PIXEL.x}px`,
                        top: `${GUARD3_POSITION_PIXEL.y}px`,
                        width: `${GUARD3_SIZE}px`,
                        height: `${GUARD3_SIZE}px`,
                        zIndex: 2, // Ensure guard is above background
                      }}
                    />
                  )}

                  {/* Fourth Guard NPC Sprite */}
                  {!isLoading && !showCutscene && (
                    <img
                      src={guardStand}
                      alt="Guard 4"
                      className="absolute pixelated"
                      style={{
                        left: `${GUARD4_POSITION_PIXEL.x}px`,
                        top: `${GUARD4_POSITION_PIXEL.y}px`,
                        width: `${GUARD4_SIZE}px`,
                        height: `${GUARD4_SIZE}px`,
                        zIndex: 2, // Ensure guard is above background
                      }}
                    />
                  )}
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
      )}      {/* Shop Confirmation Popup */}
      {showShopConfirm && !isPaused && !isDialogActive && !showShop && (() => {
        // Check if this is the first shop encounter with buy seeds objective
        const hasFirstHarvestQuest = quests.some(quest => quest.title === "The First Harvest");
        const hasBuySeedsObjective = quests.some(quest => 
          quest.title === "The First Harvest" && 
          quest.objectives.some(obj => obj.description === "Buy seeds from the shop" && !obj.completed)
        );
        const shouldShowMerchantDialogue = hasFirstHarvestQuest && hasBuySeedsObjective && !hasSeenFirstShopDialogue;

        if (shouldShowMerchantDialogue) {
          // Trigger merchant dialogue
          setTimeout(() => {
            setShowShopConfirm(false);
            startDialog({
              characterName: 'merchant',
              expression: 'neutral',
              dialogue: [
                "Ah… a new face, or rather, an old one returned. Haven't seen anyone from that cottage in years.",
                "So, what's it going to be? Looking for tools? A bite to eat? No, wait—must be seeds. Can't live off an empty field, eh?",
                "Wheat for steady trade, turnips for a quick harvest… or maybe something more refined? What'll it be?"
              ],
              onComplete: () => {
                setHasSeenFirstShopDialogue(true);
                setShopMode('buy');
                setShowShop(true);
              }
            });
          }, 100);
          return null; // Don't render the popup if we're showing dialogue
        }

        return true; // Render the popup normally
      })() && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
          <div className="bg-[#8B4513] p-8 rounded-lg max-w-md w-full mx-4 relative border-8 border-[#D2B48C] shadow-lg flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold text-center text-[#F5DEB3]">Shop</h2>
            <div className="flex flex-col gap-2">
              <button 
                className="bg-[#8B4513] text-[#F5DEB3] px-6 py-2 rounded border-4 border-[#D2B48C] hover:bg-[#A0522D] hover:border-[#F5DEB3] hover:scale-105 transition-all duration-200 w-32"
                onClick={() => {
                  playClick();
                  setShopMode('buy');
                  setShowShop(true);
                  setShowShopConfirm(false);
                }}
                onMouseEnter={playHover}
              >
                Buy
              </button>
              <button 
                className="bg-[#8B4513] text-[#F5DEB3] px-6 py-2 rounded border-4 border-[#D2B48C] hover:bg-[#A0522D] hover:border-[#F5DEB3] hover:scale-105 transition-all duration-200 w-32"
                onClick={() => {
                  playClick();
                  setShopMode('sell');
                  setShowShop(true);
                  setShowShopConfirm(false);
                }}
                onMouseEnter={playHover}
              >
                Sell
              </button>              <button 
                className="bg-[#8B4513] text-[#F5DEB3] px-6 py-2 rounded border-4 border-[#D2B48C] hover:bg-[#A0522D] hover:border-[#F5DEB3] hover:scale-105 transition-all duration-200 w-32"
                onClick={() => {
                  playClick();
                  setShowShopConfirm(false);
                  // Show merchant cancel dialogue
                  setTimeout(() => {
                    startDialog({
                      characterName: 'merchant',
                      expression: 'neutral',
                      dialogue: ["No need to rush—just remember, a farm doesn't grow itself."]
                    });
                  }, 100);
                }}
                onMouseEnter={playHover}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Skip Popup */}
      {showTimeSkipPopup && !isDialogActive && !isPaused && !showShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
          <div className="bg-[#8B4513] p-8 rounded-lg max-w-md w-full mx-4 relative border-8 border-[#D2B48C] shadow-lg flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold text-center text-[#F5DEB3]">Skip Time</h2>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                  <button 
                    className="bg-[#8B4513] text-[#F5DEB3] w-12 h-12 rounded-full border-4 border-[#D2B48C] hover:bg-[#A0522D] hover:border-[#F5DEB3] hover:scale-105 transition-all duration-200 flex items-center justify-center text-2xl"
                    onClick={() => {
                      playClick();
                      setTimeSkipHours(prev => Math.max(0, (parseInt(prev) || 0) - 1).toString());
                    }}
                    onMouseEnter={playHover}
                  >
                    -
                  </button>
                  <div className="bg-[#A0522D] p-4 rounded-lg border-4 border-[#D2B48C]">
                    <Counter
                      value={parseInt(timeSkipHours) || 0}
                      fontSize={48}
                      textColor="#F5DEB3"
                      places={[100, 10, 1]}
                      containerStyle={{ width: '100%' }}
                      counterStyle={{ justifyContent: 'center' }}
                      gradientFrom="#A0522D"
                      gradientTo="transparent"
                    />
                  </div>
                  <button 
                    className="bg-[#8B4513] text-[#F5DEB3] w-12 h-12 rounded-full border-4 border-[#D2B48C] hover:bg-[#A0522D] hover:border-[#F5DEB3] hover:scale-105 transition-all duration-200 flex items-center justify-center text-2xl"
                    onClick={() => {
                      playClick();
                      setTimeSkipHours(prev => ((parseInt(prev) || 0) + 1).toString());
                    }}
                    onMouseEnter={playHover}
                  >
                    +
                  </button>
                </div>
                <div className="text-[#F5DEB3] text-lg">Hours</div>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <button 
                  className="bg-[#8B4513] text-[#F5DEB3] px-6 py-2 rounded border-4 border-[#D2B48C] hover:bg-[#A0522D] hover:border-[#F5DEB3] hover:scale-105 transition-all duration-200 w-full"
                  onClick={() => {
                    playClick();
                    handleTimeSkip(timeSkipHours);
                  }}
                  onMouseEnter={playHover}
                >
                  Skip Time
                </button>
                <button 
                  className="bg-[#8B4513] text-[#F5DEB3] px-6 py-2 rounded border-4 border-[#D2B48C] hover:bg-[#A0522D] hover:border-[#F5DEB3] hover:scale-105 transition-all duration-200 w-full"
                  onClick={() => {
                    playClick();
                    setShowTimeSkipPopup(false);
                    setTimeSkipHours('');
                  }}
                  onMouseEnter={playHover}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;