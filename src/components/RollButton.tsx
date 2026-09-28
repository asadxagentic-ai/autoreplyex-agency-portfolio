import React from 'react';
import { ArrowRight } from 'lucide-react';

interface RollButtonProps {
  text: string;
  variant?: 'dark' | 'orange';
  size?: 'sm' | 'md';
  onClick?: () => void;
  className?: string;
  id?: string;
}

export default function RollButton({
  text,
  variant = 'orange',
  size = 'md',
  onClick,
  className = '',
  id,
}: RollButtonProps) {
  const isDark = variant === 'dark';
  const isSm = size === 'sm';

  const baseBg = isDark
    ? 'bg-gray-900 text-white'
    : 'bg-[#F26522] hover:bg-[#e05a1a] text-white';

  const paddingClass = isSm
    ? 'pl-5 pr-2 py-2 text-[13px]'
    : 'pl-5 sm:pl-6 pr-2 py-2 text-[13px] sm:text-[14px]';

  const circleSize = isSm
    ? 'w-6 h-6'
    : 'w-7 h-7 sm:w-8 sm:h-8';

  const iconColor = isDark
    ? 'text-gray-900'
    : 'text-[#F26522]';

  const iconSize = isSm ? 12 : 14;

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={`group cursor-pointer rounded-full inline-flex items-center gap-3 sm:gap-3.5 font-medium transition-colors duration-300 ${baseBg} ${paddingClass} ${className}`}
    >
      {/* Hover Text Roll Animation */}
      <div className="h-[20px] overflow-hidden flex flex-col justify-start">
        <span className="transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-full inline-block leading-[20px] whitespace-nowrap">
          {text}
        </span>
        <span className="transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-full inline-block leading-[20px] whitespace-nowrap">
          {text}
        </span>
      </div>

      {/* Arrow in Circle that rotates -45deg on hover */}
      <div
        className={`${circleSize} rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm`}
      >
        <ArrowRight
          size={iconSize}
          className={`${iconColor} transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45`}
        />
      </div>
    </button>
  );
}
