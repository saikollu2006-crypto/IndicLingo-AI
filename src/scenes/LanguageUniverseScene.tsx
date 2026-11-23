import React, { Suspense, useState, useEffect } from 'react';
import { CosmicSingularityUniverse } from './CosmicSingularityUniverse';

export const LanguageUniverseScene: React.FC = () => {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#4D574E]/30 via-[#303531]/20 to-[#202221] pointer-events-none" />
    );
  }

  return (
    <div className="absolute inset-0 z-0">
      <Suspense
        fallback={
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-[#B68B4B]/30 border-t-[#B68B4B] animate-spin" />
          </div>
        }
      >
        <CosmicSingularityUniverse
          interactive={true}
          intensity={1.05}
          speedMultiplier={0.85}
          cameraZ={6.0}
          glyphCount={32}
          variant="hero"
        />
      </Suspense>
    </div>
  );
};
