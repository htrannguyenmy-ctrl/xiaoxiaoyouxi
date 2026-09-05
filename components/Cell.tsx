/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useMemo } from 'react';
import { CellType } from '../types';
import { GAME_CONSTANTS } from '../constants';
import { getPath } from "../utils/path";

interface CellProps {
  type: CellType;
  isInPath: boolean;
  isHead: boolean;
  isTail: boolean;
  isCollected: boolean;
  pathIndex: number;
  currentPathLength: number; 
  connections: { up: boolean; down: boolean; left: boolean; right: boolean };
  headDirection: 'up' | 'down' | 'left' | 'right';
  levelStartTime: number;
  expiryMs: number;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  x: number;
  y: number;
  gridWidth: number;
  gridHeight: number;
}

const Cell: React.FC<CellProps> = ({ 
  type, 
  isInPath, 
  isHead, 
  isTail, 
  isCollected, 
  pathIndex, 
  currentPathLength, 
  connections, 
  headDirection, 
  levelStartTime, 
  expiryMs, 
  onMouseDown, 
  onMouseEnter,
  x, 
  y, 
  gridWidth, 
  gridHeight 
}) => {
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (isCollected || (type !== CellType.TREAT && type !== CellType.YARN) || levelStartTime === 0) {
      setIsWarning(false);
      return;
    }

    const updateWarning = () => {
      const elapsed = Date.now() - levelStartTime;
      const remaining = expiryMs - elapsed;
      setIsWarning(remaining <= 1000 && remaining > 0);
    };

    const interval = setInterval(updateWarning, 100);
    updateWarning();
    return () => clearInterval(interval);
  }, [isCollected, type, levelStartTime, expiryMs]);

  const bgPos = useMemo(() => {
    const posX = gridWidth > 1 ? (x / (gridWidth - 1)) * 100 : 0;
    const posY = gridHeight > 1 ? (y / (gridHeight - 1)) * 100 : 0;
    return `${posX}% ${posY}%`;
  }, [x, y, gridWidth, gridHeight]);

  const renderEmoji = () => {
    if (isCollected) return null;
    
    const spriteSize = "w-[22px] h-[22px] md:w-[44px] md:h-[44px]";
    const commonClass = `select-none z-10 filter drop-shadow-md transform hover:scale-110 transition-transform flex items-center justify-center ${spriteSize} ${isWarning ? 'animate-oscillate' : ''}`;

    switch (type) {
      case CellType.TREAT: 
        return (
          <div className={commonClass}>
            <svg viewBox="0 0 23 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M11.8623 0.108398C15.7329 -0.481852 19.1458 1.34013 21.917 5.43652C22.1467 5.77604 22.1459 6.22185 21.915 6.56055C19.3421 10.3338 15.9755 11.8521 12.4697 11.6094C9.32253 11.3914 6.19608 9.76379 3.52832 7.37793C2.97211 7.93175 2.40613 8.52691 1.83496 9.16699C1.46725 9.57904 0.834921 9.61477 0.422852 9.24707C0.0110552 8.87932 -0.0248442 8.24694 0.342773 7.83496C0.907423 7.20219 1.47308 6.60393 2.03711 6.04004L0.282227 4.47363C-0.0684162 4.16048 -0.0961548 3.62397 0.219727 3.27637C0.535622 2.92898 1.07609 2.90099 1.42676 3.21387L3.27148 4.86133C6.18376 2.20881 9.06509 0.535058 11.8623 0.108398Z" fill="white"/>
            </svg>
          </div>
        );
      case CellType.YARN: 
        return (
          <div className={commonClass}>
            <svg viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M4.7809 3.73973L7.16072 0.658702C7.33071 0.432052 7.53257 0.265605 7.7663 0.159363C8.00004 0.0531211 8.24439 0 8.49938 0C8.75436 0 8.99871 0.0531211 9.23245 0.159363C9.46618 0.265605 9.66804 0.432052 9.83803 0.658702L12.2179 3.73973L15.8301 4.95089C16.1984 5.06421 16.4888 5.27315 16.7013 5.57772C16.9138 5.88228 17.02 6.21871 17.02 6.58702C17.02 6.757 16.9952 6.92699 16.9456 7.09698C16.8961 7.26697 16.8146 7.42987 16.7013 7.58569L14.3639 10.9004L14.4489 14.3852C14.4631 14.881 14.3002 15.2989 13.9602 15.6389C13.6203 15.9788 13.2236 16.1488 12.7703 16.1488C12.742 16.1488 12.5862 16.1276 12.3028 16.0851L8.49938 15.0226L4.69591 16.0851C4.62508 16.1134 4.54717 16.1311 4.46217 16.1382C4.37718 16.1453 4.29927 16.1488 4.22844 16.1488C3.77514 16.1488 3.3785 15.9788 3.03853 15.6389C2.69855 15.2989 2.53565 14.881 2.54981 14.3852L2.63481 10.8792L0.318727 7.58569C0.205402 7.42987 0.123949 7.26697 0.0743695 7.09698C0.0247898 6.92699 0 6.757 0 6.58702C0 6.23288 0.102701 5.90352 0.308102 5.59896C0.513504 5.2944 0.800358 5.07838 1.16866 4.95089L4.7809 3.73973Z" fill="white"/>
            </svg>
          </div>
        );
      case CellType.SAUCER: 
        return (
          <div className="z-10 w-full h-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88" fill="none" style={{ width: '85%', height: '85%' }}>
              <mask id="mask0_7779_10087" /* @ts-ignore */ style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="88" height="88">
                <rect width="87.0186" height="87.0186" fill="#D9D9D9"/>
              </mask>
              <g mask="url(#mask0_7779_10087)">
                <path d="M32.632 21.7547H39.8835V14.5031H32.632V21.7547ZM47.1351 21.7547V14.5031H54.3866V21.7547H47.1351ZM32.632 50.7608V43.5093H39.8835V50.7608H32.632ZM61.6382 36.2578V29.0062H68.8897V36.2578H61.6382ZM61.6382 50.7608V43.5093H68.8897V50.7608H61.6382ZM47.1351 50.7608V43.5093H54.3866V50.7608H47.1351ZM61.6382 21.7547V14.5031H68.8897V21.7547H61.6382ZM39.8835 29.0062V21.7547H47.1351V29.0062H39.8835ZM18.1289 72.5155V14.5031H25.3805V21.7547H32.632V29.0062H25.3805V36.2578H32.632V43.5093H25.3805V72.5155H18.1289ZM54.3866 43.5093V36.2578H61.6382V43.5093H54.3866ZM39.8835 43.5093V36.2578H47.1351V43.5093H39.8835ZM32.632 36.2578V29.0062H39.8835V36.2578H32.632ZM47.1351 36.2578V29.0062H54.3866V36.2578H47.1351ZM54.3866 29.0062V21.7547H61.6382V29.0062H54.3866Z" fill="white"/>
              </g>
            </svg>
          </div>
        );
        default: return null;
    }
  };

  const cellStyle: React.CSSProperties = isInPath ? {
    backgroundImage: `url('${getPath("/media/images/builds/nonogram-gradient.png")}')`,
    backgroundPosition: bgPos,
    backgroundSize: `${gridWidth * 100}% ${gridHeight * 100}%`,
    backgroundRepeat: "no-repeat",
  } : {
    backgroundColor: [CellType.BOX, CellType.COUCH, CellType.PLANT, CellType.WATER].includes(type) 
      ? "#37383B" 
      : "#9BA0A6BF"
  };

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      className="relative w-full h-full flex items-center justify-center rounded-[8%] cursor-pointer overflow-hidden"
      style={cellStyle}
    >
      {renderEmoji()}

      {isInPath && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {!isHead && !isTail && <div className="bg-white w-[55%] h-[55%] z-20 rounded-full" />}
          {connections.up && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[100%] bg-white z-10" />}
          {connections.down && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[55%] h-[100%] bg-white z-10" />}
          {connections.left && <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-[55%] w-[100%] bg-white z-10" />}
          {connections.right && <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-[55%] w-[100%] bg-white z-10" />}
          {isHead && (
            <div 
              className="absolute w-[70%] h-[70%] z-40 flex items-center justify-center pointer-events-none"
              style={{ transform: `rotate(${{ up: 0, right: 90, down: 180, left: 270 }[headDirection]}deg)` }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 80 92" width="160" height="184">
                <rect width="80" height="80" y="12" fill="#fff" rx="20"/>
                <path stroke="#000" stroke-linecap="round" d="M32 42.5a6.5 6.5 0 1 0-13 0M60 42.5a6.5 6.5 0 1 0-13 0"/>
                <path fill="#fff" d="M18.268 3c.77-1.333 2.694-1.333 3.464 0l9.526 16.5c.77 1.333-.192 3-1.732 3H10.474c-1.54 0-2.502-1.667-1.732-3L18.268 3ZM58.268 3c.77-1.333 2.694-1.333 3.464 0l9.526 16.5c.77 1.333-.192 3-1.732 3H50.474c-1.54 0-2.502-1.667-1.732-3L58.268 3Z"/>
                <path stroke="#000" stroke-linecap="round" d="M23 66.143a8.357 8.357 0 1 0 16.714 0M39.714 66.143a8.357 8.357 0 0 0 16.715 0"/>
                <path fill="#000" d="M40.544 66.197a1 1 0 0 1-1.659 0l-5.914-8.781a1 1 0 0 1 .829-1.559h11.83a1 1 0 0 1 .83 1.559l-5.916 8.781Z"/>
              </svg>
            </div>
          )}
          {isTail && <div className="absolute w-[55%] h-[55%] bg-white z-30 rounded-full shadow-md" />}
        </div>
      )}
    </div>
  );
};

export default Cell;