import React, { useState } from 'react';
import Folder from './Folder';

const QuestFolder = ({ quests = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Create empty divs for each quest to act as papers
  const questItems = quests.map((quest, index) => (
    <div key={index} className="p-2">
      {/* Content removed as requested */}
    </div>
  ));

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 translate-x-[calc(50%+250px)] z-[100]">
      <Folder 
        color="#8B4513"
        size={0.8}
        items={questItems}
        className="cursor-pointer"
      />
    </div>
  );
};

export default QuestFolder; 