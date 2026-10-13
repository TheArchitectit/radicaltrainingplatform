# AWS Certified Solutions Architect - Associate (SAA-C03) — beginner track bank

*Independent study material — see the disclaimer at the end of each lesson. Every item here is original work written for this study pack; no vendor text was lifted.*

---

## Domain 1: Design secure architectures

---

### Q1
A company's developers currently sign in with individual IAM users whose long-lived access keys are stored in a shared configuration file on a bastion host. The security team wants developers to stop handling long-lived credentials while keeping their existing corporate sign-in. What should a solutions architect do?

- A) Federate the corporate directory with IAM Identity Center and issue temporary credentials through permission sets.
- B) Create a new IAM group with a stricter password policy and require MFA on every developer IAM user.
- C) Move the existing access keys into AWS Secrets Manager and rotate them every 30 days.
- D) Copy the access keys into an encrypted Amazon S3 bucket that only the developer group can read.

**Answer: A**
Federating the directory removes the long-lived credential entirely, because IAM Identity Center issues short-lived credentials from the corporate identity. Tightening the password policy leaves the access keys in place, and moving those same keys into Secrets Manager or an S3 bucket only relocates a permanent credential rather than eliminating it.

---

### Q2
An application running on Amazon EC2 instances in one AWS account must read objects from an Amazon S3 bucket that belongs to a different account. The security team refuses to distribute IAM user access keys to the instances. Which approach meets the requirement?

- A) Create an IAM user in the bucket's account and place its access key in the instance user data.
- B) Make the bucket public and restrict access with a bucket policy that filters on the source IP address.
- C) Attach an instance profile to the instances and have the bucket policy in the bucket's account trust that role.
- D) Copy the objects into a bucket in the instance's account on a schedule by using an S3 Batch Operations job.

**Answer: C**
A role attached through an instance profile gives the instance temporary credentials that AWS rotates, and a bucket policy can name that role as an allowed principal across the account boundary. Embedding a key in user data is the hard-coded credential anti-pattern, an IP-filtered public bucket still exposes the data, and copying objects sidesteps the requirement instead of granting access.

---

### Q3
A company uses AWS Organizations with a separate account for each team. Leadership wants a guardrail that prevents anyone, including an account's own administrators, from disabling CloudTrail logging or creating resources outside the permitted Regions. Which control should a solutions architect apply?

- A) An IAM permissions boundary on every role in every account.
- B) A service control policy attached to the organizational unit.
- C) A resource policy attached to each CloudTrail trail.
- D) An AWS Config rule that reports resources outside the permitted Regions.

**Answer: B**
A service control policy sets the maximum permissions for every principal in the organizational unit, including account administrators, and it cannot be overridden locally. A permissions boundary is per-principal and editable by the account, a resource policy on a trail does not stop the trail being deleted, and an AWS Config rule reports drift after the fact rather than preventing it.

---

### Q4
What is the primary purpose of an IAM role in AWS?

- A) To hold a long-term password that a person uses to sign in to the AWS Management Console.
- B) To group IAM users so that permissions can be granted to many people at once.
- C) To define the maximum permissions that an AWS account can ever use.
- D) To grant temporary credentials to a trusted principal that assumes it.

**Answer: D**
A role carries no permanent credential; a principal that assumes it receives temporary credentials from AWS Security Token Service. A long-term sign-in password describes an IAM user, grouping users describes an IAM group, and the maximum permissions an account can use is set by a service control policy.

---

### Q5
A solutions architect must give a third-party auditing firm read-only access to a subset of resources for 90 days. The firm has its own AWS accounts and will not create IAM users in the company's account. What should the architect do?

- A) Create a cross-account IAM role with a read-only policy and a condition requiring an external ID, and have the firm assume it.
- B) Create one IAM user per auditor with a read-only policy attached, and disable those users after 90 days.
- C) Add the firm's engineers to an IAM group with a read-only policy attached and enable console access for them.
- D) Generate a long-lived access key for a read-only IAM user and share it with the firm through AWS Secrets Manager.

**Answer: A**
A cross-account role lets the firm use its own identities while the external ID condition prevents a confused-deputy attack, and access ends when the role is removed. Creating IAM users in the company's account contradicts the firm's constraint, and the last two options both distribute a long-lived credential that must be revoked manually.

---

### Q6
A web application runs on EC2 instances in a private subnet. The instances must download operating system patches from the internet, but they must not be reachable from the internet. Which component should a solutions architect add?

- A) An internet gateway attached to the VPC, with a default route added to the private subnet's route table.
- B) A NAT gateway in a public subnet, with a default route added to the private subnet's route table.
- C) An Application Load Balancer placed in front of the instances.
- D) A VPC peering connection to a shared services VPC.

**Answer: B**
A NAT gateway in a public subnet lets private instances initiate outbound traffic while blocking anything initiated from outside. An internet gateway with a route in the private route table would make the subnet public, a load balancer distributes inbound requests without providing outbound access, and VPC peering only connects two VPCs to each other.

---

### Q7
An administrator must block traffic from a specific hostile address range to an entire subnet. Security group rules cannot express the block because they only permit sources. Which control should the administrator use?

- A) An AWS WAF IP set rule attached to the Application Load Balancer.
- B) A security group outbound rule that denies the address range.
- C) A network ACL rule on the subnet that denies the address range.
- D) An AWS Shield Advanced protection group scoped to the subnet.

**Answer: C**
Network ACLs attach to the subnet and support explicit deny rules evaluated in order, which is exactly what blocking an address range requires. Security groups are allow-only, WAF inspects HTTP requests at a distribution or load balancer rather than arbitrary subnet traffic, and Shield defends against denial-of-service attacks rather than filtering a source range.

---

### Q8
A public-facing web application is receiving SQL injection attempts and a volumetric denial-of-service flood at the same time. Which two AWS services should a solutions architect use to protect the application? (Choose two.)

- A) AWS Shield Advanced, to absorb and mitigate the denial-of-service flood.
- B) AWS WAF with rules that inspect request payloads for injection patterns.
- C) Amazon GuardDuty, to absorb and mitigate the denial-of-service flood.
- D) Amazon Macie, to inspect request payloads for injection patterns.

**Answer: A, B**
Shield is the managed defence against volumetric denial-of-service attacks, and WAF inspects HTTP requests against rules and is where SQL injection is stopped. GuardDuty and Macie are detection and classification services: GuardDuty finds suspicious activity but does not absorb traffic, and Macie classifies sensitive data in Amazon S3 rather than inspecting inbound requests.

---

### Q9
What does Amazon GuardDuty do?

- A) It classifies and protects sensitive data stored in Amazon S3.
- B) It filters incoming HTTP requests against a rule set before they reach an application.
- C) It stores, rotates, and audits database credentials on behalf of an application.
- D) It continuously monitors account activity and network traffic for malicious or unauthorized behavior.

**Answer: D**
GuardDuty analyses account activity, VPC flow logs, DNS logs, and CloudTrail to find behavior that looks like an attack, and it reports findings rather than blocking traffic. Classifying data in Amazon S3 describes Macie, filtering HTTP requests describes AWS WAF, and rotating database credentials describes AWS Secrets Manager.

---

### Q10
A company needs a dedicated, private, high-bandwidth connection between its data center and AWS that does not traverse the public internet, and the traffic on that connection must be encrypted. Which solution should a solutions architect recommend?

- A) A site-to-site VPN over the internet with static routes.
- B) An AWS Direct Connect connection on its own.
- C) A VPN tunnel running over an AWS Direct Connect connection.
- D) A VPC peering connection between the data center VPC and the on-premises network.

**Answer: C**
A VPN tunnel over Direct Connect combines the dedicated private circuit with encryption, which neither component provides alone. A site-to-site VPN is encrypted but crosses the public internet, Direct Connect is private but unencrypted by default, and VPC peering connects two VPCs rather than extending a network to an on-premises data center.

---

### Q11
A compliance requirement states that data stored in Amazon S3 must be encrypted, that the company must be able to audit when and by whom each encryption key was used, and that the company must control key rotation. Which approach should a solutions architect choose?

- A) SSE-S3, because Amazon S3 manages the keys with no additional configuration.
- B) Client-side encryption with the key stored in the application configuration file.
- C) SSE-KMS using an AWS managed key.
- D) SSE-KMS using a customer managed key in AWS KMS.

**Answer: D**
A customer managed key lets the company write the key policy, configure rotation, and audit key usage through CloudTrail. SSE-S3 and AWS managed keys give no policy or rotation control, and a key held in an application configuration file is a hard-coded credential rather than a managed key.

---

### Q12
A database running on Amazon RDS must be recoverable to any point within the last 30 days, and the security team wants the backups stored in a separate account so that a compromised workload account cannot delete them. What should a solutions architect do?

- A) Enable automated backups with a 30-day retention period and use AWS Backup with a cross-account vault.
- B) Take manual snapshots each night and copy them to an Amazon S3 bucket in the same account.
- C) Enable a Multi-AZ deployment and rely on the standby instance for recovery.
- D) Add RDS read replicas in three Availability Zones.

**Answer: A**
Automated backups provide point-in-time recovery within the retention window, and AWS Backup can copy recovery points into a vault in another account so a compromise cannot reach them. Manual snapshots in the same account do not survive that compromise, while Multi-AZ and read replicas provide availability rather than historical recovery.

---

### Q13
A public website is served through Amazon CloudFront and must present a valid TLS certificate for a custom domain, with renewal happening without manual intervention. Which approach should a solutions architect use?

- A) Import a self-signed certificate into AWS Certificate Manager in the same Region as the origin bucket.
- B) Request a public certificate in AWS Certificate Manager in the us-east-1 Region and attach it to the distribution.
- C) Upload the certificate to an IAM server certificate store and attach it to an Application Load Balancer.
- D) Store the certificate in AWS Secrets Manager and reference it from the CloudFront distribution.

**Answer: B**
CloudFront reads certificates from us-east-1, and public certificates issued by AWS Certificate Manager renew automatically while the validation record exists. A self-signed certificate is not trusted by browsers, IAM server certificates are for load balancers and do not renew themselves, and Secrets Manager stores secrets rather than providing a TLS binding for a distribution.

---

### Q14
What is the purpose of an AWS KMS key policy?

- A) It lists the IAM users whose console passwords must be rotated every 90 days.
- B) It defines which AWS services may call the KMS API on behalf of the account root user.
- C) It specifies the TLS cipher suites that an Application Load Balancer will offer.
- D) It determines which principals may use or manage a customer managed key.

**Answer: D**
The key policy is the resource policy on a KMS key and it is authoritative: no IAM policy can grant access that the key policy does not allow, so it decides who may use or administer the key. Password rotation is an IAM account setting, service access to KMS is granted through the key policy or grants rather than defined by it, and cipher suites are a TLS listener setting.

---

### Q15
An application stores objects in Amazon S3 that must be retained for seven years for regulatory reasons, but any object must be retrievable within minutes if an auditor asks. Objects are rarely accessed after the first year. Which design should a solutions architect recommend?

- A) Delete the objects after one year and rely on bucket versioning for the remainder of the retention period.
- B) Move every object to Amazon S3 Glacier Deep Archive immediately after upload.
- C) Use an S3 Lifecycle policy that transitions objects to S3 Standard-IA after 30 days and to S3 Glacier Instant Retrieval after one year, expiring them at seven years.
- D) Enable S3 Cross-Region Replication and keep every object in S3 Standard for seven years.

**Answer: C**
A lifecycle policy moves rarely accessed objects to cheaper storage while the Glacier Instant Retrieval class still returns them in milliseconds, and the expiration rule enforces the seven-year retention. Versioning does not preserve objects that were deleted, Glacier Deep Archive retrieval takes hours and would fail the minutes requirement, and keeping everything in S3 Standard for seven years meets the rules but ignores the cost-optimization goal.

---

---

## Domain 2: Design resilient architectures

---

### Q16
A company runs a web application on a single large EC2 instance. During marketing campaigns the instance's CPU stays pinned at 100 percent and the site becomes slow, and the team wants the application to absorb sudden traffic increases without manual intervention. What should a solutions architect do?

- A) Replace the instance with the largest instance type available and enable detailed monitoring.
- B) Put an Amazon CloudFront distribution in front of the instance to absorb the extra traffic.
- C) Run the application on several smaller instances behind an Application Load Balancer in an Auto Scaling group.
- D) Move the application to an Amazon S3 bucket configured for static website hosting.

**Answer: C**
Adding instances behind a load balancer scales capacity horizontally and lets the Auto Scaling group react to demand on its own, which is the only option that removes the manual step. Vertical scaling has a ceiling and usually needs downtime, CloudFront only caches content and does not add compute capacity for dynamic requests, and S3 static hosting cannot run a dynamic application.

---

### Q17
A two-tier application was moved from one server to three servers behind an Application Load Balancer. Users now report being logged out at random and losing items from their shopping carts as they browse. What is the most likely cause?

- A) Session state is stored in memory or on the local disk of each instance.
- B) The load balancer is not performing health checks on the targets.
- C) The instances are spread across more than one Availability Zone.
- D) The database is not running in a Multi-AZ deployment.

**Answer: A**
With several interchangeable instances, a request can land on a server that does not hold the user's session, so the user appears logged out; moving session state to a shared store such as ElastiCache or DynamoDB fixes it. Health checks remove unhealthy targets rather than dropping sessions, spreading instances across zones does not change where state is held, and database Multi-AZ is about database failover.

---

### Q18
An image-processing service accepts uploads through an API and hands them to a fleet of workers. During traffic spikes the workers fall behind and the API returns errors, and the business cannot lose any uploaded image. What should a solutions architect do?

- A) Increase the maximum size of the worker Auto Scaling group so the fleet can grow further.
- B) Replace the workers with larger instance types that process images faster.
- C) Have the API call the workers directly and retry any call that fails.
- D) Have the API write each upload to an Amazon SQS queue that the workers poll.

**Answer: D**
A queue is the buffer that decouples the API's rate from the workers' rate: uploads are retained until a worker processes them, so nothing is lost during a spike. A larger fleet still falls behind when the spike outpaces it, bigger instances only raise the ceiling, and direct calls with retries are still synchronous and lose work while the worker is unavailable.

---

### Q19
Every time an order is created, the event must reach three independent systems: billing, email, and analytics. Each system must receive every event, and adding a fourth consumer later must not require changing the order service. Which design meets these requirements?

- A) Publish the event to an Amazon SNS topic and subscribe an Amazon SQS queue for each consuming system.
- B) Send the event to one Amazon SQS queue that all three systems poll.
- C) Write each event to an Amazon S3 bucket and have the three systems poll the bucket.
- D) Have the order service call the three systems synchronously in sequence.

**Answer: A**
An SNS topic fans one message out to every subscriber, and giving each system its own queue lets it consume at its own pace, so a new consumer is just another subscription. A single queue would make the three systems compete for each message, S3 polling is not an event-delivery mechanism, and synchronous calls couple the order service to the availability of all three systems.

---

### Q20
A solutions architect must run containerised workloads on Amazon ECS without provisioning or managing any EC2 instances. Which compute option provides this?

- A) AWS Lambda with a container image
- B) AWS Fargate
- C) Amazon EC2 Auto Scaling
- D) AWS Elastic Beanstalk

**Answer: B**
Fargate is the serverless compute engine for containers: it runs ECS and EKS tasks with no instances for you to patch. Lambda runs functions rather than long-lived container services, EC2 Auto Scaling still requires you to manage the instances, and Elastic Beanstalk provisions and manages instances on your behalf.

---

### Q21
A company wants to move a legacy Java application into containers with as little code change as possible. The operations team already runs Kubernetes elsewhere and wants to keep using its existing Kubernetes tooling and manifests. Which service should the architect recommend?

- A) AWS Lambda, packaging the application as a container image
- B) Amazon ECS with the Fargate launch type
- C) Amazon EKS
- D) AWS Elastic Beanstalk with a Docker platform

**Answer: C**
EKS is managed Kubernetes, so the team's existing manifests and tooling carry over and the container migration avoids a code rewrite. Lambda would require restructuring the application around functions, ECS uses its own task definitions rather than Kubernetes objects, and Elastic Beanstalk manages instances without offering a Kubernetes control plane.

---

### Q22
A reporting dashboard runs the same complex read query thousands of times a day against a relational database. During business hours the database is the bottleneck while write traffic is light, and the team wants to offload the reporting reads without changing the SQL or the database engine. Which change is most appropriate?

- A) Enable a Multi-AZ deployment for the database.
- B) Move the database to a larger instance type.
- C) Create a read replica and point the dashboard's read queries at it.
- D) Replace the relational database with Amazon DynamoDB.

**Answer: C**
A read replica serves read traffic from a separate copy while writes continue to the primary, so the dashboard is offloaded without changing the engine or the queries. Multi-AZ exists for failover and does not offload reads, a larger instance is a temporary fix that still serves every query, and a key-value store would require rewriting the queries.

---

### Q23
A company runs a production Amazon RDS for MySQL instance in a single Availability Zone. An outage of that zone caused two hours of downtime, and the business now requires automatic failover with no loss of committed transactions. What should the architect do?

- A) Create a read replica in another Availability Zone and promote it during an outage.
- B) Enable a Multi-AZ deployment so a synchronous standby exists in another Availability Zone.
- C) Take automated snapshots more often and restore the latest one during an outage.
- D) Move the database onto an EC2 instance in another Availability Zone.

**Answer: B**
Multi-AZ maintains a synchronous standby and fails over automatically, so no committed transaction is lost and no human has to act. A read replica replicates asynchronously and would lose the most recent writes, snapshots have that same gap plus a long restore, and a self-managed instance on EC2 moves the failover work back to the team.

---

### Q24
An application's private subnets route their outbound internet traffic through a single NAT gateway in one Availability Zone. During a test in which that Availability Zone was isolated, instances in the other Availability Zone lost all outbound internet access. How should the architect remove this single point of failure?

- A) Attach an internet gateway directly to the private subnets.
- B) Move the application instances into the public subnet.
- C) Enable cross-zone load balancing on the load balancer in front of the application.
- D) Deploy a NAT gateway in each Availability Zone and point each subnet's route table at the NAT gateway in its own zone.

**Answer: D**
A NAT gateway lives in one Availability Zone, so a subnet's route table must point at a NAT gateway in that same zone to survive a zone failure. An internet gateway would make the subnets public and exposed to inbound traffic, moving the instances to a public subnet has the same problem, and cross-zone load balancing only changes how the load balancer distributes requests.

---

### Q25
A business wants the lowest-cost disaster recovery plan that still meets an RTO of about ten minutes and an RPO of about one minute. Which strategy should the architect choose?

- A) Backup and restore, copying snapshots to a second Region.
- B) Pilot light, with data replicated to a second Region and core infrastructure kept idle.
- C) Active-active, with both Regions serving production traffic at full capacity.
- D) Warm standby, with a scaled-down but fully functional stack running in a second Region.

**Answer: D**
Warm standby keeps a working copy running, so failover is a matter of redirecting traffic and scaling out, which lands inside a ten-minute RTO at far lower cost than running both Regions at full capacity. Backup and restore and pilot light both take longer than ten minutes to reach service, and active-active exceeds the requirement at the highest cost.

---

### Q26
A legacy application opens a new database connection for every request. After it was scaled out to many containers, the database starts rejecting connections at peak load, and the application code cannot be modified. Which service should the architect use?

- A) Amazon RDS Proxy
- B) Amazon ElastiCache
- C) Amazon Route 53 health checks
- D) AWS Global Accelerator

**Answer: A**
RDS Proxy pools and reuses connections on the application's behalf, so many clients share a small number of database connections without any code change. ElastiCache caches query results but does not reduce connection counts, Route 53 health checks only affect DNS failover, and Global Accelerator improves network routing rather than database connections.

---

### Q27
Which combination of Amazon Route 53 features sends users to a secondary endpoint automatically when the primary endpoint stops responding?

- A) Weighted routing with two records of equal weight
- B) Failover routing with a health check on the primary record
- C) Simple routing with several values in one record
- D) Geolocation routing with a default record

**Answer: B**
Failover routing is built for this: a health check marks the primary unhealthy and Route 53 answers with the secondary record. Weighted routing splits traffic by proportion regardless of health, simple routing with multiple values returns all the values without failover logic, and geolocation routing selects a record by the user's location.

---

### Q28
Which statement describes how an Amazon EBS volume relates to Availability Zones?

- A) The volume is replicated across every Availability Zone in the Region.
- B) The volume exists in one Availability Zone, and a snapshot can create a volume in another zone or Region.
- C) The volume can be attached to instances in any Availability Zone in the Region at the same time.
- D) The volume is a shared file system that instances in different Availability Zones can mount.

**Answer: B**
An EBS volume is a block device scoped to one Availability Zone, and its snapshot is the portable artifact that lets you recreate the data elsewhere. It is not replicated across zones, it attaches to instances in its own zone, and shared multi-zone access is the job of Amazon EFS rather than EBS.

---

---

## Domain 3: Design high-performing architectures

---

### Q29
A company runs a MySQL database on a 500 GB gp2 EBS volume. As the dataset has grown, read latency has risen, and the team has twice enlarged the volume to restore performance. What should a solutions architect recommend?

- A) Move the database to a Throughput Optimized HDD (st1) volume
- B) Enable EBS Multi-Attach on the existing volume and mount it from two instances
- C) Move the database to a Provisioned IOPS SSD (io2) volume sized for the required IOPS
- D) Move the database files to an S3 bucket and serve reads directly from the bucket

**Answer: C**
With gp2, IOPS scale with volume capacity, which is why enlarging the volume helped at first; an io2 volume lets you state the IOPS a latency-sensitive database needs instead of buying it indirectly through size. st1 is optimised for large sequential throughput and performs poorly for random database reads, Multi-Attach shares a volume across a cluster rather than raising its performance, and a relational database cannot run on object storage.

---

### Q30
A media company uploads 400 GB video files to an S3 bucket in a region far from its office. Uploads frequently fail near completion and must restart from the beginning. What should the architect do to improve upload performance and resilience?

- A) Use S3 multipart upload with S3 Transfer Acceleration
- B) Enable S3 Versioning on the bucket
- C) Configure provisioned throughput on the bucket
- D) Change the bucket's default storage class to S3 Glacier Instant Retrieval

**Answer: A**
Multipart upload splits a large object into parts sent in parallel, so a failed part is retried alone instead of restarting the whole file, and Transfer Acceleration routes the upload through edge locations closer to the sender. Versioning only retains object versions, S3 has no provisioned throughput setting, and changing the storage class affects retrieval cost and latency rather than upload reliability.

---

### Q31
Which AWS storage service provides a shared, elastic NFS filesystem that many Linux instances can mount at the same time across multiple Availability Zones?

- A) Amazon EBS with Multi-Attach
- B) Amazon S3
- C) EC2 instance store
- D) Amazon EFS

**Answer: D**
Amazon EFS is a managed NFS filesystem whose capacity grows and shrinks with the data stored, and it can be mounted concurrently by instances in several Availability Zones. EBS Multi-Attach is limited to a small cluster of instances in a single Availability Zone, S3 is object storage reached over an HTTP API rather than mounted, and instance store is ephemeral storage physically attached to one host.

---

### Q32
An application processes messages from an SQS queue with EC2 workers managed by an Auto Scaling group. During peaks the backlog grows to hundreds of thousands of messages, but average CPU on the workers stays near 30 percent. Scaling uses a target-tracking policy on CPU utilisation. What should the architect change?

- A) Lower the target CPU value to 20 percent
- B) Replace the policy with one that scales on the queue depth metric
- C) Switch the group to a scheduled scaling policy
- D) Increase the size of the worker instances

**Answer: B**
The workers are waiting on a downstream dependency rather than being CPU-bound, so queue depth reflects the real backlog while CPU does not. Lowering the CPU target would add capacity without addressing the bottleneck, scheduled scaling cannot follow an unpredictable spike, and larger instances do not help work that is blocked waiting.

---

### Q33
A single application event must reach four independent systems: a Lambda function, two SQS queues, and an HTTPS endpoint. Each system must receive every event. What should the architect use?

- A) An SQS FIFO queue with four consumers reading from it
- B) An Application Load Balancer with four target groups
- C) Four separate SQS queues written to by the producing application
- D) An SNS topic with four subscriptions

**Answer: D**
SNS is publish/subscribe: one published message is delivered to every subscription, which is exactly the fan-out shape required. An SQS queue delivers each message to a single consumer, so four consumers would compete rather than each receiving the event; an Application Load Balancer distributes HTTP requests rather than duplicating application events; and writing to four queues from the producer couples the producer to every consumer.

---

### Q34
In AWS Lambda, what is the effect of increasing a function's configured memory?

- A) The function receives proportionally more CPU, which can shorten its execution time
- B) The function's maximum execution timeout is increased
- C) The function's reserved concurrency limit is increased
- D) The function is pinned to a dedicated Availability Zone

**Answer: A**
Lambda allocates CPU in proportion to the memory setting, so a larger memory value usually produces a faster, shorter — and therefore often cheaper — invocation. Timeout and concurrency are separate settings that memory does not affect, and Lambda execution environments are not placed in a customer-selected Availability Zone.

---

### Q35
A Lambda-backed API queries an RDS for MySQL database. As traffic grows, requests fail with too-many-connections errors even though each request runs only a small query. What should the architect do?

- A) Increase the Lambda function's reserved concurrency
- B) Convert the database to a Multi-AZ deployment
- C) Place Amazon RDS Proxy between the function and the database
- D) Add a read replica and direct all reads to it

**Answer: C**
Each Lambda execution environment opens its own database connection, so a fleet that scales out exhausts the connection limit; RDS Proxy pools and reuses connections so many clients share a few. Raising concurrency makes the problem worse, Multi-AZ adds failover rather than connection capacity, and a read replica still requires every client to hold its own connection.

---

### Q36
A reporting dashboard runs heavy read queries against the primary instance of a production RDS for PostgreSQL database, and checkout transactions have slowed. The reports may be a few minutes out of date. What is the most appropriate change?

- A) Enable Multi-AZ on the primary instance
- B) Create a read replica and direct the reporting queries to it
- C) Change the primary's storage to a Provisioned IOPS SSD volume
- D) Point the reports at Amazon Athena over the primary instance

**Answer: B**
A read replica serves read traffic from a separate instance, so the reporting queries stop competing with checkout for the primary's resources, and a few minutes of staleness is acceptable here. Multi-AZ improves availability rather than read capacity, faster storage does not separate the two workloads, and Athena queries data in S3 rather than a relational primary.

---

### Q37
A global application serves a real-time multiplayer game. Every response is unique to a player and cannot be cached, and players around the world report high latency. Which service should the architect use to reduce latency?

- A) AWS Global Accelerator
- B) Amazon CloudFront with a cache policy that forwards all headers
- C) A Network Load Balancer deployed in each region
- D) Amazon S3 Transfer Acceleration

**Answer: A**
Global Accelerator gives two static anycast IP addresses and carries traffic over the AWS global network from the nearest edge location to the endpoint, which shortens the path for traffic that cannot be cached. CloudFront helps by caching, which does nothing for unique per-player responses, a Network Load Balancer distributes connections within a region rather than shortening the global path, and Transfer Acceleration applies only to S3 uploads and downloads.

---

### Q38
Which Elastic Load Balancing option operates at the request level and can route traffic to different target groups based on URL path and host header?

- A) Network Load Balancer
- B) Gateway Load Balancer
- C) Classic Load Balancer
- D) Application Load Balancer

**Answer: D**
An Application Load Balancer understands HTTP and HTTPS, so it can inspect the path, host header, and other request attributes and route each request to a matching target group. A Network Load Balancer works at the connection level and cannot inspect the path, a Gateway Load Balancer distributes traffic to virtual appliances such as firewalls, and a Classic Load Balancer offers only basic routing.

---

### Q39
A team runs Amazon Athena queries over a data lake of CSV files in S3. The queries scan terabytes and cost far more than expected, even though each report uses only a few columns. What should the architect do?

- A) Load the data into Amazon Redshift and query it there instead
- B) Convert the data to Apache Parquet and partition it by date using AWS Glue
- C) Enable S3 Transfer Acceleration on the data lake bucket
- D) Raise the Athena workgroup's per-query data usage control limit

**Answer: B**
Athena bills by bytes scanned, so a columnar format such as Parquet lets a query read only the columns it needs, and date partitioning lets it skip the prefixes it does not. Loading into Redshift adds a warehouse the team may not need, Transfer Acceleration speeds up transfers rather than queries, and raising the data usage control limit only permits more scanning at more cost.

---

### Q40
A company ingests clickstream events continuously. Two teams must each process every event with their own logic, and each team must be able to re-read the last 24 hours of events independently. What should the architect use?

- A) A single Amazon SQS queue that both teams consume from
- B) An SNS topic that publishes to an HTTPS endpoint owned by each team
- C) Amazon Kinesis Data Streams with one consumer per team
- D) Amazon Data Firehose delivering to S3, with each team querying the objects

**Answer: C**
A Kinesis data stream retains records for a configurable period and lets each consumer read the stream independently at its own position, which supports both teams and the 24-hour replay requirement. An SQS queue gives each message to only one consumer and deletes it after processing, an SNS HTTPS endpoint delivers without retention or replay, and Firehose delivery to S3 makes events replayable only after a delivery delay and with far more query effort.

---

---

## Domain 4: Design cost-optimized architectures

---

### Q41
A solutions architect reviews an S3 bucket holding 60 TB of application logs. Objects are written continuously and are read only if an incident investigation starts within the first week; after that they are retained for seven years to satisfy a compliance policy. The bucket uses S3 Standard and the storage charge dominates the bill. What should the architect do?

- A) Add a lifecycle rule that transitions objects to S3 Standard-IA after 30 days and to S3 Glacier Deep Archive after 90 days
- B) Enable S3 Transfer Acceleration on the bucket
- C) Enable Requester Pays on the bucket
- D) Move the objects to an EBS st1 volume attached to a long-running instance

**Answer: A**
The access pattern is known and cold after the first week, so a lifecycle rule that ages objects into cheaper classes reduces the standing per-gigabyte charge while leaving the objects retrievable. Transfer Acceleration speeds up uploads and changes nothing about storage cost. Requester Pays shifts request and transfer charges to the caller, which is not appropriate for the account's own logs, and an EBS volume is block storage for a single instance and would cost more than object storage at this volume.

---

### Q42
A media company processes large video files sequentially on EC2 instances and wants the lowest cost per gigabyte for data that is actively worked on. The workload is throughput-heavy rather than latency-sensitive. Which EBS volume type should the architect choose?

- A) gp3, a general-purpose SSD volume
- B) io2, a provisioned-IOPS SSD volume
- C) st1, a throughput-optimized HDD volume
- D) sc1, a cold HDD volume

**Answer: C**
st1 is built for frequently accessed, throughput-intensive sequential workloads and costs less per gigabyte than the SSD families, which matches the video processing pattern. gp3 is cheaper than io2 but is still an SSD priced above HDD for a workload that does not need low latency. io2 bills for provisioned IOPS the workload will not consume, and sc1 is the cheapest HDD but is intended for data that is rarely accessed, not data being actively processed.

---

### Q43
What does enabling Requester Pays on an S3 bucket change?

- A) It moves objects to a colder storage class automatically as they age
- B) It encrypts objects at rest with a customer-managed key
- C) It restricts bucket access to requests that arrive through a VPC endpoint
- D) It bills the requester, rather than the bucket owner, for request and data transfer charges

**Answer: D**
Requester Pays transfers the request and data transfer charges to whoever accesses the bucket, which suits a dataset published for others to consume at their own cost. It does not manage storage classes, does not perform encryption, and does not restrict which network path a request arrives over.

---

### Q44
A batch processing workload runs for about six hours each night and can be interrupted and restarted from a checkpoint without harm if capacity is reclaimed. Cost is the primary concern. Which purchasing option should the architect recommend?

- A) Reserved Instances with a three-year term
- B) Spot Instances
- C) On-Demand Instances
- D) A Dedicated Host

**Answer: B**
Spot Instances offer spare capacity at a steep discount, and a workload that restarts from a checkpoint tolerates the short reclamation warning. A three-year reservation would pay for far more hours than the job runs and cannot be released when the job finishes. On-Demand is the most expensive per hour for a workload with no need for immediacy, and a Dedicated Host is the costliest option and is chosen for licensing or compliance reasons rather than price.

---

### Q45
A solutions architect must distribute a non-HTTP TCP protocol across instances in several Availability Zones, and the clients require a single static IP address that never changes. Which load balancer should the architect choose?

- A) Application Load Balancer
- B) Gateway Load Balancer
- C) Network Load Balancer
- D) A Classic Load Balancer

**Answer: C**
The Network Load Balancer works at Layer 4 for TCP and UDP and can present a static IP address, which is exactly what the clients require. The Application Load Balancer operates at Layer 7 and understands HTTP constructs the protocol does not use. The Gateway Load Balancer inserts virtual appliances inline rather than distributing client traffic to application targets, and the Classic Load Balancer is the older generation without a static IP guarantee.

---

### Q46
How is AWS Fargate billed?

- A) For the vCPU and memory a task requests, for the time the task runs
- B) For the EC2 instances in the cluster, whether or not tasks are scheduled on them
- C) For each request a container handles, plus the memory allocated to it
- D) For the number of container images stored in the registry

**Answer: A**
Fargate charges for the vCPU and memory that each task requests, metered for as long as the task runs, so there are no idle nodes to pay for. Billing for cluster instances regardless of task placement describes an EC2-backed cluster. Per-request billing describes a function service rather than a container service, and image storage is a registry charge unrelated to running tasks.

---

### Q47
A reporting application issues a large volume of read queries against an Amazon RDS for MySQL database. Writes are infrequent, but the read load has forced the primary instance into a larger, more expensive class. The business wants to reduce cost without changing the application's write path. What should the architect do?

- A) Enable Multi-AZ on the DB instance
- B) Increase the size of the storage volume
- C) Convert the database to a larger instance family
- D) Add a read replica and direct the reporting queries to it

**Answer: D**
Read replicas serve read traffic from separate instances, so the reporting queries stop driving the primary to a larger class, which lowers cost while leaving writes untouched. Multi-AZ maintains a standby for failover and is an availability feature rather than a read-scaling one. Enlarging the storage volume does nothing for a read-bound workload, and moving to a larger family repeats the mistake that caused the cost increase.

---

### Q48
A fleet of Lambda functions opens a new connection to an Amazon RDS for PostgreSQL database on every invocation. Under load the database rejects connections with a too-many-connections error, and the team proposes a much larger instance class to raise the connection limit. What should the architect recommend instead?

- A) Enable Multi-AZ on the database instance
- B) Place an RDS Proxy between the functions and the database
- C) Move the functions into a VPC that has a NAT gateway
- D) Switch the database to Amazon DynamoDB

**Answer: B**
RDS Proxy pools and reuses connections, so the burst of function invocations no longer consumes one database connection each, which removes the reason for the class upgrade. Multi-AZ adds a standby and does not raise the connection ceiling. A NAT gateway is a routing component with no bearing on connections, and migrating to DynamoDB would require rewriting the application's data access.

---

### Q49
A VPC has three private subnets, one per Availability Zone, and the team deployed a NAT gateway in each zone for resilience. Outbound traffic is modest, and a brief loss of egress during an Availability Zone failure would be acceptable. The NAT hourly charges are a significant part of the bill. What should the architect recommend?

- A) Replace the NAT gateways with an internet gateway attached to the private subnets
- B) Add a fourth NAT gateway in a new Availability Zone
- C) Consolidate to a single NAT gateway in one zone and point the other route tables at it
- D) Move the workloads into public subnets so no NAT gateway is needed

**Answer: C**
Reducing three NAT gateways to one cuts the hourly charge to a third, and the team has stated that a brief egress outage is acceptable; the cross-Availability-Zone data processing charge for the other zones' traffic is the trade-off to weigh. An internet gateway cannot serve private subnets, adding a fourth gateway raises the hourly charge further, and public subnets remove the NAT charge only by exposing the instances directly.

---

### Q50
EC2 instances in a private subnet upload large volumes of data to an S3 bucket in the same Region. The traffic currently leaves through a NAT gateway, and the data processing charge on the NAT gateway is high. The architect wants to remove that charge while keeping the instances private. What should the architect do?

- A) Create an S3 gateway VPC endpoint and add it to the subnet's route table
- B) Create an interface VPC endpoint for S3 in each Availability Zone
- C) Replace the NAT gateway with a NAT instance on a larger instance type
- D) Enable S3 Transfer Acceleration on the bucket

**Answer: A**
A gateway endpoint for S3 carries no hourly or data processing charge and is added as a route, so the traffic reaches S3 without passing through the NAT gateway. An interface endpoint also works but bills hourly and per gigabyte. A larger NAT instance still processes every gigabyte, and Transfer Acceleration changes the upload path to S3 rather than removing the NAT charge.

---
