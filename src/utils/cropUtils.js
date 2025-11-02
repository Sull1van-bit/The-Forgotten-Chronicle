/**
 * Crop management utilities
 */

/**
 * Update crop for a new day
 * @param {Object} crop - Crop object
 * @returns {Object} Updated crop object
 */
export const updateCropForNewDay = (crop) => {
  if (crop.stage >= 3) return crop; // Already mature

  const shouldGrow = !crop.needsWatering; // Was watered yesterday
  const newStage = shouldGrow ? crop.stage + 1 : crop.stage;

  return {
    ...crop,
    stage: newStage,
    needsWatering: newStage < 3, // Only need watering if not mature
    lastWatered: shouldGrow ? Date.now() : crop.lastWatered
  };
};

/**
 * Water a crop
 * @param {Object} crop - Crop object
 * @returns {Object} Updated crop object
 */
export const waterCrop = (crop) => {
  return {
    ...crop,
    needsWatering: false,
    lastWatered: Date.now()
  };
};

/**
 * Check if a crop needs watering
 * @param {Object} crop - Crop object
 * @returns {boolean} True if crop needs watering
 */
export const needsWatering = (crop) => {
  return crop.needsWatering && crop.stage < 3;
};

/**
 * Check if a crop is ready to harvest
 * @param {Object} crop - Crop object
 * @returns {boolean} True if crop is ready to harvest
 */
export const isReadyToHarvest = (crop) => {
  return crop.stage >= 3;
};

/**
 * Get crop at position
 * @param {Array} crops - Array of crop objects
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Object|null} Crop object or null
 */
export const getCropAtPosition = (crops, x, y) => {
  return crops.find(crop => crop.x === x && crop.y === y) || null;
};

/**
 * Remove crop at position
 * @param {Array} crops - Array of crop objects
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Array} Updated crops array
 */
export const removeCropAtPosition = (crops, x, y) => {
  return crops.filter(crop => !(crop.x === x && crop.y === y));
};

/**
 * Add crop
 * @param {Array} crops - Array of crop objects
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Array} Updated crops array
 */
export const addCrop = (crops, x, y) => {
  // Check if crop already exists at position
  if (getCropAtPosition(crops, x, y)) {
    return crops;
  }

  return [
    ...crops,
    {
      x,
      y,
      stage: 0,
      needsWatering: true,
      plantedDay: Date.now(),
      lastWatered: null
    }
  ];
};

/**
 * Update all crops for a new day
 * @param {Array} crops - Array of crop objects
 * @returns {Array} Updated crops array
 */
export const updateAllCropsForNewDay = (crops) => {
  return crops.map(updateCropForNewDay);
};

/**
 * Get crops that need watering
 * @param {Array} crops - Array of crop objects
 * @returns {Array} Array of crops that need watering
 */
export const getCropsNeedingWater = (crops) => {
  return crops.filter(needsWatering);
};

/**
 * Get crops ready to harvest
 * @param {Array} crops - Array of crop objects
 * @returns {Array} Array of crops ready to harvest
 */
export const getCropsReadyToHarvest = (crops) => {
  return crops.filter(isReadyToHarvest);
};

/**
 * Count crops by stage
 * @param {Array} crops - Array of crop objects
 * @param {number} stage - Crop stage (0-3)
 * @returns {number} Number of crops at that stage
 */
export const countCropsByStage = (crops, stage) => {
  return crops.filter(crop => crop.stage === stage).length;
};

