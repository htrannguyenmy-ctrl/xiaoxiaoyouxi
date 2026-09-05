/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useEffect, useRef } from 'react';

type Direction = { x: number; y: number };

export const useKeyboardControls = (onMove: (direction: Direction) => void) => {
  const onMoveRef = useRef(onMove);

  useEffect(() => {
    onMoveRef.current = onMove;
  }, [onMove]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
          onMoveRef.current({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          onMoveRef.current({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          onMoveRef.current({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          onMoveRef.current({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
