import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDialog } from '../context/DialogContext';
import allMapImg from '../assets/Maps/all-map.png';

const Minimap = () => {
  const { isDialogActive } = useDialog();

  return (
    <AnimatePresence>
      {!isDialogActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-4 left-4 z-40"
        >
          <div className="bg-[#8B4513] p-2 rounded-lg border-4 border-[#D2B48C] shadow-lg">
            <div className="w-48 h-32 bg-[#DEB887] rounded relative overflow-hidden">
              {/* Minimap Image */}
              <img
                src={allMapImg}
                alt="Minimap"
                className="w-full h-full object-cover rounded"
                draggable="false"
              />
              {/* Player Position (centered for now) */}
              <div
                className="absolute w-2 h-2 bg-red-500 rounded-full border-2 border-white"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2,
                }}
              />
              {/* Map Legend */}
              <div className="absolute bottom-1 right-1 text-[8px] text-[#8B4513] z-10">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>You</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Minimap; 