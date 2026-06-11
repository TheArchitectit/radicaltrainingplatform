# NCP-CI 6.10 Practice Exam – Domains 1 & 2

## Domain 1: Prepare Cloud Environment (Q1–Q40)

---

### Q1
A cloud architect is preparing an AWS environment for NC2 deployment. The VPC has a /24 CIDR block with a single subnet. What potential issue should be addressed?
- A) The subnet must be at least /25, but a /24 provides insufficient host addresses for NC2 plus other workloads
- B) NC2 requires a minimum /25 subnet; a /24 exceeds this and is perfectly acceptable
- C) NC2 does not use subnets; it deploys directly into the VPC CIDR
- D) The subnet must use IPv6 addressing for NC2 compatibility

**Answer: B**
NC2 requires a minimum /25 subnet for the host network. A /24 provides 256 addresses which exceeds the minimum requirement and is perfectly acceptable for NC2 deployment.

---

### Q2
An infrastructure team plans to deploy NC2 on AWS across two availability zones within the same region for higher availability. Why will this approach fail during deployment?
- A) NC2 clusters require nodes in at least three availability zones
- B) All NC2 nodes must reside in the same availability zone
- C) AWS does not support bare-metal instances in more than one availability zone per region
- D) NC2 requires a separate VPC for each availability zone

**Answer: B**
NC2 requires all cluster nodes to be placed in the same availability zone. Spanning nodes across multiple AZs is not supported because the Nutanix Distributed Storage Fabric requires low-latency communication between nodes.

---

### Q3
A security engineer is defining the IAM role for NC2 on AWS. Which combination of service permissions must be included in the IAM policy?
- A) EC2, VPC, EBS, and S3
- B) EC2, Lambda, DynamoDB, and CloudFront
- C) EKS, ECR, S3, and IAM
- D) EC2, RDS, Redshift, and S3

**Answer: A**
The NC2 IAM role requires permissions for EC2 (bare-metal instance management), VPC (networking), EBS (bootstrap operations), and S3 (cluster metadata backup). Services like Lambda, DynamoDB, or RDS are not part of the NC2 control plane.

---

### Q4
A solutions architect is selecting AWS instance types for an NC2 cluster that requires maximum local storage density. Which instance type best meets this requirement?
- A) m5.metal — optimized for general-purpose compute with EBS storage
- B) i3en.metal — provides high-density local NVMe storage on bare-metal
- C) c5.metal — optimized for compute-intensive workloads
- D) r5.metal — optimized for memory-intensive workloads with EBS

**Answer: B**
The i3en.metal instance type provides high-density local NVMe storage on bare-metal hardware, making it ideal for NC2 deployments requiring maximum storage capacity. NC2 uses local NVMe drives with DSF, not EBS-backed storage.

---

### Q5
An enterprise is configuring hybrid connectivity between their on-premises datacenter and NC2 on AWS. Which connectivity option provides the most consistent network performance?
- A) AWS Site-to-Site VPN over the public internet
- B) AWS Direct Connect with a dedicated connection
- C) AWS Transit Gateway with internet-based peering
- D) AWS CloudFront with origin failover

**Answer: B**
AWS Direct Connect provides a dedicated, private network connection between on-premises infrastructure and AWS, delivering consistent network performance, lower latency, and higher bandwidth compared to internet-based VPN connections.

---

### Q6
A network engineer needs to configure route tables for an NC2 deployment. Traffic must flow dynamically between the NC2 subnet and the on-premises datacenter over Direct Connect. Which routing protocol should be configured on the Direct Connect virtual interface?
- A) OSPF for internal gateway routing
- B) BGP for dynamic route advertisement
- C) EIGRP for hybrid routing
- D) RIP for simple distance-vector routing

**Answer: B**
BGP (Border Gateway Protocol) is the routing protocol used with AWS Direct Connect virtual interfaces for dynamic route advertisement between on-premises networks and AWS VPCs. OSPF, EIGRP, and RIP are not supported on Direct Connect.

---

### Q7
A cloud administrator needs to ensure that Prism Element is accessible from the management network after NC2 deployment on AWS. Which port must be allowed in the security group attached to NC2 nodes?
- A) Port 443 — standard HTTPS for all AWS services
- B) Port 9440 — Prism Element web console
- C) Port 8443 — vCenter Server management
- D) Port 3389 — Remote Desktop Protocol

**Answer: B**
Prism Element uses port 9440 for its web console. This port must be explicitly allowed in the AWS security group assigned to NC2 nodes to enable management access from authorized networks.

---

### Q8
An architect is planning the VPC design for NC2 on AWS. Which VPC configuration is recommended as a best practice?
- A) Use the default VPC in the target region to minimize setup complexity
- B) Use a shared VPC with other production workloads for consolidated management
- C) Use a dedicated VPC for NC2 to isolate cloud cluster resources
- D) Use a peered pair of VPCs with one in each availability zone

**Answer: C**
Nutanix recommends using a dedicated VPC for NC2 deployments. This isolates the cluster resources, simplifies security group management, and prevents conflicts with other workloads that may share the same network space.

---

### Q9
A company wants to use NC2 on AWS for development and testing workloads that only run during business hours. Which cost optimization strategy is most appropriate?
- A) Use Spot Instances for NC2 nodes to reduce hourly costs
- B) Use NC2 node hibernation to pause clusters during non-business hours
- C) Use AWS Auto Scaling to dynamically add and remove NC2 nodes
- D) Use Savings Plans applied to NC2 bare-metal instances

**Answer: B**
NC2 supports node hibernation, which allows dev/test clusters to be paused during non-business hours to reduce costs. Spot Instances cannot be used for NC2 bare-metal nodes, and Auto Scaling does not apply to NC2 cluster nodes.

---

### Q10
A network engineer is configuring AWS security groups for NC2 and needs to allow NFS traffic between user VMs and the Nutanix storage layer. Which port must be opened?
- A) Port 2049 — NFS
- B) Port 445 — SMB/CIFS
- C) Port 111 — Portmapper
- D) Port 873 — Rsync

**Answer: A**
NFS traffic uses port 2049. This port must be allowed in the security group to enable Nutanix Files or NFS-based datastore access between user VMs and the Distributed Storage Fabric running on NC2 nodes.

---

### Q11
An organization operating NC2 on AWS wants to back up cluster metadata for disaster recovery. Which AWS service does NC2 use for this purpose?
- A) Amazon EBS snapshots stored in the same availability zone
- B) Amazon S3 for cluster metadata backup
- C) Amazon Glacier for long-term archival of cluster state
- D) Amazon EFS for shared file-based metadata storage

**Answer: B**
NC2 uses Amazon S3 to store cluster metadata backups. S3 provides durable, highly available object storage suitable for metadata. S3 is not used for DSF storage — only for metadata backup purposes.

---

### Q12
An administrator is creating an IAM role for NC2 and wants a second AWS account to manage the NC2 cluster. Which IAM feature enables this?
- A) IAM user groups with inline policies
- B) Cross-account IAM roles with trust relationships
- C) IAM access keys shared between accounts
- D) AWS Organizations service control policies only

**Answer: B**
Cross-account IAM roles allow one AWS account to assume a role in another account, enabling centralized management of NC2 across multiple AWS accounts. This is supported by NC2 and is more secure than sharing access keys.

---

### Q13
A cloud engineer discovers that NC2 deployment fails on AWS with an "insufficient capacity" error. Which action should be taken FIRST?
- A) Change the VPC CIDR block to a larger range
- B) Verify that the selected bare-metal instance type is available in the target availability zone
- C) Increase the EBS volume size for the NC2 nodes
- D) Switch from a dedicated VPC to the default VPC

**Answer: B**
Bare-metal instance capacity varies by availability zone. An "insufficient capacity" error typically means the selected instance type (e.g., i3.metal) is not available in the chosen AZ. Verifying instance availability and potentially selecting a different AZ is the correct first step.

---

### Q14
Which statement is NOT true about NC2 on AWS networking requirements?
- A) All NC2 nodes must be in the same availability zone
- B) A minimum /25 subnet is required for the NC2 host network
- C) NC2 nodes can use any standard EC2 instance type including t3.xlarge
- D) Security groups must allow specific Nutanix management ports

**Answer: C**
NC2 requires bare-metal instance types such as i3.metal or i3en.metal. Standard EC2 instance types like t3.xlarge are virtualized and cannot run the AHV hypervisor or AOS stack required by NC2.

---

### Q15
A solutions architect is designing hybrid connectivity for NC2 on AWS and wants redundancy. Direct Connect is the primary path. What should be configured as a backup?
- A) A second Direct Connect link using Link Aggregation Group (LAG)
- B) AWS Site-to-Site VPN as a failover path
- C) AWS PrivateLink as a secondary connection
- D) VPC peering to a secondary region

**Answer: B**
AWS Site-to-Site VPN can serve as a backup path when Direct Connect is the primary connectivity method. A VPN tunnel over the internet provides failover capability if the Direct Connect link becomes unavailable.

---

### Q16
An enterprise is configuring Direct Connect for NC2 on AWS and requires increased bandwidth with link redundancy. Which Direct Connect feature should be used?
- A) Virtual Private Gateway with multiple route tables
- B) Link Aggregation Group (LAG) to bundle multiple connections
- C) Direct Connect Gateway with transit VPC
- D) Elastic Network Interface with enhanced networking

**Answer: B**
Direct Connect supports Link Aggregation Groups (LAGs), which bundle multiple physical connections into a single logical connection. This provides increased bandwidth and link-level redundancy for NC2 hybrid deployments.

---

### Q17
An Azure administrator is preparing the network for NC2 deployment. What type of subnet must be provisioned within the VNet?
- A) A standard subnet with a Network Security Group attached
- B) A delegated subnet specifically for BareMetal hosts
- C) A GatewaySubnet for ExpressRoute termination
- D) An AzureFirewallSubnet for traffic inspection

**Answer: B**
NC2 on Azure runs on Azure BareMetal Infrastructure, which requires a delegated subnet within the VNet. This delegated subnet is exclusively allocated to BareMetal hosts and cannot be shared with regular Azure VMs.

---

### Q18
A cloud architect is planning NC2 deployment on Azure. Which Azure infrastructure service hosts the NC2 nodes?
- A) Azure Virtual Machines with nested virtualization enabled
- B) Azure BareMetal Infrastructure
- C) Azure VMware Solution (AVS)
- D) Azure Dedicated Host with D-series instances

**Answer: B**
NC2 on Azure runs on Azure BareMetal Infrastructure, which provides dedicated physical servers. Unlike regular Azure VMs, BareMetal instances give NC2 direct hardware access needed to run the AHV hypervisor and AOS stack.

---

### Q19
An enterprise is deploying NC2 on Azure and requires hybrid connectivity to their on-premises datacenter with private, high-bandwidth links. Which Azure service is recommended?
- A) Azure VPN Gateway with IPsec tunnels
- B) Azure ExpressRoute with private peering
- C) Azure Front Door with backend pools
- D) Azure Virtual WAN with SD-WAN integration

**Answer: B**
Azure ExpressRoute provides private, dedicated connectivity between on-premises networks and Azure. It is the recommended option for NC2 hybrid deployments due to its consistent performance, low latency, and higher bandwidth compared to VPN.

---

### Q20
A company has NC2 clusters deployed in two different Azure regions and needs direct communication between them. Which ExpressRoute feature enables cross-region connectivity?
- A) ExpressRoute FastPath for accelerated routing
- B) ExpressRoute Global Reach for inter-region connectivity
- C) ExpressRoute Local for same-metro connectivity
- D) ExpressRoute Direct for dedicated port allocation

**Answer: B**
ExpressRoute Global Reach allows traffic to flow directly between two ExpressRoute circuits in different regions without routing through the public internet or Microsoft's backbone. This enables direct communication between NC2 clusters in multiple Azure regions.

---

### Q21
An Azure administrator needs to control traffic flow to NC2 management interfaces. Which Azure resource should be configured to allow Nutanix management traffic?
- A) Azure Firewall with DNAT rules
- B) Network Security Groups (NSGs) with inbound allow rules
- C) Azure Private Endpoint policies
- D) Azure Traffic Manager health probes

**Answer: B**
Network Security Groups (NSGs) are used to filter network traffic to and from Azure resources. NSG inbound rules must be configured to allow Nutanix management traffic such as Prism Element on port 9440 to reach NC2 nodes.

---

### Q22
An organization wants to integrate NC2 management on Azure with their existing identity governance framework. Which Azure service provides role-based access control for NC2?
- A) Azure Key Vault with managed identities
- B) Azure Active Directory with RBAC and service principals
- C) Azure Policy with compliance initiatives
- D) Azure Monitor with action groups

**Answer: B**
Azure Active Directory (Azure AD) provides RBAC for NC2 management. Service principals can be created to grant NC2 the necessary permissions, and RBAC roles control which administrators can manage NC2 resources.

---

### Q23
A cloud operations team is deploying NC2 on Azure. Into which type of container should all NC2-related Azure resources be placed?
- A) An Azure Management Group spanning multiple subscriptions
- B) A dedicated Azure Resource Group for NC2 resources
- C) An Azure Subscription reserved exclusively for NC2
- D) An Azure Availability Set for fault domain isolation

**Answer: B**
NC2 resources on Azure should be placed in a dedicated resource group. This provides logical grouping, simplified access control, and easier lifecycle management for all resources associated with the NC2 deployment.

---

### Q24
A storage architect is told that NC2 on AWS must use Amazon EBS volumes for persistent storage. Why is this statement incorrect?
- A) NC2 uses Amazon EFS for shared storage instead of EBS
- B) NC2 uses local NVMe drives on bare-metal instances with the Distributed Storage Fabric, not EBS
- C) NC2 uses Amazon S3 as its primary storage tier, not EBS
- D) NC2 uses Amazon FSx for Windows File Server as its storage backend

**Answer: B**
NC2 leverages the local NVMe drives attached to bare-metal instances (such as i3.metal) and manages them through the Nutanix Distributed Storage Fabric (DSF). EBS is not used for NC2 data storage.

---

### Q25
A company plans to run NC2 on AWS using c5.4xlarge instances to reduce costs. Why will this deployment fail?
- A) The c5.4xlarge lacks sufficient memory for AOS
- B) NC2 requires bare-metal instance types; c5.4xlarge is a virtualized instance that cannot run AHV
- C) The c5.4xlarge does not support enhanced networking required by NC2
- D) The c5.4xlarge is only available in us-east-1 and NC2 requires multi-region support

**Answer: B**
NC2 requires bare-metal instances (e.g., i3.metal, i3en.metal) because it must run the AHV hypervisor directly on physical hardware. Virtualized instances like c5.4xlarge cannot support nested hypervisor deployment.

---

### Q26
An engineer is configuring security groups for NC2 on AWS and must enable iSCSI access for guest VMs. Which port must be opened?
- A) Port 3260 — iSCSI target
- B) Port 860 — iSCSI discovery
- C) Port 5985 — WinRM HTTP
- D) Port 1521 — Oracle database

**Answer: A**
iSCSI uses port 3260 for data transfer between initiators and targets. This port must be opened in the security group to allow guest VMs to access Nutanix Volumes (block storage) on NC2 nodes.

---

### Q27
A VPC for NC2 on AWS has been configured with a /16 CIDR block. Which statement best explains why this is a common recommendation?
- A) AWS requires a minimum /16 CIDR for VPCs hosting bare-metal instances
- B) A /16 provides a large address space accommodating NC2 subnets, management networks, and future expansion
- C) NC2 reserves all addresses in a /16 for internal DSF replication traffic
- D) Direct Connect requires the VPC to advertise a /16 or larger prefix via BGP

**Answer: B**
A /16 CIDR block (65,536 addresses) is commonly recommended because it provides ample address space for the NC2 host subnet, management networks, user VM subnets, and room for future growth without requiring VPC re-addressing.

---

### Q28
A company is deploying NC2 on AWS and must ensure the VPC is in the correct location. What is the geographic requirement for the VPC relative to NC2?
- A) The VPC must be in a different region than NC2 for disaster recovery
- B) The VPC must be in the same region where NC2 will be deployed
- C) The VPC must span at least two regions using inter-region peering
- D) The VPC can be in any region as long as a Transit Gateway connects them

**Answer: B**
The VPC must be in the same AWS region where NC2 is deployed. NC2 nodes are provisioned within a subnet of this VPC, and cross-region VPC usage is not supported for the host network.

---

### Q29
An administrator is designing an Azure VNet for NC2 and needs to determine the correct network architecture. Which statement is true about the VNet configuration?
- A) NC2 on Azure uses a shared VNet with other Azure VM workloads to simplify routing
- B) A dedicated VNet is recommended for NC2 with a delegated subnet for BareMetal hosts
- C) NC2 on Azure does not require a VNet; it connects directly to ExpressRoute circuits
- D) NC2 requires two VNets — one for management and one for data traffic

**Answer: B**
NC2 on Azure requires a dedicated VNet containing a delegated subnet for Azure BareMetal hosts. This isolation ensures proper network segmentation and avoids conflicts with other Azure workloads.

---

### Q30
An operations team wants to reduce NC2 costs on AWS for long-running production workloads. Which pricing model provides the best cost optimization?
- A) On-Demand Instances with scheduled scaling policies
- B) Reserved Instances for committed bare-metal capacity
- C) Spot Instances for interruptible bare-metal workloads
- D) Dedicated Hosts with per-socket licensing

**Answer: B**
Reserved Instances provide significant cost savings for long-running, steady-state NC2 production workloads by committing to one- or three-year terms. Spot Instances are not suitable for NC2 because node interruption would disrupt the cluster.

---

### Q31
A network architect needs to allow NFS, iSCSI, and Prism management traffic through the AWS security group for NC2. Which set of ports must be opened?
- A) 2049, 3260, and 9440
- B) 443, 8080, and 3306
- C) 22, 80, and 5432
- D) 111, 445, and 8443

**Answer: A**
NC2 requires port 2049 (NFS), port 3260 (iSCSI), and port 9440 (Prism Element) for storage access and cluster management. These ports must be explicitly allowed in the security group attached to NC2 nodes.

---

### Q32
An Azure engineer is troubleshooting NC2 deployment failure and finds that the delegated subnet does not have sufficient IP addresses. What is the most likely root cause?
- A) The VNet was created with an IPv6-only address space
- B) The delegated subnet CIDR is too small to accommodate the requested number of BareMetal hosts
- C) Azure BareMetal hosts require public IP addresses that are exhausted
- D) The NSG attached to the subnet is blocking DHCP requests

**Answer: B**
Each Azure BareMetal host requires IP addresses from the delegated subnet. If the subnet CIDR is too small for the number of NC2 nodes requested, the deployment will fail due to insufficient address space.

---

### Q33
Which statement is NOT true about NC2 on Azure networking?
- A) A delegated subnet is required within the VNet for BareMetal hosts
- B) Network Security Groups must permit Nutanix management traffic
- C) NC2 on Azure uses standard Azure VMs with accelerated networking
- D) ExpressRoute is the recommended connectivity option for hybrid deployments

**Answer: C**
NC2 on Azure runs on Azure BareMetal Infrastructure, not standard Azure VMs. BareMetal hosts provide dedicated physical hardware required to run the AHV hypervisor and full Nutanix stack.

---

### Q34
A cloud team discovers that the IAM role for NC2 on AWS is missing S3 permissions. What functionality will be impacted?
- A) NC2 node boot process will fail because AOS images are stored in S3
- B) Cluster metadata backup will fail because NC2 stores metadata backups in S3
- C) Guest VM snapshots will fail because they are stored in S3
- D) DSF replication will fail because data is tiered to S3

**Answer: B**
NC2 uses S3 specifically for cluster metadata backup. Without S3 permissions in the IAM role, the cluster cannot write or retrieve metadata backups, potentially impacting disaster recovery capabilities.

---

### Q35
A solutions architect is comparing AWS Direct Connect and Azure ExpressRoute for NC2 hybrid deployments. Which statement accurately describes a key difference?
- A) Direct Connect uses BGP; ExpressRoute does not support dynamic routing
- B) Direct Connect supports LAG for bandwidth aggregation; ExpressRoute uses Global Reach for multi-region connectivity
- C) Direct Connect is limited to 1 Gbps; ExpressRoute supports up to 100 Gbps
- D) Direct Connect requires a VPN backup; ExpressRoute has built-in redundancy that eliminates the need for backup paths

**Answer: B**
AWS Direct Connect supports Link Aggregation Groups (LAG) to bundle physical connections for increased bandwidth. Azure ExpressRoute offers Global Reach to enable direct connectivity between circuits in different regions. Both use BGP for dynamic routing.

---

### Q36
An administrator is setting up NC2 on AWS and needs to ensure the VPC route table allows traffic between the NC2 subnet and on-premises networks. What must be configured?
- A) A default route pointing to an internet gateway
- B) Routes for on-premises CIDR blocks pointing to the Virtual Private Gateway associated with Direct Connect
- C) A route to the S3 VPC endpoint for all NC2 traffic
- D) A NAT Gateway route for NC2 nodes to reach on-premises networks

**Answer: B**
The VPC route table must include routes for on-premises network CIDR blocks pointing to the Virtual Private Gateway (VGW) associated with the Direct Connect connection. This enables traffic flow between NC2 and on-premises infrastructure.

---

### Q37
A company has a strict compliance requirement that NC2 management traffic must not traverse the public internet when connecting to Azure. Which architecture meets this requirement?
- A) Azure VPN Gateway with forced tunneling over the internet
- B) Azure ExpressRoute with private peering and Microsoft peering
- C) Azure Application Gateway with WAF in prevention mode
- D) Azure CDN with custom domain and HTTPS enforcement

**Answer: B**
Azure ExpressRoute with private peering provides a fully private connection that does not traverse the public internet. Microsoft peering can be added for accessing Azure public services like Azure AD privately, ensuring all NC2 management traffic stays off the public internet.

---

### Q38
An engineer is planning NC2 on AWS and needs to select the appropriate instance type. Which of the following is a valid instance type for NC2?
- A) m5.2xlarge — general-purpose optimized
- B) i3.metal — bare-metal with local NVMe storage
- C) t3.2xlarge — burstable performance
- D) p4d.24xlarge — GPU-accelerated compute

**Answer: B**
NC2 requires bare-metal instance types such as i3.metal which provides local NVMe storage and direct hardware access. The ".metal" suffix indicates a bare-metal instance where AHV can be installed directly on the physical hardware.

---

### Q39
A security team is reviewing the AWS configuration for NC2 and finds that the security group allows all inbound traffic (0.0.0.0/0) on all ports. What is the recommended remediation?
- A) Replace with an NACL that blocks all traffic and allow specific ports at the subnet level only
- B) Restrict inbound rules to only the required ports (9440, 2049, 3260, etc.) from authorized source CIDRs
- C) Remove the security group entirely and rely on NC2's built-in firewall
- D) Move the NC2 nodes to a private subnet with no security group

**Answer: B**
Security groups should follow the principle of least privilege. Inbound rules should be restricted to specific Nutanix ports (9440 for Prism, 2049 for NFS, 3260 for iSCSI) and limited to authorized source CIDR ranges for management and data access.

---

### Q40
An administrator is configuring Azure AD for NC2 management and needs to grant programmatic access for automation. Which Azure AD entity should be created?
- A) A managed identity attached to an Azure VM
- B) A service principal with appropriate RBAC role assignments
- C) A guest user account with Global Administrator rights
- D) An Azure AD B2C tenant for external access

**Answer: B**
A service principal in Azure AD provides programmatic identity for NC2 automation and management tasks. RBAC role assignments control what actions the service principal can perform on NC2-related Azure resources.

---

## Domain 2: Deploy NC2 (Q41–Q80)

---

### Q41
An administrator is deploying a new NC2 cluster on AWS. What is the first step in the deployment process?
- A) Run the Foundation VM to image bare-metal nodes
- B) Log in to my.nutanix.com and launch the NC2 Console cluster creation wizard
- C) SSH into each bare-metal instance and manually install AOS
- D) Create an AMI with AHV pre-installed and launch it on EC2

**Answer: B**
NC2 deployment begins at the my.nutanix.com portal where the NC2 Console provides a cluster creation wizard. Foundation is not used for cloud deployments — the imaging process is handled automatically during cloud-based provisioning.

---

### Q42
During NC2 cluster creation, the wizard asks the administrator to specify the cloud provider, region, instance type, and node count. What is the minimum number of nodes required?
- A) 1 node for a single-node cluster
- B) 2 nodes for a minimum HA pair
- C) 3 nodes for a minimum cluster
- D) 4 nodes to support RF2 with a witness

**Answer: C**
NC2 requires a minimum of 3 nodes to form a cluster. This ensures proper redundancy and data protection through the Distributed Storage Fabric with replication factor 2 (RF2) and maintains quorum for cluster operations.

---

### Q43
A newly deployed NC2 cluster on AWS must be integrated with centralized management. Which Nutanix component should the cluster register to?
- A) Prism Element for local cluster management only
- B) Prism Central for centralized multi-cluster management
- C) Nutanix Move for workload migration
- D) Nutanix Calm for application automation

**Answer: B**
NC2 clusters register to Prism Central for centralized management, monitoring, and operations across multiple clusters — including both on-premises and cloud-based NC2 clusters from a single pane of glass.

---

### Q44
An engineer is troubleshooting an NC2 deployment failure on AWS. The cluster creation wizard shows an error related to permissions. What should be checked first?
- A) Whether the VPC has DNS hostnames enabled
- B) Whether the IAM role has the required EC2, VPC, EBS, and S3 permissions
- C) Whether the S3 bucket has versioning enabled
- D) Whether CloudTrail logging is active in the region

**Answer: B**
Permission-related deployment failures are most commonly caused by an incomplete or incorrect IAM role. The NC2 IAM role must include permissions for EC2, VPC, EBS, and S3 to successfully provision and manage the cluster.

---

### Q45
After deploying NC2 on AWS, the administrator needs to configure the cluster for production use. Which three settings must be configured during initial setup?
- A) Cluster virtual IP (VIP), iSCSI data services IP, and DNS/NTP servers
- B) AWS CloudWatch alarms, SNS topics, and Lambda triggers
- C) EBS volume encryption keys, KMS policies, and S3 lifecycle rules
- D) VPC flow logs, Route 53 records, and CloudFront distributions

**Answer: A**
Initial NC2 cluster configuration requires setting the cluster virtual IP (VIP) for management access, the iSCSI data services IP for block storage, and DNS/NTP servers for name resolution and time synchronization.

---

### Q46
Which statement accurately describes the storage architecture of NC2 on AWS?
- A) NC2 uses Amazon EBS gp3 volumes striped across nodes for storage
- B) NC2 uses local NVMe drives on bare-metal instances managed by the Distributed Storage Fabric
- C) NC2 uses Amazon FSx for Lustre as the primary storage tier
- D) NC2 uses Amazon S3 with Storage Gateway for persistent storage

**Answer: B**
NC2 uses the local NVMe drives present on bare-metal instances (e.g., i3.metal) and manages them through the Nutanix Distributed Storage Fabric (DSF), providing the same storage experience as on-premises Nutanix clusters.

---

### Q47
A Nutanix administrator familiar with on-premises deployments is preparing for their first NC2 deployment. They plan to use Foundation to image the cloud nodes. Why is this approach incorrect?
- A) Foundation is only compatible with AHV 5.x, and NC2 requires AHV 6.x
- B) Foundation is not needed for NC2; the cloud deployment process handles node imaging automatically
- C) Foundation must be replaced with Prism Central for cloud-based imaging
- D) Foundation requires IPMI access which is unavailable on AWS instances

**Answer: B**
NC2 does not use Foundation for deployment. The cloud provisioning process, initiated through the NC2 Console at my.nutanix.com, handles all node imaging automatically without requiring the traditional Foundation workflow.

---

### Q48
An NC2 cluster on AWS needs to be expanded to handle increased workloads. Where can additional nodes be added?
- A) Only through the AWS EC2 console by launching new bare-metal instances manually
- B) From the NC2 Console or Prism Central
- C) Only by destroying and redeploying the entire cluster with more nodes
- D) Only through the AWS CLI using a CloudFormation template

**Answer: B**
NC2 cluster expansion can be performed through the NC2 Console at my.nutanix.com or through Prism Central. Both interfaces allow administrators to add nodes to an existing cluster without manual AWS console operations.

---

### Q49
A hardware failure occurs on one of the NC2 nodes in AWS. How should the administrator handle node replacement?
- A) Use Prism Element's hardware replacement workflow to repair the node in place
- B) Destroy the failed node and re-add a new node to the cluster
- C) Contact AWS support to replace the physical drive on the bare-metal host
- D) Restore the node from an EBS snapshot taken before the failure

**Answer: B**
In NC2, failed nodes are replaced by destroying the failed instance and adding a new node to the cluster. Unlike on-premises environments where hardware can be physically repaired, cloud nodes are treated as disposable and replaced entirely.

---

### Q50
Which licensing model does NC2 use?
- A) Traditional node-locked perpetual licensing tied to hardware serial numbers
- B) Subscription-based licensing
- C) Bring-your-own-license (BYOL) from on-premises Nutanix clusters
- D) AWS Marketplace hourly metered licensing per vCPU

**Answer: B**
NC2 uses a subscription licensing model. Unlike traditional on-premises Nutanix licenses that are locked to specific hardware nodes, NC2 subscriptions are flexible and aligned with the cloud consumption model.

---

### Q51
An administrator is deploying NC2 on Azure and is asked which portal initiates the deployment. What is the correct answer?
- A) The Azure Portal under BareMetal Infrastructure blade
- B) The NC2 Console at my.nutanix.com
- C) The Nutanix Support Portal at portal.nutanix.com
- D) The Azure CLI using az baremetal create commands

**Answer: B**
NC2 deployment for both AWS and Azure is initiated through the NC2 Console at my.nutanix.com. This web portal provides a unified cluster creation wizard regardless of the target cloud provider.

---

### Q52
During NC2 deployment troubleshooting, an administrator discovers that the target AWS region has insufficient quota for i3.metal instances. What is the recommended resolution?
- A) Switch to m5.metal instances which have higher default quotas
- B) Request a service quota increase for the required bare-metal instance type from AWS
- C) Deploy the cluster across two regions to distribute the instance count
- D) Reduce the cluster to a single node to stay within the quota

**Answer: B**
AWS imposes default service quotas on instance types including bare-metal. If the quota is insufficient, an increase must be requested through the AWS Service Quotas console or a support case before retrying the NC2 deployment.

---

### Q53
An NC2 cluster has been deployed on AWS, and the administrator needs to confirm the software stack. Which components run on each NC2 node?
- A) VMware ESXi and vSAN
- B) AOS and AHV — the same stack as on-premises Nutanix
- C) Amazon Linux 2 with KVM and Ceph storage
- D) Windows Hyper-V Server with Storage Spaces Direct

**Answer: B**
NC2 nodes run the full Nutanix stack: AOS (Acropolis Operating System) for storage and cluster services, and AHV (Acropolis Hypervisor) for virtualization — identical to on-premises Nutanix deployments.

---

### Q54
After deploying NC2 on AWS, the administrator cannot access the Prism Element web console at port 9440. The cluster status shows as healthy in the NC2 Console. What should be investigated first?
- A) Whether the AOS version supports the browser being used
- B) Whether the AWS security group allows inbound traffic on port 9440 from the administrator's IP
- C) Whether the EC2 instances have public IP addresses assigned
- D) Whether the AWS region supports Prism Element

**Answer: B**
If the cluster is healthy but Prism Element is inaccessible, the most likely cause is a security group misconfiguration. The security group must allow inbound traffic on port 9440 from the administrator's source IP or network CIDR.

---

### Q55
An NC2 cluster on AWS has been deployed successfully but the administrator forgot to configure NTP. What operational risk does this introduce?
- A) Guest VMs will fail to boot without a valid NTP source
- B) Time drift between nodes can cause cluster instability, certificate validation failures, and log inconsistencies
- C) AWS will automatically terminate instances without NTP configuration
- D) The Prism Element license will expire prematurely due to incorrect timestamps

**Answer: B**
Without NTP, cluster nodes may experience time drift, leading to issues such as cluster instability, failed certificate validation, inconsistent log timestamps, and potential authentication failures across the Nutanix stack.

---

### Q56
A cloud administrator needs to deploy NC2 on AWS but is unsure whether the target subnet has enough capacity. Which pre-deployment check should be performed?
- A) Verify that the subnet has enough available IP addresses for the planned number of NC2 nodes
- B) Verify that the subnet supports jumbo frames (MTU 9001)
- C) Verify that the subnet has an attached NAT Gateway
- D) Verify that the subnet has IPv6 enabled

**Answer: A**
Before deploying NC2, the administrator should verify that the target subnet (minimum /25) has sufficient available IP addresses to accommodate all planned NC2 nodes. Insufficient subnet capacity will cause deployment failures.

---

### Q57
An architect is asked to explain why NC2 does not use Azure Managed Disks for storage. What is the correct explanation?
- A) Azure Managed Disks have a maximum size of 1 TB, which is insufficient for NC2
- B) NC2 uses the local NVMe drives on BareMetal hosts managed by DSF, providing consistent on-prem-equivalent performance
- C) Azure Managed Disks are not available in regions where BareMetal infrastructure is deployed
- D) NC2 uses Azure Blob Storage instead of Managed Disks for object-based data access

**Answer: B**
NC2 on Azure uses the local NVMe drives on BareMetal hosts, managed by the Nutanix Distributed Storage Fabric (DSF). This architecture delivers consistent, high-performance storage identical to on-premises Nutanix, rather than relying on network-attached Azure Managed Disks.

---

### Q58
An administrator successfully deploys an NC2 cluster but finds that workload VMs cannot resolve DNS names. The cluster nodes themselves can reach the internet. What is the most likely issue?
- A) The AHV hypervisor does not support DNS passthrough
- B) DNS server addresses were not configured during initial cluster setup
- C) AWS Route 53 is not enabled for the VPC
- D) The guest VMs need a dedicated DNS appliance deployed in the cluster

**Answer: B**
DNS server addresses must be configured during the initial NC2 cluster setup. If this step was skipped or misconfigured, workload VMs managed by the cluster will not be able to resolve DNS names even if the underlying infrastructure has internet connectivity.

---

### Q59
An organization deploys an NC2 cluster with 3 nodes and later decides to scale out. The administrator adds 2 more nodes through the NC2 Console. What happens to the existing data during expansion?
- A) All data must be migrated to new nodes manually before the expansion completes
- B) The DSF automatically rebalances data across all nodes, including the newly added ones
- C) New nodes remain empty until new VMs are explicitly placed on them
- D) The cluster must be restarted for the new nodes to join the storage pool

**Answer: B**
When nodes are added to an NC2 cluster, the Distributed Storage Fabric (DSF) automatically rebalances data across all nodes in the cluster, including the new ones. No manual data migration or cluster restart is required.

---

### Q60
Which deployment step is unique to NC2 compared to traditional on-premises Nutanix deployments?
- A) Configuring the cluster virtual IP and iSCSI data services IP
- B) Selecting the cloud provider, region, and instance type in the NC2 Console
- C) Registering the cluster with Prism Central
- D) Setting up DNS and NTP for the cluster

**Answer: B**
Selecting the cloud provider, region, and instance type through the NC2 Console is unique to cloud deployments. On-premises deployments use Foundation for imaging and do not involve cloud provider selection, as hardware is already physically present.

---

### Q61
An administrator has deployed NC2 on AWS and wants to create a Nutanix Volumes block store for iSCSI clients. Which IP address must be configured on the cluster for this to work?
- A) The Prism Central virtual IP
- B) The iSCSI data services IP
- C) The CVM external IP address
- D) The AWS Elastic IP associated with the VPC

**Answer: B**
The iSCSI data services IP must be configured on the NC2 cluster to enable Nutanix Volumes functionality. This IP address serves as the iSCSI target endpoint that clients use to connect to block storage provided by the cluster.

---

### Q62
During NC2 deployment on AWS, the administrator selects a region where i3.metal instances are available but the deployment still fails with a capacity error. What additional factor should be investigated?
- A) Whether the region supports the selected AOS version
- B) Whether the specific availability zone within the region has i3.metal capacity
- C) Whether the region has been enabled in the AWS Organizations console
- D) Whether CloudFormation stack creation is enabled in the region

**Answer: B**
Instance availability can vary between availability zones within the same region. Even if i3.metal is available in the region, the specific availability zone selected may lack capacity. Trying a different AZ in the same region may resolve the issue.

---

### Q63
After deploying NC2 on Azure, the administrator configures Prism Central registration. Which benefit does this provide?
- A) It enables Azure Cost Management integration for NC2 billing
- B) It provides centralized multi-cluster management including both on-premises and cloud clusters
- C) It replaces the Azure Portal for all BareMetal infrastructure management
- D) It enables automated scaling of NC2 nodes based on CPU utilization

**Answer: B**
Registering NC2 clusters with Prism Central enables centralized management of all Nutanix clusters — both on-premises and cloud-based — from a single interface, providing unified monitoring, policy management, and operations.

---

### Q64
An NC2 cluster deployed on AWS shows one node in a "degraded" state. The administrator wants to replace it. What is the correct procedure?
- A) Reboot the degraded node from the AWS EC2 console and wait for auto-recovery
- B) Destroy the degraded node and add a new replacement node through the NC2 Console or Prism Central
- C) Detach and reattach the EBS volumes on the degraded node
- D) Run the Foundation VM to reimage the degraded node

**Answer: B**
NC2 node replacement involves destroying the failed/degraded node and adding a fresh replacement. Unlike on-premises where hardware components can be swapped, cloud nodes are ephemeral and replaced as whole instances.

---

### Q65
A company is evaluating NC2 and asks whether they need a Nutanix account before deployment. What is the correct answer?
- A) No, NC2 is deployed entirely through the AWS or Azure marketplace without a Nutanix account
- B) Yes, a Nutanix account is required to access the NC2 Console at my.nutanix.com for cluster provisioning
- C) No, NC2 authentication uses only the cloud provider's IAM system
- D) Yes, but only for downloading the Foundation ISO image

**Answer: B**
A Nutanix account is required to log in to my.nutanix.com and access the NC2 Console, which is the entry point for all NC2 cluster provisioning, management, and monitoring operations.

---

### Q66
An administrator is deploying NC2 on AWS and wants to ensure the cluster can tolerate a single node failure without data loss. What is the minimum configuration?
- A) 2 nodes with RF2 and a cloud-based witness
- B) 3 nodes with RF2 providing single-node fault tolerance
- C) 4 nodes with RF3 providing dual-node fault tolerance
- D) 5 nodes with erasure coding for maximum efficiency

**Answer: B**
A 3-node NC2 cluster with RF2 (Replication Factor 2) maintains two copies of all data and can tolerate a single node failure without data loss. This is the minimum supported NC2 configuration.

---

### Q67
An engineer is comparing the NC2 deployment workflow to on-premises Nutanix deployment. Which on-premises tool is NOT required for NC2 deployment?
- A) Prism Central
- B) Foundation
- C) Prism Element
- D) NC2 Console

**Answer: B**
Foundation, the tool used to image bare-metal hardware in on-premises deployments, is not required for NC2. Cloud deployment handles node imaging automatically through the NC2 Console provisioning process.

---

### Q68
An NC2 cluster on AWS was deployed two months ago with 4 nodes. The administrator wants to add a 5th node, but the original availability zone now shows no i3.metal capacity. What are the options?
- A) Add the 5th node in a different availability zone within the same region
- B) Wait for capacity to become available in the same availability zone, or request a capacity reservation
- C) Convert the cluster to use i3en.metal instances and add the node in any AZ
- D) Move the entire cluster to a different region with available capacity

**Answer: B**
All NC2 nodes must be in the same availability zone. If capacity is unavailable, the administrator must wait for it to become available or request a capacity reservation from AWS. Adding nodes in a different AZ is not supported.

---

### Q69
An administrator attempts to deploy NC2 on AWS but the deployment hangs during the provisioning phase. The IAM role, subnet, and instance type have all been verified. What should be checked next?
- A) Whether the VPC has internet access for the NC2 provisioning process
- B) Whether CloudWatch metrics are being collected
- C) Whether AWS Config rules are blocking the deployment
- D) Whether the AWS Trusted Advisor has flagged the account

**Answer: A**
NC2 provisioning requires internet connectivity to communicate with the NC2 Console and download software components. If the VPC lacks proper internet access (through an internet gateway or NAT gateway), the deployment process may hang.

---

### Q70
Which statement is NOT true about NC2 cluster deployment?
- A) The minimum cluster size is 3 nodes
- B) NC2 runs the same AOS+AHV stack as on-premises Nutanix
- C) Foundation must be run on the first node to bootstrap the cluster
- D) Cluster provisioning is initiated through the NC2 Console at my.nutanix.com

**Answer: C**
Foundation is not used in NC2 deployments. The cluster bootstrapping and node imaging process is handled automatically by the cloud provisioning workflow initiated through the NC2 Console. Foundation is only used for on-premises deployments.

---

### Q71
After deploying NC2, the administrator configures the cluster VIP but cannot ping it from the management network. What should be verified?
- A) Whether the VIP address is within the NC2 host subnet and whether security group rules allow ICMP and management traffic
- B) Whether the VIP has been registered in AWS Route 53
- C) Whether an Elastic IP has been associated with the VIP
- D) Whether the VIP requires a separate ENI attachment

**Answer: A**
The cluster VIP must be within the NC2 host subnet, and the security group must allow ICMP and management traffic from the source network. If either condition is not met, the VIP will not be reachable.

---

### Q72
An organization is deploying NC2 on Azure and wants to ensure BareMetal hosts have proper network isolation. Which configuration accomplishes this?
- A) Placing BareMetal hosts in an Azure Availability Set with fault domain isolation
- B) Using a delegated subnet within a dedicated VNet for NC2 BareMetal hosts
- C) Deploying an Azure Firewall in front of the BareMetal hosts
- D) Enabling Azure DDoS Protection Standard on the VNet

**Answer: B**
A delegated subnet within a dedicated VNet provides network isolation for NC2 BareMetal hosts. The delegation ensures the subnet is exclusively reserved for BareMetal infrastructure and cannot be shared with other Azure resources.

---

### Q73
An engineer is deploying NC2 and the cluster creation wizard prompts for the cloud provider selection. Which providers are supported?
- A) AWS, Azure, and Google Cloud Platform
- B) AWS and Azure only
- C) AWS, Azure, Google Cloud, and Oracle Cloud
- D) AWS only with Azure support in preview

**Answer: B**
NC2 currently supports deployment on AWS and Azure. The NC2 Console cluster creation wizard allows selection between these two cloud providers during the initial deployment steps.

---

### Q74
An administrator deployed NC2 on AWS with 3 nodes and now needs to verify that the Distributed Storage Fabric is functioning correctly. Which Prism Element dashboard provides this information?
- A) The VM management dashboard showing running virtual machines
- B) The Storage dashboard showing storage pool capacity, replication status, and disk health
- C) The Network dashboard showing VPC routing tables
- D) The Alerts dashboard showing AWS CloudWatch metrics

**Answer: B**
The Prism Element Storage dashboard shows storage pool capacity, replication status, disk health, and overall DSF status. This dashboard confirms that the local NVMe drives on all nodes have been properly aggregated and are replicating data.

---

### Q75
An NC2 deployment on AWS fails with an error indicating that the subnet is in a different availability zone than expected. What caused this issue?
- A) The VPC was created in the wrong region
- B) The subnet specified during deployment is in an AZ that doesn't match the AZ selected in the NC2 Console
- C) The subnet does not have auto-assign public IP enabled
- D) The subnet is a public subnet instead of a private subnet

**Answer: B**
The subnet used for NC2 must be in the same availability zone selected during cluster creation in the NC2 Console. A mismatch between the subnet's AZ and the deployment target AZ will cause the deployment to fail.

---

### Q76
A cloud operations team wants to automate NC2 cluster lifecycle operations. Which Nutanix tool provides API-based management for NC2 clusters after deployment?
- A) Nutanix Foundation API
- B) Prism Central REST APIs
- C) Nutanix Calm only
- D) AWS CloudFormation templates only

**Answer: B**
Prism Central provides REST APIs for managing NC2 clusters post-deployment. These APIs enable automation of cluster operations, VM management, monitoring, and integration with third-party orchestration tools.

---

### Q77
An administrator is configuring an NC2 cluster after deployment and needs to set the DNS servers. Where in Prism Element is this configured?
- A) Under VM > Network Config for each guest VM individually
- B) Under Cluster Details in the Settings menu for cluster-wide name resolution
- C) Under Storage > Container Settings as a DSF parameter
- D) Under Hardware > Host Settings on each CVM independently

**Answer: B**
Cluster-wide DNS configuration is set under Cluster Details in the Prism Element Settings menu. This ensures all CVMs and the cluster management plane use the specified DNS servers for name resolution.

---

### Q78
An engineer attempts to deploy an NC2 cluster on AWS but receives an error that the selected instance type is not supported. They selected r5.metal. What is wrong?
- A) r5.metal does not have local NVMe storage required by NC2; supported types include i3.metal and i3en.metal
- B) r5.metal is only supported in the EU regions
- C) r5.metal requires a different IAM role than what NC2 uses
- D) r5.metal must be launched from the AWS Marketplace, not the NC2 Console

**Answer: A**
NC2 requires bare-metal instances with local NVMe storage for the Distributed Storage Fabric. The r5.metal instance type uses EBS storage only and lacks local NVMe drives, making it unsuitable for NC2. Supported types include i3.metal and i3en.metal.

---

### Q79
A company deploys NC2 on AWS and later discovers that cluster metadata backups are failing. The IAM role has S3 permissions. What else could cause this issue?
- A) The S3 bucket policy explicitly denies the NC2 IAM role
- B) The EBS volumes on the NC2 nodes are full
- C) The Prism Central instance has lost connectivity
- D) The AWS Lambda function for metadata backup has timed out

**Answer: A**
Even if the IAM role has S3 permissions, an explicit deny in the S3 bucket policy takes precedence and will block metadata backups. S3 bucket policies must be reviewed to ensure they do not conflict with the IAM role permissions.

---

### Q80
An organization is planning to deploy NC2 on both AWS and Azure. They want centralized management of all clusters. Which architecture achieves this?
- A) Deploy separate Prism Central instances for each cloud provider
- B) Register all NC2 clusters — both AWS and Azure — to a single Prism Central instance
- C) Use the AWS Management Console and Azure Portal independently for each cloud
- D) Deploy Nutanix Calm as the unified management plane without Prism Central

**Answer: B**
A single Prism Central instance can manage NC2 clusters across both AWS and Azure, as well as on-premises clusters. This provides a unified management experience across all environments from a single pane of glass.

---

*End of NCP-CI 6.10 Practice Exam – Domains 1 & 2 (80 Questions)*
