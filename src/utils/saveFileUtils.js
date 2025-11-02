import { saveFileService } from '../services/saveFileService';

export const formatSaveFileDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

export const createSaveFileData = (gameState) => {
  return {
    character: gameState.character,
    position: gameState.position,
    facing: gameState.facing,
    timestamp: new Date().toISOString(),
    // Add any other game state you want to save
    inventory: gameState.inventory || [],
    quests: gameState.quests || [],
    wateringProgress: gameState.wateringProgress || 0,
    wateringDaysCompleted: gameState.wateringDaysCompleted || [],
    currentDay: gameState.currentDay || 1,
    plantedCrops: gameState.plantedCrops || [],    gameTime: gameState.gameTime || { hours: 6, minutes: 0 },
    stats: gameState.stats || {},    settings: gameState.settings || {},
    hasSeenHouseDialog: gameState.hasSeenHouseDialog ?? false,    hasSeenFirstShopDialogue: gameState.hasSeenFirstShopDialogue ?? false,
    hasSeenPostHarvestDialog: gameState.hasSeenPostHarvestDialog ?? false,
    hasHarvestedFirstCrop: gameState.hasHarvestedFirstCrop ?? false,
    specialOreCollected: gameState.specialOreCollected ?? false,
  };
};

export const loadSaveFileData = async (saveId) => {
  try {
    const saveData = await saveFileService.loadSaveFile(saveId);
    if (!saveData) return null;    return {
      character: saveData.character,
      position: saveData.position,
      facing: saveData.facing,
      // Restore any other game state
      inventory: saveData.inventory || [],
      quests: saveData.quests || [],
      wateringProgress: saveData.wateringProgress || 0,
      wateringDaysCompleted: saveData.wateringDaysCompleted || [],      currentDay: saveData.currentDay || 1,
      plantedCrops: saveData.plantedCrops || [],
      gameTime: saveData.gameTime || { hours: 6, minutes: 0 },      stats: saveData.stats || {},
      settings: saveData.settings || {},
      hasSeenHouseDialog: saveData.hasSeenHouseDialog ?? false,      hasSeenFirstShopDialogue: saveData.hasSeenFirstShopDialogue ?? false,
      hasSeenPostHarvestDialog: saveData.hasSeenPostHarvestDialog ?? false,
      hasHarvestedFirstCrop: saveData.hasHarvestedFirstCrop ?? false,
      specialOreCollected: saveData.specialOreCollected ?? false,
    };
  } catch (error) {
    console.error('Error loading save file:', error);
    return null;
  }
};

export const getSaveFileDisplayInfo = (saveFile) => {
  return {
    id: saveFile.id,
    character: saveFile.character?.name || 'Unknown',
    timestamp: formatSaveFileDate(saveFile.timestamp),
    // Add any other display information you want
    level: saveFile.stats?.level || 1,
    playTime: saveFile.stats?.playTime || '0:00'
  };
}; 