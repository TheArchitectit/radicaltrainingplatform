# Design secure workloads and applications (S1.2)

*Module S1.2 — AWS Solutions Architect Associate SAA-C03 study track. Independent study material — see the disclaimer at the end.*

Lesson S1.1 decided who may act. This lesson decides what they can reach and what can reach them — a network you draw yourself, plus services that inspect traffic, hold secrets, and watch for abuse.

## A VPC is a boundary you draw yourself

A **virtual private cloud (VPC)** is a private network inside one Region, carved into **subnets** that each live in one Availability Zone. The classification that matters is public versus private, and routing decides it, not a checkbox. A subnet is **public** if its route table has a route to an **internet gateway**, and **private** if it does not — even when the instances in it hold public IP addresses.

## Security groups and network ACLs

Two filters guard the boundary, and they behave differently:

- **Security groups** attach to the resource, are **allow-only**, and are **stateful** — reply traffic for an allowed connection is permitted automatically. You cannot write a deny rule. Rules can reference other security groups, which is how you let a load balancer reach only the web tier.
- **Network ACLs** attach to the subnet, are **stateless** — you must allow both directions explicitly — and support **deny** rules evaluated in order. They are the tool when you must block a specific address range.

## Getting out without being reachable

Private instances still need outbound access for patches and API calls. Put a **NAT gateway** in a public subnet and give the private subnet's route table a default route to it. It forwards outbound traffic only. Place one per Availability Zone: a single NAT gateway is a cross-AZ single point of failure.

For traffic to AWS services, a **VPC endpoint** usually beats going out to the internet. A **gateway endpoint** for S3 or DynamoDB adds a route-table entry and keeps that traffic on the AWS network at no hourly charge; **interface endpoints** (powered by AWS PrivateLink) place an elastic network interface in your subnet for many other services. Either way the traffic never leaves the AWS network, and an endpoint policy can narrow it.

## Protecting applications: Shield and WAF

Threats arrive in different shapes:

- **AWS Shield** is the managed defence against **distributed denial-of-service (DDoS)**. Shield Standard is automatic and free; Shield Advanced adds detection, response support, and cost protection.
- **AWS WAF** inspects HTTP requests against rules and is where you stop **SQL injection** and cross-site scripting. It attaches to CloudFront, an Application Load Balancer, or API Gateway.

A volumetric flood points at Shield; crafted request payloads point at WAF.

## Keeping secrets out of code

Credentials in source code or AMIs are the classic bad practice. The right answer is almost always **AWS Secrets Manager** for database credentials and other secrets that should rotate — it integrates with RDS to rotate automatically. **Systems Manager Parameter Store** is the cheaper choice for configuration values and non-rotating secrets, with a SecureString type for sensitive ones. Both remove the secret from the repository, though neither helps if the application logs it.

## Identity for your customers

**Amazon Cognito** is for *your users*, not your administrators. User pools handle sign-up, sign-in, and tokens; identity pools exchange those tokens for temporary AWS credentials scoped by an IAM role. Reach for Cognito for a customer directory, and IAM Identity Center when employees sign in with a corporate one.

## Detecting and classifying

Two services answer "how would we find out":

- **Amazon GuardDuty** continuously analyses account activity, VPC flow logs, DNS logs, and CloudTrail for behaviour that looks like an attack — cryptocurrency mining, credential misuse, contact with known-bad addresses. It detects; it does not block.
- **Amazon Macie** discovers and classifies sensitive data in S3, such as personal information, and reports where it sits.

## Connecting back to your data center

A **site-to-site VPN** is encrypted but travels over the public internet. **AWS Direct Connect** is a dedicated private circuit with consistent latency, but it is not encrypted by itself. The answer satisfying both requirements is a VPN tunnel running **over** the Direct Connect connection.

## Worked example: three small decisions

1. **Instances in a private subnet cannot download patches.** Add a NAT gateway in a public subnet and a default route from the private route table. An internet gateway alone gives a private subnet no path out, and a load balancer does not provide outbound access either.
2. **An administrator must block a hostile address range from an entire subnet, but security group rules cannot express it.** Write a deny rule in the subnet's network ACL. Security groups are allow-only, and WAF protects HTTP at a load balancer rather than arbitrary subnet traffic.
3. **A web application is hit by injection attempts and a flood at the same time.** Use WAF for the request payloads and Shield for the volumetric attack. GuardDuty and Macie detect and classify; neither stops traffic.

## Where this leads

The workloads are now contained and inspected. The final lesson in this domain turns to the data itself: classifying it, encrypting it at rest and in transit, backing it up, and deciding how long to keep it.

---

*This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.*
