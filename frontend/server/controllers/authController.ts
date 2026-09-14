import { Request, Response } from 'express';
import { authService } from '../services/authService';

export const authController = {
  async login(req: Request, res: Response) {
    try {
      const { email, password, role } = req.body;
      
      if (!email || !password || !role) {
        return res.status(400).json({ error: 'Missing credentials or role' });
      }

      const result = await authService.authenticate(email, role);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(401).json({ success: false, error: error.message });
    }
  },
  
  async me(req: Request, res: Response) {
    res.json({ success: true, data: { user: req.user } });
  }
};
