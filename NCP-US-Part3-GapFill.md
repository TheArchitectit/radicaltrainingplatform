# NCP-US 6.10 — Part 3: Blueprint Gap-Fill Practice Questions

> 80 exam-style multiple-choice questions covering **identified blueprint coverage gaps** across all four domains.
> Generated from the gap analysis in `validation/blueprint-ncp-us-coverage.md`.
>
> **Software Versions:** AOS 6.10 · Prism Central pc2024.2 · Files 5.0 · Objects 5.0 · Volumes 6.10 · File Analytics 3.4 · Data Lens DL2024.6

---

## DATA LENS (Q1–Q8)

---

### Q1. What is Nutanix Data Lens?
- A) An on-premises VM deployed alongside each file server for analytics
- B) A cloud-based SaaS analytics service for Files and Objects
- C) A Prism Element plug-in that replaces File Analytics
- D) A hardware appliance installed in the Nutanix cluster

**Answer: B**
Nutanix Data Lens is a cloud-based SaaS offering that provides analytics, auditing, and security insights for both Nutanix Files and Objects environments. Unlike File Analytics, which runs as an on-premises VM, Data Lens operates from the cloud and supports multi-cluster visibility.

---

### Q2. An administrator needs to onboard a Nutanix Files instance to Data Lens. Which prerequisite must be met first?
- A) File Analytics must be uninstalled from the file server
- B) The file server must have outbound HTTPS connectivity to the Data Lens cloud service
- C) A dedicated Data Lens VM must be deployed on the same cluster
- D) The file server must be running NFSv4 exclusively

**Answer: B**
Data Lens is a cloud-based service, so the Nutanix Files environment must have outbound HTTPS (port 443) connectivity to reach the Data Lens cloud endpoint. File Analytics does not need to be removed first—both can coexist during migration.

---

### Q3. Which Data Lens capability helps detect potential ransomware attacks on a Nutanix Files share?
- A) Capacity trending analysis
- B) Anomaly detection with configurable alert thresholds
- C) Automated share replication to a secondary cluster
- D) Scheduled snapshot creation based on IOPS patterns

**Answer: B**
Data Lens uses anomaly detection to identify unusual file activity patterns—such as mass encryption, bulk renames, or rapid deletions—that may indicate a ransomware attack. Administrators can configure alert thresholds and receive notifications when suspicious activity is detected.

---

### Q4. An administrator wants to audit which users accessed sensitive files on a Nutanix Files share over the past 30 days. Which Data Lens feature should they use?
- A) Smart Tiering report
- B) Audit trails
- C) Data Sync log
- D) Prism Central task history

**Answer: B**
Data Lens audit trails provide detailed records of file access, creation, modification, and deletion events on a per-user and per-share basis. The administrator can filter by time range and user to review exactly who accessed what files.

---

### Q5. What is a key advantage of Data Lens over on-premises File Analytics for organizations with multiple Nutanix clusters?
- A) Data Lens supports NFSv3 while File Analytics does not
- B) Data Lens provides a single pane of glass for analytics across multiple file servers and clusters
- C) Data Lens eliminates the need for DNS configuration
- D) Data Lens runs directly on the CVM and uses fewer resources

**Answer: B**
Data Lens provides multi-cluster, multi-file-server visibility from a single cloud-based console. On-premises File Analytics is deployed per file server and only provides visibility into that single instance, making it harder to manage large-scale environments.

---

### Q6. An administrator is configuring Data Lens to monitor a Nutanix Objects deployment. Which statement is correct?
- A) Data Lens only supports Nutanix Files and cannot be used with Objects
- B) Data Lens can provide visibility into object store access patterns, bucket usage, and security posture
- C) Objects must be upgraded to version 6.0 before Data Lens integration is possible
- D) Data Lens for Objects requires deploying a separate MSP cluster

**Answer: B**
Data Lens supports both Nutanix Files and Objects, providing analytics on access patterns, bucket utilization, and security auditing for object stores. This integration does not require a separate MSP cluster—it leverages the cloud-based SaaS architecture.

---

### Q7. During a Data Lens deployment, the administrator notices that the file server cannot connect to the Data Lens cloud service. Which is the MOST likely cause?
- A) The file server is running too many FSVMs
- B) A firewall is blocking outbound HTTPS traffic from the Prism Central or file server network
- C) Data Lens requires a minimum of 5 file servers to activate
- D) The NTP configuration on the cluster is set to manual mode

**Answer: B**
Data Lens requires outbound HTTPS connectivity (port 443) from the environment to the cloud service. A firewall or proxy blocking this outbound traffic is the most common connectivity issue during onboarding.

---

### Q8. Which Data Lens feature allows administrators to identify files containing personally identifiable information (PII) across multiple file servers?
- A) Capacity forecasting
- B) Data classification and PII scanning
- C) Smart DR replication reports
- D) FSVM performance monitoring

**Answer: B**
Data Lens includes data classification capabilities that scan file content to identify PII such as Social Security numbers, credit card numbers, and other sensitive data patterns. This works across multiple file servers registered with the Data Lens service.

---

## MINE FOR OBJECTS (Q9–Q12)

---

### Q9. What is Nutanix Mine?
- A) A data mining tool for analyzing storage performance metrics
- B) An integrated secondary storage solution that combines Nutanix infrastructure with backup software
- C) A CLI utility for extracting log files from Nutanix clusters
- D) A tiering engine that moves cold data to external cloud providers

**Answer: B**
Nutanix Mine is a turnkey integrated backup solution that combines Nutanix HCI infrastructure with supported third-party backup software to deliver a converged secondary storage appliance. It can use Nutanix Objects as its backend storage target.

---

### Q10. Which backup vendors are supported with Nutanix Mine? (Choose the BEST answer.)
- A) Only Veeam
- B) HYCU, Veeam, and Commvault
- C) Veritas NetBackup and Cohesity exclusively
- D) Any vendor that supports the S3 API

**Answer: B**
Nutanix Mine has validated integrations with HYCU, Veeam, and Commvault as supported backup vendors. While other vendors may support S3-compatible storage, Mine's turnkey deployment and lifecycle management are specifically validated with these partners.

---

### Q11. An administrator deploys Nutanix Mine with Objects as the backup target. Which protocol does the backup software use to write data to Objects?
- A) NFS v4.1
- B) iSCSI
- C) S3-compatible API
- D) SMB 3.0

**Answer: C**
When Nutanix Mine uses Objects as the backend storage target, backup data is written using the S3-compatible API. Objects provides an S3 endpoint that the backup software (HYCU, Veeam, or Commvault) uses to store and retrieve backup data.

---

### Q12. What is a primary benefit of integrating Nutanix Mine with Objects for backup and recovery?
- A) It eliminates the need for Prism Central in the environment
- B) It provides a converged solution that reduces infrastructure silos and simplifies backup management
- C) It allows backup data to bypass the storage network entirely
- D) It automatically creates read-only replicas on a public cloud provider

**Answer: B**
Mine with Objects provides a converged backup infrastructure that eliminates the need for separate backup appliances and storage arrays. This reduces infrastructure silos, simplifies management through Prism, and leverages the scalability of Objects for long-term data retention.

---

## OBJECTS FEDERATION (Q13–Q16)

---

### Q13. What is Nutanix Objects Federation?
- A) A feature that replicates FSVMs across Nutanix clusters for file server HA
- B) A capability that enables cross-site namespace and bucket access across multiple Objects deployments
- C) A licensing model that pools Objects capacity across data centers
- D) A method of federating Active Directory domains for Objects authentication

**Answer: B**
Objects Federation enables cross-site access to namespaces and buckets across multiple Nutanix Objects deployments. It allows applications to access object data from a federated namespace regardless of which site stores the data, supporting multi-site architectures.

---

### Q14. An organization has Nutanix Objects deployed at two data centers and wants applications at either site to access the same logical namespace. Which feature should the administrator configure?
- A) Objects replication policies
- B) Objects Federation
- C) Smart DR for Objects
- D) Data Lens cross-site analytics

**Answer: B**
Objects Federation enables a unified namespace across multiple Objects deployments, allowing applications at either data center to access objects through a single logical endpoint. This is distinct from replication, which copies data for DR purposes rather than unifying access.

---

### Q15. When configuring Objects Federation between two sites, which is a required prerequisite?
- A) Both sites must share the same Prism Central instance
- B) Network connectivity and DNS resolution must be established between the Objects clusters at both sites
- C) Both sites must run File Analytics version 3.4 or later
- D) Federation requires identical hardware models at both sites

**Answer: B**
Objects Federation requires reliable network connectivity and proper DNS resolution between the participating Objects clusters. Each site must be able to resolve the S3 endpoints of the other site, and sufficient bandwidth must be available for cross-site operations.

---

### Q16. Which use case is BEST suited for Nutanix Objects Federation?
- A) Replacing Smart DR for file server failover
- B) Enabling a distributed application to read and write objects across geographically dispersed data centers
- C) Consolidating all backup data onto a single Objects cluster
- D) Converting NFS shares to S3 buckets automatically

**Answer: B**
Objects Federation is ideal for distributed applications that need to access object data across multiple geographic locations. It allows seamless cross-site access so that applications at any federated site can interact with the same namespace, supporting global workloads and edge-to-core architectures.

---

## OBJECTS NAMESPACES (Q17–Q19)

---

### Q17. In Nutanix Objects, what is the purpose of a namespace?
- A) A DNS subdomain automatically created for each bucket
- B) A logical isolation boundary within an Objects deployment that contains buckets and provides multi-tenant separation
- C) A storage pool reserved exclusively for WORM-locked data
- D) A Prism Central category tag applied to Objects workers

**Answer: B**
A namespace in Nutanix Objects provides a logical isolation boundary that groups buckets together and supports multi-tenancy. Each namespace has its own access policies, endpoint, and user management, allowing administrators to separate different teams or applications within a single Objects deployment.

---

### Q18. An organization wants to provide two different business units with isolated object storage on the same Nutanix Objects cluster, each with separate access keys and policies. What should the administrator create?
- A) Two separate Prism Central instances
- B) Two separate namespaces within the Objects deployment
- C) Two separate AOS clusters
- D) Two separate storage containers in Prism Element

**Answer: B**
Creating separate namespaces provides each business unit with its own isolated environment including independent access keys, bucket policies, and usage quotas. This enables multi-tenancy on a single Objects cluster without requiring separate infrastructure.

---

### Q19. Which statement about Objects namespaces is correct?
- A) A namespace can span multiple Objects clusters by default
- B) Each namespace has its own S3 endpoint URL and can have independent access policies
- C) Only one namespace is allowed per Prism Central instance
- D) Namespaces are only available when WORM is enabled on the cluster

**Answer: B**
Each namespace in Objects has its own dedicated S3 endpoint URL and supports independent IAM policies, access keys, and bucket configurations. Multiple namespaces can be created per Objects deployment to isolate tenants, though each namespace is scoped to a single Objects instance.

---

## TIERING — SMART, STANDARD, AND ADVANCED (Q20–Q24)

---

### Q20. What is the primary purpose of Smart Tiering in Nutanix Files?
- A) To replicate data between two file servers for DR
- B) To automatically move infrequently accessed (cold) data from high-performance storage to capacity-optimized storage
- C) To compress all data on the file server regardless of access frequency
- D) To synchronize user profiles between VDI sessions

**Answer: B**
Smart Tiering in Nutanix Files automatically identifies infrequently accessed (cold) data and moves it from high-performance SSD/NVMe storage to more cost-effective capacity-tier storage (HDD or cloud). This optimizes storage costs while maintaining transparent access for users.

---

### Q21. Which tiering level in Nutanix Files allows administrators to define custom policies for when data moves between performance and capacity tiers?
- A) Standard Tiering
- B) Smart Tiering
- C) Advanced Tiering
- D) Basic Tiering

**Answer: C**
Advanced Tiering provides administrators with granular control over tiering policies, including custom rules for data movement based on age, access patterns, and file types. Standard Tiering uses default thresholds, while Smart Tiering uses automated intelligence. Advanced Tiering offers the most flexibility.

---

### Q22. An administrator wants the simplest tiering configuration with default policies and no manual tuning. Which tiering option should they select?
- A) Smart Tiering
- B) Standard Tiering
- C) Advanced Tiering
- D) Manual Tiering

**Answer: B**
Standard Tiering uses predefined default thresholds for moving cold data to the capacity tier, requiring minimal configuration from the administrator. It is the simplest option for organizations that want basic tiering without custom policy management.

---

### Q23. What happens when a user accesses a file that has been tiered to the capacity tier in Nutanix Files?
- A) The user receives a "file not available" error and must contact the administrator
- B) The file is transparently recalled to the performance tier and served to the user
- C) The user must manually initiate a recall request through Prism Central
- D) The file is served directly from the capacity tier with no recall

**Answer: B**
When a user accesses a tiered file, Nutanix Files transparently recalls it from the capacity tier to the performance tier. The file is served to the user without requiring any manual intervention, though there may be a brief increase in access latency during the recall.

---

### Q24. Which statement correctly differentiates Smart Tiering from Standard Tiering?
- A) Smart Tiering requires a separate license; Standard Tiering is free
- B) Smart Tiering uses machine learning and access pattern analytics to optimize data placement, while Standard Tiering uses fixed age-based thresholds
- C) Standard Tiering supports NFS shares; Smart Tiering only supports SMB shares
- D) Smart Tiering only works with Nutanix Objects; Standard Tiering works with Files

**Answer: B**
Smart Tiering leverages analytics and access pattern intelligence to make dynamic data placement decisions, adapting to workload changes over time. Standard Tiering relies on simpler, fixed age-based thresholds (e.g., move files not accessed for X days) without the adaptive intelligence.

---

## VDI SYNC (Q25–Q27)

---

### Q25. What is VDI Sync in Nutanix Files?
- A) A feature that synchronizes virtual desktop images between Prism Central instances
- B) A feature that synchronizes user profiles and home directories between file servers at different sites for VDI environments
- C) A tool for benchmarking VDI storage performance on Nutanix clusters
- D) A replication engine for Nutanix Volumes used by VDI desktops

**Answer: B**
VDI Sync is a Nutanix Files feature designed for Virtual Desktop Infrastructure environments. It synchronizes user profiles and home directory data between file servers at different sites, ensuring that VDI users have consistent access to their profiles regardless of which site they connect to.

---

### Q26. In which scenario is VDI Sync MOST beneficial?
- A) A single-site VDI deployment using local profiles on each desktop
- B) A multi-site VDI environment where users may log in from different geographic locations and need consistent profile data
- C) A backup scenario where VDI desktops are replicated to a DR site
- D) An environment where all VDI users access the same shared folders

**Answer: B**
VDI Sync is most valuable in multi-site VDI deployments where users may connect from different locations. It ensures that user profiles, settings, and home directory data are synchronized across sites, providing a consistent user experience regardless of the login location.

---

### Q27. When configuring VDI Sync, which Nutanix Files share type is typically used for storing user profiles?
- A) Distributed share
- B) Standard share
- C) Home share (home directory)
- D) General-purpose SMB share with no specific type

**Answer: C**
VDI Sync is typically configured with home shares (home directories) in Nutanix Files, which provide per-user isolated directories. These home shares store user profiles that VDI Sync replicates between file servers at different sites to maintain profile consistency.

---

## FQDN-BASED PATHING (Q28–Q30)

---

### Q28. What is FQDN-based pathing in Nutanix Files?
- A) A method of routing iSCSI traffic based on fully qualified domain names
- B) An architecture that uses DNS subdomains or folder structures to provide unique FQDN paths for accessing different shares on a file server
- C) A Prism Central feature for organizing file servers by domain name
- D) A Smart DR configuration that maps DNS zones to replication targets

**Answer: B**
FQDN-based pathing allows administrators to organize Nutanix Files share access using DNS subdomains or folder structures. Instead of a flat share namespace, administrators can create structured paths (e.g., `dept.fileserver.company.com`) to organize and access shares hierarchically.

---

### Q29. An administrator must choose between subdomain-based and folder-based FQDN pathing for a new Nutanix Files deployment. Which factor favors subdomain-based pathing?
- A) The organization has no DNS infrastructure
- B) The organization wants each department to have its own DNS-resolvable namespace (e.g., engineering.fs.company.com, finance.fs.company.com)
- C) All shares must be accessed through a single IP address with no DNS dependency
- D) The environment uses only NFS and does not support DNS-based names

**Answer: B**
Subdomain-based FQDN pathing is ideal when the organization wants distinct, DNS-resolvable namespaces for different departments or organizational units. Each subdomain resolves to the file server and provides a clean hierarchical structure. This approach requires proper DNS wildcard or A record configuration.

---

### Q30. Which DNS configuration is required for subdomain-based FQDN pathing in Nutanix Files?
- A) A single A record for the file server with no additional records
- B) Wildcard DNS records or individual A/CNAME records for each subdomain pointing to the file server
- C) MX records for each share name on the file server
- D) PTR records for all FSVM IP addresses only

**Answer: B**
Subdomain-based FQDN pathing requires either wildcard DNS records (e.g., `*.fs.company.com`) or individual A/CNAME records for each subdomain. These records must resolve to the file server's client-side IP addresses so that clients can reach the correct share namespace.

---

## NUTANIX CENTRAL (Q31–Q33)

---

### Q31. What is Nutanix Central?
- A) A physical appliance that replaces Prism Central for cluster management
- B) A cloud-hosted management plane that provides unified visibility and lifecycle management across multiple Nutanix environments
- C) A command-line tool for configuring AOS storage containers
- D) A Data Lens component deployed within the customer's data center

**Answer: B**
Nutanix Central is a cloud-hosted management platform that provides a single pane of glass for managing and monitoring multiple Nutanix environments across sites and clouds. It extends beyond Prism Central by offering unified lifecycle management, alerting, and operational intelligence from the cloud.

---

### Q32. How does Nutanix Central relate to Nutanix Files and Objects management?
- A) Nutanix Central replaces Prism Central for all Files and Objects configuration
- B) Nutanix Central provides centralized monitoring, alerting, and lifecycle management for Files and Objects across multiple clusters
- C) Nutanix Central is only used for Volumes management and has no Files or Objects integration
- D) Nutanix Central can only be used after Data Lens is disabled

**Answer: B**
Nutanix Central integrates with Files and Objects deployments to provide centralized monitoring, health alerts, and lifecycle management across all registered clusters. Prism Central remains the primary configuration interface, while Nutanix Central adds the cloud-based multi-site operational layer.

---

### Q33. During a Files upgrade, which management interface should the administrator check for cross-cluster compatibility alerts involving Nutanix Central?
- A) Prism Element only
- B) The Nutanix Central cloud console
- C) The FSVM local console via SSH
- D) Data Lens audit dashboard

**Answer: B**
Nutanix Central provides cross-cluster compatibility checks and upgrade readiness alerts from its cloud console. Before upgrading Files, the administrator should verify that no compatibility issues exist between the Files version, AOS, Prism Central, and Nutanix Central integration requirements.

---

## SMART DR TROUBLESHOOTING (Q34–Q39)

---

### Q34. After a Smart DR failover of a Nutanix Files server to a secondary site, users cannot access shares using the original DNS name. What is the MOST likely cause?
- A) The secondary file server does not support SMB
- B) DNS records were not updated to point to the secondary file server's IP addresses
- C) Smart DR automatically disables all shares during failover
- D) The primary site's Prism Central must be online for DNS to work

**Answer: B**
After a Smart DR failover, DNS records must be updated (either manually or via scripted automation) to point to the secondary file server's client-side IP addresses. If DNS still resolves to the primary site's IPs, clients cannot reach the failed-over file server.

---

### Q35. An administrator performs a Smart DR failover, but Active Directory authentication is not working on the secondary file server. Which should be investigated FIRST?
- A) Whether the secondary site has network connectivity to the Active Directory domain controllers
- B) Whether Data Lens is enabled on the secondary file server
- C) Whether the secondary cluster has NFS exports enabled
- D) Whether the Volumes service is running on the secondary cluster

**Answer: A**
Active Directory authentication requires that the secondary file server can reach AD domain controllers. After failover, the administrator should verify network connectivity and DNS resolution to AD services at the secondary site, including checking that the file server's computer account and Kerberos trust are intact.

---

### Q36. During Smart DR failback from a secondary site to the primary site, which step must occur BEFORE clients are redirected back to the primary file server?
- A) Data Lens must be reconfigured on the primary
- B) Delta replication must complete to synchronize changes made at the secondary site back to the primary
- C) All FSVMs at the secondary site must be powered off manually
- D) The primary cluster's AOS must be upgraded to a newer version

**Answer: B**
Before failback, Smart DR must perform delta replication to synchronize any data changes (new files, modifications, deletions) that occurred at the secondary site back to the primary file server. Only after this replication completes should DNS be updated and clients redirected to the primary.

---

### Q37. An administrator notices that Smart DR replication is failing between two sites. The file servers at both sites are healthy. What should be checked FIRST?
- A) Whether File Analytics is deployed at both sites
- B) Network connectivity and firewall rules between the two Nutanix clusters
- C) Whether both sites have identical FSVM counts
- D) Whether WORM is enabled on any shares

**Answer: B**
Smart DR replication requires reliable network connectivity between clusters. Firewall rules must permit the replication traffic between the file servers. Network issues (blocked ports, insufficient bandwidth, or routing problems) are the most common cause of replication failures.

---

### Q38. In a Smart DR configuration, an administrator wants to automate DNS record updates during failover. Which approach is recommended?
- A) Manually edit DNS records on the domain controller after each failover
- B) Configure scripted DNS updates or use dynamic DNS integrated with the Smart DR failover workflow
- C) Disable DNS and use IP addresses exclusively for share access
- D) Deploy a secondary DNS server that only activates during failovers

**Answer: B**
The recommended approach is to automate DNS updates using scripts or dynamic DNS that integrate with the Smart DR failover workflow. This ensures that DNS records are updated promptly when failover occurs, minimizing client downtime and eliminating the risk of manual errors.

---

### Q39. After a Smart DR failover, the secondary file server is operational, but users report that cross-cluster user profiles are not loading correctly. What is the MOST likely issue?
- A) The secondary cluster does not have sufficient SSD capacity
- B) Profile directory paths or UNC paths reference the primary site's hostname, which no longer resolves correctly
- C) Nutanix Objects must be restarted to enable profile sync
- D) Smart DR does not support user profile replication

**Answer: B**
Cross-cluster user profile issues after failover typically occur because profile paths (UNC paths in GPO or login scripts) reference the primary file server's hostname. If DNS is not updated or if hard-coded paths are used, profiles fail to load. The administrator should verify that all profile path references resolve correctly to the secondary server.

---

## FILE ANALYTICS & DATA LENS COMPATIBILITY (Q40–Q43)

---

### Q40. An organization currently uses File Analytics 3.4 and wants to migrate to Data Lens. Which statement about the migration is correct?
- A) File Analytics must be completely uninstalled before Data Lens can be enabled
- B) File Analytics and Data Lens can coexist temporarily during a migration period
- C) Data Lens automatically replaces File Analytics with no administrator action required
- D) Migration from File Analytics to Data Lens requires a full cluster rebuild

**Answer: B**
File Analytics and Data Lens can coexist during a migration period, allowing administrators to validate Data Lens functionality before decommissioning File Analytics. This phased approach ensures continuity of monitoring and auditing during the transition.

---

### Q41. During a Files upgrade to version 5.0, the administrator discovers that the existing File Analytics VM is incompatible. What should the administrator do FIRST?
- A) Delete the File Analytics VM and proceed with the Files upgrade
- B) Check the compatibility matrix for the required File Analytics version and upgrade File Analytics before or alongside the Files upgrade
- C) Disable all shares and recreate them after the upgrade
- D) Convert the File Analytics VM to a Data Lens instance manually

**Answer: B**
The administrator should consult the Nutanix compatibility matrix to determine which File Analytics version is compatible with Files 5.0. File Analytics should be upgraded to a compatible version before or as part of the Files upgrade process to maintain analytics functionality.

---

### Q42. Which requirement must be met to successfully deploy File Analytics alongside a Nutanix Files instance?
- A) File Analytics must be deployed on a separate Nutanix cluster from the file server
- B) The File Analytics VM requires its own IP address on the client network and access to the file server's storage
- C) File Analytics can only be deployed from Nutanix Central, not Prism Central
- D) File Analytics requires a minimum of 16 FSVMs on the file server

**Answer: B**
The File Analytics VM requires its own IP address on the client-side network and must have connectivity to the file server's internal storage network. It is deployed from Prism Central (or Prism Element, depending on version) as a separate VM on the same cluster as the file server.

---

### Q43. An administrator is troubleshooting a Data Lens connectivity issue after upgrading Prism Central. Data Lens can no longer receive analytics data. What should be checked?
- A) Whether the Prism Central upgrade changed the outbound proxy or firewall configuration, blocking HTTPS to the Data Lens cloud service
- B) Whether the FSVMs need more RAM allocated
- C) Whether Smart DR was accidentally enabled during the upgrade
- D) Whether Nutanix Objects versioning is interfering with Data Lens

**Answer: A**
Prism Central upgrades may modify network configurations, proxy settings, or certificate trust chains that affect outbound HTTPS connectivity to Data Lens. The administrator should verify that outbound communication to the Data Lens cloud endpoint is still functional after the upgrade.

---

## OBJECTS LIFECYCLE POLICIES & VERSIONING (Q44–Q47)

---

### Q44. An administrator wants to automatically delete objects from a bucket 90 days after creation. Which Nutanix Objects feature should be configured?
- A) Smart Tiering
- B) Lifecycle policy with an expiration rule
- C) WORM retention policy
- D) Bucket replication policy

**Answer: B**
Objects lifecycle policies allow administrators to define rules that automatically expire (delete) objects after a specified number of days. Setting an expiration rule of 90 days on the bucket will automatically remove objects once they reach that age.

---

### Q45. Which statement about Objects versioning is correct?
- A) Versioning can be disabled on a bucket after it has been enabled, permanently deleting all previous versions
- B) When versioning is enabled, each overwrite of an object creates a new version, and previous versions are retained until explicitly deleted or expired
- C) Versioning is only available for buckets with WORM enabled
- D) Versioning doubles the bucket's access key requirements

**Answer: B**
When versioning is enabled on a bucket, every PUT operation that overwrites an existing object creates a new version. Previous versions are retained and accessible until they are explicitly deleted by the user or removed by a lifecycle expiration rule.

---

### Q46. An administrator enables WORM (Write Once Read Many) with a retention period of 365 days on a Nutanix Objects bucket. A user attempts to delete an object that was written 30 days ago. What happens?
- A) The object is moved to a recycle bin and can be recovered
- B) The delete operation fails because the object is within the WORM retention period
- C) The object is deleted but a log entry is created
- D) The WORM policy is automatically overridden for administrators

**Answer: B**
WORM compliance mode prevents any deletion or modification of objects until the retention period has expired. Since the object is only 30 days old (within the 365-day retention), the delete request is denied. This ensures regulatory compliance and data immutability.

---

### Q47. What is the difference between a bucket policy and an IAM policy in Nutanix Objects?
- A) Bucket policies and IAM policies are identical and interchangeable
- B) Bucket policies are applied to a specific bucket and control access to that bucket's resources, while IAM policies are attached to users or groups and control what actions they can perform across the Objects environment
- C) IAM policies only apply to NFS access; bucket policies apply to S3 access
- D) Bucket policies require WORM to be enabled; IAM policies do not

**Answer: B**
Bucket policies are resource-based and attached to individual buckets, defining who can access that bucket and what operations they can perform. IAM policies are identity-based and attached to users or groups, controlling their permissions across the entire Objects environment. Both work together to provide comprehensive access control.

---

## FILES MULTI-PROTOCOL & PERMISSIONS (Q48–Q52)

---

### Q48. An administrator is creating a multi-protocol (SMB and NFS) share on Nutanix Files. Which identity mapping mechanism is required?
- A) Kerberos constrained delegation
- B) RFC 2307 attributes in Active Directory for mapping Windows users to UNIX UIDs/GIDs
- C) LDAP anonymous binding
- D) NTLM passthrough from the NFS client

**Answer: B**
Multi-protocol shares require identity mapping between Windows (SID-based) and UNIX (UID/GID-based) user identities. Nutanix Files uses RFC 2307 attributes configured in Active Directory to map Windows user accounts to corresponding UNIX UIDs and GIDs for consistent access control across SMB and NFS.

---

### Q49. When configuring a multi-protocol share, an SMB user creates a file. An NFS user accessing the same file reports "permission denied." What is the MOST likely cause?
- A) The NFS client does not support NFSv4
- B) The SMB user's Active Directory account lacks RFC 2307 UID/GID mapping, so the NFS client cannot match the file owner
- C) Multi-protocol shares only allow read access over NFS
- D) The file was encrypted by BitLocker during creation

**Answer: B**
If the SMB user's AD account does not have RFC 2307 UNIX attributes (UID/GID) configured, the file ownership cannot be properly mapped to a UNIX identity. When the NFS client tries to access the file, the permission check fails because the NFS-side identity mapping is incomplete.

---

### Q50. What is Access-Based Enumeration (ABE) in Nutanix Files?
- A) A feature that lists all files regardless of user permissions
- B) A feature that limits the files and folders displayed to only those the connected user has permission to access
- C) A method of enumerating all Active Directory users who have accessed a share
- D) A File Analytics report showing access frequency by file type

**Answer: B**
Access-Based Enumeration (ABE) ensures that when users browse an SMB share, they only see files and folders they have permission to access. Files and folders the user cannot access are hidden from the directory listing, improving security and reducing user confusion.

---

### Q51. An administrator needs to configure Nutanix Files to scan uploaded files for malware. Which integration should be used?
- A) Data Lens malware scanning module
- B) ICAP (Internet Content Adaptation Protocol) integration with a third-party antivirus server
- C) Built-in ClamAV on the FSVM
- D) Windows Defender running on the Prism Central VM

**Answer: B**
Nutanix Files supports ICAP integration for antivirus scanning. When configured, files written to SMB shares are sent to an ICAP-compatible antivirus server (such as Symantec, McAfee, or Trend Micro) for scanning. Infected files can be quarantined or blocked based on the scan results.

---

### Q52. Which statement about share-level permissions in Nutanix Files is correct?
- A) Share permissions can only be managed from Prism Element
- B) Administrators can delegate share-level management to specific AD users through the share admin role, allowing them to manage permissions without full Prism access
- C) Share permissions are inherited from the storage container and cannot be customized
- D) NFS exports do not support any form of access control

**Answer: B**
Nutanix Files supports share-level delegation through the share admin role. An AD user designated as share admin can manage permissions (ACLs) on that share without needing access to Prism Central or Prism Element, enabling distributed management in large organizations.

---

## VOLUMES — VG MANAGEMENT & iSCSI (Q53–Q59)

---

### Q53. An administrator needs to present a Nutanix Volume Group to a virtual machine running on AHV. Which method should be used?
- A) Mount the VG as an NFS export inside the VM
- B) Attach the Volume Group directly to the VM through Prism Central or the AHV API
- C) Configure iSCSI initiator software inside the VM and connect to the VG target
- D) Use SMB share mounting to connect the VM to the VG

**Answer: B**
For VMs running on AHV, Volume Groups can be directly attached to the VM through Prism Central (or the AHV/Acropolis API). This provides native block-level access without requiring iSCSI initiator configuration inside the guest VM, simplifying management and improving performance.

---

### Q54. An administrator is adding a new 500 GB volume to an existing Volume Group. Which statement is correct?
- A) Adding a volume requires the Volume Group to be detached from all consumers first
- B) New volumes can be added to a Volume Group online without disrupting existing connected hosts
- C) Each Volume Group can only contain a single volume
- D) Volumes can only be added using the nCLI, not Prism

**Answer: B**
New volumes (virtual disks) can be added to a Volume Group without detaching it from connected hosts. This is an online operation, and the new capacity becomes available to the host after a rescan of the iSCSI targets or refresh of the direct-attach configuration.

---

### Q55. What is the key difference between cluster-level iSCSI whitelists and volume-level whitelists in Nutanix Volumes?
- A) There is no difference; they are the same feature
- B) Cluster-level whitelists control which initiators can discover iSCSI targets on the cluster, while volume-level whitelists control which initiators can connect to a specific Volume Group
- C) Volume-level whitelists only apply to NFS access
- D) Cluster-level whitelists require CHAP; volume-level whitelists do not

**Answer: B**
Cluster-level iSCSI whitelists define which initiator IQNs or IP addresses can discover targets on the cluster's Data Services IP. Volume-level whitelists provide more granular control by restricting access to individual Volume Groups. For security, best practice is to use both levels to implement defense in depth.

---

### Q56. An administrator configures CHAP authentication for a Volume Group, but the physical server cannot connect. The IQN and target IP are correct. What should be investigated?
- A) Whether the CHAP secret on the initiator matches the secret configured on the Nutanix Volume Group
- B) Whether Data Lens is blocking the iSCSI connection
- C) Whether the Volume Group has versioning enabled
- D) Whether the server's NFS client is interfering with iSCSI

**Answer: A**
When CHAP is enabled, both the initiator (server) and target (Nutanix VG) must have matching CHAP credentials. If the CHAP secret on the server's iSCSI initiator does not match what is configured on the Volume Group in Prism, authentication fails and the connection is rejected.

---

### Q57. An administrator presents a Volume Group via iSCSI to a Windows physical server. After adding a second path for multipathing, the server shows duplicate disks. What should be configured?
- A) WORM on the Volume Group
- B) Microsoft MPIO (Multipath I/O) with the correct load-balancing policy to aggregate the paths into a single device
- C) A second Data Services IP address on a different subnet
- D) CHAP on only one of the two paths

**Answer: B**
When multiple iSCSI paths exist to the same Volume Group, the Windows server may see duplicate disk entries. Installing and configuring Microsoft MPIO with the iSCSI DSM (Device Specific Module) and the correct load-balancing policy (e.g., Round Robin) combines the multiple paths into a single multipathed device.

---

### Q58. After adding additional capacity to a Nutanix Volume Group, a Linux server does not see the new disk space. What is the MOST likely corrective action?
- A) Reboot the Nutanix cluster
- B) Rescan the iSCSI targets on the Linux server using `iscsiadm` session rescan and then extend the filesystem or LVM volume
- C) Reconfigure Smart DR on the Volume Group
- D) Reinstall the Linux iSCSI initiator software

**Answer: B**
When new volumes are added or existing volumes are expanded in a VG, the iSCSI initiator on the host must rescan to discover the changes. On Linux, running `iscsiadm -m session --rescan` forces a target rescan. After the OS recognizes the new capacity, the filesystem or LVM volume must be extended.

---

### Q59. A physical server connected to a Nutanix Volume Group via iSCSI experiences intermittent disconnections. Which iSCSI timeout setting should the administrator review?
- A) The DNS TTL on the server
- B) The iSCSI login timeout and node replacement timeout on the initiator, along with target portal group settings on the Nutanix side
- C) The NFS export timeout on the file server
- D) The WORM retention period on the Volume Group

**Answer: B**
Intermittent iSCSI disconnections can be caused by aggressive timeout settings on the initiator side. The administrator should review the iSCSI login timeout, replacement timeout, and retry parameters. On the Nutanix side, verifying the Data Services IP availability and target portal group configuration is also important.

---

## OBJECTS — S3 API, CONNECTIVITY, AND CLI (Q60–Q64)

---

### Q60. Which S3 API operations does Nutanix Objects support?
- A) Only PUT and GET operations
- B) Standard S3 operations including PUT, GET, DELETE, HEAD, LIST, multipart uploads, and bucket operations
- C) Only operations related to static website hosting
- D) Only operations initiated from Prism Central

**Answer: B**
Nutanix Objects provides broad S3 API compatibility, supporting standard operations including PUT/GET/DELETE/HEAD for objects, LIST for buckets, multipart uploads for large files, bucket lifecycle management, and versioning operations. This allows existing S3-compatible applications to work with minimal changes.

---

### Q61. An administrator has deployed Nutanix Objects and wants to validate that the S3 endpoint is reachable from an application server. Which is the BEST validation approach?
- A) Ping the Prism Element VIP from the application server
- B) Use an S3-compatible CLI tool (such as `aws s3 ls --endpoint-url`) with valid access keys to list buckets on the Objects endpoint
- C) Verify that the FSVM is responding to SMB requests
- D) Check whether File Analytics is receiving data from the Objects deployment

**Answer: B**
The most effective way to validate Objects endpoint connectivity is to use an S3-compatible tool (such as the AWS CLI configured with `--endpoint-url`) with valid access keys to perform a simple operation like listing buckets. A successful response confirms DNS resolution, network connectivity, authentication, and API functionality.

---

### Q62. An administrator needs to troubleshoot a failing Objects deployment. The MSP cluster is running but some pods are in CrashLoopBackOff state. Which CLI tool should be used to investigate?
- A) `ncli` on the CVM
- B) `kubectl` commands to inspect pod logs and describe the failing pods
- C) `iscsiadm` on the Objects worker nodes
- D) `nfs-utils` diagnostics

**Answer: B**
Nutanix Objects runs on the Microservices Platform (MSP) using Kubernetes. When pods are failing, `kubectl describe pod <pod-name>` and `kubectl logs <pod-name>` are the primary diagnostic tools for inspecting pod status, events, and application logs to identify the root cause.

---

### Q63. An administrator is troubleshooting Objects replication failure between two sites. The primary Objects cluster successfully writes data, but replication to the secondary never completes. What should be checked FIRST?
- A) Whether WORM is enabled on the source bucket
- B) Network connectivity and bandwidth between the two Objects clusters, and whether the replication endpoint DNS name resolves correctly at the primary site
- C) Whether File Analytics is installed at the secondary site
- D) Whether the secondary site has Smart Tiering enabled

**Answer: B**
Cross-site Objects replication requires reliable network connectivity between clusters and correct DNS resolution of the remote Objects endpoint. The administrator should verify that the primary cluster can resolve and reach the secondary cluster's S3 endpoint, and that sufficient network bandwidth is available for replication traffic.

---

### Q64. An application using the S3 API receives HTTP 403 Forbidden errors when accessing a Nutanix Objects bucket. The access key is valid. What are the TWO most likely causes?
- A) The bucket policy explicitly denies the requested operation, or the IAM policy for the user does not grant the required permissions
- B) The Objects cluster is running out of SSD capacity
- C) NFSv4 ACLs are conflicting with the S3 request
- D) The FSVM hosting the bucket is in maintenance mode

**Answer: A**
HTTP 403 errors with valid credentials typically indicate a policy-based denial. Either the bucket policy contains an explicit deny for the operation, or the user's IAM policy does not include the required action (e.g., `s3:PutObject`, `s3:GetObject`). Both bucket policies and IAM policies must allow the operation.

---

## FILES — DISTRIBUTED vs STANDARD SHARES, HA, AND NTP (Q65–Q70)

---

### Q65. What is the key difference between a distributed share and a standard share in Nutanix Files?
- A) Distributed shares only support NFS; standard shares only support SMB
- B) A distributed share spreads data across all FSVMs for higher throughput and parallel access, while a standard share is hosted on a single FSVM
- C) Standard shares support larger file sizes than distributed shares
- D) Distributed shares require Nutanix Objects as a backend

**Answer: B**
A distributed share (also called a sharded share) distributes top-level directories across all FSVMs, enabling parallel I/O and higher aggregate throughput. A standard share is hosted by a single FSVM, which can become a bottleneck for high-throughput workloads but is simpler for light-usage scenarios.

---

### Q66. During a rolling upgrade of Nutanix Files, how does the upgrade impact clients connected to a distributed share versus a standard share?
- A) There is no impact to either share type during upgrades
- B) Distributed share clients experience brief, transparent reconnections as each FSVM is upgraded sequentially, while standard share clients may experience a single longer disruption when the owning FSVM is upgraded
- C) Standard shares are not affected; only distributed shares experience downtime
- D) Both share types require all clients to disconnect before the upgrade begins

**Answer: B**
During a rolling upgrade, FSVMs are upgraded one at a time. Distributed share clients may see brief reconnections as each FSVM handling a portion of the share is upgraded. Standard share clients experience disruption only when the single FSVM hosting their share is upgraded, but that disruption may be longer since all share I/O depends on that one FSVM.

---

### Q67. Why is NTP synchronization critical for a Nutanix Files deployment?
- A) NTP is only needed for log timestamp formatting
- B) Kerberos authentication requires time synchronization within 5 minutes between the file server, Active Directory domain controllers, and clients; time skew causes authentication failures
- C) NTP controls the speed of data replication in Smart DR
- D) NTP is required only for NFS shares, not SMB shares

**Answer: B**
Kerberos authentication, used by SMB/CIFS for domain-joined clients, requires that the time difference between the file server (FSVMs), Active Directory domain controllers, and clients is within 5 minutes. NTP synchronization prevents Kerberos ticket validation failures due to clock skew.

---

### Q68. What happens if FSVM HA is triggered in a Nutanix Files deployment when using 3 or more FSVMs?
- A) All file shares become permanently unavailable
- B) The failed FSVM's workload is redistributed to the remaining healthy FSVMs, and clients experience a brief disruption before reconnecting
- C) A new FSVM is automatically deployed to replace the failed one within seconds
- D) FSVM HA only protects NFS shares, not SMB shares

**Answer: B**
When an FSVM fails in a deployment with 3+ FSVMs, the HA mechanism redistributes the failed FSVM's share ownership and IP addresses to the surviving FSVMs. SMB clients using continuous availability experience a brief transparent failover, while standard connections reconnect automatically after a short interruption.

---

### Q69. Which NFS protocol versions are supported by Nutanix Files 5.0?
- A) NFSv2 only
- B) NFSv3 and NFSv4.0/v4.1
- C) Only NFSv4.2
- D) NFSv3 only, with NFSv4 planned for a future release

**Answer: B**
Nutanix Files 5.0 supports both NFSv3 and NFSv4.0/v4.1. NFSv3 is commonly used for VMware datastores and legacy workloads, while NFSv4 provides enhanced security features including Kerberos authentication (krb5, krb5i, krb5p) and improved locking mechanisms.

---

### Q70. Which Kerberos security flavor provides both authentication and data integrity checking for NFS connections in Nutanix Files?
- A) sys (AUTH_SYS)
- B) krb5 (authentication only)
- C) krb5i (authentication + integrity)
- D) krb5p (authentication + integrity + privacy/encryption)

**Answer: C**
The `krb5i` security flavor provides Kerberos authentication plus data integrity checking (checksums) for NFS traffic. `krb5` provides authentication only, while `krb5p` adds encryption on top of authentication and integrity. `AUTH_SYS` provides no Kerberos security.

---

## FILE SERVER MANAGER & MONITORING INTERFACES (Q71–Q73)

---

### Q71. What is File Server Manager in Nutanix Files?
- A) A Prism Element widget for monitoring CVM health
- B) A dedicated management interface within Prism Central for configuring and managing individual file server settings, shares, and policies
- C) A third-party application installed on a Windows server
- D) A Data Lens component for generating file server reports

**Answer: B**
File Server Manager is a management interface accessible from Prism Central that provides file-server-specific configuration and monitoring. Administrators use it to create and manage shares, configure quotas, set up alerts, and perform file server maintenance tasks directly from the Prism Central console.

---

### Q72. An administrator needs to view per-share IOPS and latency metrics for a specific file server. Which management interface provides this information?
- A) Prism Element storage container view
- B) File Server Manager in Prism Central, which displays per-share and per-FSVM performance metrics
- C) Nutanix Objects management console
- D) The AHV host dashboard

**Answer: B**
File Server Manager in Prism Central provides detailed per-share and per-FSVM performance metrics including IOPS, throughput, and latency. This enables administrators to identify performance hotspots at the individual share level and determine whether scaling or rebalancing is needed.

---

### Q73. Which statement about the relationship between Prism Central, Prism Element, and File Server Manager is correct?
- A) File Server Manager is a standalone application that does not require Prism Central
- B) File Server Manager is accessed through Prism Central and provides file-server-specific management capabilities that are not available in Prism Element alone
- C) Prism Element provides all file server management features, making File Server Manager redundant
- D) File Server Manager can only be accessed through Nutanix Central, not Prism Central

**Answer: B**
File Server Manager is integrated into Prism Central and provides specialized file server management capabilities—such as share creation, quota management, and per-share metrics—that are not available in Prism Element. Prism Element provides cluster-level management but lacks the granular file server controls of File Server Manager.

---

## ADDITIONAL GAP COVERAGE (Q74–Q80)

---

### Q74. An administrator is designing a backup strategy and needs an RPO of 1 hour and RTO of 4 hours for a Nutanix Files environment. Which solution BEST meets these requirements?
- A) Self-Service Restore (SSR) snapshots taken every 24 hours
- B) Smart DR with a replication schedule set to replicate every 60 minutes, combined with a documented failover procedure
- C) Data Lens audit trails configured to retain 30 days of data
- D) Manual file copy to an NFS export on another cluster nightly

**Answer: B**
Smart DR with an hourly replication schedule meets the 1-hour RPO requirement. Combined with a documented and tested failover procedure that can be executed within 4 hours, this meets both RPO and RTO targets. SSR snapshots provide point-in-time recovery but are not a cross-site DR solution.

---

### Q75. An administrator needs to configure Nutanix Files to support both SMB and NFS clients on the SAME data. Which share type should be created?
- A) A standard SMB share and a separate NFS export pointing to the same path
- B) A multi-protocol share with both SMB and NFS access enabled and RFC 2307 identity mapping configured
- C) A distributed share with ICAP integration
- D) Two separate file servers, one for SMB and one for NFS

**Answer: B**
A multi-protocol share enables both SMB and NFS access to the same underlying data. RFC 2307 identity mapping in Active Directory must be configured to map Windows SIDs to UNIX UIDs/GIDs, ensuring consistent file ownership and permissions across both protocols.

---

### Q76. What is Data Sync in Nutanix Files?
- A) A feature that synchronizes Objects bucket data to Files shares
- B) A feature that provides one-way or bi-directional synchronization of file data between Nutanix Files and external NFS/SMB targets or cloud storage
- C) A Smart DR sub-feature that only syncs metadata
- D) A Data Lens reporting feature that syncs analytics data to the cloud

**Answer: B**
Data Sync in Nutanix Files provides synchronization of file data to and from external storage targets. It supports syncing to external NFS/SMB targets or cloud storage, enabling hybrid cloud workflows and data mobility between Nutanix Files and other storage systems.

---

### Q77. An administrator configures a nested NFS export within an existing parent export on Nutanix Files. Which behavior should they expect regarding permissions?
- A) The nested export automatically inherits all permissions from the parent export with no option to override
- B) The nested export can have its own independent export permissions, but file-level POSIX ACLs are inherited from the parent unless explicitly modified
- C) Nested exports are not supported in Nutanix Files
- D) The parent export is automatically deleted when a nested export is created

**Answer: B**
Nested exports in Nutanix Files can have their own export-level access controls (client IP restrictions, squash settings). However, the underlying file-level POSIX permissions are inherited from the parent directory structure unless an administrator explicitly changes them at the file or directory level.

---

### Q78. During a Nutanix Files upgrade, the administrator wants to understand the impact on different share types. Which statement is correct?
- A) All shares are taken offline simultaneously during the entire upgrade process
- B) Distributed shares experience minimal impact as FSVMs are upgraded in a rolling fashion, while standard shares experience brief downtime when their hosting FSVM is upgraded
- C) Only NFS exports are affected during upgrades; SMB shares remain fully available
- D) Share types have no impact on upgrade behavior

**Answer: B**
Nutanix Files performs rolling upgrades one FSVM at a time. Distributed shares, which spread data across FSVMs, maintain most of their capacity during the process with brief reconnections. Standard shares, hosted on a single FSVM, experience a brief outage when their specific FSVM is being upgraded.

---

### Q79. An administrator wants to configure Objects endpoint access with a custom SSL/TLS certificate. Where is this configured?
- A) On each individual Objects worker VM via SSH
- B) In the Objects configuration within Prism Central, where the S3 endpoint SSL certificate can be uploaded and applied
- C) In Prism Element under the storage container settings
- D) In Data Lens under the security settings

**Answer: B**
Custom SSL/TLS certificates for the Objects S3 endpoint are configured through Prism Central in the Objects management section. The administrator uploads the certificate and private key, and Prism Central applies it to the Objects endpoint, enabling trusted HTTPS connections for S3 client applications.

---

### Q80. An administrator notices that user profiles for roaming VDI users are not appearing correctly after a Smart DR failover. Cross-cluster profile synchronization appears broken. Which TWO actions should the administrator take?
- A) Verify that the secondary file server has joined the correct Active Directory domain and that Group Policy profile path settings reference a DNS name (not a hardcoded IP) that has been updated for the secondary site
- B) Reinstall Nutanix Objects at the secondary site
- C) Delete all user profiles and ask users to recreate them
- D) Disable Smart DR and use manual file copy instead

**Answer: A**
Cross-cluster profile issues after failover are typically caused by two factors: the secondary file server not being properly joined to the AD domain (preventing authentication), and profile path references in Group Policy using hardcoded IPs or hostnames that still point to the primary site. Ensuring proper AD integration and DNS-based profile paths resolves both issues.

---

## ANSWER KEY

| Question | Answer | Topic Area |
|----------|--------|------------|
| Q1 | B | Data Lens — Definition |
| Q2 | B | Data Lens — Onboarding prerequisite |
| Q3 | B | Data Lens — Ransomware detection |
| Q4 | B | Data Lens — Audit trails |
| Q5 | B | Data Lens — Multi-cluster advantage |
| Q6 | B | Data Lens — Objects integration |
| Q7 | B | Data Lens — Connectivity troubleshooting |
| Q8 | B | Data Lens — PII scanning |
| Q9 | B | Mine — Definition |
| Q10 | B | Mine — Supported vendors |
| Q11 | C | Mine — Protocol for Objects |
| Q12 | B | Mine — Integration benefit |
| Q13 | B | Objects Federation — Definition |
| Q14 | B | Objects Federation — Use case |
| Q15 | B | Objects Federation — Prerequisites |
| Q16 | B | Objects Federation — Best use case |
| Q17 | B | Objects Namespaces — Purpose |
| Q18 | B | Objects Namespaces — Multi-tenancy |
| Q19 | B | Objects Namespaces — Endpoint |
| Q20 | B | Smart Tiering — Purpose |
| Q21 | C | Advanced Tiering — Custom policies |
| Q22 | B | Standard Tiering — Simplest option |
| Q23 | B | Tiering — File recall behavior |
| Q24 | B | Smart vs Standard Tiering |
| Q25 | B | VDI Sync — Definition |
| Q26 | B | VDI Sync — Use case |
| Q27 | C | VDI Sync — Share type |
| Q28 | B | FQDN pathing — Definition |
| Q29 | B | FQDN pathing — Subdomain advantage |
| Q30 | B | FQDN pathing — DNS requirements |
| Q31 | B | Nutanix Central — Definition |
| Q32 | B | Nutanix Central — Storage relationship |
| Q33 | B | Nutanix Central — Upgrade checks |
| Q34 | B | Smart DR — DNS after failover |
| Q35 | A | Smart DR — AD authentication |
| Q36 | B | Smart DR — Failback procedure |
| Q37 | B | Smart DR — Replication failure |
| Q38 | B | Smart DR — Automated DNS |
| Q39 | B | Smart DR — Cross-cluster profiles |
| Q40 | B | File Analytics/Data Lens — Migration |
| Q41 | B | File Analytics — Compatibility |
| Q42 | B | File Analytics — Deployment |
| Q43 | A | Data Lens — Post-upgrade troubleshooting |
| Q44 | B | Objects — Lifecycle policies |
| Q45 | B | Objects — Versioning |
| Q46 | B | Objects — WORM retention |
| Q47 | B | Objects — Bucket vs IAM policies |
| Q48 | B | Files — Multi-protocol RFC 2307 |
| Q49 | B | Files — Multi-protocol permissions |
| Q50 | B | Files — ABE |
| Q51 | B | Files — ICAP antivirus |
| Q52 | B | Files — Share delegation |
| Q53 | B | Volumes — VM attachment |
| Q54 | B | Volumes — Adding volumes to VG |
| Q55 | B | Volumes — Cluster vs volume whitelists |
| Q56 | A | Volumes — CHAP troubleshooting |
| Q57 | B | Volumes — MPIO configuration |
| Q58 | B | Volumes — Capacity visibility |
| Q59 | B | Volumes — iSCSI timeouts |
| Q60 | B | Objects — S3 API operations |
| Q61 | B | Objects — Connectivity validation |
| Q62 | B | Objects — kubectl troubleshooting |
| Q63 | B | Objects — Replication troubleshooting |
| Q64 | A | Objects — S3 403 errors |
| Q65 | B | Files — Distributed vs standard shares |
| Q66 | B | Files — Upgrade impact by share type |
| Q67 | B | Files — NTP/Kerberos requirement |
| Q68 | B | Files — FSVM HA behavior |
| Q69 | B | Files — NFS protocol versions |
| Q70 | C | Files — Kerberos NFS flavors |
| Q71 | B | File Server Manager — Definition |
| Q72 | B | File Server Manager — Metrics |
| Q73 | B | File Server Manager — Prism relationship |
| Q74 | B | RPO/RTO — Smart DR scenario |
| Q75 | B | Files — Multi-protocol share config |
| Q76 | B | Files — Data Sync feature |
| Q77 | B | Files — Nested export permissions |
| Q78 | B | Files — Upgrade impact by share type |
| Q79 | B | Objects — SSL/TLS endpoint config |
| Q80 | A | Smart DR — Cross-cluster profiles |

---

## BLUEPRINT GAP COVERAGE MAP

| Gap Area | Questions | Count |
|----------|-----------|-------|
| Data Lens (deploy, configure, audit, anomaly, PII) | Q1–Q8 | 8 |
| Mine for Objects | Q9–Q12 | 4 |
| Objects Federation | Q13–Q16 | 4 |
| Objects Namespaces | Q17–Q19 | 3 |
| Tiering (Smart/Standard/Advanced) | Q20–Q24 | 5 |
| VDI Sync | Q25–Q27 | 3 |
| FQDN-based pathing | Q28–Q30 | 3 |
| Nutanix Central | Q31–Q33 | 3 |
| Smart DR troubleshooting (DNS/AD/failover/failback) | Q34–Q39 | 6 |
| File Analytics & Data Lens compatibility | Q40–Q43 | 4 |
| Objects lifecycle, versioning, WORM, bucket vs IAM | Q44–Q47 | 4 |
| Files multi-protocol, permissions, ABE, ICAP | Q48–Q52 | 5 |
| Volumes VG mgmt, iSCSI multipathing, whitelists | Q53–Q59 | 7 |
| Objects S3 API, connectivity, CLI, replication | Q60–Q64 | 5 |
| Files distributed vs standard, HA, NTP, NFS versions | Q65–Q70 | 6 |
| File Server Manager interface | Q71–Q73 | 3 |
| RPO/RTO scenarios, multi-protocol, Data Sync, nested exports, upgrade impact, SSL | Q74–Q80 | 7 |
| **Total** | **Q1–Q80** | **80** |

---

*End of Part 3 — Gap-Fill Questions*
