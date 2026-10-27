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
        r"educational\s+details",
        r"academic\s+(?:background|qualifications|details)",
        r"education\s+qualification(?:s)?",
    ],
    "experience": [
        r"internship\s+experience",
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
    (r"Master\s+of\s+Science|\bM\.?\s*Sc\.?\b|\bM\.S\.?\b", "M.Sc"),
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
    """Extract education records from a normal Education section or a table.

    Some PDF extractors do not preserve table row order, and degree names may
    wrap across several lines. If no explicit Education section exists, use the
    resume's ``NAME OF EXAMINATION`` table and stop before the Skills section.
    """
    sections = extract_sections(text)
    edu_text = sections.get("education", "").strip()

    if not edu_text:
        table_marker = re.search(r"NAME\s+OF\s+EXAMINATION", text, re.IGNORECASE)
        if table_marker:
            remainder = text[table_marker.end():]
            next_section = re.search(r"(?im)^\s*SKILLS\s*:?\s*$", remainder)
            edu_text = remainder[:next_section.start()] if next_section else remainder
        else:
            # Do not search the entire resume for degree abbreviations: terms
            # such as "MS Excel" elsewhere must not become a fake M.Sc degree.
            return []

    # Bound education-table fallback before later bullet sections.
    if not sections.get("education", "").strip():
        table_marker = re.search(
            r"NAME\s+OF\s+EXAMINATION", text, re.IGNORECASE
        )
        if table_marker:
            fallback_lines = text[table_marker.start():].splitlines()
            degree_row_seen = False

            for line_index, line in enumerate(
                fallback_lines[1:], start=1
            ):
                if re.search(
                    r"\b(?:Master\s+of|Bachelor\s+of|MCA|BCA|"
                    r"HSC|SSC|SSLC|10th|12th)\b",
                    line,
                    re.IGNORECASE,
                ):
                    degree_row_seen = True

                if degree_row_seen and re.match(
                    r"^\s*[•●▪◦]\s+\S", line
                ):
                    edu_text = "\n".join(
                        fallback_lines[:line_index]
                    ).strip()
                    break

    # Normalize full degree names followed by their abbreviations.
    full_degree_aliases = [
        (r"Master\s+of\s+Computer\s+Applications", r"MCA"),
        (r"Bachelor\s+of\s+Computer\s+Applications", r"BCA"),
        (r"Bachelor\s+of\s+Technology", r"B\.?\s*Tech\.?"),
        (r"Bachelor\s+of\s+Engineering", r"B\.?\s*E\.?"),
        (r"Master\s+of\s+Technology", r"M\.?\s*Tech\.?"),
        (r"Master\s+of\s+Engineering", r"M\.?\s*E\.?"),
        (r"Bachelor\s+of\s+Science", r"B\.?\s*(?:Sc|S)\.?"),
        (r"Master\s+of\s+Science", r"M\.?\s*(?:Sc|S)\.?"),
        (r"Master\s+of\s+Business\s+Administration", r"MBA"),
        (r"Bachelor\s+of\s+Business\s+Administration", r"BBA"),
        (r"Bachelor\s+of\s+Commerce", r"B\.?\s*Com\.?"),
        (r"Bachelor\s+of\s+Arts", r"B\.?\s*A\.?"),
        (r"Master\s+of\s+Arts", r"M\.?\s*A\.?"),
        (r"Doctor\s+of\s+Philosophy", r"Ph\.?\s*D\.?"),
        (r"Secondary\s+School\s+Leaving\s+Certificate", r"SSLC"),
    ]

    for full_pattern, alias_pattern in full_degree_aliases:
        edu_text = re.sub(
            rf"({full_pattern})\s*\(\s*{alias_pattern}\s*\)",
            r"\1",
            edu_text,
            flags=re.IGNORECASE,
        )

    candidates = []
    for pattern, canonical in DEGREE_PATTERNS:
        # School names like "Higher Secondary School" must not create an extra
        # HSC/SSC record when the table already has explicit HSC/SSC labels.
        if canonical == "HSC":
            pattern = r"\bHSC\b|\b12th\b"
        elif canonical == "SSC":
            pattern = (
                r"\b(?:SSC|SSLC)\b|\b10th\b|"
                r"Secondary\s+School\s+Leaving\s+Certificate"
            )

        for match in re.finditer(pattern, edu_text, re.IGNORECASE):
            candidates.append((match.start(), match.end(), canonical))

    # Recognize common full labels not covered by the short-degree patterns.
    additional_degree_patterns = [
        (r"\bMaster\s+of\s+Computer\s+Science\b", "Master of Computer Science"),
        (r"\bHigher\s+Secondary\s+Examination\b", "HSC"),
        (r"\bSecondary\s+Examination\b", "SSC"),
    ]
    for extra_pattern, extra_canonical in additional_degree_patterns:
        for match in re.finditer(extra_pattern, edu_text, re.IGNORECASE):
            candidates.append((match.start(), match.end(), extra_canonical))

    # In some Indian resumes, the final school qualification is labeled State Board Examination.
    # Map it to SSC only when Higher Secondary Examination is also present in this education section.
    if re.search(r"\bHigher\s+Secondary\s+Examination\b", edu_text, re.IGNORECASE):
        for state_board_match in re.finditer(r"\bState\s+Board\s+Examination\b", edu_text, re.IGNORECASE):
            candidates.append((state_board_match.start(), state_board_match.end(), "SSC"))

    # Longest match first at a shared position (e.g. full degree name vs alias),
    # then keep non-overlapping records in document order.
    candidates.sort(key=lambda item: (item[0], -(item[1] - item[0])))
    distinct = []
    for candidate in candidates:
        if distinct and candidate[0] < distinct[-1][1]:
            continue
        distinct.append(candidate)

    results: List[Dict[str, Any]] = []
    institution_keywords = {
        "university", "college", "institute", "school", "academy", "campus", "polytechnic"
    }

    for index, (start, end, canonical) in enumerate(distinct):
        next_start = distinct[index + 1][0] if index + 1 < len(distinct) else len(edu_text)
        context = edu_text[end:next_start]

        # Do not let the final education record absorb metrics from later sections
        # (for example, an internship bullet saying "increasing ... by 25%").
        section_boundary = re.search(
            r"(?im)^\s*(?:TRAINING\s+EXPERIENCE|WORK\s+EXPERIENCE|"
            r"PROFESSIONAL\s+EXPERIENCE|EXPERIENCE|CORE\s+SKILLS|"
            r"TECHNICAL\s+SKILLS|SKILLS|PROJECTS|CERTIFICATIONS|"
            r"ACHIEVEMENTS|LANGUAGES(?:\s+KNOWN)?|DECLARATION|"
            r"ADDITIONAL\s+INFORMATION)\s*:?\s*$",
            context,
        )
        if section_boundary:
            context = context[:section_boundary.start()]

        date_token = (
            r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|"
            r"Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|"
            r"Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(?:19|20)\d{2}"
            r"|(?:\d{1,2}/)?(?:19|20)\d{2}"
        )
        flexible_date_range = re.search(
            rf"(?<![A-Za-z0-9])(?P<start>{date_token})\s*(?:-|–|—|to)\s*"
            rf"(?P<end>{date_token})(?![A-Za-z0-9])",
            context,
            re.IGNORECASE,
        )
        date_range_match = DATE_RANGE_PATTERN.search(context)

        if flexible_date_range:
            end_year_match = re.search(
                r"(?:19|20)\d{2}", flexible_date_range.group("end")
            )
            year = end_year_match.group(0) if end_year_match else ""
            before_year = context[:flexible_date_range.start()]
        elif date_range_match:
            year = date_range_match.group(2) or date_range_match.group(1) or ""
            before_year = context[:date_range_match.start()]
        else:
            year_match = SINGLE_YEAR_PATTERN.search(context)
            year = year_match.group(0) if year_match else ""
            before_year = (
                context[:year_match.start()] if year_match else context
            )

        # Prefer the institution following the degree when available. Some resumes
        # put the institution on the line before the degree, so fall back to that
        # local record context only when the forward text has no institution marker.
        school_text = before_year
        # Parenthesized specializations (e.g. MBA (Human Resource)) are not schools.
        school_text = re.sub(r"\([^)]*\)", " ", school_text)
        institution_marker = (
            r"\b(?:college|institute|school|academy|campus|polytechnic|university)\b"
        )
        if not re.search(institution_marker, school_text, re.IGNORECASE):
            previous_boundary = distinct[index - 1][1] if index > 0 else 0
            preceding_text = edu_text[previous_boundary:start]
            preceding_lines = [
                line.strip() for line in preceding_text.splitlines() if line.strip()
            ]
            for preceding_line in reversed(preceding_lines[-8:]):
                if (
                    re.search(institution_marker, preceding_line, re.IGNORECASE)
                    and not re.search(
                        r"\b(?:skills|experience|projects|certifications|"
                        r"achievements|education|professional summary)\b",
                        preceding_line,
                        re.IGNORECASE,
                    )
                ):
                    school_text = preceding_line
                    break

        school_text = re.sub(
            r"\([^)]*\b(?:university|board)\b[^)]*\)",
            " ",
            school_text,
            flags=re.IGNORECASE,
        )

        school_text = re.sub(
            r"\b(?:pursuing|completed|current|present|ongoing)\b",
            " ",
            school_text,
            flags=re.IGNORECASE,
        )

        school_text = re.sub(r"\|.*$", " ", school_text)

        if re.search(
            r"\b(?:college|institute|school|academy|campus|polytechnic)\b",
            school_text,
            re.IGNORECASE,
        ):
            school_text = re.sub(
                r"\b(?:[A-Za-z][A-Za-z.'&-]*\s+){0,4}(?:university|board)\b",
                " ",
                school_text,
                flags=re.IGNORECASE,
            )

        # Trim punctuation and leftover parentheses, such as the "(HSC)" label.
        school = re.sub(r"\s+", " ", school_text).strip(
            " \t\r\n,;:&|.-()[]"
        )

        gpa_context = re.sub(
            rf"(?<![A-Za-z0-9])(?:{date_token})\s*(?:-|–|—|to)\s*"
            rf"(?:{date_token})(?![A-Za-z0-9])",
            " ",
            context,
            flags=re.IGNORECASE,
        )
        gpa_context = re.sub(r"\b(?:19|20)\d{2}\b", " ", gpa_context)

        gpa = ""
        gpa_match = GPA_PATTERN.search(gpa_context)
        if gpa_match:
            gpa = gpa_match.group(0).strip()
        else:
            percentage_match = re.search(
                r"(?<!\d)\d{2,3}(?:\.\d{1,2})?\s*%", gpa_context
            )
            if percentage_match:
                gpa = percentage_match.group(0).strip()
            elif re.search(r"\bpursuing\b", gpa_context, re.IGNORECASE):
                gpa = "Pursuing"

        results.append({
            "degree": canonical,
            "school": school,
            "year": year,
            "gpa": gpa,
        })

    # For non-tabular education sections, use institution lines in document
    # order when there is exactly one clear institution line per degree record.
    # This avoids mixing specializations (e.g. Human Resource) into school names
    # and supports both institution-before-degree and institution-after-degree CVs.
    if not re.search(r"\bNAME\s+OF\s+EXAMINATION\b", text, re.IGNORECASE):
        institution_lines = []
        institution_marker = (
            r"\b(?:college|institute|school|academy|campus|polytechnic|university)\b"
        )
        for line in edu_text.splitlines():
            candidate = line.strip()
            if not candidate or re.search(r"\bboard\b", candidate, re.IGNORECASE):
                continue
            # Recognize bare HIGHER SECONDARY institution names such as 'P.S. HIGHER SECONDARY', but don't count qualification headings as schools.
            if re.search(r"\b(?:higher\s+secondary|secondary)\s+examination\b", candidate, re.IGNORECASE):
                continue
            # Recognize bare HIGHER SECONDARY institution names when the line has no 'School' token.
            if not re.search(institution_marker, candidate, re.IGNORECASE) and not re.search(r"\bhigher\s+secondary\b", candidate, re.IGNORECASE):
                continue

            candidate = re.sub(r"\|.*$", " ", candidate)
            candidate = re.sub(
                r"\([^)]*\b(?:university|board)\b[^)]*\)",
                " ",
                candidate,
                flags=re.IGNORECASE,
            )
            candidate = re.sub(r"\s+", " ", candidate).strip(" 	,;:&|.-()[]")
            if (
                re.search(institution_marker, candidate, re.IGNORECASE)
                or re.search(r"\bhigher\s+secondary\b", candidate, re.IGNORECASE)
            ):
                institution_lines.append(candidate)

        if len(institution_lines) == len(results) and results:
            for record, institution in zip(results, institution_lines):
                record["school"] = institution

    # Normalize parsed institution names after any table/line association.
    # Keep grade percentages in the grade field, not appended to institution names.
    for education_record in results:
        school_name = education_record.get("school")
        if isinstance(school_name, str):
            school_name = re.sub(
                r"\s+(?:scored|with|obtained)\s*:?[ \t]*\d{1,3}(?:\.\d{1,2})?\s*%.*$",
                "",
                school_name,
                flags=re.IGNORECASE,
            )
            # Handle list-style entries like 'MBA HR from Dhanraj Baid Jain College'.
            # Remove the qualification/specialization prefix but preserve the institution.
            school_name = re.sub(
                r'^[\s\uf0d8•*+\-]*(?:MBA|B\.?\s*Com|BBA|HSC|SSLC|SSC|Higher\s+Secondary\s+Examination|Secondary\s+Examination)\b.*?\bfrom\s+',
                "",
                school_name,
                flags=re.IGNORECASE,
            )
            school_name = re.sub(r"\s+", " ", school_name).strip(" \t,;:&|.-()[]")
            education_record["school"] = school_name

    return results

# ============================================================
# EXPERIENCE EXTRACTION
# ============================================================

def extract_experience(text: str) -> List[Dict[str, Any]]:
    """Extract dated work/internship entries even when PDF headings are reordered.

    Resume PDFs commonly place role, company, and date on one line, or put the
    date on the line after the role/company. Search dated entries across the
    whole extracted text rather than depending only on a section header.
    """
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if not lines:
        return []

    title_pattern = re.compile(
        r"\b(?:engineer|developer|intern(?:ship)?|analyst|manager|lead|consultant|"
        r"architect|specialist|assistant|designer|scientist|administrator)\b",
        re.IGNORECASE,
    )
    stop_section_pattern = re.compile(
        r"^\s*(?:certifications?|achievements?|languages?\s+known|declaration|"
        r"projects?|skills|education|objective)\s*:?\s*$",
        re.IGNORECASE,
    )

    entries = []
    seen_date_lines = set()
    for date_index, line in enumerate(lines):
        date_match = DATE_RANGE_PATTERN.search(line)
        if not date_match:
            continue

        if title_pattern.search(line):
            header_start = date_index
            header_text = line
        else:
            title_index = None
            # Support: Role / Company / Date, and Role + Company / Date.
            for previous_index in range(date_index - 1, max(-1, date_index - 3), -1):
                if title_pattern.search(lines[previous_index]):
                    title_index = previous_index
                    break
            if title_index is None:
                continue
            header_start = title_index
            if date_index - title_index == 1:
                header_text = f"{lines[title_index]} {line}"
            else:
                header_text = f"{lines[title_index]} | {lines[title_index + 1]} {line}"

        if date_index in seen_date_lines:
            continue
        seen_date_lines.add(date_index)

        header_without_date = DATE_RANGE_PATTERN.sub("", header_text, count=1)
        header_without_date = re.sub(r"^[\s•*+\-]+", "", header_without_date)
        header_without_date = re.sub(r"\s+", " ", header_without_date).strip(" \t|,-")

        if "|" in header_without_date:
            role, company = header_without_date.split("|", 1)
        else:
            parts = re.split(r"\s+(?:at|@|,|–|-)\s+", header_without_date, maxsplit=1, flags=re.IGNORECASE)
            role = parts[0] if parts else header_without_date
            company = parts[1] if len(parts) > 1 else ""

        role = role.strip(" \t•*-+,")
        company = company.strip(" \t•*-+,")
        entries.append({
            "header_start": header_start,
            "date_index": date_index,
            "company": company,
            "role": role,
            "duration": date_match.group(0).strip(),
        })

    entries.sort(key=lambda item: item["date_index"])
    results: List[Dict[str, Any]] = []
    for index, entry in enumerate(entries):
        next_header = entries[index + 1]["header_start"] if index + 1 < len(entries) else len(lines)
        end_index = next_header
        for line_index in range(entry["date_index"] + 1, min(next_header, len(lines))):
            if stop_section_pattern.match(lines[line_index]):
                end_index = line_index
                break

        achievements = []
        for raw_line in lines[entry["date_index"] + 1:end_index]:
            stripped = raw_line.strip()
            if not stripped or re.fullmatch(r"[•*+\-\s]+", stripped):
                continue
            if stop_section_pattern.match(stripped):
                break
            # A displaced INTERNSHIP EXPERIENCE heading is harmless and should
            # not prevent the continuation text from being attached to the role.
            if re.fullmatch(r"INTERNSHIP\s+EXPERIENCE\s*:?", stripped, re.IGNORECASE):
                continue
            cleaned = stripped.lstrip("-*•+ \t").strip()
            if cleaned:
                achievements.append(cleaned)

        results.append({
            "company": entry["company"],
            "role": entry["role"],
            "duration": entry["duration"],
            "achievements": achievements,
        })

    return results

# ============================================================
# PROJECTS EXTRACTION
# ============================================================

def extract_projects(text: str) -> List[Dict[str, Any]]:
    """Extract projects from explicit GitHub bullet entries or a Projects section.

    For some PDFs, project details are emitted before the PROJECTS heading. A
    bullet title with a GitHub link is a reliable project boundary in that case.
    """
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    explicit_headers = []
    for index, line in enumerate(lines):
        if re.match(r"^[\s]*[•*+\-]\s*", line) and re.search(r"\bgithub\b|github\.com", line, re.IGNORECASE):
            title = line.split("|", 1)[0]
            title = re.sub(r"^[\s•*+\-]+", "", title).strip(" -–|:")
            if title and len(title.split()) <= 12:
                explicit_headers.append((index, title))

    if explicit_headers:
        stop_section_pattern = re.compile(
            r"^\s*(?:certifications?|achievements?|languages?\s+known|declaration|"
            r"projects?|skills|education|objective)\s*:?\s*$",
            re.IGNORECASE,
        )
        results: List[Dict[str, Any]] = []
        for header_index, (line_index, title) in enumerate(explicit_headers):
            next_header = explicit_headers[header_index + 1][0] if header_index + 1 < len(explicit_headers) else len(lines)
            description_lines = []
            for raw_line in lines[line_index + 1:next_header]:
                if stop_section_pattern.match(raw_line):
                    break
                cleaned = raw_line.lstrip("-*•+ \t").strip()
                if cleaned:
                    description_lines.append(cleaned)
            description = " ".join(description_lines)
            results.append({
                "name": title,
                "description": description,
                "technologies": extract_skills(f"{title} {description}"),
            })
        return results

    # Preserve the general title/description heuristic for simpler resumes that
    # contain a conventional Projects heading and no explicit GitHub links.
    sections = extract_sections(text)
    proj_text = sections.get("projects", "")
    if not proj_text:
        return []

    project_lines = [line.strip() for line in proj_text.split("\n") if line.strip()]
    results: List[Dict[str, Any]] = []
    current_project: Optional[Dict[str, Any]] = None

    for line in project_lines:
        is_bullet = line.startswith(("-", "*", "•"))
        is_tech_line = bool(re.match(r"^(?:technologies|tools|stack|tech)\s*[:\-]", line, re.IGNORECASE))

        if not is_bullet and not is_tech_line and len(line.split()) <= 8 and not line.endswith((".", ";")):
            if current_project:
                current_project["technologies"] = extract_skills(
                    f"{current_project['name']} {current_project['description']}"
                )
                results.append(current_project)

            current_project = {
                "name": line.strip(" -–|:"),
                "description": "",
                "technologies": [],
            }
        elif current_project:
            desc_line = line.lstrip("-*• \t").strip()
            if current_project["description"]:
                current_project["description"] += " " + desc_line
            else:
                current_project["description"] = desc_line

    if current_project:
        current_project["technologies"] = extract_skills(
            f"{current_project['name']} {current_project['description']}"
        )
        results.append(current_project)

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
        "text": cleaned_text,
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
