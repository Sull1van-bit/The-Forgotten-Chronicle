import React, { useState } from 'react';
import Folder from './Folder';
import PixelCard from './PixelCard';
import { useSound } from '../context/SoundContext';

const QuestFolder = ({ quests = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showQuestCard, setShowQuestCard] = useState(false);
  const [selectedQuestIndex, setSelectedQuestIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { playClick, playHover } = useSound();

  const handleFolderClick = () => {
    playClick();
    setIsOpen(!isOpen);
  };

  const handlePaperClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    playClick();
    if (quests && quests.length > 0) {
      // Start with the latest quest
      setSelectedQuestIndex(quests.length - 1);
      setShowQuestCard(true);
    }
  };

  const handleCloseQuestCard = (e) => {
    e.preventDefault();
    e.stopPropagation();
    playClick();
    setShowQuestCard(false);
  };

  const handleNextQuest = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAnimating) return;
    
    playClick();
    setIsAnimating(true);
    setSelectedQuestIndex((prev) => (prev + 1) % quests.length);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handlePrevQuest = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAnimating) return;
    
    playClick();
    setIsAnimating(true);
    setSelectedQuestIndex((prev) => (prev - 1 + quests.length) % quests.length);
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Create three papers, with only the middle one being functional
  const questItems = [
    <div key="empty1" className="p-2 opacity-50"></div>,
    <div 
      key="quest" 
      className="p-2 cursor-pointer hover:bg-yellow-100 transition-colors w-full h-full"
      onClick={handlePaperClick}
      onMouseEnter={playHover}
      style={{ zIndex: 2 }}
    ></div>,
    <div key="empty2" className="p-2 opacity-50"></div>
  ];

  return (
    <>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 translate-x-[calc(50%+250px)] z-[100]">
        <Folder 
          color="#8B4513"
          size={0.8}
          items={questItems}
          className="cursor-pointer"
          onClick={handleFolderClick}
          onMouseEnter={playHover}
        />
      </div>

      {/* Quest Card Modal */}
      {showQuestCard && quests[selectedQuestIndex] && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[200]"
          onClick={handleCloseQuestCard}
        >
          <div className="absolute inset-0 bg-black/5" />
          
          <div 
            className="w-[280px] h-[420px] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={handleCloseQuestCard}
              onMouseEnter={playHover}
              className="absolute -top-3 -right-3 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-[201] text-sm shadow-lg"
            >
              ✕
            </button>

            {/* Navigation Buttons */}
            {quests.length > 1 && (
              <>
                <button 
                  onClick={handlePrevQuest}
                  onMouseEnter={playHover}
                  className="absolute -left-12 top-1/2 -translate-y-1/2 bg-[#8B4513] text-[#F5DEB3] w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#A0522D] transition-colors z-[201] text-sm shadow-lg border-2 border-[#D2B48C]"
                >
                  ←
                </button>
                <button 
                  onClick={handleNextQuest}
                  onMouseEnter={playHover}
                  className="absolute -right-12 top-1/2 -translate-y-1/2 bg-[#8B4513] text-[#F5DEB3] w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#A0522D] transition-colors z-[201] text-sm shadow-lg border-2 border-[#D2B48C]"
                >
                  →
                </button>
              </>
            )}
            
            <div 
              className={`h-full transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
            >
              <PixelCard
                variant="black"
                className="w-full h-full bg-[#8B4513] group shadow-2xl"
              >
                <div className="absolute inset-0 flex items-center justify-center p-4 text-white z-10 group-hover:opacity-0 transition-all duration-300">
                  <h2 className="text-lg font-bold text-[#F5DEB3] text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    {quests[selectedQuestIndex].title}
                  </h2>
                </div>

                <div className="absolute inset-0 p-4 text-white z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-y-auto">
                  <p className="text-sm mb-3 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    {quests[selectedQuestIndex].description}
                  </p>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-[#F5DEB3] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Objectives:</h3>
                    <ul className="list-disc list-inside text-sm">
                      {quests[selectedQuestIndex].objectives.map((objective, index) => {
                        // Find the first incomplete objective
                        const firstIncompleteIndex = quests[selectedQuestIndex].objectives.findIndex(obj => !obj.completed);
                        
                        // Show all completed objectives and the current one
                        if (objective.completed || index === firstIncompleteIndex) {
                          return (
                            <li 
                              key={index}
                              className={`flex items-center gap-2 ${
                                objective.completed 
                                  ? 'text-gray-400 line-through' 
                                  : 'text-[#F5DEB3] font-bold'
                              } drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]`}
                            >
                              {objective.description}
                            </li>
                          );
                        }
                        return null;
                      })}
                    </ul>
                  </div>
                </div>
              </PixelCard>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuestFolder; 