# Code Refactoring Implementation Guide

This document describes the improvements implemented based on the code review.

## ✅ Implemented Improvements

### 1. **Utility Files Created**

#### Character Utilities (`src/utils/characterUtils.js`)
- Centralized character sprite management
- Functions: `getCharacterSprites()`, `getCharacterPortrait()`
- Eliminates code duplication across Game.jsx, HouseInterior.jsx, and CastleTomb.jsx

#### Quest Utilities (`src/utils/questUtils.js`)
- Quest management helper functions
- Functions: `updateQuestObjective()`, `completeQuestObjective()`, `updateQuestProgress()`, etc.
- Simplifies quest state updates throughout the codebase

#### Crop Utilities (`src/utils/cropUtils.js`)
- Farming logic utilities
- Functions: `updateCropForNewDay()`, `waterCrop()`, `isReadyToHarvest()`, etc.
- Consistent crop management logic

#### Collision Utilities (`src/utils/collisionUtils.js`)
- **Performance Optimization**: Spatial hashing for O(1) collision detection
- Functions: `createSpatialHashGrid()`, `hasCollisionWithGrid()`, `checkAABBCollision()`
- Significantly improves performance for large maps

### 2. **Context Splitting (Better State Management)**

#### Player Stats Context (`src/context/PlayerStatsContext.jsx`)
Manages:
- Health, energy, hunger, happiness, cleanliness
- Money
- Methods: `updateStat()`, `modifyStat()`, `updateStats()`, `addMoney()`, `subtractMoney()`

#### Inventory Context (`src/context/InventoryContext.jsx`)
Manages:
- Inventory items
- Item definitions (ITEMS object)
- Methods: `addItem()`, `removeItem()`, `hasItem()`, `getItemQuantity()`

#### Quest Context (`src/context/QuestContext.jsx`)
Manages:
- Quest list
- Quest progression
- Watering quest tracking
- Methods: Uses quest utilities for all operations

#### Farming Context (`src/context/FarmingContext.jsx`)
Manages:
- Planted crops
- Crop operations
- Methods: `plantCrop()`, `harvestCrop()`, `waterCropAt()`, `updateCropsForNewDay()`

### 3. **Improved Error Handling**

#### Save File Service (`src/services/saveFileService.js`)
- All methods now return `{ success, data/id, error }` objects
- Input validation before operations
- Better error messages
- New method: `updateSaveFile()` for updating existing saves

### 4. **Context Provider Structure**

Updated `App.jsx` with proper context nesting:
```
AuthProvider
  → SoundProvider
    → MusicProvider
      → PlayerStatsProvider
        → InventoryProvider
          → QuestProvider
            → FarmingProvider
              → GameProvider
                → DialogProvider
```

## 📋 Usage Examples

### Using Character Utils
```javascript
import { getCharacterSprites, getCharacterPortrait } from '../utils/characterUtils';

const sprites = getCharacterSprites(characterName);
const portrait = getCharacterPortrait(characterName);
```

### Using Quest Utils
```javascript
import { useQuests } from '../context/QuestContext';

const { updateProgress, completeObjective } = useQuests();

// Update quest progress
updateProgress("Welcome Home", "Water crops", 5, 10);

// Complete objective
completeObjective("Welcome Home", "Enter your house");
```

### Using Farming Context
```javascript
import { useFarming } from '../context/FarmingContext';

const { plantCrop, waterCropAt, harvestCrop } = useFarming();

// Plant a crop
const success = plantCrop(x, y);

// Water a crop
waterCropAt(x, y);

// Harvest
const crop = harvestCrop(x, y);
```

### Using Collision Utils (Optimized)
```javascript
import { createSpatialHashGrid, hasCollisionWithGrid } from '../utils/collisionUtils';

// Create grid once at initialization
const collisionGrid = useMemo(() => 
  createSpatialHashGrid(COLLISION_MAP, 32), 
  [COLLISION_MAP]
);

// Fast O(1) collision check
const hasCollision = hasCollisionWithGrid(collisionGrid, playerX, playerY, 32, 32);
```

### Using Player Stats Context
```javascript
import { usePlayerStats } from '../context/PlayerStatsContext';

const { stats, modifyStat, addMoney, subtractMoney } = usePlayerStats();

// Modify single stat
modifyStat('health', -10); // Decrease health by 10

// Modify multiple stats
modifyStats({ health: -10, energy: -5, hunger: -10 });

// Money operations
addMoney(50);
const success = subtractMoney(100); // Returns false if insufficient funds
```

## 🔄 Migration Guide

### For Game.jsx

**Before:**
```javascript
setQuests(prevQuests =>
  prevQuests.map(quest =>
    quest.title === "Welcome Home" ? {
      ...quest,
      objectives: quest.objectives.map(objective => /* ... */)
    } : quest
  )
);
```

**After:**
```javascript
const { updateProgress } = useQuests();
updateProgress("Welcome Home", "Water crops", currentProgress, requiredProgress);
```

### For Inventory Operations

**Before:**
```javascript
setInventory(prev => {
  const existingItem = prev.find(i => i.item === itemKey);
  // ... complex logic
});
```

**After:**
```javascript
const { addItem, removeItem, hasItem } = useInventory();
addItem('seeds', 5);
if (hasItem('seeds', 5)) {
  removeItem('seeds', 5);
}
```

### For Collision Detection

**Before:**
```javascript
const hasCollision = (x, y) => {
  return COLLISION_MAP.some(point => checkCollision(x, y, point));
};
```

**After:**
```javascript
const collisionGrid = useMemo(() => 
  createSpatialHashGrid(COLLISION_MAP), 
  [COLLISION_MAP]
);

const hasCollision = hasCollisionWithGrid(collisionGrid, x, y, width, height);
```

## ⚡ Performance Improvements

### Spatial Hashing
- **Before**: O(n) collision checks (iterating through all collision points)
- **After**: O(1) average case with spatial hashing
- **Impact**: Significant FPS improvement on large maps

### Context Splitting
- **Before**: Single GameContext re-renders entire app on any state change
- **After**: Only affected components re-render
- **Impact**: Better React performance and fewer unnecessary re-renders

### Memoization Opportunities
All utility functions are pure and can be easily memoized:
```javascript
const processedData = useMemo(() => 
  someUtilFunction(data), 
  [data]
);
```

## 🔒 Security Improvements

### Save File Service
- Input validation prevents invalid operations
- Better error messages don't expose system details
- Consistent error handling structure

### Firebase Security Rules (Recommended)
Add these rules to your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /saveFiles/{saveId} {
      // Users can only read/write their own save files
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      
      // Allow creation if userId matches auth
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## 📝 TODO: Next Steps

### High Priority
1. **Split Game.jsx** into smaller components:
   - PlayerController.jsx
   - NPCManager.jsx
   - CropRenderer.jsx
   - GameUI.jsx

2. **Add Error Boundaries**:
   ```javascript
   <ErrorBoundary fallback={<ErrorScreen />}>
     <Game />
   </ErrorBoundary>
   ```

3. **Fix Memory Leaks**: Ensure all event listeners are cleaned up properly

### Medium Priority
4. **Add Loading States**: Show loading indicators during async operations
5. **Implement Retry Logic**: For failed save operations
6. **Add Data Validation**: Validate save data structure before loading

### Low Priority
7. **Add TypeScript**: For better type safety (optional)
8. **Add Unit Tests**: For utility functions
9. **Add Performance Monitoring**: Track FPS and render times

## 🐛 Known Issues

None currently - all core functionality maintained while improving structure.

## 📚 Additional Resources

- [React Context Best Practices](https://react.dev/learn/passing-data-deeply-with-context)
- [Spatial Hashing Explanation](https://en.wikipedia.org/wiki/Spatial_database#Spatial_index)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

## 🤝 Contributing

When adding new features:
1. Use appropriate context for state management
2. Create utility functions for shared logic
3. Follow the established patterns in this refactor
4. Add proper error handling
5. Update this documentation

---

**Version**: 2.0  
**Last Updated**: November 2, 2025  
**Status**: ✅ Core refactoring complete

