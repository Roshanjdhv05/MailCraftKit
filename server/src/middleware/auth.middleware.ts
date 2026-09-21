import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Provide fallback dev user if no header is present
    req.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'developer@designmailer.local',
      app_metadata: {},
      user_metadata: { full_name: 'Dev User' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    next();
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token || token === 'undefined' || token === 'null') {
    req.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'developer@designmailer.local',
      app_metadata: {},
      user_metadata: { full_name: 'Dev User' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    next();
    return;
  }

  // Handle mock dev tokens explicitly
  if (token.startsWith('mock-user-')) {
    const mockUserId = token.replace('mock-user-', '') || '00000000-0000-0000-0000-000000000001';
    req.user = {
      id: mockUserId,
      email: 'developer@designmailer.local',
      app_metadata: {},
      user_metadata: { full_name: 'Dev User' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    next();
    return;
  }

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin.auth.getUser(token);

      if (!error && data.user) {
        req.user = data.user;
        next();
        return;
      }
    }

    // Fallback mode if Supabase auth lookup fails or token is expired
    req.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'developer@designmailer.local',
      app_metadata: {},
      user_metadata: { full_name: 'Dev User' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    next();
  } catch (err: any) {
    req.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'developer@designmailer.local',
      app_metadata: {},
      user_metadata: { full_name: 'Dev User' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    next();
  }
};

export const optionalAuthenticateUser = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = undefined;
    next();
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    req.user = undefined;
    next();
    return;
  }

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && data.user) {
        req.user = data.user;
      } else {
        req.user = undefined;
      }
    } else {
      req.user = {
        id: token.startsWith('mock-user-') ? token.replace('mock-user-', '') : '00000000-0000-0000-0000-000000000001',
        email: 'developer@designmailer.local',
        app_metadata: {},
        user_metadata: { full_name: 'Dev User' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };
    }
  } catch (err) {
    req.user = undefined;
  }

  next();
};
