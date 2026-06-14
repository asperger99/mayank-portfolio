export interface Experience {
  id: string;
  company: string;
  role: string;
  level?: string;
  period: string;
  location: string;
  description: string[];
  tech: string[];
  logo?: string;
  current?: boolean;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  problem: string;
  solution: string;
  architecture: string;
  impact: string[];
  tech: string[];
  category: string;
  featured: boolean;
  metrics: { label: string; value: string }[];
  gradient: string;
  link?: string;
  github?: string;
  tags: string[];
}

export interface Skill {
  name: string;
  level: number;
  category: string;
  icon?: string;
}

export interface SkillCategory {
  name: string;
  icon: string;
  skills: Skill[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readingTime: number;
  featured: boolean;
  coverGradient: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  link?: string;
  icon?: string;
}

export interface Metric {
  label: string;
  value: string;
  suffix?: string;
  description: string;
  icon: string;
}
