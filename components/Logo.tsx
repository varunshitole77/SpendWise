'use client';

import React from 'react';

export default function Logo({
  className = 'h-9 w-9',
  title = 'SpendWise',
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <defs>
        {/* Deep black base */}
        <radialGradient id="bg" cx="30%" cy="25%" r="80%">
          <stop offset="0" stopColor="#1a1a1a" />
          <stop offset="0.55" stopColor="#0b0b0b" />
          <stop offset="1" stopColor="#050505" />
        </radialGradient>

        {/* Emerald + teal 3D gradient for the S */}
        <linearGradient id="sGrad" x1="14" y1="10" x2="52" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5eead4" />
          <stop offset="0.35" stopColor="#34d399" />
          <stop offset="0.7" stopColor="#10b981" />
          <stop offset="1" stopColor="#0ea5e9" stopOpacity="0.15" />
        </linearGradient>

        {/* Subtle highlight */}
        <linearGradient id="shine" x1="18" y1="14" x2="40" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.30" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.10" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Outer glow */}
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feColorMatrix
            in="b"
            type="matrix"
            values="
              0 0 0 0 0.10
              0 0 0 0 0.85
              0 0 0 0 0.55
              0 0 0 0.55 0"
            result="g"
          />
          <feMerge>
            <feMergeNode in="g" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Soft shadow */}
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000" floodOpacity="0.55" />
          <feDropShadow dx="0" dy="2" stdDeviation="2.2" floodColor="#000" floodOpacity="0.6" />
        </filter>

        {/* Inner bevel */}
        <filter id="bevel" x="-30%" y="-30%" width="160%" height="160%">
          <feOffset dx="0" dy="1" />
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feComposite in="blur" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="inner" />
          <feColorMatrix
            in="inner"
            type="matrix"
            values="
              0 0 0 0 0
              0 0 0 0 0
              0 0 0 0 0
              0 0 0 0.55 0"
          />
          <feComposite in2="SourceGraphic" operator="over" />
        </filter>
      </defs>

      {/* Rounded square base */}
      <rect x="6.5" y="6.5" width="51" height="51" rx="16" fill="url(#bg)" filter="url(#shadow)" />
      <rect x="6.5" y="6.5" width="51" height="51" rx="16" fill="none" stroke="#ffffff" strokeOpacity="0.06" />

      {/* Top-left shine on base */}
      <path
        d="M14 18c5-7 14-9 22-6 1 .4.8 1.8-.3 2-7.8 1.4-14 5.2-17.8 11.5-.7 1.1-2.4.6-2.4-.8V18Z"
        fill="url(#shine)"
        opacity="0.9"
      />

      {/* Big 3D S mark */}
      <g filter="url(#glow)">
        {/* Back stroke for depth */}
        <path
          d="M42.5 22.2c-1.6-5.2-6.7-8.2-13.1-8.2-7.3 0-12.4 3.6-12.4 9.1 0 5.1 4.2 7.2 10.7 8.4l3.2.6c4.1.8 5.9 1.8 5.9 3.9 0 2.4-2.4 3.9-6 3.9-3.9 0-6.4-1.3-7.2-4.2"
          fill="none"
          stroke="#0b0b0b"
          strokeOpacity="0.9"
          strokeWidth="7.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(1.2,1.4)"
        />

        {/* Main stroke */}
        <path
          d="M42.5 22.2c-1.6-5.2-6.7-8.2-13.1-8.2-7.3 0-12.4 3.6-12.4 9.1 0 5.1 4.2 7.2 10.7 8.4l3.2.6c4.1.8 5.9 1.8 5.9 3.9 0 2.4-2.4 3.9-6 3.9-3.9 0-6.4-1.3-7.2-4.2"
          fill="none"
          stroke="url(#sGrad)"
          strokeWidth="7.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#bevel)"
        />

        {/* Thin highlight stroke */}
        <path
          d="M41.8 22.7c-1.6-4.4-6-6.9-12.1-6.9-6.5 0-10.8 3-10.8 7.3 0 4 3.6 5.6 9.4 6.7l3 .6c5 1 7.4 2.6 7.4 6 0 3.7-3.5 6.1-8.6 6.1-4.8 0-8.2-1.6-9.2-5"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.18"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
