import React from 'react';

const QuestMenu = ({ quests = [] }) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100]">
      <div className="bg-[#8B4513] border-4 border-[#D2B48C] rounded-lg p-4 shadow-lg">
        <h2 className="text-[#F5DEB3] font-bold text-lg mb-2 text-center">Active Quests</h2>
        <div className="space-y-2">
          {quests.length > 0 ? (
            quests.map((quest, index) => (
              <div 
                key={index}
                className="bg-[#A0522D] border-2 border-[#DEB887] rounded p-2"
              >
                <div className="text-[#F5DEB3] font-semibold">{quest.title}</div>
                <div className="text-[#DEB887] text-sm">{quest.description}</div>
                {quest.objectives && (
                  <div className="mt-1 text-[#DEB887] text-sm">
                    {quest.objectives.map((objective, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className={objective.completed ? 'text-green-400' : 'text-yellow-400'}>
                          {objective.completed ? '✓' : '○'}
                        </span>
                        {objective.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-[#DEB887] text-center italic">
              No active quests
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestMenu; 