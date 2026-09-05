/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';

interface GameOverProps {
  type: 'win' | 'lose';
  score: number;
  onAction: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ type, score, onAction }) => {
  const isWin = type === 'win';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-xl p-[55px]">
      <div className="bg-black text-white px-7.5 lg:px-10 py-10 lg:py-12.5 rounded-3xl text-center w-full rainbow-border animate-rotate-gradient animate-in fade-in zoom-in duration-200 flex flex-col items-center min-w-xs max-w-md">
        
        <h2 className="text-white text-[24px] md:text-[30px] font-medium leading-tight tracking-tight px-6 w-[230px] md:w-[280px]">
          {isWin 
            ? "You won!" 
            : "Oh no! You ran out of time"}
        </h2>

        <div className="mt-[25px] flex flex-col items-center">
          <div className="text-white text-[72px] md:text-[84px] font-medium leading-[0.9] tracking-[-3px]">
            {score.toLocaleString()}
          </div>
          <div className="text-white/60 text-[16px] font-medium mt-[10px]">
            Points
          </div>
        </div>

        <div className="mt-[30px] flex flex-col items-center w-full px-8 max-w-[259px]">
          <button
            onClick={onAction}
            className="flex justify-center items-center py-4 w-full md:w-[259px] cursor-pointer bg-white text-black font-medium text-[18px] md:text-[16px] rounded-[120px] transition-all duration-200 hover:brightness-110 active:scale-95"
          >
            {isWin ? 'Play again' : 'Retry'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
