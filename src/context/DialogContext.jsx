import React, { createContext, useContext, useState } from 'react';

const DialogContext = createContext();

export const DialogProvider = ({ children }) => {
  const [isDialogActive, setIsDialogActive] = useState(false);
  const [currentDialog, setCurrentDialog] = useState(null);
  const [dialogIndex, setDialogIndex] = useState(0);

  const startDialog = (dialogueObject) => {
    console.log('Starting dialog:', dialogueObject);
    setCurrentDialog(dialogueObject);
    setDialogIndex(0);
    setIsDialogActive(true);
  };

  const advanceDialog = () => {
    console.log('Advancing dialog, current index:', dialogIndex);
    if (currentDialog && dialogIndex < currentDialog.dialogue.length - 1) {
      setDialogIndex(prev => prev + 1);
    } else {
      endDialog();
    }
  };

  const endDialog = () => {
    console.log('Ending dialog');
    setIsDialogActive(false);
  };

  return (
    <DialogContext.Provider 
      value={{ 
        isDialogActive,
        currentDialog,
        dialogIndex,
        startDialog,
        advanceDialog,
        endDialog
      }}
    >
      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}; 