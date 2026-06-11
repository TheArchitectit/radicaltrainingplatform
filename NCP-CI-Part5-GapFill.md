# NCP-CI 6.10 — Part 5: Blueprint Gap-Fill Questions (43 Questions)

> **Purpose:** Fill identified coverage gaps from blueprint analysis across NC2 on AWS (Q1–Q39) and NC2 on Azure (Q16–Q43). Covers SD-WAN/Megaport, VPC Endpoints, API key management, syslog/monitoring, DR, Flow Gateway networking, hibernation, cluster operations, PAYG subscriptions, compatibility matrix, App Registration, Azure Events, VPC Flow Logs, and comprehensive troubleshooting.

---

## AWS Gap Coverage (Q1–Q39)

---

### Q1. An enterprise wants to connect their SD-WAN fabric to an NC2 cluster running on AWS. Which connectivity approach is recommended to integrate SD-WAN appliances with NC2 on AWS?
- A) Deploy SD-WAN virtual appliances directly on the NC2 cluster as AHV VMs and peer with the AWS VPC
- B) Terminate the SD-WAN overlay on an SD-WAN virtual appliance in the AWS VPC and route traffic to the NC2 host subnet via VPC routing
- C) Use AWS Site-to-Site VPN with SD-WAN-aware routing policies injected via BGP into the VPC route table
- D) Connect the SD-WAN controller directly to Prism Central to orchestrate tunnel endpoints on CVM interfaces

**Answer: B**
SD-WAN appliances for NC2 on AWS are deployed as EC2 instances (or virtual appliances) within the same VPC, terminating the SD-WAN overlay. Traffic is then routed to the NC2 host subnet using standard VPC route table entries. NC2 nodes themselves do not host SD-WAN appliances directly on the bare-metal infrastructure.

---

### Q2. A customer is using Megaport to establish private connectivity to their NC2 on AWS cluster. What AWS construct must be provisioned to accept the Megaport virtual cross-connect?
- A) An AWS Transit Gateway with a Megaport attachment
- B) An AWS Direct Connect hosted connection or hosted VIF at a Megaport-enabled facility
- C) An AWS PrivateLink endpoint service pointing to the NC2 management subnet
- D) An AWS VPN CloudHub endpoint configured for Megaport BGP peering

**Answer: B**
Megaport provides Layer 2 connectivity to AWS via hosted connections or hosted Virtual Interfaces (VIFs) at Direct Connect locations. The customer provisions a Megaport Virtual Cross Connect (VXC) that terminates as an AWS Direct Connect hosted connection, which can then be associated with a Direct Connect Gateway or Virtual Private Gateway attached to the NC2 VPC.

---

### Q3. An NC2 cluster on AWS stores metadata backups in S3. An architect wants to ensure S3 traffic from the NC2 VPC never traverses the public internet. Which AWS construct should be configured?
- A) An S3 Interface Endpoint (AWS PrivateLink) in the NC2 subnet with a security group allowing port 443
- B) A VPC Gateway Endpoint for S3 associated with the route table of the NC2 subnet
- C) An S3 Transfer Acceleration endpoint with VPC-restricted bucket policies
- D) An AWS NAT Gateway with an S3-specific elastic IP allowlist

**Answer: B**
A VPC Gateway Endpoint for S3 provides private, free-of-charge connectivity from the VPC to S3 without requiring traffic to leave the AWS network. Gateway Endpoints are added as route table entries (prefix list targets) and do not require security group configuration. Interface Endpoints (PrivateLink) also work for S3 but incur additional hourly and data processing charges and are not the standard recommendation.

---

### Q4. An administrator needs to generate an API key in the NC2 Console to allow automated cluster provisioning via the Nutanix Cloud Manager API. Where is this API key created and managed?
- A) In Prism Central under Settings > API Keys
- B) In the NC2 Console (my.nutanix.com) under the user's Profile > API Keys section
- C) In the AWS IAM Console as a Nutanix service-linked access key
- D) In Prism Element under the cluster's REST API configuration page

**Answer: B**
NC2 API keys are created and managed through the NC2 Console (my.nutanix.com) under the user profile's API Keys section. These keys authenticate programmatic access to the NC2 management plane for operations like cluster provisioning, scaling, and lifecycle management. They are separate from AWS IAM credentials and Prism Central credentials.

---

### Q5. An Azure administrator needs to create a custom RBAC role for the NC2 service principal that limits permissions to only what NC2 requires. Which Azure CLI command structure is correct for creating this custom role?
- A) `az role definition create --role-definition nc2-custom-role.json`
- B) `az ad sp create-for-rbac --name NC2ServicePrincipal --role Contributor`
- C) `az policy assignment create --policy nc2-permissions --scope /subscriptions/{sub-id}`
- D) `az resource lock create --lock-type CanNotDelete --resource-group nc2-rg`

**Answer: A**
Custom Azure roles for NC2 are created using `az role definition create` with a JSON definition file that specifies the exact permissions (actions/notActions) required by NC2 — such as Microsoft.Compute, Microsoft.Network, Microsoft.BareMetal, and Microsoft.Storage operations. Option B creates a service principal with the broad built-in Contributor role rather than a scoped custom role.

---

### Q6. A customer is evaluating the cost of connecting their on-premises data center to NC2 on Azure via VPN Gateway. Which pricing components apply to an Azure VPN Gateway deployment? (Choose the best answer.)
- A) Hourly gateway charge only — all data transfer is included
- B) Hourly gateway charge plus egress data transfer charges per GB leaving Azure
- C) Per-tunnel charge only — no hourly gateway fee applies
- D) A flat monthly fee with unlimited bandwidth and tunnels

**Answer: B**
Azure VPN Gateway pricing has two components: an hourly charge based on the gateway SKU (Basic, VpnGw1–VpnGw5, etc.) and standard Azure egress data transfer charges for traffic leaving the Azure region. Ingress data is free. Higher SKUs provide more bandwidth and tunnel capacity but at increased hourly cost. This makes VPN Gateway more expensive for high-throughput NC2 workloads compared to ExpressRoute at scale.

---

### Q7. An architect must decide between default and dedicated EC2 tenancy for an NC2 on AWS deployment. Which statement is correct regarding NC2 instance tenancy?
- A) NC2 uses default (shared) tenancy because i3.metal instances are already physically isolated bare-metal hosts
- B) NC2 requires dedicated tenancy to ensure hypervisor-level isolation from other AWS customers
- C) NC2 must use a Dedicated Host to enable per-socket licensing for the Nutanix software
- D) NC2 requires a placement group with partition strategy, and tenancy type is irrelevant

**Answer: A**
NC2 on AWS uses i3.metal (or i3en.metal) bare-metal instances, which provide an entire physical server to the customer regardless of the VPC tenancy setting. Since bare-metal instances have no AWS hypervisor, setting dedicated tenancy provides no additional isolation benefit. Default tenancy is used, avoiding the premium pricing associated with dedicated tenancy.

---

### Q8. An AWS administrator is configuring IAM for NC2 and wants to use AWS managed policies where possible. Which AWS managed policy provides the foundational EC2 permissions needed for NC2 cluster operations?
- A) AmazonEC2FullAccess
- B) AmazonEC2ReadOnlyAccess
- C) A Nutanix-provided custom IAM policy document — no AWS managed policy covers NC2 requirements
- D) PowerUserAccess

**Answer: C**
Nutanix provides a specific IAM policy document (available in the NC2 deployment guide) that defines the minimum required permissions for EC2, S3, VPC, and EBS operations. No single AWS managed policy precisely matches NC2's requirements. Using AmazonEC2FullAccess or PowerUserAccess would grant excessive permissions, violating the principle of least privilege.

---

### Q9. An administrator is configuring remote syslog forwarding on an NC2 cluster. In Prism Central, which module allows configuration of a remote syslog server for NC2 cluster events?
- A) The RSYSLOG module under Prism Central Settings > Syslog Configuration
- B) The SMTP module under Prism Central Settings > Alert Notifications
- C) The Nutanix Collector agent deployed as a sidecar VM on each host
- D) The PC Syslog module under Prism Element Settings > Remote Syslog Server with IP, port, transport protocol, and severity level

**Answer: D**
Remote syslog forwarding is configured per cluster in Prism Element under Settings > Remote Syslog Server (or via nCLI). The administrator specifies the syslog server IP, port, transport protocol (UDP/TCP/TLS), log severity level, and optional module selection. This applies identically to NC2 clusters as to on-premises clusters since AOS provides the same syslog capabilities regardless of deployment location.

---

### Q10. Which syslog severity level should an administrator select when configuring remote syslog on an NC2 cluster to capture warnings and all higher-severity events without excessive debug traffic?
- A) LOG_DEBUG (level 7)
- B) LOG_INFO (level 6)
- C) LOG_WARNING (level 4)
- D) LOG_CRIT (level 2)

**Answer: C**
Setting the severity to LOG_WARNING (level 4) captures warning, error, critical, alert, and emergency messages (levels 4–0) while filtering out informational and debug messages. This provides operationally relevant data for monitoring NC2 clusters without overwhelming the syslog server with verbose debug or informational logs.

---

### Q11. A DevOps team wants to integrate their NC2 cluster monitoring with Datadog. What is the recommended approach for forwarding NC2 cluster metrics to Datadog?
- A) Install the Datadog Agent directly on each CVM and AHV host in the NC2 cluster
- B) Deploy a Datadog Agent on a VM within the NC2 cluster that collects metrics from the Prism APIs and forwards them to Datadog
- C) Configure Datadog's native Nutanix integration which uses SNMP polling against the cluster VIP
- D) Export metrics via NC2 Console's built-in Datadog connector in the Integrations tab

**Answer: B**
The recommended approach is to deploy a Datadog Agent on a guest VM running on the NC2 cluster (or in the same VPC) that queries the Prism Element or Prism Central REST APIs (v2/v3) to collect cluster, host, VM, and storage metrics. Direct CVM/AHV agent installation is not supported on NC2. The agent translates Prism metrics into Datadog's format for dashboarding and alerting.

---

### Q12. An NC2 administrator needs to configure email-based alerting so critical cluster alerts are sent to the operations team. Where is SMTP relay configuration performed for an NC2 cluster?
- A) In the NC2 Console under Cluster Settings > Email Configuration
- B) In Prism Element under Settings > SMTP Server, specifying the relay host, port, sender address, and optional authentication
- C) Via the AHV host command line using `smtp-config` on each node
- D) In AWS SES or Azure Communication Services, which NC2 natively integrates with for alerts

**Answer: B**
SMTP configuration for NC2 clusters is done through Prism Element under Settings > SMTP Server, identical to on-premises clusters. The administrator provides the SMTP relay hostname/IP, port (25/587), security mode (STARTTLS), sender email address, and optional credentials. Alert policies in Prism then reference this SMTP configuration to deliver email notifications for cluster events.

---

### Q13. A customer running NC2 on AWS wants to use HYCU as a third-party backup solution for their AHV workloads. Which deployment model is correct for HYCU on NC2?
- A) Deploy the HYCU backup controller as an AHV VM on the NC2 cluster and use S3 as the backup target
- B) Deploy HYCU as a Lambda function triggered by Prism alert webhooks to snapshot VMs to EBS
- C) Install the HYCU agent on each CVM to perform block-level backups to EFS
- D) HYCU is not supported on NC2 — only Nutanix Mine and built-in snapshots are available

**Answer: A**
HYCU deploys as a virtual appliance (controller VM) on the NC2 cluster running on AHV. It leverages Nutanix Changed Block Tracking (CBT) via Prism APIs for efficient incremental backups and can target AWS S3 (or S3-compatible storage) as the backup repository. This architecture maintains data locality and uses NC2's standard AHV snapshot capabilities.

---

### Q14. What does the Cluster Protect feature in NC2 provide for cluster resilience?
- A) Automatic VM-level anti-affinity rules across hosts to survive single-node failures
- B) Automated backup of cluster configuration and metadata to cloud object storage, enabling cluster rebuild/recovery
- C) Live migration of an entire cluster between AWS regions during a regional outage
- D) Encryption of all data at rest on NVMe drives using AWS KMS-managed keys

**Answer: B**
Cluster Protect automatically backs up critical cluster configuration data (including VM definitions, network configurations, storage policies, and cluster settings) to cloud object storage (S3 for AWS, Blob Storage for Azure). In a disaster scenario, this backup enables rapid cluster reconstruction and workload recovery without requiring manual reconfiguration.

---

### Q15. Before deploying NC2 on Azure, which Azure Resource Provider must be registered on the subscription to enable BareMetal infrastructure provisioning?
- A) Microsoft.Compute only
- B) Microsoft.BareMetalInfrastructure
- C) Microsoft.HybridCompute
- D) Microsoft.VMwareCloudSimple

**Answer: B**
The `Microsoft.BareMetalInfrastructure` resource provider must be registered on the Azure subscription before NC2 deployment. This provider enables Azure to provision and manage the dedicated bare-metal hosts that NC2 requires. Without this registration, the NC2 deployment wizard will fail when attempting to allocate physical infrastructure. Additional providers like Microsoft.Compute and Microsoft.Network are typically registered by default.

---

## Azure Gap Coverage (Q16–Q43)

---

### Q16. An architect is planning NC2 on Azure networking and needs to understand the available overlay network types. Which NC2 on Azure overlay network mode allows VMs to communicate with Azure-native resources using their own IP addresses without address translation?
- A) NAT mode — translates VM IPs to the Azure VNet address space
- B) noNAT mode — VM IPs are directly routable via Flow Gateway without address translation
- C) L2 stretch mode — extends the on-premises Layer 2 broadcast domain into Azure
- D) Bridge mode — creates a transparent bridge between the AHV internal switch and the Azure VNet

**Answer: B**
In noNAT mode, VM traffic passes through the Flow Gateway without IP address translation, making VM IPs directly routable within the Azure VNet and to connected networks. This requires proper route table entries pointing VM subnets to the Flow Gateway. noNAT is the recommended mode for most production deployments as it simplifies troubleshooting and allows direct IP-based communication with Azure-native services.

---

### Q17. When would an administrator choose NAT mode over noNAT mode for NC2 on Azure overlay networking?
- A) When VMs need to maintain Layer 2 adjacency with on-premises hosts
- B) When there are IP address conflicts between the NC2 VM subnets and existing Azure VNet address spaces
- C) When more than 4 Flow Gateway instances are needed for bandwidth scaling
- D) When using Azure ExpressRoute instead of VPN for hybrid connectivity

**Answer: B**
NAT mode is appropriate when there are overlapping IP address ranges between NC2 VM subnets and existing Azure or on-premises networks. NAT translates the NC2 VM addresses to the Azure VNet-routable address space, resolving conflicts. This is common in migration scenarios where workloads retain their original on-premises IP addresses that may overlap with Azure address allocations.

---

### Q18. An administrator is configuring an L2 stretch between an on-premises Nutanix cluster and NC2 on Azure to support live VM migration. Which component is responsible for encapsulating and forwarding Layer 2 frames across the Azure VNet?
- A) Azure VNet Gateway with GRE tunnel encapsulation
- B) Flow Gateway on the NC2 cluster, establishing a VXLAN tunnel to the on-premises Nutanix cluster
- C) Azure Load Balancer with MAC-based forwarding rules
- D) Nutanix Move agent running as an Azure VM in the same subnet

**Answer: B**
Flow Gateway provides the L2 stretch capability by establishing VXLAN tunnels between the NC2 cluster on Azure and the on-premises Nutanix environment. These tunnels encapsulate Layer 2 Ethernet frames, preserving MAC addresses and enabling subnet extension. This is essential for live migration scenarios where VMs must retain their IP and MAC addresses during mobility.

---

### Q19. After configuring an L2 stretch between on-premises and NC2 on Azure, the administrator notices that VMs migrated to Azure can communicate with on-premises hosts but cannot reach Azure-native VNet resources. What is the most likely cause?
- A) The Flow Gateway VXLAN MTU exceeds the Azure VNet maximum, causing packet drops
- B) The Azure VNet route table is missing a route pointing the stretched subnet to the Flow Gateway IP as the next hop
- C) The NC2 cluster does not support simultaneous L2 stretch and VNet routing
- D) AHV's OVS bridge is filtering Azure VNet-originated ARP replies

**Answer: B**
In an L2 stretch scenario, Azure VNet resources need a route table entry directing traffic for the stretched subnet to the Flow Gateway's Azure-side IP as the next hop. Without this User Defined Route (UDR), Azure VNet traffic destined for the stretched subnet follows the default Azure routing, which has no path to the L2-extended network segment.

---

### Q20. An administrator is configuring Flow Gateway Floating IPs on NC2 on Azure. What is the purpose of a Floating IP in the Flow Gateway configuration?
- A) To provide a single highly available virtual IP that moves between Flow Gateway instances for gateway redundancy
- B) To assign public Azure IPs directly to guest VMs without using Azure Load Balancer
- C) To enable DHCP relay for guest VMs on overlay networks
- D) To configure a loopback address on each CVM for Prism Central registration

**Answer: A**
A Flow Gateway Floating IP is a shared virtual IP address that provides high availability across multiple Flow Gateway instances. If the active Flow Gateway fails, the Floating IP automatically migrates to a standby instance, ensuring uninterrupted traffic flow. This is similar to a VIP in traditional load balancer or clustering configurations.

---

### Q21. What does External Route Propagation (ERP) accomplish in the context of Flow Gateway on NC2 on Azure?
- A) It advertises NC2 VM subnet routes to Azure Route Server via BGP, enabling dynamic route injection into the Azure VNet
- B) It exports Azure VNet routes to the on-premises network via ExpressRoute
- C) It replicates Prism Central routing policies across multiple NC2 clusters
- D) It synchronizes AWS VPC route tables with Azure VNet UDRs for multi-cloud deployments

**Answer: A**
External Route Propagation (ERP) enables the Flow Gateway to advertise NC2 VM overlay network routes to Azure Route Server using BGP. This eliminates the need for manually configuring User Defined Routes (UDRs) in Azure route tables for each VM subnet. As VM networks are created or removed in NC2, the routes are dynamically propagated to the Azure networking fabric.

---

### Q22. What is the maximum number of Flow Gateway instances that can participate in ECMP (Equal-Cost Multi-Path) load balancing for NC2 on Azure?
- A) 2
- B) 4
- C) 8
- D) 16

**Answer: B**
NC2 on Azure supports a maximum of 4 Flow Gateway instances in an ECMP configuration. These four instances distribute traffic across parallel paths to provide both redundancy and increased aggregate throughput. Azure Route Server is used to establish BGP sessions with each Flow Gateway instance to enable ECMP path distribution.

---

### Q23. An NC2 on Azure deployment is experiencing throughput bottlenecks through the Flow Gateway. The cluster currently has 2 Flow Gateway instances in ECMP mode. What should the administrator do to increase network throughput?
- A) Increase the Azure VNet MTU to 9000 to enable jumbo frames through the Flow Gateway
- B) Add additional Flow Gateway instances (up to 4 total) to scale aggregate throughput via ECMP
- C) Replace the Flow Gateway with Azure Load Balancer Standard for higher throughput
- D) Enable SR-IOV on the Flow Gateway network interfaces to bypass the virtual switch

**Answer: B**
Scaling Flow Gateway throughput is achieved by adding more Flow Gateway instances, up to the maximum of 4 in ECMP mode. Each additional instance adds its bandwidth capacity to the aggregate, distributing flows across all active gateways. Azure Route Server propagates equal-cost routes for each gateway, and traffic is distributed per-flow across the available paths.

---

### Q24. A customer requires ultra-low latency connectivity between their on-premises data center and NC2 on Azure via ExpressRoute. Which ExpressRoute feature bypasses the Azure virtual network gateway to reduce latency for data-plane traffic?
- A) ExpressRoute Global Reach
- B) ExpressRoute FastPath
- C) ExpressRoute Direct
- D) ExpressRoute Premium Add-on

**Answer: B**
ExpressRoute FastPath bypasses the ExpressRoute virtual network gateway in the data path, sending traffic directly from the Microsoft Enterprise Edge (MSEE) routers to the VMs/resources in the VNet. This reduces latency by eliminating the gateway hop. FastPath requires the Ultra Performance or ErGw3AZ gateway SKU and is particularly beneficial for latency-sensitive NC2 workloads like database replication.

---

### Q25. An NC2 on AWS customer wants to reduce costs for a development cluster that is only used during business hours. Which NC2 feature allows temporarily stopping the cluster without losing data or configuration?
- A) NC2 cluster hibernation — pauses the cluster by stopping bare-metal instances while preserving local NVMe data
- B) NC2 cluster deletion with S3 metadata restore — delete the cluster nightly and recreate from backup each morning
- C) EC2 Stop Instance — standard AWS instance stop/start preserves NVMe state
- D) AWS Auto Scaling with scheduled scaling policies to terminate and relaunch nodes

**Answer: A**
NC2 provides a cluster hibernation (pause) feature that gracefully stops all VMs, shuts down CVM services, and releases the bare-metal instances while preserving cluster configuration. When resumed, the cluster is reconstituted from the preserved state. This avoids bare-metal instance charges during idle periods. Note that local NVMe data is preserved through the hibernation process, and S3 metadata backup ensures recoverability.

---

### Q26. What happens to guest VM data when an NC2 on AWS cluster is placed into hibernation (paused state)?
- A) All guest VM data is migrated to S3 before instance termination and restored on resume
- B) Guest VM data remains on the local NVMe drives of the stopped bare-metal instances, and instances retain their storage allocation
- C) Guest VM data is lost — VMs must be restored from backup after cluster resume
- D) Guest VM data is replicated to EBS snapshots and the NVMe drives are released

**Answer: B**
During NC2 hibernation on AWS, the bare-metal instances are stopped (not terminated), which preserves the local NVMe drive contents. When the cluster is resumed, the same physical hosts with their intact NVMe data are started, and AOS rebuilds the storage fabric. Cluster metadata in S3 provides an additional safety net for configuration recovery.

---

### Q27. An administrator needs to add a fourth node to an existing 3-node NC2 on AWS cluster. What is the correct procedure?
- A) Deploy a new bare-metal instance manually via the AWS Console, install AHV, and join it to the cluster via Prism Element
- B) Use the NC2 Console to initiate a node expansion, which provisions the new bare-metal instance and automatically joins it to the cluster
- C) Create a second NC2 cluster with one node and use cluster merge to combine them
- D) Modify the NC2 CloudFormation stack to increase the node count parameter and run a stack update

**Answer: B**
Node expansion on NC2 is performed through the NC2 Console (or NC2 API), which orchestrates the end-to-end process: provisioning a new bare-metal instance in the same availability zone, imaging it with the matching AOS/AHV version, configuring networking, and joining it to the existing cluster. Manual instance provisioning is not supported because NC2 must manage the full node lifecycle.

---

### Q28. A customer wants to configure Nutanix Leap for disaster recovery between their on-premises Nutanix cluster and an NC2 on AWS cluster. What is a prerequisite for establishing the Leap protection policy?
- A) Both clusters must run identical AOS versions and be registered to the same Prism Central instance (or paired Prism Central instances)
- B) The on-premises cluster must be converted to run AHV on bare-metal AWS instances first
- C) Leap requires a dedicated VPN tunnel using only IKEv1 with pre-shared keys
- D) The NC2 cluster must have Nutanix Files deployed as a replication proxy

**Answer: A**
Leap DR requires both the source and target clusters to be registered with Prism Central (either the same instance or paired instances connected via a network route). The clusters should run compatible AOS versions to ensure replication compatibility. Network connectivity (VPN, Direct Connect, or ExpressRoute) must exist between the sites for replication traffic, but Leap itself is configured and managed through Prism Central.

---

### Q29. During a Leap DR failover test from on-premises to NC2 on Azure, the recovered VMs start successfully but cannot communicate with Azure VNet resources. What should the administrator verify first?
- A) That the Leap recovery plan includes a network mapping that maps on-premises VLANs to NC2 overlay networks connected via Flow Gateway
- B) That Azure Firewall is disabled during the test failover
- C) That the on-premises source VMs were shut down before initiating the test
- D) That the NC2 cluster has at least 50% free storage capacity

**Answer: A**
Leap recovery plans include network mappings that define how source networks map to target networks. If VMs are recovered to NC2 but the network mapping does not correctly associate the on-premises VLAN/subnet with an NC2 overlay network that has Flow Gateway connectivity to the Azure VNet, the VMs will be isolated. Verifying and correcting the network mapping in the recovery plan is the first troubleshooting step.

---

### Q30. An administrator wants to apply microsegmentation policies to workloads running on an NC2 on Azure cluster. Which Nutanix feature is used to classify VMs into groups for policy application?
- A) Azure Network Security Groups (NSGs) applied to the NC2 delegated subnet
- B) Nutanix Flow Network Security with Categories assigned to VMs in Prism Central
- C) Azure Application Security Groups (ASGs) associated with VM NICs
- D) Prism Element firewall rules configured per VM NIC in the VM settings

**Answer: B**
Nutanix Flow Network Security (microsegmentation) uses Categories in Prism Central to classify VMs into logical groups (e.g., AppType:Web, Environment:Production). Security policies are then defined between categories to control east-west traffic. This works identically on NC2 as on-premises, providing consistent security policy management independent of the underlying cloud platform's native network security constructs.

---

### Q31. An NC2 cluster upgrade is available for both AOS and AHV components. What is the correct upgrade sequence for an NC2 cluster?
- A) Upgrade AHV first, then AOS, to ensure the hypervisor supports new AOS features
- B) Upgrade AOS first, then AHV — AOS must be upgraded before the hypervisor to maintain compatibility
- C) Both AOS and AHV must be upgraded simultaneously in a single combined upgrade operation
- D) Upgrade Flow Gateway first, then AOS, then AHV to maintain network connectivity throughout

**Answer: B**
The standard NC2 cluster upgrade sequence is AOS first, then AHV. AOS is the foundation that manages the storage fabric and cluster services, and newer AHV versions may depend on updated AOS capabilities. The upgrade is performed rolling (one node at a time), with VMs live-migrating off each node before it is upgraded, ensuring zero downtime for guest workloads.

---

### Q32. After deploying NC2 on Azure, an administrator discovers that the AHV hosts cannot reach the Azure management plane. The delegated subnet appears correctly configured. What should be checked first?
- A) Whether the Azure VNet DNS is pointing to a custom DNS server that cannot resolve Azure management endpoints
- B) Whether the delegated subnet has a Network Security Group (NSG) blocking outbound HTTPS (443) traffic to Azure services
- C) Whether the AHV hosts have the correct Azure IMDS (Instance Metadata Service) route configured
- D) Whether the Azure subscription has exceeded its public IP quota

**Answer: B**
NSGs attached to the NC2 delegated subnet can inadvertently block outbound connectivity required for NC2 management operations. The NC2 nodes need outbound HTTPS (port 443) access to Azure management endpoints (management.azure.com, login.microsoftonline.com, etc.). A restrictive NSG that blocks these outbound flows will cause management plane connectivity failures. Checking and adjusting NSG rules is the first troubleshooting step.

---

### Q33. An NC2 on Azure deployment is failing during initial cluster creation with errors related to the delegated subnet. Which of the following is a common misconfiguration that causes this failure?
- A) The delegated subnet has resources (VMs, NICs, or load balancers) already deployed in it
- B) The delegated subnet is using an IPv6 address space
- C) The delegated subnet does not have a default route to the internet via Azure Firewall
- D) The delegated subnet is in a different Azure region than the resource group

**Answer: A**
The delegated subnet for NC2 on Azure must be exclusively dedicated to the NC2 deployment — no pre-existing resources (VMs, NICs, service endpoints, or other deployments) can exist in it. Azure subnet delegation grants NC2's resource provider full control over the subnet. If existing resources are present, the delegation and subsequent NC2 deployment will fail. The subnet must be empty before initiating NC2 deployment.

---

### Q34. An NC2 on Azure administrator wants to configure Azure Blob Storage as a target for cluster metadata backup. Which Blob Storage tier is recommended, and how is this configured?
- A) Hot tier — configured automatically during NC2 deployment by specifying a storage account in the NC2 Console
- B) Cool tier — manually configured in Prism Element under Data Protection > Cloud Connect
- C) Archive tier — configured via Azure Policy to automatically tier metadata after 30 days
- D) Premium tier — required for low-latency metadata access during cluster recovery

**Answer: A**
NC2 on Azure uses Azure Blob Storage (Hot tier) for cluster metadata backup, and this is configured during the initial NC2 cluster deployment through the NC2 Console. The administrator specifies an Azure Storage Account, and NC2 automatically manages the metadata backup lifecycle. Hot tier is recommended because metadata must be immediately accessible during recovery scenarios without rehydration delays.

---

### Q35. An architect is planning a heterogeneous NC2 cluster using different node types. What rule governs mixing node types within a single NC2 cluster?
- A) Any bare-metal instance types can be mixed freely within a single cluster
- B) Nodes must be paired in groups of the same instance type — mixing is allowed only in matched pairs (e.g., 2× type-A + 2× type-B)
- C) All nodes in a single NC2 cluster must be the same instance type — heterogeneous clusters are not supported
- D) Up to two different instance types can be mixed, but the majority (>50%) must be the larger type

**Answer: C**
NC2 requires all nodes within a single cluster to be of the same instance type (homogeneous). This ensures consistent storage and compute capacity across all nodes, which is essential for the Nutanix Distributed Storage Fabric's data distribution and rebalancing algorithms. If different workload profiles require different instance types, separate NC2 clusters must be deployed and managed independently.

---

---

## AWS Gap Remediation (Q36–Q39)

---

### Q36. An NC2 customer on AWS needs to choose between Pay-As-You-Go (PAYG) and term-based subscription models. Which statement correctly describes the difference for NC2?
- A) PAYG has hourly billing but requires a 12-month minimum commitment
- B) PAYG is billed hourly with no commitment; term-based subscriptions offer lower per-hour costs in exchange for a fixed commitment period
- C) PAYG subscriptions are only available for development/test clusters; production requires term-based commitments
- D) PAYG and term-based models have identical pricing; the difference is only in payment frequency (monthly vs upfront)

**Answer: B**
NC2 PAYG subscriptions bill hourly with no minimum commitment, providing flexibility for variable workloads. Term-based (reserved) subscriptions require a commitment period (typically 1–3 years) but offer reduced per-hour rates compared to PAYG. PAYG is appropriate for development, testing, and unpredictable workloads, while term-based subscriptions suit production deployments with stable capacity requirements.

---

### Q37. An NC2 on AWS customer wants to provide their guest VMs with internet access to external SaaS services. Which AWS construct should be deployed to enable this connectivity?
- A) AWS NAT Gateway in the NC2 host subnet with security group rules allowing outbound internet traffic
- B) An AWS Network Load Balancer (NLB) attached to the NC2 VPC with target groups pointing to the host subnet
- C) A VPC Endpoint for the internet gateway service configured with a route table entry
- D) Direct Internet Gateway attachment to the NC2 overlay network subnets via AHV route forwarding

**Answer: A**
For NC2 on AWS, guest VMs on the AHV overlay ultimately route traffic through the host ENIs in the VPC. An AWS NAT Gateway deployed in a public subnet with a route table entry (0.0.0.0/0 → NAT Gateway) on the NC2 private subnet enables outbound internet access for guest VMs. The NAT Gateway provides source NAT so VMs can reach external SaaS services while remaining in a private subnet. VPC Endpoints are for private AWS service connectivity, not general internet access.

---

### Q38. An architect is verifying that an NC2 on AWS deployment is compatible with their current Prism Central instance. Where can the Nutanix compatibility matrix be accessed to confirm AOS, AHV, and PC version compatibility?
- A) In the Prism Element UI under Settings > System Info > Compatibility Check
- B) On the Nutanix Support Portal (support.nutanix.com) via the Compatibility Matrix tool or Nutanix documentation
- C) In the NC2 Console under My Clusters > Compatibility Reports
- D) Through the AWS Marketplace NC2 product page with automated compatibility verification

**Answer: B**
The Nutanix Compatibility Matrix is accessed via the Nutanix Support Portal (support.nutanix.com) and provides version compatibility information for AOS, AHV, Prism Central, and other Nutanix components. Before deploying or upgrading NC2 clusters, architects must verify their target versions against the published matrix to avoid unsupported configurations. This is a critical step in the deployment planning phase.

---

### Q39. An NC2 cluster on AWS is generating repeated "CloudAPIEndpointUnreachable" errors in Prism Element logs. What is the most likely cause and remediation for this issue?
- A) The AWS IAM role attached to the EC2 instances lacks permissions for EC2/VPC API calls; verify the IAM role policy includes necessary service permissions
- B) The NC2 host subnet security group is blocking outbound traffic to AWS management endpoints on port 443; adjust the security group to allow HTTPS egress
- C) The AWS account is using an unsupported region; re-deploy the cluster in a region listed on the NC2 regional availability list
- D) The Prism Central instance is not registered to my.nutanix.com; register PC to restore AWS API connectivity

**Answer: A**
CloudAPIEndpointUnreachable errors indicate that the bare-metal EC2 instances cannot reach AWS API endpoints due to IAM permission issues or network blocking. The first troubleshooting step is to verify that the IAM role assigned to the EC2 instances includes the necessary permissions for EC2 DescribeInstances, DescribeSecurityGroups, DescribeSubnets, and other required API calls. The second step (option B) would be to verify security group rules if IAM permissions are correct.

---

## Azure Gap Remediation (Q40–Q43)

---

### Q40. An Azure subscription administrator wants to provision NC2 clusters using a service principal account. Which Azure CLI step must be completed first to prepare the service principal for NC2 resource management?
- A) Register the Microsoft.Compute resource provider and assign the Contributor role to the service principal
- B) Create an App Registration in Azure AD and assign it the appropriate RBAC role over the subscription/resource group
- C) Enable Azure Managed Identity on the Subscription and assign it to the NC2 resource provider
- D) Generate an Azure Storage Account access key and assign it to the service principal's key vault

**Answer: B**
Before provisioning NC2 in Azure via automation or custom tools, an App Registration must be created in Azure AD. This registration represents the service principal that will authenticate and authorize NC2 resource management. The service principal is then assigned appropriate RBAC roles (Custom Role with NC2-specific permissions or built-in roles like Contributor) over the target subscription or resource group. This is a prerequisite for any programmatic NC2 deployment.

---

### Q41. An NC2 on Azure administrator is reviewing cluster events in Prism Central and notices Azure-specific events (e.g., "Azure Node Power State Changed", "Subscription Quota Exceeded") appearing in the Events feed. Which system in NC2 provides these Azure-native events?
- A) The Azure Monitor Integration service which polls Azure Management API for subscription-level events
- B) The Flow Gateway syslog module which translates Azure Resource Graph events into Prism format
- C) NC2's cloud integration layer that continuously monitors Azure resource state and translates provider-native events into the unified event framework
- D) Datadog agent deployed on Flow Gateway VMs which forwards Azure Activity Log entries to Prism Central

**Answer: C**
NC2 includes a cloud integration layer that monitors the Azure cloud provider's resource state and translates Azure-native events (subscription quotas, resource provisioning, node power states, etc.) into the unified Nutanix event framework visible in Prism Central. This allows administrators to correlate cluster and cloud provider events from a single console without integrating separate monitoring systems.

---

### Q42. An NC2 on Azure deployment requires network traffic analysis for compliance auditing. The administrator wants to log all Layer 4 flows (TCP/UDP) entering and exiting the NC2 delegated subnet. Which Azure feature should be configured?
- A) Azure NSG Flow Logs enabled on the delegated subnet's Network Security Group, targeting an Azure Storage Account for retention
- B) Azure Application Insights with Network Dependency Monitoring for the resource group containing the NC2 cluster
- C) Azure Firewall Diagnostic Settings with flow trace enabled for the delegated subnet
- D) Flow Gateway packet capture via `ncli cluster logs collect` piped to Azure Blob Storage

**Answer: A**
Azure NSG Flow Logs (also called VPC Flow Logs in other platforms) capture Layer 4 flow information for traffic passing through an NSG. When enabled on the NSG attached to the NC2 delegated subnet, they log all allowed and denied traffic flows to an Azure Storage Account, enabling forensics, compliance auditing, and traffic analysis. This is the standard Azure feature for network flow logging and does not require additional agents.

---

### Q43. An NC2 cluster on Azure is experiencing intermittent connection drops to the management plane during peak traffic periods. The administrator suspects the Flow Gateway is reaching capacity. What is the recommended configuration step to verify and resolve this issue?
- A) Deploy Azure Load Balancer health checks pointing to Flow Gateway IP addresses and enable health check logging to Azure Monitor
- B) Configure health checks in Prism Element under Flow Gateway Settings, monitoring latency and packet loss to Flow Gateway interfaces, and add additional Flow Gateway instances if health metrics exceed thresholds
- C) Increase the Azure VNet Gateway SKU from VpnGw2 to VpnGw4 to improve management plane throughput
- D) Enable Azure ExpressRoute FastPath on the management subnet to bypass the gateway for administrative traffic

**Answer: A**
Health checks for Flow Gateway should be configured in the Prism Element settings (or via nCLI) to continuously monitor connectivity and throughput metrics. When health metrics (latency, packet loss, throughput) exceed thresholds during peak periods, this indicates Flow Gateway capacity constraints. The remediation is to scale Flow Gateway by adding additional instances (up to 4 total) in ECMP mode, as discussed in Q23, to distribute the load and eliminate intermittent failures.

---

## Answer Key

| Question | Answer | Blueprint Objective | Topic |
|----------|--------|-------------------|-------|
| Q1 | B | 1.4 | SD-WAN connectivity for NC2 on AWS |
| Q2 | B | 1.4 | Megaport / Direct Connect connectivity |
| Q3 | B | 1.4 | AWS VPC Gateway Endpoint for S3 |
| Q4 | B | 1.3 | NC2 Console API key management |
| Q5 | A | 1.2 | Azure Custom Role creation |
| Q6 | B | 1.2 | Azure VPN Gateway pricing |
| Q7 | A | 1.1 | EC2 tenancy types for NC2 |
| Q8 | C | 1.1 | AWS IAM policies for NC2 |
| Q9 | D | 3.1 | Syslog configuration on NC2 |
| Q10 | C | 3.1 | Syslog severity levels |
| Q11 | B | 3.1 | Datadog integration with NC2 |
| Q12 | B | 3.1 | SMTP alert configuration |
| Q13 | A | 3.2 | Third-party backup (HYCU) on NC2 |
| Q14 | B | 3.2 | Cluster Protect feature |
| Q15 | B | 1.1 | Azure Resource Provider registration |
| Q16 | B | 1.4 | noNAT overlay network mode |
| Q17 | B | 1.4 | NAT mode use cases |
| Q18 | B | 2.1 | Flow Gateway L2 stretch configuration |
| Q19 | B | 2.1 | L2 stretch troubleshooting |
| Q20 | A | 2.1 | Flow Gateway Floating IPs |
| Q21 | A | 2.1 | External Route Propagation (ERP) |
| Q22 | B | 2.1 | Flow Gateway ECMP maximum |
| Q23 | B | 2.1 | Flow Gateway scaling |
| Q24 | B | 1.4 | ExpressRoute FastPath |
| Q25 | A | 2.3 | NC2 hibernation / cost optimization |
| Q26 | B | 2.3 | Hibernation data persistence |
| Q27 | B | 2.2 | Node addition procedure |
| Q28 | A | 3.2 | Leap DR prerequisites |
| Q29 | A | 3.2 | Leap DR network mapping troubleshooting |
| Q30 | B | 2.3 | Categories and Flow policies |
| Q31 | B | 2.4 | Cluster upgrade sequence |
| Q32 | B | 3.3 | Azure NSG troubleshooting |
| Q33 | A | 3.3 | Delegated subnet misconfiguration |
| Q34 | A | 2.1 | Azure Blob Storage for metadata |
| Q35 | C | 1.1 | Heterogeneous cluster rules |
| Q36 | B | 1.2 | AWS PAYG vs term subscription options |
| Q37 | A | 2.1 | AWS NAT Gateway for NC2 VM internet access |
| Q38 | B | 1.3 | Nutanix compatibility matrix tool usage |
| Q39 | A | 3.3 | CloudAPIEndpointUnreachable troubleshooting |
| Q40 | B | 1.1 | Azure App Registration for NC2 service principal |
| Q41 | C | 3.1 | Azure Events in Prism Central |
| Q42 | A | 3.1 | Azure VPC Flow Logs configuration |
| Q43 | A | 2.3 | NC2 health check configuration on Azure |
