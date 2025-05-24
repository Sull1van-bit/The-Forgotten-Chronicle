import React, { createContext, useContext, useState } from 'react';

const DialogContext = createContext();

export const DialogProvider = ({ children }) => {
  const [isDialogActive, setIsDialogActive] = useState(false);

  return (
    <DialogContext.Provider value={{ isDialogActive, setIsDialogActive }}>
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