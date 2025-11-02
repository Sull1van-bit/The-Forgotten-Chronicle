import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  addCrop,
  removeCropAtPosition,
  getCropAtPosition,
  waterCrop,
  updateAllCropsForNewDay,
  getCropsNeedingWater,
  getCropsReadyToHarvest,
  isReadyToHarvest,
  needsWatering,
  countCropsByStage
} from '../utils/cropUtils';

const FarmingContext = createContext();

export const useFarming = () => {
  const context = useContext(FarmingContext);
  if (!context) {
    throw new Error('useFarming must be used within a FarmingProvider');
  }
  return context;
};

export const FarmingProvider = ({ children }) => {
  const [plantedCrops, setPlantedCrops] = useState([]);
  const [hasHarvestedFirstCrop, setHasHarvestedFirstCrop] = useState(false);

  /**
   * Plant a crop at position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} True if successful
   */
  const plantCrop = useCallback((x, y) => {
    const existing = getCropAtPosition(plantedCrops, x, y);
    if (existing) {
      return false;
    }

    setPlantedCrops(prev => addCrop(prev, x, y));
    return true;
  }, [plantedCrops]);

  /**
   * Harvest crop at position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Object|null} Harvested crop or null
   */
  const harvestCrop = useCallback((x, y) => {
    const crop = getCropAtPosition(plantedCrops, x, y);

    if (!crop || !isReadyToHarvest(crop)) {
      return null;
    }

    setPlantedCrops(prev => removeCropAtPosition(prev, x, y));

    if (!hasHarvestedFirstCrop) {
      setHasHarvestedFirstCrop(true);
    }

    return crop;
  }, [plantedCrops, hasHarvestedFirstCrop]);

  /**
   * Water crop at position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} True if successful
   */
  const waterCropAt = useCallback((x, y) => {
    const crop = getCropAtPosition(plantedCrops, x, y);

    if (!crop || !needsWatering(crop)) {
      return false;
    }

    setPlantedCrops(prev =>
      prev.map(c =>
        c.x === x && c.y === y ? waterCrop(c) : c
      )
    );

    return true;
  }, [plantedCrops]);

  /**
   * Get crop at position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Object|null} Crop or null
   */
  const getCrop = useCallback((x, y) => {
    return getCropAtPosition(plantedCrops, x, y);
  }, [plantedCrops]);

  /**
   * Check if position has a crop
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} True if position has a crop
   */
  const hasCrop = useCallback((x, y) => {
    return getCropAtPosition(plantedCrops, x, y) !== null;
  }, [plantedCrops]);

  /**
   * Update all crops for a new day
   */
  const updateCropsForNewDay = useCallback(() => {
    setPlantedCrops(prev => updateAllCropsForNewDay(prev));
  }, []);

  /**
   * Get crops that need watering
   * @returns {Array} Array of crops needing water
   */
  const getCropsNeedingWatering = useCallback(() => {
    return getCropsNeedingWater(plantedCrops);
  }, [plantedCrops]);

  /**
   * Get crops ready to harvest
   * @returns {Array} Array of crops ready to harvest
   */
  const getReadyCrops = useCallback(() => {
    return getCropsReadyToHarvest(plantedCrops);
  }, [plantedCrops]);

  /**
   * Count crops by stage
   * @param {number} stage - Crop stage (0-3)
   * @returns {number} Number of crops at that stage
   */
  const countCrops = useCallback((stage) => {
    return countCropsByStage(plantedCrops, stage);
  }, [plantedCrops]);

  /**
   * Get total crop count
   * @returns {number} Total number of crops
   */
  const getTotalCropCount = useCallback(() => {
    return plantedCrops.length;
  }, [plantedCrops]);

  /**
   * Clear all crops
   */
  const clearAllCrops = useCallback(() => {
    setPlantedCrops([]);
  }, []);

  /**
   * Load crops from save data
   * @param {Object} saveData - Save data object
   */
  const loadCrops = useCallback((saveData) => {
    if (saveData.plantedCrops) {
      setPlantedCrops(saveData.plantedCrops);
    }
    if (saveData.hasHarvestedFirstCrop !== undefined) {
      setHasHarvestedFirstCrop(saveData.hasHarvestedFirstCrop);
    }
  }, []);

  /**
   * Get save data for crops
   * @returns {Object} Crop save data
   */
  const getSaveData = useCallback(() => {
    return {
      plantedCrops,
      hasHarvestedFirstCrop
    };
  }, [plantedCrops, hasHarvestedFirstCrop]);

  const value = {
    plantedCrops,
    hasHarvestedFirstCrop,
    plantCrop,
    harvestCrop,
    waterCropAt,
    getCrop,
    hasCrop,
    updateCropsForNewDay,
    getCropsNeedingWatering,
    getReadyCrops,
    countCrops,
    getTotalCropCount,
    clearAllCrops,
    loadCrops,
    getSaveData,
    setHasHarvestedFirstCrop
  };

  return (
    <FarmingContext.Provider value={value}>
      {children}
    </FarmingContext.Provider>
  );
};

