import React, { Suspense, useState, useEffect } from 'react';
import { CosmicSingularityUniverse } from './CosmicSingularityUniverse';

export const WorkspaceCosmicScene: React.FC = () => {
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
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-[#202221]">
      {hasWebGL && (
        <Suspense fallback={null}>
          <CosmicSingularityUniverse
            interactive={true}
            intensity={1.2}
            speedMultiplier={0.7}
            cameraZ={6.0}
            glyphCount={32}
            variant="workspace"
          />
        </Suspense>
      )}

      {/* Clean glass atmospheric scrim: crystal clear so the live 3D cosmic universe shines through the clean glass panels */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#202221]/30 via-[#202221]/45 to-[#202221]/60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(182,139,75,0.12)_0%,transparent_70%)] pointer-events-none" />
    </div>
  );
};
