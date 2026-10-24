import pytest
from app.application.services.matching_service import MatchingService

def test_all_required_skills_match():
    candidate_skills = ["React", "TypeScript", "Node.js", "PostgreSQL", "GraphQL", "AWS"]
    required_skills = ["React", "TypeScript", "Node.js"]
    preferred_skills = ["Docker", "Kubernetes"]

    score, confidence, matched, missing, rec, breakdown = MatchingService.calculate_deterministic_match(
        candidate_skills=candidate_skills,
        required_skills=required_skills,
        preferred_skills=preferred_skills,
        experience_count=2,
        job_title="Senior Engineer"
    )

    assert score >= 80.0
    assert "React" in matched
    assert "TypeScript" in matched
    assert len(missing) == 0
    assert "Strong profile match" in rec

def test_partial_required_match():
    candidate_skills = ["React", "CSS"]
    required_skills = ["React", "TypeScript", "Node.js"]
    preferred_skills = []

    score, confidence, matched, missing, rec, breakdown = MatchingService.calculate_deterministic_match(
        candidate_skills=candidate_skills,
        required_skills=required_skills,
        preferred_skills=preferred_skills,
        experience_count=1,
        job_title="Frontend Engineer"
    )

    assert score < 80.0
    assert "TypeScript" in missing
    assert "Node.js" in missing
    assert "Partial match" in rec

def test_case_normalization_and_substring_match():
    candidate_skills = ["react.js", "TYPESCRIPT", "Postgres"]
    required_skills = ["React", "TypeScript", "PostgreSQL"]

    score, confidence, matched, missing, rec, breakdown = MatchingService.calculate_deterministic_match(
        candidate_skills=candidate_skills,
        required_skills=required_skills,
        preferred_skills=[],
        experience_count=1,
        job_title="Developer"
    )

    assert score == 80.0
    assert len(missing) == 0

def test_empty_candidate_skills():
    score, confidence, matched, missing, rec, breakdown = MatchingService.calculate_deterministic_match(
        candidate_skills=[],
        required_skills=["Python", "FastAPI"],
        preferred_skills=[],
        experience_count=0,
        job_title="Backend Dev"
    )

    assert score == 15.0  # Min boundary
    assert len(missing) == 2
