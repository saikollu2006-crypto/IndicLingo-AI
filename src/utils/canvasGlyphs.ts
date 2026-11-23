import * as THREE from 'three';
import { SUPPORTED_LANGUAGES } from './languages';

const textureCache = new Map<string, THREE.CanvasTexture>();

export interface GlyphTextureOptions {
  char: string;
  langCode?: string;
  color?: string;
  glowColor?: string;
  fontSize?: number;
  isCenterpiece?: boolean;
}

/**
 * Creates high-fidelity canvas textures for Indian & Latin characters
 * styled in the Dark Botanical Luxury Gold palette (#654922, #956E2F, #B68B4B, #4D574E, #303531, #202221)
 * with sharp ivory typography (#F4EFE6).
 */
export function createGlyphTexture(options: GlyphTextureOptions): THREE.CanvasTexture {
  const {
    char,
    langCode = 'en',
    color = '#F4EFE6',
    glowColor = '#B68B4B',
    fontSize = 110,
    isCenterpiece = false,
  } = options;

  const cacheKey = `${char}_${langCode}_${color}_${glowColor}_${fontSize}_${isCenterpiece}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  const size = isCenterpiece ? 512 : 256;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  ctx.clearRect(0, 0, size, size);

  const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
  const fontFamily = langObj ? langObj.fontFamily : 'Inter, sans-serif';

  const centerX = size / 2;
  const centerY = size / 2;

  // Delicate radial aura in warm honey gold & bronze
  const radialGlow = ctx.createRadialGradient(
    centerX,
    centerY,
    5,
    centerX,
    centerY,
    size * 0.45
  );
  radialGlow.addColorStop(0, 'rgba(182, 139, 75, 0.45)');
  radialGlow.addColorStop(0.5, 'rgba(101, 73, 34, 0.20)');
  radialGlow.addColorStop(1, 'transparent');

  ctx.fillStyle = radialGlow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Typography settings
  const actualFontSize = isCenterpiece ? fontSize * 1.5 : fontSize;
  ctx.font = `600 ${actualFontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Glow shadow pass: Warm Honey Gold aura
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = isCenterpiece ? 28 : 16;
  ctx.fillStyle = glowColor;
  ctx.fillText(char, centerX, centerY);

  // Sharp top pass: Crisp Ivory core
  ctx.shadowBlur = 5;
  ctx.fillStyle = color;
  ctx.fillText(char, centerX, centerY);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  textureCache.set(cacheKey, texture);

  return texture;
}

/**
 * Creates radial light ray texture styled in Warm Honey Gold, Antique Gold & Ivory
 */
export function createLightRayTexture(): THREE.CanvasTexture {
  const cacheKey = '__light_ray_luxury_gold__';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, 'rgba(101, 73, 34, 0)');
    grad.addColorStop(0.25, 'rgba(149, 110, 47, 0.40)');
    grad.addColorStop(0.5, 'rgba(244, 239, 230, 0.98)');
    grad.addColorStop(0.75, 'rgba(182, 139, 75, 0.55)');
    grad.addColorStop(1, 'rgba(32, 34, 33, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(64, 0);
    ctx.lineTo(70, 256);
    ctx.lineTo(65, 512);
    ctx.lineTo(63, 512);
    ctx.lineTo(58, 256);
    ctx.closePath();
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates central singularity core glow texture transitioning from Ivory to Honey Gold to Bronze to Obsidian
 */
export function createSingularityCoreTexture(): THREE.CanvasTexture {
  const cacheKey = '__singularity_core_luxury_gold__';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    grad.addColorStop(0, 'rgba(244, 239, 230, 1)'); // Crisp Ivory #F4EFE6
    grad.addColorStop(0.2, 'rgba(182, 139, 75, 0.85)'); // Warm Honey Gold #B68B4B
    grad.addColorStop(0.5, 'rgba(149, 110, 47, 0.55)'); // Antique Gold #956E2F
    grad.addColorStop(0.8, 'rgba(101, 73, 34, 0.30)'); // Deep Bronze #654922
    grad.addColorStop(1, 'rgba(32, 34, 33, 0)'); // Nocturnal Obsidian #202221

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  textureCache.set(cacheKey, texture);
  return texture;
}
