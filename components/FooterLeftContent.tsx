/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface FooterLeftContentProps {
  levelId: number;
  totalLevels: number;
  score: number;
  onReset: () => void;
}

const FooterLeftContent: React.FC<FooterLeftContentProps> = ({ 
  levelId,
  totalLevels,
  score,
  onReset 
}) => {
  const gradientBorderStyle = {
    background: 'conic-gradient(from 270deg at 50% 50.12%, #4285F4 142.87deg, #BB55A1 175.78deg, #EA4335 194.23deg, #FBBC04 246.99deg, #B9D84C 268.68deg, #38A852 305.11deg, #38A852 330.36deg, #4285F4 353.77deg)'
  };

  const textStyle = "text-white text-[16px] md:text-[18px] font-medium leading-[1.2] md:leading-[1.6] md:tracking-[-0.36px] whitespace-nowrap";

  return (
    <div className="flex items-center">
      <div 
        className="p-[1.5px] rounded-full overflow-hidden shadow-lg" 
        style={gradientBorderStyle}
      >
        <div className="bg-[#000000] rounded-full flex h-[48px] px-4 items-center gap-[12px]">
          <div className="min-w-[160px] md:min-w-[210px] flex justify-start">
            <span className={textStyle}>
              Level {levelId}/{totalLevels} — {score.toLocaleString()} Points
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="flex h-[35px] px-[18px] items-center justify-center bg-[#202020] hover:bg-white text-white hover:text-black rounded-full transition-colors duration-200"
          >
            <span className="text-[16px] md:text-[18px] font-medium leading-[1.2] md:leading-[1.6] md:tracking-[-0.36px]">
              Reset
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FooterLeftContent;