import React, { Suspense, useState, useEffect } from 'react';
import { CosmicSingularityUniverse } from './CosmicSingularityUniverse';

export const LoginCosmicScene: React.FC = () => {
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

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#202221]">
      {hasWebGL && (
        <Suspense fallback={null}>
          <CosmicSingularityUniverse
            interactive={true}
            intensity={1.25}
            speedMultiplier={0.75}
            cameraZ={5.6}
            glyphCount={34}
            variant="login"
          />
        </Suspense>
      )}

      {/* Clean glass atmospheric vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(32,34,33,0.1)_0%,rgba(32,34,33,0.40)_60%,rgba(32,34,33,0.75)_100%)]" />
    </div>
  );
};
