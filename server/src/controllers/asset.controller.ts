import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

export const uploadAsset = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id || 'mock-user';
  const file = req.file;

  if (!file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }

  // Validate MIME type
  const allowedMime = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
  if (!allowedMime.includes(file.mimetype)) {
    res.status(400).json({ success: false, message: 'Invalid image format. Allowed: PNG, JPG, WEBP, GIF.' });
    return;
  }

  // Validate File Size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    res.status(400).json({ success: false, message: 'Image size must be less than 5MB.' });
    return;
  }

  try {
    const safeFileName = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `${userId}/${safeFileName}`;

    if (isSupabaseConfigured()) {
      // Upload to Supabase Storage bucket 'email-assets'
      const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
        .from('email-assets')
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadErr) {
        console.warn('Supabase storage upload error, returning local url fallback:', uploadErr);
      } else {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from('email-assets')
          .getPublicUrl(storagePath);

        const publicUrl = publicUrlData.publicUrl;

        try {
          await supabaseAdmin.from('assets').insert({
            user_id: userId,
            file_name: file.originalname,
            file_path: storagePath,
            public_url: publicUrl,
            mime_type: file.mimetype,
            file_size: file.size,
          });
        } catch (dbErr) {
          // Table may not exist yet, safe fallback
        }

        res.json({
          success: true,
          data: {
            url: publicUrl,
            fileName: file.originalname,
            storagePath,
          },
        });
        return;
      }
    }

    // Local / Dev Fallback: encode as data URL or serve local path
    const base64Str = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    res.json({
      success: true,
      data: {
        url: base64Str,
        fileName: file.originalname,
        storagePath: `local/${safeFileName}`,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to upload asset' });
  }
};
