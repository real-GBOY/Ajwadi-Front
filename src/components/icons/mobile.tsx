/** @format */

import React from 'react';

type Props = {
  size?: number;
  active?: boolean;
  isRTL?: boolean;
  className?: string;
};

const Mobile = ({ size = 24, active = false, isRTL = false, className = '' }: Props) => {
  const fillColor = 'currentColor';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}>
      <path
        d="M17 1.01L7 1C5.9 1 5 1.9 5 3V21C5 22.1 5.9 23 7 23H17C18.1 23 19 22.1 19 21V3C19 1.9 18.1 1.01 17 1.01ZM17 19H7V5H17V19Z"
        fill={fillColor}
      />
    </svg>
  );
};

export default React.memo(Mobile);
