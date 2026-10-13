# Design scalable and loosely coupled architectures (S2.1)

*Module S2.1 — AWS Solutions Architect Associate SAA-C03 study track. Independent study material — see the disclaimer at the end.*

Scaling and coupling decide whether a system survives its own success. This lesson covers the vocabulary and the AWS services the exam expects you to choose from when a workload has to grow and its parts must stop depending on one another.

## Scaling: horizontal versus vertical

Vertical scaling means replacing a component with a bigger one — more vCPUs, more memory, a faster instance type. It is simple and works for a database that cannot be split, but there is always a largest instance, and resizing usually means downtime.

Horizontal scaling means adding more copies of a component behind a load balancer. The copies are interchangeable, so you can add capacity during a spike and remove it afterwards, and it is the default answer when a workload is stateless. An Application Load Balancer (ALB) spreads requests across targets in several Availability Zones, runs health checks, and stops sending traffic to a target that fails them. The moment a design says "the web tier is stateless," the next words should be "behind an ALB."

Statelessness has to be real. If the web tier writes session state to local disk, instance two cannot serve instance one's user. Push session state to a shared store — ElastiCache, DynamoDB, or a signed token held by the client — and the tier becomes disposable.

## Loose coupling: queues, topics, and events

Loose coupling means one component does not need another to be up, reachable, or fast in order to do its job.

- **Amazon SQS** is a queue: one producer, consumers that pull messages, each message processed once. Use it to absorb bursts and let a slow consumer catch up without dropping work. A dead-letter queue holds messages that repeatedly fail.
- **Amazon SNS** is publish/subscribe: one message fans out to many subscribers. Use it when several systems all need to know the same thing happened.
- **Amazon EventBridge** routes events by rules, with content filtering. Use it when the routing logic is "which event, from which source" rather than "send this to everyone."

All three break the synchronous call chain. A user uploads a file, the API returns immediately, and a worker fleet scales independently to clear the backlog: the queue is the buffer that decouples the two rates.

## Serverless and containers

**AWS Lambda** runs a function in response to an event with no server to manage; you pay per invocation and duration, and concurrency scales on its own. It fits short, event-driven, bursty work and fits poorly for long-running jobs because of the 15-minute limit. **AWS Fargate** runs containers without you managing instances — the middle ground when the unit of work is a container image but you do not want a cluster of EC2 instances.

If the requirement is "move this application into containers with minimal change," the answer is a container service rather than a rewrite into Lambda. **Amazon ECS** is the simpler, AWS-native orchestrator. **Amazon EKS** is managed Kubernetes; choose it when the team already knows Kubernetes or when portability across clouds matters. Both can run on Fargate or on EC2 capacity you manage.

## APIs, edge, and caching

**Amazon API Gateway** fronts REST, HTTP, and WebSocket APIs, handling throttling, authentication, request validation, and routing to Lambda or a backend service. **Amazon CloudFront** caches content at edge locations close to users, cutting latency and offloading the origin. Caching trades freshness for speed and load — put a cache in front of a read-heavy database and it stops answering the same query a thousand times a second.

## Storage types and read replicas

- **Object** (Amazon S3) — a flat namespace of objects reached over HTTP, effectively unlimited.
- **File** (Amazon EFS) — a shared POSIX filesystem that many instances mount at once.
- **Block** (Amazon EBS) — a virtual disk attached to one instance, for a database or boot volume.

For read-heavy relational workloads, a **read replica** offloads read traffic from the primary while writes still go to the primary. Replicas also give you a promotion target if the primary fails.

## Worked example: three design calls

1. **A nightly report runs for hours and users time out waiting for it.** Move the work behind an SQS queue with a worker fleet and have the API return a job identifier immediately. A bigger web server does not fix a synchronous design, and a read replica does not help a write-side delay.
2. **A containerised app must run with no EC2 instances to patch.** Run it on ECS with the Fargate launch type. EKS on EC2 still leaves you managing nodes, and Lambda would require rewriting the application.
3. **One order event must reach billing, email, and analytics.** Publish to an SNS topic with three subscriptions, or use EventBridge rules; a single SQS queue would make the systems compete for the same message.

## Where this leads

Loose coupling and horizontal scaling let a system grow. The next lesson makes it survive: Availability Zones, failover, and the disaster recovery strategies that set how much data you can lose and how long you can be down.

---

*This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.*
