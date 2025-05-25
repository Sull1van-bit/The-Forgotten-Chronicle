import React, { useState } from 'react';

const ActiveQuestFolderUI = ({ quests = [] }) => {
  const [isVisible, setIsVisible] = useState(false); // Start hidden

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Filter out completed quests and get first incomplete objective
  const incompleteQuests = quests.filter(quest => 
    quest.objectives.some(objective => !objective.completed)
  ).map(quest => ({
    ...quest,
    currentObjective: quest.objectives.find(objective => !objective.completed)
  }));

  // Estimate button height for positioning the dropdown below
  // Based on py-2 and text-sm, let's estimate height around 30-40px.
  const buttonHeight = 35; 
  const panelWidth = 256; // w-64 is 64 * 4 = 256px

  return (
    <div className="relative group inline-block">
      {/* Visible button/icon */}
      <div
        className="bg-[#8B4513] py-2 rounded-md shadow-lg hover:bg-[#A0522D] cursor-pointer flex justify-center items-center gap-2 px-3 border border-[#D2B48C]"
        onClick={toggleVisibility} // Add click handler
      >
        {/* Text label */}
        <p className="text-sm font-semibold text-[#F5DEB3]">Quest</p>
      </div>

      {/* Dropdown content - positioned below and slightly left */}
      <div
        className={`absolute w-64 bg-[#8B4513] border border-[#D2B48C] rounded-md shadow-lg transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{
          top: `${buttonHeight + 8}px`, // Position below button + margin
          right: '10px', // Align right edge 10px from container's right edge (shifts left)
          pointerEvents: isVisible ? 'auto' : 'none', // Allow clicks when visible
        }}
      >
        <ul className="p-4 space-y-1">
          {/* Map over quests and display details here */}
          {incompleteQuests.map((quest, index) => (
            <li key={index} className="py-1">
              <h3 className="font-semibold text-[#F5DEB3]">{quest.title}</h3>
              {quest.currentObjective && (
                <ul className="list-none p-0 m-0 space-y-1 text-sm mt-1">
                  <li className="flex items-center gap-1 text-white">
                    {quest.currentObjective.description}
                  </li>
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ActiveQuestFolderUI; 