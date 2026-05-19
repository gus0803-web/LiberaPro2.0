import React from 'react';

// Aztec Calendar / Wheel (Planificar)
export const PlanificarIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M2 12h20" />
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <path d="M12 2a10 10 0 0 1 10 10h-5a5 5 0 0 0-5-5V2z" fill="currentColor" fillOpacity="0.2" />
    <path d="M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
    <rect x="14" y="14" width="6" height="6" rx="1" />
    <line x1="14" y1="17" x2="20" y2="17" />
    <line x1="17" y1="14" x2="17" y2="20" />
  </svg>
);

// Quetzalcoatl / Serpent Head (Exámenes)
export const ExamenesIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12h5l2-3 4 5 5-8" />
    <path d="M5 21v-4a2 2 0 012-2h10a2 2 0 012 2v4" />
    <path d="M10 3h4l2 4h-8l2-4z" />
    <circle cx="15" cy="10" r="1" />
    <circle cx="19" cy="17" r="3" />
    <path d="M18.5 19l4 3" />
    <path d="M19.5 15l3-3" />
  </svg>
);

// Stepped Pyramid with Book (Material Didáctico / Mochila)
export const MaterialIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 22h20L12 2z" />
    <path d="M12 2l4 8h-8l4-8z" />
    <path d="M6 14h12" />
    <path d="M4 18h16" />
    <path d="M12 10v12" />
    <rect x="14" y="10" width="8" height="10" rx="1" />
    <line x1="16" y1="13" x2="20" y2="13" />
    <line x1="16" y1="16" x2="20" y2="16" />
  </svg>
);

// Mochila Icon (Saved Plans)
export const MochilaIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 8a4 4 0 0 1 8 0v2h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2V8z" />
    <path d="M8 10v4" />
    <path d="M16 10v4" />
    <path d="M12 16v2" />
    <path d="M6 6h12" />
  </svg>
);

// Eagle Head (Tiempo Liberado)
export const EagleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2c3.3 0 6 2.7 6 6v3l4 4v5c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-5l4-4V8c0-3.3 2.7-6 6-6z" />
    <path d="M8 10h8" />
    <path d="M10 14h4" />
    <circle cx="9" cy="8" r="1" />
    <path d="M15 8l2-2" />
  </svg>
);
