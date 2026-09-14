import { resumeRepository } from '../repositories/resumeRepository';
import { GoogleGenAI } from '@google/genai';

export const resumeService = {
  async processUpload(userId: string, fileMetadata: any) {
    let score = 75;
    let skills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'];
    let experience = [{ title: 'Software Engineer', company: 'Tech Corp', years: 3 }];
    let education = [{ degree: 'B.S. Computer Science', university: 'State University' }];
    let aiFeedback = "Good overall structure. Add more quantifiable metrics.";

    if (process.env.GEMINI_API_KEY && fileMetadata.fileData) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const base64Data = fileMetadata.fileData.split(',')[1];
        
        let filePart;
        if (fileMetadata.type === 'application/pdf') {
          filePart = { inlineData: { data: base64Data, mimeType: 'application/pdf' } };
        } else if (fileMetadata.type.startsWith('image/')) {
          filePart = { inlineData: { data: base64Data, mimeType: fileMetadata.type } };
        } else if (fileMetadata.type === 'text/plain') {
          const text = Buffer.from(base64Data, 'base64').toString('utf-8');
          filePart = text;
        }
        
        if (filePart) {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
              "You are an expert technical recruiter and resume ATS parsing system. Analyze this resume.",
              "Return ONLY a raw JSON response (without markdown wrapping) with this exact schema:",
              "{ \"score\": number (0-100), \"skills\": [string], \"experience\": [{ \"title\": string, \"company\": string, \"years\": number }], \"education\": [{ \"degree\": string, \"university\": string }], \"aiFeedback\": string (constructive feedback on how to improve) }",
              filePart
            ],
            config: {
              responseMimeType: "application/json",
            }
          });
          
          if (response.text) {
             const parsed = JSON.parse(response.text);
             score = parsed.score || 75;
             skills = parsed.skills || skills;
             experience = parsed.experience || experience;
             education = parsed.education || education;
             aiFeedback = parsed.aiFeedback || aiFeedback;
          }
        }
      } catch (error) {
        console.error("Gemini processing failed:", error);
      }
    }

    const version = (await resumeRepository.findAllByUserId(userId)).length + 1;
    
    const resume = {
      id: `res_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      name: fileMetadata.name,
      size: fileMetadata.size,
      type: fileMetadata.type,
      version,
      score,
      uploadDate: new Date().toISOString(),
      parsedContent: {
        skills,
        experience,
        education,
        aiFeedback
      }
    };
    
    return await resumeRepository.save(userId, resume);
  },
  
  async getActiveResume(userId: string) {
    return await resumeRepository.findActiveByUserId(userId);
  }
};
