import type { Project } from "../types";

export const projects: Project[] = [
  {
    id: "api-rate-limiter",
    title: "API Rate Limiter Library",
    tagline: "Rate limiting that doesn't fall apart at scale",
    description:
      "Redis support for distributed systems, lua-scripted atomic operations, configurable limits and policies, and extensible architecture for custom implementations.",
    problem:
      "Most .NET applications implement rate limiting ad-hoc per endpoint with no shared strategy. There was no pluggable library supporting multiple algorithms, policy granularity (user, IP, endpoint), and correct distributed enforcement across multiple app instances.",
    solution:
      "Built a strategy-pattern architecture where each algorithm implements a common interface. Distributed enforcement uses Lua-scripted atomic Redis operations to guarantee correctness under concurrent load without race conditions.",
    architecture:
      "Strategy pattern with interchangeable algorithm implementations (Token Bucket, Sliding Window, Fixed Window). Redis Lua scripts perform atomic check-and-increment in a single round-trip. ASP.NET Core middleware integration allows per-route or global policies.",
    impact: [
      "Pluggable strategy architecture supporting Token Bucket, Sliding Window, and Fixed Window algorithms with per-user, per-IP, and per-endpoint policies.",
      "Distributed rate limiting via Redis with Lua-scripted atomic operations, ensuring correctness under concurrent load.",
    ],
    tech: ["C#", ".NET Core", "Redis", "Lua"],
    category: "Library",
    featured: true,
    metrics: [],
    gradient: "from-emerald-600 via-teal-500 to-cyan-400",
    github: "https://github.com/asperger99/RateLimiterLib",
    tags: ["C#", ".NET", "Redis", "Rate Limiting"],
  },
];
