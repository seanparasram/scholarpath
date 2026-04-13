export interface StudentProfile {
  firstName: string;
  lastName: string;
  email: string;
  highSchool: string;
  highSchoolDomain: string;
  gpa: string;
  satScore: string;
  actScore: string;
  intendedMajor: string;
  intendedColleges: string[];
  state: string;
  ethnicity: string;
  gender: string;
  citizenshipStatus: string;
  householdIncome: string;
  firstGenCollegeStudent: boolean;
  activities: Activity[];
  awards: Award[];
  communityServiceHours: string;
  workExperience: string;
  personalStatement: string;
  projects: Project[];
}

export interface Activity {
  name: string;
  role: string;
  yearsInvolved: string;
  description: string;
}

export interface Award {
  name: string;
  year: string;
  description: string;
}

export interface Project {
  name: string;
  description: string;
  skills: string;
}

export interface Scholarship {
  id: string;
  name: string;
  organization: string;
  amount: string;
  amountNumeric: number;
  deadline: string;
  deadlineDate: string;
  description: string;
  eligibility: EligibilityRequirements;
  essayPrompts: EssayPrompt[];
  applicationUrl: string;
  category: ScholarshipCategory[];
  renewable: boolean;
  renewalInfo?: string;
  whatMakesStrongCandidate: string[];
  tips: string[];
  schoolSpecific: boolean;
  majorSpecific: boolean;
  specificMajors?: string[];
  specificSchools?: string[];
  matchScore?: number;
}

export interface EligibilityRequirements {
  minGpa?: number;
  maxHouseholdIncome?: string;
  ethnicities?: string[];
  genders?: string[];
  majors?: string[];
  states?: string[];
  citizenshipRequired?: boolean;
  firstGenOnly?: boolean;
  minSatScore?: number;
  minActScore?: number;
  description: string;
}

export interface EssayPrompt {
  prompt: string;
  wordLimit?: number;
}

export type ScholarshipCategory =
  | "merit"
  | "need-based"
  | "stem"
  | "humanities"
  | "arts"
  | "business"
  | "community-service"
  | "leadership"
  | "athletics"
  | "ethnicity-specific"
  | "first-generation"
  | "military"
  | "religious"
  | "state-specific"
  | "national"
  | "science"
  | "health"
  | "law"
  | "education"
  | "social-justice";

export interface SchoolSearchResult {
  name: string;
  domain: string;
  city: string;
  state: string;
  logoUrl: string;
}

export interface FilterState {
  schoolSpecific: boolean;
  majorSpecific: boolean;
  categories: ScholarshipCategory[];
  minAmount: number;
  maxAmount: number;
  showExpired: boolean;
}
