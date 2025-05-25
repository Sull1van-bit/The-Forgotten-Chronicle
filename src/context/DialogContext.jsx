import React, { createContext, useContext, useState, useCallback } from 'react';

const DialogContext = createContext();

export const DialogProvider = ({ children }) => {
  const [isDialogActive, setIsDialogActive] = useState(false);
  const [currentDialog, setCurrentDialog] = useState(null);
  const [dialogIndex, setDialogIndex] = useState(0);

  const startDialog = useCallback((dialogueObject) => {
    console.log('Starting dialog:', dialogueObject);
    // Reset dialog state before starting new dialog
    setDialogIndex(0);
    setCurrentDialog(dialogueObject);
    setIsDialogActive(true);
  }, []);

  const advanceDialog = useCallback(() => {
    console.log('Advancing dialog, current index:', dialogIndex);
    if (currentDialog && dialogIndex < currentDialog.dialogue.length - 1) {
      setDialogIndex(prev => prev + 1);
    } else {
      endDialog();
    }
  }, [currentDialog, dialogIndex]);

  const endDialog = useCallback(() => {
    console.log('Ending dialog');
    setIsDialogActive(false);
    // Call onComplete callback if it exists
    if (currentDialog?.onComplete) {
      currentDialog.onComplete();
    }
    // Clear dialog state after a short delay to ensure animations complete
    setTimeout(() => {
      setCurrentDialog(null);
      setDialogIndex(0);
    }, 300);
  }, [currentDialog]);

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