import type { BlogPost } from "../types";

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "cassandra-vs-postgresql-when-to-use-what",
    title: "Cassandra vs PostgreSQL: When to Use What",
    excerpt:
      "A practical engineering guide to choosing between wide-column NoSQL and relational databases based on access patterns, consistency needs, and scale.",
    category: "Databases",
    tags: ["Cassandra", "PostgreSQL", "Databases", "System Design"],
    publishedAt: "2025-01-15",
    readingTime: 9,
    featured: true,
    coverGradient: "from-blue-600 to-cyan-500",
    content: `
## The Core Trade-off

When you're designing a data layer, the choice between Cassandra and PostgreSQL often comes down to one fundamental question: **do you know your access patterns upfront?**

PostgreSQL is a relational, ACID-compliant database that gives you flexibility at query time. You can JOIN, aggregate, and filter in almost any way you need. This flexibility comes with a cost: every query is planned at runtime, and horizontal scaling is non-trivial.

Apache Cassandra (and its managed counterpart AWS Keyspaces) flips this model entirely. In Cassandra, **you design your data model around your queries**, not the other way around. The result is linear horizontal scalability and predictable low-latency reads — but you lose the flexibility to query data in unexpected ways.

## When PostgreSQL Wins

- **Transactional consistency** is critical (financial records, inventory, user accounts)
- Your **access patterns are unpredictable** or frequently changing
- You need **complex aggregations**: GROUP BY, window functions, CTEs
- **Relational integrity** matters (foreign keys, cascading deletes)
- Your dataset fits on a **single node or small cluster** (up to ~TB scale)
- You need **full-text search** (pg_trgm, GIN indexes, tsvector)

## When Cassandra Wins

- You need **linear horizontal scalability** (hundreds of TB to PB)
- **Write-heavy workloads** with append-like patterns
- Your read patterns are **known, bounded, and partition-scoped**
- You need **multi-region active-active** replication with eventual consistency
- You're storing **time-series data**, IoT events, or activity logs
- **High availability** is more important than strong consistency

## The Cassandra Data Modeling Trap

The biggest mistake engineers make with Cassandra is importing a relational mindset. You cannot:

\`\`\`cql
-- This will fail or scan the entire cluster:
SELECT * FROM orders WHERE status = 'pending';

-- You must query by partition key:
SELECT * FROM orders_by_status WHERE status = 'pending' AND user_id = 'u123';
\`\`\`

The table \`orders_by_status\` is a **denormalized view** built specifically for this access pattern. This means if you need the same data in 3 different ways, you create 3 tables. That's not a bug — it's the design.

## PostgreSQL Materialized Views: The Middle Ground

In my work at Coursefinder.ai, I got deep into PostgreSQL's materialized views — which offer a middle ground. You can pre-compute expensive queries and store the results, refreshing them on a schedule.

The trick I discovered: **REFRESH MATERIALIZED VIEW CONCURRENTLY** is your friend for production systems. It allows reads during refresh (non-blocking) at the cost of requiring a unique index.

\`\`\`sql
-- Non-blocking refresh (requires unique index):
REFRESH MATERIALIZED VIEW CONCURRENTLY course_search_view;

-- Blocking refresh (faster, but locks reads):
REFRESH MATERIALIZED VIEW course_search_view;
\`\`\`

We cut our refresh time from 1.5 minutes to 20 seconds by:
1. Splitting a monolithic view into smaller, independently refreshable segments
2. Using concurrent refresh on the hot-path view
3. Moving aggregation work into background batch jobs

## The AWS Keyspaces Factor

If you're going Cassandra in production today, consider AWS Keyspaces over self-managed Cassandra. The operational overhead of managing Cassandra (node repairs, compaction tuning, JVM GC) is substantial. At JPMorgan Chase, we migrated to Keyspaces and eliminated an entire class of storage incidents.

Trade-offs of Keyspaces vs self-managed:
- ✅ No node management, automatic scaling
- ✅ Pay-per-request pricing available
- ⚠️ Limited CQL feature support (no LWT in serverless mode)
- ⚠️ Higher per-request cost at extreme throughput vs reserved capacity

## Decision Framework

\`\`\`
If write throughput > 50k/sec         → Cassandra
If data size > 5TB and growing fast   → Cassandra
If you need JOINs                     → PostgreSQL
If ACID transactions required         → PostgreSQL
If access patterns unknown            → PostgreSQL
If multi-region active-active needed  → Cassandra
If you need full-text search          → PostgreSQL + pg_trgm
\`\`\`

## Conclusion

After running both in production — PostgreSQL at Coursefinder.ai and Cassandra/Keyspaces at JPMorgan — my default is PostgreSQL for most applications. It handles more workloads well and its operational model is simpler. Cassandra is the right call when you've outgrown what a single relational cluster can provide or when your access patterns are genuinely write-heavy and partition-friendly.

The worst outcome is picking Cassandra too early, because the data modeling discipline it requires can slow you down before the scale benefits kick in.
    `,
  },
  {
    id: "2",
    slug: "redis-caching-strategies-production",
    title: "Redis Caching Strategies for Production Systems",
    excerpt:
      "Cache-aside, write-through, write-behind, and read-through — a deep dive into when and how to use each pattern, plus pitfalls from production.",
    category: "Backend",
    tags: ["Redis", "Caching", "Performance", "Backend"],
    publishedAt: "2025-02-20",
    readingTime: 11,
    featured: true,
    coverGradient: "from-red-600 to-rose-500",
    content: `
## Why Caching is Both Easy and Hard

Adding a cache seems simple — you read from cache, fall back to DB, store the result. What gets teams in trouble is the **cache invalidation problem**, the **thundering herd**, and **infrastructure isolation** (or the lack of it).

This post covers practical patterns from production, including the Redis segregation work I did at JPMorgan Chase.

## The Four Core Patterns

### 1. Cache-Aside (Lazy Loading)

The most common pattern. Application code manages the cache explicitly.

\`\`\`typescript
async function getCourse(id: string): Promise<Course> {
  const cached = await redis.get(\`course:\${id}\`);
  if (cached) return JSON.parse(cached);

  const course = await db.courses.findById(id);
  await redis.setex(\`course:\${id}\`, 3600, JSON.stringify(course));
  return course;
}
\`\`\`

**Pros:** Cache only contains requested data. DB failures don't break cache reads.
**Cons:** Cache miss = DB hit. First request after expiry is slow (thundering herd risk).

### 2. Write-Through

Write to cache and DB simultaneously. Cache is always warm.

\`\`\`typescript
async function updateCourse(id: string, data: Partial<Course>) {
  const updated = await db.courses.update(id, data);
  await redis.setex(\`course:\${id}\`, 3600, JSON.stringify(updated));
  return updated;
}
\`\`\`

**Pros:** Cache is always fresh. No cold-start miss on reads.
**Cons:** Write latency includes cache write. Cache fills with data that may never be read.

### 3. Write-Behind (Write-Back)

Write to cache immediately, flush to DB asynchronously. Ultra-low write latency.

**Pros:** Write latency is minimal (just cache).
**Cons:** Risk of data loss if cache fails before flush. Complex durability guarantees.

**When to use:** Click counters, view counts, shopping cart (tolerate eventual persistence).

### 4. Read-Through

Cache sits in front of DB. The cache itself handles the fallback logic.

Most useful with dedicated caching layers (like DAX for DynamoDB) rather than Redis directly.

## The Infrastructure Isolation Problem

At JPMorgan Chase, multiple microservices were sharing a single Redis cluster. This caused:

**1. Hot Key Contention**
A high-traffic service's keys dominated Redis memory and CPU, starving other services.

**2. TTL Pollution**
Service A used short TTLs for frequently-updated data. Service B relied on longer TTLs for stability. Shared namespace meant configuration conflicts and accidental overwrites.

**3. Noisy Neighbor Outages**
When Service A had a bug that hammered Redis with KEYS * commands, it caused latency spikes for Service B.

**The fix:** Segregated Redis clusters per service domain.

\`\`\`
Before: [All Services] → [Shared Redis Cluster]
After:  [Auth Service]    → [Redis Auth Cluster]
        [Search Service]  → [Redis Search Cluster]
        [Session Service] → [Redis Session Cluster]
        [Cross-service lookups] → [Shared Read-Only Cache]
\`\`\`

Result: **20% latency reduction** and zero cross-service cache incidents.

## The Thundering Herd Problem

When a popular cache key expires, multiple concurrent requests all miss and hit the DB simultaneously. For a key serving 1000 req/sec, expiry triggers 1000 simultaneous DB queries.

Solutions:

**1. Probabilistic Early Expiration (PER)**
Re-fetch cache slightly before it expires, probabilistically.

**2. Cache Stampede Prevention with Mutex**
\`\`\`typescript
async function getWithLock(key: string, fetcher: () => Promise<unknown>) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const lockKey = \`lock:\${key}\`;
  const acquired = await redis.set(lockKey, "1", "NX", "EX", 5);

  if (acquired) {
    const fresh = await fetcher();
    await redis.setex(key, 3600, JSON.stringify(fresh));
    await redis.del(lockKey);
    return fresh;
  } else {
    // Wait and retry — another process is fetching
    await sleep(100);
    return getWithLock(key, fetcher);
  }
}
\`\`\`

**3. Stale-While-Revalidate**
Serve stale data while refreshing in the background.

## Cache Key Design

Good key design prevents collisions and makes debugging sane:

\`\`\`
{service}:{entity}:{id}:{version}
course:detail:uuid-123:v1
user:session:user-456
search:results:hash-of-filters:page-2
\`\`\`

Always include a version component — it lets you instantly invalidate all keys for a schema change without flushing the entire cache.

## Monitoring Redis in Production

Essential metrics to watch:

- **Hit rate**: \`keyspace_hits / (keyspace_hits + keyspace_misses)\` — target >90%
- **Eviction rate**: \`evicted_keys\` — high eviction means memory is undersized
- **Memory fragmentation ratio**: >1.5 indicates fragmentation, consider restart
- **Replication lag**: for replica sets, monitor \`master_repl_offset - slave_repl_offset\`
- **Slow log**: \`SLOWLOG GET 10\` reveals expensive commands

## Conclusion

Redis is powerful but requires discipline. The single biggest production lesson: **isolate your Redis infrastructure per service domain**. Sharing a cluster feels pragmatic early on but becomes a reliability liability as you scale. The 20% latency win from segregation at JPMorgan was almost a bonus — the real win was resilience.
    `,
  },
  {
    id: "3",
    slug: "api-gateway-design-patterns",
    title: "API Gateway Design: Patterns and Anti-Patterns",
    excerpt:
      "From BFF to GraphQL Federation — how to design an API layer that scales with your team, not against it.",
    category: "Architecture",
    tags: ["API Gateway", "BFF", "Microservices", "Architecture"],
    publishedAt: "2025-03-10",
    readingTime: 8,
    featured: false,
    coverGradient: "from-violet-600 to-purple-500",
    content: `
## The API Layer Problem

As microservices proliferate, client teams face the N+1 API call problem: to render a single dashboard, the UI makes 10 separate API calls to 10 different services, each with their own auth, versioning, and response format.

The API Gateway pattern exists to solve this — but "API Gateway" is a broad term covering several distinct patterns with different trade-offs.

## Pattern 1: The Reverse Proxy Gateway

The simplest form. A gateway that routes requests to the correct upstream service, handles SSL termination, and enforces auth.

This is what AWS API Gateway, Kong, and Nginx-based gateways do out of the box. It solves routing and auth but does not solve the N+1 call problem — the client still makes multiple requests.

**When to use:** When your clients can handle multiple calls, or when you just need routing + auth centralization.

## Pattern 2: The Backend for Frontend (BFF)

The BFF pattern creates a dedicated API layer **per client type** (web, mobile, internal tools). Each BFF aggregates data from multiple upstream services into UI-optimized payloads.

\`\`\`
Web Client → Web BFF → [User Service, Product Service, Pricing Service]
Mobile App → Mobile BFF → [User Service, Product Service] (simpler payload)
Internal Tool → Internal BFF → [All Services + Admin APIs]
\`\`\`

**My experience at JPMorgan Chase:** We built a BFF for the Management Console that reduced the frontend's API calls from 8-12 per page load to 1-2. Latency dropped 40%.

The key design insight: the BFF is **owned by the frontend team**, not a platform team. This means the API contract evolves with UI needs, not with what's convenient for the backend.

**When to use:** When different client types have meaningfully different data needs. When frontend teams need autonomy over their API contract.

## Pattern 3: GraphQL as an API Layer

GraphQL lets clients declare exactly what data they need. The server fetches from whatever data sources are required and returns the precise shape requested.

\`\`\`graphql
query Dashboard {
  user(id: "u123") {
    name
    activeBookings {
      hotel { name, rating }
      checkIn
    }
    recommendedHotels(limit: 3) {
      name, price, rating
    }
  }
}
\`\`\`

This single query might aggregate data from 3 microservices, and the client gets exactly what it asked for — nothing more, nothing less.

**When to use:** When you have many client types with varied data needs. When over-fetching and under-fetching are real problems.

**Pitfalls:**
- N+1 query problem in resolvers (solve with DataLoader)
- Schema versioning and breaking changes are harder than REST
- Caching is more complex (no URL-based cache keys)

## Pattern 4: GraphQL Federation

At scale, a single GraphQL schema becomes a bottleneck. Federation lets each team own their slice of the schema, composed into a unified graph at the gateway.

\`\`\`
Apollo Router → Hotel Subgraph (Hotel Team)
             → User Subgraph (User Team)
             → Booking Subgraph (Booking Team)
\`\`\`

**When to use:** 10+ microservices, 3+ teams contributing to the API surface.

## Anti-Patterns to Avoid

**1. The God Gateway**
A single gateway that contains business logic, data transformation, and routing. When the gateway needs to be redeployed to add a new API, you've built a monolith in disguise.

**2. Chatty BFF**
A BFF that calls 20 upstream services synchronously per request. Fan-out calls should be parallelized, and a BFF that's always in the critical path for latency-sensitive operations is a liability.

**3. Auth Everywhere**
If every microservice re-validates JWT tokens against the auth service on every request, you've created a hidden dependency and a scalability bottleneck. Validate at the gateway; services trust the gateway.

**4. Versioning Hell**
Exposing v1, v2, v3 of the same endpoints at the gateway indefinitely. Pick a deprecation strategy and enforce it.

## Recommendation

For most teams (under 10 microservices, 2-4 frontend clients):

1. Start with a **reverse proxy gateway** (Kong, AWS API Gateway) for routing and auth
2. Add a **BFF layer** per client type as the API surface diverges
3. Migrate to **GraphQL** if client diversity creates real over/under-fetching pain
4. Consider **Federation** only when schema ownership across teams becomes a real problem

Don't jump to Federation to solve a problem you don't have yet.
    `,
  },
  {
    id: "4",
    slug: "distributed-systems-observability",
    title: "Observability in Distributed Systems",
    excerpt:
      "Logs, metrics, and traces — how to build an observability stack that actually helps you debug production incidents.",
    category: "Observability",
    tags: ["Observability", "Logging", "Distributed Systems", "DevOps"],
    publishedAt: "2025-04-05",
    readingTime: 10,
    featured: false,
    coverGradient: "from-green-600 to-emerald-500",
    content: `
## The Three Pillars of Observability

In distributed systems, "something is broken" is rarely enough information to fix anything. You need to know *what* broke, *where*, and *why*. That's what observability provides: the ability to understand the internal state of a system from its external outputs.

The three pillars are **logs**, **metrics**, and **traces**. Most teams have logs. Fewer have useful metrics. Fewer still have proper distributed tracing.

## Logs: The Foundation (Done Right)

Logs are the narrative of your system. Done poorly, they're noise. Done well, they're the first thing you reach for in an incident.

**Structured logging is non-negotiable for distributed systems:**

\`\`\`typescript
// Bad: unstructured logs
console.log("User 123 failed login from IP 1.2.3.4");

// Good: structured JSON
logger.warn({
  event: "auth.login.failed",
  userId: "123",
  ip: "1.2.3.4",
  reason: "invalid_password",
  correlationId: ctx.correlationId,
  sessionId: ctx.sessionId,
  timestamp: new Date().toISOString(),
});
\`\`\`

**Correlation IDs are the key to traceability:**

At Coursefinder.ai, I introduced correlation IDs generated at the API gateway boundary. Every log line across every service call in a single user request shares the same \`correlationId\`. In Kibana or Athena, you can reconstruct the entire request flow from a single ID.

\`\`\`typescript
// Middleware: inject correlationId at entry point
app.use((req, res, next) => {
  req.correlationId = req.headers["x-correlation-id"] ?? generateUUID();
  res.setHeader("x-correlation-id", req.correlationId);
  next();
});

// Propagate downstream via HTTP headers
const response = await fetch(upstreamUrl, {
  headers: { "x-correlation-id": req.correlationId },
});
\`\`\`

**Async logging for production:**

Synchronous logging adds latency to every request. The fix is a non-blocking log queue:

\`\`\`typescript
class AsyncLogger {
  private queue: LogEntry[] = [];
  private flushInterval = 1000; // ms

  log(entry: LogEntry) {
    this.queue.push(entry); // non-blocking
  }

  private async flush() {
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0, 500);
    await this.s3Writer.write(batch);
  }
}
\`\`\`

## Metrics: The Pulse

Metrics give you aggregated numerical signals. Where logs tell you *what happened*, metrics tell you *how often* and *at what rate*.

**Key metrics for backend services:**

- **Request rate**: requests per second per endpoint
- **Error rate**: 4xx and 5xx as % of total requests
- **Latency percentiles**: P50, P95, P99 — not averages (averages lie)
- **Saturation**: queue depth, thread pool usage, connection pool exhaustion
- **DB metrics**: query duration, connection count, slow query rate

**P99 vs P50 — why averages lie:**

If your P50 latency is 20ms but P99 is 2000ms, your average might look like 60ms — totally fine. But 1 in 100 users is getting a 2-second response. With 1000 req/sec, that's 10 users per second having a bad experience. Always look at percentiles.

## Distributed Tracing: The Thread

Traces are the thread that connects a single request across multiple services. Each service adds a "span" to the trace, and you can visualize the entire request lifecycle:

\`\`\`
Request → API Gateway (5ms)
            → Auth Service (8ms)
            → BFF Layer (45ms)
                → User Service (12ms)
                → Product Service (30ms)  ← bottleneck
                → Pricing Service (8ms)
            → Response (58ms total)
\`\`\`

Without tracing, you might know a request took 58ms but have no idea the product service caused 52% of the time.

**Instrumentation:**

\`\`\`typescript
import { trace } from "@opentelemetry/api";

async function getProductDetails(id: string) {
  const tracer = trace.getTracer("product-service");
  return tracer.startActiveSpan("getProductDetails", async (span) => {
    span.setAttribute("product.id", id);
    try {
      const result = await db.products.findById(id);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (e) {
      span.recordException(e);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw e;
    } finally {
      span.end();
    }
  });
}
\`\`\`

## The Alert Fatigue Trap

Many teams over-alert on symptoms and under-alert on causes. If your on-call engineer receives 50 alerts per incident, they'll start ignoring alerts.

**Alert on symptoms, investigate causes:**
- ✅ Alert: P99 latency > 500ms for 5 minutes
- ✅ Alert: Error rate > 1% for 2 minutes
- ❌ Don't alert on every individual log error
- ❌ Don't alert on resource utilization alone (CPU 80% may be fine)

## Stack Recommendations

| Use Case | Tool |
|---|---|
| Log aggregation | Kibana + Elasticsearch, or AWS CloudWatch + Athena |
| Metrics | Prometheus + Grafana |
| Distributed tracing | Jaeger, Zipkin, or AWS X-Ray |
| Alerting | PagerDuty, OpsGenie |
| All-in-one | Datadog, New Relic ($$) |

## Conclusion

Observability is not a post-launch concern. The best time to add correlation IDs, structured logging, and metric instrumentation is when you write the code, not after the first 3am incident.

The two changes with the highest ROI in my experience: **correlation IDs across all service calls** and **P99 latency alerts** rather than average-based thresholds.
    `,
  },
  {
    id: "5",
    slug: "microservices-migration-lessons",
    title: "Lessons from Migrating Monoliths to Microservices",
    excerpt:
      "What they don't tell you about microservices: the hidden costs, the gotchas, and when to stay monolithic.",
    category: "Architecture",
    tags: ["Microservices", "Architecture", "Migration", "Engineering"],
    publishedAt: "2025-05-01",
    readingTime: 12,
    featured: true,
    coverGradient: "from-orange-600 to-amber-500",
    content: `
## The Microservices Promise vs Reality

The pitch for microservices is compelling: independent deployability, team autonomy, technology flexibility, and horizontal scalability per service. Having worked in microservice environments at JPMorgan Chase, I want to share a more nuanced picture.

Microservices are the right call for some organizations. They're premature complexity for many others.

## What Microservices Actually Cost

Before you decompose your monolith, understand what you're signing up for:

**1. Distributed systems complexity**
Every microservice call is now a network call. Network calls fail, timeout, and have latency variance that in-process calls don't. You now need retry logic, circuit breakers, timeout handling, and bulkhead patterns.

**2. Operational overhead**
10 services = 10 deployment pipelines, 10 sets of logs to correlate, 10 services to monitor. At JPMorgan, we had dedicated SRE support. Smaller teams often underestimate this.

**3. Data consistency challenges**
In a monolith, you can do a database transaction that spans multiple operations atomically. In microservices, that's a distributed transaction — one of the hardest problems in computer science. Most teams end up using eventual consistency and sagas, which require significant design investment.

**4. Local development complexity**
Running 10 services locally requires Docker Compose or similar, and debugging a request that touches 5 services requires distributed tracing from day one.

## The Strangler Fig Pattern

The best migration strategy is the Strangler Fig — don't rewrite the monolith all at once. Instead, build new functionality as microservices and gradually migrate existing functionality.

\`\`\`
Phase 1: New feature goes to new microservice
         Monolith proxies to it

Phase 2: High-traffic existing feature extracted
         Monolith delegates to service

Phase 3: Repeat until monolith is thin routing layer

Phase 4: Decommission monolith
\`\`\`

This approach lets you validate the microservice pattern with lower risk before committing fully.

## Service Boundaries: The Hard Part

The most common mistake is decomposing by technical function rather than business capability.

**Bad decomposition (technical layers):**
\`\`\`
UserDataService  → handles all user data ops
ProductDataService → handles all product data ops
EmailService → handles all emails
\`\`\`

**Good decomposition (business capabilities):**
\`\`\`
BookingService → everything about booking (data, emails, state)
InventoryService → everything about availability
CustomerService → everything about customer profile
\`\`\`

The test: if a single user-facing feature requires coordinating 3+ services, your boundaries are wrong. The goal is for features to be delivered by one or two services.

## When to Stay Monolithic

For all the complexity microservices introduce, the right call for many teams is a well-structured monolith:

- Fewer than 5-7 engineers on the backend
- Early-stage product with frequently changing requirements
- No meaningful scale requirements yet
- No multiple teams working on the same codebase

Martin Fowler's advice remains correct: **start with a monolith**, identify the natural service boundaries that emerge from the codebase and team structure, then extract services when the pain of the monolith outweighs the cost of microservices.

## What Microservices Do Well

At JPMorgan Chase, microservices were absolutely the right call because:

- Different services had different scaling needs (booking engine: high throughput; admin APIs: low throughput)
- Multiple teams needed to deploy independently without coordination
- Different compliance requirements applied to different services
- Some services needed different tech stacks (Java for high-performance, C# for existing team expertise)

These are the conditions that justify the overhead.

## Practical Patterns That Help

**1. API Gateway + BFF reduces cross-service coupling for clients**

**2. Event-driven for non-critical async operations**
Instead of Service A calling Service B synchronously after an order is placed, emit an event. Service B consumes it asynchronously. This decouples services and improves resilience.

**3. Shared libraries (carefully)**
Shared DTOs and client libraries reduce boilerplate but create tight coupling. Keep shared libraries thin — just request/response types, not business logic.

**4. Circuit breakers everywhere**
\`\`\`typescript
const breaker = new CircuitBreaker(upstreamCall, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
});
\`\`\`

When the upstream service degrades, open the circuit instead of piling up waiting requests.

## Conclusion

Microservices are an organizational scaling pattern as much as a technical one. If your team isn't big enough to benefit from independent deployability and team autonomy, you're paying the cost without the benefit.

The path I'd recommend: build a well-structured monolith with clear domain boundaries. Let those boundaries guide your eventual service extraction. When you do extract services, do it gradually with the Strangler Fig pattern, not all at once.
    `,
  },
  {
    id: "6",
    slug: "zero-downtime-database-migrations",
    title: "Zero-Downtime Database Migrations in Production",
    excerpt:
      "How to ship schema changes, data migrations, and database platform migrations without taking your system offline.",
    category: "Databases",
    tags: ["Databases", "Migration", "PostgreSQL", "DevOps"],
    publishedAt: "2025-05-15",
    readingTime: 10,
    featured: false,
    coverGradient: "from-teal-600 to-cyan-500",
    content: `
## The Zero-Downtime Migration Challenge

Database migrations are one of the highest-risk engineering operations. A bad migration can lock tables for minutes, corrupt data, or take down production entirely. Having executed two major production migrations — Auth0 to Kinde and Cassandra to AWS Keyspaces — here are the patterns that make zero-downtime achievable.

## The Expand-Contract Pattern

The Expand-Contract pattern (also called Parallel Change) is the fundamental strategy for schema changes:

**Phase 1: Expand**
Add the new column/table/index without removing the old one. Deploy code that writes to both old and new.

\`\`\`sql
-- Safe: adds nullable column (no table lock on PostgreSQL)
ALTER TABLE users ADD COLUMN phone_normalized VARCHAR(20);
\`\`\`

**Phase 2: Migrate**
Backfill existing rows to populate the new column/table. Do this in batches to avoid lock escalation.

\`\`\`sql
-- Batch backfill (don't do this all at once on a large table)
UPDATE users
SET phone_normalized = normalize_phone(phone)
WHERE id IN (
  SELECT id FROM users
  WHERE phone_normalized IS NULL
  LIMIT 1000
);
\`\`\`

**Phase 3: Contract**
Once all data is migrated and the new column is fully populated, remove the old column. Deploy code that only uses the new column.

\`\`\`sql
-- Safe to drop now that migration is complete
ALTER TABLE users DROP COLUMN phone;
ALTER TABLE users ALTER COLUMN phone_normalized SET NOT NULL;
\`\`\`

## PostgreSQL-Specific Gotchas

**Adding a NOT NULL column is dangerous:**
\`\`\`sql
-- This takes an ACCESS EXCLUSIVE lock for the entire rewrite:
ALTER TABLE orders ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending';

-- Safe approach: add nullable, backfill, then add constraint
ALTER TABLE orders ADD COLUMN status VARCHAR(20);
UPDATE orders SET status = 'pending' WHERE status IS NULL;
ALTER TABLE orders ALTER COLUMN status SET NOT NULL;
\`\`\`

**Index creation blocks writes:**
\`\`\`sql
-- Blocks writes during index build:
CREATE INDEX idx_orders_status ON orders(status);

-- Non-blocking (takes longer but doesn't block):
CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);
\`\`\`

**Renaming columns requires the Expand-Contract pattern** — there's no zero-downtime rename.

## Platform Migration: Cassandra to AWS Keyspaces

For a full platform migration, the dual-write pattern provides the safest path:

**Step 1: Dual-write**
Write to both old and new systems simultaneously. Read from old.

**Step 2: Backfill**
Migrate historical data from old to new system with validation.

**Step 3: Shadow reads**
Read from new system in shadow mode — compare results against old system, log discrepancies, don't serve to users yet.

**Step 4: Traffic shifting**
Route read traffic progressively: 10% → 25% → 50% → 100% to new system.

**Step 5: Cutover**
Switch writes to new system only. Maintain old system as read-only fallback.

**Step 6: Decommission**
Remove old system after confidence period.

This is exactly the approach we used for the Cassandra to Keyspaces migration at JPMorgan Chase. The entire process took 4 weeks with zero data loss and zero downtime.

## Auth Migration: Auth0 to Kinde

Authentication migrations are particularly sensitive because active user sessions must not be disrupted.

**The challenge:** Users have active JWTs signed by Auth0. You can't invalidate them without logging users out. Kinde signs tokens differently.

**The solution:** Token issuer detection.

\`\`\`typescript
async function validateToken(token: string) {
  const decoded = jwt.decode(token, { complete: true });
  const issuer = decoded?.payload?.iss;

  if (issuer?.includes("kinde")) {
    return kinde.validateToken(token);
  } else if (issuer?.includes("auth0")) {
    return auth0.validateToken(token);
  }
  throw new Error("Unknown token issuer");
}
\`\`\`

New signups go to Kinde. Existing Auth0 tokens are honored until natural expiry (typically 24h-7d). No user ever gets logged out involuntarily.

## The Rollback Plan

Every migration needs a documented rollback plan before you start:

1. What is the trigger condition for rollback?
2. How long does rollback take?
3. Is rollback possible at each stage?
4. What data loss is acceptable during rollback?

For the Cassandra migration, our rollback trigger was: >5% read error rate after traffic shifting begins. The rollback was simply routing traffic back to Cassandra — execution time under 2 minutes.

## Monitoring During Migration

Set up dashboards for:
- Error rates on both old and new systems
- Data consistency validation results
- Latency percentiles on both paths
- Write success rates on both systems (during dual-write phase)

Automate rollback if error rates exceed thresholds. Don't rely on a human to catch a runaway migration at 2am.

## Conclusion

Zero-downtime migrations are achievable but require discipline: thorough planning, incremental execution, validation at each step, and a tested rollback plan. The Expand-Contract pattern handles schema changes. Dual-write with progressive traffic shifting handles platform migrations. Neither is fast — both are safe.

The worst migrations I've seen were rushed. The best ones were boring.
    `,
  },
  {
    id: "7",
    slug: "rate-limiting-strategies",
    title: "Rate Limiting: Algorithms and Production Strategies",
    excerpt:
      "Token bucket, sliding window, leaky bucket — how to implement rate limiting that actually works at scale.",
    category: "Backend",
    tags: ["Rate Limiting", "Backend", "Redis", "API Design"],
    publishedAt: "2025-04-20",
    readingTime: 7,
    featured: false,
    coverGradient: "from-indigo-600 to-blue-500",
    content: `
## Why Rate Limiting Matters

Rate limiting is your first line of defense against API abuse, DDoS amplification, and noisy clients that accidentally hammer your system. Implementing it wrong causes false positives (legitimate users throttled) or false negatives (bad actors not throttled). Here are the algorithms and trade-offs.

## Algorithm 1: Fixed Window Counter

The simplest approach. Count requests per time window (e.g., 100 requests per minute).

\`\`\`typescript
async function fixedWindowRateLimit(userId: string, limit: number) {
  const window = Math.floor(Date.now() / 60000); // 1-minute windows
  const key = \`ratelimit:\${userId}:\${window}\`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60);
  return count <= limit;
}
\`\`\`

**Problem:** A user can send 100 requests at 00:59 and 100 more at 01:00 — 200 requests in 2 seconds, effectively bypassing the limit.

## Algorithm 2: Sliding Window Log

Record the timestamp of each request. Count requests within the sliding window.

**Accurate but memory-intensive** — each request creates a log entry. Not suitable for high-throughput APIs.

## Algorithm 3: Sliding Window Counter (Best Trade-off)

Approximate sliding window using two fixed windows and weighted counting.

\`\`\`typescript
async function slidingWindowRateLimit(
  userId: string,
  limit: number,
  windowMs: number
) {
  const now = Date.now();
  const currentWindow = Math.floor(now / windowMs);
  const prevWindow = currentWindow - 1;
  const windowProgress = (now % windowMs) / windowMs;

  const [current, prev] = await redis.mget(
    \`rl:\${userId}:\${currentWindow}\`,
    \`rl:\${userId}:\${prevWindow}\`
  );

  const prevCount = parseInt(prev ?? "0");
  const currentCount = parseInt(current ?? "0");

  // Weighted count: weight previous window by how far into current window we are
  const weightedCount = prevCount * (1 - windowProgress) + currentCount;

  if (weightedCount >= limit) return false;

  await redis.incr(\`rl:\${userId}:\${currentWindow}\`);
  await redis.expire(\`rl:\${userId}:\${currentWindow}\`, Math.ceil(windowMs / 1000) * 2);
  return true;
}
\`\`\`

This is accurate within ~0.1% of a true sliding window and uses O(1) memory per user.

## Algorithm 4: Token Bucket

Tokens are added at a fixed rate. Each request consumes a token. Burst allowed up to bucket capacity.

\`\`\`typescript
async function tokenBucketRateLimit(
  userId: string,
  capacity: number,
  refillRate: number // tokens per second
) {
  const key = \`tb:\${userId}\`;
  const now = Date.now() / 1000;

  const data = await redis.hgetall(key);
  const lastRefill = parseFloat(data?.lastRefill ?? String(now));
  const tokens = parseFloat(data?.tokens ?? String(capacity));

  const elapsed = now - lastRefill;
  const newTokens = Math.min(capacity, tokens + elapsed * refillRate);

  if (newTokens < 1) return false;

  await redis.hset(key, {
    tokens: String(newTokens - 1),
    lastRefill: String(now),
  });
  await redis.expire(key, 3600);
  return true;
}
\`\`\`

Token bucket naturally handles bursts — a user who hasn't made requests for a while has a full bucket and can burst up to capacity.

## Distributed Rate Limiting

Single-instance Redis works for moderate traffic. For extreme throughput, consider:

**1. Redis Cluster with consistent hashing**
Route each user's rate limit key to the same shard.

**2. Local + Global counters**
Count in-process first (fast), sync to Redis periodically. Accept slight over-counting as a trade-off for throughput.

**3. Envoy / Kong plugins**
For API gateways, delegate rate limiting to the gateway layer using Envoy's token bucket or Kong's rate-limiting plugin.

## Response Headers (Do This)

Always include rate limit headers so clients can self-regulate:

\`\`\`
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1716890400
Retry-After: 30
\`\`\`

## Recommendation

For most production APIs: **sliding window counter** is the right choice. It's accurate, memory-efficient, and handles the edge cases that fixed window misses. Token bucket is better when you want to explicitly allow burst traffic.

Always implement rate limiting at the gateway layer, not just in application code — it's more efficient and ensures even bot traffic that bypasses your app still hits limits.
    `,
  },
  {
    id: "8",
    slug: "scaling-postgres-read-replicas",
    title: "Scaling PostgreSQL: Read Replicas and Connection Pooling",
    excerpt:
      "Horizontal read scaling with replicas, PgBouncer connection pooling, and query routing patterns for high-traffic PostgreSQL.",
    category: "Databases",
    tags: ["PostgreSQL", "Scaling", "Performance", "Databases"],
    publishedAt: "2025-03-25",
    readingTime: 8,
    featured: false,
    coverGradient: "from-sky-600 to-blue-500",
    content: `
## PostgreSQL at Scale

PostgreSQL is impressively capable on a single node — with proper indexing and tuning, a well-configured instance can handle tens of thousands of transactions per second. But read-heavy workloads eventually exhaust single-node capacity. Here's how to scale reads horizontally.

## Read Replicas

PostgreSQL's streaming replication allows you to create read replicas that receive a continuous stream of WAL (Write-Ahead Log) records from the primary. Reads can be routed to replicas; writes go to the primary.

**Replication lag is the key trade-off.** Replicas are eventually consistent with the primary. For most read workloads (dashboards, search, reports) this is acceptable. For "read your own writes" scenarios (user updates their profile and immediately sees the change), you need sticky reads or route those reads to the primary.

**Query routing strategies:**

\`\`\`typescript
class DatabasePool {
  private primary: Pool;
  private replicas: Pool[];

  async query(sql: string, params?: unknown[], options?: { readOnly?: boolean }) {
    // Always write to primary
    if (!options?.readOnly) {
      return this.primary.query(sql, params);
    }

    // Load-balance reads across replicas
    const replica = this.replicas[Math.floor(Math.random() * this.replicas.length)];
    return replica.query(sql, params);
  }
}
\`\`\`

## Connection Pooling with PgBouncer

PostgreSQL creates a new OS process per connection. At 1000 concurrent connections, you're running 1000 processes. This doesn't scale.

PgBouncer sits between your application and PostgreSQL, maintaining a small pool of long-lived connections to Postgres and accepting many short-lived connections from your application.

**Transaction-mode pooling** (recommended for most apps):
\`\`\`ini
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
\`\`\`

With 20 Postgres connections, PgBouncer can handle 1000 application connections. The trade-off: you can't use session-level features like prepared statements or advisory locks across transactions in transaction mode.

## Index Design for Read Performance

The biggest read performance lever is indexes. But indexes have costs too — they slow down writes and consume memory.

**Covering indexes** eliminate table heap lookups:
\`\`\`sql
-- Without covering index: index scan + heap fetch for each row
CREATE INDEX idx_courses_category ON courses(category);

-- With covering index: index scan only, no heap fetch
CREATE INDEX idx_courses_category_covering ON courses(category)
  INCLUDE (title, price, rating);
\`\`\`

**Partial indexes** for selective queries:
\`\`\`sql
-- Full index on all courses
CREATE INDEX idx_all_courses ON courses(created_at);

-- Partial index only on published courses (much smaller)
CREATE INDEX idx_published_courses ON courses(created_at)
  WHERE status = 'published';
\`\`\`

## EXPLAIN ANALYZE: The Essential Tool

Before optimizing any query, run EXPLAIN ANALYZE:

\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT c.*, COUNT(e.id) as enrollment_count
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id
WHERE c.category = 'programming'
GROUP BY c.id
ORDER BY enrollment_count DESC
LIMIT 20;
\`\`\`

Look for:
- **Seq Scan** on large tables — usually indicates a missing index
- **Hash Join** vs **Nested Loop** — hash join is better for large datasets
- **Buffers: hit vs read** — high read count means data isn't in shared buffers (cache miss)
- **Actual rows vs estimated rows** — large discrepancy means stale statistics, run ANALYZE

## Materialized Views for Complex Aggregations

For dashboard queries that aggregate large datasets, materialized views pre-compute the results:

\`\`\`sql
CREATE MATERIALIZED VIEW course_stats AS
SELECT
  c.id,
  c.title,
  c.category,
  COUNT(DISTINCT e.user_id) as student_count,
  AVG(r.rating) as avg_rating,
  SUM(p.amount) as total_revenue
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id
LEFT JOIN ratings r ON r.course_id = c.id
LEFT JOIN payments p ON p.course_id = c.id
GROUP BY c.id, c.title, c.category;

CREATE UNIQUE INDEX ON course_stats(id); -- required for CONCURRENTLY
\`\`\`

The CONCURRENTLY approach I used at Coursefinder.ai reduced our refresh time by 87% compared to blocking refreshes.

## Summary

Scale PostgreSQL reads in this order:
1. **Index optimization** — biggest bang per effort
2. **Connection pooling (PgBouncer)** — prevents connection exhaustion
3. **Materialized views** — pre-compute expensive aggregations
4. **Read replicas** — horizontal read scaling when single node CPU is the bottleneck
5. **Partitioning** — for very large tables (100M+ rows)

Don't jump to read replicas until you've exhausted query optimization. The most common PostgreSQL "scaling problem" is actually just a missing index.
    `,
  },
  {
    id: "9",
    slug: "url-shortener-system-design",
    title: "Designing a URL Shortener at Scale",
    excerpt:
      "End-to-end system design for a URL shortener handling 100M daily redirects — ID generation, caching, analytics, and global distribution.",
    category: "System Design",
    tags: ["System Design", "Distributed Systems", "Caching", "Architecture"],
    publishedAt: "2025-02-01",
    readingTime: 13,
    featured: true,
    coverGradient: "from-pink-600 to-rose-500",
    content: `
## Requirements

**Functional:**
- Create short URLs from long URLs
- Redirect short URLs to long URLs
- Custom aliases (optional)
- Analytics: click counts, referrers, geography
- URL expiry support

**Non-functional:**
- 100M redirects/day (~1,150/sec average, 10x peak = 11,500/sec)
- <50ms redirect latency globally
- 99.99% availability for redirects
- 5-year URL persistence

## Capacity Estimation

\`\`\`
Reads:  100M/day = 1,150/sec avg, ~11,500/sec peak
Writes: ~1M new URLs/day = 12/sec avg
Storage: 500 bytes/URL × 365 days × 5 years × 1M/day = ~900 GB
\`\`\`

Read-heavy ratio: ~100:1. This informs our caching strategy heavily.

## Short Code Generation

The core challenge: generate 7-character unique codes for URLs.

**Option 1: MD5 / Hash the URL**
\`\`\`
MD5("https://example.com/very-long-url") = "a1b2c3d4e5f6..."
Take first 7 chars: "a1b2c3d"
\`\`\`
Problem: collision risk increases with scale. Same long URL → same short code (good? bad?). Need collision detection.

**Option 2: Counter-based with Base62 encoding**
Use a distributed counter and encode in base62 (a-z, A-Z, 0-9).

\`\`\`typescript
const BASE62 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function toBase62(n: number): string {
  let result = "";
  while (n > 0) {
    result = BASE62[n % 62] + result;
    n = Math.floor(n / 62);
  }
  return result.padStart(7, "a");
}
\`\`\`

Problem: sequential counters are predictable and require a distributed counter service.

**Option 3: Snowflake ID (Recommended)**
Twitter's Snowflake ID: 64-bit ID = timestamp (41 bits) + datacenter (5 bits) + worker (5 bits) + sequence (12 bits). Globally unique, time-ordered, no coordination needed.

Base62-encode the Snowflake ID to get a short code. This is the approach I'd use in production.

## Database Design

\`\`\`sql
CREATE TABLE urls (
  id BIGINT PRIMARY KEY,          -- Snowflake ID
  short_code CHAR(7) UNIQUE NOT NULL,
  long_url TEXT NOT NULL,
  user_id BIGINT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  click_count BIGINT DEFAULT 0
);

CREATE INDEX idx_short_code ON urls(short_code);
CREATE INDEX idx_user_id ON urls(user_id);

-- Separate analytics table (high write volume)
CREATE TABLE url_clicks (
  id BIGSERIAL,
  short_code CHAR(7) NOT NULL,
  clicked_at TIMESTAMP NOT NULL,
  ip_address INET,
  referrer TEXT,
  country CHAR(2),
  device_type VARCHAR(20)
) PARTITION BY RANGE (clicked_at);
\`\`\`

The analytics table uses time-based partitioning — each partition covers one month, making it easy to archive or delete old click data.

## Caching Strategy

With 100:1 read-write ratio, caching is critical.

**Multi-tier caching:**

1. **CDN Layer (Cloudflare/CloudFront)**: Cache redirects at edge for ~80% of traffic. 301 redirects are cacheable; 302 are not. Use 302 for analytics tracking, 301 for maximum caching.

2. **Redis Layer**: Cache short_code → long_url mapping.
   \`\`\`
   Cache hit rate target: >95%
   Key: url:{short_code}
   Value: long_url (string)
   TTL: 24 hours
   Estimated hot keys: top 20% of URLs = 80% of traffic (Pareto)
   \`\`\`

3. **Application Cache (LRU in-process)**: Ultra-hot keys in application memory. ~10k keys, <1ms lookup.

## System Architecture

\`\`\`
Client → CDN (Global Edge) → Load Balancer → Redirect Service
                                           ↓
                                        Redis Cache
                                           ↓ (cache miss)
                                        PostgreSQL (primary)

         Write Service → PostgreSQL (primary)
                      → Kafka (click events)
                      → Analytics Consumer → Analytics DB
\`\`\`

**Key design decisions:**
- Redirect path is completely separate from write path
- Analytics are async (Kafka consumer) — click tracking doesn't add latency to redirects
- Redis sits in same region as app servers for <1ms cache reads

## Handling Custom Aliases

Custom aliases need uniqueness checking. Two approaches:

1. **Optimistic**: Try to INSERT, catch unique constraint violation and retry
2. **Check-then-act**: SELECT first, then INSERT. Race condition risk — use transactions with SERIALIZABLE isolation or SELECT FOR UPDATE.

For production, optimistic insert with retry is simpler and correct.

## URL Expiry

Don't rely on active deletion for expired URLs. Use lazy expiry:

\`\`\`typescript
async function resolveUrl(shortCode: string): Promise<string | null> {
  const url = await getFromCacheOrDb(shortCode);
  if (!url) return null;
  if (url.expiresAt && url.expiresAt < new Date()) {
    // Lazy delete from cache
    await redis.del(\`url:\${shortCode}\`);
    return null;
  }
  return url.longUrl;
}
\`\`\`

A background job runs nightly to clean expired records from the DB.

## Global Distribution

For <50ms globally, deploy in 3+ regions:
- US East (primary write region)
- EU West
- Asia Pacific

**Cross-region replication:**
- Writes go to primary (US East) and replicate asynchronously
- Reads go to local region (stale by ~100ms — acceptable for redirects)
- Conflict resolution is simple: short codes are globally unique, no conflict possible

## Performance at Scale

\`\`\`
Target: 11,500 req/sec at P99 < 50ms

Cache hit path: Redis lookup (1ms) + HTTP redirect = ~5ms
Cache miss path: Redis miss + DB query (5ms) + cache write = ~15ms

Estimated cache hit rate: 95%
Effective P99: 0.95 × 5ms + 0.05 × 15ms = ~5.5ms

Well within the 50ms budget even at 10x peak.
\`\`\`

## Conclusion

URL shorteners are a classic system design interview problem because they touch all the fundamentals: unique ID generation, caching strategy, database design, and global distribution. The interesting decisions are:

1. **Snowflake IDs** for globally unique, coordination-free code generation
2. **302 redirects** with async analytics via Kafka (vs 301 for pure performance)
3. **Multi-tier caching** (CDN → Redis → L1) to handle the extreme read-heavy ratio
4. **Partitioned analytics table** for manageable data volume at scale
    `,
  },
];
