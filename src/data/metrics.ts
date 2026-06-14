import type { Metric, Certification } from "../types";

export const metrics: Metric[] = [
  {
    label: "Years Experience",
    value: "4",
    suffix: "+",
    description: "Building production-grade distributed systems",
    icon: "Calendar",
  },
  {
    label: "Latency Reduction",
    value: "40",
    suffix: "%",
    description: "BFF layer API orchestration",
    icon: "Zap",
  },
  {
    label: "DB Refresh Speedup",
    value: "87",
    suffix: "%",
    description: "PostgreSQL materialized view optimizations",
    icon: "Database",
  },
  {
    label: "Auth Cost Savings",
    value: "60",
    suffix: "%",
    description: "Auth0 → Kinde migration",
    icon: "DollarSign",
  },
  {
    label: "Read Latency Drop",
    value: "25",
    suffix: "%",
    description: "Post Cassandra → AWS Keyspaces migration",
    icon: "TrendingDown",
  },
  {
    label: "Booking Increase",
    value: "11",
    suffix: "%",
    description: "Hotel dynamic cross-sell implementation",
    icon: "TrendingUp",
  },
];

export const certifications: Certification[] = [
  {
    name: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services",
    date: "2023",
    icon: "Cloud",
    link: "https://www.credly.com/badges/5d32563b-8bdf-4059-ada6-ac7b7fb9e504/linked_in?t=s49yl3",
  },
  {
    name: "Namaste React",
    issuer: "Namaste Dev",
    date: "2023",
    icon: "Code2",
    link: "https://drive.google.com/file/d/1J0V5omXnvhaAy4gu5_tQQECkPmNG0fFM/view",
  },
  {
    name: "Grokking the Fundamentals of System Design",
    issuer: "Educative.io",
    date: "2022",
    icon: "Server",
    link: "https://www.educative.io/verify-certificate/LY5OKCD5WM",
  },
];
