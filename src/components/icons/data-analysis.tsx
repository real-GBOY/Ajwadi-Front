/** @format */

import React from 'react';

interface DataAnalysisIconProps {
  size?: number;
  active?: boolean;
  isRTL?: boolean;
  className?: string;
}

const DataAnalysis: React.FC<DataAnalysisIconProps> = ({
  size = 24,
  active = false,
  className = '',
}) => {
  const fillColor = active ? '#2563EB' : '#1C274C';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      {/* Axes */}
      <path
        d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5C20 5.55228 19.5523 6 19 6H6V19C6 19.5523 5.55228 20 5 20C4.44772 20 4 19.5523 4 19V5Z"
        fill={fillColor}
        fillOpacity="0.15"
      />

      {/* Bars */}
      <rect x="8" y="11" width="2.5" height="6" rx="1" fill={fillColor} />
      <rect x="11.75" y="9" width="2.5" height="8" rx="1" fill={fillColor} />
      <rect x="15.5" y="7" width="2.5" height="10" rx="1" fill={fillColor} />

      {/* Line chart overlay */}
      <path
        d="M7.5 9.5L10.5 7L13 9L16.5 6L18 7.5"
        stroke={fillColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default DataAnalysis;

