import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDialog } from '../context/DialogContext';
import allMapImg from '../assets/Maps/all-map.png';
import playerMinimapIcon from '../assets/minimap/player.png';
import shopMinimapIcon from '../assets/minimap/shop.png';

// Define map dimensions (should match Game.jsx for accuracy)
const MAP_WIDTH = 2400;
const MAP_HEIGHT = 1800;

// Define minimap dimensions (adjust if Tailwind units change)
const MINIMAP_WIDTH = 256; // w-64
const MINIMAP_HEIGHT = 192; // h-48
const PLAYER_DOT_SIZE = 8; // w-2 h-2 * 4

// Approximate rendered player size based on Game.jsx (13px * 2.5 scale)
// const RENDERED_PLAYER_HEIGHT = 32.5;

// Manual vertical adjustment (positive value moves dot down)
const MINIMAP_VERTICAL_OFFSET = 5;

// Manual vertical adjustment for shop icons (positive value moves icon down)
const MINIMAP_SHOP_VERTICAL_OFFSET = 9;

const Minimap = ({ position, shopPoints }) => {
  const { isDialogActive } = useDialog();
  const minimapRef = useRef(null);

  // Define grid size (should match Game.jsx)
  const GRID_SIZE = 40;
  const GRID_COLS = Math.floor(MAP_WIDTH / GRID_SIZE);
  const GRID_ROWS = Math.floor(MAP_HEIGHT / GRID_SIZE);

  // Calculate scaled position for the first shop icon if points exist
  const firstShopPoint = shopPoints.length > 0 ? shopPoints[0] : null;
  const scaledFirstShopX = firstShopPoint ? (firstShopPoint.x * GRID_SIZE / MAP_WIDTH) * (minimapRef.current ? minimapRef.current.clientWidth : MINIMAP_WIDTH) : null;
  const scaledFirstShopY = firstShopPoint ? (firstShopPoint.y * GRID_SIZE / MAP_HEIGHT) * (minimapRef.current ? minimapRef.current.clientHeight : MINIMAP_HEIGHT) : null;

  // Adjust position to center the first shop icon, plus vertical offset
  const firstShopIconLeft = scaledFirstShopX !== null ? scaledFirstShopX - 12 / 2 : null; // Adjusting for w-3 (12px)
  const firstShopIconTop = scaledFirstShopY !== null ? scaledFirstShopY - 12 / 2 + MINIMAP_SHOP_VERTICAL_OFFSET : null; // Adjusting for h-3 (12px) and adding offset

  // Calculate scaled player position for minimap using ref dimensions
  const minimapActualWidth = minimapRef.current ? minimapRef.current.clientWidth : MINIMAP_WIDTH;
  const minimapActualHeight = minimapRef.current ? minimapRef.current.clientHeight : MINIMAP_HEIGHT;

  // Calculate scaled player position for minimap based on top-left corner
  const minimapPlayerX = (position.x / MAP_WIDTH) * minimapActualWidth;
  const minimapPlayerY = (position.y / MAP_HEIGHT) * minimapActualHeight;

  // Adjust position to center the dot on the scaled location, plus vertical offset
  const dotLeft = minimapPlayerX - PLAYER_DOT_SIZE / 2;
  const dotTop = minimapPlayerY - PLAYER_DOT_SIZE / 2 + MINIMAP_VERTICAL_OFFSET;

  return (
    <AnimatePresence>
      {!isDialogActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-4 left-4 z-[60]"
        >
          <div className="bg-[#8B4513] p-2 rounded-lg border-4 border-[#D2B48C] shadow-lg">
            <div className="w-64 h-48 bg-[#DEB887] rounded relative overflow-hidden" ref={minimapRef}>
              {/* Minimap Image */}
              <img
                src={allMapImg}
                alt="Minimap"
                className="w-full h-full object-cover rounded"
                draggable="false"
              />
              {/* Render Single Shop Icon (using the first point) */}
              {firstShopPoint && ( // Render only if firstShopPoint exists
                <img
                  key="shop-icon"
                  src={shopMinimapIcon}
                  alt="Shop"
                  className="absolute w-3 h-3 object-contain z-20"
                  style={{
                    left: `${firstShopIconLeft}px`,
                    top: `${firstShopIconTop}px`,
                  }}
                />
              )}
              {/* Player Position */}
              <img
                src={playerMinimapIcon}
                alt="Player"
                className="absolute w-2 h-2 object-contain z-20"
                style={{
                  left: `${dotLeft}px`,
                  top: `${dotTop}px`,
                }}
              />
              {/* Map Legend */}
              <div className="absolute bottom-1 right-1 text-[8px] text-[#8B4513] z-10">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-1" />
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