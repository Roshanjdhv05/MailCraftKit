import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { generateTickerGif, SlideData } from '../services/gif.service.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

/**
 * POST /api/gif/generate
 * Accepts ticker slide data and returns an animated GIF as a public URL
 * or as a base64 data URI (fallback if Supabase is not configured).
 *
 * Request body:
 * {
 *   slides: Array<{ imgSrc?, title?, desc?, btnText?, btnColor?, titleColor?, textColor? }>,
 *   animationSpeed?: string,   // e.g. '20s'
 *   backgroundColor?: string,  // hex
 *   width?: number,
 *   height?: number,
 * }
 */
export const generateGif = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'anonymous';

  const {
    slides,
    animationSpeed,
    backgroundColor,
    width,
    height,
  } = req.body as {
    slides: SlideData[];
    animationSpeed?: string;
    backgroundColor?: string;
    width?: number;
    height?: number;
  };

  if (!slides || !Array.isArray(slides) || slides.length === 0) {
    res.status(400).json({ success: false, message: 'slides array is required and must not be empty' });
    return;
  }

  try {
    const gifBuffer = await generateTickerGif({
      slides,
      animationSpeed,
      backgroundColor,
      width,
      height,
    });

    // Try to upload to Supabase Storage for a persistent public URL
    if (isSupabaseConfigured()) {
      const fileName = `ticker_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.gif`;
      const storagePath = `${userId}/gifs/${fileName}`;

      const { error: uploadErr } = await supabaseAdmin.storage
        .from('email-assets')
        .upload(storagePath, gifBuffer, {
          contentType: 'image/gif',
          upsert: true,
        });

      if (!uploadErr) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from('email-assets')
          .getPublicUrl(storagePath);

        res.json({
          success: true,
          data: {
            url: publicUrlData.publicUrl,
            storagePath,
            type: 'supabase',
          },
        });
        return;
      }

      console.warn('[GIF Controller] Supabase upload failed, falling back to base64:', uploadErr);
    }

    // Fallback: return as base64 data URI (works in any email client that can display remote images)
    const base64 = gifBuffer.toString('base64');
    const dataUri = `data:image/gif;base64,${base64}`;

    res.json({
      success: true,
      data: {
        url: dataUri,
        type: 'base64',
      },
    });
  } catch (err: any) {
    console.error('[GIF Controller Error]:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to generate GIF' });
  }
};
