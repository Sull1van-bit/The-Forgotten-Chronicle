/**
 * Migration Helper - Bridges old GameContext with new split contexts
 *
 * This allows gradual migration by providing backward compatibility
 * while using the new context structure under the hood.
 */

import { usePlayerStats } from './PlayerStatsContext';
import { useInventory } from './InventoryContext';
import { useQuests } from './QuestContext';
import { useFarming } from './FarmingContext';
import { useCallback } from 'react';

/**
 * Hook that provides the old GameContext API using new contexts
 * Use this to gradually migrate components
 */
export const useGameLegacy = () => {
  const playerStats = usePlayerStats();
  const inventory = useInventory();
  const quests = useQuests();
  const farming = useFarming();

  // Map old API to new API
  const legacyAPI = {
    // Player Stats (old API)
    health: playerStats.health,
    setHealth: (value) => playerStats.updateStat('health', value),
    energy: playerStats.energy,
    setEnergy: (value) => playerStats.updateStat('energy', value),
    hunger: playerStats.hunger,
    setHunger: (value) => playerStats.updateStat('hunger', value),
    happiness: playerStats.happiness,
    setHappiness: (value) => playerStats.updateStat('happiness', value),
    cleanliness: playerStats.cleanliness,
    setCleanliness: (value) => playerStats.updateStat('cleanliness', value),
    money: playerStats.money,
    setMoney: playerStats.setMoney,

    // Inventory (old API)
    inventory: inventory.inventory,
    setInventory: useCallback((updater) => {
      if (typeof updater === 'function') {
        const newInventory = updater(inventory.inventory);
        // Note: This is a simplified version, may need adjustment
        console.warn('setInventory with function not fully supported in migration mode');
      }
    }, [inventory.inventory]),
    addItemToInventory: useCallback((itemId, quantity = 1) => {
      // Convert item ID to item key
      const itemKey = Object.keys(inventory.ITEMS).find(
        key => inventory.ITEMS[key].id === itemId
      );
      if (itemKey) {
        inventory.addItem(itemKey, quantity);
      }
    }, [inventory]),
    removeItemFromInventory: useCallback((itemId, quantity = 1) => {
      const itemKey = Object.keys(inventory.ITEMS).find(
        key => inventory.ITEMS[key].id === itemId
      );
      if (itemKey) {
        inventory.removeItem(itemKey, quantity);
      }
    }, [inventory]),

    // Quests (old API)
    quests: quests.quests,
    setQuests: useCallback((updater) => {
      if (typeof updater === 'function') {
        console.warn('setQuests with function not fully supported in migration mode');
      }
    }, []),
    wateringProgress: quests.wateringProgress,
    setWateringProgress: quests.updateWateringProgress,
    wateringDaysCompleted: quests.wateringDaysCompleted,
    setWateringDaysCompleted: useCallback((updater) => {
      console.warn('setWateringDaysCompleted should use quest context methods');
    }, []),

    // Farming (old API)
    plantedCrops: farming.plantedCrops,
    setPlantedCrops: useCallback((updater) => {
      if (typeof updater === 'function') {
        console.warn('setPlantedCrops with function not fully supported in migration mode');
      }
    }, []),
    hasHarvestedFirstCrop: farming.hasHarvestedFirstCrop,
    setHarvestedFirstCrop: farming.setHasHarvestedFirstCrop,

    // New API (recommended)
    playerStats,
    inventory: inventory,
    quests: quests,
    farming: farming
  };

  return legacyAPI;
};

/**
 * Migration checklist for components
 */
export const MIGRATION_CHECKLIST = {
  'PlayerStats': {
    oldPattern: 'const { health, setHealth, energy, setEnergy } = useGame();',
    newPattern: 'const { stats, modifyStat } = usePlayerStats();',
    status: '✓ New context available'
  },
  'Inventory': {
    oldPattern: 'const { inventory, setInventory, addItemToInventory } = useGame();',
    newPattern: 'const { inventory, addItem, removeItem } = useInventory();',
    status: '✓ New context available'
  },
  'Quests': {
    oldPattern: 'const { quests, setQuests } = useGame();',
    newPattern: 'const { quests, updateObjective, completeObjective } = useQuests();',
    status: '✓ New context available'
  },
  'Farming': {
    oldPattern: 'const { plantedCrops, setPlantedCrops } = useGame();',
    newPattern: 'const { plantedCrops, plantCrop, harvestCrop } = useFarming();',
    status: '✓ New context available'
  }
};

/**
 * Helper function to identify which components need migration
 */
export const identifyMigrationNeeds = (componentCode) => {
  const needs = [];

  if (componentCode.includes('setHealth') || componentCode.includes('setEnergy')) {
    needs.push('PlayerStats');
  }
  if (componentCode.includes('setInventory') || componentCode.includes('addItemToInventory')) {
    needs.push('Inventory');
  }
  if (componentCode.includes('setQuests')) {
    needs.push('Quests');
  }
  if (componentCode.includes('setPlantedCrops')) {
    needs.push('Farming');
  }

  return needs;
};

