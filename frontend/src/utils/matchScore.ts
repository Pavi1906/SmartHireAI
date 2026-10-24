import { Candidate, Job } from '../types/recruiter';

export interface MatchResult {
  matchScore: number;
  confidence: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendation: string;
}

/**
 * Canonical skill matching used by both the score calculation
 * and the recruiter match breakdown UI.
 */
export function skillMatches(candidateSkill: string, jobSkill: string): boolean {
  const cs = candidateSkill.trim().toLowerCase();
  const js = jobSkill.trim().toLowerCase();

  return (
    cs === js ||
    cs.includes(js) ||
    js.includes(cs)
  );
}

export function getMatchedRequiredSkills(candidate: Candidate, job: Job): string[] {
  const candidateSkills = candidate.resumeData?.skills || [];
  const requiredSkills = job.requiredSkills || [];

  return requiredSkills.filter(req =>
    candidateSkills.some(cs => skillMatches(cs, req))
  );
}

export function calculateMatchScore(candidate: Candidate, job: Job): MatchResult {
  const candidateSkills = candidate.resumeData?.skills || [];
  const requiredSkills = job.requiredSkills || [];
  const preferredSkills = job.preferredSkills || [];

  const matchedReq = requiredSkills.filter(req =>
    candidateSkills.some(cs => skillMatches(cs, req))
  );
  const missingReq = requiredSkills.filter(req => !matchedReq.includes(req));

  const matchedPref = preferredSkills.filter(pref =>
    candidateSkills.some(cs => skillMatches(cs, pref))
  );

  let baseScore = 0;
  if (requiredSkills.length > 0) {
    const reqScore = (matchedReq.length / requiredSkills.length) * 80;
    const prefScore = preferredSkills.length > 0 ? (matchedPref.length / preferredSkills.length) * 20 : (matchedPref.length > 0 ? 20 : 0);
    baseScore = Math.round(reqScore + prefScore);
  } else if (preferredSkills.length > 0) {
    baseScore = Math.round((matchedPref.length / preferredSkills.length) * 100);
  } else {
    baseScore = candidateSkills.length > 0 ? 70 : 50;
  }

  const matchScore = Math.min(100, Math.max(15, baseScore));

  // Deterministic confidence based on evidence completeness (candidate profile depth + job criteria specification)
  const candidateEvidence = Math.min(45, (candidateSkills.length || 0) * 5 + (candidate.resumeData?.experience?.length ? 15 : 0));
  const jobEvidence = Math.min(45, (requiredSkills.length * 8) + (preferredSkills.length * 4));
  const confidence = Math.min(99, Math.max(50, Math.round(10 + candidateEvidence + jobEvidence)));

  const matchedAll = [...new Set([...matchedReq, ...matchedPref])];
  const recommendation = matchScore >= 75
    ? `Strong profile match for ${job.title}. Candidate possesses key expertise in ${matchedAll.slice(0, 4).join(', ')}.`
    : `Partial match for ${job.title}. Missing key requirements including ${missingReq.slice(0, 3).join(', ')}.`;

  return {
    matchScore,
    confidence,
    matchedSkills: matchedAll,
    missingSkills: missingReq,
    recommendation
  };
}
