/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { CellType, Point, LevelData } from '../types';
import { GAME_CONSTANTS } from '../constants';


/**
 * Generates a level by first constructing a Hamiltonian path on a subset of the grid.
 */
export const generateLevel = (levelIndex: number): LevelData => {
  const baseSize = GAME_CONSTANTS.BASE_GRID_SIZE;
  const growth = Math.floor((levelIndex - 1) / 3);
  const width = Math.min(GAME_CONSTANTS.MAX_GRID_SIZE, baseSize + growth);
  const height = Math.min(GAME_CONSTANTS.MAX_GRID_SIZE, baseSize + growth);
  
  // Higher level = more dense path
  const targetDensity = Math.min(
    GAME_CONSTANTS.TARGET_DENSITY_MAX, 
    GAME_CONSTANTS.TARGET_DENSITY_BASE + (levelIndex * GAME_CONSTANTS.TARGET_DENSITY_INCREMENT)
  );
  const targetLength = Math.floor(width * height * targetDensity);

  let attempts = 0;
  while (attempts < 200) {
    attempts++;
    
    const grid: CellType[][] = Array.from({ length: height }, () => 
      Array.from({ length: width }, () => CellType.BOX) // Start all as obstacles
    );

    const startPoint = { 
      x: Math.floor(Math.random() * width), 
      y: Math.floor(Math.random() * height) 
    };

    const path: Point[] = [startPoint];
    const visited = new Set<string>([`${startPoint.x},${startPoint.y}`]);

    // Randomized DFS to find a Hamiltonian path of targetLength
    const findPath = (curr: Point): boolean => {
      if (path.length === targetLength) return true;

      const neighbors = [
        { x: curr.x + 1, y: curr.y },
        { x: curr.x - 1, y: curr.y },
        { x: curr.x, y: curr.y + 1 },
        { x: curr.x, y: curr.y - 1 }
      ].filter(n => 
        n.x >= 0 && n.x < width && n.y >= 0 && n.y < height && 
        !visited.has(`${n.x},${n.y}`)
      );

      // Shuffle neighbors for variety
      for (let i = neighbors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
      }

      for (const next of neighbors) {
        visited.add(`${next.x},${next.y}`);
        path.push(next);
        if (findPath(next)) return true;
        path.pop();
        visited.delete(`${next.x},${next.y}`);
      }

      return false;
    };

    if (findPath(startPoint)) {
      // Successfully generated a Hamiltonian path of length targetLength
      // 1. Mark cells in grid
      path.forEach((p, idx) => {
        if (idx === 0) {
          grid[p.y][p.x] = CellType.START;
        } else if (idx === path.length - 1) {
          grid[p.y][p.x] = CellType.SAUCER;
        } else {
          // Default to empty, we'll scatter items later
          grid[p.y][p.x] = CellType.EMPTY;
        }
      });

      // 2. Scatter collectibles on the path, limited by MAX_COLLECTIBLES_PER_LEVEL
      let collectiblesPlaced = 0;
      const pathIndices = Array.from({ length: path.length - 2 }, (_, i) => i + 1);
      // Shuffle indices to place collectibles randomly along the path
      for (let i = pathIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pathIndices[i], pathIndices[j]] = [pathIndices[j], pathIndices[i]];
      }

      for (const idx of pathIndices) {
        if (collectiblesPlaced >= GAME_CONSTANTS.MAX_COLLECTIBLES_PER_LEVEL) break;
        
        if (Math.random() < 0.2) { // 20% chance per potential slot until limit reached
          const p = path[idx];
          grid[p.y][p.x] = Math.random() < 0.2 ? CellType.YARN : CellType.TREAT;
          collectiblesPlaced++;
        }
      }

      // 3. Decorate non-path cells with variety
      if (GAME_CONSTANTS.WALLS_KILL_YOU)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (grid[y][x] === CellType.BOX) {
              grid[y][x] = CellType.WATER;
          }
        }
      }

      return {
        id: levelIndex,
        width,
        height,
        grid,
        startPoint,
        targetCount: path.length,
        title: `Room ${levelIndex}`,
        flavor: levelIndex > 10 ? "A true test of flexibility!" : "Just a cozy little stretch.",
        roomTheme: '#FFFFFF'
      };
    }
  }

  // Final fallback (simple 5x5)
  return {
    id: levelIndex,
    width: 5,
    height: 5,
    grid: [
      [CellType.START, CellType.EMPTY, CellType.EMPTY, CellType.EMPTY, CellType.EMPTY],
      [CellType.BOX, CellType.BOX, CellType.BOX, CellType.BOX, CellType.EMPTY],
      [CellType.EMPTY, CellType.EMPTY, CellType.EMPTY, CellType.EMPTY, CellType.EMPTY],
      [CellType.EMPTY, CellType.BOX, CellType.BOX, CellType.BOX, CellType.BOX],
      [CellType.EMPTY, CellType.EMPTY, CellType.EMPTY, CellType.EMPTY, CellType.SAUCER]
    ],
    startPoint: { x: 0, y: 0 },
    targetCount: 17,
    title: `Room ${levelIndex}`,
    flavor: "Back to basics.",
    roomTheme: '#FFFFFF'
  };
};
