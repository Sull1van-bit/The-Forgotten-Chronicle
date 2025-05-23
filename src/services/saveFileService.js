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
    try {
      const saveRef = doc(collection(db, SAVE_FILES_COLLECTION));
      await setDoc(saveRef, {
        userId,
        ...saveData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return saveRef.id;
    } catch (error) {
      console.error('Error saving game:', error);
      throw error;
    }
  },

  // Get all save files for a user
  async getUserSaveFiles(userId) {
    try {
      const q = query(
        collection(db, SAVE_FILES_COLLECTION),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting save files:', error);
      throw error;
    }
  },

  // Load a specific save file
  async loadSaveFile(saveId) {
    try {
      const saveRef = doc(db, SAVE_FILES_COLLECTION, saveId);
      const saveDoc = await getDoc(saveRef);
      if (saveDoc.exists()) {
        return {
          id: saveDoc.id,
          ...saveDoc.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Error loading save file:', error);
      throw error;
    }
  },

  // Delete a save file
  async deleteSaveFile(saveId) {
    try {
      await deleteDoc(doc(db, SAVE_FILES_COLLECTION, saveId));
    } catch (error) {
      console.error('Error deleting save file:', error);
      throw error;
    }
  }
}; 