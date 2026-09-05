/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { LevelData, Point, CellType } from '../types';
import { GAME_CONSTANTS } from '../constants';
import Cell from './Cell';

interface GridProps {
  level: LevelData;
  path: Point[];
  timeBonuses?: { id: number; x: number; y: number; text: string; color: string }[];
  collectedMap: Set<string>;
  isTreatActive: boolean;
  isYarnActive: boolean;
  levelStartTime: number;
  levelKey?: number;
  onCellMouseDown: (p: Point) => void;
  onCellMouseEnter: (p: Point) => void;
}

const Grid: React.FC<GridProps> = ({ 
  level, path, timeBonuses = [], collectedMap, isTreatActive, isYarnActive, levelStartTime, levelKey, onCellMouseDown, onCellMouseEnter 
}) => {
  const gridRef = useRef<HTMLDivElement>(null);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* Inside Grid.tsx useMemo */
  const { tileSize, gap } = useMemo(() => {
    const maxDim = Math.max(level.width, level.height);
    
    // Keep the 90% width as it was good
    const horizontalLimit = windowSize.width * 0.90 - 20; //10 px padding in parent
    
    // CHANGED: 320 is the sweet spot between original (380) and too big (260)
    const verticalLimit = windowSize.height - 320; 
    
    const containerSize = Math.min(horizontalLimit, verticalLimit);
    const calculatedTileSize = Math.floor(containerSize / maxDim);
    const calculatedGap = Math.max(2, Math.floor(calculatedTileSize / 12));

    return { tileSize: Math.max(calculatedTileSize, 20), gap: calculatedGap };
  }, [level.width, level.height, windowSize]);

  const getPathIndex = (x: number, y: number) => path.findIndex(p => p.x === x && p.y === y);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const cellElement = target?.closest('[data-cell-x]');
    if (cellElement) {
      const x = parseInt(cellElement.getAttribute('data-cell-x') || '0', 10);
      const y = parseInt(cellElement.getAttribute('data-cell-y') || '0', 10);
      onCellMouseEnter({ x, y });
    }
  };

  return (
    <div 
      ref={gridRef}
      className="relative select-none grid bg-black/20 p-3 rounded-xl shadow-inner"
      style={{
        gridTemplateColumns: `repeat(${level.width}, ${tileSize}px)`,
        gridTemplateRows: `repeat(${level.height}, ${tileSize}px)`,
        gap: `${gap}px`,
        touchAction: 'none',
      }}
      onTouchMove={handleTouchMove}
      onTouchStart={(e) => {
        if (e.cancelable) e.preventDefault(); 
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const cellElement = target?.closest('[data-cell-x]');
        if (cellElement) {
          const x = parseInt(cellElement.getAttribute('data-cell-x') || '0', 10);
          const y = parseInt(cellElement.getAttribute('data-cell-y') || '0', 10);
          onCellMouseDown({ x, y });
        }
      }}
    >
      {timeBonuses.map(bonus => (
        <div key={bonus.id} className="absolute animate-float-up pointer-events-none z-50 flex items-center justify-center" style={{ left: `${bonus.x * (tileSize + gap) + (tileSize / 2) - 30}px`, top: `${bonus.y * (tileSize + gap) + (tileSize / 2) - 15}px`, width: "60px", height: "30px" }}>
          <span className="bg-[#4275F4] rounded-full px-2 border border-white text-white font-bold text-sm">{bonus.text}</span>
        </div>
      ))}

      {level.grid.map((row, y) => (
        row.map((cellType, x) => {
          const coordKey = `${x},${y}`;
          const pathIndex = getPathIndex(x, y);
          const isActive = cellType === CellType.TREAT ? isTreatActive : cellType === CellType.YARN ? isYarnActive : true;
          const isCollected = collectedMap.has(coordKey) || !isActive;

          let expiryMs = 0;
          if (cellType === CellType.TREAT) {
            expiryMs = GAME_CONSTANTS.TREAT_MIN_LIFETIME_MS + (level.targetCount * GAME_CONSTANTS.TREAT_SCALE_FACTOR_MS);
          } else if (cellType === CellType.YARN) {
            expiryMs = GAME_CONSTANTS.YARN_MIN_LIFETIME_MS + (level.targetCount * GAME_CONSTANTS.YARN_SCALE_FACTOR_MS);
          }
          
          const connections = { up: false, down: false, left: false, right: false };
          if (pathIndex !== -1) {
            const neighbors = [path[pathIndex - 1], path[pathIndex + 1]].filter(Boolean);
            neighbors.forEach(n => {
              if (n.x === x && n.y === y - 1) connections.up = true;
              if (n.x === x && n.y === y + 1) connections.down = true;
              if (n.x === x - 1 && n.y === y) connections.left = true;
              if (n.x === x + 1 && n.y === y) connections.right = true;
            });
          }

          let headDirection: 'up' | 'down' | 'left' | 'right' = 'right';
          if (pathIndex === path.length - 1 && path.length > 1) {
            const prev = path[path.length - 2];
            if (prev.x < x) headDirection = 'right'; else if (prev.x > x) headDirection = 'left';
            else if (prev.y < y) headDirection = 'down'; else if (prev.y > y) headDirection = 'up';
          }

          const dist = Math.abs(x - level.startPoint.x) + Math.abs(y - level.startPoint.y);

          return (
            <motion.div
              key={`${levelKey ?? level.id}-${x}-${y}`}
              style={{ width: tileSize, height: tileSize }}
              data-cell-x={x}
              data-cell-y={y}
              initial={{ opacity: 0, scale: 0.65 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.28,
                delay: dist * 0.028,
                ease: [0.34, 1.3, 0.64, 1],
              }}
            >
              <Cell
                type={cellType}
                isInPath={pathIndex !== -1}
                isHead={pathIndex === path.length - 1 && path.length > 0}
                isTail={pathIndex === 0 && path.length > 0}
                isCollected={isCollected}
                pathIndex={pathIndex}
                currentPathLength={path.length}
                connections={connections}
                headDirection={headDirection}
                levelStartTime={levelStartTime}
                expiryMs={expiryMs}
                onMouseDown={() => onCellMouseDown({ x, y })}
                onMouseEnter={() => onCellMouseEnter({ x, y })}
                x={x} y={y} gridWidth={level.width} gridHeight={level.height}
              />
            </motion.div>
          );
        })
      ))}
    </div>
  );
};

export default Grid;