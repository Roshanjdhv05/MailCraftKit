import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { Jimp, loadFont } from 'jimp';
import { SANS_16_BLACK, SANS_12_BLACK, SANS_16_WHITE } from 'jimp/fonts';

export interface SlideData {
  imgSrc?: string;
  title?: string;
  desc?: string;
  btnText?: string;
  btnColor?: string;
  bgColor?: string;
  titleColor?: string;
  textColor?: string;
}

export interface GifGenerateOptions {
  slides: SlideData[];
  width?: number;
  height?: number;
  /** animation speed - '10s' | '20s' | '25s' | '40s' etc */
  animationSpeed?: string;
  /** background color of the ticker area */
  backgroundColor?: string;
}

/**
 * Returns delay per-frame in centiseconds based on animation speed string.
 */
function getFrameDelay(animationSpeed = '25s'): number {
  const secs = parseInt(animationSpeed, 10) || 25;
  return Math.max(80, Math.floor(secs * 25));
}

/**
 * Hex color string to 32-bit RGBA integer (Jimp format)
 */
function hexToJimpInt(hex: string, alpha = 255): number {
  const clean = hex.replace('#', '').padEnd(6, '0');
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return ((r & 0xff) << 24) | ((g & 0xff) << 16) | ((b & 0xff) << 8) | (alpha & 0xff);
}

/**
 * Fetches an image from URL and returns a Jimp instance resized to w x h.
 * Falls back to a light gray placeholder on failure.
 */
async function fetchSlideImage(url: string, w: number, h: number): Promise<any> {
  try {
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      const img = await Jimp.read(url);
      if (img && typeof img.cover === 'function') {
        img.cover({ w, h });
      }
      return img;
    }
  } catch (err) {
    console.warn('Failed to fetch slide image from URL:', url, err);
  }
  return new Jimp({ width: w, height: h, color: 0xd1d5dbff });
}

/**
 * Generates an animated GIF Buffer from ticker slide data.
 * Each slide is one frame. The GIF loops infinitely.
 */
export async function generateTickerGif(options: GifGenerateOptions): Promise<Buffer> {
  const {
    slides,
    width = 560,
    height = 320,
    animationSpeed = '25s',
    backgroundColor = '#f8fafc',
  } = options;

  if (!slides || slides.length === 0) {
    throw new Error('No slides provided for GIF generation');
  }

  const frameDelay = getFrameDelay(animationSpeed);
  const encoder = GIFEncoder();

  const cardPadX = 20;
  const cardPadY = 16;
  const imageAreaH = Math.floor(height * 0.52);
  const cardContentW = width - cardPadX * 2;

  // Preload fonts
  const [fontBlack16, fontBlack12, fontWhite16] = await Promise.all([
    loadFont(SANS_16_BLACK).catch(() => null),
    loadFont(SANS_12_BLACK).catch(() => null),
    loadFont(SANS_16_WHITE).catch(() => null),
  ]);

  for (const slide of slides) {
    // Create frame canvas
    const frame = new Jimp({ width, height, color: hexToJimpInt(backgroundColor) });

    // --- Card background (uses slide bgColor or theme contentBackground) ---
    const cardH = height - cardPadY * 2;
    const cardBgColor = hexToJimpInt(slide.bgColor || '#ffffff');
    const cardBg = new Jimp({ width: cardContentW, height: cardH, color: cardBgColor });
    frame.composite(cardBg, cardPadX, cardPadY);

    // --- Slide image ---
    const slideImg = await fetchSlideImage(slide.imgSrc || '', cardContentW, imageAreaH);
    frame.composite(slideImg, cardPadX, cardPadY);

    // --- Light overlay separator below image ---
    const sepBar = new Jimp({ width: cardContentW, height: 1, color: 0xe2e8f0ff });
    frame.composite(sepBar, cardPadX, cardPadY + imageAreaH);

    // --- Title ---
    const titleY = cardPadY + imageAreaH + 12;
    if (fontBlack16 && slide.title) {
      const titleText = slide.title.length > 38 ? slide.title.substring(0, 38) + '…' : slide.title;
      frame.print({ font: fontBlack16, x: cardPadX + 8, y: titleY, text: titleText });
    }

    // --- Description ---
    const descY = titleY + 22;
    if (fontBlack12 && slide.desc) {
      const descText = slide.desc.length > 72 ? slide.desc.substring(0, 72) + '…' : slide.desc;
      frame.print({ font: fontBlack12, x: cardPadX + 8, y: descY, text: descText });
    }

    // --- Button at bottom ---
    const btnH = 26;
    const btnW = 130;
    const btnY = height - cardPadY - btnH - 4;
    const btnX = cardPadX + 8;
    const btnColor = hexToJimpInt(slide.btnColor || '#2563EB');
    const btnBg = new Jimp({ width: btnW, height: btnH, color: btnColor });
    frame.composite(btnBg, btnX, btnY);
    if (fontWhite16 && slide.btnText) {
      const btnLabel = (slide.btnText || 'LEARN MORE').substring(0, 18);
      frame.print({ font: fontWhite16, x: btnX + 10, y: btnY + 4, text: btnLabel });
    }

    // --- Convert Jimp RGBA buffer to RGB for gifenc ---
    const { width: fw, height: fh, data: rgba } = frame.bitmap;
    const pixels = new Uint8ClampedArray(fw * fh * 3);
    for (let i = 0; i < fw * fh; i++) {
      pixels[i * 3]     = rgba[i * 4];     // R
      pixels[i * 3 + 1] = rgba[i * 4 + 1]; // G
      pixels[i * 3 + 2] = rgba[i * 4 + 2]; // B
    }

    // Quantize to 256-color palette
    const palette = quantize(pixels, 256);
    const index = applyPalette(pixels, palette);

    encoder.writeFrame(index, fw, fh, {
      palette,
      delay: frameDelay,
      repeat: 0, // loop forever
    });
  }

  encoder.finish();
  return Buffer.from(encoder.bytes());
}
