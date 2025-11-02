import React, { createContext, useContext, useState, useCallback } from 'react';

// Import item images
import breadIcon from '../assets/items/bread.png';
import seedsIcon from '../assets/items/seeds.png';
import potatoIcon from '../assets/items/potato.png';
import stewIcon from '../assets/items/stew.png';
import ledgerIcon from '../assets/items/ledger.png';
import royalDocumentIcon from '../assets/items/royal-document.png';
import meatIcon from '../assets/items/meat.png';
import mushroomIcon from '../assets/items/mushroom.png';
import specialOreIcon from '../assets/items/specialOre.gif';

// Complete ITEMS object
export const ITEMS = {
  seeds: {
    id: 1,
    name: 'Seeds',
    icon: seedsIcon,
    type: 'material',
    description: 'Plant these to grow crops',
    price: 10,
    sellPrice: 5
  },
  potato: {
    id: 2,
    name: 'Potato',
    icon: potatoIcon,
    type: 'material',
    description: 'Raw potato, can be eaten or sell it to get money',
    price: 1,
    sellPrice: 13
  },
  bread: {
    id: 3,
    name: 'Bread',
    icon: breadIcon,
    type: 'consumable',
    description: 'Freshly baked bread',
    effect: { hunger: 30, energy: 10 },
    price: 15,
    sellPrice: 7
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
    price: 20,
    sellPrice: 10
  },
  mushroom: {
    id: 8,
    name: 'Mushroom',
    icon: mushroomIcon,
    type: 'material',
    description: 'A wild mushroom, can be used in cooking',
    price: 12,
    sellPrice: 6
  },
  specialOre: {
    id: 9,
    name: 'Special Ore',
    icon: specialOreIcon,
    type: 'quest',
    description: 'A rare and valuable ore needed by the blacksmith',
    sellPrice: 50
  }
};

const InventoryContext = createContext();

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);

  /**
   * Add item to inventory
   * @param {string} itemKey - Key of the item in ITEMS object
   * @param {number} quantity - Quantity to add (default: 1)
   */
  const addItem = useCallback((itemKey, quantity = 1) => {
    const item = ITEMS[itemKey];
    if (!item) {
      console.warn(`Item ${itemKey} not found in ITEMS`);
      return;
    }

    setInventory(prev => {
      const existingItem = prev.find(i => i.item === itemKey);

      if (existingItem) {
        return prev.map(i =>
          i.item === itemKey
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        return [...prev, { item: itemKey, quantity }];
      }
    });
  }, []);

  /**
   * Remove item from inventory
   * @param {string} itemKey - Key of the item in ITEMS object
   * @param {number} quantity - Quantity to remove (default: 1)
   * @returns {boolean} True if successful, false if insufficient quantity
   */
  const removeItem = useCallback((itemKey, quantity = 1) => {
    const existingItem = inventory.find(i => i.item === itemKey);

    if (!existingItem || existingItem.quantity < quantity) {
      return false;
    }

    setInventory(prev => {
      return prev.map(i => {
        if (i.item === itemKey) {
          const newQuantity = i.quantity - quantity;
          return newQuantity > 0 ? { ...i, quantity: newQuantity } : null;
        }
        return i;
      }).filter(Boolean);
    });

    return true;
  }, [inventory]);

  /**
   * Check if inventory has item
   * @param {string} itemKey - Key of the item in ITEMS object
   * @param {number} quantity - Minimum quantity required (default: 1)
   * @returns {boolean} True if inventory has enough of the item
   */
  const hasItem = useCallback((itemKey, quantity = 1) => {
    const existingItem = inventory.find(i => i.item === itemKey);
    return existingItem && existingItem.quantity >= quantity;
  }, [inventory]);

  /**
   * Get item quantity
   * @param {string} itemKey - Key of the item in ITEMS object
   * @returns {number} Quantity of the item in inventory
   */
  const getItemQuantity = useCallback((itemKey) => {
    const existingItem = inventory.find(i => i.item === itemKey);
    return existingItem ? existingItem.quantity : 0;
  }, [inventory]);

  /**
   * Set item quantity
   * @param {string} itemKey - Key of the item in ITEMS object
   * @param {number} quantity - New quantity
   */
  const setItemQuantity = useCallback((itemKey, quantity) => {
    const item = ITEMS[itemKey];
    if (!item) {
      console.warn(`Item ${itemKey} not found in ITEMS`);
      return;
    }

    if (quantity <= 0) {
      setInventory(prev => prev.filter(i => i.item !== itemKey));
      return;
    }

    setInventory(prev => {
      const existingItem = prev.find(i => i.item === itemKey);

      if (existingItem) {
        return prev.map(i =>
          i.item === itemKey ? { ...i, quantity } : i
        );
      } else {
        return [...prev, { item: itemKey, quantity }];
      }
    });
  }, []);

  /**
   * Clear all items from inventory
   */
  const clearInventory = useCallback(() => {
    setInventory([]);
  }, []);

  /**
   * Load inventory from save data
   * @param {Array} saveData - Inventory save data
   */
  const loadInventory = useCallback((saveData) => {
    if (Array.isArray(saveData)) {
      setInventory(saveData);
    }
  }, []);

  /**
   * Get save data for inventory
   * @returns {Array} Inventory save data
   */
  const getSaveData = useCallback(() => {
    return inventory;
  }, [inventory]);

  /**
   * Get all items with details
   * @returns {Array} Array of items with full details
   */
  const getInventoryWithDetails = useCallback(() => {
    return inventory.map(invItem => ({
      ...invItem,
      details: ITEMS[invItem.item]
    }));
  }, [inventory]);

  const value = {
    inventory,
    ITEMS,
    addItem,
    removeItem,
    hasItem,
    getItemQuantity,
    setItemQuantity,
    clearInventory,
    loadInventory,
    getSaveData,
    getInventoryWithDetails
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

