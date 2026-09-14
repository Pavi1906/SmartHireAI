import { Request, Response } from 'express';
import { resumeService } from '../services/resumeService';

export const resumeController = {
  async upload(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const fileMetadata = req.body; // In a real app, use multer and req.file
      
      const resume = await resumeService.processUpload(userId, fileMetadata);
      
      console.log('\n[RESUME DEBUG - UPLOAD]');
      console.log('authenticatedUserId =', userId);
      console.log('resumeOwnerId =', resume.userId);
      console.log('resumeId =', resume.id);
      console.log('\n');
      res.json({ success: true, data: resume });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  
  async getActive(req: Request, res: Response) {
    try {
      const resume = await resumeService.getActiveResume(req.user.id);
      
      console.log('\n[RESUME DEBUG]');
      console.log('authenticatedUserId =', req.user.id);
      console.log('requestedUserId =', req.user.id);
      console.log('resumeOwnerId =', resume ? resume.userId : 'none');
      console.log('resumeId =', resume ? resume.id : 'none');
      console.log('\n');
      res.json({ success: true, data: resume });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};
