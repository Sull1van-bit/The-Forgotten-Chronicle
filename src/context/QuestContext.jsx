import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  updateQuestObjective,
  completeQuestObjective,
  updateQuestProgress,
  addQuest as addQuestUtil,
  activateQuest as activateQuestUtil,
  completeQuest as completeQuestUtil,
  isQuestCompleted,
  getActiveQuest,
  getIncompleteQuests,
  getCompletedQuests
} from '../utils/questUtils';

const QuestContext = createContext();

export const useQuests = () => {
  const context = useContext(QuestContext);
  if (!context) {
    throw new Error('useQuests must be used within a QuestProvider');
  }
  return context;
};

export const QuestProvider = ({ children }) => {
  const [quests, setQuests] = useState([]);
  const [wateringProgress, setWateringProgress] = useState(0);
  const [wateringDaysCompleted, setWateringDaysCompleted] = useState(new Set());

  /**
   * Add a new quest
   * @param {Object} quest - Quest object
   */
  const addQuest = useCallback((quest) => {
    setQuests(prev => addQuestUtil(prev, quest));
  }, []);

  /**
   * Activate a quest
   * @param {string} questTitle - Title of the quest to activate
   */
  const activateQuest = useCallback((questTitle) => {
    setQuests(prev => activateQuestUtil(prev, questTitle));
  }, []);

  /**
   * Update a quest objective
   * @param {string} questTitle - Title of the quest
   * @param {string} objectiveDesc - Description of the objective
   * @param {Object} updates - Updates to apply
   */
  const updateObjective = useCallback((questTitle, objectiveDesc, updates) => {
    setQuests(prev => updateQuestObjective(prev, questTitle, objectiveDesc, updates));
  }, []);

  /**
   * Complete a quest objective
   * @param {string} questTitle - Title of the quest
   * @param {string} objectiveDesc - Description of the objective
   */
  const completeObjective = useCallback((questTitle, objectiveDesc) => {
    setQuests(prev => completeQuestObjective(prev, questTitle, objectiveDesc));
  }, []);

  /**
   * Update quest progress
   * @param {string} questTitle - Title of the quest
   * @param {string} objectiveDesc - Description of the objective
   * @param {number} current - Current progress
   * @param {number} required - Required progress (optional)
   */
  const updateProgress = useCallback((questTitle, objectiveDesc, current, required) => {
    setQuests(prev => updateQuestProgress(prev, questTitle, objectiveDesc, current, required));
  }, []);

  /**
   * Complete a quest
   * @param {string} questTitle - Title of the quest
   */
  const completeQuest = useCallback((questTitle) => {
    setQuests(prev => completeQuestUtil(prev, questTitle));
  }, []);

  /**
   * Check if a quest is completed
   * @param {string} questTitle - Title of the quest
   * @returns {boolean} True if quest is completed
   */
  const isCompleted = useCallback((questTitle) => {
    const quest = quests.find(q => q.title === questTitle);
    return quest ? isQuestCompleted(quest) : false;
  }, [quests]);

  /**
   * Get active quest
   * @returns {Object|null} Active quest or null
   */
  const getActive = useCallback(() => {
    return getActiveQuest(quests);
  }, [quests]);

  /**
   * Get incomplete quests
   * @returns {Array} Array of incomplete quests
   */
  const getIncomplete = useCallback(() => {
    return getIncompleteQuests(quests);
  }, [quests]);

  /**
   * Get completed quests
   * @returns {Array} Array of completed quests
   */
  const getCompleted = useCallback(() => {
    return getCompletedQuests(quests);
  }, [quests]);

  /**
   * Find a quest by title
   * @param {string} questTitle - Title of the quest
   * @returns {Object|null} Quest object or null
   */
  const findQuest = useCallback((questTitle) => {
    return quests.find(q => q.title === questTitle) || null;
  }, [quests]);

  /**
   * Update watering progress
   * @param {number} progress - New progress value
   */
  const updateWateringProgress = useCallback((progress) => {
    setWateringProgress(progress);
  }, []);

  /**
   * Mark watering day as completed
   * @param {number} day - Day number
   */
  const markWateringDayCompleted = useCallback((day) => {
    setWateringDaysCompleted(prev => new Set([...prev, day]));
  }, []);

  /**
   * Check if watering day is completed
   * @param {number} day - Day number
   * @returns {boolean} True if day is completed
   */
  const isWateringDayCompleted = useCallback((day) => {
    return wateringDaysCompleted.has(day);
  }, [wateringDaysCompleted]);

  /**
   * Reset watering progress
   */
  const resetWateringProgress = useCallback(() => {
    setWateringProgress(0);
    setWateringDaysCompleted(new Set());
  }, []);

  /**
   * Load quests from save data
   * @param {Object} saveData - Save data object
   */
  const loadQuests = useCallback((saveData) => {
    if (saveData.quests) {
      setQuests(saveData.quests);
    }
    if (saveData.wateringProgress !== undefined) {
      setWateringProgress(saveData.wateringProgress);
    }
    if (saveData.wateringDaysCompleted) {
      setWateringDaysCompleted(new Set(saveData.wateringDaysCompleted));
    }
  }, []);

  /**
   * Get save data for quests
   * @returns {Object} Quest save data
   */
  const getSaveData = useCallback(() => {
    return {
      quests,
      wateringProgress,
      wateringDaysCompleted: Array.from(wateringDaysCompleted)
    };
  }, [quests, wateringProgress, wateringDaysCompleted]);

  const value = {
    quests,
    wateringProgress,
    wateringDaysCompleted,
    addQuest,
    activateQuest,
    updateObjective,
    completeObjective,
    updateProgress,
    completeQuest,
    isCompleted,
    getActive,
    getIncomplete,
    getCompleted,
    findQuest,
    updateWateringProgress,
    markWateringDayCompleted,
    isWateringDayCompleted,
    resetWateringProgress,
    loadQuests,
    getSaveData
  };

  return (
    <QuestContext.Provider value={value}>
      {children}
    </QuestContext.Provider>
  );
};

