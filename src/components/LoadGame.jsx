import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveFileService } from '../services/saveFileService';
import SaveFileUI from './SaveFileUI';

const LoadGame = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const handleLoad = async (saveId) => {
    try {
      const saveData = await saveFileService.loadSaveFile(saveId);
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

  const handleDelete = async (saveId) => {
    try {
      await saveFileService.deleteSaveFile(saveId);
      setSaveFiles(prev => prev.filter(file => file.id !== saveId));
    } catch (error) {
      setError('Failed to delete save file');
      console.error('Error deleting save file:', error);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white text-xl">Loading save files...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-white text-3xl font-bold mb-8 text-center">Load Game</h1>
        
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <SaveFileUI
          saveFiles={saveFiles}
          onLoad={handleLoad}
          onDelete={handleDelete}
        />

        <button
          onClick={handleBack}
          className="mt-8 px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Back to Main Menu
        </button>
      </div>
    </div>
  );
};

export default LoadGame; 