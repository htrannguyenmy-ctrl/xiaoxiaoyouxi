/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateLevel } from './logic/levelGenerator';
import { Point, CellType, LevelData, GameState } from './types';
import Grid from './components/Grid';
import GameOver from './components/GameOver';
import FooterLeftContent from './components/FooterLeftContent';
import { GAME_CONSTANTS } from './constants';
import { useKeyboardControls } from './hooks/useKeyboardControls';

import useAudio from "./services/audioService";
import { getPath } from "./utils/path";
import { TimerIcon } from "./components/Icons";
import InfoDialog from './components/InfoDialog';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(true);
  const [timerStarted, setTimerStarted] = useState(false);
  const [levelIndex, setLevelIndex] = useState(1);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [level, setLevel] = useState<LevelData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(GAME_CONSTANTS.INITIAL_TIME_SECONDS);
  
  const collectedMap = useRef<Set<string>>(new Set());
  const isTransitioningRef = useRef(false);
  const isWinProcessed = useRef(false);

  const [gameState, setGameState] = useState<GameState>({
    path: [], isWon: false, isDragging: false, score: 0, levelStartScore: 0, multiplier: 1, treats: 0, collectedItems: []
  });
  
  const [timeBonuses, setTimeBonuses] = useState<{id: number; x: number; y: number; text: string; color: string}[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [levelKey, setLevelKey] = useState(1);
  const [pauseStartTime, setPauseStartTime] = useState<number>(0);

  const isPaused = false;

  const { playForeground, preloadCache } = useAudio();
  const audioFiles = [
    getPath("/media/audio/sfx/stretchycat/backspace.mp3"),
    getPath("/media/audio/sfx/stretchycat/stretchspace.mp3"),
    getPath("/media/audio/sfx/stretchycat/YarnReward.mp3"),
    getPath("/media/audio/sfx/stretchycat/FishReward.mp3"),
    getPath("/media/audio/sfx/stretchycat/goal.mp3"),
    getPath("/media/audio/sfx/global/win.mp3"),
  ];

  useEffect(() => {
    const parent = document.getElementById('puzzle-game-container');
    if (parent) {
      parent.style.position = 'relative';
      parent.style.height = '100vh';
      parent.style.width = '100vw';
      parent.style.overflow = 'hidden';
      parent.style.display = 'block';
    }
  }, []);

  useEffect(() => { preloadCache(audioFiles); }, []);

  const [isTreatActive, setIsTreatActive] = useState(true);
  const [isYarnActive, setIsYarnActive] = useState(true);
  const [levelStartTime, setLevelStartTime] = useState<number>(0);

  useEffect(() => {
    if (isPaused) {
      if (pauseStartTime === 0) setPauseStartTime(Date.now());
    } else if (pauseStartTime > 0) {
      const diff = Date.now() - pauseStartTime;
      setLevelStartTime(prev => (prev > 0 ? prev + diff : 0));
      setPauseStartTime(0);
    }
  }, [isPaused, pauseStartTime]);

  const initLevel = useCallback(async (index: number) => {
    setIsTransitioning(true);
    isTransitioningRef.current = true;
    isWinProcessed.current = false;
    const newLevel = generateLevel(index);
    setLevelStartTime(0);

    setTimeout(() => {
      collectedMap.current.clear();
      setLevel(newLevel);
      setLevelKey(k => k + 1);
      setIsTreatActive(true);
      setIsYarnActive(true);
      setPauseStartTime(0);
      setTimerStarted(false);
      setGameState(prev => ({
        ...prev, path: [newLevel.startPoint], isWon: false, isDragging: false, multiplier: 1, treats: 0, collectedItems: []
      }));
      setIsTransitioning(false);
      isTransitioningRef.current = false;
    }, GAME_CONSTANTS.LEVEL_TRANSITION_TIME_MS);
  }, []);

  const handleFullReset = useCallback(() => {
    setGameResult(null);
    setTimeLeft(GAME_CONSTANTS.INITIAL_TIME_SECONDS);
    collectedMap.current.clear();
    isWinProcessed.current = false;
    if (levelIndex === 1) initLevel(1); else setLevelIndex(1);
  }, [levelIndex, initLevel]);

  const restartCurrentLevel = () => {
    if (!level) return;
    setIsTreatActive(true);
    setIsYarnActive(true);
    collectedMap.current.clear();
    isWinProcessed.current = false;
    setLevelStartTime(0);
    setLevelKey(k => k + 1);
    setGameState(prev => ({
      ...prev, path: [level.startPoint], isWon: false, isDragging: false, score: prev.levelStartScore, multiplier: 1, treats: 0, collectedItems: []
    }));
  };

  useEffect(() => {
    if (!isTreatActive || isPaused || pauseStartTime > 0 || !hasStarted || isTransitioning || gameState.isWon || !level || levelStartTime === 0) return; 
    const totalLifetime = GAME_CONSTANTS.TREAT_MIN_LIFETIME_MS + (level.targetCount * GAME_CONSTANTS.TREAT_SCALE_FACTOR_MS);
    const elapsed = Date.now() - levelStartTime;
    const remaining = totalLifetime - elapsed;

    if (remaining <= 0) {
      setIsTreatActive(false);
    } else {
      const timer = setTimeout(() => setIsTreatActive(false), remaining);
      return () => clearTimeout(timer);
    }
  }, [isTreatActive, hasStarted, isTransitioning, gameState.isWon, level, levelStartTime, isPaused, pauseStartTime]);

  useEffect(() => {
    if (!isYarnActive || isPaused || pauseStartTime > 0 || !hasStarted || isTransitioning || gameState.isWon || !level || levelStartTime === 0) return; 
    const totalLifetime = GAME_CONSTANTS.YARN_MIN_LIFETIME_MS + (level.targetCount * GAME_CONSTANTS.YARN_SCALE_FACTOR_MS);
    const elapsed = Date.now() - levelStartTime;
    const remaining = totalLifetime - elapsed;

    if (remaining <= 0) {
      setIsYarnActive(false);
    } else {
      const timer = setTimeout(() => setIsYarnActive(false), remaining);
      return () => clearTimeout(timer);
    }
  }, [isYarnActive, hasStarted, isTransitioning, gameState.isWon, level, levelStartTime, isPaused, pauseStartTime]);

  useEffect(() => {
    if (hasStarted && !isTransitioning && !gameState.isWon && !isPaused && !timerStarted) {
      if (gameState.path.length > 1 || (!isTreatActive && !isYarnActive)) setTimerStarted(true);
    }
  }, [isTreatActive, isYarnActive, timerStarted, hasStarted, isTransitioning, gameState.isWon, isPaused, gameState.path.length]);

  useEffect(() => {
    if (!hasStarted || isTransitioning || gameState.isWon || timeLeft === null || !timerStarted || isPaused) return;
    const timer = setInterval(() => {
        setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted, isTransitioning, gameState.isWon, timeLeft, timerStarted, isPaused]);

  useEffect(() => {
    if (timeLeft === 0 && !gameState.isWon && hasStarted && !isTransitioning && !gameResult) setGameResult('lose');
  }, [timeLeft, gameState.isWon, hasStarted, isTransitioning, gameResult]);

  useEffect(() => { if (hasStarted) initLevel(levelIndex); }, [levelIndex, hasStarted]);

  const handleCellInteraction = (p: Point) => {
    if (isTransitioningRef.current || isWinProcessed.current || isPaused || gameResult) return;
    
    if (levelStartTime === 0) {
      const last = gameState.path[gameState.path.length - 1];
      if (last) {
        const isAdjacent = Math.abs(last.x - p.x) + Math.abs(last.y - p.y) === 1;
        if (isAdjacent) setLevelStartTime(Date.now());
      }
    }

    setGameState(prev => {
      if (!level || prev.isWon || prev.path.length === 0) return prev;
      const path = prev.path;
      const last = path[path.length - 1];
      const secondLast = path[path.length - 2];
      const isAdjacent = (a: Point, b: Point) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
      if (!isAdjacent(last, p)) return prev;
      if (secondLast && p.x === secondLast.x && p.y === secondLast.y) {
        playForeground(getPath("/media/audio/sfx/stretchycat/backspace.mp3"));
        return { ...prev, path: path.slice(0, -1), score: Math.max(prev.levelStartScore, prev.score - GAME_CONSTANTS.BASE_MOVE_SCORE) };
      }
      const cellType = level.grid[p.y][p.x];
      const cellKey = `${p.x},${p.y}`;
      if (path.some(pt => pt.x === p.x && pt.y === p.y)) return prev; 
      if ([CellType.COUCH, CellType.PLANT, CellType.BOX].includes(cellType)) return prev;
      if (cellType === CellType.WATER) { setTimeout(restartCurrentLevel, 0); return prev; }
      const newPath = [...path, p];
      let scoreAdd = GAME_CONSTANTS.BASE_MOVE_SCORE;
      let newTreats = prev.treats;
      if ((cellType === CellType.TREAT && isTreatActive) || (cellType === CellType.YARN && isYarnActive)) {
        if (!collectedMap.current.has(cellKey)) {
          collectedMap.current.add(cellKey);
          if (cellType === CellType.TREAT) {
            playForeground(getPath("/media/audio/sfx/stretchycat/FishReward.mp3"));
            setTimeout(() => setTimeLeft(t => (t !== null ? t + 5 : t)), 0);
            newTreats += 1;
            const bid = Date.now();
            setTimeBonuses(b => [...b, { id: bid, x: p.x, y: p.y, text: `+5s`, color: 'text-white' }]);
            setTimeout(() => setTimeBonuses(b => b.filter(i => i.id !== bid)), 2000);
          } else {
            playForeground(getPath("/media/audio/sfx/stretchycat/YarnReward.mp3"));
            scoreAdd += GAME_CONSTANTS.YARN_SCORE_BONUS;
            const bid = Date.now();
            setTimeBonuses(b => [...b, { id: bid, x: p.x, y: p.y, text: `+${GAME_CONSTANTS.YARN_SCORE_BONUS}`, color: 'text-white' }]);
            setTimeout(() => setTimeBonuses(b => b.filter(i => i.id !== bid)), 2000);
          }
        }
      } else { playForeground(getPath("/media/audio/sfx/stretchycat/stretchspace.mp3")); }
      const won = newPath.length === level.targetCount && cellType === CellType.SAUCER;
      if (won && !isWinProcessed.current) {
        isWinProcessed.current = true;
        isTransitioningRef.current = true;
        setTimeBonuses([]);
        playForeground(getPath("/media/audio/sfx/stretchycat/goal.mp3"));
        setTimeout(() => {
          if (levelIndex >= GAME_CONSTANTS.TOTAL_LEVELS) {
            setGameResult('win');
            playForeground(getPath("/media/audio/sfx/global/win.mp3"));
          } else { setLevelIndex(idx => idx + 1); }
        }, 300);
      }
      return { ...prev, path: newPath, isWon: won, score: prev.score + scoreAdd, treats: newTreats, collectedItems: [...prev.collectedItems, cellKey] };
    });
  };

  useKeyboardControls((direction) => {
    if (!hasStarted || gameResult || isTransitioning || !level || gameState.isWon || isPaused) return;
    const currentHead = gameState.path[gameState.path.length - 1];
    if (!currentHead) return;
    const newPos = { x: currentHead.x + direction.x, y: currentHead.y + direction.y };
    if (newPos.x >= 0 && newPos.x < level.width && newPos.y >= 0 && newPos.y < level.height) handleCellInteraction(newPos);
  });

  if (!level) return null;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden flex flex-col items-center" onMouseUp={() => setGameState(prev => ({ ...prev, isDragging: false }))}>
      <style>{`
        @media (max-width: 767px) {
          footer.fixed {
            bottom: 12px !important;
          }
        }
        @keyframes floatUpFade { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-30px) scale(1.4); opacity: 0; } }
        .animate-float-up { animation: floatUpFade 1.8s ease-out forwards; }
        @keyframes oscillateAlpha { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.9); } }
        .animate-oscillate { animation: oscillateAlpha 0.5s infinite ease-in-out; }
      `}</style>
      
      {gameResult && (
        <GameOver type={gameResult} score={gameState.score} onAction={handleFullReset} />
      )}

      <main className="absolute top-[40px] bottom-[150px] left-0 right-0 flex flex-col items-center justify-center p-2">
        <div className={`transition-all duration-300 transform ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} flex flex-col items-center`}>
          <Grid
            level={level}
            levelKey={levelKey}
            path={gameState.path}
            collectedMap={collectedMap.current}
            timeBonuses={timeBonuses}
            isTreatActive={isTreatActive}
            isYarnActive={isYarnActive}
            levelStartTime={levelStartTime}
            onCellMouseDown={(p) => { if (!isTransitioning && !isWinProcessed.current && !isPaused) { setGameState(prev => ({ ...prev, isDragging: true })); handleCellInteraction(p); } }}
            onCellMouseEnter={(p) => { if (gameState.isDragging && !isTransitioning && !isWinProcessed.current && !isPaused) handleCellInteraction(p); }}
          />
          {timeLeft !== null && (
            <div className="flex items-center gap-2 bg-white text-black px-4 py-1.5 rounded-full font-bold mt-2 shadow-lg">
              <TimerIcon className="w-4 h-4" />
              <span className="text-[16px] tabular-nums">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>
      </main>
      <div className="fixed bottom-[20px] md:bottom-[48px] left-0 right-0 z-[10] flex justify-center pointer-events-none px-6">
        <div className="pointer-events-auto">
          <FooterLeftContent levelId={level.id} totalLevels={GAME_CONSTANTS.TOTAL_LEVELS} score={gameState.score} onReset={handleFullReset} />
        </div>
      </div>

        <InfoDialog title="Stretch and solve" goal="Stretch the cat and fill every space on the board, then end at the finish flag. Gather fish and stars to earn extra time as you race against the clock." />
    </div>
  );
};

export default App;
