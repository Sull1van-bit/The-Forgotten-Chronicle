import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Import item images
import breadIcon from '../assets/items/bread.png';
import seedsIcon from '../assets/items/seeds.png';
import potatoIcon from '../assets/items/potato.png';
import stewIcon from '../assets/items/stew.png';
import ledgerIcon from '../assets/items/royal-document.png';
import royalDocumentIcon from '../assets/items/royal-document.png';
import meatIcon from '../assets/items/meat.png';
import mushroomIcon from '../assets/items/mushroom.png';

// Import item data - complete ITEMS object
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
  },
  ledger: {
    id: 5,
    name: 'Ledger',
    icon: ledgerIcon,
    type: 'quest',
    description: 'An old ledger containing important information',
  },
  royalDocument: {
    id: 6,
    name: 'Royal Document',
    icon: royalDocumentIcon,
    type: 'quest',
    description: 'An official document from the royal family',
  },
  meat: {
    id: 7,
    name: 'Meat',
    icon: meatIcon,
    type: 'material',
    description: 'Raw meat, can be cooked',
    sellPrice: 10 // Placeholder sell price
  },
  mushroom: {
    id: 8,
    name: 'Mushroom',
    icon: mushroomIcon,
    type: 'material',
    description: 'A wild mushroom, can be used in cooking',
    sellPrice: 6 // Placeholder sell price
  }
};

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  // Player stats
  const [health, setHealth] = useState(100);
  const [energy, setEnergy] = useState(100);
  const [hunger, setHunger] = useState(100);
  const [happiness, setHappiness] = useState(100);
  const [cleanliness, setCleanliness] = useState(100);
  const [money, setMoney] = useState(0);

  // Game time and day
  const [gameTime, setGameTime] = useState({ hours: 6, minutes: 0 });
  const [currentDay, setCurrentDay] = useState(1);
  // Inventory and items
  const [inventory, setInventory] = useState([
    { ...ITEMS.bread, quantity: 2 } // Initialize with 2 bread like in original
  ]);
  const [plantedCrops, setPlantedCrops] = useState([]);

  // Quests and progress
  const [quests, setQuests] = useState([]);
  const [wateringProgress, setWateringProgress] = useState(0);
  const [wateringDaysCompleted, setWateringDaysCompleted] = useState(new Set());

  // Game flags and states
  const [hasSeenHouseDialog, setHasSeenHouseDialog] = useState(false);
  const [hasSeenFirstShopDialogue, setHasSeenFirstShopDialogue] = useState(false);
  const [hasHarvestedFirstCrop, setHarvestedFirstCrop] = useState(false);

  // Animations and UI states
  const [showEatAnimation, setShowEatAnimation] = useState(false);

  // Utility function to get item by ID
  const getItemById = useCallback((itemId) => {
    return Object.values(ITEMS).find(item => item.id === itemId);
  }, []);

  // Add item to inventory
  const addItemToInventory = useCallback((itemId, quantity = 1) => {
    setInventory(prev => {
      const existingItemIndex = prev.findIndex(item => item.id === itemId);
      
      if (existingItemIndex > -1) {
        const newInventory = [...prev];
        newInventory[existingItemIndex] = {
          ...newInventory[existingItemIndex],
          quantity: newInventory[existingItemIndex].quantity + quantity
        };
        return newInventory;
      } else {
        const itemDetails = getItemById(itemId);
        if (itemDetails) {
          return [...prev, { 
            ...itemDetails,
            quantity: quantity
          }];
        }
        return prev;
      }
    });
  }, [getItemById]);

  // Use/consume item
  const handleUseItem = useCallback((item) => {
    if (item.type === 'consumable') {
      // Show eating animation
      setShowEatAnimation(true);
      setTimeout(() => setShowEatAnimation(false), 1000);

      // Apply item effects
      if (item.effect?.health) {
        setHealth(prev => Math.min(100, prev + item.effect.health));
      }
      if (item.effect?.energy) {
        setEnergy(prev => Math.min(100, prev + item.effect.energy));
      }
      if (item.effect?.hunger) {
        setHunger(prev => Math.min(100, prev + item.effect.hunger));
      }
      
      // Remove item from inventory
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
        
        return newInventory.filter(invItem => invItem.quantity > 0);
      });
    }
  }, []);

  // Format time for display
  const formatTime = useCallback((time) => {
    let hours = time.hours;
    const minutes = time.minutes.toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12;    
    return `Day ${currentDay} - ${hours}:${minutes} ${ampm}`;
  }, [currentDay]);

  // Calculate darkness level based on time
  const getDarknessLevel = useCallback((time) => {
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
  }, []);

  // Handle time skip
  const handleTimeSkip = useCallback((hours) => {
    const hoursToSkip = parseInt(hours);
    if (isNaN(hoursToSkip) || hoursToSkip <= 0) return;
    
    const totalMinutesToSkip = hoursToSkip * 60;
    
    setGameTime(prevTime => {
      let newMinutes = prevTime.minutes + totalMinutesToSkip;
      let newHours = prevTime.hours;
      let daysToAdd = 0;

      // Handle overflow
      while (newMinutes >= 60) {
        newMinutes -= 60;
        newHours++;
      }
      
      while (newHours >= 24) {
        newHours -= 24;
        daysToAdd++;
      }
      
      if (daysToAdd > 0) {
        setCurrentDay(prev => prev + daysToAdd);
      }

      return { hours: newHours, minutes: newMinutes };
    });
  }, []);

  // Load game state from save data
  const loadGameState = useCallback((saveData) => {
    if (saveData.stats) {
      setHealth(saveData.stats.health || 100);
      setEnergy(saveData.stats.energy || 100);
      setHunger(saveData.stats.hunger || 100);
      setHappiness(saveData.stats.happiness || 100);
      setCleanliness(saveData.stats.cleanliness || 100);
      setMoney(saveData.stats.money || 0);
    }
    
    setGameTime(saveData.gameTime || { hours: 6, minutes: 0 });
    setCurrentDay(saveData.currentDay || 1);
    setInventory(saveData.inventory || [{ ...ITEMS.bread, quantity: 2 }]);
    setPlantedCrops(saveData.plantedCrops || []);
    setQuests(saveData.quests || []);
    setWateringProgress(saveData.wateringProgress || 0);
    setWateringDaysCompleted(new Set(saveData.wateringDaysCompleted || []));
    setHasSeenHouseDialog(saveData.hasSeenHouseDialog || false);
    setHasSeenFirstShopDialogue(saveData.hasSeenFirstShopDialogue || false);
    setHarvestedFirstCrop(saveData.hasHarvestedFirstCrop || false);
  }, []);

  // Create save data object
  const createSaveData = useCallback(() => {
    return {
      stats: {
        health,
        energy,
        hunger,
        happiness,
        cleanliness,
        money
      },
      gameTime,
      currentDay,
      inventory,
      plantedCrops,
      quests,
      wateringProgress,
      wateringDaysCompleted: Array.from(wateringDaysCompleted),
      hasSeenHouseDialog,
      hasSeenFirstShopDialogue,
      hasHarvestedFirstCrop
    };
  }, [
    health, energy, hunger, happiness, cleanliness, money,
    gameTime, currentDay, inventory, plantedCrops, quests,
    wateringProgress, wateringDaysCompleted, hasSeenHouseDialog,
    hasSeenFirstShopDialogue, hasHarvestedFirstCrop
  ]);

  const value = {
    // Stats
    health, setHealth,
    energy, setEnergy,
    hunger, setHunger,
    happiness, setHappiness,
    cleanliness, setCleanliness,
    money, setMoney,
    
    // Time and day
    gameTime, setGameTime,
    currentDay, setCurrentDay,
    
    // Inventory and items
    inventory, setInventory,
    plantedCrops, setPlantedCrops,
    
    // Quests
    quests, setQuests,
    wateringProgress, setWateringProgress,
    wateringDaysCompleted, setWateringDaysCompleted,
    
    // Flags
    hasSeenHouseDialog, setHasSeenHouseDialog,
    hasSeenFirstShopDialogue, setHasSeenFirstShopDialogue,
    hasHarvestedFirstCrop, setHarvestedFirstCrop,
    
    // UI States
    showEatAnimation, setShowEatAnimation,
    
    // Utility functions
    addItemToInventory,
    handleUseItem,
    loadGameState,
    createSaveData,
    formatTime,
    getDarknessLevel,
    handleTimeSkip,
    getItemById
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};