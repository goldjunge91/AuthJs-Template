'use client';
import { useState } from 'react';

export default function EffectsPage() {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center bg-background text-foreground'>
      {/* 🔹 Orbitale Animation */}
      <div className='relative mt-10 flex items-center justify-center'>
        <div className='h-20 w-20 rounded-full bg-primary'></div>
        <div className='absolute h-10 w-10 animate-orbit rounded-full bg-accent'></div>
      </div>

      {/* 🔹 Caret-Blink Effekt */}
      <h1 className='mt-10 text-4xl font-bold'>
        Tailwind <span className='animate-caret-blink'>|</span> Effects
      </h1>

      {/* 🔹 Fade-In Effekt */}
      <p className='mt-4 animate-fade-in text-lg'>
        Schöne Animationen mit Tailwind CSS
      </p>

      {/* 🔹 Pulsierender Button */}
      <button
        onClick={() => setShowSidebar(true)}
        className='mt-6 animate-pulsieren rounded-lg bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105'
      >
        Sidebar Öffnen
      </button>

      {/* 🔹 Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 transform bg-card text-card-foreground shadow-lg transition-transform duration-300 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='p-6'>
          <h2 className='text-xl font-semibold'>Sidebar</h2>
          <p className='mt-2 text-muted-foreground'>Hier sind ein paar Infos</p>
          <button
            className='mt-4 w-full rounded bg-destructive px-4 py-2 text-destructive-foreground shadow-md hover:bg-destructive/80'
            onClick={() => setShowSidebar(false)}
          >
            Schließen
          </button>
        </div>
      </div>

      {/* 🔹 Overlay für den Hintergrund, wenn Sidebar offen ist */}
      {showSidebar && (
        <div
          className='fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity'
          onClick={() => setShowSidebar(false)}
        ></div>
      )}
    </div>
  );
}
