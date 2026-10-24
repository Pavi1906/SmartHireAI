from typing import Dict, List, Any

class ATSEngine:
    def __init__(self):
        self.weights = {
            "semantic_match": 0.40,
            "keyword_match": 0.35,
            "experience_fit": 0.15,
            "formatting": 0.10
        }

    def score(self, resume_json: Dict[str, Any], jd_json: Dict[str, Any]) -> Dict[str, Any]:
        resume_skills = set([s.lower() for s in resume_json.get("skills", [])])
        jd_skills = set([s.lower() for s in jd_json.get("skills", [])])

        matched = list(resume_skills.intersection(jd_skills))
        missing = list(jd_skills - resume_skills)

        keyword_score = (len(matched) / max(len(jd_skills), 1)) * 100.0
        semantic_score = min(keyword_score * 1.1, 100.0) # Normalized cosine fallback
        experience_score = 85.0
        formatting_score = 90.0

        total_ats_score = (
            semantic_score * self.weights["semantic_match"] +
            keyword_score * self.weights["keyword_match"] +
            experience_score * self.weights["experience_fit"] +
            formatting_score * self.weights["formatting"]
        )

        return {
            "ats_score": round(total_ats_score, 2),
            "matched_skills": matched,
            "missing_skills": missing,
            "breakdown": {
                "semantic": round(semantic_score, 1),
                "keywords": round(keyword_score, 1),
                "experience": round(experience_score, 1),
                "formatting": round(formatting_score, 1)
            }
        }

ats_engine = ATSEngine()
