"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Children,
  cloneElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

function DockItem({
  children,
  className = "",
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
}) {
  const ref = useRef(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize,
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size,
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-lg bg-[#8B4513] border-4 border-[#D2B48C] shadow-md cursor-pointer ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, (child) =>
        cloneElement(child, { isHovered })
      )}
    </motion.div>
  );
}

function DockLabel({ children, className = "", ...rest }) {
  const { isHovered } = rest;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = isHovered.on("change", (latest) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`${className} absolute -top-24 left-1/2 transform -translate-x-1/2 w-fit whitespace-pre rounded-lg border-4 border-[#D2B48C] bg-[#8B4513] px-3 py-1 text-sm text-[#F5DEB3]`}
          role="tooltip"
          style={{ x: "-50%" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className = "" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {children}
    </div>
  );
}

function Dock({
  items,
  className = "",
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 64,
  dockHeight = 256,
  baseItemSize = 50,
}) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [magnification, dockHeight]
  );
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <motion.div
      style={{ height, scrollbarWidth: "none" }}
      className="mx-2 flex max-w-full items-center"
    >
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={`${className} absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-end w-fit gap-4 rounded-2xl border-4 border-[#D2B48C] bg-[#8B4513] pb-2 px-4`}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.type === 'quest' ? 'opacity-75' : ''}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
          >
            <DockIcon>
              {item.icon && (
                <>
                  <img 
                    src={item.icon} 
                    alt={item.name} 
                    className="w-8 h-8 object-contain"
                  />
                  {item.quantity > 1 && (
                    <div className="absolute bottom-0 right-0 bg-[#8B4513] border-2 border-[#D2B48C] text-[#F5DEB3] text-xs px-1 rounded-tl">
                      {item.quantity}
                    </div>
                  )}
                </>
              )}
            </DockIcon>
            <DockLabel>
              <div className="font-bold">{item.name}</div>
              <div className="text-[#DEB887]">{item.description}</div>
              {item.type === 'consumable' && item.effect && (
                <div className="text-[#DEB887] mt-1">
                  {item.effect.health && <div>Health: +{item.effect.health}</div>}
                  {item.effect.energy && <div>Energy: +{item.effect.energy}</div>}
                  {item.effect.hunger && <div>Hunger: +{item.effect.hunger}</div>}
                </div>
              )}
            </DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}

const Inventory = ({ items = [], onUseItem }) => {
  const MAX_SLOTS = 8;
  
  const dockItems = Array.from({ length: MAX_SLOTS }, (_, index) => {
    const item = items[index];
    if (item) {
      return {
        icon: item.icon,
        name: item.name,
        description: item.description,
        type: item.type,
        effect: item.effect,
        quantity: item.quantity,
        onClick: () => item.type !== 'quest' && onUseItem(item),
        className: item.type === 'quest' ? 'opacity-75' : ''
      };
    } else {
      return {
        icon: null,
        name: 'Empty Slot',
        description: 'This slot is empty. Collect items to fill it.',
        type: 'empty',
        onClick: () => {},
        className: ''
      };
    }
  });

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100]">
      <Dock items={dockItems} />
    </div>
  );
};

export default Inventory; 