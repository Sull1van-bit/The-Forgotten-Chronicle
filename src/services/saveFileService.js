import { db } from '../config/firebase';
import { 
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc
} from 'firebase/firestore';

const SAVE_FILES_COLLECTION = 'saveFiles';

export const saveFileService = {
  // Save a new game file
  async saveGame(userId, saveData) {
    if (!userId) {
      const error = new Error('User ID is required for saving');
      console.error('Error saving game:', error.message);
      return { success: false, error: error.message };
    }

    if (!saveData) {
      const error = new Error('Save data is required');
      console.error('Error saving game:', error.message);
      return { success: false, error: error.message };
    }

    try {
      const saveRef = doc(collection(db, SAVE_FILES_COLLECTION));
      await setDoc(saveRef, {
        userId,
        ...saveData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { success: true, id: saveRef.id };
    } catch (error) {
      console.error('Error saving game:', error);
      return {
        success: false,
        error: error.message || 'Failed to save game. Please try again.'
      };
    }
  },

  // Get all save files for a user
  async getUserSaveFiles(userId) {
    if (!userId) {
      console.error('Error getting save files: User ID is required');
      return { success: false, error: 'User ID is required', data: [] };
    }

    try {
      const q = query(
        collection(db, SAVE_FILES_COLLECTION),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const saveFiles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data: saveFiles };
    } catch (error) {
      console.error('Error getting save files:', error);
      return {
        success: false,
        error: error.message || 'Failed to load save files',
        data: []
      };
    }
  },

  // Load a specific save file
  async loadSaveFile(saveId) {
    if (!saveId) {
      console.error('Error loading save file: Save ID is required');
      return { success: false, error: 'Save ID is required', data: null };
    }

    try {
      const saveRef = doc(db, SAVE_FILES_COLLECTION, saveId);
      const saveDoc = await getDoc(saveRef);
      if (saveDoc.exists()) {
        return {
          success: true,
          data: {
            id: saveDoc.id,
            ...saveDoc.data()
          }
        };
      }
      return { success: false, error: 'Save file not found', data: null };
    } catch (error) {
      console.error('Error loading save file:', error);
      return {
        success: false,
        error: error.message || 'Failed to load save file',
        data: null
      };
    }
  },

  // Update an existing save file
  async updateSaveFile(saveId, saveData) {
    if (!saveId) {
      console.error('Error updating save file: Save ID is required');
      return { success: false, error: 'Save ID is required' };
    }

    if (!saveData) {
      console.error('Error updating save file: Save data is required');
      return { success: false, error: 'Save data is required' };
    }

    try {
      const saveRef = doc(db, SAVE_FILES_COLLECTION, saveId);
      await setDoc(saveRef, {
        ...saveData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return { success: true, id: saveId };
    } catch (error) {
      console.error('Error updating save file:', error);
      return {
        success: false,
        error: error.message || 'Failed to update save file'
      };
    }
  },

  // Delete a save file
  async deleteSaveFile(saveId) {
    if (!saveId) {
      console.error('Error deleting save file: Save ID is required');
      return { success: false, error: 'Save ID is required' };
    }

    try {
      await deleteDoc(doc(db, SAVE_FILES_COLLECTION, saveId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting save file:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete save file'
      };
    }
  }
}; 