import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { resumeRepository } from '../repositories/resumeRepository';
import { GoogleGenAI } from '@google/genai';

const router = Router();
router.use(authenticate);

router.get('/readiness', async (req, res) => {
  try {
    const resume = await resumeRepository.findActiveByUserId(req.user.id);
    if (!resume) {
      return res.json({ success: true, data: [] });
    }

    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Based on the following resume parsed content, evaluate the candidate's readiness for 3 top tech companies (e.g., Google, Stripe, Meta).
      Return ONLY a raw JSON response (without markdown) with this schema:
      [{ "name": string, "overallScore": number (0-100), "logo": string (single character emoji or icon name), "categories": [{ "name": string, "score": number }] }]
      Categories must include: "Algorithms", "System Design", "Frameworks", "Culture Fit".
      
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
      { name: 'Google', overallScore: 85, logo: 'G', categories: [{ name: 'Algorithms', score: 80 }, { name: 'System Design', score: 75 }] }
    ] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
