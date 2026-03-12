import { resumeData } from "../data/resumeContext.js";

// Pre-compiled regex patterns for query classification
const PATTERNS = {
  personal: [
    /\bname\b/i, /\bwho is\b/i, /\babout\b/i, /\bcontact\b/i, /\bemail\b/i,
    /\bphone\b/i, /\bnumber\b/i, /\blocation\b/i, /\bbased\b/i, /\bwhere\b/i,
    /\blive\b/i, /\blinkedin\b/i, /\bgithub\b/i, /\bwebsite\b/i, /\bportfolio\b/i,
    /\bprofile\b/i, /\bheadline\b/i, /\btitle\b/i, /\bposition\b/i, /\brole\b/i,
    /\bspecializ(e|ation|ations)\b/i, /\bexpertise\b/i, /\bbackground\b/i,
    /\bwork authorization\b/i, /\bvisa\b/i, /\bopt\b/i, /\brelocation\b/i,
    /\bdharaneeshwar\b/i, /\bshrisai\b/i, /\bkumaraguru\b/i,
  ],
  experience: [
    /\bexperience\b/i, /\bwork(ed)?\b/i, /\bjob\b/i, /\bcareer\b/i, /\bcompany\b/i,
    /\brole\b/i, /\bintern(ship)?\b/i, /\bciti\b/i, /\bvevolve\b/i, /\bemployment\b/i,
  ],
  education: [
    /\beducation\b/i, /\bschool\b/i, /\bdegree\b/i, /\bmaster'?s?\b/i,
    /\buniversity\b/i, /\bcollege\b/i, /\bnit\b/i, /\bub\b/i, /\bgpa\b/i,
    /\bstud(y|ies|ied)\b/i, /\bcourse(work)?\b/i,
  ],
  skills: [
    /\bskills?\b/i, /\btech(nology|nologies)?\b/i, /\btech stack\b/i, /\bstack\b/i,
    /\blanguages?\b/i, /\btools?\b/i, /\bframeworks?\b/i, /\bjava\b/i, /\bpython\b/i,
    /\breact\b/i, /\bgo\b/i, /\bcloud\b/i, /\baws\b/i, /\bkubernetes\b/i,
  ],
  projects: [
    /\bproject(s)?\b/i, /\bbuilt\b/i, /\bbuild\b/i, /\bcreated\b/i, /\bdeveloped\b/i,
    /\bmade\b/i, /\bgithub\b/i, /\bportfolio\b/i, /\bplatform\b/i, /\bapplication\b/i,
    /\bapp\b/i, /\bbot\b/i, /\brobot\b/i, /\bsystem\b/i, /\btool\b/i, /\bproduct\b/i,
    /\bprototype\b/i, /\bsummarization\b/i, /\bgenerative ai\b/i, /\bml project\b/i,
    /\bside project\b/i, /\bbolt\b/i, /\bpayment\b/i,
  ],
  certifications: [
    /\bcertification(s)?\b/i, /\bcertified\b/i, /\bcertificate\b/i, /\bcoursera\b/i,
    /\blicense\b/i, /\bcredential(s)?\b/i, /\baws\b/i, /\bmachine\b/i, /\blearning\b/i,
  ],
};

const INTENT_CLUES = [
  { pattern: /\bwhat did he build\b/i, category: "projects", weight: 4 },
  { pattern: /\bwhat are his skills\b/i, category: "skills", weight: 4 },
  { pattern: /\bwhere did he study\b/i, category: "education", weight: 4 },
  { pattern: /\bwhere did he work\b/i, category: "experience", weight: 4 },
];

export function classifyUserQuery(messages: any[]): string[] {
  const text = messages
    .filter((m) => m.role === "user")
    .slice(-2)
    .map((m) =>
      typeof m.content === "string"
        ? m.content
        : (m.parts?.[0]?.text || "")
    )
    .join(" ")
    .toLowerCase();

  const scores: Record<string, number> = {
    summary: 0, personal: 0, experience: 0, education: 0,
    skills: 0, projects: 0, certifications: 0,
  };

  const addMatches = (category: keyof typeof PATTERNS, weight = 1) => {
    for (const pattern of PATTERNS[category]) {
      if (pattern.test(text)) scores[category] += weight;
    }
  };

  addMatches("personal", 2);
  addMatches("experience", 2);
  addMatches("education", 2);
  addMatches("skills", 1);
  addMatches("projects", 2);
  addMatches("certifications", 2);

  for (const clue of INTENT_CLUES) {
    if (clue.pattern.test(text)) scores[clue.category] += clue.weight;
  }

  scores.summary += 1;

  const selected = Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category);

  if (!selected.includes("summary")) selected.unshift("summary");

  return selected;
}

// Pre-build the markdown blocks for each category ONCE at module load to improve latency (O(1) generation per request)
const PRECOMPUTED_CONTEXT: Record<string, string> = {
  summary: `## Summary\n${resumeData.personal.summary.join(" ")}\n\n`,

  personal: `## Personal Information\nName: ${resumeData.personal.fullName}\nPreferred Name: ${resumeData.personal.preferredName}\nRole: ${resumeData.personal.role}\nHeadline: ${resumeData.personal.headline}\nLocation: ${resumeData.personal.location}\nWork Authorization: ${resumeData.personal.workAuthorization}\n\nContact:\nEmail: ${resumeData.personal.email}\nPhone: ${resumeData.personal.phone}\nLinkedIn: ${resumeData.personal.linkedin}\nGitHub: ${resumeData.personal.github}\nWebsite: ${resumeData.personal.website}\n\nSpecializations:\n${resumeData.personal.specializations.map((s: string) => `- ${s}`).join("\n")}\n\nPreferred Roles:\n${resumeData.personal.preferredRoles.map((r: string) => `- ${r}`).join("\n")}\n\n`,

  experience: `## Professional Experience\n${resumeData.experience.map(exp => `### ${exp.role} at ${exp.company} (${exp.period})\nLocation: ${exp.location}\n${exp.techStack ? `Tech Stack: ${exp.techStack.join(", ")}\n` : ""}${exp.responsibilities ? `Responsibilities:\n${exp.responsibilities.map((b: string) => `- ${b}`).join("\n")}\n` : ""}${exp.achievements ? `Achievements:\n${exp.achievements.map((a: any) => `- ${a.title}: ${a.details}`).join("\n")}\n` : ""}`).join("\n")}`,

  education: `## Education\n${resumeData.education.map(edu => `### ${edu.degree} in ${edu.field} at ${edu.institution} (${edu.period})\n${edu.gpa ? `GPA: ${edu.gpa}\n` : ""}${edu.coursework ? `Coursework: ${edu.coursework.join(", ")}\n` : ""}`).join("\n")}`,

  certifications: `## Certifications\n${resumeData.certifications ? resumeData.certifications.map(cert => `- ${cert.name} (${cert.issuer})\n`).join("") : ""}\n\n`,

  skills: `## Skills\n${Object.entries(resumeData.skills).map(([category, skillsArr]) => Array.isArray(skillsArr) ? `- **${category}**: ${skillsArr.join(", ")}\n` : "").join("")}\n\n`,

  projects: `## Projects\n${resumeData.projects.map(proj => `### ${proj.name} (${proj.period})\n${proj.techStack ? `Technologies: ${proj.techStack.join(", ")}\n` : ""}${proj.searchableSummary ? `${proj.searchableSummary}\n` : ""}${proj.impact ? `Impact:\n${proj.impact.map((i: string) => `- ${i}`).join("\n")}\n` : ""}`).join("\n")}`
};

export function buildPortfolioContext(categories: string[]): string {
  // O(1) string concatenation instead of O(N) iteration per request
  return categories.map(category => PRECOMPUTED_CONTEXT[category] || "").join("");
}