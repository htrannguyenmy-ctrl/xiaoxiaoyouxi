/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export enum CellType {
  EMPTY = 'empty',
  START = 'start',
  // Hazards
  WATER = 'water',   // Resets path
  SOCK = 'sock',     // Slippery
  // Blockers
  COUCH = 'couch',
  PLANT = 'plant',
  BOX = 'box',
  // Collectibles
  TREAT = 'treat',   // Score boost
  YARN = 'yarn',     // Multiplier boost
  STAR = 'star',     // Rare bonus
  // Objectives
  SAUCER = 'saucer'
}

export interface Point {
  x: number;
  y: number;
}

export interface LevelData {
  id: number;
  width: number;
  height: number;
  grid: CellType[][];
  startPoint: Point;
  targetCount: number;
  title: string;
  flavor: string;
  roomTheme: string;
}

export interface GameState {
  path: Point[];
  isWon: boolean;
  isDragging: boolean;
  score: number;
  levelStartScore: number;
  multiplier: number;
  treats: number;
  collectedItems: string[]; // Stores coordinates "x,y" of collected items
}
