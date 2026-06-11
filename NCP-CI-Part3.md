# NCP-CI 6.10 — Part 3: Advanced MCQ Questions (80 Questions)

> **Exam Focus:** Nutanix Cloud Integration — NC2 on AWS & Azure, Networking, Storage, Licensing, DR/Migration, Troubleshooting, Prism Central Multi-Cloud, and Security.

---

## Domain 1 — AWS vs Azure NC2 Differences (Q1–Q10)

### Q1
An architect is sizing an NC2 deployment. On AWS, the bare-metal instance type used for NC2 nodes is:

- A) m5.metal
- B) i3.metal
- C) r5.metal
- D) c5.metal

**Correct Answer: B**
**Explanation:** NC2 on AWS runs exclusively on **i3.metal** bare-metal instances, which provide local NVMe SSD storage consumed by Nutanix DSF. The other metal instance families are not supported for NC2.

---

### Q2
What is the Azure equivalent of the bare-metal host type used for NC2?

- A) Azure Dedicated Host (Dsv3-Type1)
- B) Azure BareMetal Infrastructure
- C) Azure VMware Solution Host
- D) Azure Stack HCI Node

**Correct Answer: B**
**Explanation:** NC2 on Azure leverages **Azure BareMetal Infrastructure**, providing dedicated physical servers. Azure Dedicated Hosts and Azure VMware Solution use different underlying architectures not compatible with NC2.

---

### Q3
NC2 on AWS connects the Nutanix cluster to customer workloads via:

- A) Azure VNet Peering
- B) AWS VPC with delegated subnets
- C) AWS Outposts local gateway
- D) AWS Transit Gateway only

**Correct Answer: B**
**Explanation:** On AWS, NC2 clusters are deployed within an **AWS VPC** using delegated subnets. The management and data planes reside in this VPC, and customer workloads connect through standard VPC networking constructs.

---

### Q4
On Azure, the NC2 cluster's networking is anchored to which construct?

- A) AWS VPC
- B) Azure Virtual Network (VNet) with delegated subnets
- C) Azure ExpressRoute circuit exclusively
- D) Azure Virtual WAN Hub

**Correct Answer: B**
**Explanation:** NC2 on Azure deploys into an **Azure VNet** with delegated subnets for bare-metal hosts. This is the Azure analog to the VPC-based deployment on AWS.

---

### Q5
A company needs a dedicated, private connection from their on-premises data center to NC2 on AWS. Which service should they use?

- A) Azure ExpressRoute
- B) AWS Site-to-Site VPN
- C) AWS Direct Connect
- D) AWS PrivateLink

**Correct Answer: C**
**Explanation:** **AWS Direct Connect** provides a dedicated private connection from on-premises to AWS. While Site-to-Site VPN works over the internet, Direct Connect offers consistent low-latency bandwidth, which is preferred for NC2 production workloads.

---

### Q6
For the same dedicated private connectivity requirement on Azure, the equivalent service is:

- A) Azure VPN Gateway
- B) AWS Direct Connect
- C) Azure ExpressRoute
- D) Azure Front Door

**Correct Answer: C**
**Explanation:** **Azure ExpressRoute** is the Azure equivalent of AWS Direct Connect, providing a private, dedicated connection from on-premises to Azure, bypassing the public internet.

---

### Q7
Which statement accurately describes a difference between NC2 on AWS and NC2 on Azure?

- A) NC2 on Azure uses i3.metal instances
- B) NC2 on AWS requires Flow Gateway for external connectivity
- C) NC2 on Azure uses Flow Gateway to provide overlay-to-underlay connectivity for VM networking
- D) NC2 on AWS uses Azure BareMetal Infrastructure

**Correct Answer: C**
**Explanation:** A key architectural difference is that NC2 on **Azure requires Flow Gateway** to bridge the Nutanix AHV overlay network to the Azure underlay (VNet). On AWS, this bridging is handled differently through VPC integration without requiring Flow Gateway.

---

### Q8
An engineer is comparing NC2 deployments. Which of the following is true about the AHV hypervisor in both AWS and Azure deployments?

- A) AHV is replaced by ESXi on AWS and Hyper-V on Azure
- B) AHV runs on bare-metal hosts in both AWS and Azure
- C) AHV is only available on Azure; AWS uses KVM directly
- D) AHV requires nested virtualization on both clouds

**Correct Answer: B**
**Explanation:** NC2 runs the **AHV hypervisor directly on bare-metal hosts** in both AWS and Azure. There is no nested virtualization; AHV runs natively on the physical hardware provided by i3.metal (AWS) or BareMetal Infrastructure (Azure).

---

### Q9
Which cloud-native load-balancing service can be used to front-end workloads running on NC2 on AWS?

- A) Azure Application Gateway
- B) AWS Elastic Load Balancer (ELB)
- C) Nutanix Load Balancer appliance
- D) F5 BIG-IP VE exclusively

**Correct Answer: B**
**Explanation:** Workloads on NC2 in AWS can leverage **AWS Elastic Load Balancer** (ALB/NLB) since VMs obtain IPs routable within the VPC. Cloud-native services integrate naturally with NC2 networking on their respective platforms.

---

### Q10
When deploying NC2, Prism Central is hosted differently on AWS vs Azure. Which statement is correct?

- A) Prism Central must always be deployed on-premises
- B) On AWS, Prism Central runs as a native EC2 instance; on Azure, it runs as an AHV VM
- C) Prism Central runs as a VM on the NC2 cluster in both AWS and Azure
- D) Prism Central is a SaaS-only service for NC2

**Correct Answer: C**
**Explanation:** **Prism Central runs as a VM on the NC2 AHV cluster** in both AWS and Azure deployments. It is deployed during the cluster creation workflow and manages the NC2 cluster just as it would an on-premises Nutanix cluster.

---

## Domain 2 — NC2 Networking (Q11–Q20)

### Q11
What is the primary role of Flow Gateway in NC2 on Azure?

- A) To encrypt all traffic between Azure regions
- B) To provide NAT for internet-bound traffic only
- C) To bridge the AHV overlay network to the Azure VNet underlay network
- D) To replace Azure NSGs for micro-segmentation

**Correct Answer: C**
**Explanation:** **Flow Gateway on Azure** acts as a gateway that bridges traffic between the Nutanix AHV internal overlay network and the Azure VNet underlay, enabling VMs on the overlay to communicate with Azure-native services and networks.

---

### Q12
An architect wants to connect multiple VPCs hosting NC2 clusters on AWS with a hub-and-spoke topology. Which AWS service is best suited?

- A) VPC Peering
- B) AWS Transit Gateway
- C) AWS PrivateLink
- D) AWS Global Accelerator

**Correct Answer: B**
**Explanation:** **AWS Transit Gateway** supports hub-and-spoke connectivity across multiple VPCs and on-premises networks. VPC Peering is point-to-point and does not scale well for multi-VPC architectures. Transit Gateway simplifies routing for complex NC2 multi-cluster designs.

---

### Q13
What is a key limitation of AWS VPC Peering compared to Transit Gateway for NC2 environments?

- A) VPC Peering supports transitive routing; Transit Gateway does not
- B) VPC Peering does not support transitive routing; each pair must be explicitly peered
- C) VPC Peering is more expensive than Transit Gateway
- D) VPC Peering cannot cross availability zones

**Correct Answer: B**
**Explanation:** **VPC Peering is non-transitive** — traffic cannot route through a peered VPC to reach a third VPC. Each VPC pair requires its own peering connection. Transit Gateway solves this by acting as a centralized router.

---

### Q14
ECMP (Equal-Cost Multi-Path) routing in an NC2 environment is primarily used to:

- A) Encrypt multiple network paths simultaneously
- B) Distribute traffic across multiple equal-cost paths for higher throughput and redundancy
- C) Replace VXLAN encapsulation in the overlay network
- D) Provide DNS-based load balancing across clusters

**Correct Answer: B**
**Explanation:** **ECMP** distributes network traffic across multiple equal-cost routes, improving aggregate throughput and providing path redundancy. In NC2, ECMP can be leveraged for north-south traffic distribution across gateway paths.

---

### Q15
For NC2 on AWS, which service provides managed NAT for outbound internet access from VMs that do not have public IPs?

- A) AWS Internet Gateway
- B) AWS NAT Gateway
- C) Nutanix Flow Gateway
- D) AWS Elastic IP directly on each VM

**Correct Answer: B**
**Explanation:** **AWS NAT Gateway** enables instances in private subnets (including NC2 VMs) to initiate outbound internet connections while preventing unsolicited inbound connections. An Internet Gateway alone requires public IPs on instances.

---

### Q16
An NC2 on Azure deployment needs DNS resolution that resolves internal names differently depending on whether the query originates from on-premises or from Azure. This pattern is called:

- A) DNS forwarding
- B) Split-horizon DNS
- C) GeoDNS
- D) Anycast DNS

**Correct Answer: B**
**Explanation:** **Split-horizon DNS** returns different DNS responses based on the source of the query. This is essential in hybrid NC2 deployments where on-premises clients and Azure-hosted VMs may need to resolve the same hostname to different IPs (private vs. public endpoints).

---

### Q17
In an NC2 on AWS deployment, which component handles routing between the Nutanix overlay network and the AWS VPC underlay?

- A) Flow Gateway (same as Azure)
- B) Nutanix AHV's built-in VPC bridge integration with AWS VPC
- C) An IPsec tunnel to the AWS VPN Gateway
- D) A third-party virtual router appliance

**Correct Answer: B**
**Explanation:** On AWS, the **AHV networking stack integrates directly with the AWS VPC** to provide overlay-to-underlay bridging, unlike Azure where Flow Gateway is required. This is a key architectural difference between the two platforms.

---

### Q18
When configuring Flow Gateway on Azure, what happens if Flow Gateway becomes unavailable?

- A) VMs automatically fail over to Azure native networking
- B) Only north-south traffic is affected; east-west traffic between VMs on the same host continues
- C) All VM networking traffic is disrupted since Flow Gateway bridges overlay to underlay
- D) Prism Central takes over the gateway function automatically

**Correct Answer: C**
**Explanation:** Flow Gateway is critical for traffic entering and leaving the overlay network on Azure. If it becomes unavailable, VMs lose connectivity to the Azure VNet, disrupting north-south and cross-host east-west traffic. However, VMs on the same AHV host can communicate via the local OVS bridge without traversing Flow Gateway, so same-host east-west traffic is unaffected.

---

### Q19
A network engineer needs to establish connectivity between an NC2 cluster on AWS and an on-premises Nutanix cluster over a VPN. Which combination is correct?

- A) AWS Site-to-Site VPN + AWS Virtual Private Gateway
- B) AWS Direct Connect + Azure ExpressRoute
- C) AWS NAT Gateway + on-premises firewall
- D) AWS PrivateLink + Nutanix Flow

**Correct Answer: A**
**Explanation:** An **AWS Site-to-Site VPN** terminates on an **AWS Virtual Private Gateway** (or Transit Gateway) to create an encrypted IPsec tunnel to the on-premises network. This is a standard approach for secure hybrid connectivity to NC2 on AWS.

---

### Q20
Which Azure networking feature must be configured to allow traffic from the NC2 delegated subnet to reach other subnets in the same VNet?

- A) Azure Firewall Premium
- B) User-Defined Routes (UDRs) and appropriate NSG rules
- C) Azure Traffic Manager
- D) Azure Private DNS Zone only

**Correct Answer: B**
**Explanation:** **User-Defined Routes (UDRs)** and **NSG rules** must be configured to ensure traffic from the NC2 delegated subnet can reach other subnets. By default, delegated subnets may have restricted routing that requires explicit UDR and NSG configuration.

---

## Domain 3 — NC2 Storage (Q21–Q30)

### Q21
NC2 on AWS uses which type of storage for the Nutanix Distributed Storage Fabric (DSF)?

- A) Amazon EBS gp3 volumes
- B) Amazon S3 object storage
- C) Local NVMe SSDs on i3.metal instances
- D) Amazon FSx for Lustre

**Correct Answer: C**
**Explanation:** NC2 on AWS exclusively uses the **local NVMe SSDs** on i3.metal instances for DSF. EBS, S3, and FSx are not used for the Nutanix storage pool. The local NVMe drives are pooled by DSF just as on-premises Nutanix nodes pool their local drives.

---

### Q22
An administrator asks if they can attach additional Amazon EBS volumes to expand NC2 storage capacity. What is the correct response?

- A) Yes, EBS gp3 volumes can be added to the Nutanix storage pool
- B) Yes, but only EBS io2 volumes are supported
- C) No, NC2 storage can only be expanded by adding more NC2 nodes to the cluster
- D) No, but you can tier cold data to S3 automatically

**Correct Answer: C**
**Explanation:** NC2 does **not support EBS or any external cloud storage** for expanding the DSF storage pool. The only way to increase storage capacity is by **adding more NC2 nodes**, each contributing their local NVMe drives to the pool.

---

### Q23
How does DSF on NC2 compare to DSF on an on-premises Nutanix cluster?

- A) DSF on NC2 does not support data locality
- B) DSF on NC2 operates identically — same replication, deduplication, compression, and erasure coding capabilities
- C) DSF on NC2 uses only RF1 for cost savings
- D) DSF on NC2 replaces CVM with a cloud-native storage controller

**Correct Answer: B**
**Explanation:** **DSF on NC2 is functionally identical to on-premises DSF.** The same CVM runs on each node, providing the same RF2/RF3 replication, inline deduplication, compression, erasure coding, and data locality features.

---

### Q24
What is the minimum replication factor recommended for production NC2 clusters?

- A) RF1
- B) RF2
- C) RF3
- D) Erasure Coding only (no replication)

**Correct Answer: B**
**Explanation:** **RF2** (two copies of data) is the minimum recommended replication factor for production. RF2 requires a minimum of 3 nodes. RF3 provides higher resilience but requires at least 5 nodes.

---

### Q25
On NC2, what happens to DSF data if one of the bare-metal nodes fails?

- A) Data is permanently lost since it is on local NVMe only
- B) DSF automatically rebuilds the data replicas on remaining healthy nodes from the surviving copies
- C) An EBS snapshot is restored to a replacement node
- D) The administrator must manually restore from an S3 backup

**Correct Answer: B**
**Explanation:** Because DSF maintains **RF2 or RF3 replicas across nodes**, a single node failure does not result in data loss. DSF automatically **re-replicates data** from surviving copies to other healthy nodes in the cluster.

---

### Q26
An architect proposes using Amazon EFS alongside NC2 for shared file storage. What is the correct assessment?

- A) EFS can be mounted directly inside AHV VMs as a native DSF datastore
- B) EFS can be accessed by guest VMs over NFS if network connectivity permits, but it is not part of DSF
- C) EFS replaces the need for Nutanix Files on NC2
- D) EFS is the only shared storage option for NC2

**Correct Answer: B**
**Explanation:** **Amazon EFS** is an independent AWS NFS service. Guest VMs on NC2 could potentially mount EFS over the network, but EFS is **not integrated with or part of DSF**. Nutanix Files can be deployed on NC2 for native file services.

---

### Q27
Erasure Coding (EC-X) on NC2 provides which benefit compared to RF2?

- A) Higher data durability with more storage overhead
- B) Lower storage overhead while maintaining fault tolerance, at the cost of higher rebuild time
- C) Faster random write performance
- D) Elimination of the need for CVMs

**Correct Answer: B**
**Explanation:** **Erasure Coding** provides fault tolerance similar to RF2 but with **lower storage overhead** (e.g., EC-X uses strip+parity vs. full copies). The tradeoff is increased compute overhead for parity calculations and longer rebuild times.

---

### Q28
What is the role of the Controller VM (CVM) in NC2 storage operations?

- A) CVM is a lightweight agent that redirects all I/O to Amazon EBS
- B) CVM manages the local NVMe drives, serves I/O, handles replication, deduplication, compression, and cluster metadata
- C) CVM only handles metadata; data I/O goes directly to NVMe from guest VMs
- D) CVM is replaced by the Nutanix cloud controller on NC2

**Correct Answer: B**
**Explanation:** The **CVM on each NC2 node** performs the same functions as on-premises: managing local NVMe drives, serving all storage I/O, handling data replication, deduplication, compression, snapshots, and maintaining distributed metadata.

---

### Q29
Data locality in DSF on NC2 means:

- A) Data is always stored in the same AWS Availability Zone as the requesting VM
- B) DSF tries to keep data on the same node as the VM consuming it, minimizing network I/O
- C) Data is cached in Amazon ElastiCache for low-latency access
- D) Data is pinned to a specific NVMe drive and never moved

**Correct Answer: B**
**Explanation:** **Data locality** ensures DSF attempts to keep data blocks on the **same physical node** as the VM accessing them, reducing network traversal and latency. If a VM migrates, DSF gradually moves data to follow it.

---

### Q30
An NC2 cluster has 4 nodes with 7.6 TB NVMe each. With RF2, what is the approximate usable storage capacity?

- A) 30.4 TB
- B) 22.8 TB
- C) 15.2 TB
- D) 7.6 TB

**Correct Answer: C**
**Explanation:** Total raw = 4 × 7.6 TB = 30.4 TB. With **RF2**, data is written twice, so usable capacity is approximately **30.4 / 2 = 15.2 TB** (before additional overhead for metadata, CVM reservation, etc.).

---

## Domain 4 — NC2 Licensing & Cost (Q31–Q40)

### Q31
NC2 licensing follows which model?

- A) Perpetual license per node
- B) Subscription-based license (term-based)
- C) Free with AWS/Azure infrastructure charges only
- D) Pay-per-VM license

**Correct Answer: B**
**Explanation:** NC2 uses a **subscription-based licensing model** where customers pay a term-based Nutanix software subscription in addition to the cloud infrastructure costs from AWS or Azure.

---

### Q32
What is the NC2 "hibernation" feature, and how does it impact costs?

- A) It pauses VMs but keeps nodes running at full cost
- B) It shuts down the bare-metal cloud infrastructure while preserving cluster metadata, eliminating cloud infrastructure charges during hibernation
- C) It moves all VMs to S3 Glacier for archival
- D) It reduces the replication factor to RF1 to save storage costs

**Correct Answer: B**
**Explanation:** **Hibernation** allows shutting down the bare-metal NC2 nodes, **stopping cloud infrastructure charges** while the cluster is not in use. Cluster metadata and configuration are preserved so the cluster can be quickly resumed. The Nutanix subscription may still apply.

---

### Q33
How can an organization reduce AWS infrastructure costs for NC2 bare-metal nodes?

- A) Use AWS Spot Instances for NC2 nodes
- B) Purchase AWS Reserved Instances or Savings Plans for i3.metal
- C) Use AWS Free Tier for the first 12 months
- D) Deploy NC2 on t3.micro instances instead

**Correct Answer: B**
**Explanation:** **AWS Reserved Instances or Savings Plans** for i3.metal instances can significantly reduce the hourly infrastructure cost compared to On-Demand pricing. Spot Instances are not suitable for NC2 since bare-metal nodes require guaranteed availability.

---

### Q34
During NC2 cluster hibernation, which cost component continues to apply?

- A) AWS/Azure bare-metal compute charges
- B) Nutanix software subscription fees (depending on contract terms)
- C) AWS EBS storage charges for NVMe data
- D) No costs are incurred during hibernation

**Correct Answer: B**
**Explanation:** While cloud infrastructure charges stop during hibernation, the **Nutanix software subscription** may still be active depending on the contract structure. Customers should review their specific subscription terms regarding hibernation periods.

---

### Q35
Which statement about NC2 subscription tiers is correct?

- A) NC2 Pro includes all features; NC2 Ultimate adds only Calm automation
- B) NC2 is available in different tiers (e.g., Starter, Pro, Ultimate) with increasing feature sets including DR, Flow security, and advanced management
- C) All NC2 subscriptions are identical; pricing varies only by cloud provider
- D) NC2 licensing is included in the AWS Marketplace at no additional software cost

**Correct Answer: B**
**Explanation:** NC2 offers **multiple subscription tiers** with escalating feature sets. Higher tiers include capabilities like Nutanix DR (Leap), Flow micro-segmentation, and advanced Prism Central features. Customers select the tier that matches their requirements.

---

### Q36
An organization runs NC2 clusters only during business hours (12 hours/day). Which strategy best optimizes their total costs?

- A) Use On-Demand pricing and manually stop EC2 instances each evening
- B) Use cluster hibernation for off-hours combined with Reserved Instances for base capacity
- C) Migrate to Azure during off-hours for lower pricing
- D) Reduce the cluster to 1 node at night and scale back up in the morning

**Correct Answer: B**
**Explanation:** Combining **hibernation** (to eliminate infrastructure costs during off-hours) with **Reserved Instances** (to reduce the per-hour rate during active hours) provides the optimal cost structure for predictable usage patterns.

---

### Q37
What is the billing relationship for NC2 infrastructure costs?

- A) Nutanix bills for both software and infrastructure on a single invoice
- B) Cloud infrastructure is billed directly by AWS/Azure; Nutanix software is billed separately by Nutanix
- C) AWS/Azure bills for everything including the Nutanix software license
- D) NC2 is available only through the AWS/Azure Marketplace with unified billing

**Correct Answer: B**
**Explanation:** NC2 has a **split billing model**: AWS or Azure bills for the bare-metal infrastructure (compute, networking, etc.), while Nutanix separately bills for the software subscription. Some marketplace options may offer consolidated billing.

---

### Q38
Which factor does NOT directly affect NC2 cloud infrastructure costs?

- A) Number of bare-metal nodes deployed
- B) AWS region or Azure region selected
- C) Number of VMs running on the cluster
- D) Data transfer charges for inter-region traffic

**Correct Answer: C**
**Explanation:** Cloud infrastructure costs are based on the **bare-metal nodes** (fixed compute cost per node), region pricing, and data transfer. The **number of VMs** running on those nodes does not change the infrastructure cost since VMs share the fixed bare-metal capacity.

---

### Q39
A customer wants to evaluate NC2 before committing to a long-term subscription. What option is typically available?

- A) A permanent free tier with 2 nodes
- B) A time-limited trial or proof-of-concept engagement through Nutanix
- C) NC2 is free for the first year on AWS GovCloud
- D) No evaluation option exists; a 3-year commitment is mandatory

**Correct Answer: B**
**Explanation:** Nutanix typically offers **trial or POC engagements** to allow customers to evaluate NC2 before committing to a full subscription. The specific terms are arranged through Nutanix sales or partner channels.

---

### Q40
When estimating total cost of ownership (TCO) for NC2, which costs must be included?

- A) Only the Nutanix subscription cost
- B) Only the AWS/Azure infrastructure cost
- C) Nutanix subscription + cloud infrastructure (compute, storage, network, data transfer) + operational costs
- D) Only the i3.metal On-Demand pricing

**Correct Answer: C**
**Explanation:** A complete TCO for NC2 includes the **Nutanix software subscription**, **cloud infrastructure costs** (bare-metal compute, networking, data transfer), and **operational costs** (administration, monitoring, training). Ignoring any component leads to inaccurate cost projections.

---

## Domain 5 — DR & Migration (Q41–Q50)

### Q41
Nutanix Leap enables disaster recovery between which environments when using NC2?

- A) Only between two on-premises Nutanix clusters
- B) Between on-premises Nutanix clusters and NC2 clusters (on AWS or Azure), and between NC2 clusters
- C) Only between NC2 on AWS and NC2 on Azure
- D) Only from on-premises to AWS S3 as a backup target

**Correct Answer: B**
**Explanation:** **Nutanix Leap** supports DR between **on-premises ↔ NC2** and **NC2 ↔ NC2** clusters. Since NC2 runs the same Nutanix stack, Leap operates identically to on-premises DR with synchronous or asynchronous replication.

---

### Q42
Which Nutanix tool is specifically designed for migrating VMs from on-premises environments (VMware, Hyper-V, AHV) to NC2?

- A) Nutanix Leap
- B) Nutanix Move
- C) Nutanix Calm
- D) Nutanix Karbon

**Correct Answer: B**
**Explanation:** **Nutanix Move** is purpose-built for migrating VMs from various source hypervisors (VMware ESXi, Hyper-V, AWS EC2, AHV) to a target Nutanix AHV cluster, including NC2 clusters. Leap is for DR/replication, not bulk migration.

---

### Q43
During a Leap failover from on-premises to NC2 on AWS, what happens to the protection domain VMs?

- A) VMs are cold-migrated by copying VMDK files to S3
- B) The most recent recovery point is activated on the NC2 cluster, and VMs are powered on at the DR site
- C) VMs are live-migrated with zero downtime using vMotion
- D) VMs must be manually recreated from AMI images on AWS

**Correct Answer: B**
**Explanation:** During Leap failover, the **latest recovery point snapshot** is activated on the NC2 DR cluster, and VMs are powered on there. This is not a live migration — there is a recovery window based on RPO and the time to boot VMs.

---

### Q44
Protection domains in Nutanix can span across which environments?

- A) Only within a single on-premises cluster
- B) Across on-premises clusters and NC2 clusters, enabling hybrid cloud DR
- C) Only between two NC2 clusters in the same cloud provider
- D) Only between two NC2 clusters in different cloud providers

**Correct Answer: B**
**Explanation:** **Protection domains can span on-premises and NC2 clusters**, enabling true hybrid cloud DR. This allows replication from on-premises to NC2 (or vice versa) with consistent RPO/RTO policies.

---

### Q45
What is the minimum RPO achievable with Nutanix Leap using NearSync replication to NC2?

- A) 24 hours
- B) 1 hour
- C) As low as 1 minute (with NearSync)
- D) Zero RPO (synchronous replication only)

**Correct Answer: C**
**Explanation:** **NearSync** replication can achieve RPOs as low as **1 minute** by streaming incremental snapshots at very short intervals. Standard async replication offers hourly RPOs. Synchronous replication (zero RPO) has distance/latency limitations.

---

### Q46
When using Nutanix Move to migrate VMs to NC2, which of the following is true?

- A) Move requires the source VMs to be powered off during the entire migration
- B) Move performs seeding (initial bulk copy) while VMs remain running, then a brief cutover with minimal downtime
- C) Move only supports Windows VMs
- D) Move requires VMware vCenter on the target NC2 cluster

**Correct Answer: B**
**Explanation:** **Nutanix Move** performs an initial **seed** (bulk data copy) while the source VM remains powered on. When ready, a brief **cutover** migrates the final changes and starts the VM on the target NC2 cluster, minimizing downtime.

---

### Q47
To set up Leap DR between an on-premises cluster and NC2, which component must be deployed at both sites?

- A) Nutanix Move
- B) Prism Central (managing both the source and target clusters)
- C) AWS CloudFormation
- D) VMware Site Recovery Manager

**Correct Answer: B**
**Explanation:** **Prism Central** must manage both the source and target clusters for Leap to function. Prism Central orchestrates the replication schedules, recovery plans, and failover/failback operations between sites.

---

### Q48
During a planned failback from NC2 (DR site) back to on-premises (primary site), what is the correct procedure?

- A) Manually export VMs as OVA files and import on-premises
- B) Execute a planned failover (failback) in Leap, which replicates the latest data back to the primary site and powers on VMs there
- C) Use AWS DataSync to transfer data back to on-premises storage
- D) Re-deploy the cluster on-premises and restore from S3 backups

**Correct Answer: B**
**Explanation:** Leap supports **planned failback** by reversing the replication direction. The latest data from the NC2 DR site is replicated back to the on-premises cluster, and VMs are powered on at the primary site with minimal data loss.

---

### Q49
Which network consideration is critical when planning Leap replication between on-premises and NC2?

- A) Both sites must use the same IP subnet
- B) Sufficient bandwidth between sites to sustain the replication traffic within RPO targets
- C) Replication only works over AWS Direct Connect, never over VPN
- D) Both sites must be in the same AWS region

**Correct Answer: B**
**Explanation:** **Network bandwidth** between the on-premises and NC2 environments must be sufficient to replicate changed data within the configured RPO window. Insufficient bandwidth causes RPO violations. Both VPN and Direct Connect/ExpressRoute are supported.

---

### Q50
An organization has VMs running on VMware on-premises and wants to migrate them to NC2 on Azure. Which workflow should they use?

- A) Nutanix Leap with protection domains
- B) Azure Migrate integrated with NC2
- C) Nutanix Move from VMware ESXi source to NC2 AHV target
- D) Manual P2V conversion using Disk2VHD

**Correct Answer: C**
**Explanation:** **Nutanix Move** supports migrating from **VMware ESXi** as a source to any **AHV target**, including NC2 on Azure. Move handles the hypervisor conversion (VMDK → AHV format) automatically during migration.

---

## Domain 6 — NC2 Troubleshooting (Q51–Q60)

### Q51
An NC2 cluster deployment on AWS fails during the initial provisioning phase. What should the administrator check first?

- A) The Nutanix Prism Element firmware version
- B) IAM role permissions for the NC2 deployment service account
- C) The AHV ISO version on the local USB drive
- D) The on-premises vCenter connectivity

**Correct Answer: B**
**Explanation:** NC2 deployment requires specific **IAM permissions** to provision bare-metal instances, configure networking, and manage resources. Insufficient IAM permissions are a common cause of deployment failures and should be verified first.

---

### Q52
During NC2 deployment, the error "InsufficientInstanceCapacity" appears. What does this indicate?

- A) The Nutanix license has expired
- B) AWS does not have enough available i3.metal capacity in the selected Availability Zone
- C) The VPC has run out of IP addresses
- D) The CVM requires more RAM than available

**Correct Answer: B**
**Explanation:** **InsufficientInstanceCapacity** is an AWS error indicating that the requested instance type (i3.metal) is temporarily unavailable in the specified AZ. Solutions include trying a different AZ or waiting for capacity to become available.

---

### Q53
An NC2 node on Azure becomes unresponsive. After investigation, it is determined the bare-metal host has a hardware failure. What is the correct remediation procedure?

- A) Reboot the node from Prism Element and wait for it to recover
- B) Remove (destroy) the failed node from the cluster, then add a new bare-metal node as a replacement
- C) Contact AWS Support to replace the i3.metal instance
- D) Restore the node from an EBS snapshot

**Correct Answer: B**
**Explanation:** For NC2 node failures, the standard procedure is to **remove the failed node** from the Nutanix cluster and then **provision a new bare-metal node** to replace it. DSF will automatically re-replicate data to the new node.

---

### Q54
The NC2 cluster on AWS shows that VMs cannot reach the internet. The VPC configuration appears correct. What is a likely cause?

- A) The AHV overlay network is using an incorrect VXLAN ID
- B) The NAT Gateway in the public subnet is missing or misconfigured, or route tables for the private subnet do not point to the NAT Gateway
- C) The Nutanix license has restricted internet access
- D) AWS has blocked all outbound traffic by default since September 2023

**Correct Answer: B**
**Explanation:** If VMs in private subnets cannot reach the internet, the most likely cause is a **missing or misconfigured NAT Gateway** or **incorrect route table entries** in the private subnet that should route 0.0.0.0/0 through the NAT Gateway.

---

### Q55
After adding a new node to an NC2 cluster, the node shows as "not part of the cluster" in Prism Element. What should the administrator verify?

- A) That the node has been licensed separately in the AWS Marketplace
- B) That the CVM on the new node can communicate with existing CVMs and the cluster has accepted the node
- C) That the node is running ESXi instead of AHV
- D) That the node's EBS volumes are properly attached

**Correct Answer: B**
**Explanation:** When a new node fails to join the cluster, the most common issues are **CVM network connectivity** (ensure the CVM can reach other CVMs on the cluster network) and ensuring the **node expansion workflow** completed successfully in Prism.

---

### Q56
An NC2 on AWS deployment experiences subnet capacity issues. What is the root cause?

- A) The AHV hypervisor is consuming too many IPs
- B) The subnet CIDR allocated for NC2 is too small, lacking sufficient IPs for CVMs, host IPs, and VM IPs
- C) AWS has a hard limit of 10 IPs per subnet
- D) The Nutanix license limits the number of IPs used

**Correct Answer: B**
**Explanation:** NC2 requires IPs for bare-metal host management, CVMs, Prism Central, and guest VMs. If the **subnet CIDR is too small**, the deployment runs out of IPs. Proper subnet sizing during planning is essential.

---

### Q57
A Prism Central instance on an NC2 cluster becomes unreachable. Which troubleshooting step should be performed first?

- A) Redeploy the NC2 cluster from scratch
- B) Check the Prism Central VM status from a CVM CLI via SSH, verify network connectivity, and review PC logs
- C) Contact AWS Support to check the underlying hardware
- D) Restore Prism Central from an AWS AMI backup

**Correct Answer: B**
**Explanation:** When Prism Central is unreachable, the administrator should **SSH to a CVM** on the cluster and check the Prism Central VM status (`ncli vm list`), verify its network settings, and examine logs for errors before escalating.

---

### Q58
During NC2 deployment, the Nutanix cluster creation fails with a VPC networking error. Which AWS configuration should be verified?

- A) The S3 bucket policy for the deployment logs
- B) VPC settings including DHCP options, DNS resolution, DNS hostnames, subnet associations, and security group rules
- C) The AWS Lambda function timeout
- D) The Route 53 hosted zone TTL settings

**Correct Answer: B**
**Explanation:** VPC networking errors during NC2 deployment typically stem from misconfigured **DHCP options, DNS settings, subnet associations, or security group rules**. These must be properly configured to allow NC2 components to communicate.

---

### Q59
After a power event, two NC2 nodes restart but the cluster does not reform automatically. What is the most likely issue?

- A) The Nutanix license expired during the outage
- B) The cluster requires a quorum of nodes to be online; with only 2 of 4 nodes available, the cluster cannot achieve quorum
- C) AHV does not support automatic cluster reformation
- D) The EBS volumes were detached during the power event

**Correct Answer: B**
**Explanation:** Nutanix clusters require a **majority quorum** of nodes to be online. In a 4-node cluster, at least 3 nodes must be available. With only 2 nodes running, the cluster **cannot form a quorum** and will not start cluster services.

---

### Q60
An administrator notices high latency on NC2 VMs after a recent node addition. What should they investigate?

- A) Whether the new node introduced a network bottleneck or if DSF is rebalancing data across nodes (curator activity)
- B) Whether the new node needs a separate Nutanix license
- C) Whether the AWS region is experiencing a global outage
- D) Whether the EBS IOPS limit has been reached

**Correct Answer: A**
**Explanation:** After adding a node, **DSF data rebalancing (Curator)** redistributes data across all nodes including the new one. This background activity can temporarily increase I/O latency. The administrator should check Curator status and network throughput on the new node.

---

## Domain 7 — Prism Central Multi-Cloud Management (Q61–Q70)

### Q61
Prism Central in an NC2 environment provides:

- A) Management of AWS-native EC2 instances only
- B) A unified management plane for on-premises Nutanix, NC2 on AWS, and NC2 on Azure clusters
- C) Azure portal integration only
- D) Management of only NC2 clusters, not on-premises

**Correct Answer: B**
**Explanation:** **Prism Central** provides a **unified management dashboard** for all Nutanix environments, including on-premises clusters, NC2 on AWS, and NC2 on Azure. This enables consistent operations across hybrid and multi-cloud deployments.

---

### Q62
Which Prism Central feature allows administrators to tag and organize VMs consistently across on-premises and NC2 environments?

- A) AWS Resource Tags
- B) Azure Resource Groups
- C) Nutanix Categories
- D) Nutanix Projects only

**Correct Answer: C**
**Explanation:** **Nutanix Categories** provide a consistent tagging mechanism across all Nutanix-managed environments. Categories are key-value pairs that work identically on on-premises and NC2 clusters, enabling unified policy enforcement and organization.

---

### Q63
How does Prism Central assist with capacity planning for NC2 clusters?

- A) It only reports current usage; capacity planning requires AWS CloudWatch
- B) It provides capacity runway analysis, showing projected resource exhaustion dates and recommending node additions
- C) It automatically provisions new nodes when capacity is low
- D) Capacity planning is only available for on-premises clusters

**Correct Answer: B**
**Explanation:** Prism Central's **capacity planning** feature analyzes historical usage trends and projects **when resources (CPU, memory, storage) will be exhausted**, providing a "runway" estimate. It recommends when to add nodes but does not auto-provision them.

---

### Q64
An administrator wants a single view of all VMs across 3 on-premises clusters and 2 NC2 clusters. Which Prism Central feature provides this?

- A) Prism Element dashboards (one per cluster)
- B) Prism Central's unified VM management dashboard with global search and filtering
- C) AWS Systems Manager integrated with Nutanix
- D) A third-party CMDB tool only

**Correct Answer: B**
**Explanation:** **Prism Central's unified dashboard** aggregates information from all registered clusters, providing a **single pane of glass** for VMs, storage, networking, and alerts across on-premises and NC2 environments.

---

### Q65
Nutanix Calm, when used with NC2 through Prism Central, provides:

- A) Only infrastructure monitoring
- B) Application automation, blueprints, and self-service provisioning across on-premises and NC2 environments
- C) Automated bare-metal provisioning of i3.metal instances
- D) Cost management only

**Correct Answer: B**
**Explanation:** **Nutanix Calm** provides application-level automation including **blueprints, self-service provisioning, and lifecycle management** that works consistently across on-premises Nutanix and NC2 clusters managed by Prism Central.

---

### Q66
When Prism Central manages both on-premises and NC2 clusters, alert policies:

- A) Must be configured separately for each cluster type
- B) Can be defined once and applied consistently across all managed clusters using categories
- C) Are only available for on-premises clusters
- D) Require AWS CloudWatch for NC2 alerts

**Correct Answer: B**
**Explanation:** Prism Central allows **unified alert policies** that apply consistently across all managed clusters. By using **categories**, administrators can define policies once and have them enforced across on-premises and NC2 environments.

---

### Q67
Which Prism Central report helps an organization understand the cost implications of their NC2 deployment?

- A) Prism Central does not provide cost reporting for NC2
- B) Chargeback and showback reports that attribute resource consumption to departments or projects
- C) AWS Cost Explorer is the only option
- D) The Nutanix Beam cost governance dashboard

**Correct Answer: B**
**Explanation:** Prism Central provides **chargeback/showback reports** that help organizations understand resource consumption per department or project. Additionally, **Nutanix Beam** (now part of Nutanix Cost Governance) provides cloud cost optimization recommendations.

---

### Q68
An administrator needs to apply a consistent security policy to VMs across on-premises and NC2. Which approach should they use?

- A) Configure AWS Security Groups for all VMs
- B) Apply Nutanix Flow security policies via Prism Central using categories that span all environments
- C) Use only on-premises firewalls with VPN tunnels
- D) Manually configure iptables on each VM

**Correct Answer: B**
**Explanation:** **Nutanix Flow** security policies can be applied via **Prism Central using categories** that span both on-premises and NC2 environments, providing a consistent micro-segmentation approach without relying on cloud-native security groups alone.

---

### Q69
Prism Central's "Analysis" page for NC2 clusters allows administrators to:

- A) View only real-time metrics; no historical data is available for cloud clusters
- B) Create custom dashboards with performance charts, correlate metrics across entities, and analyze historical trends
- C) Only export data to Azure Monitor
- D) View storage metrics only; compute metrics require CloudWatch

**Correct Answer: B**
**Explanation:** Prism Central's **Analysis page** provides customizable dashboards with performance charts, metric correlation, and historical trend analysis for **all managed clusters**, including NC2, with the same depth of visibility as on-premises.

---

### Q70
When registering an NC2 cluster with Prism Central, which prerequisite is essential?

- A) The NC2 cluster must be running VMware ESXi
- B) Network connectivity between the NC2 cluster and Prism Central, with appropriate firewall rules allowing communication on required ports
- C) Both must be in the same AWS region
- D) Prism Central must be running on AWS EC2 as a native instance

**Correct Answer: B**
**Explanation:** The primary prerequisite for registering any cluster with Prism Central is **network connectivity and appropriate firewall rules**. The NC2 cluster's CVMs and Prism Central must be able to communicate on the required ports (typically 9440).

---

## Domain 8 — Security (Q71–Q80)

### Q71
Nutanix Flow micro-segmentation on NC2 operates at which level?

- A) At the AWS Security Group level only
- B) At the VM NIC level within AHV, independent of cloud-native security groups
- C) At the Azure NSG level only
- D) At the physical switch port level

**Correct Answer: B**
**Explanation:** **Flow micro-segmentation** on NC2 operates at the **AHV hypervisor level**, applying policies at the VM NIC. This is independent of and complementary to AWS Security Groups or Azure NSGs, providing defense-in-depth.

---

### Q72
Data at rest on NC2 NVMe drives is protected by:

- A) AWS KMS encryption only
- B) Nutanix software-based encryption (cluster-level or self-encrypting drives) managed through Prism
- C) Azure Disk Encryption exclusively
- D) No encryption is available for local NVMe drives on NC2

**Correct Answer: B**
**Explanation:** NC2 supports **Nutanix software-based encryption** for data at rest on local NVMe drives. This is managed through Prism and can use internal key management or an external KMS. This is independent of cloud provider encryption services.

---

### Q73
For data in transit between CVMs in an NC2 cluster, which encryption mechanism is used?

- A) AWS TLS termination at the load balancer
- B) Nutanix-provided encryption for inter-CVM communication over the cluster network
- C) IPsec tunnels managed by AWS VPN
- D) No encryption is available for intra-cluster traffic

**Correct Answer: B**
**Explanation:** Nutanix provides **encryption for data in transit** between CVMs within the cluster. This protects replication traffic and inter-node communication. This Nutanix-native encryption operates independently of cloud provider encryption services.

---

### Q74
An organization requires SAML-based SSO for accessing Prism Central on NC2. Which configuration is needed?

- A) Configure SAML SSO only on the AWS IAM Identity Center
- B) Configure a SAML Identity Provider (IdP) integration directly in Prism Central's authentication settings
- C) SAML SSO is not supported on NC2; only local accounts work
- D) Deploy ADFS on an EC2 instance and use LDAP only

**Correct Answer: B**
**Explanation:** Prism Central supports **SAML SSO integration** directly in its authentication configuration. Administrators configure their SAML IdP (such as Okta, Azure AD, or ADFS) in Prism Central's settings, enabling SSO for both on-premises and NC2-managed environments.

---

### Q75
Integrating Active Directory (AD) with Prism Central for NC2 provides:

- A) Automatic provisioning of bare-metal nodes
- B) Role-based access control (RBAC) using AD groups to manage permissions in Prism Central
- C) Encryption of VM disks using AD certificates
- D) DNS-only services for the NC2 cluster

**Correct Answer: B**
**Explanation:** **AD/LDAP integration** in Prism Central enables **RBAC using AD groups**, allowing administrators to map AD groups to Prism Central roles (Admin, Viewer, etc.). This provides centralized identity management for NC2 cluster access.

---

### Q76
Which security best practice should be applied to the IAM role used for NC2 deployment on AWS?

- A) Grant the role full AdministratorAccess for simplicity
- B) Apply the principle of least privilege, granting only the specific permissions NC2 requires
- C) Use the AWS root account for NC2 deployment
- D) Share a single IAM access key across all NC2 clusters

**Correct Answer: B**
**Explanation:** Following the **principle of least privilege**, the IAM role for NC2 should have only the specific permissions required for deployment and operations. Nutanix documentation provides the exact IAM policy with required permissions.

---

### Q77
Flow Network Security on NC2 can enforce which type of policies?

- A) Only allow-all or deny-all rules between VMs
- B) Granular application-centric policies including allowlisting, denylisting, isolation, and quarantine based on categories
- C) Only L3 firewall rules; no application-level awareness
- D) Only policies between NC2 and on-premises; not between VMs within NC2

**Correct Answer: B**
**Explanation:** **Flow Network Security** supports granular, **application-centric security policies** including allowlisting (whitelist), denylisting (blacklist), isolation, and quarantine. Policies are applied using Nutanix categories, enabling intent-based security.

---

### Q78
For NC2 on Azure, which layer of encryption protects data traversing between the Azure VNet and on-premises over ExpressRoute?

- A) ExpressRoute traffic is always encrypted by default
- B) MACsec encryption on ExpressRoute Direct, or application/VPN-level encryption must be implemented since standard ExpressRoute is not encrypted
- C) Azure automatically applies AES-256 encryption to all ExpressRoute traffic
- D) Nutanix Flow encrypts all ExpressRoute traffic natively

**Correct Answer: B**
**Explanation:** Standard **ExpressRoute is not encrypted by default** — it is a private connection but traffic is not encrypted. For encryption, organizations must use **MACsec** (on ExpressRoute Direct) or implement **VPN/application-level encryption** over the ExpressRoute circuit.

---

### Q79
An organization needs to ensure that only VMs with specific security categories can communicate with each other on an NC2 cluster. Which Nutanix feature enables this?

- A) AWS Network ACLs
- B) Flow micro-segmentation with isolation policies based on Nutanix categories
- C) Azure Private Endpoints
- D) AHV affinity rules

**Correct Answer: B**
**Explanation:** **Flow isolation policies** restrict communication between VM groups based on their **Nutanix categories**. Only VMs with explicitly allowed category pairs can communicate, providing zero-trust segmentation within the NC2 cluster.

---

### Q80
When configuring external key management for NC2 data-at-rest encryption, which protocol does Nutanix support?

- A) AWS CloudHSM API only
- B) KMIP (Key Management Interoperability Protocol) for integration with external KMS solutions
- C) Azure Key Vault REST API only
- D) PGP key exchange

**Correct Answer: B**
**Explanation:** Nutanix supports **KMIP (Key Management Interoperability Protocol)** for external key management integration. This allows NC2 to work with any KMIP-compliant KMS solution (such as Vormetric, SafeNet, or other enterprise key managers) for managing encryption keys.

---

## Answer Key — Quick Reference

| Q# | Ans | Q# | Ans | Q# | Ans | Q# | Ans | Q# | Ans |
|----|-----|----|-----|----|-----|----|-----|----|-----|
| 1  | B   | 17 | B   | 33 | B   | 49 | B   | 65 | B   |
| 2  | B   | 18 | C   | 34 | B   | 50 | C   | 66 | B   |
| 3  | B   | 19 | A   | 35 | B   | 51 | B   | 67 | B   |
| 4  | B   | 20 | B   | 36 | B   | 52 | B   | 68 | B   |
| 5  | C   | 21 | C   | 37 | B   | 53 | B   | 69 | B   |
| 6  | C   | 22 | C   | 38 | C   | 54 | B   | 70 | B   |
| 7  | C   | 23 | B   | 39 | B   | 55 | B   | 71 | B   |
| 8  | B   | 24 | B   | 40 | C   | 56 | B   | 72 | B   |
| 9  | B   | 25 | B   | 41 | B   | 57 | B   | 73 | B   |
| 10 | C   | 26 | B   | 42 | B   | 58 | B   | 74 | B   |
| 11 | C   | 27 | B   | 43 | B   | 59 | B   | 75 | B   |
| 12 | B   | 28 | B   | 44 | B   | 60 | A   | 76 | B   |
| 13 | B   | 29 | B   | 45 | C   | 61 | B   | 77 | B   |
| 14 | B   | 30 | C   | 46 | B   | 62 | C   | 78 | B   |
| 15 | B   | 31 | B   | 47 | B   | 63 | B   | 79 | B   |
| 16 | B   | 32 | B   | 48 | B   | 64 | B   | 80 | B   |

---

*Generated for NCP-CI 6.10 exam preparation — Nutanix Cloud Integration*
