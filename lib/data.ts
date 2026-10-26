// Single source of truth for portfolio content.
// Every field below comes from Abhishek Kumar Gautam's resume
// (~/workspace/user/files/Abhishek_Gautam_Resume.pdf).
// No invented metrics, URLs, or achievements. Projects without a verified
// public link deliberately carry no link — see `source` / `demo` (null).

export const profile = {
  name: "Abhishek Kumar Gautam",
  role: "Full-Stack Developer",
  location: "Greater Noida, Uttar Pradesh",
  email: "ak9724068@gmail.com",
  github: "https://github.com/Gautam215",
  githubLabel: "github.com/Gautam215",
  linkedin: "https://www.linkedin.com/in/gautam313",
  linkedinLabel: "linkedin.com/in/gautam313",
  summary:
    "Computer Science graduate focused on full-stack development, with project experience building responsive web applications using JavaScript, TypeScript, React.js, Next.js, Node.js, and MongoDB. Project work includes API integrations, database-backed accounts and booking flows, automated testing, and CI/CD, alongside Agile/Scrum experience and foundational cybersecurity training. Seeking an entry-level software or full-stack developer role.",
  seeking: "Seeking an entry-level software or full-stack developer role.",
};

export const education = [
  {
    school: "Galgotias University, Greater Noida, Uttar Pradesh",
    qualification: "Bachelor of Technology in Computer Science",
    period: "Oct 2022 – Aug 2026",
  },
  {
    school: "Sri Chaitanya Techno School, Visakhapatnam, Andhra Pradesh",
    qualification: "Senior Secondary Education (Class XII, PCM)",
    period: "Aug 2020 – May 2022",
  },
];

export const skillGroups = [
  {
    title: "Programming",
    skills: ["JavaScript", "TypeScript", "Java", "C", "C++", "Python", "SQL"],
  },
  {
    title: "Frontend",
    skills: ["HTML5", "CSS3", "React.js", "Next.js", "Tailwind CSS", "Redux Toolkit", "Responsive Web Design", "UI/UX"],
  },
  {
    title: "Backend",
    skills: ["Node.js", "Express.js", "REST APIs", "JWT Authentication", "Role-Based Access Control (RBAC)"],
  },
  {
    title: "Databases",
    skills: ["MongoDB", "Oracle SQL", "Database Design", "Query Optimization"],
  },
  {
    title: "DevOps & Tools",
    skills: ["Git", "GitHub", "Docker", "GitHub Actions (CI/CD)", "Postman", "Vercel", "VS Code"],
  },
  {
    title: "Cybersecurity",
    skills: ["Wireshark", "Splunk", "Threat Detection", "Risk Analysis", "Network Security"],
  },
  {
    title: "Practices",
    skills: ["Agile/Scrum", "SDLC", "Unit Testing", "Debugging", "Technical Documentation", "Team Collaboration"],
  },
];

export type Project = {
  slug: string;
  title: string;
  period: string;
  stack: string[];
  description: string;
  points: string[];
  source: string | null;
  demo: string | null;
};

export const projects: Project[] = [
  {
    slug: "music-and-movies-show",
    title: "Music & Movies Show",
    period: "Sep 2026",
    stack: ["Next.js", "TypeScript", "MongoDB"],
    description:
      "Responsive movie-discovery and ticket-booking app for films, television, and anime.",
    points: [
      "Connected TMDB for film discovery and trailers, with optional Spotify OAuth/API, OMDb enrichment, and YouTube fallback.",
      "Added 2D seat-map booking and a sign-in-gated Three.js theater with five curved seating rows and on-screen trailers.",
      "Implemented email/password sign-in and cookie sessions; MongoDB stores favorites, viewing history, and confirmed bookings.",
      "Configured GitHub Actions CI checks and Vercel deployment; API rate limiting defaults to 120 requests per 60 seconds.",
    ],
    // Verified live on 2026-10-24 in the earlier static portfolio work.
    source: "https://github.com/Gautam215/Music-and-Movies-show",
    demo: "https://music-and-movies-show.vercel.app",
  },
  {
    slug: "campus-connect-portal",
    title: "Campus Connect Portal",
    period: "Jul 2024",
    stack: ["React.js", "Modular CSS", "Vercel"],
    description: "Responsive college website built with an Agile team.",
    points: [
      "Built reusable React components for navigation and page transitions.",
      "Tested the site and deployed it on Vercel.",
    ],
    source: null,
    demo: null,
  },
  {
    slug: "smart-chatbot",
    title: "Smart Chatbot",
    period: "Mar 2023",
    stack: ["React.js", "Modular CSS", "Redux Toolkit"],
    description: "AI-powered chat application with a responsive interface for multiple screen sizes.",
    points: [
      "Managed chat history and application state with Redux Toolkit to organize data flow.",
      "Built collaboratively as part of a team.",
    ],
    source: null,
    demo: null,
  },
];

export const certifications = [
  { title: "Cyber Job Simulation", issuer: "Deloitte Australia (via Forage)", date: "Jul 2026" },
  { title: "Master Mentors Geo-Enabling Indian Scholars (MMGEIS)", issuer: "Scholar recognition program", date: "Mar 2026" },
  { title: "Cyber Security", issuer: "Prodigy Infotech", date: "Dec 2025" },
  { title: "Postman API Fundamentals", issuer: "Postman", date: "Feb 2025" },
  { title: "Oracle Java Fundamentals", issuer: "Oracle", date: "Dec 2024" },
  { title: "Oracle Database Programming with SQL", issuer: "Oracle", date: "Jan 2024" },
];

export const leadership = {
  title: "Campus Ambassador — Rank #1 Nationwide",
  org: "Tryst '23, IIT Delhi",
  date: "Mar 2023",
  detail:
    "Ranked #1 among all campus ambassadors nationwide for Tryst '23. Led the points leaderboard by driving the highest event participation.",
};

export const languages = [
  { language: "Hindi", level: "Native" },
  { language: "English", level: "Conversational" },
  { language: "French", level: "Beginner" },
];
