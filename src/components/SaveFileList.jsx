import React from 'react';
import { getSaveFileDisplayInfo } from '../utils/saveFileUtils';
import { saveFileService } from '../services/saveFileService';

const SaveFileList = ({ saveFiles, onLoad, onDelete, onRefresh }) => {
  const handleDelete = async (saveId) => {
    try {
      await saveFileService.deleteSaveFile(saveId);
      onRefresh();
    } catch (error) {
      console.error('Error deleting save file:', error);
    }
  };

  return (
    <div className="save-files-container">
      <h2>Save Files</h2>
      {saveFiles.length === 0 ? (
        <p>No save files found</p>
      ) : (
        <div className="save-files-list">
          {saveFiles.map((saveFile) => {
            const displayInfo = getSaveFileDisplayInfo(saveFile);
            return (
              <div key={saveFile.id} className="save-file-item">
                <div className="save-file-info">
                  <h3>{displayInfo.character}</h3>
                  <p>Level: {displayInfo.level}</p>
                  <p>Play Time: {displayInfo.playTime}</p>
                  <p>Saved: {displayInfo.timestamp}</p>
                </div>
                <div className="save-file-actions">
                  <button onClick={() => onLoad(saveFile.id)}>Load</button>
                  <button onClick={() => handleDelete(saveFile.id)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SaveFileList; 