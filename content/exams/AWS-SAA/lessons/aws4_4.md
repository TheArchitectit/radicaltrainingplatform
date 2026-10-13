# Design cost-optimized network architectures (S4.4)

*Module S4.4 — AWS Solutions Architect Associate SAA-C03 study track. Independent study material — see the disclaimer at the end.*

Data transfer is the line item people find last, and it is the one that grows without anyone adding a resource: traffic simply takes a path that crosses an Availability Zone, a Region, or the public internet, and each crossing is metered. The architect's job is to know where the traffic goes before choosing the components that carry it.

## What actually drives the network bill

- **Data transfer out to the internet** — the most visible charge, and the one a CDN reduces.
- **Cross-Availability-Zone transfer** — billed in both directions when a client in one zone talks to a resource in another.
- **Cross-Region transfer** — billed between Regions, including between peered VPCs.
- **NAT gateways** — an hourly charge per gateway plus a per-gigabyte data processing charge.
- **Load balancers** — an hourly charge plus capacity units based on connections and bytes processed.
- **VPC endpoints** — interface endpoints bill hourly and per gigabyte; gateway endpoints do not.

## NAT gateways: instance, placement, and count

A **NAT gateway** is managed and scales automatically; a **NAT instance** is an EC2 instance you patch and size yourself. At low, steady volume the instance can be cheaper, but it is a single point of failure and stops being cheaper once you need two of them for resilience.

Placement drives cost as much as the choice of type. One NAT gateway per Availability Zone is resilient but multiplies the hourly charge; a single shared gateway is cheaper on hours but introduces cross-Availability-Zone data processing for the subnets that route to it, and it is a shared failure domain. The trade-off has to be made explicitly rather than by default.

## Reaching AWS services without the internet

Traffic to S3 or DynamoDB that leaves through a NAT gateway pays the NAT data processing charge on every gigabyte. A **gateway VPC endpoint** removes that entirely: it is free, and it is added as a route in the subnet's route table, so the traffic never leaves the AWS network. **Interface endpoints** (PrivateLink) work for most other services and carry their own hourly and per-gigabyte charge, usually still less than the NAT charge they replace at volume.

## Connectivity, routing, and peering

For hybrid connectivity, the options trade cost against consistency. A **Site-to-Site VPN** is quick to set up and cheap per hour, but it runs over the internet with variable latency and throughput. **Direct Connect** provides a dedicated, consistent connection with port hours plus data transfer out — expensive to start, often cheaper per gigabyte at high sustained volume, and slow to provision. Many teams run both, with the VPN as failover.

Inside AWS, **VPC peering** is the cheapest way to connect two VPCs, but it does not scale: a mesh of many VPCs becomes unmanageable. **AWS Transit Gateway** replaces the mesh with a hub, at the cost of an attachment hour plus per-gigabyte processing — usually worth it beyond a handful of VPCs.

## CDNs, DNS, and throttling

**Amazon CloudFront** caches content at edge locations, which reduces load on the origin and moves the egress to CloudFront's lower transfer rate. **Amazon Route 53** routing policies — latency-based, geolocation, weighted — direct users to the nearest healthy endpoint, reducing latency and cross-Region transfer. **AWS Global Accelerator** provides static anycast addresses and routes over the AWS backbone; it is a performance and resilience tool with its own hourly and data transfer pricing, not the first lever for pure cost. **Throttling**, at API Gateway or on the client, caps the traffic that generates transfer charges.

## Worked example: three network decisions

1. **Private EC2 instances upload large volumes to an S3 bucket in the same Region through a NAT gateway, and the NAT processing charge is high.** Add a **gateway VPC endpoint** for S3 and put it in the subnet's route table. Interface endpoints work but bill hourly and per gigabyte, a larger NAT instance does not remove the per-gigabyte charge, and Transfer Acceleration speeds up long-distance uploads without touching the NAT cost.
2. **Three Availability Zones each have their own NAT gateway, outbound traffic is modest, and a brief egress outage would be tolerable.** Consolidate to a **single NAT gateway**. Adding a fourth gateway increases the hourly charge, an internet gateway cannot serve private subnets, and moving workloads to public subnets trades a small saving for direct exposure.
3. **A service runs in one Region but most of its users are on another continent, and both latency and egress are poor.** Put **CloudFront** in front of the origin. Adding more instances in the origin Region does nothing for distant users, and Global Accelerator improves the path but does not cache, so the origin still serves every request.

## Where this leads

That closes the cost-optimized domain: storage priced by access pattern, compute matched to demand, databases sized to real load, and networks routed deliberately. Together they are the questions to ask of any architecture — what is idle, what is over-sized, what is in the wrong tier, and what is crossing a boundary it did not need to cross.

---

*This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.*
