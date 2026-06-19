import React from 'react';
import { Box } from '@mui/material';

/**
 * ECG Wave Animation Component
 * Renders animated ECG waveform for navbar and auth pages
 */
const ECGWave = ({ variant = 'navbar', className = '' }) => {
  if (variant === 'navbar') {
    return (
      <Box
        className={`ecg-wave-navbar ${className}`}
        component="svg"
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.28,
        }}
      >
        <defs>
          <style>{`
            @keyframes ecg-flow {
              0% { stroke-dashoffset: 2000; }
              100% { stroke-dashoffset: 0; }
            }
            .ecg-line-navbar {
              fill: none;
              stroke: rgba(255, 255, 255, 0.4);
              stroke-width: 2;
              stroke-linecap: round;
              stroke-dasharray: 2000;
              animation: ecg-flow 12s linear infinite;
            }
          `}</style>
        </defs>
        <path
          d="M0,40 L50,40 L60,30 L70,50 L80,40 L130,40 L140,35 L150,45 L160,40 L200,40 L210,15 L220,65 L230,40 L280,40 L290,32 L300,48 L310,40 L360,40 L370,28 L380,52 L390,40 L440,40 L450,35 L460,45 L470,40 L520,40 L530,20 L540,60 L550,40 L600,40 L610,33 L620,47 L630,40 L680,40 L690,30 L700,50 L710,40 L760,40 L770,35 L780,45 L790,40 L840,40 L850,25 L860,55 L870,40 L920,40 L930,32 L940,48 L950,40 L1000,40 L1010,30 L1020,50 L1030,40 L1080,40 L1090,35 L1100,45 L1110,40 L1160,40 L1170,20 L1180,60 L1200,40"
          className="ecg-line-navbar"
        />
      </Box>
    );
  }

  // Auth pages variant (v1-v6)
  return (
    <Box
      className={`ecg-wave-auth ${className}`}
      component="svg"
      viewBox="0 0 1400 120"
      preserveAspectRatio="none"
      sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        left: 0,
        top: 0,
      }}
    >
      <defs>
        <style>{`
          @keyframes ecg-auth-flow {
            0% { stroke-dashoffset: 2400; }
            100% { stroke-dashoffset: 0; }
          }
          .ecg-line-auth {
            fill: none;
            stroke-width: 1.5;
            stroke-linecap: round;
            stroke-dasharray: 2400;
          }
          .ecg-line-v1 {
            stroke: rgba(255, 255, 255, 0.24);
            animation: ecg-auth-flow 8s linear infinite;
          }
          .ecg-line-v2 {
            stroke: rgba(255, 255, 255, 0.20);
            animation: ecg-auth-flow 10s linear infinite;
          }
          .ecg-line-v3 {
            stroke: rgba(255, 255, 255, 0.18);
            animation: ecg-auth-flow 9s linear infinite;
          }
          .ecg-line-v4 {
            stroke: rgba(255, 255, 255, 0.16);
            animation: ecg-auth-flow 11s linear infinite;
          }
          .ecg-line-v5 {
            stroke: rgba(255, 255, 255, 0.14);
            animation: ecg-auth-flow 12s linear infinite;
          }
          .ecg-line-v6 {
            stroke: rgba(255, 255, 255, 0.12);
            animation: ecg-auth-flow 13s linear infinite;
          }
        `}</style>
      </defs>

      {/* V1 */}
      <path
        d="M0,20 L40,20 L50,12 L60,28 L70,20 L110,20 L120,16 L130,24 L140,20 L180,20 L190,8 L200,32 L210,20 L250,20 L260,18 L270,22 L280,20 L320,20 L330,12 L340,28 L350,20 L1400,20"
        className="ecg-line-auth ecg-line-v1"
      />

      {/* V2 */}
      <path
        d="M0,35 L40,35 L50,28 L60,42 L70,35 L110,35 L120,32 L130,38 L140,35 L180,35 L190,24 L200,46 L210,35 L250,35 L260,33 L270,37 L280,35 L320,35 L330,28 L340,42 L350,35 L1400,35"
        className="ecg-line-auth ecg-line-v2"
      />

      {/* V3 */}
      <path
        d="M0,50 L40,50 L50,44 L60,56 L70,50 L110,50 L120,47 L130,53 L140,50 L180,50 L190,39 L200,61 L210,50 L250,50 L260,48 L270,52 L280,50 L320,50 L330,44 L340,56 L350,50 L1400,50"
        className="ecg-line-auth ecg-line-v3"
      />

      {/* V4 */}
      <path
        d="M0,65 L40,65 L50,59 L60,71 L70,65 L110,65 L120,62 L130,68 L140,65 L180,65 L190,54 L200,76 L210,65 L250,65 L260,63 L270,67 L280,65 L320,65 L330,59 L340,71 L350,65 L1400,65"
        className="ecg-line-auth ecg-line-v4"
      />

      {/* V5 */}
      <path
        d="M0,80 L40,80 L50,74 L60,86 L70,80 L110,80 L120,77 L130,83 L140,80 L180,80 L190,69 L200,91 L210,80 L250,80 L260,78 L270,82 L280,80 L320,80 L330,74 L340,86 L350,80 L1400,80"
        className="ecg-line-auth ecg-line-v5"
      />

      {/* V6 */}
      <path
        d="M0,95 L40,95 L50,90 L60,100 L70,95 L110,95 L120,92 L130,98 L140,95 L180,95 L190,85 L200,105 L210,95 L250,95 L260,93 L270,97 L280,95 L320,95 L330,90 L340,100 L350,95 L1400,95"
        className="ecg-line-auth ecg-line-v6"
      />
    </Box>
  );
};

export default ECGWave;
