# Design cost-optimized compute solutions (S4.2)

*Module S4.2 — AWS Solutions Architect Associate SAA-C03 study track. Independent study material — see the disclaimer at the end.*

Compute is usually the largest line on an AWS bill, and it is also where the largest savings hide. The reason is that compute is billed by time as well as by size: an instance far too large costs several times what it should, and an instance correctly sized but left running through the weekend costs the same as one doing useful work. This lesson covers the three decisions that drive compute cost — how you buy, how big, and how long.

## What drives the compute bill

- **Instance hours times rate.** The rate depends on the instance family, size, Region, and purchasing option.
- **Idle capacity.** A stopped instance is not billed for compute, but an instance left running while nothing uses it is.
- **Over-provisioning.** Sizing for a peak that occurs twice a month means paying for that headroom every hour.
- **Serverless metering.** Lambda bills per request and for the duration a function runs multiplied by the memory you allocate. Allocating more memory than the code needs raises the cost of every invocation.
- **Containers.** Fargate bills for the vCPU and memory a task requests for as long as it runs; EC2-backed clusters bill for the nodes whether or not tasks are scheduled on them.

## Purchasing options

Match the option to the shape of the demand:

- **On-Demand** — no commitment, highest rate. Right for short-lived, unpredictable, or exploratory workloads.
- **Savings Plans** — a commitment to a consistent amount of usage per hour for one or three years in exchange for a lower rate. Compute Savings Plans are flexible across instance families, sizes, Regions and Fargate; EC2 Instance Savings Plans trade flexibility for a deeper discount.
- **Reserved Instances** — a commitment to a specific instance family in a specific Region. Standard reservations are the least flexible and the cheapest; convertible reservations can change family.
- **Spot Instances** — spare capacity at a steep discount, reclaimable with a short warning. Ideal for batch, rendering, and stateless work that restarts from a checkpoint.
- **Dedicated Hosts** — a physical server for licensing or compliance reasons, and the most expensive option.

The rule of thumb: cover the steady baseline with a Savings Plan or reservation, run interruptible work on Spot, and leave the unpredictable remainder On-Demand.

## Right-sizing, scaling, and hibernation

**Vertical scaling** means a bigger instance; **horizontal scaling** means more instances. Horizontal is usually cheaper: it can shrink as well as grow, and it spreads load across smaller, cheaper instance types. An Auto Scaling group with a target-tracking policy adds and removes capacity with demand, removing the standing cost of peak-sized hardware.

**Hibernation** preserves the contents of instance memory to the EBS root volume and restores it on start. It suits stateful work that takes minutes to warm up, avoiding both the compute charge while idle and the slow cold start. Instance **families** matter too: general-purpose (M), compute-optimized (C), memory-optimized (R), and Arm-based Graviton variants, which typically cost less for the same work.

## Choosing the service

**AWS Lambda** for event-driven, bursty, short-running code — you pay nothing while it is idle. **AWS Fargate** for containers without managing nodes. **Amazon EC2** when you need control of the operating system or a sustained, predictable load. **AWS Outposts** for workloads that must run on-premises while being managed with AWS tooling; it is a hybrid answer, not a cost-saving one.

## Load balancers

**Application Load Balancer** operates at Layer 7 and routes on HTTP host, path or header — the choice for web applications and microservices. **Network Load Balancer** operates at Layer 4 for TCP and UDP, handles extreme throughput and low latency, and can present a static IP address. **Gateway Load Balancer** operates at Layer 3 to insert third-party virtual appliances inline, such as firewalls and intrusion detection systems. Each carries its own capacity-unit pricing, so matching the balancer to the traffic is itself a cost decision.

## Worked example: three compute decisions

1. **A nightly batch job that can restart from a checkpoint costs as much as the production fleet.** Move it to **Spot Instances**. A reservation is cheaper than On-Demand but still pays for hours the job does not run, and it cannot be reclaimed, so the idle hours are wasted.
2. **A Lambda function is allocated 3 GB of memory but never uses more than 400 MB, and the bill is high.** Reduce the memory allocation. Lambda bills duration multiplied by allocated memory, so the excess is charged on every invocation; the saving is immediate and the alternatives do nothing about it.
3. **A service sized for a monthly peak sits at 15 percent utilisation the rest of the time.** Move it behind an Auto Scaling group with a target-tracking policy and choose a smaller instance family, or move it to Fargate so capacity follows the tasks. Buying a larger instance with a reservation locks the waste into a one-year term.

## Where this leads

Compute is now matched to demand. The next lesson turns to databases, where the cost levers are engine choice, capacity model, and how reads are served.

---

*This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.*
