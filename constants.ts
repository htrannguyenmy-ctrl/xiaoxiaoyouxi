/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const GAME_CONSTANTS = {
  // Treats (🐟)
  TREAT_MIN_LIFETIME_MS: 3500,
  TREAT_SCALE_FACTOR_MS: 100, 
  
  // Yarn (🧶)
  YARN_MIN_LIFETIME_MS: 3000,
  YARN_SCALE_FACTOR_MS: 100,

  // Collectible Expiring Behavior
  COLLECTIBLE_WARNING_TIME_MS: 3000,
  COLLECTIBLE_OSCILLATION_FREQ_HZ: 2, // Blinks per second when expiring
  
  // Game Timer
  INITIAL_TIME_SECONDS: 15,
  TREAT_TIME_BONUS_SECONDS: 5,
  
  // Scoring
  BASE_MOVE_SCORE: 10,
  TREAT_SCORE_BONUS: 0,
  YARN_SCORE_BONUS: 50,
  
  // Levels
  TOTAL_LEVELS: 12,
  BASE_GRID_SIZE: 5,
  MAX_GRID_SIZE: 8,
  LEVEL_WIN_DELAY_TIME_MS: 0,
  LEVEL_TRANSITION_TIME_MS: 400,

  // Level Generation Difficulty
  TARGET_DENSITY_BASE: 0.52,
  TARGET_DENSITY_INCREMENT: 0.03,
  TARGET_DENSITY_MAX: 0.9,
  
  // Collectible Limits
  MAX_COLLECTIBLES_PER_LEVEL: 3,
  WALLS_KILL_YOU: false,
};