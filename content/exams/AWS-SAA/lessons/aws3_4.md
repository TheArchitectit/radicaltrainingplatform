# Determine high-performing and scalable network architectures (S3.4)

*Module S3.4 — AWS Solutions Architect Associate SAA-C03 study track. Independent study material — see the disclaimer at the end.*

Networking is the layer hardest to change later, because addresses and subnets are chosen before anything is built and everything afterwards inherits them. Performance problems here come from distance, from a single path, or from a load balancer configured for the wrong traffic. This lesson covers the topology you build, the edge services that shorten the journey, the load balancer that spreads the work, and the private connections that keep traffic off the internet.

## The topology: tiers, subnets, addressing

A Virtual Private Cloud (VPC) is an isolated network with a range of IP addresses you choose. Within it, subnets divide that range and each is tied to a single Availability Zone. The **subnet tier** is the design idea: put resources that must be reachable from the internet in a **public subnet** with a route to an internet gateway, and everything else in a **private subnet** with no such route. Private resources needing outbound access use a **NAT gateway** in a public subnet, which permits connections out and none in.

Plan addressing with room to grow: a VPC of `10.0.0.0/16` carves into many `/24` subnets, and a subnet that runs out of addresses cannot accept another instance. Two structural points: span at least two Availability Zones so a tier survives a zone loss, and remember that a **security group** is stateful and attaches to resources while a **network ACL** is stateless and attaches to a subnet, which is why an ACL needs rules in both directions.

## Edge services: getting closer to the user

- **Amazon CloudFront** is a content delivery network. It caches responses at edge locations near viewers, so repeat requests never cross the ocean to your origin. It suits cacheable content and spread-out users, and works with S3, a load balancer, or any HTTP origin.
- **AWS Global Accelerator** does not cache. It gives you two static anycast IP addresses and carries traffic over the AWS global network from the nearest edge location to your endpoint. It suits content that is **not** cacheable — a live game session, a VoIP call, an API with per-user responses.

The distinction is caching versus routing: if the answer can be reused by the next user, CloudFront; if every request is unique and latency-sensitive, Global Accelerator.

## Load balancing

**Elastic Load Balancing** offers three kinds, and choosing correctly matters.

- **Application Load Balancer (ALB)** works at the request level. It understands HTTP and HTTPS, so it can route by path (`/images/*` to one target group, `/api/*` to another), by host header, and by header or query value, and it supports WebSocket and HTTP/2. Choose it for web applications and microservices.
- **Network Load Balancer (NLB)** works at the connection level. It handles TCP and UDP, preserves the client's source IP, and delivers very high throughput at very low latency. Choose it for non-HTTP protocols or when the backend must see the real client address.
- **Gateway Load Balancer** distributes traffic to third-party virtual appliances such as firewalls — a different job from serving users.


A load balancer needs a **target group** and a **health check**; the health check removes a failing target from rotation, which makes it a resilience tool rather than just a distributor.

## Connecting networks

- **AWS Site-to-Site VPN** builds an encrypted tunnel over the public internet. It is quick and cheap to start, but latency and throughput vary with the internet path.
- **AWS Direct Connect** is a dedicated private connection from your premises to AWS, with consistent latency and high bandwidth. It takes weeks to provision — the answer when steady, predictable performance is required, which is why it is often paired with a VPN as backup.
- **AWS PrivateLink** exposes a service in one VPC to consumers in another over private addresses, without peering the two networks. Peering joins two networks whose address ranges must not clash; PrivateLink publishes a single service endpoint and keeps everything else private — how a SaaS provider offers a service without exposing its whole network.

## Worked example: four connectivity decisions

1. **A global audience streams a live sports feed that must not be cached, and users report high latency.** Use **Global Accelerator**. CloudFront caches, which does not help a unique live stream.
2. **A web application must send `/images/*` to one fleet and `/api/*` to another, and terminate TLS.** Use an **ALB** with path-based rules. An NLB routes at the connection level and cannot inspect the path.
3. **A financial firm needs consistent, low-latency access to AWS and cannot tolerate internet variability.** Use **Direct Connect**, with a VPN as a failover path. A VPN alone still traverses the public internet.
4. **A partner must call one internal service but must not reach anything else in the VPC.** Publish it through **PrivateLink**. VPC peering would give the partner a route to the whole network.

## Where this leads

Traffic now has a fast path to the application. The final lesson in this domain follows the data itself — how it arrives, how it is transformed, and how it becomes something a person can look at.

---

*This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.*
