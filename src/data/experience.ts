import type { Experience } from "../types";

export const experiences: Experience[] = [
  {
    id: "coursefinder",
    company: "Coursefinder.ai",
    role: "Senior Software Engineer",
    period: "Oct 2025 — Present",
    location: "Nagpur, Maharashtra",
    current: true,
    description: [
      "Optimized PostgreSQL-backed course search by redesigning materialized views and refresh mechanisms, reducing refresh latency by 87% (1.5 min to 20 sec), improving search freshness, and eliminating recurring CPU bottlenecks.",
      "Migrated authentication from Auth0 to Kinde with zero downtime, reducing authentication costs by ~60%.",
      "Rebuilt platform observability with async logging, centralized log management with S3 archival, and correlation IDs for distributed tracing, enabling end-to-end request tracing across services and replacing manual log hunting during incidents.",
    ],
    tech: [
      "C#",
      ".NET",
      "PostgreSQL",
      "React.js",
      "Microservices",
      "Node.js",
      "Kinde", 
      "AWS S3",
      "REST APIs"
    ],
  },
  {
    id: "jpmorgan-sde2",
    company: "JPMorgan Chase & Co.",
    role: "Software Engineer II",
    period: "Feb 2025 — Oct 2025",
    location: "Pune, Maharashtra",
    description: [
      "Led the migration of a session datastore from DSE Cassandra to AWS Keyspaces, implementing dual read/write workflows and data-access optimizations reducing P99 read latency by 25% on the session-read path serving every travel-platform request, while eliminating operational incidents related to storage and node repairs.",
      "Developed the Backend-for-Frontend (BFF) layer for the Travel Platform Configuration Portal, consolidating multiple downstream API calls into single orchestrated endpoints, cutting UI data-fetch latency by 40%.",
      "Designed and implemented an event-driven hotel content ingestion workflow using RabbitMQ and scheduled jobs, synchronizing supplier hotel static content into Chase-managed databases and reducing hotel search latency by 10% through local content availability.",
    ],
    tech: [
      "C#",
      ".NET Core",
      "AWS",
      "Cassandra",
      "RabbitMQ",
      "Microservices"
    ],
  },
  {
    id: "jpmorgan-sde1",
    company: "JPMorgan Chase & Co.",
    role: "Software Engineer I",
    period: "Jul 2022 — Jan 2025",
    location: "Pune, Maharashtra",
    description: [
      "Built Hotel Dynamic Cross-Sell as an event-driven precompute pipeline — an AWS Lambda consuming cart-add events from Kafka, executing hotel searches for the added item, and caching results in Redis with DynamoDB persistence — enabling instant upsell rendering at checkout and driving an 11% increase in hotel bookings (A/B tested).",
      "Drove application log standardization and index segregation initiative, improving system observability, reducing debugging effort by 10% and accelerating Kibana log retrieval by 20%.",
      "Split a shared Redis cluster serving 4 microservices into per-service instances, isolating cache workloads to eliminate cross-service contention, reducing cache read latency by 20% and removing a shared point of failure.",
      "Implemented mock support for Content Service dependencies, improving automation pass rates from 88% to 99%.",
    ],
    tech: [
      "C#",
      ".NET",
      "Redis",
      "Kafka",
      "AWS Lambda",
      "DynamoDB",
      "Kibana",
      "REST APIs",
      "Microservices",
    ],
  },
];
