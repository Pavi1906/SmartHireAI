import re
from typing import Any, Dict, List, Optional


# ============================================================
# SKILL ALIASES & CANONICAL MAPPINGS
# ============================================================

SKILL_ALIASES: Dict[str, List[str]] = {
    "Python": [r"\bpython\b"],
    "Java": [r"\bjava\b"],
    "JavaScript": [r"\bjavascript\b", r"\bjs\b"],
    "TypeScript": [r"\btypescript\b", r"\bts\b"],
    "C++": [r"(?:^|[\s,;/\(])c\+\+(?:[\s,;/\.\)]|$)"],
    "C#": [r"(?:^|[\s,;/\(])c#(?:[\s,;/\.\)]|$)", r"\bc-sharp\b"],

    "React.js": [r"\breact(?:\.js)?\b"],
    "Angular": [r"\bangular\b"],
    "Vue": [r"\bvue(?:\.js)?\b"],
    "Node.js": [r"\bnode(?:\.js|js)\b"],
    "Express.js": [r"\bexpress(?:\.js)?\b"],

    "FastAPI": [r"\bfastapi\b"],
    "Django": [r"\bdjango\b"],
    "Flask": [r"\bflask\b"],
    "Spring Boot": [r"\bspring\s+boot\b"],

    "HTML": [r"\bhtml(?:5)?\b"],
    "CSS": [r"\bcss(?:3)?\b"],
    "Bootstrap": [r"\bbootstrap\b"],
    "Tailwind CSS": [r"\btailwind(?:\s+css)?\b"],

    "SQL": [r"\bsql\b"],
    "MySQL": [r"\bmysql\b"],
    "PostgreSQL": [
        r"\bpostgresql\b",
        r"\bpostgres\b",
    ],
    "MongoDB": [r"\bmongodb\b"],
    "Redis": [r"\bredis\b"],

    "Docker": [r"\bdocker\b"],
    "Kubernetes": [r"\bkubernetes\b", r"\bk8s\b"],

    "AWS": [
        r"\baws\b",
        r"\bamazon\s+web\s+services\b",
    ],
    "Azure": [r"\bazure\b"],
    "GCP": [
        r"\bgcp\b",
        r"\bgoogle\s+cloud(?:\s+platform)?\b",
    ],

    "Git": [r"\bgit\b"],
    "GitHub": [r"\bgithub\b"],

    "REST API": [
        r"\brest\s+api(?:s)?\b",
        r"\brestful\s+api(?:s)?\b",
    ],
    "GraphQL": [r"\bgraphql\b"],

    "Machine Learning": [
        r"\bmachine\s+learning\b",
    ],
    "Deep Learning": [
        r"\bdeep\s+learning\b",
    ],
    "Artificial Intelligence": [
        r"\bartificial\s+intelligence\b",
    ],
    "NLP": [
        r"\bnlp\b",
        r"\bnatural\s+language\s+processing\b",
    ],

    "TensorFlow": [r"\btensorflow\b"],
    "PyTorch": [r"\bpytorch\b"],

    "CNN": [
        r"\bcnn\b",
        r"\bconvolutional\s+neural\s+network(?:s)?\b",
    ],

    "MFCC": [
        r"\bmfcc\b",
        r"\bmel[-\s]frequency\s+cepstral\s+coefficients\b",
    ],

    "Scikit-learn": [
        r"\bscikit[-\s]?learn\b",
        r"\bsklearn\b",
    ],
    "Pandas": [r"\bpandas\b"],
    "NumPy": [r"\bnumpy\b"],
    "XGBoost": [r"\bxgboost\b"],
    "FAISS": [r"\bfaiss\b"],

    "Celery": [r"\bcelery\b"],
    "RabbitMQ": [r"\brabbitmq\b"],
    "Linux": [r"\blinux\b"],
    "Figma": [r"\bfigma\b"],

    "Power BI": [
        r"\bpower\s+bi\b",
    ],
    "MS Excel": [
        r"\bms\s+excel\b",
        r"\bmicrosoft\s+excel\b",
        r"\bexcel\b",
    ],
    "Tableau": [r"\btableau\b"],

    "OpenCV": [r"\bopencv\b"],

    "JWT Authentication": [
        r"\bjwt\s+authentication\b",
        r"\bjwt\b",
    ],

    "SQLAlchemy": [r"\bsqlalchemy\b"],
}


# ============================================================
# TEXT CLEANING & NORMALIZATION
# ============================================================

def _clean(text: str) -> str:
    """
    Normalize text extracted from PDF.
    Keeps line breaks, normalizes spaces and unicode dashes.
    """
    if not text:
        return ""

    text = text.replace("\xa0", " ")
    text = text.replace("—", "-").replace("–", "-")
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _normalize_for_matching(text: str) -> str:
    """Single line normalized representation for whole-document searches."""
    cleaned = _clean(text)
    return re.sub(r"\s+", " ", cleaned).strip()


# ============================================================
# SECTION PARSING UTILITIES
# ============================================================

SECTION_HEADERS = {
    "education": [
        r"education(?:al\s+qualification(?:s)?)?",
        r"academic\s+(?:background|qualifications|details)",
    ],
    "experience": [
        r"(?:work|professional)\s+experience",
        r"experience",
        r"employment(?:\s+history)?",
        r"work\s+history",
        r"internships?",
        r"professional\s+background",
    ],
    "projects": [
        r"(?:academic|personal|major|mini|key)?\s*projects?",
        r"project\s+(?:experience|work)",
    ],
    "skills": [
        r"(?:technical\s+|key\s+|core\s+)?skills",
        r"technologies(?:\s+and\s+tools)?",
        r"technical\s+expertise",
    ],
    "certifications": [
        r"certifications?",
        r"certificates?",
        r"professional\s+certifications?",
    ],
    "achievements": [
        r"achievements?",
        r"awards?(?:\s+and\s+honors)?",
        r"honors?",
        r"accomplishments?",
    ],
}

ALL_HEADER_PATTERN = re.compile(
    r"^[ \t]*(?:" + "|".join(
        p for patterns in SECTION_HEADERS.values() for p in patterns
    ) + r")(?:\s*[:\-])?[ \t]*$",
    re.IGNORECASE | re.MULTILINE
)


def extract_sections(text: str) -> Dict[str, str]:
    """
    Split resume text into semantic sections based on recognized headers.
    Returns mapping of section_name -> section_content.
    """
    lines = text.split("\n")
    sections: Dict[str, List[str]] = {}
    current_section: Optional[str] = "header"

    for raw_line in lines:
        stripped = raw_line.strip()
        if not stripped:
            continue

        matched_section = None
        for sec_name, patterns in SECTION_HEADERS.items():
            for pat in patterns:
                header_regex = rf"^(?:{pat})(?:\s*[:\-])?$"
                if re.match(header_regex, stripped, re.IGNORECASE):
                    matched_section = sec_name
                    break
            if matched_section:
                break

        if matched_section:
            current_section = matched_section
            if current_section not in sections:
                sections[current_section] = []
        else:
            if current_section:
                if current_section not in sections:
                    sections[current_section] = []
                sections[current_section].append(stripped)

    return {k: "\n".join(v) for k, v in sections.items()}


# ============================================================
# CONTACT EXTRACTION (NAME, EMAIL, PHONE)
# ============================================================

def extract_contact_info(text: str) -> Dict[str, Optional[str]]:
    """
    Extract candidate name, email, and phone number without hardcoding.
    """
    email = None
    phone = None
    name = None

    # 1. Email extraction
    email_match = re.search(
        r"\b[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+\b",
        text
    )
    if email_match:
        email = email_match.group(0).strip().rstrip(".")

    # 2. Phone extraction (international or domestic formats)
    phone_match = re.search(
        r"(?:(?:\+|00)\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}\b|"
        r"(?:\+91[\s.-]?)?[6-9]\d{9}\b",
        text
    )
    if phone_match:
        candidate_phone = phone_match.group(0).strip()
        # Avoid false positives such as 4-digit years or postal codes
        digits = re.sub(r"\D", "", candidate_phone)
        if len(digits) >= 10:
            phone = candidate_phone

    # 3. Name extraction (conservative: first plausible non-header line in top 5 lines)
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    for line in lines[:6]:
        if email and email in line:
            continue
        if phone and phone in line:
            continue
        # Skip labels, headings, or links
        if re.search(r"\b(?:resume|curriculum|vitae|page|email|phone|linkedin|github|portfolio)\b", line, re.IGNORECASE):
            continue
        if ALL_HEADER_PATTERN.match(line):
            continue
        # Candidate name: 2-4 words, alphabetic plus periods/hyphens
        words = line.split()
        if 1 <= len(words) <= 4 and all(re.match(r"^[A-Za-z.\-']+$", w) for w in words):
            name = line
            break

    return {
        "name": name,
        "email": email,
        "phone": phone
    }


# ============================================================
# SKILLS EXTRACTION
# ============================================================

def extract_skills(text: str) -> List[str]:
    """
    Extract known skills using boundary-aware regex matching.
    Ensures case-insensitivity, no isolated 'C' false-positives,
    and returns canonical deduplicated skill names.
    """
    found: List[str] = []
    matching_text = _normalize_for_matching(text)

    for canonical, patterns in SKILL_ALIASES.items():
        if any(re.search(pat, matching_text, re.IGNORECASE) for pat in patterns):
            found.append(canonical)

    return sorted(list(dict.fromkeys(found)))


# ============================================================
# DATE EXTRACTION HELPERS
# ============================================================

YEAR_REGEX = r"\b(?:19|20)\d{2}\b"

MONTH_NAMES = r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)"

DATE_RANGE_PATTERN = re.compile(
    rf"(?:{MONTH_NAMES}[\s,]+)?({YEAR_REGEX})\s*(?:-|–|to)\s*(?:(?:{MONTH_NAMES}[\s,]+)?({YEAR_REGEX})|(?:Present|Current|Ongoing))\b",
    re.IGNORECASE
)

SINGLE_YEAR_PATTERN = re.compile(YEAR_REGEX)


# ============================================================
# EDUCATION EXTRACTION
# ============================================================

DEGREE_PATTERNS = [
    (r"Master\s+of\s+Computer\s+Applications|\bMCA\b", "Master of Computer Applications"),
    (r"Bachelor\s+of\s+Computer\s+Applications|\bBCA\b", "Bachelor of Computer Applications"),
    (r"Bachelor\s+of\s+Technology|\bB\.?Tech\b", "B.Tech"),
    (r"Bachelor\s+of\s+Engineering|\bB\.?E\.?\b", "B.E."),
    (r"Master\s+of\s+Technology|\bM\.?Tech\b", "M.Tech"),
    (r"Master\s+of\s+Engineering|\bM\.?E\.?\b", "M.E."),
    (r"Bachelor\s+of\s+Science|\bB\.?Sc\b|\bB\.?S\.?\b", "B.Sc"),
    (r"Master\s+of\s+Science|\bM\.?Sc\b|\bM\.?S\.?\b", "M.Sc"),
    (r"Master\s+of\s+Business\s+Administration|\bMBA\b", "MBA"),
    (r"Bachelor\s+of\s+Business\s+Administration|\bBBA\b", "BBA"),
    (r"Bachelor\s+of\s+Commerce|\bB\.?Com\b", "B.Com"),
    (r"Bachelor\s+of\s+Arts|\bBA\b", "BA"),
    (r"Master\s+of\s+Arts|\bMA\b", "MA"),
    (r"Doctor\s+of\s+Philosophy|\bPh\.?D\.?\b", "Ph.D."),
    (r"\bDiploma\b", "Diploma"),
    (r"\bHSC\b|\b12th\b|Higher\s+Secondary", "HSC"),
    (r"\bSSC\b|\b10th\b|Secondary\s+School", "SSC"),
]

GPA_PATTERN = re.compile(
    r"\b(?:(?:CGPA|GPA)[\s:]*([0-9]+(?:\.[0-9]+)?(?:\s*/\s*10)?)|([0-9]{2}(?:\.[0-9]{1,2})?%))\b",
    re.IGNORECASE
)


def extract_education(text: str) -> List[Dict[str, Any]]:
    """
    Dynamically extract education blocks by detecting standard degrees,
    associated institutions, graduation years, and GPA/percentages.
    """
    sections = extract_sections(text)
    edu_text = sections.get("education", text)

    lines = [line.strip() for line in edu_text.split("\n") if line.strip()]
    results: List[Dict[str, Any]] = []

    i = 0
    while i < len(lines):
        line = lines[i]
        matched_degree_canon = None

        for pattern, canon_title in DEGREE_PATTERNS:
            if re.search(pattern, line, re.IGNORECASE):
                matched_degree_canon = canon_title
                break

        if matched_degree_canon:
            # Check current and next lines for institution, year, and GPA
            context_block = lines[i:i+4]
            full_context = " | ".join(context_block)

            # Year extraction
            year = None
            year_match = SINGLE_YEAR_PATTERN.search(full_context)
            if year_match:
                year = year_match.group(0)

            # GPA/Score extraction
            gpa = None
            gpa_match = GPA_PATTERN.search(full_context)
            if gpa_match:
                gpa = gpa_match.group(0)
            elif re.search(r"\bpursuing\b", full_context, re.IGNORECASE):
                gpa = "Pursuing"

            # School/University extraction
            school = None
            school_keywords = r"(?:University|College|Institute|School|Academy|Campus|Polytechnic)"
            for ctx_line in context_block:
                if re.search(school_keywords, ctx_line, re.IGNORECASE):
                    # Clean out degrees or dates if embedded on the same line
                    cleaned_school = ctx_line
                    for deg_pat, _ in DEGREE_PATTERNS:
                        cleaned_school = re.sub(deg_pat, "", cleaned_school, flags=re.IGNORECASE)
                    if year:
                        cleaned_school = cleaned_school.replace(year, "")
                    cleaned_school = re.sub(r"[,|\-–]", " ", cleaned_school).strip()
                    cleaned_school = re.sub(r"\s+", " ", cleaned_school)
                    if cleaned_school:
                        school = cleaned_school
                        break

            # Fallback if university name was on next line without explicit keyword
            if not school and len(context_block) > 1:
                next_line = context_block[1]
                if not any(re.search(p, next_line, re.IGNORECASE) for p, _ in DEGREE_PATTERNS):
                    if not SINGLE_YEAR_PATTERN.fullmatch(next_line):
                        school = next_line

            results.append({
                "degree": matched_degree_canon,
                "school": school or "",
                "year": year or "",
                "gpa": gpa or ""
            })
            i += 2
        else:
            i += 1

    return results


# ============================================================
# EXPERIENCE EXTRACTION
# ============================================================

def extract_experience(text: str) -> List[Dict[str, Any]]:
    """
    Dynamically extract professional & internship experience from text.
    Captures company, role, duration, and bullet point achievements.
    Supports single-line and multi-line role/company/duration headers.
    """
    sections = extract_sections(text)
    exp_text = sections.get("experience", "")
    if not exp_text:
        return []

    lines = [l.strip() for l in exp_text.split("\n") if l.strip()]
    results: List[Dict[str, Any]] = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        date_range_match = DATE_RANGE_PATTERN.search(line)
        single_year_match = SINGLE_YEAR_PATTERN.search(line) if not date_range_match else None
        
        has_title_keyword = bool(re.search(
            r"\b(?:engineer|developer|intern(?:ship)?|analyst|manager|lead|consultant|architect|specialist|assistant)\b",
            line,
            re.IGNORECASE
        ))

        # Check if this line is an experience entry header
        # Pattern A: Single line with date range: "Software Engineer at TechCorp 2022 - 2024"
        # Pattern B: Multi-line header: Line 1 = Role, Line 2 = Company, Line 3 = Date
        if (date_range_match or (single_year_match and has_title_keyword)) and not line.startswith(("-", "*", "•")):
            duration = date_range_match.group(0).strip() if date_range_match else single_year_match.group(0).strip()
            line_without_date = line.replace(duration, "").strip(" -–|,\t")

            parts = [p.strip() for p in re.split(r"\s+(?:at|@|,|–|-|\|)\s+", line_without_date) if p.strip()]
            role = ""
            company = ""
            if len(parts) >= 2:
                role = parts[0]
                company = parts[1]
            elif len(parts) == 1:
                if has_title_keyword:
                    role = parts[0]
                else:
                    company = parts[0]

            achievements = []
            i += 1
            while i < len(lines) and not DATE_RANGE_PATTERN.search(lines[i]):
                if lines[i].startswith(("-", "*", "•")):
                    achievements.append(lines[i].lstrip("-*• \t").strip())
                elif not any(re.search(r"\b(?:engineer|developer|intern|analyst|manager)\b", lines[i], re.IGNORECASE) and (i+1 < len(lines) and DATE_RANGE_PATTERN.search(lines[i+1]))):
                    achievements.append(lines[i])
                else:
                    break
                i += 1

            results.append({
                "company": company,
                "role": role,
                "duration": duration,
                "achievements": achievements
            })
        elif has_title_keyword and not line.startswith(("-", "*", "•")):
            # Multi-line pattern: current line is Role
            role = line
            company = ""
            duration = ""
            i += 1

            if i < len(lines) and not lines[i].startswith(("-", "*", "•")) and not DATE_RANGE_PATTERN.search(lines[i]):
                company = lines[i]
                i += 1

            if i < len(lines) and DATE_RANGE_PATTERN.search(lines[i]):
                duration = DATE_RANGE_PATTERN.search(lines[i]).group(0).strip()
                i += 1

            achievements = []
            while i < len(lines) and not bool(re.search(r"\b(?:engineer|developer|intern(?:ship)?|analyst|manager|lead|consultant)\b", lines[i], re.IGNORECASE) and not lines[i].startswith(("-", "*", "•"))):
                ach = lines[i].lstrip("-*• \t").strip()
                if ach:
                    achievements.append(ach)
                i += 1

            results.append({
                "company": company,
                "role": role,
                "duration": duration,
                "achievements": achievements
            })
        else:
            i += 1

    return results


# ============================================================
# PROJECTS EXTRACTION
# ============================================================

def extract_projects(text: str) -> List[Dict[str, Any]]:
    """
    Dynamically extract projects by identifying titles and descriptions
    under project sections without hardcoded title lists.
    """
    sections = extract_sections(text)
    proj_text = sections.get("projects", "")
    if not proj_text:
        return []

    lines = [l.strip() for l in proj_text.split("\n") if l.strip()]
    results: List[Dict[str, Any]] = []
    current_proj: Optional[Dict[str, Any]] = None

    for line in lines:
        # A project title is typically a concise header line not starting with bullets
        is_bullet = line.startswith(("-", "*", "•"))
        is_tech_line = bool(re.match(r"^(?:technologies|tools|stack|tech)\s*[:\-]", line, re.IGNORECASE))

        if not is_bullet and not is_tech_line and len(line.split()) <= 8 and not line.endswith((".", ";")):
            if current_proj:
                # Infer skills from description + title
                skills = extract_skills(f"{current_proj['name']} {current_proj['description']}")
                current_proj["technologies"] = skills
                results.append(current_proj)

            current_proj = {
                "name": line.strip(" -–|:"),
                "description": "",
                "technologies": []
            }
        elif current_proj:
            desc_line = line.lstrip("-*• \t").strip()
            if current_proj["description"]:
                current_proj["description"] += " " + desc_line
            else:
                current_proj["description"] = desc_line

    if current_proj:
        skills = extract_skills(f"{current_proj['name']} {current_proj['description']}")
        current_proj["technologies"] = skills
        results.append(current_proj)

    return results


# ============================================================
# CERTIFICATIONS EXTRACTION
# ============================================================

def extract_certifications(text: str) -> List[str]:
    """
    Extract certification names under dedicated sections or via certified keywords.
    """
    sections = extract_sections(text)
    cert_text = sections.get("certifications", "")

    found: List[str] = []
    if cert_text:
        lines = [l.strip().lstrip("-*• \t") for l in cert_text.split("\n") if l.strip()]
        for l in lines:
            if len(l) > 3:
                found.append(l)
    else:
        # Fallback: search for certificate patterns across the text
        cert_matches = re.findall(
            r"([A-Za-z0-9\s&–-]+(?:Certificate|Certification|Certified)[A-Za-z0-9\s&–-]*)",
            text,
            re.IGNORECASE
        )
        for m in cert_matches:
            cleaned = m.strip()
            if 5 < len(cleaned) < 120 and cleaned not in found:
                found.append(cleaned)

    return found


# ============================================================
# ACHIEVEMENTS EXTRACTION
# ============================================================

def extract_achievements(text: str) -> List[str]:
    """
    Extract awards, hackathons, and accomplishments under dedicated sections.
    """
    sections = extract_sections(text)
    achieve_text = sections.get("achievements", "")

    found: List[str] = []
    if achieve_text:
        lines = [l.strip().lstrip("-*• \t") for l in achieve_text.split("\n") if l.strip()]
        for l in lines:
            if len(l) > 3:
                found.append(l)
    else:
        # Fallback: search for rank/winner lines
        patterns = [
            r"Secured\s+[0-9a-zA-Z\s\(\)]+Hackathon[0-9a-zA-Z\s\(\)]*",
            r"(?:Won|Awarded|Selected)\s+[0-9a-zA-Z\s\(\)]+"
        ]
        for pat in patterns:
            matches = re.findall(pat, text, re.IGNORECASE)
            for m in matches:
                cleaned = m.strip()
                if cleaned not in found:
                    found.append(cleaned)

    return found


# ============================================================
# MAIN PARSER ENTRYPOINT
# ============================================================

def parse_resume_text(text: str) -> Dict[str, Any]:
    """
    Convert extracted resume text into SmartHireAI's
    structured resume format. Guaranteed compatible with existing consumers.
    """
    cleaned_text = _clean(text)
    contact = extract_contact_info(cleaned_text)

    return {
        "name": contact["name"],
        "email": contact["email"],
        "phone": contact["phone"],
        "skills": extract_skills(cleaned_text),
        "education": extract_education(cleaned_text),
        "experience": extract_experience(cleaned_text),
        "projects": extract_projects(cleaned_text),
        "certifications": extract_certifications(cleaned_text),
        "achievements": extract_achievements(cleaned_text),
    }
