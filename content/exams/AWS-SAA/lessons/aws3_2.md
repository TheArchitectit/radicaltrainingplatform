# Design high-performing and elastic compute solutions (S3.2)

*Module S3.2 — AWS Solutions Architect Associate SAA-C03 study track. Independent study material — see the disclaimer at the end.*

Compute is where elasticity is decided. The question is rarely "which instance type is fastest" and almost always "what should be running right now, and what decides that". A design that answers the second question scales; one that answers only the first must be resized by hand forever. This lesson covers the compute options, the scaling machinery, and the decoupling that lets each tier grow on its own.

## Choosing a compute option

- **Amazon EC2** gives you a virtual machine you manage. Choose it when you need control of the operating system or a long-running process.
- **AWS Fargate** runs containers with no servers to patch. You state a CPU and memory size and AWS places the task.
- **AWS Lambda** runs a function in response to an event, billing per invocation and duration. Choose it for short, event-driven work.
- **Amazon ECS** and **Amazon EKS** schedule containers onto either EC2 instances or Fargate. ECS is AWS-native; EKS runs Kubernetes.
- **AWS Batch** schedules batch jobs across a fleet sized to the queue; **Amazon EMR** runs distributed frameworks such as Spark.

## Elasticity: what decides to scale

**EC2 Auto Scaling** keeps a group of instances at the size demand requires. The group has a minimum, a maximum, and a desired capacity, and it needs a **launch template** describing what each instance looks like. Scaling policies are the part worth understanding:

- **Target tracking** holds a metric at a target value — average CPU at 50 percent, say — and adds or removes capacity to keep it there. It is the usual first choice because it states the goal rather than the trigger.
- **Step scaling** adds capacity in defined steps as an alarm's breach worsens, so a small spike adds one instance and a large one adds several.
- **Scheduled scaling** changes capacity at known times, which suits a predictable daily shape.

The metric matters. CPU utilisation is the common signal, but it is wrong for a queue worker, where the honest signal is **queue depth** — a worker can be idle-waiting on a slow dependency while messages pile up. Scaling on memory requires the CloudWatch agent, because memory is an operating-system statistic the hypervisor does not report by default.

Two structural prerequisites: the group must span **multiple Availability Zones**, and the instances must be **stateless** or keep their state outside the group, or a terminated instance takes its data with it. That is why a load balancer sits in front and a database behind.

**AWS Auto Scaling** applies one scaling plan to several resources at once — an Auto Scaling group, a DynamoDB table, an Aurora cluster.

## Decoupling: why queues and topics matter

If the web tier calls the processing tier synchronously, a slow processing tier makes the web tier slow, and a processing tier that is down makes the web tier fail. Decoupling breaks that link.

- **Amazon SQS** is a queue: one producer sends a message, one consumer receives it and deletes it. It suits work distribution, and a queue absorbs a spike by holding messages until workers catch up. A **dead-letter queue** captures messages that repeatedly fail.
- **Amazon SNS** is publish/subscribe: one message is delivered to every subscriber, which may be queues, Lambda functions, or HTTP endpoints. It suits fan-out — one event several systems each need to hear.

The combination is common: an SNS topic fans an event out to several SQS queues, and each queue feeds an independently scaled consumer group. The email service can now be slow without slowing billing.

## Serverless sizing

For Lambda, the memory setting is also the CPU setting — more memory buys proportionally more CPU at a higher cost per millisecond. Too little memory means slow executions that bill for longer; too much means paying for capacity the function never uses. Provisioned concurrency removes cold-start latency by keeping execution environments warm, at the cost of paying for them when idle.

## Worked example: four scaling problems

1. **A queue-backed image processor falls behind under load, but CPU on the workers never exceeds 40 percent.** Scale on **queue depth**, not CPU. The workers are waiting on a downstream service, so queue length is the signal that reflects the backlog.
2. **A web fleet must survive the loss of an Availability Zone.** Configure the Auto Scaling group across **at least two Availability Zones** with the load balancer distributing across them. A single-zone group scales but does not survive a zone failure.
3. **A single event must trigger four independent downstream systems.** Use an **SNS topic** with four subscriptions. An SQS queue delivers a message to one consumer, so four systems would compete rather than each receive it.
4. **A Lambda function times out on large payloads and bills for long, slow runs.** Increase the **memory** allocation. Because memory and CPU scale together on Lambda, more memory usually means a shorter, cheaper execution overall.

## Where this leads

Elastic compute is only useful if the data layer can keep up with it. The next lesson looks at databases, where scaling is a different problem entirely.

---

*This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.*
