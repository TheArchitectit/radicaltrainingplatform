# NCP-CI 6.10 Nutanix Cloud Integration Exam Questions

**Total: 80 Multiple-Choice Questions**
- 60 Standard MCQ (4 options, 1 correct)
- 10 Select TWO Questions (5 options, 2 correct)
- 10 Ordering/Sequence Questions

---

## STANDARD MCQ (Questions 1-60)

### Q1
When deploying NC2 on AWS, you need to ensure compute instances are placed in an VPC with a minimum subnet size. What is the minimum subnet size (CIDR notation) required for an NC2 deployment?
- A) /28
- B) /26
- C) /25
- D) /23

**Answer: C**
NC2 on AWS requires a VPC /25 subnet minimum to accommodate the cluster nodes, Flow Gateway instances, and management VMs. This provides 32 usable IP addresses, which is the minimum for a 3-node cluster with additional infrastructure.

---

### Q2
You are designing an NC2 on AWS cluster with i3.metal instances. Where does Nutanix expect to store cluster metadata backups in AWS?
- A) EBS volumes attached to each node
- B) AWS S3 only
- C) EFS shared storage
- D) DynamoDB

**Answer: B**
NC2 on AWS uses local NVMe for all cluster data, while S3 is used exclusively for metadata backup only. This prevents any dependency on EBS performance and keeps data local for optimal performance.

---

### Q3
An NC2 cluster on AWS requires Direct Connect connectivity. What is the primary purpose of using AWS Direct Connect instead of public internet connectivity?
- A) To reduce AWS data transfer costs
- B) To provide a dedicated, low-latency network connection between on-premises and AWS
- C) To enable automatic failover between regions
- D) To bypass IAM permission requirements

**Answer: B**
AWS Direct Connect provides a dedicated, private network connection from on-premises to AWS with consistent network performance and lower latency compared to internet-based connections, which is critical for hybrid cloud deployments and Leap disaster recovery.

---

### Q4
When configuring security groups for NC2 on AWS, which three ports must be explicitly allowed for proper cluster functionality?
- A) 9440, 80, 443
- B) 9440, 2049, 3260
- C) 8080, 3260, 443
- D) 22, 9440, 443

**Answer: B**
NC2 on AWS security groups must allow: 9440 (Prism Central/Element UI), 2049 (NFS), and 3260 (iSCSI). These ports enable management, storage connectivity, and inter-node communication.

---

### Q5
You are deploying NC2 on Azure using BareMetal Infrastructure. What is the purpose of Flow Gateway VMs in the Azure deployment?
- A) To provide backup and disaster recovery capabilities
- B) To bridge AHV overlay network connectivity to the Azure VNet underlay
- C) To reduce storage costs by tiering data to Azure blob storage
- D) To provide encryption key management

**Answer: B**
Flow Gateway VMs on Azure BareMetal bridge the AHV overlay network to the Azure VNet underlay, enabling connectivity between cluster VMs and the Azure virtual network. They work with Azure Route Server and BGP for dynamic routing.

---

### Q6
An NC2 on Azure deployment uses a delegated subnet. What is the minimum requirement for the delegated subnet configuration?
- A) /24 subnet
- B) /26 subnet
- C) It must be the same size as the cluster VLAN
- D) There is no minimum; any size works

**Answer: A**
The delegated subnet in Azure for NC2 BareMetal deployments requires a /24 minimum to accommodate the BareMetal instances and associated management infrastructure.

---

### Q7
When using Azure ExpressRoute with NC2 BareMetal, what protocol is used for dynamic routing between the BareMetal infrastructure and Azure?
- A) OSPF with direct peering
- B) BGP with Azure Route Server
- C) RIP version 2
- D) IS-IS

**Answer: B**
NC2 on Azure uses BGP (Border Gateway Protocol) with Azure Route Server to enable dynamic routing. This allows the BareMetal cluster to advertise routes and receive updates from the Azure vNet.

---

### Q8
You are configuring Flow Gateway VMs for an NC2 Azure deployment. What is the maximum number of Flow Gateway VMs you can configure for ECMP (Equal Cost Multi-Path) routing?
- A) 2
- B) 3
- C) 4
- D) 8

**Answer: C**
ECMP on NC2 Azure supports a maximum of 4 Flow Gateway VMs for load-balanced routing across multiple gateways, improving redundancy and network throughput.

---

### Q9
After initial NC2 cluster deployment, you need to access the management console. Which Nutanix portal should you use to manage your NC2 cluster?
- A) Nutanix.cloud web portal
- B) my.nutanix.com console
- C) Prism Element
- D) AWS CloudFormation dashboard

**Answer: B**
my.nutanix.com is the unified portal for managing NC2 clusters across AWS and Azure. This single-pane-of-glass console provides access to Prism Central, licensing, and cluster management.

---

### Q10
What is the minimum number of nodes required for an NC2 cluster deployment?
- A) 1 node
- B) 2 nodes
- C) 3 nodes
- D) 5 nodes

**Answer: C**
NC2 requires a minimum of 3 nodes for production deployment. This ensures quorum for the metadata service and provides redundancy for the Nutanix cluster.

---

### Q11
You are deploying an NC2 cluster. The deployment wizard asks about the operating system and hypervisor stack. What is included in the full stack deployed with NC2?
- A) AOS only
- B) AHV only
- C) AOS + AHV
- D) AOS + KVM

**Answer: C**
NC2 deployments include the full AOS (Acropolis Operating System) and AHV (Acropolis Hypervisor) stack pre-installed on cloud instances. Foundation is not needed because the cloud instances come with the full stack pre-loaded.

---

### Q12
During NC2 deployment, the wizard asks whether you need Foundation. What is the correct approach?
- A) Foundation must be used for cloud deployments
- B) Foundation is optional but recommended
- C) Foundation is NOT needed; cloud instances come pre-configured
- D) Foundation must be run in a container on the first node

**Answer: C**
Foundation is not used for NC2 deployments because the cloud instances come pre-configured with AOS and AHV. The deployment process is simplified and Foundation is unnecessary.

---

### Q13
Your organization has deployed multiple NC2 clusters across AWS and Azure. What licensing model is supported for NC2?
- A) Traditional perpetual licensing only
- B) Subscription-based licensing only
- C) Subscription-based licensing with consumption tracking
- D) Both A and C

**Answer: C**
NC2 uses subscription-based licensing with consumption tracking. You are charged based on the number of nodes deployed and subscription term, enabling flexibility for cloud deployments.

---

### Q14
You need to reduce costs for a development and testing NC2 environment during non-business hours. What Nutanix feature can help minimize costs?
- A) Reserved Instances only
- B) Node hibernation for dev/test
- C) Automatic cluster shutdown
- D) Converting to standard licensing

**Answer: B**
Node hibernation is primarily an Azure feature that allows you to put NC2 nodes into a sleep state during off-peak hours, reducing compute costs while maintaining the ability to resume quickly. On AWS, cluster-level hibernation with metadata backup to S3 achieves similar cost savings. This is ideal for dev/test environments.

---

### Q15
When configuring security for an NC2 cluster on AWS, you need to assign IAM roles to EC2 instances. What is the minimum IAM permission requirement?
- A) Full EC2 admin access
- B) Permissions for EC2, S3 (metadata backup), and security group management
- C) Read-only IAM permissions
- D) No IAM roles are needed

**Answer: B**
NC2 on AWS requires IAM roles that grant permissions for EC2 instance management, S3 access for metadata backups, and security group modifications. Full admin access is not required—only the specific permissions needed for NC2 operations.

---

### Q16
You are planning an NC2 deployment on AWS and need to determine the AZ (Availability Zone) requirement. What is the critical requirement regarding Availability Zones?
- A) All NC2 nodes must be in the same AZ
- B) NC2 nodes can be distributed across multiple AZs
- C) AZ placement doesn't matter for NC2
- D) Each node must be in a different AZ

**Answer: A**
NC2 on AWS requires all cluster nodes to be in the same Availability Zone. This ensures low-latency communication between nodes and is a strict architectural requirement.

---

### Q17
Your organization is considering NC2 on AWS with i3.metal instances. What storage is used for cluster data?
- A) EBS volumes only
- B) Local NVMe storage only
- C) Mix of local NVMe and EBS
- D) AWS Glacier for long-term storage

**Answer: B**
NC2 on AWS uses local NVMe storage (which comes with i3.metal instances) exclusively for cluster data. EBS is not used for cluster data—only S3 is used for metadata backups.

---

### Q18
You need to set up VPC peering between your on-premises network and an NC2 cluster on AWS. What networking component facilitates this connectivity?
- A) Direct Connect only
- B) Transit Gateway with Direct Connect
- C) VPN gateway only
- D) NAT Gateway

**Answer: B**
AWS Transit Gateway combined with Direct Connect enables secure, scalable connectivity between on-premises networks and NC2 clusters. Transit Gateway acts as a central hub for network routing.

---

### Q19
An NC2 cluster requires split-horizon DNS configuration. What is the purpose of split-horizon DNS?
- A) To reduce DNS query latency
- B) To provide different DNS responses based on where the query originates (internal vs. external)
- C) To enable DNS failover between regions
- D) To encrypt DNS traffic

**Answer: B**
Split-horizon DNS returns different IP addresses based on the requestor's location—internal IP addresses for on-premises clients and public IPs for cloud clients. This ensures optimal routing and connectivity.

---

### Q20
You are designing a VPN failover solution for NC2 on AWS. Which networking configuration allows automatic failover for VPN connections?
- A) Single VPN connection to NC2
- B) Dual VPN connections with failover policy
- C) VPN with Load Balancer only
- D) BGP routing with redundant connections

**Answer: D**
BGP (Border Gateway Protocol) with redundant VPN connections enables automatic failover. BGP dynamically updates routing tables when a connection fails, ensuring uninterrupted connectivity.

---

### Q21
You are using Nutanix Leap to replicate a VM from on-premises Nutanix to NC2 on AWS. What is the primary advantage of using Leap for this migration?
- A) Leap requires zero data transfer
- B) Leap enables continuous replication and planned/unplanned failover capabilities
- C) Leap only works for VM cloning
- D) Leap requires manual failover only

**Answer: B**
Leap provides continuous replication between on-premises and NC2, supporting both planned failover (scheduled migrations) and unplanned failover (disaster recovery). It enables bidirectional replication for flexibility.

---

### Q22
Your organization uses Nutanix Move to migrate VMs to NC2. During migration, what validation step is critical before completing the cutover?
- A) Only verify VM power state
- B) Perform test migration in an isolated network
- C) Skip validation to reduce migration time
- D) Only check network connectivity

**Answer: B**
Before cutover, Nutanix Move allows test migration to an isolated test network where you can validate VM functionality without affecting production. This ensures successful migration before final cutover.

---

### Q23
After a failover from on-premises to NC2, you want to revert to the on-premises environment. What is this process called?
- A) Forward failover
- B) Planned failover
- C) Reverse replication
- D) Migration rollback

**Answer: C**
Reverse replication enables bidirectional data sync, allowing you to fail back to the on-premises environment if needed. This is critical for disaster recovery and provides a fallback mechanism.

---

### Q24
You are setting up Prism Central to manage both on-premises Nutanix clusters and NC2 clusters. What is the primary benefit of this unified management approach?
- A) Reduced licensing costs
- B) Single dashboard for monitoring, alerts, and policy enforcement across environments
- C) Automatic replication between on-premises and NC2
- D) Elimination of security group requirements

**Answer: B**
Prism Central provides a unified dashboard for managing multiple Nutanix environments including on-premises and NC2 clusters. This enables consistent policy enforcement, monitoring, and operational oversight.

---

### Q25
You need to categorize VMs across both on-premises and NC2 environments for resource allocation and billing. How does Nutanix support this?
- A) Categories only work on-premises
- B) Separate category systems for each environment
- C) Categories work consistently across on-premises and NC2 environments in Prism Central
- D) Categories must be manually synced

**Answer: C**
Categories in Prism Central work across both on-premises and NC2 environments, enabling consistent resource tagging, policy enforcement, and billing allocation across the hybrid cloud infrastructure.

---

### Q26
You want to deploy Nutanix Calm blueprints on your NC2 cluster. What application framework is supported?
- A) Calm only works on-premises
- B) Calm blueprints work on NC2 for multi-cloud application deployment
- C) Only IaaS blueprints are supported on NC2
- D) Calm requires separate licensing on NC2

**Answer: B**
Nutanix Calm blueprints are fully supported on NC2, enabling infrastructure-as-code deployment of multi-tier applications across on-premises and cloud environments with the same blueprint.

---

### Q27
You want to run Kubernetes workloads on your NC2 cluster. Which Nutanix Kubernetes platform can be deployed on NC2?
- A) NKE only (Nutanix Kubernetes Engine)
- B) NKP only (Nutanix Kubernetes Platform)
- C) Both NKE and NKP
- D) Kubernetes is not supported on NC2

**Answer: C**
Both Nutanix Kubernetes Engine (NKE) and Nutanix Kubernetes Platform (NKP) are supported on NC2, enabling container workload deployment alongside traditional VMs in the same environment.

---

### Q28
You are troubleshooting an NC2 deployment failure on AWS. The error message indicates "Insufficient EC2 capacity." What is the most likely cause?
- A) Your security group is misconfigured
- B) AWS quota for i3.metal instances has been reached
- C) The VPC subnet is too small
- D) IAM role permissions are missing

**Answer: B**
"Insufficient EC2 capacity" typically means AWS deployment quotas have been reached for the instance type. You need to request a quota increase from AWS Support or choose a different region/AZ.

---

### Q29
During NC2 deployment on Azure, you receive an error about the delegated subnet. What validation should you perform first?
- A) Verify the subnet is /24 or larger and properly delegated to BareMetal
- B) Check only the region
- C) Verify the storage account exists
- D) Check the Virtual Network name only

**Answer: A**
When delegated subnet errors occur, verify that the subnet is at least /24, properly delegated to the BareMetal service in Azure, and not already hosting other resources. Delegation is critical for BareMetal infrastructure.

---

### Q30
An NC2 node fails in production. What is the correct recovery procedure?
- A) Repair the node using Nutanix tools
- B) Destroy the failed node and add a new node to the cluster
- C) Wait for automatic recovery
- D) Reboot the node

**Answer: B**
Failed NC2 nodes must be destroyed and replaced with new instances. Repair operations are not supported for cloud-based nodes because you cannot repair cloud infrastructure—you must re-provision it.

---

### Q31
Your NC2 cluster is running out of storage capacity. What is the appropriate scaling approach?
- A) Replace existing nodes with larger instances
- B) Attach additional EBS volumes
- C) Add new nodes to the cluster
- D) Use S3 for additional capacity

**Answer: C**
NC2 storage is scaled by adding new nodes to the cluster. You cannot expand per-node storage because i3.metal instances have fixed NVMe capacity. Horizontal scaling (adding nodes) is the only option.

---

### Q32
You are validating IAM permissions for NC2 on AWS and encounter "UnauthorizedOperation" errors. Which AWS service most likely needs additional permissions?
- A) S3 only
- B) EC2 and S3
- C) CloudWatch only
- D) RDS

**Answer: B**
NC2 on AWS requires IAM permissions for EC2 (instance management, security group modifications) and S3 (metadata backup storage). Missing permissions to either service will cause deployment or operational failures.

---

### Q33
You need to backup metadata for your NC2 cluster on AWS. Where should this backup be stored?
- A) EBS volumes
- B) AWS S3
- C) Local NVMe
- D) AWS Glacier

**Answer: B**
AWS S3 is the designated location for NC2 metadata backups on AWS. While cluster data uses local NVMe, metadata backups must be stored in S3 for disaster recovery and external redundancy.

---

### Q34
You are planning a Nutanix Move migration of 100 VMs from on-premises to NC2 on Azure. What is the recommended approach for large migrations?
- A) Migrate all VMs simultaneously
- B) Migrate in batches with validation between batches
- C) Use Leap for all migrations
- D) Migrate only small VMs first

**Answer: B**
Large migrations should be done in batches with validation between each batch. This approach reduces risk, allows for performance monitoring, and enables issue identification before migrating all workloads.

---

### Q35
An NC2 cluster on AWS needs to communicate securely with an on-premises data center. Which Direct Connect configuration is recommended?
- A) Public Virtual Interface (PublicVIF) only
- B) Private Virtual Interface (PrivateVIF) with encryption
- C) Both public and private VIFs
- D) No Direct Connect is needed

**Answer: B**
Private Virtual Interface (PrivateVIF) is used for on-premises to AWS NC2 communication. Adding site-to-site encryption provides additional security for hybrid connectivity.

---

### Q36
You notice high latency in your NC2 cluster on AWS. All nodes are properly configured and in the same AZ. What is the most likely cause?
- A) Nodes are in different AZs
- B) Security groups are blocking traffic on required ports
- C) NVMe performance degradation
- D) VPC subnet is too small

**Answer: B**
High latency with proper node placement typically indicates network issues, most commonly missing security group rules for inter-node communication (ports 9440, 2049, 3260).

---

### Q37
Your organization wants to run test workloads on NC2 during business hours only, then suspend them at night. What cost optimization feature should you use?
- A) Reserved Instances
- B) Node hibernation
- C) On-Demand instances only
- D) Spot instances

**Answer: B**
Node hibernation allows you to suspend NC2 nodes during off-peak hours, reducing cloud costs while maintaining the ability to resume quickly. This is ideal for dev/test environments with predictable usage patterns.

---

### Q38
You are comparing costs between Reserved Instances and On-Demand instances for a 3-year NC2 deployment. Which offers the best cost savings?
- A) On-Demand only
- B) Reserved Instances with 3-year commitment
- C) Mix of Reserved and On-Demand
- D) Spot instances

**Answer: B**
Reserved Instances with a 3-year upfront commitment provide significant cost savings (typically 40-50%) compared to On-Demand pricing for long-term, predictable workloads.

---

### Q39
Flow microsegmentation has been enabled on your NC2 cluster. What does this enable?
- A) Automatic VM replication
- B) Policy-based VM-to-VM network segmentation and access control
- C) Storage tiering to cloud providers
- D) Automatic backup to cloud

**Answer: B**
Flow provides microsegmentation on NC2, enabling policy-based network access control between VMs. This provides zero-trust security by limiting traffic to only explicitly allowed connections.

---

### Q40
You are designing NC2 on AWS with a 3-node cluster. Each node requires a unique IP address. What VPC subnet size calculation is correct?
- A) /30 (2 usable IPs)
- B) /27 (30 usable IPs)
- C) /25 (123 usable IPs on AWS)
- D) /24 (254 usable IPs)

**Answer: C**
A /25 subnet provides 128 total addresses. AWS reserves 5 addresses (network, broadcast, AWS router, AWS DNS, AWS future use), leaving 123 usable IP addresses. This is sufficient for a 3-node cluster (3 IPs), Flow Gateway instances, NAT Gateways, and management infrastructure with room for growth and operational requirements.

---

### Q41
You are configuring Azure Network Security Groups (NSGs) for an NC2 BareMetal cluster. What ports must be allowed for proper cluster functionality?
- A) Only 443 for HTTPS
- B) 9440 (management), 2049 (NFS), 3260 (iSCSI)
- C) All ports from 1024-65535
- D) 22 (SSH) only

**Answer: B**
NSGs for NC2 on Azure must allow the same critical ports as AWS security groups: 9440 (Prism UI), 2049 (NFS for storage), and 3260 (iSCSI for block storage).

---

### Q42
Your NC2 deployment on AWS spans multiple VPCs for security isolation. How should you connect these VPCs to the NC2 cluster?
- A) VPC peering only
- B) Transit Gateway with proper routing and security policies
- C) NAT Gateway only
- D) Direct Connect only

**Answer: B**
AWS Transit Gateway is the recommended approach for multi-VPC connectivity to NC2, providing centralized routing, security policy enforcement, and scalability without direct VPC-to-VPC peering complexity.

---

### Q43
You need to enable Prism Central to manage an NC2 cluster across the internet with security. What is the recommended architecture?
- A) Direct internet connection to Prism Central
- B) Prism Central with VPN tunnel or private connectivity via Direct Connect/ExpressRoute
- C) Prism Central public IP only
- D) No encryption needed for management traffic

**Answer: B**
Prism Central should be connected to NC2 via secure, private connectivity (VPN tunnel or Direct Connect/ExpressRoute) to protect management traffic. Internet-only connections are less secure and higher latency.

---

### Q44
An NC2 cluster on AWS experiences a node failure. The cluster is 3 nodes total. What is the status after one node failure?
- A) Cluster continues operating at reduced capacity
- B) Cluster immediately shuts down
- C) Automatic failover to Azure
- D) Cluster is unavailable until node is repaired

**Answer: A**
A 3-node cluster can lose one node and continue operating (the remaining 2 nodes maintain quorum for metadata services). However, you should destroy and replace the failed node promptly to restore fault tolerance.

---

### Q45
You want to implement automatic VM failover from on-premises to NC2 during a disaster. What Nutanix feature provides this capability?
- A) Prism Central only
- B) Leap with continuous replication and automated failover policies
- C) Snapshots only
- D) Manual Calm blueprints

**Answer: B**
Leap enables continuous replication and supports automated failover policies based on RPO/RTO requirements, enabling automatic failover from on-premises to NC2 during unplanned failures.

---

### Q46
You have deployed NC2 on both AWS and Azure using the same Prism Central instance. How are policies maintained across both environments?
- A) Policies must be manually synced
- B) Only AWS policies are supported
- C) Policies are automatically consistent across all registered environments
- D) Each environment requires separate policy definitions

**Answer: C**
Prism Central maintains consistent policies across all registered environments including both AWS and Azure NC2 clusters, ensuring unified security and resource management policies.

---

### Q47
Your NC2 cluster requires encrypted communication with on-premises systems. What is the encryption approach for Direct Connect connections?
- A) No encryption available
- B) AWS-provided encryption with VPN overlay
- C) TLS encryption at application layer only
- D) IPSec VPN tunnel over Direct Connect

**Answer: D**
IPSec VPN tunnels can be configured over Direct Connect connections for encrypted communication. This provides encryption at the network layer while leveraging Direct Connect's dedicated connection.

---

### Q48
You are troubleshooting an NC2 deployment on Azure that fails during initial provisioning. The error states "Insufficient BareMetal capacity." What should you attempt first?
- A) Increase the subnet size
- B) Retry in the same region after 15 minutes
- C) Change Azure region or wait for capacity
- D) Modify the Prism Central settings

**Answer: C**
"Insufficient BareMetal capacity" means Azure currently has no available BareMetal instances in that region. Retry later, change to a different region, or contact Azure Support to understand availability.

---

### Q49
An NC2 cluster is configured with Foundation image backup. How should metadata backups be validated on AWS?
- A) No validation is needed
- B) Verify S3 bucket access permissions and backup file integrity
- C) Only check backup file names
- D) Validate backups automatically occur

**Answer: B**
Metadata backup validation requires verifying S3 bucket access permissions (IAM roles grant access) and backup file integrity to ensure disaster recovery capability. Regular validation tests should be performed.

---

### Q50
You are planning NC2 on AWS and need to calculate the subnet IP allocation. For a 3-node cluster with 4 Flow Gateway instances and additional management IPs, what is the minimum subnet?
- A) /28 (14 IPs)
- B) /27 (30 IPs)
- C) /25 (123 usable IPs on AWS)
- D) /24 (254 IPs)

**Answer: C**
A /25 subnet provides 128 total addresses. After AWS reserves 5 addresses, 123 usable IPs remain, which is the Nutanix-documented minimum for NC2 on AWS. This accommodates cluster nodes (3), Flow Gateways (4+), management infrastructure, and DHCP/routing overhead.

---

### Q51
You want to replicate VMs continuously between on-premises and NC2 using Leap. What metric defines the maximum acceptable data loss in case of disaster?
- A) RTO (Recovery Time Objective)
- B) RPO (Recovery Point Objective)
- C) MTR (Mean Time to Recover)
- D) MTTF (Mean Time To Failure)

**Answer: B**
RPO (Recovery Point Objective) defines the maximum acceptable data loss—the point in time to which data can be recovered. Leap replication frequency determines RPO.

---

### Q52
You are designing a hybrid cloud architecture with on-premises Nutanix and NC2 on AWS. What connectivity approach provides the lowest latency?
- A) Public internet only
- B) AWS Direct Connect
- C) AWS VPN only
- D) Combination of VPN and S3

**Answer: B**
AWS Direct Connect provides dedicated, private network connectivity with consistent, low-latency performance compared to public internet connections. This is essential for replication and hybrid workloads.

---

### Q53
A user reports that their VM on NC2 cannot reach the on-premises database. You verify the VM is powered on and has network connectivity. What should you check next?
- A) VM RAM allocation
- B) DNS resolution and security group/NSG rules for database ports
- C) Storage capacity
- D) Hypervisor version

**Answer: B**
Network connectivity issues should be diagnosed by checking: DNS resolution (can the VM resolve the database hostname?), and security group/NSG rules (are database ports allowed in both directions?).

---

### Q54
Your NC2 cluster metadata backup fails silently (backup script runs but produces no output). Where should you check for error logs?
- A) AWS CloudWatch only
- B) S3 bucket for backup files
- C) NC2 cluster logs (via Prism) and S3 bucket verification
- D) Local node logs only

**Answer: C**
Diagnose backup failures by checking: NC2 cluster logs accessible through Prism Central, and verifying S3 bucket contains recent backup files. Both sources provide diagnostic information.

---

### Q55
You are implementing business continuity for an NC2 cluster on Azure. What is the minimum number of Flow Gateway VMs needed for redundancy?
- A) 1 Flow Gateway VM
- B) 2 Flow Gateway VMs
- C) 4 Flow Gateway VMs
- D) The minimum depends on ECMP configuration

**Answer: B**
Minimum 2 Flow Gateway VMs provide redundancy on Azure NC2. While ECMP supports up to 4 for load balancing, 2 is the minimum for high availability.

---

### Q56
During NC2 migration, you want to avoid impacting production workloads on-premises. What Nutanix feature allows you to test failover without affecting production?
- A) Live migration only
- B) Test failover to an isolated network
- C) Snapshot replication
- D) Continuous backup only

**Answer: B**
Nutanix Leap and Move support test failover to an isolated test network (separate VLAN/subnet), allowing validation without production impact. This enables safe failover testing before actual cutover.

---

### Q57
Your NC2 deployment requires redundant management paths. You have deployed Prism Central both on-premises and replicated to NC2. How are these instances synchronized?
- A) Manual sync required
- B) Continuous replication via Leap
- C) Database replication via Nutanix support
- D) Not synchronized—use separate instances

**Answer: B**
Nutanix Leap can replicate the entire Prism Central VM from on-premises to NC2, ensuring synchronized management infrastructure and enabling failover if needed.

---

### Q58
You receive an alert that the NC2 cluster on AWS is experiencing high CPU utilization. All nodes show similar utilization. What is the most likely cause?
- A) Insufficient memory
- B) Network bandwidth saturation
- C) High workload demand requiring cluster scaling
- D) Storage controller failure

**Answer: C**
Consistently high CPU utilization across all nodes typically indicates high demand from running workloads. This is resolved by horizontal scaling (adding nodes) or optimizing workload distribution.

---

### Q59
You are planning a DR test failover from on-premises to NC2 on Azure. The test failover is scheduled for 2 AM on Sunday. What networking requirement allows isolated test traffic?
- A) Test network must use different NSGs than production
- B) Test network must be on a separate subnet with no production traffic
- C) Test network requires separate NC2 cluster
- D) Direct internet access for test traffic

**Answer: B**
Test failover networks must be isolated on separate subnets with dedicated NSGs (Azure) or security groups (AWS). This prevents test traffic from reaching production infrastructure or databases.

---

### Q60
A critical application on NC2 requires <15 minute recovery time (RTO). You need to establish replication from on-premises. What configuration ensures this RTO?
- A) Daily snapshots only
- B) Hourly snapshots
- C) Continuous replication via Leap with frequent RPO intervals
- D) Weekly backups

**Answer: C**
Achieving <15 min RTO requires continuous replication (Leap) so recovery points are recent and failover can execute rapidly. RPO (Recovery Point Objective—maximum acceptable data loss) and RTO (Recovery Time Objective—maximum acceptable recovery time) are independent metrics. Both require frequent replication to maintain low values; a low RPO does not automatically guarantee low RTO if failover execution is slow. Continuous Leap replication enables both metrics to be achieved.

---

## SELECT TWO QUESTIONS (Questions 61-70)

### Q61 (Select TWO)
Your organization is migrating a Tier-1 application to NC2 on AWS. Which two components must be configured correctly for the migration to succeed? (Choose two.)
- A) Application code modifications
- B) AWS IAM roles with EC2 and S3 permissions
- C) VPC /25 subnet with same AZ placement
- D) AWS Reserved Instances purchase
- E) Prism Central network connectivity

**Answer: B, C**
Success requires: B) IAM roles with appropriate permissions (EC2, S3, security groups), and C) VPC /25 subnet minimum in the same AZ for all cluster nodes. Application code typically requires no changes; Reserved Instances are optional for cost; Prism Central is beneficial but not mandatory for basic deployment.

---

### Q62 (Select TWO)
When establishing hybrid cloud connectivity between on-premises and NC2 on AWS, which two connectivity options are recommended for production deployments? (Choose two.)
- A) Public internet VPN only
- B) AWS Direct Connect
- C) AWS Transit Gateway for multi-VPC routing
- D) NAT Gateway for all traffic
- E) S3 endpoint as primary connectivity

**Answer: B, C**
Production deployments should use: B) AWS Direct Connect for dedicated, low-latency connectivity, and C) AWS Transit Gateway for centralized routing and security. Public internet VPN lacks performance guarantees; NAT Gateway is for specific use cases; S3 is for data, not primary connectivity.

---

### Q63 (Select TWO)
You are troubleshooting deployment failures on NC2 across AWS and Azure. Which two types of errors are most critical to resolve during initial deployment? (Choose two.)
- A) Non-critical VM naming issues
- B) Insufficient cloud infrastructure quotas (EC2 capacity/BareMetal availability)
- C) Missing IAM permissions or Azure RBAC assignments
- D) Optional Prism Central connectivity delays
- E) Cosmetic UI display issues

**Answer: B, C**
Critical deployment failures result from: B) Insufficient infrastructure quotas (quota increases needed), and C) Missing IAM/RBAC permissions (prevents instance creation and operations). Other items are non-blocking or cosmetic.

---

### Q64 (Select TWO)
Your NC2 environment on Azure uses Flow for microsegmentation. Which two components are required for Flow to function on Azure BareMetal? (Choose two.)
- A) Azure Load Balancer
- B) Flow Gateway VMs with BGP and Azure Route Server
- C) Azure Kubernetes Service
- D) Delegated subnet for BareMetal infrastructure
- E) Public IP addresses for all VMs

**Answer: B, D**
Flow on Azure requires: B) Flow Gateway VMs configured with BGP to communicate with Azure Route Server for dynamic routing, and D) Delegated subnet properly configured for BareMetal. Load Balancer is optional; AKS is unrelated; public IPs are not required.

---

### Q65 (Select TWO)
You are planning disaster recovery for NC2 with Leap replication. Which two configuration items are essential for both planned and unplanned failover scenarios? (Choose two.)
- A) Daily snapshot schedule only
- B) Continuous replication with configured RPO/RTO
- C) Separate isolated test network for failover testing
- D) AWS Reserved Instances on DR site
- E) Reverse replication capability for failback

**Answer: B, E**
Essential for failover: B) Continuous replication with appropriate RPO/RTO settings to minimize data loss and recovery time, and E) Reverse replication to enable failback to on-premises if needed. Test networks are useful but not essential; Reserved Instances are optional; snapshots alone are insufficient.

---

### Q66 (Select TWO)
You are configuring security for an NC2 cluster on AWS with multi-environment access. Which two security controls must be implemented? (Choose two.)
- A) Security groups allowing ports 9440, 2049, 3260
- B) IAM roles limiting permissions to required services only
- C) Public internet access for all management traffic
- D) Encryption for on-premises to NC2 connectivity via VPN/Direct Connect
- E) Elimination of all password-based authentication

**Answer: A, B**
Required security controls: A) Security groups with explicit port rules (9440, 2049, 3260) for cluster communication, and B) IAM roles following least-privilege principle (EC2, S3, security groups only). Public internet access weakens security; encryption is important but depends on connectivity type; password elimination is a best practice but not mandatory.

---

### Q67 (Select TWO)
You are migrating a database VM from on-premises to NC2 on Azure using Nutanix Move. Which two validation steps must be completed before production cutover? (Choose two.)
- A) Verify VM CPU utilization is below 50%
- B) Perform test failover in isolated network and validate database functionality
- C) Confirm application connectivity and database replication status
- D) Verify AWS region selection
- E) Confirm all VMs are created on day 1

**Answer: B, C**
Pre-cutover validation: B) Test failover in isolated network to validate functionality without production impact, and C) Confirm application connectivity (can apps reach the migrated DB?) and replication is healthy. CPU utilization is not a pre-cutover requirement; AWS region is irrelevant for Azure migration; VM creation timing is not a validation criterion.

---

### Q68 (Select TWO)
Your NC2 deployment requires cost optimization while maintaining performance. Which two approaches align with NC2 cost management best practices? (Choose two.)
- A) Reserved Instances for predictable, long-term workloads
- B) Node hibernation for dev/test environments during off-peak hours
- C) Conversion to smaller instance types
- D) Elimination of all security groups to reduce overhead
- E) Maximum node count regardless of demand

**Answer: A, B**
Cost optimization: A) Reserved Instances for production workloads with predictable utilization (40-50% savings), and B) Node hibernation for dev/test to reduce cloud spending during off-hours. Smaller instances reduce performance; security group elimination weakens security; over-provisioning increases costs.

---

### Q69 (Select TWO)
You are setting up Prism Central to manage NC2 clusters across AWS and Azure regions. Which two capabilities does Prism Central provide in this hybrid environment? (Choose two.)
- A) Unified monitoring, alerting, and policy enforcement across environments
- B) Automatic datastore capacity management
- C) Consistent categorization for resource organization and billing
- D) Automatic VM replication between AWS and Azure
- E) Elimination of need for cloud-specific networking

**Answer: A, C**
Prism Central provides: A) Unified monitoring, alerting, and policy enforcement across registered environments (both AWS and Azure), and C) Consistent categories that work across all environments for resource tracking and billing. Datastore management is limited to storage; automatic replication requires Leap (separate tool); cloud networking still required.

---

### Q70 (Select TWO)
During an NC2 cluster node failure, which two actions are necessary for proper recovery? (Choose two.)
- A) Attempt to repair the node using Nutanix repair tools
- B) Destroy the failed cloud instance
- C) Provision a new instance to replace it
- D) Wait 24 hours for automatic recovery
- E) Migrate workloads to different cloud region

**Answer: B, C**
Proper recovery requires: B) Destroy the failed cloud instance (repair not possible for cloud infrastructure), and C) Provision a new instance to re-add to the cluster. Repair is not an option; automatic recovery doesn't occur; immediate action is required; migration is unnecessary if the rest of the cluster is healthy.

---

## ORDERING/SEQUENCE QUESTIONS (Questions 71-80)

### Q71
What is the correct order of steps to deploy an NC2 cluster on AWS from scratch?
1. Create VPC with /25 subnet in desired AZ
2. Configure IAM roles with EC2 and S3 permissions
3. Request EC2 quota for i3.metal instances
4. Access my.nutanix.com and initiate cluster deployment
5. Configure security groups for ports 9440, 2049, 3260
6. Wait for instances to launch and cluster initialization to complete

- A) 1, 2, 3, 4, 5, 6
- B) 3, 1, 2, 5, 4, 6
- C) 2, 1, 3, 5, 4, 6
- D) 1, 3, 2, 5, 4, 6

**Answer: B**
Correct sequence: 1) Request EC2 quota first to ensure availability, 2) Create VPC/subnet infrastructure, 3) Configure IAM permissions (required before deployment), 4) Configure security groups, 5) Initiate deployment via my.nutanix.com, 6) Monitor and wait for completion. This sequence ensures prerequisites are met before attempting deployment.

---

### Q72
What is the proper sequence for migrating a production VM from on-premises to NC2 on AWS using Nutanix Move?
1. Establish continuous replication from source to NC2
2. Configure test isolated network for failover testing
3. Perform test failover and validate functionality
4. Verify source and destination networks are connected
5. Execute planned failover during maintenance window
6. Validate application functionality and connectivity on NC2
7. Optionally configure reverse replication for failback

- A) 4, 1, 2, 3, 5, 6, 7
- B) 1, 4, 2, 3, 5, 6, 7
- C) 4, 2, 1, 3, 5, 6, 7
- D) 1, 2, 4, 3, 5, 6, 7

**Answer: A**
Correct sequence: 1) Verify network connectivity first, 2) Establish replication, 3) Set up test network, 4) Test failover (validate without production impact), 5) Execute planned failover in maintenance window, 6) Validate production functionality, 7) Configure reverse replication. Pre-cutover validation is critical before production failover.

---

### Q73
What is the correct order of configuration steps for NC2 on Azure BareMetal?
1. Create Azure delegated subnet (/24 minimum)
2. Deploy BareMetal instances via Nutanix provisioning
3. Configure Flow Gateway VMs with BGP
4. Connect Azure Route Server for dynamic routing
5. Configure NSGs for cluster communication ports
6. Access my.nutanix.com to complete cluster setup

- A) 1, 5, 2, 3, 4, 6
- B) 1, 2, 5, 3, 4, 6
- C) 2, 1, 5, 3, 4, 6
- D) 1, 5, 6, 2, 3, 4

**Answer: B**
Correct sequence: 1) Create delegated subnet infrastructure, 2) Deploy BareMetal instances, 3) Configure NSGs, 4) Deploy and configure Flow Gateways with BGP, 5) Connect Route Server (this enables routing updates), 6) Complete cluster setup via my.nutanix.com. Infrastructure prerequisites must be in place before instance deployment.

---

### Q74
What is the proper order of establishing hybrid cloud disaster recovery between on-premises Nutanix and NC2?
1. Deploy Prism Central on-premises (if not already present)
2. Establish network connectivity (Direct Connect/VPN/ExpressRoute)
3. Register NC2 cluster with Prism Central
4. Configure Leap replication for critical VMs
5. Set RPO/RTO policies and replication frequency
6. Perform test failover to NC2 in isolated network
7. Document failover procedures and runbooks

- A) 1, 2, 3, 4, 5, 6, 7
- B) 2, 1, 3, 4, 5, 6, 7
- C) 1, 3, 2, 4, 5, 6, 7
- D) 2, 3, 1, 4, 5, 6, 7

**Answer: A**
Correct sequence: 1) Ensure Prism Central exists, 2) Establish network connectivity (prerequisite for management), 3) Register clusters in Prism Central, 4) Enable Leap replication, 5) Configure RPO/RTO and replication schedule, 6) Test failover to validate, 7) Document procedures. Each step depends on previous steps being complete.

---

### Q75
What is the correct order of steps when a node fails in a production NC2 cluster?
1. Verify remaining cluster is stable and healthy
2. Destroy the failed cloud instance
3. Receive alert about node failure
4. Provision new cloud instance to NC2 specifications
5. Re-add new node to cluster via Prism
6. Monitor cluster resynchronization and data rebalancing
7. Verify all cluster services are healthy and operational

- A) 3, 1, 2, 4, 5, 6, 7
- B) 3, 1, 2, 4, 5, 7, 6
- C) 1, 2, 3, 4, 5, 6, 7
- D) 3, 2, 1, 4, 5, 6, 7

**Answer: A**
Correct sequence: 1) Receive alert, 2) Verify remaining cluster is stable, 3) Destroy failed instance (no repair possible), 4) Provision replacement, 5) Re-add to cluster, 6) Monitor recovery and rebalancing, 7) Verify health. Destroying failed node before verifying cluster stability could cause quorum loss.

---

### Q76
What is the proper sequence for scaling NC2 storage capacity?
1. Assess current storage utilization and growth projections
2. Add new nodes to the cluster via my.nutanix.com
3. Monitor rebalancing and storage distribution
4. Request cloud infrastructure quota if needed
5. Verify application performance remains acceptable
6. Document capacity planning and scaling events

- A) 1, 4, 2, 3, 5, 6
- B) 1, 2, 3, 4, 5, 6
- C) 4, 1, 2, 3, 5, 6
- D) 1, 4, 3, 2, 5, 6

**Answer: A**
Correct sequence: 1) Assess requirements, 2) Request quota if needed (ensure cloud capacity), 3) Add nodes via my.nutanix.com, 4) Monitor rebalancing, 5) Verify performance, 6) Document event. Quota request must occur before adding nodes to ensure instance provisioning succeeds.

---

### Q77
What is the correct order for enabling Flow microsegmentation on a production NC2 cluster?
1. Enable Flow microsegmentation in Prism Central
2. Plan VM categorization and traffic policies
3. Create categories and traffic flow rules
4. Define ingress/egress policies for critical applications
5. Test policies in non-critical VMs first
6. Apply policies to production VMs gradually
7. Monitor and alert on policy violations

- A) 2, 1, 3, 4, 5, 6, 7
- B) 1, 2, 3, 4, 5, 6, 7
- C) 2, 3, 1, 4, 5, 6, 7
- D) 1, 3, 2, 4, 5, 6, 7

**Answer: A**
Correct sequence: 1) Plan categorization and policies first, 2) Enable Flow in Prism Central, 3) Create categories and rules, 4) Define application policies, 5) Test on non-critical VMs (validate before production), 6) Roll out to production gradually, 7) Monitor for issues. Planning before implementation prevents production disruptions.

---

### Q78
What is the proper sequence for troubleshooting NC2 deployment failures?
1. Collect error messages and logs from deployment console
2. Verify prerequisites (VPC/subnet, IAM roles, quotas, security groups)
3. Check Nutanix deployment documentation for error codes
4. Contact AWS/Azure support if infrastructure-level issues exist
5. Attempt deployment retry after fixing identified issues
6. Escalate to Nutanix support if persistent failures occur

- A) 1, 2, 3, 4, 5, 6
- B) 1, 3, 2, 4, 5, 6
- C) 2, 1, 3, 4, 5, 6
- D) 1, 2, 3, 5, 4, 6

**Answer: C**
Correct sequence: 1) Verify all prerequisites first (quick checks often reveal issues), 2) Collect error messages and logs, 3) Reference error codes in documentation, 4) Contact cloud provider for infrastructure issues, 5) Retry deployment, 6) Escalate to Nutanix if still failing. This sequence eliminates common causes efficiently before escalation.

---

### Q79
What is the correct order for establishing Prism Central connectivity with NC2 on AWS using secure networking?
1. Establish AWS Direct Connect or VPN tunnel to AWS account
2. Configure security groups on NC2 cluster for Prism Central access (port 9440)
3. Configure Prism Central network policies to allow NC2 cluster access
4. Register NC2 cluster in Prism Central using cluster IP address
5. Validate connectivity by checking cluster health in Prism Central
6. Configure SSL certificates if using custom domains

- A) 1, 2, 3, 4, 5, 6
- B) 1, 2, 4, 3, 5, 6
- C) 2, 1, 3, 4, 5, 6
- D) 1, 3, 2, 4, 5, 6

**Answer: A**
Correct sequence: 1) Establish network connectivity first (prerequisite), 2) Configure cluster security group (enable Prism port 9440), 3) Configure Prism Central policies, 4) Register cluster, 5) Validate connectivity, 6) Configure SSL/certs. Network connectivity must exist before any management registration.

---

### Q80
What is the proper order for implementing metadata backup automation for NC2 on AWS?
1. Verify S3 bucket exists and IAM role has access permissions
2. Configure backup schedule in cluster settings (daily/weekly frequency)
3. Create S3 bucket with appropriate retention policies
4. Verify initial backup completes successfully
5. Monitor backup logs and set alerts for backup failures
6. Test metadata restore process from backup

- A) 3, 1, 2, 4, 5, 6
- B) 1, 3, 2, 4, 5, 6
- C) 3, 2, 1, 4, 5, 6
- D) 1, 2, 3, 4, 5, 6

**Answer: A**
Correct sequence: 1) Create S3 bucket with retention policies first, 2) Verify bucket access via IAM, 3) Configure backup schedule, 4) Verify initial backup succeeds, 5) Set monitoring and alerts, 6) Test restore capability. Infrastructure (bucket) must exist before configuring backups.

---

## END OF EXAM QUESTIONS

**Total Questions: 80**
- Standard MCQ: 60 (Q1-Q60)
- Select TWO: 10 (Q61-Q70)
- Ordering/Sequence: 10 (Q71-Q80)

---

## STUDY GUIDE TIPS

1. **NC2 on AWS Key Concepts**: i3.metal instances, /25 VPC subnet, same AZ placement, local NVMe storage, S3 metadata backup, IAM roles, security groups (9440/2049/3260)

2. **NC2 on Azure Key Concepts**: BareMetal Infrastructure, delegated subnet (/24), Flow Gateway VMs (max 4 ECMP), BGP with Azure Route Server, ExpressRoute, NSGs

3. **Deployment Requirements**: my.nutanix.com access, minimum 3 nodes, full AOS+AHV stack pre-installed, Foundation not needed, subscription licensing, node hibernation option

4. **Networking**: VPC/VNet peering, Transit Gateway, Flow microsegmentation, NAT Gateway, split-horizon DNS, VPN failover with BGP

5. **DR/Migration**: Leap (continuous replication, planned/unplanned failover), Nutanix Move (batch migration with test failover), reverse replication for failback

6. **Management**: Prism Central unified dashboard, categories across environments, Calm blueprints, NKE/NKP support

7. **Troubleshooting**: Quota failures (request increase), IAM/RBAC errors (check permissions), node failure (destroy and re-add), storage full (add nodes only)

8. **Cost Optimization**: Reserved Instances for long-term, node hibernation for dev/test, subscription licensing, capacity planning

---

**Good luck with your NCP-CI 6.10 exam!**
