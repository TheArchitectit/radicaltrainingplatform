# Determine high-performing database solutions (S3.3)

*Module S3.3 — AWS Solutions Architect Associate SAA-C03 study track. Independent study material — see the disclaimer at the end.*

Databases scale differently from everything else, and that difference causes most design mistakes. A fleet of web servers can be doubled and forgotten; a database cannot simply be duplicated, because two copies that both accept writes disagree with each other. So the first question is never "how do I make it faster" but "which reads and writes can be separated, and which must stay together". This lesson works through engine choice, read scaling, caching, and the connection problem that appears once a fleet of servers meets one database.

## Choosing a database type

- **Relational (Amazon RDS, Amazon Aurora)** stores data in tables with a fixed schema and enforces relationships and transactions. Choose it when the access pattern involves joins and a guarantee that a group of changes all happen or none do.
- **Key-value and document (Amazon DynamoDB)** stores items addressed by a partition key, scaling horizontally with single-digit-millisecond latency. Choose it when the access pattern is known and the volume is large.
- **In-memory (Amazon ElastiCache, DynamoDB Accelerator)** keeps data in memory for microsecond reads. Choose it when the same answers are requested far more often than they change.
- **Analytical (Amazon Redshift)** stores columnar data for large scans. Choose it when the questions are "sum across millions of rows", not "fetch this one order".

**MySQL** and **PostgreSQL** differ in extensions, data types, and SQL dialect details. **Aurora** keeps the MySQL or PostgreSQL wire protocol while replacing the storage layer with a distributed, replicated volume that grows automatically. Because Aurora replicas share that volume instead of replaying every write, they typically lag far less than RDS read replicas.

## Scaling reads

A **read replica** is a copy that serves read traffic. In RDS it is a separate instance kept current by asynchronous replication, so it can lag — a read replica is not a way to read your own recent write. It is a way to take load off the primary for reporting, search, or read-heavy pages.

**Aurora** offers the same idea with up to fifteen replicas sharing the cluster volume, plus a **reader endpoint** that load-balances connections across them automatically, which removes the operational job of keeping a list of replica addresses.

The honest limitation: read replicas scale reads only. If writes saturate the primary, replicas do not help, and the answer becomes a different partition key, a queue in front of the writes, or a different database type.

## Caching

**Amazon ElastiCache** sits between the application and the database and answers repeated questions without touching the database.

- **Redis** supports rich data structures, persistence, and replication, which suits session storage, leaderboards, and caching with eviction policies.
- **Memcached** is a simple multi-threaded cache with no persistence — simpler and horizontally scalable, but with no durability and no replication.

Two patterns are worth naming. **Lazy loading** fills the cache on a miss, so it holds only what is requested, at the cost of a slow first request. **Write-through** updates the cache as data is written, so reads are always warm, at the cost of writing data that may never be read. Both need a **time to live** to bound staleness.

## Capacity planning and connections

Two numbers decide relational performance. **Instance class** decides CPU and memory; **storage** decides IOPS and throughput. Aurora charges in **Aurora Capacity Units**, and the **serverless** configuration adjusts them automatically for unpredictable workloads — a good fit for a development environment or a spiky internal tool, not for steady high-volume production.

The connection problem is subtler. Every application server that opens a connection consumes database memory, so a fleet that scales out can exhaust the connection limit even though its queries are cheap. **Amazon RDS Proxy** pools connections, letting thousands of client connections share a small number of database connections — and making failover less disruptive, because the proxy holds client connections while the database changes underneath.

## Worked example: four performance complaints

1. **A reporting query on the primary slows checkout for everyone.** Add a **read replica** and point reporting at it. Read replicas separate read load; enlarging the primary would not stop the reporting query competing for the same resources.
2. **The application re-reads the same product catalogue thousands of times a minute and the database is the bottleneck.** Put **ElastiCache** in front of it with a sensible time to live. A read replica still performs a real query each time; a cache answers without one.
3. **A Lambda-backed API exhausts database connections as it scales.** Put **RDS Proxy** in front of the database. Lambda creates a new execution environment as demand rises, and without pooling each one holds its own connection.
4. **A team must move a large MySQL workload with minimal replication lag and automatic storage growth.** Choose **Aurora MySQL**. Its replicas share the cluster volume instead of replaying writes, so lag is lower and storage grows without pre-provisioning.

## Where this leads

The data tier is in place. The next lesson covers the network that carries traffic to it — and the choices that decide how fast and how far that traffic can travel.

---

*This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.*
