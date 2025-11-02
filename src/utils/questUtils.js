/**
 * Quest management utilities
 */

/**
 * Update a specific objective within a quest
 * @param {Array} quests - Array of quest objects
 * @param {string} questTitle - Title of the quest to update
 * @param {string} objectiveDesc - Description of the objective to update
 * @param {Object} updates - Object containing updates to apply
 * @returns {Array} Updated quests array
 */
export const updateQuestObjective = (quests, questTitle, objectiveDesc, updates) => {
  return quests.map(quest => {
    if (quest.title !== questTitle) return quest;

    return {
      ...quest,
      objectives: quest.objectives.map(obj =>
        obj.description === objectiveDesc ? { ...obj, ...updates } : obj
      )
    };
  });
};

/**
 * Mark a quest objective as completed
 * @param {Array} quests - Array of quest objects
 * @param {string} questTitle - Title of the quest
 * @param {string} objectiveDesc - Description of the objective
 * @returns {Array} Updated quests array
 */
export const completeQuestObjective = (quests, questTitle, objectiveDesc) => {
  return updateQuestObjective(quests, questTitle, objectiveDesc, { completed: true });
};

/**
 * Update quest progress
 * @param {Array} quests - Array of quest objects
 * @param {string} questTitle - Title of the quest
 * @param {string} objectiveDesc - Description of the objective
 * @param {number} current - Current progress value
 * @param {number} required - Required progress value (optional)
 * @returns {Array} Updated quests array
 */
export const updateQuestProgress = (quests, questTitle, objectiveDesc, current, required) => {
  const updates = { current };
  if (required !== undefined) {
    updates.required = required;
  }
  if (required !== undefined && current >= required) {
    updates.completed = true;
  }
  return updateQuestObjective(quests, questTitle, objectiveDesc, updates);
};

/**
 * Add a new quest to the quest list
 * @param {Array} quests - Array of quest objects
 * @param {Object} newQuest - New quest object to add
 * @returns {Array} Updated quests array
 */
export const addQuest = (quests, newQuest) => {
  // Check if quest already exists
  const exists = quests.some(q => q.title === newQuest.title);
  if (exists) return quests;

  return [...quests, { ...newQuest, active: false }];
};

/**
 * Activate a quest
 * @param {Array} quests - Array of quest objects
 * @param {string} questTitle - Title of the quest to activate
 * @returns {Array} Updated quests array
 */
export const activateQuest = (quests, questTitle) => {
  return quests.map(quest => ({
    ...quest,
    active: quest.title === questTitle
  }));
};

/**
 * Check if all objectives in a quest are completed
 * @param {Object} quest - Quest object
 * @returns {boolean} True if all objectives are completed
 */
export const isQuestCompleted = (quest) => {
  return quest.objectives.every(obj => obj.completed);
};

/**
 * Mark a quest as completed
 * @param {Array} quests - Array of quest objects
 * @param {string} questTitle - Title of the quest
 * @returns {Array} Updated quests array
 */
export const completeQuest = (quests, questTitle) => {
  return quests.map(quest =>
    quest.title === questTitle
      ? { ...quest, completed: true, active: false }
      : quest
  );
};

/**
 * Get active quest
 * @param {Array} quests - Array of quest objects
 * @returns {Object|null} Active quest or null
 */
export const getActiveQuest = (quests) => {
  return quests.find(q => q.active) || null;
};

/**
 * Get incomplete quests
 * @param {Array} quests - Array of quest objects
 * @returns {Array} Array of incomplete quests
 */
export const getIncompleteQuests = (quests) => {
  return quests.filter(q => !q.completed);
};

/**
 * Get completed quests
 * @param {Array} quests - Array of quest objects
 * @returns {Array} Array of completed quests
 */
export const getCompletedQuests = (quests) => {
  return quests.filter(q => q.completed);
};

