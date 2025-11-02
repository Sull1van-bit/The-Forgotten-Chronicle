import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveFileService } from '../services/saveFileService';
import { motion } from 'framer-motion';
import { useSound } from '../context/SoundContext';
import AnimatedList from './AnimatedList';

const LoadGame = ({ onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playExit } = useSound();
  const [saveFiles, setSaveFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSaveFiles = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      try {
        const files = await saveFileService.getUserSaveFiles(user.uid);
        setSaveFiles(files);
      } catch (error) {
        setError('Failed to load save files');
        console.error('Error loading save files:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSaveFiles();
  }, [user, navigate]);

  const handleLoad = async (saveFile) => {
    if (!saveFile.character) return; // Don't load empty slots
    try {
      const saveData = await saveFileService.loadSaveFile(saveFile.id);
      if (saveData) {
        navigate('/game', { 
          state: { 
            character: saveData.character,
            isLoadedGame: true,
            saveData 
          } 
        });
      }
    } catch (error) {
      setError('Failed to load game');
      console.error('Error loading game:', error);
    }
  };

  const handleDelete = async (saveFile) => {
    if (!saveFile.character) return; // Don't delete empty slots
    try {
      await saveFileService.deleteSaveFile(saveFile.id);
      setSaveFiles(prev => prev.filter(file => file.id !== saveFile.id));
    } catch (error) {
      setError('Failed to delete save file');
      console.error('Error deleting save file:', error);
    }
  };

  const handleClose = () => {
    playExit();
    onClose();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
        <div className="text-[#F5DEB3] text-xl">Loading save files...</div>
      </div>
    );
  }

  const formatSaveFile = (saveFile) => {
    if (!saveFile.character) {
      return "Empty Slot";
    }
    const date = new Date(saveFile.createdAt);
    return `${saveFile.character.name} - ${date.toLocaleDateString()}`;
  };

  const renderSaveFile = (saveFile) => (
    <div className="flex justify-between items-center w-full">
      <span className={`${!saveFile.character ? 'text-gray-500' : 'text-[#F5DEB3]'}`}>
        {formatSaveFile(saveFile)}
      </span>
      {saveFile.character && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(saveFile);
          }}
          className="text-red-500 hover:text-red-400 transition-colors"
        >
          Delete
        </button>
      )}
    </div>
  );

  // Create array of 3 save slots
  const saveSlots = Array(3).fill(null).map((_, index) => {
    const existingSave = saveFiles[index];
    return existingSave || { id: `empty-${index}`, character: null };
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
    >
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.3 }}
        className="p-8 rounded-lg max-w-2xl w-full mx-4 relative"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#F5DEB3] text-2xl focus:outline-none hover:text-white transition-colors"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center text-[#F5DEB3]">LOAD GAME</h2>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500 text-white p-4 rounded-lg mb-4"
          >
            {error}
          </motion.div>
        )}

        <div className="text-[#DEB887]">
          <AnimatedList
            items={saveSlots}
            onItemSelect={handleLoad}
            itemClassName="flex justify-between items-center"
            className="mx-auto"
            renderItem={renderSaveFile}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoadGame;