import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { resumeRepository } from '../repositories/resumeRepository';
import { GoogleGenAI } from '@google/genai';

const router = Router();
router.use(authenticate);

router.get('/match', async (req, res) => {
  try {
    const resume = await resumeRepository.findActiveByUserId(req.user.id);
    if (!resume) {
      return res.json({ success: true, data: [] });
    }

    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Based on the following resume parsed content, generate 3 highly relevant job postings that would be a great match for this candidate.
      Return ONLY a raw JSON response (without markdown) with this schema:
      [{ "id": string, "title": string, "company": string, "matchScore": number (0-100), "location": string, "type": "Full-time" | "Contract", "salary": string, "requirements": [string], "whyMatch": string }]
      
      Resume content:
      ${JSON.stringify(resume.parsedContent)}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      if (response.text) {
        return res.json({ success: true, data: JSON.parse(response.text) });
      }
    }
    
    // Fallback if no Gemini key
    res.json({ success: true, data: [
      { id: '1', title: 'Software Engineer', company: 'Tech Giants Inc.', matchScore: 92, location: 'San Francisco, CA', type: 'Full-time', salary: '$120k - $160k', requirements: resume.parsedContent.skills.slice(0, 3), whyMatch: 'Your skills perfectly align with our core stack.' }
    ] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
