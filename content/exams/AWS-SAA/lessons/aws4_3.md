# Design cost-optimized database solutions (S4.3)

*Module S4.3 — AWS Solutions Architect Associate SAA-C03 study track. Independent study material — see the disclaimer at the end.*

A database bill is rarely one number. It is an instance running by the hour, storage growing by the gigabyte, IOPS provisioned whether or not they are used, backup storage beyond the free allowance, and — easily forgotten — every read replica, which is another billable instance. Databases also punish the wrong choice of type more than any other service: force a key-value workload into a relational engine and you pay for capacity the workload never needed.

## What drives the database bill

- **Instance class and hours.** On Amazon RDS and Aurora, a larger class costs more per hour and Multi-AZ doubles the compute.
- **Storage and IOPS.** Provisioned IOPS volumes bill for the reservation, not the usage.
- **Replicas.** Each read replica is a full instance with its own compute and storage charge.
- **Backup storage.** Automated backups are retained within a window; storage beyond the free allowance is billed.
- **Capacity model.** Amazon DynamoDB can bill per request (on-demand) or per provisioned read and write capacity unit, and a provisioned table that is far larger than its traffic pays for capacity it never consumes.
- **Connections and proxies.** A proxy or pooler adds a small hourly and per-gigabyte charge but can prevent the far larger cost of scaling up to survive connection pressure.

## Choosing the type and the engine

Match the data model to the access pattern before you tune anything:

- **Relational** — Amazon RDS and Aurora, for joins, transactions and a fixed schema.
- **Key-value** — DynamoDB, for single-digit-millisecond access at any scale with a known access pattern.
- **In-memory** — ElastiCache or DynamoDB Accelerator (DAX), for a cache in front of a slower store.
- **Time series** — Amazon Timestream, for timestamped metrics.
- **Columnar analytics** — Amazon Redshift, for large aggregations over historical data.
- **Graph** — Amazon Neptune, for highly connected data.

Choosing wrongly is a cost problem before it is a performance problem, because the workarounds — bigger instances, more replicas — are what you end up paying for.

## Capacity models and elasticity

DynamoDB **on-demand** mode bills per request and suits new or spiky workloads where forecasting is hopeless; **provisioned** mode with auto scaling is cheaper once traffic is predictable, and reserved capacity lowers it further. **Aurora Serverless** adjusts capacity automatically in response to demand, which helps intermittent or unpredictable workloads that would otherwise hold a large instance idle overnight. Traditional RDS is a fixed size — you pay for the peak even at three in the morning.

## Serving reads: replicas and caching

When reads dominate, the instinct is to scale the primary instance up, and that is usually the expensive answer. **Read replicas** spread read traffic across additional instances and can be promoted during a failure. **Caching** is cheaper still when the same small set of data is requested repeatedly, because a cache hit never reaches the database at all. Note what does *not* solve a read-scaling problem: **Multi-AZ** is an availability feature — it keeps a standby for failover and is not a read-scaling mechanism.

**Amazon RDS Proxy** pools and reuses database connections. It matters most for serverless fleets, where every invocation would otherwise open its own connection and force a larger instance class purely to survive the connection count.

## Backup, retention, and migration

Retention is a cost decision as much as a compliance one. A longer automated backup window means more backup storage; manual snapshots are kept until you delete them, so orphaned snapshots accumulate silently. On DynamoDB, point-in-time recovery and on-demand backups are billed separately from table storage. When moving between engines or locations, **AWS Database Migration Service** performs the migration and **AWS Schema Conversion Tool** handles the schema; both are far cheaper than rebuilding an application around a hand-written export.

## Worked example: three database decisions

1. **A reporting application issues heavy read queries against an RDS for MySQL database, and the primary instance has been scaled up twice.** Add a **read replica** and point the reporting queries at it. Multi-AZ is for availability and does not remove read load from the primary, a larger storage volume does nothing for a CPU-bound query, and migrating to DynamoDB would require rewriting the application.
2. **A fleet of Lambda functions opens a new database connection per invocation, and the team plans a bigger instance to raise the connection limit.** Place **RDS Proxy** between the functions and the database instead. It pools connections so the instance no longer needs to be sized for the connection count, which is cheaper than the class upgrade.
3. **A DynamoDB table is provisioned for a traffic peak that lasted one afternoon.** Move the table to **on-demand** mode, or enable auto scaling on the provisioned capacity. The table is not over-sized in storage terms; the cost is in capacity units reserved but never consumed.

## Where this leads

Databases are now matched to their access pattern and their demand curve. The last lesson in this domain covers the line item people notice last: data transfer, and the routing decisions that create it.

---

*This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.*
