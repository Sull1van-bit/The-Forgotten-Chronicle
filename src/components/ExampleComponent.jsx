/**
 * Example component demonstrating the use of new context and utility APIs
 * This file can be used as a reference for migrating existing code
 */

import React from 'react';
import { usePlayerStats } from '../context/PlayerStatsContext';
import { useInventory } from '../context/InventoryContext';
import { useQuests } from '../context/QuestContext';
import { useFarming } from '../context/FarmingContext';
import { getCharacterSprites } from '../utils/characterUtils';

const ExampleComponent = ({ characterName = 'louise' }) => {
  // Access contexts
  const { stats, modifyStat, addMoney, money } = usePlayerStats();
  const { inventory, addItem, removeItem, hasItem, ITEMS } = useInventory();
  const { quests, updateProgress, completeObjective } = useQuests();
  const { plantedCrops, plantCrop, harvestCrop, waterCropAt } = useFarming();

  // Get character sprites
  const characterSprites = getCharacterSprites(characterName);

  // Example: Player eats food
  const handleEatBread = () => {
    if (hasItem('bread')) {
      removeItem('bread');
      modifyStat('hunger', stats.hunger + 30);
      modifyStat('energy', stats.energy + 10);
      console.log('Ate bread! Restored hunger and energy.');
    }
  };

  // Example: Plant a crop
  const handlePlantCrop = (x, y) => {
    if (hasItem('seeds')) {
      const success = plantCrop(x, y);
      if (success) {
        removeItem('seeds');
        console.log('Planted crop at', x, y);

        // Update quest progress
        updateProgress('Welcome Home', 'Plant 3 crops', plantedCrops.length + 1, 3);
      }
    }
  };

  // Example: Harvest crop
  const handleHarvest = (x, y) => {
    const crop = harvestCrop(x, y);
    if (crop) {
      addItem('potato', 1);
      addMoney(10);
      console.log('Harvested potato! Gained 10 coins.');

      // Complete quest objective
      completeObjective('Welcome Home', 'Harvest your first crop');
    }
  };

  // Example: Water crop
  const handleWater = (x, y) => {
    const success = waterCropAt(x, y);
    if (success) {
      console.log('Watered crop at', x, y);
      modifyStat('energy', stats.energy - 5);
    }
  };

  // Example: Buy seeds from shop
  const handleBuySeeds = () => {
    const seedPrice = ITEMS.seeds.price;
    if (money >= seedPrice) {
      if (removeItem('money', seedPrice)) {
        addItem('seeds', 5);
        addMoney(-seedPrice);
        console.log('Bought 5 seeds!');
      }
    } else {
      console.log('Not enough money!');
    }
  };

  return (
    <div className="example-component">
      <h2>Example Component - Using New Contexts</h2>

      {/* Player Stats Display */}
      <div className="stats">
        <h3>Player Stats</h3>
        <p>Health: {stats.health}</p>
        <p>Energy: {stats.energy}</p>
        <p>Hunger: {stats.hunger}</p>
        <p>Money: {money}</p>
      </div>

      {/* Inventory Display */}
      <div className="inventory">
        <h3>Inventory</h3>
        {inventory.map((item, index) => (
          <div key={index}>
            {ITEMS[item.item]?.name}: {item.quantity}
          </div>
        ))}
      </div>

      {/* Quest Display */}
      <div className="quests">
        <h3>Active Quests</h3>
        {quests.filter(q => !q.completed).map((quest, index) => (
          <div key={index}>
            <h4>{quest.title}</h4>
            {quest.objectives.map((obj, i) => (
              <div key={i}>
                {obj.description} {obj.completed ? '✓' : ''}
                {obj.required && ` (${obj.current}/${obj.required})`}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Character Sprite Display */}
      <div className="character">
        <img src={characterSprites.stand} alt={characterName} />
      </div>

      {/* Action Buttons */}
      <div className="actions">
        <button onClick={handleEatBread}>Eat Bread</button>
        <button onClick={() => handlePlantCrop(10, 10)}>Plant Crop</button>
        <button onClick={() => handleWater(10, 10)}>Water Crop</button>
        <button onClick={() => handleHarvest(10, 10)}>Harvest Crop</button>
        <button onClick={handleBuySeeds}>Buy Seeds</button>
      </div>
    </div>
  );
};

export default ExampleComponent;

