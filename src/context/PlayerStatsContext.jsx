import React, { createContext, useContext, useState, useCallback } from 'react';

const PlayerStatsContext = createContext();

export const usePlayerStats = () => {
  const context = useContext(PlayerStatsContext);
  if (!context) {
    throw new Error('usePlayerStats must be used within a PlayerStatsProvider');
  }
  return context;
};

export const PlayerStatsProvider = ({ children }) => {
  // Player stats state
  const [stats, setStats] = useState({
    health: 100,
    energy: 100,
    hunger: 100,
    happiness: 100,
    cleanliness: 100
  });

  const [money, setMoney] = useState(0);

  /**
   * Update a single stat with bounds checking (0-100)
   * @param {string} statName - Name of the stat to update
   * @param {number} value - New value for the stat
   */
  const updateStat = useCallback((statName, value) => {
    setStats(prev => ({
      ...prev,
      [statName]: Math.max(0, Math.min(100, value))
    }));
  }, []);

  /**
   * Modify a stat by a delta amount
   * @param {string} statName - Name of the stat to modify
   * @param {number} delta - Amount to add/subtract
   */
  const modifyStat = useCallback((statName, delta) => {
    setStats(prev => ({
      ...prev,
      [statName]: Math.max(0, Math.min(100, prev[statName] + delta))
    }));
  }, []);

  /**
   * Update multiple stats at once
   * @param {Object} updates - Object with stat names as keys and values to set
   */
  const updateStats = useCallback((updates) => {
    setStats(prev => {
      const newStats = { ...prev };
      Object.keys(updates).forEach(key => {
        if (key in newStats) {
          newStats[key] = Math.max(0, Math.min(100, updates[key]));
        }
      });
      return newStats;
    });
  }, []);

  /**
   * Modify multiple stats at once
   * @param {Object} deltas - Object with stat names as keys and delta values
   */
  const modifyStats = useCallback((deltas) => {
    setStats(prev => {
      const newStats = { ...prev };
      Object.keys(deltas).forEach(key => {
        if (key in newStats) {
          newStats[key] = Math.max(0, Math.min(100, newStats[key] + deltas[key]));
        }
      });
      return newStats;
    });
  }, []);

  /**
   * Reset all stats to initial values
   */
  const resetStats = useCallback(() => {
    setStats({
      health: 100,
      energy: 100,
      hunger: 100,
      happiness: 100,
      cleanliness: 100
    });
  }, []);

  /**
   * Add money
   * @param {number} amount - Amount to add
   */
  const addMoney = useCallback((amount) => {
    setMoney(prev => Math.max(0, prev + amount));
  }, []);

  /**
   * Subtract money
   * @param {number} amount - Amount to subtract
   * @returns {boolean} True if successful, false if insufficient funds
   */
  const subtractMoney = useCallback((amount) => {
    if (money >= amount) {
      setMoney(prev => prev - amount);
      return true;
    }
    return false;
  }, [money]);

  /**
   * Set money to a specific amount
   * @param {number} amount - New money amount
   */
  const setMoneyAmount = useCallback((amount) => {
    setMoney(Math.max(0, amount));
  }, []);

  /**
   * Check if player has enough money
   * @param {number} amount - Amount to check
   * @returns {boolean} True if player has enough money
   */
  const hasEnoughMoney = useCallback((amount) => {
    return money >= amount;
  }, [money]);

  /**
   * Load stats from save data
   * @param {Object} saveData - Save data object
   */
  const loadStats = useCallback((saveData) => {
    if (saveData.stats) {
      setStats(saveData.stats);
    }
    if (saveData.money !== undefined) {
      setMoney(saveData.money);
    }
  }, []);

  /**
   * Get save data for stats
   * @returns {Object} Stats save data
   */
  const getSaveData = useCallback(() => {
    return {
      stats,
      money
    };
  }, [stats, money]);

  /**
   * Check if player is in critical condition
   * @returns {boolean} True if any stat is critically low
   */
  const isCritical = useCallback(() => {
    return stats.health <= 20 || stats.energy <= 20 || stats.hunger <= 20;
  }, [stats]);

  const value = {
    // Stats
    stats,
    health: stats.health,
    energy: stats.energy,
    hunger: stats.hunger,
    happiness: stats.happiness,
    cleanliness: stats.cleanliness,
    money,

    // Update methods
    updateStat,
    modifyStat,
    updateStats,
    modifyStats,
    resetStats,

    // Money methods
    addMoney,
    subtractMoney,
    setMoney: setMoneyAmount,
    hasEnoughMoney,

    // Utility methods
    loadStats,
    getSaveData,
    isCritical
  };

  return (
    <PlayerStatsContext.Provider value={value}>
      {children}
    </PlayerStatsContext.Provider>
  );
};

