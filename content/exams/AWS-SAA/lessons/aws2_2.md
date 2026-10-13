# Design highly available and fault-tolerant architectures (S2.2)

*Module S2.2 — AWS Solutions Architect Associate SAA-C03 study track. Independent study material — see the disclaimer at the end.*

Availability is about staying up; fault tolerance is about staying correct while parts break. The exam asks you to turn business numbers — how much data can we lose, how long can we be down — into an architecture. Every question here really asks: what fails, what happens when it does, and how fast do you recover?

## Regions, Availability Zones, and Route 53

An AWS Region is a geographic cluster of data centres, and inside it Availability Zones are physically separate facilities with independent power and cooling — the unit of failure you design around. Spreading a workload across two or three zones turns one facility losing power into an inconvenience rather than an outage.

**Amazon Route 53** is DNS and also a failover tool: health checks plus failover routing send users to a secondary endpoint when the primary stops answering. Route 53 is where a multi-Region design takes effect, because DNS points users at the surviving copy.

## Finding and removing single points of failure

A single point of failure is any component whose loss takes the system down. Walk the tiers:

- One NAT gateway in one zone — route tables point every private subnet at it, so that zone's failure takes outbound access with it.
- One database instance — use Multi-AZ for automatic failover, or a read replica you can promote.
- One application instance — put several behind an ALB.
- One Region — replicate to a second Region if losing a whole Region is unacceptable.

Redundancy must be independent: two instances in one zone share that zone's fate.

## Durability and replication of data

Durability is about not losing data; availability is about being able to read it. **Amazon S3** stores objects redundantly across Availability Zones and offers cross-Region replication for a second copy. **Amazon EBS** volumes live in one zone, so a snapshot is how you move one elsewhere. **Amazon RDS** Multi-AZ keeps a synchronous standby in another zone and fails over automatically; read replicas are asynchronous and scale reads rather than guaranteeing zero data loss.

## Disaster recovery: choosing by RPO and RTO

Two numbers drive the choice: **RPO (recovery point objective)**, how much data you can afford to lose, and **RTO (recovery time objective)**, how long you can be down before it hurts. Then pick the least expensive strategy that meets them:

- **Backup and restore** — cheapest and slowest; rebuild from snapshots. RTO in hours.
- **Pilot light** — data is replicated, a minimal stack sits idle and is scaled up at failover. RTO in tens of minutes.
- **Warm standby** — a scaled-down but functional copy runs continuously; failover means redirecting traffic and scaling out. RTO in minutes.
- **Active-active** — both Regions serve traffic all the time. Fastest and most expensive, RTO near zero.

Match the strategy to the stated numbers, not to the most resilient option: "lowest cost" with an RTO of twelve hours means backup and restore.

## Automation, immutability, and quotas

Manual recovery is a hidden source of RTO: the time it takes a human to notice and act becomes part of the outage. **Immutable infrastructure** means you never patch a running server — you build a new image and replace the old one, which makes rollback predictable. Auto Scaling groups that replace unhealthy instances and infrastructure as code keep the fleet in a known state. Service **quotas** and **throttling** matter too: a Lambda function at its concurrency limit, or a throttled API, looks exactly like an outage to the caller, so request quota increases before a launch and design retries with backoff.

You also cannot fail over what you cannot see: **AWS X-Ray** traces a request across services so you can find the slow or failing hop, while CloudWatch alarms and health checks drive the automated response.

## Proxies and legacy workloads

**Amazon RDS Proxy** pools and reuses database connections, protecting a relational database from connection storms when many Lambda functions or containers connect at once and shortening failover because it holds client connections for the application. It is the answer when a legacy application cannot be changed to pool connections itself.

## Worked example: three reliability calls

1. **A single-AZ RDS instance is the only database, and failover must lose no committed transactions.** Enable Multi-AZ with a synchronous standby. A read replica is asynchronous, so promoting it can lose recent writes.
2. **The business wants the lowest-cost plan with an RTO near ten minutes and an RPO near one minute.** Use warm standby with a scaled-down but working stack in a second Region. Backup and restore misses the RTO; active-active costs far more than required.
3. **A containerised app exhausts its database connections at peak, and its code cannot be changed.** Put RDS Proxy in front of the database; resizing the instance does not address the connection churn.

## Where this leads

You can now grow a system and keep it running through failure. The next domain turns to performance: meeting a latency or throughput target rather than an availability one.

---

*This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.*
