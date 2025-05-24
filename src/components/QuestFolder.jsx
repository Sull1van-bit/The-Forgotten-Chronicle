import React, { useState } from 'react';
import Folder from './Folder';
import PixelCard from './PixelCard';

const QuestFolder = ({ quests = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showQuestCard, setShowQuestCard] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);

  const handleFolderClick = () => {
    setIsOpen(!isOpen);
  };

  const handlePaperClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Paper clicked, quests:', quests);
    if (quests && quests.length > 0) {
      setSelectedQuest(quests[0]);
      setShowQuestCard(true);
    }
  };

  const handleCloseQuestCard = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuestCard(false);
    setSelectedQuest(null);
  };

  // Create three papers, with only the middle one being functional
  const questItems = [
    <div key="empty1" className="p-2 opacity-50"></div>,
    <div 
      key="quest" 
      className="p-2 cursor-pointer hover:bg-yellow-100 transition-colors w-full h-full"
      onClick={handlePaperClick}
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
        />
      </div>

      {/* Quest Card Modal */}
      {showQuestCard && selectedQuest && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[200]"
          onClick={handleCloseQuestCard}
        >
          {/* Subtle black overlay */}
          <div 
            className="absolute inset-0 bg-black/5 transition-opacity duration-300"
          />
          
          {/* Card container with animation */}
          <div 
            className="w-[280px] h-[420px] relative transform transition-all duration-300 scale-100 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={handleCloseQuestCard}
              className="absolute -top-3 -right-3 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-[201] text-sm shadow-lg"
            >
              ✕
            </button>
            
            <PixelCard
              variant="black"
              className="w-full h-full bg-[#8B4513] group shadow-2xl"
            >
              {/* Initial Title View */}
              <div className="absolute inset-0 flex items-center justify-center p-4 text-white z-10 group-hover:opacity-0 transition-all duration-300">
                <h2 className="text-lg font-bold text-[#F5DEB3] text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{selectedQuest.title}</h2>
              </div>

              {/* Detailed View (shown on hover) */}
              <div className="absolute inset-0 p-4 text-white z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-y-auto">
                <p className="text-sm mb-3 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{selectedQuest.description}</p>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#F5DEB3] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Objectives:</h3>
                  <ul className="list-disc list-inside text-sm">
                    {selectedQuest.objectives.map((objective, index) => (
                      <li 
                        key={index}
                        className={`flex items-center gap-2 ${objective.completed ? 'text-green-400' : ''} drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]`}
                      >
                        {objective.completed ? '✓' : '○'} {objective.description}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </PixelCard>
          </div>
        </div>
      )}
    </>
  );
};

export default QuestFolder; 