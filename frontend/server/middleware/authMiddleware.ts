import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  // In a real app, verify JWT here. 
  // For this environment, we'll mock token validation based on a strict secret or format.
  if (token.startsWith('mock_token_')) {
    const parts = token.split('_');
    const role = parts[parts.length - 1];
    const id = parts.slice(2, parts.length - 1).join('_');
    req.user = { id, role };
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient role permissions' });
    }
    next();
  };
};
