import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { getSaveFileDisplayInfo } from '../utils/saveFileUtils';

const AnimatedItem = ({ children, delay = 0, index, onMouseEnter, onClick }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.5, triggerOnce: false });
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      className="mb-4 cursor-pointer"
    >
      {children}
    </motion.div>
  );
};

const SaveFileUI = ({ saveFiles = [], onLoad, onDelete, onRefresh }) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const listRef = useRef(null);

  // Format save files for display
  const formattedSaveFiles = saveFiles.map(saveFile => {
    const displayInfo = getSaveFileDisplayInfo(saveFile);
    return {
      id: saveFile.id,
      displayText: `${displayInfo.character} - Level ${displayInfo.level} (${displayInfo.timestamp})`,
      ...displayInfo
    };
  });

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.min(prev + 1, formattedSaveFiles.length - 1));
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < formattedSaveFiles.length) {
          e.preventDefault();
          const selectedSave = formattedSaveFiles[selectedIndex];
          onLoad(selectedSave.id);
        }
      } else if (e.key === 'Delete') {
        if (selectedIndex >= 0 && selectedIndex < formattedSaveFiles.length) {
          e.preventDefault();
          const selectedSave = formattedSaveFiles[selectedIndex];
          onDelete(selectedSave.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formattedSaveFiles, selectedIndex, onLoad, onDelete]);

  // Scroll selected item into view
  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const selectedItem = container.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedItem) {
      const extraMargin = 50;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;
      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' });
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: 'smooth',
        });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  return (
    <div className="relative w-[500px]">
      <div
        ref={listRef}
        className="max-h-[400px] overflow-y-auto p-4 [&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-[#060606] [&::-webkit-scrollbar-thumb]:bg-[#222] [&::-webkit-scrollbar-thumb]:rounded-[4px]"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#222 #060606',
        }}
      >
        {formattedSaveFiles.length === 0 ? (
          <div className="text-white text-center p-4">No save files found</div>
        ) : (
          formattedSaveFiles.map((saveFile, index) => (
            <AnimatedItem
              key={saveFile.id}
              delay={0.1}
              index={index}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => {
                setSelectedIndex(index);
                onLoad(saveFile.id);
              }}
            >
              <div className={`p-4 bg-[#111] rounded-lg ${selectedIndex === index ? 'bg-[#222]' : ''}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white m-0 font-medium">{saveFile.character}</p>
                    <p className="text-gray-400 text-sm m-0">Level {saveFile.level} - {saveFile.timestamp}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(saveFile.id);
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </AnimatedItem>
          ))
        )}
      </div>
      <div className="absolute top-0 left-0 right-0 h-[50px] bg-gradient-to-b from-[#060606] to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-t from-[#060606] to-transparent pointer-events-none"></div>
    </div>
  );
};

export default SaveFileUI;
