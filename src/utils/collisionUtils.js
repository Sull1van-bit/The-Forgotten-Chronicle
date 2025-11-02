/**
 * Collision detection utilities with spatial hashing for performance
 */

/**
 * Create a spatial hash grid from collision points
 * @param {Array} collisionMap - Array of collision points {x, y, width, height}
 * @param {number} gridSize - Size of grid cells (default: 32)
 * @returns {Map} Spatial hash grid
 */
export const createSpatialHashGrid = (collisionMap, gridSize = 32) => {
  const grid = new Map();

  collisionMap.forEach(point => {
    const minX = Math.floor(point.x / gridSize);
    const minY = Math.floor(point.y / gridSize);
    const maxX = Math.floor((point.x + (point.width || gridSize)) / gridSize);
    const maxY = Math.floor((point.y + (point.height || gridSize)) / gridSize);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const key = `${x},${y}`;
        if (!grid.has(key)) {
          grid.set(key, []);
        }
        grid.get(key).push(point);
      }
    }
  });

  return grid;
};

/**
 * Check collision using spatial hash grid (O(1) lookup)
 * @param {Map} grid - Spatial hash grid
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} width - Width of object
 * @param {number} height - Height of object
 * @param {number} gridSize - Size of grid cells (default: 32)
 * @returns {boolean} True if collision detected
 */
export const hasCollisionWithGrid = (grid, x, y, width = 32, height = 32, gridSize = 32) => {
  const minX = Math.floor(x / gridSize);
  const minY = Math.floor(y / gridSize);
  const maxX = Math.floor((x + width) / gridSize);
  const maxY = Math.floor((y + height) / gridSize);

  for (let gridX = minX; gridX <= maxX; gridX++) {
    for (let gridY = minY; gridY <= maxY; gridY++) {
      const key = `${gridX},${gridY}`;
      const cellObjects = grid.get(key);

      if (cellObjects) {
        for (const obj of cellObjects) {
          if (checkAABBCollision(x, y, width, height, obj.x, obj.y, obj.width || gridSize, obj.height || gridSize)) {
            return true;
          }
        }
      }
    }
  }

  return false;
};

/**
 * AABB (Axis-Aligned Bounding Box) collision detection
 * @param {number} x1 - X coordinate of first object
 * @param {number} y1 - Y coordinate of first object
 * @param {number} w1 - Width of first object
 * @param {number} h1 - Height of first object
 * @param {number} x2 - X coordinate of second object
 * @param {number} y2 - Y coordinate of second object
 * @param {number} w2 - Width of second object
 * @param {number} h2 - Height of second object
 * @returns {boolean} True if collision detected
 */
export const checkAABBCollision = (x1, y1, w1, h1, x2, y2, w2, h2) => {
  return x1 < x2 + w2 &&
         x1 + w1 > x2 &&
         y1 < y2 + h2 &&
         y1 + h1 > y2;
};

/**
 * Check collision with array (original method for compatibility)
 * @param {Array} collisionMap - Array of collision points
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} width - Width of object
 * @param {number} height - Height of object
 * @returns {boolean} True if collision detected
 */
export const hasCollision = (collisionMap, x, y, width = 32, height = 32) => {
  return collisionMap.some(point =>
    checkAABBCollision(x, y, width, height, point.x, point.y, point.width || 32, point.height || 32)
  );
};

/**
 * Get nearest collision point
 * @param {Array} collisionMap - Array of collision points
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Object|null} Nearest collision point or null
 */
export const getNearestCollision = (collisionMap, x, y) => {
  let nearest = null;
  let minDistance = Infinity;

  collisionMap.forEach(point => {
    const dx = point.x - x;
    const dy = point.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < minDistance) {
      minDistance = distance;
      nearest = point;
    }
  });

  return nearest;
};

/**
 * Check if point is within bounds
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} minX - Minimum X
 * @param {number} minY - Minimum Y
 * @param {number} maxX - Maximum X
 * @param {number} maxY - Maximum Y
 * @returns {boolean} True if point is within bounds
 */
export const isWithinBounds = (x, y, minX, minY, maxX, maxY) => {
  return x >= minX && x <= maxX && y >= minY && y <= maxY;
};

