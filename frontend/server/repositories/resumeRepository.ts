const resumes: Map<string, any> = new Map();

export const resumeRepository = {
  async save(userId: string, resumeData: any) {
    if (!resumes.has(userId)) {
      resumes.set(userId, []);
    }
    const userResumes = resumes.get(userId);
    userResumes.push(resumeData);
    return resumeData;
  },

  async findActiveByUserId(userId: string) {
    const userResumes = resumes.get(userId) || [];
    return userResumes[userResumes.length - 1] || null; // Return latest
  },
  
  async findAllByUserId(userId: string) {
    return resumes.get(userId) || [];
  }
};
