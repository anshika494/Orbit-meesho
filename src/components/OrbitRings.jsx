import React from 'react';

export default function OrbitRings({ size = 520 }) {
  return (
    <svg
      className="orbit-rings"
      width={size}
      height={size}
      viewBox="0 0 520 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse
        cx="260"
        cy="260"
        rx="240"
        ry="90"
        stroke="var(--pink)"
        strokeOpacity="0.25"
        strokeWidth="1.5"
        className="ring ring-1"
      />
      <ellipse
        cx="260"
        cy="260"
        rx="190"
        ry="150"
        stroke="var(--violet)"
        strokeOpacity="0.28"
        strokeWidth="1.5"
        className="ring ring-2"
      />
      <ellipse
        cx="260"
        cy="260"
        rx="130"
        ry="200"
        stroke="var(--cyan)"
        strokeOpacity="0.22"
        strokeWidth="1.5"
        className="ring ring-3"
      />
      <circle cx="260" cy="260" r="6" fill="var(--pink)" />
    </svg>
  );
}
