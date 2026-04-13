import { Scholarship } from "./types";

export const SCHOLARSHIPS: Scholarship[] = [
  // ─── NATIONAL MERIT & HIGH ACHIEVEMENT ──────────────────────────────────────
  {
    id: "national-merit",
    name: "National Merit Scholarship",
    organization: "National Merit Scholarship Corporation",
    amount: "Up to $2,500",
    amountNumeric: 2500,
    deadline: "October (PSAT qualifying year)",
    deadlineDate: "2025-10-15",
    description:
      "One of the most prestigious academic scholarships in the United States, awarded based on PSAT/NMSQT performance and academic achievement.",
    eligibility: {
      minGpa: 3.5,
      description: "Must take PSAT/NMSQT in junior year and score in the top 1% nationally. U.S. citizens or permanent residents enrolled as full-time students.",
      citizenshipRequired: true,
    },
    essayPrompts: [
      { prompt: "Describe an experience that significantly influenced your intellectual development.", wordLimit: 650 },
      { prompt: "Discuss a challenge you have overcome and what it taught you.", wordLimit: 650 },
    ],
    applicationUrl: "https://www.nationalmerit.org",
    category: ["merit", "national"],
    renewable: false,
    whatMakesStrongCandidate: [
      "High PSAT/NMSQT score (Selection Index of 210+)",
      "Strong GPA and rigorous course load (AP/IB classes)",
      "Demonstrated leadership in extracurricular activities",
      "Community involvement and service",
      "Compelling personal essay that shows intellectual curiosity",
    ],
    tips: [
      "Prepare thoroughly for the PSAT in 10th grade to practice",
      "Focus on verbal and math sections equally",
      "Your commended or semifinalist status opens doors to corporate-sponsored scholarships",
    ],
    schoolSpecific: false,
    majorSpecific: false,
  },
  {
    id: "gates-scholarship",
    name: "Gates Scholarship",
    organization: "Bill & Melinda Gates Foundation",
    amount: "Full cost of attendance",
    amountNumeric: 60000,
    deadline: "September 15",
    deadlineDate: "2025-09-15",
    description:
      "Covers the full cost of attendance at any U.S. college for exceptional minority students with financial need. One of the most competitive and generous scholarships available.",
    eligibility: {
      minGpa: 3.3,
      maxHouseholdIncome: "Under $65,000",
      ethnicities: ["African American", "Hispanic/Latino", "American Indian/Alaska Native", "Asian Pacific Islander American"],
      description: "Must be a Pell Grant-eligible minority student with strong academic record and leadership.",
      citizenshipRequired: true,
      firstGenOnly: false,
    },
    essayPrompts: [
      { prompt: "Describe your short- and long-term career goals. What has influenced your choice of career?", wordLimit: 300 },
      { prompt: "Describe your personal leadership style, providing a specific example of your leadership.", wordLimit: 300 },
      { prompt: "Describe your community service activities and the impact they have had.", wordLimit: 300 },
    ],
    applicationUrl: "https://www.thegatesscholarship.org",
    category: ["merit", "need-based", "ethnicity-specific", "national", "leadership"],
    renewable: true,
    renewalInfo: "Renewable annually with satisfactory academic progress",
    whatMakesStrongCandidate: [
      "Demonstrated financial need (Pell Grant eligible)",
      "Extraordinary academic achievement (3.3+ GPA)",
      "Significant community leadership and service",
      "Clear vision for future career and educational goals",
      "Resilience in overcoming personal or community challenges",
    ],
    tips: [
      "Start the application early — it has multiple essay components",
      "Highlight specific, measurable impact from your leadership roles",
      "Be authentic about your background and community",
    ],
    schoolSpecific: false,
    majorSpecific: false,
  },
  {
    id: "coca-cola-scholars",
    name: "Coca-Cola Scholars Foundation Scholarship",
    organization: "Coca-Cola Scholars Foundation",
    amount: "$20,000",
    amountNumeric: 20000,
    deadline: "October 31",
    deadlineDate: "2025-10-31",
    description:
      "Recognizes 150 students annually for their leadership, service, and commitment to making a significant impact in their communities.",
    eligibility: {
      minGpa: 3.0,
      description: "U.S. citizens, nationals, or permanent residents attending accredited U.S. colleges. Based on leadership and service, not just academics.",
      citizenshipRequired: true,
    },
    essayPrompts: [
      { prompt: "What is the most important leadership role you have held, and what have you accomplished in that role?", wordLimit: 350 },
      { prompt: "Describe an instance where you contributed to your school or community in a meaningful way.", wordLimit: 350 },
    ],
    applicationUrl: "https://www.coca-colascholarsfoundation.org",
    category: ["merit", "leadership", "community-service", "national"],
    renewable: false,
    whatMakesStrongCandidate: [
      "Proven leadership with measurable community impact",
      "Initiative to create or lead new programs/organizations",
      "Demonstrated ability to inspire others",
      "Strong academics alongside service commitments",
      "Long-term commitment to causes (multi-year involvement)",
    ],
    tips: [
      "Quantify your impact wherever possible (number of people helped, funds raised, etc.)",
      "Show progression in leadership roles over time",
      "The application emphasizes character over grades",
    ],
    schoolSpecific: false,
    majorSpecific: false,
  },
  {
    id: "jack-kent-cooke",
    name: "Jack Kent Cooke Foundation College Scholarship",
    organization: "Jack Kent Cooke Foundation",
    amount: "Up to $55,000 per year",
    amountNumeric: 55000,
    deadline: "November 18",
    deadlineDate: "2025-11-18",
    description:
      "One of the largest private scholarships in America for high-achieving students with financial need. Provides comprehensive support beyond just funding.",
    eligibility: {
      minGpa: 3.5,
      maxHouseholdIncome: "Under $95,000",
      description: "High-achieving students with significant financial need. Must demonstrate exceptional academic ability and intellectual curiosity.",
      citizenshipRequired: true,
    },
    essayPrompts: [
      { prompt: "Describe a significant challenge you have faced and what you have learned from it.", wordLimit: 500 },
      { prompt: "What is your most important intellectual interest and why?", wordLimit: 500 },
    ],
    applicationUrl: "https://www.jkcf.org",
    category: ["merit", "need-based", "national"],
    renewable: true,
    renewalInfo: "Renewable for up to 4 years",
    whatMakesStrongCandidate: [
      "Outstanding academic record at a rigorous school",
      "Financial need (often from modest-income families)",
      "Deep intellectual curiosity beyond classroom work",
      "Service to school and community",
      "Compelling story of perseverance and growth",
    ],
    tips: [
      "This is extremely competitive — only ~40 students selected from thousands",
      "Emphasis on intellectual curiosity: mention books, research, or ideas that excite you",
      "Financial need documentation must be thorough",
    ],
    schoolSpecific: false,
    majorSpecific: false,
  },
  {
    id: "questbridge",
    name: "QuestBridge National College Match",
    organization: "QuestBridge",
    amount: "Full 4-year scholarship",
    amountNumeric: 80000,
    deadline: "September 26",
    deadlineDate: "2025-09-26",
    description:
      "Connects high-achieving, low-income students with full 4-year scholarships at 50+ top colleges including Yale, Princeton, MIT, and more.",
    eligibility: {
      minGpa: 3.7,
      maxHouseholdIncome: "Under $65,000",
      description: "High-achieving students from low-income backgrounds. Typically household income under $65K for a family of 4.",
      firstGenOnly: false,
    },
    essayPrompts: [
      { prompt: "Describe an aspect of your identity and how it has shaped your life.", wordLimit: 550 },
      { prompt: "Discuss an intellectual experience that was important to you.", wordLimit: 550 },
      { prompt: "Describe the most significant challenge you have faced.", wordLimit: 550 },
    ],
    applicationUrl: "https://www.questbridge.org",
    category: ["merit", "need-based", "national"],
    renewable: true,
    renewalInfo: "Full 4-year scholarship renewable with good standing",
    whatMakesStrongCandidate: [
      "Top academic performance at a rigorous high school",
      "Low household income (this is a feature, not a barrier)",
      "Exceptional test scores (SAT 1400+ or ACT 32+)",
      "Leadership and service within your community",
      "Authentic, compelling personal narrative",
    ],
    tips: [
      "Being low-income is an advantage here — don't shy away from your background",
      "Apply to become a QuestBridge Finalist first — this itself is a distinction",
      "Match carefully to schools you genuinely want to attend",
    ],
    schoolSpecific: false,
    majorSpecific: false,
  },
  {
    id: "dell-scholars",
    name: "Dell Scholars Program",
    organization: "Michael & Susan Dell Foundation",
    amount: "$20,000 + laptop + resources",
    amountNumeric: 20000,
    deadline: "December 1",
    deadlineDate: "2025-12-01",
    description:
      "Supports low-income students who are determined to beat the odds. Provides money, a laptop, textbook credits, and ongoing mentorship through college.",
    eligibility: {
      minGpa: 2.4,
      maxHouseholdIncome: "Pell Grant eligible",
      description: "Must participate in an approved college readiness program (like AVID, GEAR UP, Upward Bound). Pell Grant eligible.",
      firstGenOnly: false,
    },
    essayPrompts: [
      { prompt: "Tell us about yourself and how you have overcome challenges to achieve your goals.", wordLimit: 500 },
      { prompt: "Why is receiving a college education important to you?", wordLimit: 300 },
    ],
    applicationUrl: "https://www.dellscholars.org",
    category: ["need-based", "national", "first-generation"],
    renewable: true,
    renewalInfo: "Up to 6 years of support",
    whatMakesStrongCandidate: [
      "Participation in college prep program (AVID, Upward Bound, etc.)",
      "Demonstrated financial need",
      "Perseverance through personal challenges",
      "Clear motivation for pursuing higher education",
      "Community involvement despite adversity",
    ],
    tips: [
      "Must be enrolled in a qualifying college readiness program",
      "Emphasize obstacles you have overcome — this scholarship values resilience",
      "Lower GPA requirement (2.4) makes this more accessible",
    ],
    schoolSpecific: false,
    majorSpecific: false,
  },

  // ─── ETHNICITY / BACKGROUND ─────────────────────────────────────────────────
  {
    id: "hispanic-scholarship-fund",
    name: "Hispanic Scholarship Fund",
    organization: "Hispanic Scholarship Fund",
    amount: "$500–$5,000",
    amountNumeric: 5000,
    deadline: "February 15",
    deadlineDate: "2026-02-15",
    description:
      "The largest nonprofit scholarship organization supporting Hispanic students in pursuing higher education in the United States.",
    eligibility: {
      minGpa: 3.0,
      ethnicities: ["Hispanic/Latino"],
      description: "Must be of Hispanic heritage, U.S. citizen or permanent resident, and attending an accredited U.S. college.",
      citizenshipRequired: true,
    },
    essayPrompts: [
      { prompt: "How has your Hispanic heritage influenced your educational and career goals?", wordLimit: 500 },
    ],
    applicationUrl: "https://www.hsf.net",
    category: ["ethnicity-specific", "national", "need-based"],
    renewable: true,
    renewalInfo: "Renewable each academic year",
    whatMakesStrongCandidate: [
      "Strong academic record (3.0+ GPA)",
      "Financial need",
      "Demonstrated connection to Hispanic community",
      "Leadership and service",
      "Clear career goals",
    ],
    tips: [
      "Apply even with a 3.0 GPA — it's more accessible than many scholarships",
      "Corporate partners offer additional scholarships through HSF",
      "Demonstrate community involvement with Hispanic organizations",
    ],
    schoolSpecific: false,
    majorSpecific: false,
  },
  {
    id: "uncf-general",
    name: "UNCF General Scholarship",
    organization: "United Negro College Fund (UNCF)",
    amount: "$2,000–$10,000",
    amountNumeric: 10000,
    deadline: "Varies by program",
    deadlineDate: "2026-03-01",
    description:
      "UNCF offers hundreds of scholarship programs for African American students attending college. Awards range from general merit to major-specific.",
    eligibility: {
      minGpa: 2.5,
      ethnicities: ["African American"],
      description: "African American students with financial need attending or planning to attend an accredited college.",
      citizenshipRequired: true,
    },
    essayPrompts: [
      { prompt: "Describe your career goals and how education will help you achieve them.", wordLimit: 500 },
      { prompt: "How have you served your community and what impact have you made?", wordLimit: 500 },
    ],
    applicationUrl: "https://scholarships.uncf.org",
    category: ["ethnicity-specific", "need-based", "national"],
    renewable: false,
    whatMakesStrongCandidate: [
      "Financial need (demonstrated through FAFSA)",
      "Academic achievement (2.5+ GPA)",
      "Community service and leadership",
      "Clear vision for future goals",
    ],
    tips: [
      "UNCF manages 400+ scholarships — create one profile to apply to many",
      "Update your profile when new scholarships open",
      "Many UNCF scholarships are major-specific, so list your intended major accurately",
    ],
    schoolSpecific: false,
    majorSpecific: false,
  },
  {
    id: "apia-scholars",
    name: "APIA Scholars Program",
    organization: "Asian & Pacific Islander American Scholarship Fund",
    amount: "Up to $20,000",
    amountNumeric: 20000,
    deadline: "January 13",
    deadlineDate: "2026-01-13",
    description:
      "Supports Asian American and Pacific Islander students who demonstrate academic excellence, leadership, and financial need.",
    eligibility: {
      minGpa: 2.7,
      ethnicities: ["Asian/Pacific Islander"],
      maxHouseholdIncome: "Under $70,000",
      description: "AAPI students who are U.S. citizens, nationals, or permanent residents with financial need.",
      citizenshipRequired: true,
    },
    essayPrompts: [
      { prompt: "Describe how your AAPI identity has shaped your goals and how you will contribute to the AAPI community.", wordLimit: 500 },
    ],
    applicationUrl: "https://www.apiasf.org",
    category: ["ethnicity-specific", "need-based", "national"],
    renewable: true,
    renewalInfo: "Renewable for up to 4 years",
    whatMakesStrongCandidate: [
      "Connection to AAPI community and culture",
      "Financial need",
      "Academic achievement",
      "Leadership in school or community",
      "Commitment to uplifting the AAPI community",
    ],
    tips: [
      "Be specific about your AAPI heritage (Pacific Islander applicants are especially encouraged)",
      "Discuss how you will give back to your community after graduation",
    ],
    schoolSpecific: false,
    majorSpecific: false,
  },
  {
    id: "jackie-robinson",
    name: "Jackie Robinson Foundation Scholarship",
    organization: "Jackie Robinson Foundation",
    amount: "Up to $30,000",
    amountNumeric: 30000,
    deadline: "February 1",
    deadlineDate: "2026-02-01",
    description:
      "Awarded to minority high school seniors who demonstrate extraordinary leadership potential and academic achievement.",
    eligibility: {
      minGpa: 3.0,
      ethnicities: ["African American", "Hispanic/Latino", "Asian/Pacific Islander", "American Indian/Alaska Native"],
      description: "Minority high school seniors with financial need, extraordinary leadership potential, and a commitment to community service.",
      citizenshipRequired: true,
    },
    essayPrompts: [
      { prompt: "Describe your leadership experiences and the impact you have had on your community.", wordLimit: 500 },
      { prompt: "How has Jackie Robinson's legacy inspired you?", wordLimit: 300 },
    ],
    applicationUrl: "https://jackierobinson.org",
    category: ["ethnicity-specific", "leadership", "need-based", "national"],
    renewable: true,
    renewalInfo: "Renewable for 4 years with academic progress",
    whatMakesStrongCandidate: [
      "Exceptional leadership skills with tangible results",
      "Financial need",
      "Involvement in minority community organizations",
      "Academic excellence",
      "Character that reflects Jackie Robinson's values",
    ],
    tips: [
      "Research Jackie Robinson's legacy deeply before writing essays",
      "Focus on specific leadership accomplishments, not generic descriptions",
      "Strong letters of recommendation from community leaders carry weight",
    ],
    schoolSpecific: false,
    majorSpecific: false,
  },
  {
    id: "american-indian-college-fund",
    name: "American Indian College Fund",
    organization: "American Indian College Fund",
    amount: "$1,000–Full Tuition",
    amountNumeric: 20000,
    deadline: "May 31",
    deadlineDate: "2026-05-31",
    description:
      "Provides scholarships for American Indian and Alaska Native students pursuing higher education.",
    eligibility: {
      ethnicities: ["American Indian/Alaska Native"],
      description: "Enrolled members of federally recognized tribes. Financial need considered.",
    },
    essayPrompts: [
      { prompt: "How do you plan to use your education to support your tribal community?", wordLimit: 500 },
    ],
    applicationUrl: "https://collegefund.org",
    category: ["ethnicity-specific", "need-based", "national"],
    renewable: true,
    renewalInfo: "Renewable with satisfactory academic progress",
    whatMakesStrongCandidate: [
      "Tribal enrollment documentation",
      "Clear plan to give back to tribal community",
      "Academic achievement",
      "Financial need",
    ],
    tips: [
      "Must provide proof of tribal enrollment",
      "Applications for tribal colleges and mainstream universities are separate",
    ],
    schoolSpecific: false,
    majorSpecific: false,
  },

  // ─── STEM ────────────────────────────────────────────────────────────────────
  {
    id: "regeneron-science-talent-search",
    name: "Regeneron Science Talent Search",
    organization: "Society for Science",
    amount: "Up to $250,000",
    amountNumeric: 250000,
    deadline: "November 12",
    deadlineDate: "2025-11-12",
    description:
      "The nation's oldest and most prestigious science and math competition for high school seniors. Winners receive up to $250,000 for original research.",
    eligibility: {
      minGpa: 3.5,
      description: "High school seniors who have completed an independent research project in science, math, or engineering.",
    },
    essayPrompts: [
      { prompt: "Summarize your research project and its significance to the scientific community.", wordLimit: 750 },
      { prompt: "Describe how you will continue to contribute to STEM.", wordLimit: 500 },
    ],
    applicationUrl: "https://www.societyforscience.org/regeneron-sts",
    category: ["merit", "stem", "science", "national"],
    renewable: false,
    whatMakesStrongCandidate: [
      "Original, independent scientific research project",
      "Rigorous experimental design and methodology",
      "Clear explanation of scientific significance",
      "Guidance from a research mentor or professor",
      "Published or presentable results",
    ],
    tips: [
      "Start research as early as sophomore year",
      "Partner with a university lab if possible for access to equipment",
      "The application itself is research-heavy — plan 3–6 months to prepare",
    ],
    schoolSpecific: false,
    majorSpecific: true,
    specificMajors: ["Biology", "Chemistry", "Physics", "Computer Science", "Mathematics", "Engineering", "Environmental Science"],
  },
  {
    id: "google-generation-scholarship",
    name: "Google Generation Scholarship",
    organization: "Google",
    amount: "$10,000",
    amountNumeric: 10000,
    deadline: "December 1",
    deadlineDate: "2025-12-01",
    description:
      "Supports aspiring computer scientists who are excelling academically and engaging the next generation of technical contributors from underrepresented groups.",
    eligibility: {
      minGpa: 3.2,
      description: "Undergraduate students studying computer science or a related field. Must be from an underrepresented group in tech.",
    },
    essayPrompts: [
      { prompt: "What challenges have you faced as a member of an underrepresented group in tech, and how have you overcome them?", wordLimit: 500 },
      { prompt: "Describe a significant technical project you have worked on.", wordLimit: 500 },
    ],
    applicationUrl: "https://buildyourfuture.withgoogle.com/scholarships",
    category: ["stem", "merit", "national"],
    renewable: false,
    whatMakesStrongCandidate: [
      "Strong CS fundamentals and academic performance",
      "Demonstrated technical projects (GitHub portfolio, hackathons)",
      "Involvement in coding communities or teaching others",
      "From an underrepresented group in tech",
      "Clear vision for career in technology",
    ],
    tips: [
      "A strong GitHub portfolio is worth mentioning in your application",
      "Highlight any coding clubs, hackathons, or CS tutoring you have done",
      "Google values diverse perspectives — connect your background to tech",
    ],
    schoolSpecific: false,
    majorSpecific: true,
    specificMajors: ["Computer Science", "Software Engineering", "Information Technology", "Electrical Engineering"],
  },
  {
    id: "davidson-fellows",
    name: "Davidson Fellows Scholarship",
    organization: "Davidson Institute",
    amount: "$10,000–$50,000",
    amountNumeric: 50000,
    deadline: "February",
    deadlineDate: "2026-02-14",
    description:
      "Recognizes exceptional students under 18 who have completed significant projects in STEM, literature, music, philosophy, or outside the box.",
    eligibility: {
      description: "Students 18 or younger who have completed a significant piece of work in science, technology, engineering, math, literature, music, philosophy, or outside the box.",
    },
    essayPrompts: [
      { prompt: "Describe your project and explain its significance to your field.", wordLimit: 750 },
      { prompt: "What further research or work do you plan to pursue in this area?", wordLimit: 500 },
    ],
    applicationUrl: "https://www.davidsongifted.org/fellows-scholarship",
    category: ["merit", "stem", "humanities", "arts", "science", "national"],
    renewable: false,
    whatMakesStrongCandidate: [
      "Genuinely original work — not a school project, but independent research",
      "Demonstrated impact or significance of the project",
      "Depth of expertise beyond what is typical for a student",
      "Expert endorsement (professor, mentor in the field)",
    ],
    tips: [
      "Projects must be complete, not in-progress",
      "Works that have been published, presented at conferences, or recognized by experts are strongest",
    ],
    schoolSpecific: false,
    majorSpecific: false,
  },
  {
    id: "society-of-women-engineers",
    name: "Society of Women Engineers Scholarship",
    organization: "Society of Women Engineers",
    amount: "$1,000–$22,500",
    amountNumeric: 22500,
    deadline: "February 15",
    deadlineDate: "2026-02-15",
    description:
      "SWE offers over $1 million in scholarships annually to women pursuing engineering or computer science degrees.",
    eligibility: {
      genders: ["Female", "Non-binary"],
      minGpa: 3.0,
      description: "Women and non-binary students pursuing engineering, engineering technology, or computer science degrees.",
    },
    essayPrompts: [
      { prompt: "What inspired you to study engineering, and what do you hope to accomplish in your career?", wordLimit: 500 },
    ],
    applicationUrl: "https://swe.org/scholarships",
    category: ["stem", "merit", "national"],
    renewable: true,
    renewalInfo: "Some scholarships are renewable annually",
    whatMakesStrongCandidate: [
      "Passion for engineering with specific career goals",
      "Leadership in STEM-related clubs or competitions",
      "Participation in SWE or similar organizations",
      "Involvement in inspiring other women in STEM",
      "Strong academics in math and science",
    ],
    tips: [
      "SWE has multiple scholarships — one application considers you for all you are eligible for",
      "STEM competition experience (robotics, math olympiad) strengthens your application",
    ],
    schoolSpecific: false,
    majorSpecific: true,
    specificMajors: ["Engineering", "Computer Science", "Electrical Engineering", "Mechanical Engineering", "Chemical Engineering", "Civil Engineering", "Biomedical Engineering"],
  },
  {
    id: "astronaut-scholarship",
    name: "Astronaut Scholarship Foundation",
    organization: "Astronaut Scholarship Foundation",
    amount: "$15,000",
    amountNumeric: 15000,
    deadline: "Varies by school",
    deadlineDate: "2026-02-01",
    description:
      "Established by Mercury astronauts, this scholarship supports top STEM students who demonstrate initiative, creativity, and excellence in science and technology.",
    eligibility: {
      minGpa: 3.75,
      description: "Nominated by faculty from member universities. U.S. citizens pursuing STEM fields with exceptional academic achievement.",
      citizenshipRequired: true,
    },
    essayPrompts: [
      { prompt: "Describe your most significant research or scientific project and its potential impact.", wordLimit: 600 },
    ],
    applicationUrl: "https://astronautscholarship.org",
    category: ["stem", "merit", "science", "national"],
    renewable: true,
    renewalInfo: "Can be renewed for a second year",
    whatMakesStrongCandidate: [
      "Exceptional GPA in STEM subjects",
      "Research experience in a lab or independent project",
      "Initiative shown outside the classroom",
      "Faculty nomination (must attend a member institution)",
    ],
    tips: [
      "Build relationships with professors early — you need a faculty nomination",
      "Pursue research opportunities in summer (REUs, lab internships)",
    ],
    schoolSpecific: false,
    majorSpecific: true,
    specificMajors: ["Biology", "Chemistry", "Physics", "Computer Science", "Mathematics", "Engineering"],
  },

  // ─── ARTS & HUMANITIES ───────────────────────────────────────────────────────
  {
    id: "scholastic-art-writing",
    name: "Scholastic Art & Writing Awards",
    organization: "Alliance for Young Artists & Writers",
    amount: "Up to $10,000",
    amountNumeric: 10000,
    deadline: "Varies by region",
    deadlineDate: "2026-01-15",
    description:
      "The nation's longest-running, most prestigious recognition program for creative teens in grades 7–12.",
    eligibility: {
      description: "Students in grades 7–12 submitting original art or writing in one of 29 categories.",
    },
    essayPrompts: [
      { prompt: "Artist statement for portfolio submission.", wordLimit: 250 },
    ],
    applicationUrl: "https://www.artandwriting.org",
    category: ["arts", "humanities", "merit", "national"],
    renewable: false,
    whatMakesStrongCandidate: [
      "Original, technically strong creative work",
      "A distinct artistic voice or perspective",
      "Work that takes creative risks",
      "Portfolio that shows development over time",
    ],
    tips: [
      "Submit in multiple categories to increase chances",
      "Regional gold key winners advance to national judging",
      "A Gold Medal Portfolio earns scholarship consideration",
    ],
    schoolSpecific: false,
    majorSpecific: true,
    specificMajors: ["Fine Arts", "Creative Writing", "Visual Arts", "Film", "Photography"],
  },
  {
    id: "youngarts",
    name: "YoungArts Foundation Award",
    organization: "National YoungArts Foundation",
    amount: "Up to $10,000",
    amountNumeric: 10000,
    deadline: "October 15",
    deadlineDate: "2025-10-15",
    description:
      "Identifies and supports the next generation of artists in visual, literary, design, and performing arts. YoungArts alumni include Viola Davis, Nicki Minaj, and Timothée Chalamet.",
    eligibility: {
      description: "U.S. citizens or permanent residents, 15–18 years old (or in grades 10–12) with talent in arts disciplines.",
    },
    essayPrompts: [
      { prompt: "Describe your artistic journey and what you hope to achieve as an artist.", wordLimit: 500 },
    ],
    applicationUrl: "https://youngarts.org",
    category: ["arts", "merit", "national"],
    renewable: false,
    whatMakesStrongCandidate: [
      "Exceptional talent in chosen art form",
      "Strong portfolio or audition materials",
      "Clear artistic vision and ambition",
      "Training history and accomplishments",
    ],
    tips: [
      "YoungArts designation is itself a prestigious credential for college applications",
      "Finalists are considered for U.S. Presidential Scholars in the Arts",
    ],
    schoolSpecific: false,
    majorSpecific: true,
    specificMajors: ["Fine Arts", "Music", "Dance", "Theater", "Creative Writing", "Photography", "Film"],
  },

  // ─── COMMUNITY SERVICE & LEADERSHIP ─────────────────────────────────────────
  {
    id: "prudential-spirit",
    name: "Prudential Spirit of Community Awards",
    organization: "Prudential Financial",
    amount: "Up to $5,000",
    amountNumeric: 5000,
    deadline: "November 5",
    deadlineDate: "2025-11-05",
    description:
      "Honors students in grades 5–12 for outstanding self-initiated, volunteer community service. Focuses purely on service impact, not academics.",
    eligibility: {
      description: "Students in grades 5–12 who have initiated or led a volunteer service activity.",
    },
    essayPrompts: [
      { prompt: "Describe your community service activity, why you started it, and the impact it has had.", wordLimit: 500 },
    ],
    applicationUrl: "https://spirit.prudential.com",
    category: ["community-service", "leadership", "national"],
    renewable: false,
    whatMakesStrongCandidate: [
      "Self-initiated service (you started it, not just participated)",
      "Measurable, lasting impact on the community",
      "Personal motivation behind the service",
      "Sustained commitment over time",
    ],
    tips: [
      "The key word is 'self-initiated' — projects you started score higher than ones you joined",
      "Document specific outcomes: meals served, trees planted, people helped",
    ],
    schoolSpecific: false,
    majorSpecific: false,
  },
  {
    id: "do-something-scholarship",
    name: "Do Something Scholarship",
    organization: "DoSomething.org",
    amount: "$5,000",
    amountNumeric: 5000,
    deadline: "Ongoing campaigns",
    deadlineDate: "2026-06-01",
    description:
      "Multiple scholarship campaigns per year tied to social action. No GPA requirement — just take action on a cause you care about.",
    eligibility: {
      description: "Young people (under 25) who take action on social causes. No GPA or income requirement.",
    },
    essayPrompts: [
      { prompt: "Describe the social action campaign you completed and what you learned from it.", wordLimit: 400 },
    ],
    applicationUrl: "https://www.dosomething.org/us/campaigns",
    category: ["community-service", "social-justice", "national"],
    renewable: false,
    whatMakesStrongCandidate: [
      "Creative, impactful social action project",
      "No minimum GPA — accessible to all students",
      "Documented evidence of your campaign",
      "Reflection on what you learned",
    ],
    tips: [
      "DoSomething runs many different campaigns throughout the year — check regularly for new ones",
      "No GPA requirement makes this one of the most accessible scholarships available",
    ],
    schoolSpecific: false,
    majorSpecific: false,
  },

  // ─── FIRST GENERATION ────────────────────────────────────────────────────────
  {
    id: "college-jumpstart",
    name: "College JumpStart Scholarship",
    organization: "College JumpStart Scholarship Fund",
    amount: "$1,000",
    amountNumeric: 1000,
    deadline: "April 15 and October 17",
    deadlineDate: "2026-04-15",
    description:
      "Open to 10th–12th graders and non-traditional students. Focuses on motivation and commitment to education, not just GPA.",
    eligibility: {
      description: "10th–12th grade high school students and college students. No GPA requirement — based on commitment to education.",
    },
    essayPrompts: [
      { prompt: "How will the JumpStart Scholarship help you reach your educational and life goals?", wordLimit: 250 },
    ],
    applicationUrl: "https://www.jumpstart-scholarship.net",
    category: ["merit", "first-generation", "national"],
    renewable: false,
    whatMakesStrongCandidate: [
      "Clear motivation and commitment to education",
      "Specific educational and career goals",
      "Overcoming obstacles to pursue education",
    ],
    tips: [
      "Applied twice per year — apply in both April and October",
      "Short essay — be concise but compelling",
    ],
    schoolSpecific: false,
    majorSpecific: false,
  },

  // ─── BUSINESS & ENTREPRENEURSHIP ────────────────────────────────────────────
  {
    id: "nfib-young-entrepreneur",
    name: "NFIB Young Entrepreneur Award",
    organization: "National Federation of Independent Business",
    amount: "$1,000–$15,000",
    amountNumeric: 15000,
    deadline: "Varies by state",
    deadlineDate: "2026-03-01",
    description:
      "Recognizes outstanding student entrepreneurs who have started or shown exceptional promise in business.",
    eligibility: {
      minGpa: 3.0,
      description: "High school students who have demonstrated entrepreneurial spirit and business achievement.",
    },
    essayPrompts: [
      { prompt: "Describe your business idea or venture and its potential impact.", wordLimit: 500 },
      { prompt: "How has entrepreneurship shaped your goals for the future?", wordLimit: 300 },
    ],
    applicationUrl: "https://www.nfib.com/YEF",
    category: ["business", "leadership", "national"],
    renewable: false,
    whatMakesStrongCandidate: [
      "Actual business experience (even a side hustle counts)",
      "Entrepreneurial mindset and creativity",
      "Understanding of market opportunity",
      "Leadership and initiative",
    ],
    tips: [
      "Even a small business (lawn mowing, tutoring, Etsy shop) qualifies",
      "Emphasize what you learned from running the business, not just the profits",
    ],
    schoolSpecific: false,
    majorSpecific: true,
    specificMajors: ["Business", "Entrepreneurship", "Marketing", "Finance", "Management"],
  },

  // ─── HEALTH / NURSING / MEDICINE ─────────────────────────────────────────────
  {
    id: "aap-medical-scholarship",
    name: "Health Professions Scholarship",
    organization: "National Health Service Corps",
    amount: "Full tuition + stipend",
    amountNumeric: 60000,
    deadline: "Varies",
    deadlineDate: "2026-03-31",
    description:
      "Full scholarship for students pursuing primary health care fields who commit to serving underserved communities.",
    eligibility: {
      description: "Students accepted or enrolled in health professions programs who commit to working in Health Professional Shortage Areas after graduation.",
      citizenshipRequired: true,
    },
    essayPrompts: [
      { prompt: "Why do you want to serve in an underserved community, and how has your background prepared you for this commitment?", wordLimit: 500 },
    ],
    applicationUrl: "https://nhsc.hrsa.gov/scholarships",
    category: ["health", "need-based", "national"],
    renewable: true,
    renewalInfo: "Renewable for each year of service commitment",
    whatMakesStrongCandidate: [
      "Genuine commitment to serving underserved populations",
      "Experience in healthcare settings",
      "Understanding of health disparities",
      "Strong academic record in science courses",
    ],
    tips: [
      "Requires a service commitment of 2+ years in an underserved area after graduation",
      "Best for students passionate about community health, not just medicine as a career",
    ],
    schoolSpecific: false,
    majorSpecific: true,
    specificMajors: ["Nursing", "Pre-Medicine", "Public Health", "Physician Assistant", "Pharmacy"],
  },

  // ─── ATHLETICS ───────────────────────────────────────────────────────────────
  {
    id: "ncaa-scholarship",
    name: "NCAA Athletic Scholarship",
    organization: "National Collegiate Athletic Association",
    amount: "Partial to full tuition",
    amountNumeric: 30000,
    deadline: "Varies by sport and school",
    deadlineDate: "2026-02-01",
    description:
      "Athletic scholarships for student-athletes who demonstrate exceptional sports performance and academic eligibility.",
    eligibility: {
      description: "High school athletes who meet NCAA eligibility requirements (GPA, standardized test scores) and are recruited by NCAA Division I or II programs.",
    },
    essayPrompts: [
      { prompt: "Describe your athletic career and how sports have shaped your character.", wordLimit: 500 },
    ],
    applicationUrl: "https://www.ncaa.org",
    category: ["athletics", "merit"],
    renewable: true,
    renewalInfo: "Renewable annually based on athletic and academic performance",
    whatMakesStrongCandidate: [
      "Elite performance in your sport",
      "Meeting NCAA academic eligibility standards",
      "Proactive outreach to coaches",
      "Game film and athletic resume",
    ],
    tips: [
      "Register with NCAA Eligibility Center (ncaa.org/student-athletes/future)",
      "Create a highlight reel and reach out to coaches early (sophomore/junior year)",
      "D3 schools offer academic merit aid even without official athletic scholarships",
    ],
    schoolSpecific: false,
    majorSpecific: false,
  },

  // ─── STATE-SPECIFIC ───────────────────────────────────────────────────────────
  {
    id: "cal-grant",
    name: "Cal Grant",
    organization: "California Student Aid Commission",
    amount: "Up to $14,226 per year",
    amountNumeric: 14226,
    deadline: "March 2",
    deadlineDate: "2026-03-02",
    description:
      "California's primary state-funded scholarship for low- and middle-income students attending California colleges. One of the most valuable state grants available.",
    eligibility: {
      minGpa: 2.0,
      maxHouseholdIncome: "Under $110,000",
      states: ["California"],
      description: "California residents attending eligible California colleges. File FAFSA or California Dream Act application by March 2.",
      citizenshipRequired: false,
    },
    essayPrompts: [],
    applicationUrl: "https://www.csac.ca.gov",
    category: ["need-based", "state-specific"],
    renewable: true,
    renewalInfo: "Renewable for up to 4 years",
    whatMakesStrongCandidate: [
      "California residency",
      "Financial need (low EFC on FAFSA)",
      "2.0+ GPA",
      "Filed FAFSA or Dream Act application on time",
    ],
    tips: [
      "File FAFSA as early as possible (October 1) and submit GPA verification form",
      "Undocumented students can apply through the California Dream Act",
    ],
    schoolSpecific: false,
    majorSpecific: false,
    specificSchools: [],
  },
  {
    id: "texas-grant",
    name: "TEXAS Grant",
    organization: "Texas Higher Education Coordinating Board",
    amount: "Up to full tuition",
    amountNumeric: 15000,
    deadline: "Varies by school",
    deadlineDate: "2026-04-01",
    description:
      "Provides financial assistance to Texas residents with financial need who graduate from a Texas high school.",
    eligibility: {
      states: ["Texas"],
      description: "Texas residents who graduated from a Texas high school, completed Recommended or Distinguished Achievement graduation plan, and have financial need.",
    },
    essayPrompts: [],
    applicationUrl: "https://www.highered.texas.gov",
    category: ["need-based", "state-specific"],
    renewable: true,
    renewalInfo: "Renewable for up to 6 semesters",
    whatMakesStrongCandidate: [
      "Texas residency",
      "Completed rigorous high school graduation program",
      "Financial need (FAFSA)",
    ],
    tips: [
      "Must enroll at a Texas public university",
      "File FAFSA early — funding is limited and awarded first-come-first-served",
    ],
    schoolSpecific: false,
    majorSpecific: false,
  },
  {
    id: "florida-bright-futures",
    name: "Florida Bright Futures Scholarship",
    organization: "Florida Department of Education",
    amount: "Up to 100% of tuition",
    amountNumeric: 12000,
    deadline: "High school graduation",
    deadlineDate: "2026-06-01",
    description:
      "Florida's merit-based scholarship program rewarding high school graduates for academic achievement. Two tiers: Florida Academic Scholars and Florida Medallion Scholars.",
    eligibility: {
      minGpa: 3.0,
      states: ["Florida"],
      description: "Florida residents graduating from an eligible Florida high school with minimum GPA and test scores.",
    },
    essayPrompts: [],
    applicationUrl: "https://www.floridastudentfinancialaidsg.org",
    category: ["merit", "state-specific"],
    renewable: true,
    renewalInfo: "Renewable each semester with minimum GPA",
    whatMakesStrongCandidate: [
      "Florida Academic Scholars: 3.5 GPA + SAT 1290 or ACT 29 + 100 community service hours",
      "Florida Medallion Scholars: 3.0 GPA + SAT 1170 or ACT 25 + 75 community service hours",
    ],
    tips: [
      "Complete your community service hours early — many students scramble senior year",
      "Apply during senior year via the Florida Student Financial Aid application",
    ],
    schoolSpecific: false,
    majorSpecific: false,
  },
  {
    id: "new-york-excelsior",
    name: "Excelsior Scholarship",
    organization: "New York State Higher Education Services Corporation",
    amount: "Remaining tuition after grants",
    amountNumeric: 6000,
    deadline: "Varies",
    deadlineDate: "2026-05-01",
    description:
      "Makes SUNY and CUNY tuition free for New York State residents who meet income requirements.",
    eligibility: {
      states: ["New York"],
      maxHouseholdIncome: "Under $125,000",
      description: "New York residents with household income under $125,000 attending SUNY or CUNY as a full-time student.",
    },
    essayPrompts: [],
    applicationUrl: "https://www.hesc.ny.gov/pay-for-college/financial-aid/types-of-financial-aid/grants/excelsior-scholarship.html",
    category: ["need-based", "state-specific"],
    renewable: true,
    renewalInfo: "Renewable annually with full-time enrollment and satisfactory progress",
    whatMakesStrongCandidate: [
      "New York residency",
      "Income under $125,000",
      "Full-time enrollment at SUNY or CUNY",
      "Progress toward degree (30 credits per year)",
    ],
    tips: [
      "Must take 30 credits per year — make sure to plan your course load accordingly",
      "Must live and work in New York for years equal to your award after graduation",
    ],
    schoolSpecific: false,
    majorSpecific: false,
  },

  // ─── EDUCATION ───────────────────────────────────────────────────────────────
  {
    id: "future-teachers",
    name: "TEACH Grant",
    organization: "U.S. Department of Education",
    amount: "Up to $4,000 per year",
    amountNumeric: 4000,
    deadline: "Via FAFSA",
    deadlineDate: "2026-06-30",
    description:
      "Provides grants to students who plan to become teachers in high-need subjects at low-income schools.",
    eligibility: {
      minGpa: 3.25,
      description: "Students pursuing teaching careers who commit to teach in high-need subjects at low-income schools for 4 years.",
      citizenshipRequired: true,
    },
    essayPrompts: [
      { prompt: "Why do you want to become a teacher, and how will you impact your students?", wordLimit: 400 },
    ],
    applicationUrl: "https://studentaid.gov/understand-aid/types/grants/teach",
    category: ["education", "need-based", "national"],
    renewable: true,
    renewalInfo: "Renewable for up to 4 years",
    whatMakesStrongCandidate: [
      "Commitment to teaching in high-need areas",
      "Academic excellence (3.25+ GPA or top 75th percentile test scores)",
      "Experience working with youth",
      "Understanding of educational challenges in underserved communities",
    ],
    tips: [
      "Converts to a loan if service commitment is not fulfilled — take the commitment seriously",
      "High-need subjects include math, science, foreign languages, and special education",
    ],
    schoolSpecific: false,
    majorSpecific: true,
    specificMajors: ["Education", "Mathematics Education", "Science Education", "Special Education"],
  },

  // ─── RON BROWN ───────────────────────────────────────────────────────────────
  {
    id: "ron-brown-scholar",
    name: "Ron Brown Scholar Program",
    organization: "Ron Brown Scholar Program",
    amount: "$40,000 ($10,000/year)",
    amountNumeric: 40000,
    deadline: "January 9",
    deadlineDate: "2026-01-09",
    description:
      "Recognizes academically talented, highly motivated African American high school seniors who will make significant contributions to society.",
    eligibility: {
      minGpa: 3.0,
      ethnicities: ["African American"],
      description: "African American high school seniors who demonstrate academic excellence, leadership, service, and financial need.",
    },
    essayPrompts: [
      { prompt: "Describe someone who has had a significant influence on your life.", wordLimit: 500 },
      { prompt: "Describe a non-academic activity you are proud of and what you gained from it.", wordLimit: 500 },
    ],
    applicationUrl: "https://www.ronbrown.org",
    category: ["ethnicity-specific", "merit", "leadership", "national"],
    renewable: true,
    renewalInfo: "Renewable for 4 years",
    whatMakesStrongCandidate: [
      "Strong academic record (top of class)",
      "Demonstrated leadership in school and community",
      "Financial need",
      "Clear vision for contributing to society",
      "Authentic and compelling personal story",
    ],
    tips: [
      "Finalists are interviewed — prepare for an in-depth interview",
      "Shows selecting character, leadership, and community commitment above pure academics",
    ],
    schoolSpecific: false,
    majorSpecific: false,
  },
];

export function matchScholarships(
  scholarships: Scholarship[],
  profile: Partial<{
    gpa: string;
    intendedMajor: string;
    ethnicity: string;
    gender: string;
    state: string;
    householdIncome: string;
    firstGenCollegeStudent: boolean;
    citizenshipStatus: string;
  }>
): Scholarship[] {
  return scholarships
    .map((scholarship) => {
      let score = 0;
      const { eligibility } = scholarship;

      // GPA match
      if (eligibility.minGpa && profile.gpa) {
        const gpa = parseFloat(profile.gpa);
        if (gpa >= eligibility.minGpa) score += 20;
        else if (gpa >= eligibility.minGpa - 0.3) score += 5;
        else score -= 30; // Likely ineligible
      } else {
        score += 10; // No GPA requirement is a bonus
      }

      // Ethnicity match
      if (eligibility.ethnicities && eligibility.ethnicities.length > 0) {
        if (profile.ethnicity && eligibility.ethnicities.includes(profile.ethnicity)) {
          score += 40;
        } else if (profile.ethnicity === "Other" || !profile.ethnicity) {
          score -= 20;
        } else {
          score -= 40; // Not eligible
        }
      } else {
        score += 10; // No ethnicity restriction
      }

      // Gender match
      if (eligibility.genders && eligibility.genders.length > 0) {
        if (profile.gender && eligibility.genders.includes(profile.gender)) {
          score += 25;
        } else if (!profile.gender) {
          score += 0;
        } else {
          score -= 40; // Not eligible
        }
      } else {
        score += 5;
      }

      // State match
      if (eligibility.states && eligibility.states.length > 0) {
        if (profile.state && eligibility.states.includes(profile.state)) {
          score += 35;
        } else {
          score -= 50; // State-specific and wrong state
        }
      } else {
        score += 5;
      }

      // First-gen match
      if (eligibility.firstGenOnly) {
        if (profile.firstGenCollegeStudent) score += 20;
        else score -= 20;
      }

      // Citizenship
      if (eligibility.citizenshipRequired) {
        if (profile.citizenshipStatus === "US Citizen" || profile.citizenshipStatus === "Permanent Resident") {
          score += 10;
        } else {
          score -= 30;
        }
      }

      // Major match
      if (scholarship.majorSpecific && scholarship.specificMajors && profile.intendedMajor) {
        const majorLower = profile.intendedMajor.toLowerCase();
        const matchesMajor = scholarship.specificMajors.some(
          (m) => majorLower.includes(m.toLowerCase()) || m.toLowerCase().includes(majorLower)
        );
        if (matchesMajor) score += 30;
        else score -= 20;
      }

      // Income match (basic parsing)
      if (eligibility.maxHouseholdIncome && profile.householdIncome) {
        const incomeStr = profile.householdIncome;
        const maxIncome = eligibility.maxHouseholdIncome;
        if (incomeStr === "Under $30,000" || incomeStr === "$30,000–$50,000") {
          score += 15; // Very likely to qualify
        } else if (incomeStr === "$50,000–$75,000" && maxIncome.includes("65,000")) {
          score += 5;
        } else if (incomeStr === "Over $150,000") {
          score -= 20; // Likely over income limit
        }
      }

      return { ...scholarship, matchScore: Math.max(0, score) };
    })
    .filter((s) => (s.matchScore ?? 0) > 0)
    .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
}
