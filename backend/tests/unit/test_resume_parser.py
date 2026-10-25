import pytest
from app.application.services.resume_parser import parse_resume_text, extract_skills


def test_generic_bca_resume():
    text = """John Doe
john@example.com
+91 9876543210

Education
Bachelor of Computer Applications
XYZ University
2024

Skills
Python, FastAPI, React, PostgreSQL

Projects
Inventory Management System
Built a web application using React and Node.js.

Experience
Software Engineer
TechCorp
2022 - 2024
Developed microservices using Python and FastAPI.
"""
    parsed = parse_resume_text(text)
    assert "Software Engineer" in parsed["text"]
    assert parsed["name"] == "John Doe"
    assert parsed["email"] == "john@example.com"
    assert parsed["phone"] == "+91 9876543210"

    assert len(parsed["education"]) >= 1
    edu = parsed["education"][0]
    assert edu["degree"] == "Bachelor of Computer Applications"
    assert "XYZ University" in edu["school"]
    assert edu["year"] == "2024"

    assert len(parsed["projects"]) >= 1
    proj = parsed["projects"][0]
    assert "Inventory Management System" in proj["name"]
    assert "React" in proj["description"] or "Node.js" in proj["description"]

    assert len(parsed["experience"]) >= 1
    exp = parsed["experience"][0]
    assert "TechCorp" in exp["company"] or "TechCorp" in exp["role"]
    assert "Software Engineer" in exp["role"] or "Software Engineer" in exp["company"]
    assert "2022" in exp["duration"] and "2024" in exp["duration"]

    skills = parsed["skills"]
    assert "Python" in skills
    assert "FastAPI" in skills
    assert "React.js" in skills
    assert "PostgreSQL" in skills


def test_different_candidate():
    text = """Alice Wonder
alice.wonder@techgiant.org
+1 555-432-1098

Academic Background
Bachelor of Science
Pacific State University
2021

Professional Experience
Data Analyst at Metro Analytics
2021 - 2023
Analyzed business performance metrics using SQL and Tableau.

Key Projects
Sales Forecast Model
Developed machine learning models using Scikit-learn and Pandas.
"""
    parsed = parse_resume_text(text)
    assert parsed["name"] == "Alice Wonder"
    assert parsed["email"] == "alice.wonder@techgiant.org"
    assert parsed["phone"] == "+1 555-432-1098"

    assert len(parsed["education"]) >= 1
    edu = parsed["education"][0]
    assert edu["degree"] == "B.Sc"
    assert "Pacific State University" in edu["school"]
    assert edu["year"] == "2021"

    assert len(parsed["experience"]) >= 1
    exp = parsed["experience"][0]
    assert "Metro Analytics" in exp["company"] or "Metro Analytics" in exp["role"]
    assert "2021" in exp["duration"] and "2023" in exp["duration"]

    assert len(parsed["projects"]) >= 1
    proj = parsed["projects"][0]
    assert "Sales Forecast Model" in proj["name"]

    skills = parsed["skills"]
    assert "SQL" in skills
    assert "Tableau" in skills
    assert "Machine Learning" in skills
    assert "Scikit-learn" in skills


def test_btech_resume():
    text = """Rahul Sharma
rahul.sharma@example.in
9876543211

Education
B.Tech in Computer Science
ABC Institute of Technology
2023
CGPA: 8.9 / 10
"""
    parsed = parse_resume_text(text)
    assert len(parsed["education"]) == 1
    edu = parsed["education"][0]
    assert edu["degree"] == "B.Tech"
    assert "ABC Institute of Technology" in edu["school"]
    assert edu["year"] == "2023"
    assert "8.9" in edu["gpa"]


def test_mca_mtech_resume():
    text = """Priya Patel
priya.patel@academics.edu

Educational Details
Master of Computer Applications
National Institute of Technology
2022

Bachelor of Computer Applications
City Science College
2020
"""
    parsed = parse_resume_text(text)
    degrees = [e["degree"] for e in parsed["education"]]
    assert "Master of Computer Applications" in degrees
    assert "Bachelor of Computer Applications" in degrees


def test_project_variations():
    text_proj = """
Projects
Campus Transport Tracker
Real-time tracking of university shuttles using React.js and Redis.
"""
    parsed_1 = parse_resume_text(text_proj)
    assert any("Campus Transport Tracker" in p["name"] for p in parsed_1["projects"])

    text_acad = """
Academic Projects
NLP Sentiment Analyzer
Classified sentiments with PyTorch and NLP transformers.
"""
    parsed_2 = parse_resume_text(text_acad)
    assert any("NLP Sentiment Analyzer" in p["name"] for p in parsed_2["projects"])

    text_pers = """
Personal Projects
Cryptocurrency Ticker
CLI dashboard for tracking crypto prices using GoLang and Docker.
"""
    parsed_3 = parse_resume_text(text_pers)
    assert any("Cryptocurrency Ticker" in p["name"] for p in parsed_3["projects"])


def test_experience_variations():
    t1 = """
Work Experience
Frontend Engineer - Acme Global
Jan 2022 - Dec 2023
- Built client dashboard using TypeScript and Tailwind CSS.
"""
    p1 = parse_resume_text(t1)
    assert len(p1["experience"]) >= 1
    assert "Acme Global" in p1["experience"][0]["company"] or "Acme Global" in p1["experience"][0]["role"]
    assert len(p1["experience"][0]["achievements"]) >= 1

    t2 = """
Internships
AI Research Intern at DeepLab
June 2023 - Present
- Conducted deep learning experiments with CNN models.
"""
    p2 = parse_resume_text(t2)
    assert len(p2["experience"]) >= 1
    assert "DeepLab" in p2["experience"][0]["company"] or "DeepLab" in p2["experience"][0]["role"]


def test_date_ranges():
    t = """
Experience
Backend Developer at FinCorp
2021 - 2023
- Handled transactions

DevOps Engineer at CloudWorks
Jan 2023 - Present
- Managed Kubernetes clusters
"""
    p = parse_resume_text(t)
    assert len(p["experience"]) == 2
    assert "2021" in p["experience"][0]["duration"] and "2023" in p["experience"][0]["duration"]
    assert "Jan 2023" in p["experience"][1]["duration"] or "Present" in p["experience"][1]["duration"]


def test_no_fabrication():
    text = """Candidate Three
candidate3@testing.com

Education
B.Sc
Apex University
2023
"""
    parsed = parse_resume_text(text)
    schools = [e["school"] for e in parsed["education"]]
    for s in schools:
        assert "KCG College of Technology" not in s
        assert "Hindustan Institute of Technology" not in s

    companies = [exp["company"] for exp in parsed["experience"]]
    for c in companies:
        assert "Internship Studio" not in c

    proj_names = [p["name"] for p in parsed["projects"]]
    for pn in proj_names:
        assert "TaskCore FastAPI Manager" not in pn
        assert "CampusAssist" not in pn


def test_skill_boundaries():
    text = """
Candidate proficient in JavaScript, Docker, C++, and C#.
Has basic knowledge of Ruby and Rust.
"""
    skills = extract_skills(text)
    assert "C++" in skills
    assert "C#" in skills
    assert "JavaScript" in skills
    assert "Docker" in skills
    assert "C" not in skills
    assert "Python" not in skills
    assert "Java" not in skills


def test_empty_minimal_resume():
    text = """Minimal Candidate
minimal@example.com
"""
    parsed = parse_resume_text(text)
    assert parsed["name"] == "Minimal Candidate"
    assert parsed["email"] == "minimal@example.com"
    assert parsed["phone"] is None
    assert parsed["skills"] == []
    assert parsed["education"] == []
    assert parsed["experience"] == []
    assert parsed["projects"] == []
    assert parsed["certifications"] == []
    assert parsed["achievements"] == []


def test_resume_with_wrapped_education_and_out_of_order_headings():
    # Representative text extracted from a real multi-page resume PDF. The
    # education table wraps degree names, experience entries are bullet-prefixed,
    # and the PROJECTS heading appears after the project details.
    text = """PAVITHRA P
OBJECTIVE:
MCA student with internship opportunities.
NAME OF
EXAMINATION
BOARD INSTITUITION
YEAR OF
PASSING
PERCENTAGE
OF MARKS
Master of Computer
Applications
Anna
University
KCG College of
Technology
2027
Pursuing
Bachelor of Computer
Applications
Hindustan
University
Hindustan Institute
of Technology &
Science
2025 85.12 %
HSC TN State Board
Vidhya Matric
Higher
Secondary
School
2022 72.67%
SSC TN State Board
Vidhya Matric
Higher
Secondary
School
2020 87.2 %
SKILLS:
Python, TypeScript, React, FastAPI, SQL, MS Excel
• Artificial Intelligence Intern | Internship Studio Jan 2025 - Feb 2025
Built a Face Recognition System using Python, OpenCV, and MLP Neural Networks.
• Data Analytics Intern | Internship Studio Sep 2024 - Oct 2024
Analyzed datasets using Python, Pandas, SQL, and Excel.
• Web Design & Development Intern | Internship Studio Oct 2024 - Nov 2024
INTERNSHIP EXPERIENCE:
Engineered and deployed a responsive E-Commerce website using HTML, CSS, JavaScript, and Bootstrap.
CERTIFICATIONS:
Google Data Analytics Professional Certificate
ACHIEVEMENTS:
Won a university hackathon
LANGUAGES KNOWN:
English, Tamil
DECLARATION:
The information above is true.
• TaskCore FastAPI Manager | GitHub: https://github.com/Pavi1906/taskcore-fastapi-manager
Built a full-stack task management application using React, FastAPI, SQLAlchemy, JWT Authentication, and Docker.
• Hack2Hire Interview Engine | GitHub: https://github.com/Pavi1906/hack2hire-interview-engine
Created an interview simulation platform using TypeScript.
• CampusAssist | GitHub: https://github.com/Pavi1906/CampusAssist
Built a campus emergency management application using TypeScript.
• Audio Emotion Recognition System |GitHub: https://github.com/Pavi1906/audio-emotion-recognition-ml
Built an audio emotion classifier using Python, TensorFlow, CNN, and MFCC.
PROJECTS:
"""
    parsed = parse_resume_text(text)

    degrees = [entry["degree"] for entry in parsed["education"]]
    assert degrees == [
        "Master of Computer Applications",
        "Bachelor of Computer Applications",
        "HSC",
        "SSC",
    ]
    assert all(entry["degree"] != "M.Sc" for entry in parsed["education"])
    assert len(parsed["experience"]) == 3
    assert any("Artificial Intelligence Intern" in entry["role"] for entry in parsed["experience"])
    assert any("Data Analytics Intern" in entry["role"] for entry in parsed["experience"])
    assert any("Web Design & Development Intern" in entry["role"] for entry in parsed["experience"])

    project_names = [entry["name"] for entry in parsed["projects"]]
    assert project_names == [
        "TaskCore FastAPI Manager",
        "Hack2Hire Interview Engine",
        "CampusAssist",
        "Audio Emotion Recognition System",
    ]
