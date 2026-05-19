'use client';

import React, { useEffect, useState } from 'react';

export default function DynamicBackground() {
  const [bgClass, setBgClass] = useState('bg-[#0a1114]'); // Default Noche
  const [overlayClass, setOverlayClass] = useState('');

  useEffect(() => {
    const updateBackground = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeFloat = hours + minutes / 60;
      
      const month = now.getMonth(); // 0-11
      const date = now.getDate();

      // Fechas Conmemorativas Mexicanas (ejemplo simplificado)
      const isFestive = 
        (month === 8 && date === 16) || // Independencia
        (month === 10 && (date === 1 || date === 2)) || // Día de Muertos
        (month === 10 && date === 20) || // Revolución
        (month === 4 && date === 5); // Batalla de Puebla

      if (timeFloat >= 5.01 && timeFloat <= 11.5) {
        // Amanecer (5:01 am - 11:30 am)
        setBgClass('bg-gradient-to-br from-slate-900 via-indigo-950 to-rose-900/40');
        setOverlayClass('bg-[url("/noise.png")] mix-blend-overlay opacity-30');
      } else if (timeFloat > 11.5 && timeFloat <= 15.5) {
        // Día / Clima (11:31 am - 3:30 pm)
        if (isFestive) {
           // Clima Festivo (más brillante, toques dorados/magenta sutiles)
           setBgClass('bg-gradient-to-br from-cyan-950 via-slate-900 to-fuchsia-900/30');
        } else {
           setBgClass('bg-gradient-to-br from-sky-950 via-slate-900 to-slate-800');
        }
        setOverlayClass('bg-[url("/noise.png")] mix-blend-overlay opacity-20');
      } else if (timeFloat > 15.5 && timeFloat <= 19) {
        // Atardecer Mexicano (3:31 pm - 7:00 pm)
        setBgClass('bg-gradient-to-br from-slate-900 via-purple-950 to-orange-900/40');
        setOverlayClass('bg-[url("/noise.png")] mix-blend-overlay opacity-30');
      } else {
        // Noche (7:01 pm - 5:00 am)
        setBgClass('bg-[#0a1114]');
        setOverlayClass('bg-[url("/noise.png")] mix-blend-overlay opacity-10');
      }
    };

    updateBackground();
    const interval = setInterval(updateBackground, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className={`fixed inset-0 z-[-2] transition-colors duration-[3000ms] ease-in-out ${bgClass}`}></div>
      <div className={`fixed inset-0 z-[-1] pointer-events-none ${overlayClass}`}></div>
    </>
  );
}
