# Nutanix NCP-US 6.10 — Domain 1 & Domain 2 Practice Questions

> 160 exam-style multiple-choice questions covering **Deploy & Upgrade** and **Configure & Utilize** Nutanix Unified Storage.

---

## DOMAIN 1: Deploy and Upgrade Nutanix Unified Storage (Q1–Q80)

---

### Q1
An administrator is planning a production deployment of Nutanix Files. What is the **minimum** number of File Server VMs (FSVMs) required for high availability?

- A) 4
- B) 1
- C) 2
- D) 3

**Answer: D**
A minimum of 3 FSVMs is required for production deployments to ensure high availability and data resiliency.

---

### Q2
What is the **maximum** number of FSVMs that can be deployed in a single Nutanix Files cluster?

- A) 16
- B) 32
- C) 8
- D) 12

**Answer: A**
Nutanix Files supports a maximum of 16 FSVMs per file server deployment, allowing scale-out as demand grows.

---

### Q3
What is the **standard** vCPU and memory sizing for each FSVM in a default Nutanix Files deployment?

- A) 4 vCPU / 12 GB RAM
- B) 8 vCPU / 16 GB RAM
- C) 4 vCPU / 16 GB RAM
- D) 2 vCPU / 8 GB RAM

**Answer: A**
The standard FSVM resource allocation is 4 vCPUs and 12 GB RAM per FSVM by default.

---

### Q4
A company wants to deploy Nutanix Files for a small test environment with no HA requirement. What is the minimum deployment option?

- A) 2 FSVMs
- B) 3 FSVMs
- C) 1 FSVM (single-node)
- D) Single-node is not supported

**Answer: C**
For non-production or test scenarios, Nutanix Files can be deployed with a single FSVM, though this does not provide high availability.

---

### Q5
Which two networks are required when deploying Nutanix Files? (Choose the BEST answer.)

- A) External network and internal network
- B) Management network and iSCSI network
- C) Client-side network and storage network
- D) Public network and private network

**Answer: C**
Nutanix Files requires a client-side network (for SMB/NFS client access) and a storage network (for FSVM-to-CVM communication on the backplane).

---

### Q6
During Nutanix Files deployment, which DNS record type must be created for client access to the file server?

- A) A record
- B) CNAME record
- C) MX record
- D) PTR record

**Answer: A**
DNS A records must be created for the file server name, mapping to the FSVM client-side IP addresses for proper name resolution and load distribution.

---

### Q7
Which requirement must be met before deploying Nutanix Files with SMB share support?

- A) The file server must be joined to an Active Directory domain
- B) A RADIUS server must be configured
- C) A local user database must be populated
- D) An LDAP server must be configured

**Answer: A**
For SMB share support, the file server must be joined to Active Directory so that Kerberos and NTLM authentication can function for Windows clients.

---

### Q8
What is a prerequisite for deploying Nutanix Objects?

- A) Prism Element must be version 6.0 or higher
- B) Prism Central must be deployed and registered
- C) A dedicated AHV cluster with no VMs is required
- D) Nutanix Files must be deployed first

**Answer: B**
Nutanix Objects is deployed and managed exclusively through Prism Central, making PC a mandatory prerequisite.

---

### Q9
What is the minimum number of worker nodes required for a Nutanix Objects deployment?

- A) 5
- B) 1
- C) 2
- D) 3

**Answer: D**
Nutanix Objects requires a minimum of 3 worker nodes to ensure availability and distributed processing of S3 requests.

---

### Q10
Which underlying platform does Nutanix Objects use to run its containerized microservices?

- A) VMware Tanzu
- B) OpenShift
- C) Docker Swarm
- D) Kubernetes via MSP (Microservices Platform)

**Answer: D**
Nutanix Objects runs on the Microservices Platform (MSP), which is a Kubernetes-based infrastructure managed by Prism Central for deploying containerized services.

---

### Q11
When deploying Nutanix Objects, which network type must the internal and external networks be?

- A) VLAN-backed managed networks
- B) Overlay (VPC) networks
- C) Any network type is supported
- D) Unmanaged AHV networks

**Answer: A**
Both the internal and external networks for Objects must be VLAN-backed managed networks configured in Prism Central to ensure proper connectivity.

---

### Q12
In Nutanix Objects architecture, which component distributes incoming S3 API requests across worker nodes?

- A) Atlas service
- B) Object Controller
- C) Load balancer
- D) Metadata service

**Answer: C**
Load balancers front the Objects deployment and distribute incoming S3 API requests across the available worker nodes for scalability.

---

### Q13
Which Nutanix Objects component is responsible for handling I/O operations to the underlying storage?

- A) MSP controller
- B) Load balancer
- C) Atlas service
- D) Object Controller

**Answer: D**
Object Controllers handle the actual data I/O operations, reading and writing object data to the Nutanix storage layer.

---

### Q14
What is the role of the Atlas service in Nutanix Objects?

- A) It handles iSCSI target discovery
- B) It performs data deduplication
- C) It distributes S3 requests to worker nodes
- D) It manages lifecycle policies and audit logging

**Answer: D**
The Atlas service manages object lifecycle operations and audit/compliance logging within the Objects deployment.

---

### Q15
An administrator needs to provide block-level storage to a bare-metal Linux server outside the Nutanix cluster. Which Nutanix service should be used?

- A) Nutanix Objects
- B) Nutanix Volumes
- C) Nutanix Mine
- D) Nutanix Files

**Answer: B**
Nutanix Volumes provides iSCSI-based block storage that external clients (including bare-metal servers) can consume via standard iSCSI initiators.

---

### Q16
When configuring Nutanix Volumes for external client access, which IP address must be configured on the cluster?

- A) CVM management IP
- B) iSCSI Data Services IP
- C) FSVM client network IP
- D) Objects endpoint IP

**Answer: B**
A cluster-wide iSCSI Data Services IP must be configured so external iSCSI initiators can discover and connect to Volume Groups.

---

### Q17
During a Nutanix Files upgrade, how are FSVMs upgraded?

- A) Only the primary FSVM is upgraded; secondaries auto-sync
- B) All FSVMs are upgraded simultaneously
- C) FSVMs are upgraded in a rolling fashion, one at a time
- D) The file server must be taken offline for the upgrade

**Answer: C**
Files uses a rolling upgrade process where one FSVM is upgraded at a time to maintain service availability throughout the process.

---

### Q18
What happens to active client connections on an FSVM during a Nutanix Files rolling upgrade?

- A) The upgrade waits indefinitely until all clients disconnect
- B) All I/O is paused cluster-wide during the upgrade
- C) Connections are dropped and clients must reconnect manually
- D) Connections are migrated to another FSVM before the upgrade begins on that node

**Answer: D**
During a rolling upgrade, active connections are gracefully migrated to other healthy FSVMs before the FSVM being upgraded is taken offline.

---

### Q19
Which pre-check is performed before a Nutanix Files upgrade begins?

- A) Verification of FSVM health, AD connectivity, and network reachability
- B) Verification that no snapshots exist
- C) Verification that all clients are disconnected
- D) Verification that all shares are empty

**Answer: A**
Pre-upgrade checks verify FSVM health, Active Directory connectivity, DNS resolution, network reachability, and other environmental prerequisites.

---

### Q20
Before upgrading Nutanix Objects, which component version compatibility must be verified?

- A) AOS version on PE
- B) Prism Central version
- C) Hypervisor version
- D) Foundation version

**Answer: B**
Objects is managed through Prism Central, so the PC version must be compatible with the target Objects version before the upgrade can proceed.

---

### Q21
How are Nutanix Objects worker nodes upgraded?

- A) The object store must be taken offline
- B) All worker nodes are upgraded simultaneously
- C) Worker nodes are upgraded in a rolling fashion
- D) A new set of worker nodes is deployed and traffic is switched over

**Answer: C**
Objects worker nodes are upgraded in a rolling process to maintain availability of the S3 endpoint during the upgrade.

---

### Q22
An architect is planning Nutanix Files for a VDI environment with 500 users. The vendor recommends budgeting 5 IOPS per user. How many total IOPS should be planned for?

- A) 2,500
- B) 5,000
- C) 500
- D) 1,000

**Answer: A**
500 users × 5 IOPS per user = 2,500 IOPS total should be planned for the VDI file storage workload.

---

### Q23
When sizing a Nutanix Files deployment for throughput-intensive workloads, which action increases aggregate throughput capacity?

- A) Adding more FSVMs (scale-out)
- B) Creating more shares on the same FSVM
- C) Enabling compression on the storage container
- D) Increasing the share quota

**Answer: A**
Adding more FSVMs scales out the file server, distributing I/O across more nodes and increasing aggregate throughput capacity.

---

### Q24
What is a best practice for the storage container when deploying Nutanix Files?

- A) Use the default storage container shared with VMs
- B) Create a dedicated storage container for Files
- C) Use a container with deduplication disabled
- D) Use a container with RF1 for performance

**Answer: B**
Creating a dedicated storage container for Files is a best practice, allowing independent management of storage policies without affecting other workloads.

---

### Q25
Which Nutanix Files share type spreads data across all FSVMs in the file server?

- A) Nested share
- B) Standard share
- C) Distributed share
- D) Home share

**Answer: C**
Distributed shares spread data across all FSVMs in the deployment, with each Top-Level Directory (TLD) assigned to a specific FSVM for higher aggregate throughput.

---

### Q26
Which Nutanix Files share type stores all data on a single FSVM?

- A) Standard share
- B) Clustered share
- C) Distributed share
- D) Home share

**Answer: A**
Standard shares keep all their data on a single FSVM, making them simpler to manage but with a lower throughput ceiling compared to distributed shares.

---

### Q27
When should an administrator choose a distributed share over a standard share?

- A) When higher aggregate throughput is needed across many users
- B) When only a single user will access the share
- C) When the share will store fewer than 100 files
- D) When simplicity is preferred over performance

**Answer: A**
Distributed shares are ideal when many users need concurrent access and higher aggregate throughput, as data is spread across all FSVMs.

---

### Q28
A company deploys Nutanix Objects and wants to provide access from two geographically separate sites. Which deployment model should be used?

- A) Single-site object store
- B) Multi-site object store
- C) Replicated object store
- D) Federated object store

**Answer: B**
A multi-site object store deployment allows access to the same logical object store from multiple geographic locations for distributed access.

---

### Q29
When configuring a Nutanix Objects endpoint, what protocol do clients use to interact with stored objects?

- A) iSCSI
- B) NFS v4.1
- C) S3-compatible REST API
- D) SMB 3.0

**Answer: C**
Nutanix Objects exposes an S3-compatible REST API endpoint that clients use for all object storage operations.

---

### Q30
How does Nutanix Volumes distribute I/O across the cluster?

- A) I/O is routed through a dedicated storage gateway VM
- B) External clients must manually select a CVM
- C) All I/O goes through a single CVM
- D) I/O is distributed across CVMs in the cluster

**Answer: D**
Volumes distributes I/O across all CVMs in the cluster, leveraging the Nutanix distributed storage fabric for performance and resilience.

---

### Q31
What is the purpose of the iSCSI Data Services IP in Nutanix Volumes?

- A) It provides a cluster-wide discovery IP for external iSCSI initiators
- B) It provides the IP address for the Prism web console
- C) It provides the replication target IP for DR
- D) It provides a floating IP used only for CVM management

**Answer: A**
The iSCSI Data Services IP is a cluster-wide virtual IP that external initiators use for iSCSI target discovery and initial connection.

---

### Q32
During FSVM resource scaling, which parameter can an administrator increase to handle more concurrent connections?

- A) The number of storage containers
- B) The vCPU and RAM allocated to each FSVM
- C) The number of DNS records
- D) The Prism Central memory

**Answer: B**
Administrators can scale up individual FSVMs by increasing their vCPU and RAM allocations to handle more concurrent connections and higher workloads.

---

### Q33
An administrator deploys Nutanix Files with 3 FSVMs. Six months later, user demand has doubled. What is the recommended scaling approach?

- A) Deploy a second file server and manually split users
- B) Delete and redeploy with more FSVMs
- C) Add additional FSVMs to the existing file server (scale-out)
- D) Increase the share quota

**Answer: C**
Nutanix Files supports non-disruptive scale-out by adding FSVMs to an existing file server deployment, up to the maximum of 16.

---

### Q34
Which network is used for communication between FSVMs and CVMs on the Nutanix cluster?

- A) Storage network (backplane)
- B) iSCSI network
- C) Client-side network
- D) Management network

**Answer: A**
The storage network serves as the backplane for FSVM-to-CVM communication, carrying all storage I/O traffic internally.

---

### Q35
How many IP addresses are required on the client-side network for a 3-FSVM deployment?

- A) 2
- B) 3 (one per FSVM)
- C) 6
- D) 1

**Answer: B**
Each FSVM requires one IP address on the client-side network, so a 3-FSVM deployment needs 3 client-side IPs.

---

### Q36
Which component in the Nutanix Objects architecture runs as containerized microservices on the worker VMs?

- A) Prism Element services
- B) CVM services
- C) Object store services (load balancers, object controllers, metadata services)
- D) Hypervisor management agents

**Answer: C**
The worker VMs run containerized microservices including load balancers, object controllers, metadata services, and the Atlas service.

---

### Q37
An organization requires a Nutanix Objects deployment that can serve a single location. Which deployment model is appropriate?

- A) Replicated object store
- B) Multi-site object store
- C) Federated object store
- D) Single-site object store

**Answer: D**
A single-site object store is appropriate when all clients are at one location and there is no need for multi-site access.

---

### Q38
When planning capacity for Nutanix Files in a general-purpose file server use case, which metric is MOST important?

- A) Number of hypervisor hosts
- B) Number of Active Directory domains
- C) Number of Prism Central instances
- D) Expected capacity, user count, and IOPS profile

**Answer: D**
Capacity planning for Files should account for expected total capacity, the number of concurrent users, and the expected IOPS profile of the workload.

---

### Q39
What happens if a single FSVM fails in a 3-FSVM production deployment?

- A) Clients connected to that FSVM are automatically migrated to surviving FSVMs
- B) Only distributed shares are affected
- C) An administrator must manually failover connections
- D) The entire file server goes offline

**Answer: A**
With 3 or more FSVMs, the file server remains available and client connections are automatically migrated to the surviving FSVMs.

---

### Q40
Which statement is true about the storage network in a Nutanix Files deployment?

- A) It must be routable to external clients
- B) It is used only for FSVM-to-CVM internal communication
- C) It requires DNS A records
- D) It must use DHCP addressing

**Answer: B**
The storage network is an internal-only network used for FSVM-to-CVM communication and should not be routable to external clients.

---

### Q41
During a Nutanix Files deployment, what must be configured in DNS to enable clients to resolve the file server name?

- A) An SRV record for the file server
- B) A single A record pointing to the Prism Element VIP
- C) Multiple A records (one per FSVM client IP) for the file server name
- D) A CNAME record pointing to the CVM IP

**Answer: C**
Multiple DNS A records for the file server name (one per FSVM client-side IP) provide round-robin DNS for client load distribution.

---

### Q42
An administrator wants to scale an FSVM from 4 vCPU/12 GB RAM to 8 vCPU/24 GB RAM. What is the impact?

- A) The FSVM must be briefly powered off for the resource change
- B) There is no impact; changes are made live without disruption
- C) The file server must be redeployed
- D) All shares must be recreated

**Answer: A**
Scaling FSVM resources requires briefly powering off the FSVM to apply the new vCPU and RAM settings, causing a temporary interruption for that FSVM.

---

### Q43
Which Nutanix Objects component provides a single entry point (virtual IP or FQDN) for S3 clients?

- A) Atlas service
- B) Load balancer endpoint
- C) MSP controller
- D) Object Controller

**Answer: B**
The load balancer provides the S3 endpoint (virtual IP or FQDN) that clients connect to, distributing requests to the backend worker nodes.

---

### Q44
When deploying Nutanix Volumes, what is the Volume Group construct used for?

- A) Grouping NFS exports
- B) Grouping one or more virtual disks (vDisks) presented as iSCSI targets
- C) Grouping file server shares
- D) Grouping S3 buckets

**Answer: B**
A Volume Group aggregates one or more virtual disks and presents them as iSCSI targets to connected initiators (VMs or external clients).

---

### Q45
Which of the following is true about single-node Nutanix Files deployments?

- A) They require a minimum of 2 storage containers
- B) They provide full high availability
- C) They are suitable for production workloads
- D) They use only 1 FSVM and do not provide HA

**Answer: D**
Single-node Files deployments use one FSVM, which means there is no failover target, making them unsuitable for production HA requirements.

---

### Q46
During a Nutanix Objects upgrade, what should an administrator verify first?

- A) That all access keys have been revoked
- B) That the object store is offline
- C) That all buckets are empty
- D) That Prism Central is at a compatible version for the target Objects version

**Answer: D**
PC version compatibility is the first and most critical check before upgrading Objects, as Objects is managed and deployed through PC.

---

### Q47
An administrator is deploying Nutanix Files on a cluster with 4 nodes. What is the recommended minimum for a production deployment?

- A) 2 FSVMs with 4 vCPU each
- B) 3 FSVMs with 4 vCPU/12 GB RAM each
- C) 4 FSVMs with 2 vCPU each
- D) 1 FSVM with 8 vCPU

**Answer: B**
The production best practice is a minimum of 3 FSVMs, each with the standard 4 vCPU/12 GB RAM configuration, to ensure HA.

---

### Q48
What type of shares should be used when each user needs a personal directory on Nutanix Files?

- A) Standard SMB shares
- B) NFS exports
- C) Home shares (nested inside a distributed share)
- D) WORM-enabled shares

**Answer: C**
Home shares are nested within distributed shares and provide per-user home directories, leveraging the distributed architecture for scalability.

---

### Q49
Which statement correctly describes the relationship between Nutanix Objects and Prism Central?

- A) Objects does not require Prism Central
- B) Objects can be deployed from either Prism Element or Prism Central
- C) Objects requires Prism Central for deployment and management
- D) Objects only uses Prism Central for monitoring, not deployment

**Answer: C**
Nutanix Objects is exclusively deployed and managed through Prism Central and cannot be managed from Prism Element alone.

---

### Q50
How does an FSVM communicate with the Nutanix storage layer?

- A) Through a dedicated FC (Fibre Channel) network
- B) Through the management network to the Prism API
- C) Through the client-side network directly to the storage pool
- D) Through the storage network to the local CVM using iSCSI/NFS

**Answer: D**
FSVMs communicate with CVMs over the storage network using internal protocols to read and write data to the Nutanix distributed storage fabric.

---

### Q51
An enterprise wants to deploy Nutanix Files for a VDI environment supporting 2,000 users. Assuming 3 IOPS per user, what is the minimum IOPS the file server must support?

- A) 3,000
- B) 6,000
- C) 9,000
- D) 2,000

**Answer: B**
2,000 users × 3 IOPS per user = 6,000 IOPS minimum should be planned for this VDI environment.

---

### Q52
What is the benefit of using a dedicated storage container for Nutanix Files?

- A) It provides better deduplication ratios
- B) It isolates Files storage policies (RF, compression, EC) from other workloads
- C) It is required to enable SMB shares
- D) It increases the maximum number of FSVMs

**Answer: B**
A dedicated container allows independent configuration of storage policies like replication factor, compression, and erasure coding without affecting other workloads.

---

### Q53
When deploying Nutanix Objects, which two separate networks must be configured?

- A) Client network and AD network
- B) Storage network and backplane network
- C) Internal network (inter-service) and external network (client-facing S3 endpoint)
- D) Management network and iSCSI network

**Answer: C**
Objects requires an internal network for inter-service communication between microservices and an external network for the client-facing S3 endpoint.

---

### Q54
How many storage network IPs are needed for a 3-FSVM Nutanix Files deployment?

- A) 3
- B) 6
- C) 1
- D) 2

**Answer: A**
Each FSVM needs one IP on the storage network, so a 3-FSVM deployment requires 3 storage network IPs.

---

### Q55
During a Nutanix Files rolling upgrade, what ensures data availability while an FSVM is being upgraded?

- A) The remaining healthy FSVMs serve all client requests
- B) A temporary FSVM is deployed to replace the upgrading one
- C) I/O is queued until the FSVM comes back online
- D) Data is temporarily copied to Prism Central

**Answer: A**
The rolling upgrade ensures that while one FSVM is being upgraded, the remaining healthy FSVMs continue serving all client requests without interruption.

---

### Q56
An architect is designing a Nutanix Files solution needing 20 Gbps aggregate throughput. With each FSVM providing approximately 5 Gbps, how many FSVMs are needed?

- A) 2
- B) 3
- C) 4
- D) 5

**Answer: C**
20 Gbps ÷ 5 Gbps per FSVM = 4 FSVMs needed to meet the throughput requirement.

---

### Q57
What is the function of DNS round-robin in a Nutanix Files deployment?

- A) It manages AD join operations
- B) It provides automatic failover of the file server
- C) It distributes client connections across multiple FSVM client IPs
- D) It replicates file data across FSVMs

**Answer: C**
DNS round-robin distributes client connections across the FSVM client-side IP addresses, providing basic load balancing for new connections.

---

### Q58
When joining the Nutanix file server to Active Directory, which information is NOT required?

- A) RADIUS shared secret
- B) Preferred domain controller (optional)
- C) AD domain name
- D) AD administrator credentials

**Answer: A**
RADIUS is not used for Nutanix Files AD integration. The AD domain name, credentials, and optionally a preferred DC are needed.

---

### Q59
Nutanix Objects worker VMs run on which infrastructure?

- A) AHV VMs on the same Nutanix cluster managed by MSP/Kubernetes
- B) External Kubernetes clusters
- C) Docker containers on Prism Central
- D) Dedicated physical servers outside the Nutanix cluster

**Answer: A**
Objects worker VMs are AHV VMs running on the Nutanix cluster, managed by the MSP (Microservices Platform) Kubernetes infrastructure.

---

### Q60
What must be configured on each Nutanix cluster node before Volumes can serve external iSCSI clients?

- A) An NFS export
- B) An iSCSI Data Services IP
- C) A VPN tunnel
- D) Fibre Channel zoning

**Answer: B**
The iSCSI Data Services IP must be configured at the cluster level to enable external iSCSI initiators to discover and connect to Volume Groups.

---

### Q61
An administrator attempts to deploy Nutanix Objects but the deployment fails. Which is the MOST likely cause?

- A) The storage container is encrypted
- B) The Nutanix cluster has too many VMs
- C) Prism Central is not deployed or registered
- D) The cluster is running AHV 7.0

**Answer: C**
The most common cause of Objects deployment failure is Prism Central not being deployed or not properly registered with the cluster.

---

### Q62
Which statement is true about Nutanix Files upgrade pre-checks?

- A) Pre-checks are optional and can be skipped
- B) Pre-checks only run on the first FSVM
- C) Pre-checks only verify disk space on FSVMs
- D) Pre-checks verify FSVM health, AD connectivity, DNS, and network reachability

**Answer: D**
Comprehensive pre-checks verify multiple environmental factors including FSVM health, AD connectivity, DNS resolution, and network reachability before starting the upgrade.

---

### Q63
When scaling out Nutanix Files, what happens to existing distributed shares when a new FSVM is added?

- A) New TLDs can be assigned to the new FSVM; existing TLDs can be rebalanced
- B) Existing distributed shares must be deleted and recreated
- C) The new FSVM only serves standard shares
- D) All data must be manually migrated

**Answer: A**
When a new FSVM is added, new Top-Level Directories in distributed shares can be assigned to it, and existing TLDs can be rebalanced across all FSVMs.

---

### Q64
In a Nutanix Objects multi-site deployment, how do clients access the object store?

- A) Through a global load balancer only
- B) Through site-specific S3 endpoints
- C) Through Prism Central API only
- D) Through a VPN tunnel between sites

**Answer: B**
In multi-site deployments, each site has its own S3 endpoint that clients use for access, with data replicated between sites as configured.

---

### Q65
What is the purpose of pre-upgrade checks in a Nutanix Objects upgrade?

- A) To verify WORM policies are disabled
- B) To verify all buckets have lifecycle policies
- C) To ensure PC compatibility, worker node health, and MSP readiness
- D) To confirm all access keys are active

**Answer: C**
Objects pre-upgrade checks verify Prism Central compatibility, worker node health, MSP platform readiness, and other environmental prerequisites.

---

### Q66
An administrator has a Nutanix cluster with the iSCSI Data Services IP configured. External Windows servers need block storage. Which Nutanix feature provides this?

- A) Nutanix Volumes with Volume Groups
- B) Nutanix Calm with blueprints
- C) Nutanix Files with SMB shares
- D) Nutanix Objects with S3 buckets

**Answer: A**
Nutanix Volumes with Volume Groups provides iSCSI block storage that external Windows servers can access using their built-in iSCSI initiator.

---

### Q67
During Nutanix Files capacity planning, which factor determines the number of FSVMs required?

- A) The number of Prism Central instances
- B) The expected concurrent users, IOPS, and throughput requirements
- C) The number of hypervisor hosts
- D) The number of Active Directory domains

**Answer: B**
FSVM count is determined by workload demands including concurrent user count, IOPS requirements, and aggregate throughput needs.

---

### Q68
Which Nutanix Objects component manages the Kubernetes pods running on worker VMs?

- A) Prism Element
- B) Microservices Platform (MSP)
- C) Foundation
- D) Calm

**Answer: B**
The Microservices Platform (MSP) manages the Kubernetes infrastructure that orchestrates the containerized services running on Objects worker VMs.

---

### Q69
What happens to Nutanix Volumes I/O if the CVM on the host where the iSCSI Data Services IP resides fails?

- A) External clients must reconnect to a different IP
- B) All external iSCSI connections are permanently lost
- C) The iSCSI Data Services IP fails over to another CVM, and I/O resumes
- D) The administrator must manually reconfigure the IP

**Answer: C**
The iSCSI Data Services IP is a floating IP that automatically fails over to another healthy CVM, ensuring continued external iSCSI access.

---

### Q70
Which deployment consideration is unique to Nutanix Objects compared to Files and Volumes?

- A) It requires Active Directory
- B) It requires a storage container
- C) It requires a hypervisor
- D) It requires Prism Central and the MSP platform

**Answer: D**
Unlike Files (deployed from PE) and Volumes (configured in PE), Objects uniquely requires both Prism Central and the MSP Kubernetes platform for deployment.

---

### Q71
An administrator wants to deploy Nutanix Files with 5 FSVMs. How many total IPs are needed (client-side + storage)?

- A) 8
- B) 10
- C) 15
- D) 5

**Answer: B**
5 FSVMs × 2 IPs each (1 client-side + 1 storage) = 10 total IP addresses required.

---

### Q72
Which best practice should be followed when selecting a storage container for Nutanix Files?

- A) Reuse the default container for simplicity
- B) Create a dedicated container with appropriate RF and data efficiency settings
- C) Use a container with RF1 for maximum performance
- D) Share the container with Nutanix Objects worker VMs

**Answer: B**
Best practice is to create a dedicated container with appropriate replication factor and data efficiency settings optimized for the file workload.

---

### Q73
What type of network must the client-side network be for Nutanix Files?

- A) A network on the same VLAN as the CVM management network
- B) Any overlay network
- C) A routable network accessible by SMB/NFS clients
- D) An isolated network with no default gateway

**Answer: C**
The client-side network must be routable and accessible by the SMB and NFS clients that will connect to the file server.

---

### Q74
An administrator adds a fourth FSVM to an existing 3-FSVM deployment. Which share type benefits MOST from the additional FSVM?

- A) Both benefit equally
- B) Neither benefits
- C) Standard shares
- D) Distributed shares

**Answer: D**
Distributed shares benefit most because they spread data across all FSVMs, so an additional FSVM increases aggregate throughput and capacity for distributed shares.

---

### Q75
When Nutanix Objects is deployed, how do S3 clients resolve the object store endpoint?

- A) By using a DNS name or IP configured as the Objects endpoint
- B) By querying the CVM directly
- C) By using the hypervisor management IP
- D) By using the Prism Central IP

**Answer: A**
Clients access the object store through a configured DNS name or IP address that serves as the S3 endpoint, backed by the load balancer.

---

### Q76
What is the impact of running out of FSVM resources (CPU/memory) in a Nutanix Files deployment?

- A) The file server automatically deploys additional FSVMs
- B) Client performance degrades, with increased latency and potential timeouts
- C) Data corruption occurs
- D) The storage container becomes read-only

**Answer: B**
When FSVM resources are exhausted, clients experience degraded performance with higher latency and potential connection timeouts.

---

### Q77
Which statement about Nutanix Objects internal network is correct?

- A) It must be on the same VLAN as the external network
- B) It carries client S3 traffic
- C) It carries inter-service communication between microservice pods
- D) It is optional and only needed for multi-site deployments

**Answer: C**
The internal network carries communication between the microservice pods on the worker VMs and must be separate from the external client-facing network.

---

### Q78
An administrator needs to verify that a Nutanix Files deployment is ready for upgrade. Which tool should be used?

- A) nCLI cluster status
- B) The Foundation upgrade wizard
- C) Prism Central Health Dashboard
- D) The Files upgrade pre-check utility in Prism Element

**Answer: D**
The Files upgrade pre-check utility available in Prism Element verifies all prerequisites are met before initiating the upgrade process.

---

### Q79
When deploying Nutanix Volumes for an external Oracle RAC cluster, what construct is created to present storage?

- A) An SMB share
- B) A Volume Group with multiple virtual disks
- C) An S3 bucket
- D) An NFS export

**Answer: B**
A Volume Group containing multiple virtual disks is created and presented as iSCSI targets to the Oracle RAC nodes for shared block storage.

---

### Q80
What is the minimum Nutanix Files deployment for a proof-of-concept that does NOT require high availability?

- A) 3 FSVMs with 4 vCPU/12 GB RAM each
- B) 2 FSVMs with 4 vCPU/12 GB RAM each
- C) 1 FSVM with 4 vCPU/12 GB RAM
- D) Nutanix Files cannot be deployed without HA

**Answer: C**
For a non-HA proof-of-concept, a single FSVM with the standard 4 vCPU/12 GB RAM is the minimum deployment option.

---

## DOMAIN 2: Configure and Utilize Nutanix Unified Storage (Q81–Q160)

---

### Q81
An administrator creates an SMB share on Nutanix Files. Which authentication protocols can be used by Windows clients? (Choose the BEST answer.)

- A) Certificate-based and smart card
- B) LDAP and RADIUS
- C) Kerberos and NTLM
- D) SAML and OAuth

**Answer: C**
Nutanix Files SMB shares support Kerberos (preferred) and NTLM authentication, both requiring Active Directory integration.

---

### Q82
What is Access-Based Enumeration (ABE) on a Nutanix Files SMB share?

- A) A feature that enumerates all Active Directory users
- B) A feature that sorts files alphabetically
- C) A feature that encrypts file names
- D) A feature that only shows files and folders to users who have at least read access

**Answer: D**
ABE hides files and folders from users who do not have at least read permission, improving security and reducing clutter in share browsing.

---

### Q83
An administrator configures an NFS export on Nutanix Files. Which authentication method provides the HIGHEST security?

- A) Kerberos (krb5)
- B) Kerberos with integrity (krb5i)
- C) Kerberos with privacy/encryption (krb5p)
- D) AUTH_SYS

**Answer: C**
Kerberos with privacy (krb5p) provides authentication, integrity checking, AND encryption of all NFS traffic, offering the highest security level.

---

### Q84
What is the difference between NFS Kerberos krb5i and krb5p?

- A) krb5i provides encryption; krb5p provides authentication only
- B) krb5i provides integrity checking; krb5p adds encryption on top of integrity
- C) They are identical in security level
- D) krb5i is for NFSv3; krb5p is for NFSv4

**Answer: B**
krb5i adds integrity checking (preventing tampering) to Kerberos authentication, while krb5p adds both integrity checking and full encryption of data in transit.

---

### Q85
When using AUTH_SYS for an NFS export, how are users identified?

- A) By X.509 certificate
- B) By Kerberos principal
- C) By UID/GID sent by the NFS client
- D) By Active Directory SID

**Answer: C**
AUTH_SYS uses the UID and GID from the client system to identify users, trusting the client to provide accurate identity information.

---

### Q86
What is the purpose of the "squash" option on an NFS export?

- A) To limit the number of files per directory
- B) To enable deduplication on the export
- C) To compress data on the share
- D) To map root or all users to an anonymous UID/GID for security

**Answer: D**
Squash options map specific users (typically root) to an anonymous UID/GID to prevent privileged access from NFS clients to the export.

---

### Q87
An NFS export is configured with "root squash" enabled. What happens when a root user on a client mounts and accesses the export?

- A) The root user is mapped to the anonymous nobody user
- B) The mount is denied entirely
- C) The root user can only read files
- D) The root user has full root access on the export

**Answer: A**
Root squash maps the root user (UID 0) from the client to the anonymous nobody user, preventing privileged root access to the NFS export.

---

### Q88
How does an administrator restrict which clients can mount an NFS export on Nutanix Files?

- A) By configuring a firewall rule in Prism Central
- B) By configuring a client allowlist (whitelist) on the NFS export
- C) By setting an Active Directory group policy
- D) By configuring VLAN tagging on the switch

**Answer: B**
Client allowlists on the NFS export specify which IP addresses or subnets are permitted to mount the export.

---

### Q89
An organization needs to allow both Windows (SMB) and Linux (NFS) clients to access the same data on Nutanix Files. Which feature should be configured?

- A) iSCSI shared volume
- B) Standard SMB share with NFS gateway
- C) Multi-protocol share
- D) Dual file server deployment

**Answer: C**
Multi-protocol shares allow both SMB and NFS clients to access the same data, with user mapping ensuring consistent permissions.

---

### Q90
When creating a multi-protocol share, which concept determines the primary permission model?

- A) The storage container settings
- B) The FSVM count
- C) The hypervisor type
- D) The native protocol selection (SMB-native or NFS-native)

**Answer: D**
The native protocol (SMB-native or NFS-native) determines which permission model takes precedence and how permissions are managed on the share.

---

### Q91
In a multi-protocol share with SMB as the native protocol, how are NFS user identities mapped to Windows users?

- A) Using RFC 2307 attributes (UID/GID mappings) in Active Directory
- B) By matching IP addresses
- C) Manually through Prism Element
- D) By matching hostname

**Answer: A**
RFC 2307 attributes stored in Active Directory map NFS UIDs/GIDs to Windows user accounts, enabling consistent identity across protocols.

---

### Q92
What is a key limitation of multi-protocol shares on Nutanix Files?

- A) Only read access is supported from the non-native protocol
- B) Simultaneous writes from both SMB and NFS clients to the same file are not supported
- C) Multi-protocol shares cannot exceed 1 TB
- D) Multi-protocol shares do not support snapshots

**Answer: B**
Concurrent write access from both SMB and NFS clients to the same file simultaneously is not supported, as it can cause data corruption.

---

### Q93
How does a distributed share assign data to FSVMs?

- A) The newest FSVM always receives new data
- B) All data is randomly distributed
- C) Each Top-Level Directory (TLD) is assigned to a specific FSVM
- D) Data is striped at the block level across all FSVMs

**Answer: C**
In a distributed share, each Top-Level Directory (TLD) is assigned to a specific FSVM, and all data within that TLD resides on that FSVM.

---

### Q94
What is the primary throughput advantage of distributed shares over standard shares?

- A) Distributed shares use RDMA
- B) Distributed shares bypass the CVM
- C) Distributed shares use faster disks
- D) Distributed shares leverage multiple FSVMs for higher aggregate throughput

**Answer: D**
Distributed shares spread I/O across multiple FSVMs, providing higher aggregate throughput since each FSVM contributes its capacity.

---

### Q95
Which share type on Nutanix Files has a throughput ceiling limited by a single FSVM?

- A) Home share
- B) Standard share
- C) Multi-protocol share
- D) Distributed share

**Answer: B**
Standard shares store all data on a single FSVM, so their maximum throughput is limited by that one FSVM's resources.

---

### Q96
Where are home shares created in the Nutanix Files architecture?

- A) As standalone shares on individual FSVMs
- B) Nested inside a distributed share
- C) On Prism Central storage
- D) On the Nutanix Objects platform

**Answer: B**
Home shares are nested within a distributed share, inheriting its distributed architecture to provide scalable per-user home directories.

---

### Q97
What is the structure of a home share in Nutanix Files?

- A) A directory per department
- B) A flat directory with all user files mixed together
- C) A directory per user (e.g., \\fileserver\home\username)
- D) A single folder shared by all users

**Answer: C**
Home shares automatically create a per-user directory structure, mapping each user's home directory under the share path (e.g., \\fileserver\home\username).

---

### Q98
An administrator sets a hard quota of 10 GB on a Nutanix Files share. What happens when a user reaches 10 GB?

- A) Older files are automatically deleted
- B) The user is disconnected from the share
- C) The user receives a warning but can continue writing
- D) Write operations are blocked for that user

**Answer: D**
A hard quota enforces a strict limit — once reached, all further write operations are blocked until space is freed.

---

### Q99
What is the behavior of a soft quota on Nutanix Files?

- A) It sends a notification but does NOT block writes
- B) It automatically expands the share
- C) It compresses files to stay under the limit
- D) It blocks writes when the quota is reached

**Answer: A**
A soft quota triggers notifications (alerts/emails) when the threshold is reached but does not prevent users from writing additional data.

---

### Q100
Quotas on Nutanix Files can be applied at which levels?

- A) Only at the share level
- B) Per-user and per-share levels
- C) Only at the storage container level
- D) Only at the FSVM level

**Answer: B**
Quotas can be configured at both the per-user level (limiting individual user consumption) and the per-share level (limiting total share consumption).

---

### Q101
What does delegation allow in Nutanix Files share management?

- A) It allows users to create new file servers
- B) It delegates CVM management to non-admin users
- C) It allows non-admin users to manage specific shares (create directories, manage permissions)
- D) It delegates AD administration to the file server

**Answer: C**
Delegation allows administrators to grant share-level management permissions to non-admin users for specific shares without giving full system access.

---

### Q102
Self-Service Restore (SSR) for Nutanix Files SMB shares is accessed by Windows users through which feature?

- A) Windows Backup utility
- B) Shadow Copy Management snap-in
- C) Recycle Bin
- D) Previous Versions tab in file properties

**Answer: D**
Windows users access SSR through the "Previous Versions" tab in file or folder properties, which shows available snapshots for self-service recovery.

---

### Q103
How do NFS clients access Self-Service Restore snapshots on Nutanix Files?

- A) By browsing the .snapshot hidden directory within the export
- B) By mounting a separate snapshot export
- C) NFS does not support Self-Service Restore
- D) Through the Prism UI

**Answer: A**
NFS clients access SSR snapshots by navigating to the hidden `.snapshot` directory within the NFS export, which contains point-in-time copies.

---

### Q104
What is required for Self-Service Restore to function on Nutanix Files?

- A) A third-party backup agent
- B) Scheduled snapshots must be configured on the share/export
- C) Nutanix Calm must be deployed
- D) Prism Central File Analytics must be enabled

**Answer: B**
SSR relies on scheduled snapshots being configured for the share or export — without snapshots, there are no previous versions to restore from.

---

### Q105
When creating a bucket in Nutanix Objects, what credentials are needed for S3 client access?

- A) A Prism Central API token
- B) Active Directory username and password
- C) An access key and secret key pair
- D) An SSL certificate

**Answer: C**
Nutanix Objects uses S3-compatible access key and secret key pairs for authenticating client requests to buckets.

---

### Q106
Which API standard does Nutanix Objects follow for client compatibility?

- A) Amazon S3-compatible API
- B) OpenStack Swift API
- C) Azure Blob Storage API
- D) Google Cloud Storage API

**Answer: A**
Nutanix Objects implements the Amazon S3-compatible API, allowing standard S3 tools and SDKs to work with the platform.

---

### Q107
How are bucket policies defined in Nutanix Objects?

- A) In JSON format using AWS IAM-compatible syntax
- B) Through a graphical wizard only
- C) In YAML format
- D) In XML format following Azure conventions

**Answer: A**
Bucket policies in Nutanix Objects are defined in JSON format using AWS IAM-compatible policy syntax, specifying principals, actions, and resources.

---

### Q108
What does a bucket policy in Nutanix Objects control?

- A) The physical location of stored objects
- B) Access permissions for specific principals (users) on the bucket
- C) The replication factor of the bucket
- D) The compression algorithm used

**Answer: B**
Bucket policies control access permissions by specifying which principals can perform which actions on the bucket and its objects.

---

### Q109
An administrator enables WORM on a Nutanix Objects bucket. What is the grace period before objects become immutable?

- A) 48 hours
- B) 1 hour
- C) 12 hours
- D) 24 hours

**Answer: D**
WORM has a 24-hour grace period after an object is written, during which it can still be modified or deleted before becoming immutable.

---

### Q110
Once an object in a WORM-enabled bucket becomes immutable (after the grace period), which operation can still be performed?

- A) Extending the retention period
- B) Reducing the retention period
- C) Deleting the object
- D) Modifying the object content

**Answer: A**
After an object becomes immutable, the retention period can only be extended, never shortened. The object cannot be deleted or modified until retention expires.

---

### Q111
Which S3 feature does Nutanix Objects WORM compliance align with?

- A) S3 Object Lock
- B) S3 Glacier
- C) S3 Cross-Region Replication
- D) S3 Transfer Acceleration

**Answer: A**
Nutanix Objects WORM compliance aligns with the S3 Object Lock specification for immutable object storage.

---

### Q112
An administrator enables versioning on a Nutanix Objects bucket. What happens when an existing object is overwritten?

- A) The original object is permanently deleted
- B) A new version is created with a unique version ID; the original version is preserved
- C) The original object is moved to a trash folder
- D) The upload is rejected

**Answer: B**
With versioning enabled, each version of an object receives a unique version ID, and previous versions are preserved when an object is overwritten.

---

### Q113
How does versioning protect against accidental object deletion in Nutanix Objects?

- A) It sends an email to the administrator
- B) It prevents all delete operations
- C) A "delete" operation adds a delete marker instead of permanently removing the object; previous versions remain accessible
- D) It creates a backup in Prism Central

**Answer: C**
When versioning is enabled, delete operations add a delete marker rather than permanently removing the object, allowing recovery of previous versions.

---

### Q114
What is a lifecycle policy in Nutanix Objects used for?

- A) Managing user account lifecycle
- B) Controlling CVM restarts
- C) Managing FSVM lifecycle
- D) Automating the expiration and deletion of objects based on age or other criteria

**Answer: D**
Lifecycle policies automate object expiration and deletion based on configurable criteria such as age, reducing manual data management overhead.

---

### Q115
When a lifecycle policy is applied to an existing Nutanix Objects bucket, does it apply to objects already in the bucket?

- A) Yes, it is applied retroactively to existing objects
- B) Only if the objects are less than 24 hours old
- C) Only if versioning is disabled
- D) No, it only applies to new objects

**Answer: A**
Lifecycle policies are applied retroactively to existing objects in the bucket, not just to newly created objects.

---

### Q116
Does a lifecycle policy override WORM retention in Nutanix Objects?

- A) Yes, lifecycle policies always take priority
- B) No, lifecycle policies respect WORM retention periods
- C) It depends on the policy order
- D) Only if the lifecycle policy was created first

**Answer: B**
Lifecycle policies respect WORM retention periods — they cannot delete objects that are still within their WORM retention period.

---

### Q117
What is the maximum size of a single object that can be uploaded to Nutanix Objects using multipart upload?

- A) 50 TB
- B) 1 TB
- C) 5 TB
- D) 10 TB

**Answer: C**
The maximum object size with multipart upload is 5 TB, consistent with the S3 API specification.

---

### Q118
What is the purpose of object tagging in Nutanix Objects?

- A) To encrypt objects
- B) To compress objects
- C) To replicate objects to another cluster
- D) To attach key-value metadata pairs to objects for categorization and policy application

**Answer: D**
Object tagging allows attaching key-value metadata pairs to objects, which can be used for categorization, searching, and lifecycle policy targeting.

---

### Q119
When configuring Nutanix Volumes for external client access, which port does iSCSI use?

- A) 2049
- B) 3260
- C) 8443
- D) 443

**Answer: B**
iSCSI uses TCP port 3260 for target discovery and data transfer between initiators and Nutanix Volumes.

---

### Q120
What authentication mechanism can be configured on Nutanix Volumes to secure iSCSI access?

- A) Kerberos
- B) CHAP (Challenge-Handshake Authentication Protocol)
- C) NTLM
- D) OAuth 2.0

**Answer: B**
CHAP authentication can be configured on Volume Groups to authenticate iSCSI initiators before granting access to the volumes.

---

### Q121
How does an administrator restrict which iSCSI initiators can connect to a Nutanix Volume Group?

- A) By setting a Volume Group password
- B) By configuring an IP whitelist on the CVM
- C) By configuring an initiator IQN whitelist on the Volume Group
- D) By configuring a VLAN ACL

**Answer: C**
An IQN (iSCSI Qualified Name) whitelist on the Volume Group restricts access to only authorized iSCSI initiators.

---

### Q122
A Windows server administrator needs to connect to a Nutanix Volume Group. Which built-in Windows tool is used?

- A) Storage Spaces
- B) Hyper-V Manager
- C) Disk Management
- D) iSCSI Initiator

**Answer: D**
The Windows iSCSI Initiator tool is used to discover and connect to Nutanix Volume Group iSCSI targets.

---

### Q123
How does a Linux server connect to a Nutanix Volume Group?

- A) By using the open-iscsi initiator (iscsiadm)
- B) By using the SMB client
- C) By installing the Nutanix Guest Agent
- D) By mounting an NFS export

**Answer: A**
Linux servers use the open-iscsi initiator tools (iscsiadm) to discover and connect to Nutanix Volume Group iSCSI targets.

---

### Q124
What is the benefit of configuring multipath I/O (MPIO) for Nutanix Volumes?

- A) It doubles the storage capacity
- B) It provides path redundancy and load balancing for iSCSI connections
- C) It enables encryption of iSCSI traffic
- D) It increases the maximum volume size

**Answer: B**
MPIO provides path redundancy and load balancing across multiple iSCSI paths, improving both reliability and performance.

---

### Q125
What is Nutanix Files Smart DR?

- A) An automated share deletion feature
- B) A backup solution that copies files to tape
- C) Share-level replication to a remote Nutanix Files instance for disaster recovery
- D) A deduplication technology for Files

**Answer: C**
Smart DR provides share-level replication to a remote Nutanix Files deployment, enabling disaster recovery with failover and failback capabilities.

---

### Q126
After a Smart DR failover activates the shares on the remote site, what additional step is required for client access?

- A) Reinstall the iSCSI initiator on all clients
- B) Re-join the remote file server to Active Directory
- C) Manually reconfigure all client drive mappings
- D) Update DNS records to point to the remote file server

**Answer: D**
DNS records must be updated to point the file server name to the IP addresses of the remote site's FSVMs so clients can reconnect transparently.

---

### Q127
Which Nutanix Files data protection mechanism creates point-in-time copies of shares?

- A) Snapshots
- B) Volume Groups
- C) Lifecycle policies
- D) Erasure coding

**Answer: A**
Snapshots create point-in-time copies of shares that can be used for data protection, SSR, and recovery purposes.

---

### Q128
What is Nutanix Files Smart Tiering?

- A) A feature that migrates hot data to SSD
- B) A feature that moves cold (infrequently accessed) data to S3-compatible object storage
- C) A feature that compresses all files based on access frequency
- D) A feature that tiers data between different file servers

**Answer: B**
Smart Tiering automatically moves cold (infrequently accessed) data from Nutanix Files to S3-compatible object storage to optimize on-cluster capacity.

---

### Q129
What happens when a user accesses a file that has been tiered to object storage by Smart Tiering?

- A) The user is redirected to the object store endpoint
- B) The user receives an error message
- C) The file is automatically recalled from object storage transparently
- D) The user must manually retrieve the file from the object store

**Answer: C**
Smart Tiering automatically and transparently recalls files from object storage when a user accesses them, with no manual intervention required.

---

### Q130
An administrator wants to configure an NFS export that only allows connections from the 10.0.1.0/24 subnet. Which setting should be configured?

- A) Security group on the FSVM
- B) Network policy in MSP
- C) Firewall rule in Prism Central
- D) Client allowlist on the NFS export

**Answer: D**
The client allowlist on the NFS export should be configured to permit only the 10.0.1.0/24 subnet, restricting access to authorized clients.

---

### Q131
Which Nutanix Files quota type should be used to prevent a single user from consuming more than 5 GB of space?

- A) Per-share hard quota
- B) Per-user hard quota
- C) Per-user soft quota
- D) Per-share soft quota

**Answer: B**
A per-user hard quota of 5 GB will enforce a strict limit, blocking writes for any individual user who reaches the 5 GB threshold.

---

### Q132
An administrator configures a per-share soft quota of 500 GB. A user writes 510 GB of data. What is the outcome?

- A) The write at 500 GB is blocked
- B) The data is written successfully but an alert/notification is generated
- C) Data beyond 500 GB is automatically deleted
- D) The FSVM is paused

**Answer: B**
With a soft quota, the write is allowed to proceed but a notification or alert is generated to inform administrators that the quota threshold has been exceeded.

---

### Q133
In a distributed share, what determines which FSVM hosts a particular file?

- A) The time of creation
- B) The file extension
- C) The Top-Level Directory (TLD) the file resides in, which is assigned to a specific FSVM
- D) A random hash of the file name

**Answer: C**
Files in a distributed share are located on the FSVM that owns the Top-Level Directory (TLD) where the file is stored.

---

### Q134
A company needs a Nutanix Files share where a team of 50 users will collaborate on a shared project folder. The data set is 200 GB. Which share type is MOST appropriate?

- A) Home share
- B) WORM share
- C) Distributed share
- D) Standard share

**Answer: D**
A standard share is appropriate for a smaller collaborative dataset with moderate user count, as simplicity is preferred when throughput demands are modest.

---

### Q135
Which protocol-specific permission model is used when an SMB-native multi-protocol share is accessed by an NFS client?

- A) NFS-native POSIX permissions independently
- B) No permissions are enforced for NFS clients
- C) LDAP group permissions only
- D) POSIX permissions derived from Windows NTFS ACLs via RFC 2307 mapping

**Answer: D**
In an SMB-native multi-protocol share, NFS users are mapped to Windows identities via RFC 2307, and permissions are derived from the NTFS ACL model.

---

### Q136
An administrator wants to enable encryption for NFS data in transit on a Nutanix Files export. Which Kerberos security flavor should be selected?

- A) krb5
- B) krb5i
- C) krb5p
- D) AUTH_SYS

**Answer: C**
krb5p (Kerberos with privacy) provides encryption of all NFS data in transit, in addition to authentication and integrity checking.

---

### Q137
What must be configured in Active Directory for multi-protocol share user mapping to work correctly?

- A) Certificate templates
- B) Service Principal Names (SPNs)
- C) RFC 2307 attributes (uidNumber, gidNumber) on user accounts
- D) Group Policy Objects (GPOs)

**Answer: C**
RFC 2307 attributes (uidNumber and gidNumber) must be populated on AD user accounts to enable correct UID/GID mapping for NFS access.

---

### Q138
An administrator creates a bucket in Nutanix Objects. What is the FIRST step for enabling programmatic S3 access?

- A) Enable WORM on the bucket
- B) Create a bucket policy
- C) Configure a lifecycle policy
- D) Generate an access key and secret key pair for the user

**Answer: D**
The first step is generating access key and secret key credentials for the user, which are required for S3 API authentication.

---

### Q139
Which JSON element in a Nutanix Objects bucket policy specifies who the policy applies to?

- A) "Resource"
- B) "Principal"
- C) "Effect"
- D) "Action"

**Answer: B**
The "Principal" element in the bucket policy JSON specifies which user(s) or account(s) the policy applies to.

---

### Q140
An organization needs to ensure that regulatory documents stored in Nutanix Objects cannot be deleted for 7 years. Which feature should be enabled?

- A) Versioning
- B) Lifecycle policies
- C) WORM with a 7-year retention period
- D) Bucket replication

**Answer: C**
WORM with a 7-year retention period ensures that objects are immutable and cannot be deleted or modified for the entire retention duration.

---

### Q141
An object is uploaded to a WORM-enabled bucket at 2:00 PM. At what time does the 24-hour grace period end?

- A) 24 hours from the bucket creation time
- B) 2:00 AM the next day
- C) 2:00 PM the next day
- D) Midnight the same day

**Answer: C**
The 24-hour grace period is calculated from the object upload time, so it ends at 2:00 PM the next day.

---

### Q142
After WORM retention expires on an object, what can an administrator do?

- A) Only extend the retention further
- B) Only add tags to the object
- C) Nothing — WORM objects are permanent
- D) Delete or modify the object normally

**Answer: D**
Once the WORM retention period expires, the object can be deleted or modified like any normal object.

---

### Q143
How does enabling versioning on a Nutanix Objects bucket affect storage consumption?

- A) Storage consumption increases because all versions of each object are retained
- B) Storage consumption decreases due to deduplication
- C) Only the latest two versions are stored
- D) It has no effect on storage

**Answer: A**
Versioning retains all versions of every object, so storage consumption increases proportionally with the number of object versions.

---

### Q144
A lifecycle policy is configured to expire objects older than 90 days. A WORM-locked object has a 365-day retention. What happens at 90 days?

- A) The object is deleted by the lifecycle policy
- B) The object is NOT deleted because WORM retention takes precedence
- C) The lifecycle policy is automatically disabled
- D) A conflict error is generated

**Answer: B**
WORM retention takes precedence over lifecycle policies, so the object remains protected until the full 365-day retention expires.

---

### Q145
Which statement about multipart upload in Nutanix Objects is correct?

- A) Multipart upload requires versioning to be enabled
- B) Multipart upload is limited to 1 GB per object
- C) Multipart upload allows uploading objects up to 5 TB by splitting them into parts
- D) Multipart upload is only available for WORM buckets

**Answer: C**
Multipart upload allows large objects (up to 5 TB) to be uploaded in manageable parts, which can be uploaded in parallel for better performance.

---

### Q146
Which Nutanix Volumes feature allows multiple external hosts to access the same Volume Group simultaneously?

- A) NFS multi-export
- B) Clustered file system
- C) Shared Volume Group with multiple initiator IQNs whitelisted
- D) SMB multi-channel

**Answer: C**
A Volume Group can be shared among multiple hosts by whitelisting multiple initiator IQNs, enabling clustered applications like Oracle RAC.

---

### Q147
An administrator configures CHAP authentication on a Nutanix Volume Group. What must also be configured on the external server?

- A) The same CHAP credentials (username/secret) in the iSCSI initiator
- B) SSL certificate
- C) RADIUS server address
- D) Kerberos keytab

**Answer: A**
The CHAP username and secret configured on the Volume Group must match the credentials configured on the external server's iSCSI initiator.

---

### Q148
When configuring Smart DR for a Nutanix Files share, what is the replication granularity?

- A) Per-file replication
- B) Share-level replication
- C) Entire file server replication only
- D) Per-FSVM replication

**Answer: B**
Smart DR operates at the share level, allowing administrators to selectively replicate specific shares to a remote site.

---

### Q149
During a Smart DR failover, which action must the administrator take to restore client connectivity?

- A) Re-join the file server to AD
- B) Reconfigure all client IP addresses
- C) Update DNS to point the file server name to the remote site's FSVM IPs
- D) Create new shares on the remote site

**Answer: C**
Updating DNS records is the critical step during failover to redirect client traffic from the failed primary site to the remote recovery site.

---

### Q150
What is the Smart DR failback process?

- A) The original site is rebuilt from scratch
- B) Failback is not supported
- C) Data is manually copied back to the original site
- D) Reverse replication synchronizes changes back to the original site, then shares are failed back

**Answer: D**
Failback uses reverse replication to synchronize any changes made at the remote site back to the original site before restoring the primary.

---

### Q151
Protection Domains for Nutanix Files can include which data?

- A) File server shares and their associated metadata
- B) Only S3 buckets
- C) Only Prism Central configuration
- D) Only Volume Groups

**Answer: A**
Protection Domains for Files encompass the file server shares and their associated metadata for snapshot and replication purposes.

---

### Q152
An administrator wants to provide per-user home directories that scale across all FSVMs. Which configuration is BEST?

- A) Create individual standard shares for each user
- B) Create a distributed share with home share functionality enabled
- C) Create NFS exports for each user
- D) Create Volume Groups for each user

**Answer: B**
A distributed share with home share functionality provides per-user directories that scale across all FSVMs in the deployment.

---

### Q153
When ABE is enabled on an SMB share, what do users see when browsing the share?

- A) An empty folder structure until they search for specific files
- B) All files and folders regardless of permissions
- C) Only files and folders they have at least read access to
- D) Only files they own

**Answer: C**
With ABE enabled, users only see files and folders for which they have at least read permission, hiding all other content from their view.

---

### Q154
An administrator needs to configure an NFS export with Kerberos authentication. Which NFS version is required?

- A) NFSv4 or higher
- B) Any NFS version supports Kerberos
- C) NFSv2
- D) NFSv3

**Answer: A**
NFSv4 (or higher) is required for Kerberos authentication support on NFS exports.

---

### Q155
A user accidentally overwrites an important file on an SMB share. SSR is enabled with daily snapshots. How can the user recover the file?

- A) Right-click the file > Properties > Previous Versions > Restore the desired version
- B) Access the .snapshot directory from Windows Explorer
- C) Use the Nutanix Objects S3 API to retrieve the file
- D) Contact the administrator to restore from a backup

**Answer: A**
Windows users can self-service restore by right-clicking the file, going to Properties > Previous Versions, and restoring the desired version from available snapshots.

---

### Q156
Which Nutanix Objects operation can be used to organize objects with metadata without modifying the objects themselves?

- A) Lifecycle policy
- B) Bucket policy
- C) Object tagging
- D) WORM lock

**Answer: C**
Object tagging attaches key-value metadata pairs to objects for categorization and management without modifying the object data itself.

---

### Q157
When an NFS-native multi-protocol share is accessed by SMB clients, how are permissions handled?

- A) SMB access is denied entirely
- B) SMB users are mapped to POSIX UIDs/GIDs via RFC 2307 and inherit POSIX permissions
- C) SMB users have full admin access
- D) SMB access is read-only

**Answer: B**
In an NFS-native multi-protocol share, SMB users are mapped to POSIX identities via RFC 2307, and POSIX permission semantics are applied.

---

### Q158
An administrator enables Smart Tiering on a Nutanix Files share. Which type of data is automatically moved to object storage?

- A) All data older than 30 days
- B) Only compressed files
- C) Data larger than 1 GB
- D) Cold (infrequently accessed) data based on configurable policies

**Answer: D**
Smart Tiering moves cold data — files that have not been accessed for a configurable period — to S3-compatible object storage.

---

### Q159
An external Linux server is configured with MPIO for Nutanix Volumes. What is the primary benefit during a CVM failure?

- A) I/O continues on the surviving path through another CVM without interruption
- B) The volume is migrated to a different cluster
- C) MPIO encrypts the iSCSI traffic
- D) The volume is automatically snapshotted

**Answer: A**
MPIO provides path redundancy, so when one CVM fails, I/O automatically continues through the surviving path via another CVM.

---

### Q160
Which combination of Nutanix Objects features provides the STRONGEST protection against ransomware for backup data?

- A) Versioning + lifecycle policies
- B) WORM + versioning
- C) Bucket policies + tagging
- D) Lifecycle policies + multipart upload

**Answer: B**
WORM combined with versioning provides the strongest ransomware protection: WORM prevents deletion/modification, and versioning preserves all object versions.

---

*End of Domain 1 & Domain 2 Practice Questions — 160 total.*
