import type { SkillCategory } from "../types";

export const skillCategories: SkillCategory[] = [
  {
    name: "Languages",
    icon: "Code2",
    skills: [
      { name: "C#", level: 88, category: "Languages" },
      { name: "SQL", level: 85, category: "Languages" },
      { name: "JavaScript", level: 92, category: "Languages" },
      { name: "TypeScript", level: 95, category: "Languages" },
    ],
  },
  {
    name: "Frameworks",
    icon: "Layers",
    skills: [
      { name: ".NET Core", level: 88, category: "Frameworks" },
      { name: ".NET MVC", level: 82, category: "Frameworks" },
      { name: "Node.js", level: 90, category: "Frameworks" },
      { name: "React.js", level: 85, category: "Frameworks" },
      { name: "Next.js", level: 82, category: "Frameworks" },
      { name: "Express.js", level: 88, category: "Frameworks" },
      
    ],
  },
  {
    name: "Databases",
    icon: "Database",
    skills: [
      { name: "PostgreSQL", level: 88, category: "Databases" },
      { name: "Cassandra", level: 85, category: "Databases" },
      { name: "Redis", level: 87, category: "Databases" },
      { name: "MongoDB", level: 80, category: "Databases" },
      { name: "SQL Server", level: 82, category: "Databases" },
      { name: "DynamoDB", level: 78, category: "Databases" },
    ],
  },
  {
    name: "Cloud & Infrastructure",
    icon: "Cloud",
    skills: [
      { name: "AWS ECS", level: 75, category: "Cloud & Infrastructure" },
      { name: "AWS EC2", level: 85, category: "Cloud & Infrastructure" },
      { name: "AWS S3", level: 88, category: "Cloud & Infrastructure" },
      { name: "AWS Lambda", level: 82, category: "Cloud & Infrastructure" },
      { name: "AWS Keyspaces", level: 82, category: "Cloud & Infrastructure" },
      { name: "AWS Cloudwatch", level: 82, category: "Cloud & Infrastructure" },
      { name: "ElastiCache", level: 80, category: "Cloud & Infrastructure" },
      { name: "Route 53 / ELB", level: 75, category: "Cloud & Infrastructure" },
    ],
  },
  {
    name: "Messaging & Architecture",
    icon: "GitBranch",
    skills: [
      { name: "Kafka", level: 82, category: "Messaging & Architecture" },
      { name: "RabbitMQ", level: 80, category: "Messaging & Architecture" },
      { name: "Microservices", level: 90, category: "Messaging & Architecture" },
      { name: "REST API Design", level: 92, category: "Messaging & Architecture" },
      { name: "Event-Driven Architecture", level: 82, category: "Messaging & Architecture" },
    ],
  },
  {
    name: "Observability",
    icon: "Activity",
    skills: [
      { name: "Kibana", level: 82, category: "Observability" },
      { name: "Grafana", level: 78, category: "Observability" },
      { name: "Structured Logging", level: 90, category: "Observability" },
      { name: "Distributed Tracing", level: 80, category: "Observability" },
    ],
  },
];

export const techStack = [
  "TypeScript",
  "C#",
  ".NET Core",
  "Node.js",
  "React",
  "Next.js",
  "PostgreSQL",
  "Cassandra",
  "Redis",
  "MongoDB",
  "DynamoDB",
  "AWS",
  "Kafka",
  "RabbitMQ",
  "Microservices",
  "Kibana",
  "Grafana",
  "Express.js",
  "REST APIs",
  "Event-Driven Architecture",
  "SQL Server",
];
