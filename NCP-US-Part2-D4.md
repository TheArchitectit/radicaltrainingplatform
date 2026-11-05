# NCP-US 6.10 – Domain 4: Troubleshoot

## Practice Exam Questions (80 Questions)

---

### Q1
Users report intermittent access failures to an SMB share hosted on Nutanix Files. The administrator verifies that the FSVMs are online. What should be checked next?
- A) Review the Volume Group iSCSI target portal configuration
- B) Verify DNS A records exist for all FSVM IPs and the file server virtual IP
- C) Restart the Stargate service on all CVMs
- D) Check the Objects MSP pod status using kubectl

**Answer: B**
SMB share access relies heavily on DNS. Each FSVM and the file server VIP must have proper DNS A records. Missing or stale DNS records are the most common cause of intermittent SMB access failures.

---

### Q2
An administrator needs to identify the root cause of a Nutanix Files service crash. Which log file should be examined first on the FSVM?
- A) cerebro.INFO on the CVM
- B) msp_controller.log on the Objects worker node
- C) stargate.INFO on the CVM
- D) minerva_nvm.log on the FSVM

**Answer: D**
The minerva_nvm.log is the primary log file for Nutanix Files services running on the FSVM. It contains detailed information about file service operations, errors, and crash events.

---

### Q3
An administrator suspects that an FSVM is not functioning correctly after a recent configuration change. Which command should be run to verify the current FSVM deployment flavor and status?
- A) afs info.list
- B) kubectl get pods --all-namespaces
- C) iscsi_client_connections
- D) ncli cluster get-params

**Answer: A**
The command `afs info.list` retrieves the current FSVM deployment information and status, helping confirm whether the FSVM is configured and operating as expected.

---

### Q4
After deploying a new Nutanix Files instance, the administrator notices that all FSVM health checks are failing in Prism. The FSVMs are powered on and reachable via SSH. What is the most likely cause?
- A) The Prism Element license has expired
- B) The minerva_nvm service on the FSVMs has failed to start
- C) The Objects store endpoint certificate is invalid
- D) The Volume Group flash mode is disabled

**Answer: B**
When FSVMs are reachable but health checks fail in Prism, the most common cause is that the minerva_nvm service has not started correctly. Reviewing minerva_nvm.log on the FSVM will reveal startup errors.

---

### Q5
An administrator receives a Prism alert indicating high memory utilization on one FSVM while the other two FSVMs show normal utilization. What is the most likely cause?
- A) A misconfigured iSCSI multipath policy
- B) An uneven distribution of shares across FSVMs
- C) A failing disk on the CVM hosting the FSVM
- D) An expired SSL certificate on the file server endpoint

**Answer: B**
Uneven share distribution can cause one FSVM to handle a disproportionate number of client connections, leading to high memory utilization. Rebalancing shares across FSVMs resolves this imbalance.

---

### Q6
A Windows client receives "Access Denied" when connecting to an SMB share on Nutanix Files. The share permissions are confirmed correct. Kerberos authentication is configured. What should the administrator check next?
- A) Whether CHAP authentication is enabled on the Volume Group
- B) Whether the CVM Stargate service has been restarted recently
- C) Whether the file server computer account exists in Active Directory
- D) Whether the Objects bucket policy allows anonymous access

**Answer: C**
Kerberos authentication for SMB requires the file server to have a valid computer account in Active Directory. If the account is missing, deleted, or the password is out of sync, Kerberos authentication fails and clients receive "Access Denied."

---

### Q7
Users connecting to an SMB share on Nutanix Files from legacy Windows 7 workstations report authentication failures. Users on Windows 10 connect successfully. What is the most likely cause?
- A) The file server Objects endpoint requires TLS 1.3
- B) The Volume Group iSCSI IQN does not match the initiator
- C) The FSVM snapshot schedule is blocking new connections
- D) NTLMv1 is disabled on the file server and legacy clients do not support NTLMv2

**Answer: D**
Nutanix Files may be configured to require NTLMv2 or Kerberos only. Legacy Windows 7 clients attempting NTLMv1 will fail authentication. Verifying the NTLM authentication level on both the file server and the client GPO is necessary.

---

### Q8
An administrator configures SMB signing as required on the Nutanix Files server. After the change, a subset of Linux clients using CIFS mounts can no longer connect. What is the cause?
- A) The Linux CIFS clients do not support or have not enabled SMB signing
- B) The NFS export policy is blocking CIFS mounts
- C) The Objects lifecycle policy has transitioned the data to cold tier
- D) The MPIO driver on the Linux clients is misconfigured

**Answer: A**
When SMB signing is set to "required" on the server, all connecting clients must support and negotiate SMB signing. Some Linux CIFS implementations may not have signing enabled by default, causing connection failures.

---

### Q9
After a DNS server migration, users report they can no longer access any shares on the Nutanix Files server. The FSVMs are healthy and accessible from the CVM. What should the administrator verify?
- A) That the iSCSI target portal IP matches the new DNS server IP
- B) That the new DNS server has A records for the file server VIP and all FSVM IPs
- C) That the LCM inventory has been refreshed after the migration
- D) That the Objects worker pods have been restarted

**Answer: B**
After a DNS server migration, the A records for the Nutanix Files server VIP and individual FSVM IPs must be recreated on the new DNS server. Without these records, clients cannot resolve the file server hostname.

---

### Q10
An administrator notices that SMB share throughput has degraded significantly. The FSVMs show 90%+ CPU utilization in Prism. Network throughput between the CVM and FSVM is normal. What is the recommended first step?
- A) Migrate the file server to a different Objects store
- B) Restart the Stargate service across all CVMs
- C) Vertically scale the FSVMs by adding more vCPUs and RAM
- D) Disable SMB encryption on all shares

**Answer: C**
When FSVM CPU utilization is consistently high, the FSVMs are resource-constrained. Vertically scaling by adding vCPUs and RAM per FSVM directly addresses the resource bottleneck and improves throughput.

---

### Q11
After enabling smart tiering on a Nutanix Files share, users report slower access to files that have not been accessed in several weeks. What explains this behavior?
- A) Smart tiering disables the CVM read cache for the affected share
- B) Tiered files are compressed using erasure coding which increases read latency
- C) The FSVM snapshot schedule pauses I/O during tiering operations
- D) Tiered files are moved to capacity-tier storage and must be recalled on access, adding latency

**Answer: D**
Smart tiering moves infrequently accessed files from performance tier to capacity tier. When users access tiered files, they must be recalled from capacity storage, which introduces additional latency compared to performance-tier access.

---

### Q12
An administrator is troubleshooting slow NFS performance on Nutanix Files. The FSVM CPU and memory utilization are within normal ranges. What should be checked next?
- A) Network throughput between the clients and the FSVM client network
- B) The Objects bucket replication factor
- C) The Volume Group CHAP authentication timeout
- D) The LCM firmware version on the NIC

**Answer: A**
When FSVM resources are not saturated, the next most likely bottleneck for NFS performance is network throughput. Checking for packet loss, bandwidth saturation, or MTU mismatches on the client-facing network is the recommended next step.

---

### Q13
During a planned Nutanix Files upgrade, the administrator notices that the first FSVM has been in "upgrading" state for over 45 minutes. What is the expected behavior during a Files rolling upgrade?
- A) Only the metadata FSVM upgrades; data FSVMs remain on the previous version
- B) FSVMs upgrade one at a time; clients connected to the upgrading FSVM fail over to other FSVMs
- C) All FSVMs upgrade simultaneously to minimize the upgrade window
- D) The file server goes completely offline during the entire upgrade process

**Answer: B**
Nutanix Files performs rolling upgrades where FSVMs are upgraded one at a time. Client connections on the upgrading FSVM are temporarily disrupted and fail over to other healthy FSVMs. Some temporary performance degradation is expected.

---

### Q14
An administrator is about to initiate a Nutanix Files upgrade. The pre-upgrade health check reports a warning about insufficient FSVM resources. What should the administrator do?
- A) Proceed with the upgrade and address the warning afterward
- B) Disable the health check and restart the upgrade process
- C) Resolve the FSVM resource warning before proceeding with the upgrade
- D) Ignore the warning since pre-upgrade checks are informational only

**Answer: C**
Pre-upgrade health checks for Nutanix Files should be resolved before proceeding. Insufficient FSVM resources during a rolling upgrade can lead to overloaded remaining FSVMs when one FSVM is taken offline for upgrade, potentially causing service disruptions.

---

### Q15
During a Nutanix Files rolling upgrade, users report temporary disconnections from SMB shares. The administrator confirms that only one FSVM is upgrading. What should the administrator communicate to users?
- A) The file server has entered maintenance mode and all shares are offline
- B) The disconnections indicate a failed upgrade and a rollback is in progress
- C) Users must manually reconnect to a different FSVM IP address
- D) Temporary disconnections are expected during rolling upgrades as connections migrate between FSVMs

**Answer: D**
During a rolling upgrade, the FSVM being upgraded must drain its client connections. Clients experience brief disconnections as their sessions migrate to other healthy FSVMs. This is expected behavior and connections auto-recover.

---

### Q16
After a Files rolling upgrade completes, the administrator notices one FSVM did not rejoin the cluster. Prism shows it as "unreachable." What should be done first?
- A) Check the minerva_nvm.log on the affected FSVM for post-upgrade startup errors
- B) Delete the FSVM and redeploy the entire file server
- C) Restart all CVMs in the Nutanix cluster
- D) Re-register the Objects store with the file server

**Answer: A**
When an FSVM fails to rejoin after an upgrade, the minerva_nvm.log is the primary diagnostic log. It will reveal startup failures, configuration mismatches, or service errors that prevented the FSVM from becoming operational post-upgrade.

---

### Q17
An administrator configures a multi-protocol share (SMB and NFS) on Nutanix Files. Windows users can access files, but Linux NFS clients receive permission denied errors on files created by Windows users. What is the most likely cause?
- A) The FSVM does not have a valid SSL certificate for NFS
- B) UID/GID mapping between Active Directory users and NFS is not configured correctly
- C) The Objects IAM policy is overriding the file share permissions
- D) The Volume Group is configured in active/passive mode instead of active/active

**Answer: B**
Multi-protocol shares require proper UID/GID mapping between Active Directory and UNIX identities. When this mapping is missing or incorrect, NFS clients cannot translate the Windows SID to a valid UNIX identity, resulting in permission denied errors.

---

### Q18
On a multi-protocol Nutanix Files share, an administrator notices that NFSv4 ACLs set by Linux clients are not being honored when Windows users access the same files via SMB. What should be investigated?
- A) The iSCSI initiator IQN registered for the NFS clients
- B) The LCM version compatibility matrix for multi-protocol
- C) The NFSv4 ACL to NTFS ACL mapping rules on the file server
- D) The Objects WORM retention policy on the share

**Answer: C**
NFSv4 ACLs must be properly mapped to equivalent NTFS ACLs for SMB access. If the mapping rules are not configured correctly, the permissions set by NFS clients will not translate properly when accessed via SMB.

---

### Q19
An administrator enables multi-protocol access on an existing NFS share. After the change, users report that newly created files via SMB do not inherit the parent directory permissions as expected. What is the likely issue?
- A) The FSVM does not have enough memory to support multi-protocol
- B) The Objects lifecycle policy is overriding the permission settings
- C) The CVM Cerebro service is not replicating the permission metadata
- D) Permission inheritance settings conflict between POSIX mode bits and NTFS ACL inheritance

**Answer: D**
When multi-protocol is enabled, there can be conflicts between POSIX permission inheritance (used by NFS) and NTFS ACL inheritance (used by SMB). The administrator must configure the preferred permission model and inheritance behavior.

---

### Q20
A Linux client attempts to access a file on a multi-protocol share using NFSv4 and receives an "operation not permitted" error. The same file is accessible via SMB from a Windows client. The UID/GID mapping is verified correct. What should the administrator check?
- A) Whether the NFSv4 AUTH_SYS or AUTH_KRB5 authentication method matches the server configuration
- B) Whether the Objects endpoint DNS record is resolvable from the Linux client
- C) Whether the CHAP secret on the iSCSI target matches the Linux initiator
- D) Whether the CVM NTP source is synchronized with the Linux client

**Answer: A**
NFSv4 supports multiple authentication methods. If the file server requires Kerberos (AUTH_KRB5) but the Linux client is using AUTH_SYS, access will be denied even if UID/GID mapping is correct.

---

### Q21
A Nutanix Files deployment currently has 3 FSVMs, and the administrator needs to support additional client connections. What is the recommended scaling approach?
- A) Increase the CVM memory on each host to 64 GB
- B) Add additional FSVMs to the file server (up to a maximum of 16 FSVMs)
- C) Deploy a second Objects store to offload file connections
- D) Create additional Volume Groups to distribute the SMB load

**Answer: B**
Nutanix Files supports horizontal scaling by adding FSVMs up to a maximum of 16. Each additional FSVM increases the capacity for client connections and distributes the workload across more resources.

---

### Q22
After adding a fourth FSVM to a Nutanix Files cluster, the administrator notices that the new FSVM has no shares assigned to it. What must be done?
- A) Restart the Stargate service on the CVM hosting the new FSVM
- B) Manually assign an iSCSI target portal to the new FSVM
- C) Rebalance shares across all FSVMs to distribute the workload to the new FSVM
- D) Delete and recreate all existing shares

**Answer: C**
When a new FSVM is added, existing shares are not automatically redistributed. The administrator must initiate a share rebalancing operation to distribute shares across all FSVMs, including the newly added one.

---

### Q23
An administrator wants to increase the performance of each individual FSVM rather than adding more FSVMs. Which action achieves vertical scaling for Nutanix Files?
- A) Add additional disks to the CVM storage pool
- B) Enable deduplication on the Nutanix Files container
- C) Change the Objects replication factor from 2 to 3
- D) Increase the vCPU count and RAM allocation for each FSVM

**Answer: D**
Vertical scaling for Nutanix Files involves increasing the vCPU and RAM resources allocated to each FSVM. This allows each FSVM to handle more concurrent operations and larger working sets.

---

### Q24
Users report that previous versions of files are not available for self-service restore on an SMB share. The administrator confirms that snapshot schedules are configured. What should be checked?
- A) Whether the "Previous Versions" feature is enabled on the share and snapshots have completed successfully
- B) Whether the Objects bucket versioning is enabled
- C) Whether the Volume Group deduplication is enabled
- D) Whether the CVM Curator service has completed a recent scan

**Answer: A**
Self-service restore via Windows Previous Versions requires both a configured snapshot schedule and the Previous Versions feature to be enabled on the share. Additionally, at least one snapshot must have completed successfully.

---

### Q25
An administrator sets up a snapshot replication schedule between two Nutanix Files servers for disaster recovery. Replication fails with a connectivity error. What should be verified first?
- A) That LCM has been updated to the latest version on both clusters
- B) Network connectivity between the source and target FSVMs on the replication network
- C) That the Objects store on the target site has available capacity
- D) That the iSCSI initiator on the target site is configured correctly

**Answer: B**
Nutanix Files replication requires direct network connectivity between the FSVMs at the source and target sites. Firewall rules, routing, and DNS must all allow communication between the FSVM replication interfaces.

---

### Q26
After a site failover, users connecting to the disaster recovery Nutanix Files server report stale data. The last successful replication was 4 hours ago. What explains this?
- A) The Objects lifecycle policy is delaying data availability on the DR site
- B) The iSCSI MPIO failover has not completed on the DR site
- C) The RPO is determined by the replication schedule interval; data created after the last successful snapshot is not replicated
- D) The FSVM cache on the DR site needs to be manually flushed

**Answer: C**
Replication is snapshot-based, so the RPO depends on the configured schedule. Any data created or modified after the last successfully replicated snapshot will not be present on the DR site.

---

### Q27
An administrator configures daily snapshots on a Nutanix Files share but notices that snapshot storage consumption is growing faster than expected. What is the most likely cause?
- A) The Objects WORM policy is preventing snapshot deduplication
- B) The Volume Group flash mode is duplicating snapshot data
- C) The CVM Stargate service is not performing garbage collection
- D) A high rate of file changes causing large delta between snapshots

**Answer: D**
Nutanix Files snapshots are space-efficient and only store changed blocks. However, if the share has a high rate of data modification, the delta between snapshots grows, leading to higher-than-expected storage consumption.

---

### Q28
An administrator receives an alert that the Nutanix Objects MSP cluster is unhealthy. Which tool should be used to diagnose the issue?
- A) kubectl commands on the MSP cluster to check pod status and resource allocation
- B) The afs info.get_flavor command on the FSVM
- C) The ncli volume-group list command on the CVM
- D) The NFS export policy editor in Prism Element

**Answer: A**
Nutanix Objects runs on the Microservices Platform (MSP). Using kubectl commands to check pod health, resource allocation, and logs is the primary method for diagnosing MSP-level issues.

---

### Q29
After deploying Nutanix Objects, an administrator notices that several pods are in CrashLoopBackOff state. What should be investigated first?
- A) The SMB signing policy on the Nutanix Files server
- B) Pod resource limits and available memory/CPU on the MSP worker nodes
- C) The FSVM minerva_nvm.log for related file service errors
- D) The Volume Group iSCSI target IQN for mismatched configurations

**Answer: B**
Pods in CrashLoopBackOff typically indicate resource constraints or configuration errors. Checking resource limits and available capacity on MSP worker nodes is the first diagnostic step, as insufficient resources prevent pods from starting.

---

### Q30
The Nutanix Objects UI in Prism Central shows the object store as "degraded." The administrator confirms that the underlying Nutanix cluster is healthy. Where should troubleshooting begin?
- A) Verify the FSVM network configuration in Prism Element
- B) Check the iSCSI session status on connected external hosts
- C) Check the MSP platform health and individual pod status using kubectl
- D) Restart the Cerebro service on all CVMs to reinitialize replication

**Answer: C**
When the object store shows as degraded but the underlying cluster is healthy, the issue is typically within the MSP platform layer. Checking pod health, node status, and resource consumption in the MSP environment isolates the problem.

---

### Q31
An administrator notices that Nutanix Objects worker nodes are running out of memory, causing pod evictions. What is the recommended remediation?
- A) Reduce the FSVM memory allocation to free cluster resources
- B) Disable the Volume Group compression feature
- C) Change the Objects replication from synchronous to asynchronous
- D) Scale out by adding more worker nodes or scale up existing worker node resources

**Answer: D**
When MSP worker nodes experience resource exhaustion, the solution is to either add more worker nodes (horizontal scaling) or increase the resources allocated to existing worker nodes (vertical scaling) to prevent pod evictions.

---

### Q32
An S3 client application receives a 403 Forbidden error when attempting to upload objects to a Nutanix Objects bucket. The bucket exists and the endpoint is reachable. What should be checked first?
- A) The IAM user access keys and the bucket policy permissions for the PutObject action
- B) The FSVM health status and DNS A records
- C) The Volume Group CHAP authentication credentials
- D) The NCC health check results on the CVM

**Answer: A**
A 403 Forbidden error on Objects indicates an authorization failure. The administrator should verify that the IAM user's access/secret keys are correct and that the bucket policy or IAM policy grants the PutObject permission for that user.

---

### Q33
An administrator configures a bucket policy on Nutanix Objects that grants read access, but an IAM user policy explicitly denies read access. What is the resulting behavior when the user attempts to read an object?
- A) The request enters a pending state until an administrator approves it
- B) Access is denied because an explicit deny in any policy always takes precedence
- C) Access is allowed because bucket policies override IAM user policies
- D) Access is allowed because the most recent policy takes precedence

**Answer: B**
In Nutanix Objects (following S3-compatible policy evaluation), an explicit deny in any policy always overrides an allow in any other policy. This is consistent with the standard deny-override policy evaluation model.

---

### Q34
A web application using Nutanix Objects for storage receives CORS (Cross-Origin Resource Sharing) errors in the browser. The bucket contains the correct data. What should the administrator configure?
- A) An iSCSI multipath policy for the web application server
- B) A new NFS export with root squash disabled for the web server
- C) A CORS configuration on the bucket to allow the web application's origin domain
- D) A new FSVM with a dedicated network for web traffic

**Answer: C**
CORS errors occur when a browser-based application makes requests to a different origin. The Nutanix Objects bucket must have a CORS configuration that explicitly allows the web application's origin domain, HTTP methods, and headers.

---

### Q35
An administrator creates a new IAM user for a backup application on Nutanix Objects. The application can list buckets but cannot write to a specific bucket. What is the most likely issue?
- A) The FSVM minerva_nvm service is blocking write operations
- B) The Volume Group attached to the backup server is read-only
- C) The LCM version does not support write operations for new IAM users
- D) The IAM user has a policy allowing ListBucket but the bucket policy does not grant PutObject for that user

**Answer: D**
When a user can list but not write, it indicates a granular permission issue. The IAM user or bucket policy must explicitly grant PutObject (and potentially PutBucketObject) permissions for the specific bucket.

---

### Q36
An administrator is troubleshooting slow upload performance to Nutanix Objects. The object store has the minimum of 3 worker nodes. What is the most likely performance bottleneck?
- A) Insufficient worker nodes to handle the concurrent upload workload
- B) The FSVM snapshot schedule is consuming all available I/O bandwidth
- C) The Volume Group CHAP authentication is adding overhead to each upload
- D) The CVM Stargate service is throttling Objects I/O

**Answer: A**
Three worker nodes is the minimum for Nutanix Objects. For production workloads with significant concurrent access, additional worker nodes are typically required to provide adequate throughput and avoid resource contention.

---

### Q37
An administrator notices high network latency between S3 clients and the Nutanix Objects endpoint. The MSP pods are healthy and have available resources. What should be investigated?
- A) The Cerebro replication backlog between clusters
- B) Network throughput and routing between the client network and the Objects external network
- C) The FSVM tiering policy causing data recall delays
- D) The iSCSI session timeout values on the client

**Answer: B**
When MSP pods are healthy but clients experience latency, the issue is likely in the network path. Checking for bandwidth saturation, routing inefficiencies, or MTU mismatches between the client network and the Objects endpoint network is the next step.

---

### Q38
An administrator enables WORM (Write Once Read Many) on a Nutanix Objects bucket. A compliance officer asks when the WORM protection takes effect on newly uploaded objects. What is the correct answer?
- A) WORM protection takes effect after the first Objects snapshot completes
- B) Objects become immutable only after an administrator manually locks each object
- C) Objects are writable during the 24-hour grace period after upload, then become immutable
- D) WORM protection is immediate upon object upload with no grace period

**Answer: C**
Nutanix Objects WORM has a 24-hour grace period after an object is uploaded. During this period, the object can be deleted or overwritten. After the grace period expires, the object becomes immutable according to the WORM retention policy.

---

### Q39
A user accidentally uploads a file to a WORM-enabled bucket on Nutanix Objects. The upload occurred 2 hours ago. Can the file be deleted?
- A) No, WORM files cannot be deleted under any circumstances once uploaded
- B) Yes, but only if the administrator disables WORM on the entire bucket first
- C) No, but the file will automatically expire after the lifecycle policy interval
- D) Yes, the file can be deleted because it is still within the 24-hour WORM grace period

**Answer: D**
Within the 24-hour grace period, objects in a WORM bucket can still be deleted or modified. This grace period allows administrators or users to correct accidental uploads before immutability is enforced.

---

### Q40
An auditor asks the difference between legal hold and governance mode in Nutanix Objects WORM. Which statement is correct?
- A) Legal hold prevents deletion indefinitely until explicitly removed, while governance mode allows privileged users to bypass retention
- B) Legal hold applies only to Objects, while governance mode applies to Files shares
- C) Legal hold encrypts the data at rest, while governance mode enables versioning
- D) Legal hold is enforced by the FSVM, while governance mode is enforced by the CVM

**Answer: A**
Legal hold locks objects indefinitely regardless of retention period until the hold is explicitly removed, typically for litigation purposes. Governance mode enforces retention but allows users with special permissions to bypass the retention policy if necessary.

---

### Q41
An administrator attempts to delete a WORM-protected object that is past its retention period but has a legal hold applied. What happens?
- A) The deletion succeeds but a copy is retained in the Objects audit log
- B) The deletion fails because the legal hold must be removed before the object can be deleted
- C) The object is deleted because the retention period has expired
- D) The object is moved to a recycle bin for 30 days before permanent deletion

**Answer: B**
A legal hold overrides the retention period. Even if an object's retention period has expired, it cannot be deleted while a legal hold is active. The legal hold must be explicitly removed before deletion is possible.

---

### Q42
Users report that the Nutanix Objects endpoint is showing an SSL certificate warning in their S3 client applications. The object store was recently deployed. What is the most likely cause?
- A) The Volume Group iSCSI target certificate is invalid
- B) The CVM NTP time is more than 5 minutes ahead of the clients
- C) The Objects endpoint is using a self-signed certificate that is not trusted by the client applications
- D) The FSVM Kerberos ticket has expired

**Answer: C**
Newly deployed Nutanix Objects endpoints use self-signed certificates by default. S3 client applications that validate SSL certificates will show warnings or refuse connections until a trusted CA-signed certificate is installed.

---

### Q43
An administrator replaces the self-signed certificate on the Nutanix Objects endpoint with a CA-signed certificate. After the change, some S3 clients still report certificate errors while others work fine. What should be checked?
- A) Whether the FSVM DNS A records have been updated with the new certificate hash
- B) Whether the iSCSI initiator has re-authenticated with the new certificate
- C) Whether LCM needs to distribute the certificate to all CVMs
- D) Whether the certificate includes a wildcard or SAN entries matching all possible Objects endpoint hostnames

**Answer: D**
Objects endpoints may use multiple hostnames (including bucket-name prefixed hostnames for virtual-hosted style access). The certificate must use wildcard entries or Subject Alternative Names (SANs) to cover all possible endpoint variations.

---

### Q44
After updating the SSL certificate on Nutanix Objects, the administrator notices that the Objects UI in Prism Central shows a certificate mismatch error. What is the most likely issue?
- A) The certificate was applied to the Objects endpoint but Prism Central still references the old certificate
- B) The FSVM minerva_nvm service does not recognize the new certificate format
- C) The Volume Group encryption key conflicts with the new certificate
- D) The LCM inventory needs to be refreshed to detect the new certificate

**Answer: A**
When updating the Objects endpoint certificate, Prism Central may cache or reference the previous certificate. Ensuring that Prism Central trusts the new certificate and that any cached references are updated resolves the mismatch.

---

### Q45
An administrator configures a lifecycle policy on a Nutanix Objects bucket to transition objects to cold storage after 30 days. Objects that are 45 days old have not been transitioned. What is the most likely reason?
- A) The FSVM snapshot schedule is locking the objects from transitioning
- B) Lifecycle policy evaluation runs periodically and there may be a processing delay before the transition takes effect on existing objects
- C) The cold tier requires a separate Nutanix Files server to be configured
- D) The Volume Group flash mode is preventing cold tier transitions

**Answer: B**
Lifecycle policies evaluate all objects in a bucket, including existing objects (retroactive application), but the evaluation runs periodically. There can be a delay between when an object becomes eligible for transition and when the policy evaluation cycle actually processes it. The administrator should verify the policy configuration and wait for the next policy evaluation cycle.

---

### Q46
An administrator sets up a lifecycle policy to expire objects after 90 days. After 90 days, some objects remain in the bucket. What could cause this delay?
- A) The iSCSI session timeout is extending the object's lifecycle
- B) The NCC health check is preventing object deletion during scheduled scans
- C) Lifecycle policy evaluation runs periodically and there may be a processing delay before expiration takes effect
- D) The FSVM replication is creating new copies of the expired objects

**Answer: C**
Lifecycle policy evaluation is not instantaneous. The Objects service processes lifecycle rules periodically, and there can be a delay between when an object becomes eligible for expiration and when it is actually deleted.

---

### Q47
An administrator configures a lifecycle rule to transition objects from standard to cold storage. After the transition, S3 clients report increased latency when accessing transitioned objects. What explains this?
- A) The FSVM CPU utilization spikes during cold storage access
- B) The Volume Group MPIO path has failed over to a passive path
- C) The CVM Stargate service deprioritizes cold storage reads
- D) Objects in cold storage must be recalled to the standard tier before access, introducing additional latency

**Answer: D**
Cold-tier storage is optimized for cost over performance. Accessing objects that have been transitioned to cold storage requires a retrieval process similar to AWS Glacier, which adds latency compared to accessing objects in standard storage.

---

### Q48
An external Linux server cannot discover iSCSI targets on a Nutanix Volume Group. The VG is created and has an iSCSI client configured. What should the administrator verify first?
- A) That the iSCSI target portal IP is correct and the discovery port (3260) is reachable from the Linux server
- B) That the FSVM has a DNS A record for the Linux server
- C) That the Objects IAM user has read permissions on the Volume Group
- D) That the NFS export policy allows the Linux server's IP

**Answer: A**
iSCSI target discovery requires network connectivity to the target portal IP on the correct port (Nutanix uses port 3260 by default for external iSCSI). If the portal IP or port is unreachable, the initiator cannot discover available targets.

---

### Q49
An administrator configures a Windows iSCSI initiator to connect to a Nutanix Volume Group. The connection fails with an authentication error. CHAP is enabled on the VG. What should be checked?
- A) That the SMB signing policy matches between the initiator and the VG
- B) That the CHAP username and secret configured on the Windows initiator match the VG CHAP settings exactly
- C) That the FSVM Kerberos keytab has been imported on the Windows host
- D) That the Objects endpoint certificate is trusted by the Windows host

**Answer: B**
CHAP authentication requires the initiator's CHAP username and secret to match exactly what is configured on the Nutanix Volume Group. Even minor discrepancies in the secret (including whitespace) will cause authentication failures.

---

### Q50
A Linux administrator reports that the iSCSI connection to a Nutanix Volume Group drops during routine CVM maintenance. The host has a single iSCSI session configured. What should be recommended?
- A) Migrate the VG data to a Nutanix Objects bucket for higher availability
- B) Enable SMB multichannel on the iSCSI connection for redundancy
- C) Configure MPIO with multiple iSCSI sessions to provide path redundancy during CVM failovers
- D) Increase the FSVM memory allocation to improve iSCSI stability

**Answer: C**
A single iSCSI session provides no path redundancy. Configuring MPIO with multiple sessions across different data services IPs ensures that if one path fails during CVM maintenance, traffic automatically fails over to another path.

---

### Q51
An administrator discovers that the IQN (iSCSI Qualified Name) on the external host does not match the IQN registered as a client in the Nutanix Volume Group configuration. What is the impact?
- A) The host connects but all I/O operations are read-only
- B) The host connects but performance is limited to 1 Gbps regardless of network speed
- C) The Volume Group data is automatically encrypted with the mismatched IQN
- D) The host is unable to connect to the Volume Group because the IQN serves as the client identifier for authorization

**Answer: D**
The IQN acts as the client identity for Nutanix Volume Groups. If the host's IQN does not match the registered client IQN in the VG configuration, the connection is refused because the host cannot be authorized.

---

### Q52
An administrator configures MPIO on a Windows Server connecting to a Nutanix Volume Group. The host shows two paths but only one is active while the other is in standby. The administrator expected both to be active. What should be checked?
- A) The MPIO load balance policy setting, which may be configured as active/passive instead of round-robin
- B) The FSVM tiering policy that limits the number of active connections
- C) The Objects bucket policy that restricts concurrent iSCSI sessions
- D) The NCC health check that throttles multipath connections to one active path

**Answer: A**
Windows MPIO supports multiple load balance policies. If configured with Failover Only (active/passive), only one path is active. Changing the policy to Round Robin or Least Queue Depth enables active/active with both paths handling I/O.

---

### Q53
After configuring MPIO for a Nutanix Volume Group on a Linux host, the administrator notices that I/O performance has not improved compared to a single path. Both paths show as active. What should be checked?
- A) The Cerebro replication schedule that may be consuming the second path's bandwidth
- B) The multipath policy configuration to ensure it is set to round-robin or least-pending for load distribution
- C) The FSVM CPU utilization to ensure multi-protocol is not consuming resources
- D) The Objects lifecycle policy to verify cold tier is not throttling I/O

**Answer: B**
Even with both paths active, the multipath daemon must be configured with an appropriate I/O distribution policy like round-robin. If the policy is set to failover, only one path handles I/O regardless of path state.

---

### Q54
An administrator needs to troubleshoot iSCSI path failover timing on an external host connected to a Nutanix Volume Group. Users report 30-second I/O pauses during CVM restarts. What should be adjusted?
- A) The Objects WORM grace period to allow faster failover
- B) The CVM Stargate read cache size to buffer I/O during failover
- C) The iSCSI timeout and retry values on the initiator to reduce failover detection time
- D) The FSVM snapshot frequency to reduce I/O contention during failover

**Answer: C**
The iSCSI timeout and retry values on the initiator directly control how long the host waits before declaring a path as failed and switching to an alternate path. Reducing these values shortens the I/O pause during failover.

---

### Q55
An administrator needs to connect an external Windows Server to a Nutanix Volume Group using iSCSI. The initiator is configured but cannot find any targets. What is the correct sequence of steps?
- A) Install the Nutanix Guest Tools agent on the Windows Server, then restart the FSVM
- B) Configure an NFS export on the Volume Group, then mount it from the Windows Server
- C) Create an IAM user in Objects and use the access key to authenticate the iSCSI session
- D) Add the Data Services IP as the target portal in the iSCSI initiator, then perform a target discovery

**Answer: D**
External iSCSI clients connect to Nutanix Volume Groups through the cluster's Data Services IP. The Windows iSCSI initiator must have this IP configured as the target portal to discover and connect to available VG targets.

---

### Q56
A Linux administrator configures the iSCSI initiator using iscsiadm but receives a "no portals found" error during discovery. The Data Services IP is confirmed correct. What should be checked?
- A) That the discovery target address uses the correct port (3260) and network connectivity is verified
- B) That the FSVM has an A record in DNS for the Linux server's hostname
- C) That the Objects bucket allows anonymous access from the Linux server's IP
- D) That the Prism Central license includes iSCSI initiator support for Linux

**Answer: A**
Nutanix uses port 3260 for external iSCSI discovery. If the administrator uses the wrong port or if firewall rules block port 3260, discovery will fail with a "no portals found" error.

---

### Q57
An external host connected to a Nutanix Volume Group via iSCSI alternates between static target configuration and discovery-based configuration. The administrator wants the most resilient approach. Which is recommended?
- A) Use SMB multichannel instead of iSCSI multipath for failover
- B) Use discovery-based targets so the initiator automatically learns all available target portals
- C) Use static targets to avoid DNS dependency for iSCSI resolution
- D) Use NFS mounts instead of iSCSI for external hosts for better resilience

**Answer: B**
Discovery-based targets automatically enumerate all available target portals, allowing the initiator to adapt to changes in the environment. This is more resilient than static targets, which require manual updates when portal IPs change.

---

### Q58
An administrator enables flash mode on a Nutanix Volume Group used by a database application. After enabling it, the administrator notices no significant performance improvement. What should be verified?
- A) That the Objects worker nodes have been restarted after flash mode enablement
- B) That the CVM Curator service has completed an erasure coding pass
- C) That the cluster has sufficient SSD tier capacity and that data has been migrated to the SSD tier
- D) That the FSVM tiering policy is set to "all flash" mode

**Answer: C**
Flash mode prioritizes SSD storage for a Volume Group's data. If the cluster has insufficient SSD capacity or the data has not yet been migrated from HDD to SSD tier, the performance benefit will not be realized immediately.

---

### Q59
An administrator considers enabling compression on a Nutanix Volume Group used for a latency-sensitive transactional database. What should the administrator be aware of?
- A) Compression is only available for Nutanix Files and cannot be applied to Volume Groups
- B) Compression automatically enables WORM protection on the Volume Group
- C) Compression requires a minimum of 5 iSCSI paths per host
- D) Compression can add CPU overhead that increases I/O latency, which may impact latency-sensitive workloads

**Answer: D**
Compression on Volume Groups reduces storage consumption but introduces CPU overhead for compress/decompress operations. For latency-sensitive workloads like transactional databases, this overhead may increase I/O latency beyond acceptable thresholds.

---

### Q60
An administrator evaluates enabling deduplication on a Volume Group that hosts virtual desktop infrastructure (VDI) boot images. What is the expected benefit?
- A) Significant space savings because VDI boot images contain many identical data blocks across desktops
- B) Improved iSCSI connection speed because deduplicated blocks transfer faster
- C) Reduced FSVM memory usage because deduplicated data requires less metadata
- D) Automatic data replication to a secondary Nutanix Objects bucket

**Answer: A**
VDI workloads are excellent candidates for deduplication because multiple virtual desktop boot images share many identical blocks. Deduplication detects and eliminates these redundant blocks, resulting in significant storage savings.

---

### Q61
An administrator notices that a Volume Group with both compression and deduplication enabled is experiencing higher-than-expected latency. What is the recommended action for a performance-critical workload?
- A) Configure WORM on the Volume Group to prevent write amplification
- B) Evaluate disabling compression or deduplication to reduce CPU overhead and lower latency
- C) Enable flash mode on the FSVM to accelerate the Volume Group I/O
- D) Increase the Objects worker node count to offload VG processing

**Answer: B**
Both compression and deduplication consume CPU resources. When combined on a performance-critical workload, the cumulative overhead can increase latency. Selectively disabling one or both features for that VG may be necessary to meet latency requirements.

---

### Q62
A Nutanix cluster upgrade initiated through LCM (Life Cycle Manager) fails at the pre-upgrade check stage. The error references an NCC health check failure. What should the administrator do first?
- A) Manually upgrade each CVM individually bypassing LCM
- B) Disable the NCC health checks and proceed with the upgrade
- C) Run a full NCC health check to identify and resolve the specific failing check before retrying the upgrade
- D) Restart the LCM service and immediately retry the upgrade

**Answer: C**
LCM relies on NCC health checks to validate the cluster is in a healthy state before proceeding. Running a full NCC check identifies the specific failure, which must be resolved before the upgrade can proceed safely.

---

### Q63
During a one-click AOS upgrade, the process stalls at 30% completion. The administrator sees that one CVM has not restarted after the upgrade. What is the recommended troubleshooting step?
- A) Force a power cycle of all CVMs simultaneously to restart the upgrade
- B) Revert the entire cluster to the previous AOS version
- C) Delete the stalled CVM and create a new one from the Prism template
- D) Check the CVM services status and upgrade logs on the stalled CVM via SSH

**Answer: D**
One-click upgrades proceed CVM by CVM. If one CVM stalls, SSH into it and check the services status and upgrade logs to identify what prevented the restart. This allows targeted remediation without affecting the rest of the cluster.

---

### Q64
An administrator attempts to update Nutanix Files through LCM but the update does not appear in the LCM inventory. What should be done?
- A) Perform an LCM inventory refresh to check for available updates and verify internet connectivity or dark site bundle availability
- B) Reinstall the Files server from scratch to get the latest version
- C) Update the Objects store first, which will trigger a Files update
- D) Restart all FSVMs to force LCM to detect the current version

**Answer: A**
LCM requires an inventory refresh to detect available updates. If the update still does not appear, the administrator should verify that the cluster has internet connectivity to the Nutanix portal or that the correct dark site bundle has been uploaded.

---

### Q65
An administrator runs an NCC health check and receives a WARN status for the "CVM Services Status" check. Several services show as "DOWN." What is the most appropriate response?
- A) Contact the Objects MSP team to restart the CVM services
- B) Identify which specific services are down and attempt to restart them using the genesis restart command
- C) Immediately shut down the cluster to prevent data corruption
- D) Ignore the warning since WARN is not critical

**Answer: B**
NCC WARN for CVM services indicates one or more services are not running. The administrator should identify the specific services and attempt to restart them using the appropriate cluster commands (e.g., genesis restart). Persistent failures require further investigation.

---

### Q66
An administrator receives an NCC FAIL for the "Disk Health" check on one node. The cluster is currently running with RF2 data protection. What is the immediate risk and recommended action?
- A) The FSVM on that node will automatically migrate to another node
- B) The Objects worker pods will rebalance to avoid the failed disk
- C) The cluster's fault tolerance is reduced; replace the failed disk promptly and verify data resiliency with NCC
- D) There is no risk because RF2 provides triple redundancy

**Answer: C**
With RF2 and a failed disk, the cluster has reduced fault tolerance for the data replicas that were on that disk. While Nutanix automatically re-replicates the data, the failed disk should be replaced promptly to restore full redundancy.

---

### Q67
An NCC check reports a time synchronization failure across multiple CVMs. What is the potential impact on Nutanix services?
- A) Only the Objects lifecycle policy timing is affected
- B) Only the FSVM snapshot schedule will be off by a few seconds
- C) Only the LCM upgrade scheduler will use incorrect timestamps
- D) Kerberos authentication, certificate validation, and replication may fail due to clock skew between components

**Answer: D**
Time synchronization is critical for many Nutanix services. Kerberos authentication (used by Files), SSL/TLS certificate validation, snapshot schedules, and replication all depend on synchronized clocks. Significant clock skew causes authentication and operational failures.

---

### Q68
An administrator needs to verify network connectivity between an FSVM and client machines. What is the recommended approach?
- A) Use SSH to the CVM and run ping/traceroute commands targeting the FSVM client network from the client subnet
- B) Use the Objects MSP kubectl tool to trace the network path
- C) Check the Volume Group iSCSI session log for connectivity details
- D) Review the LCM upgrade log for network diagnostic information

**Answer: A**
Network troubleshooting for FSVMs is performed from the CVM using standard tools like ping and traceroute. The administrator should verify connectivity from the client perspective and from the CVM to the FSVM client network interfaces.

---

### Q69
After a network switch replacement, Nutanix Files clients report intermittent connectivity. The FSVMs are healthy. DNS is resolving correctly. What should the administrator check next?
- A) The LCM dark site bundle compatibility
- B) VLAN tagging, network switch port configuration, and MTU settings matching the FSVM client network requirements
- C) The Objects endpoint SSL certificate validity
- D) The Volume Group CHAP authentication status

**Answer: B**
After a network infrastructure change, the most common issues are VLAN tagging, port configuration, and MTU mismatches. The new switch ports must be configured identically to the previous ones for the FSVM client and storage networks.

---

### Q70
An administrator needs to verify that DNS and NTP are properly configured for a Nutanix Files deployment. Which commands should be executed from the CVM?
- A) ncli volume-group check-dns and ncli volume-group check-ntp
- B) afs dns.verify and afs ntp.verify from the FSVM console
- C) nslookup to verify DNS resolution and ntpq -p to check NTP synchronization status
- D) kubectl get dns and kubectl get ntp to check MSP service status

**Answer: C**
Standard Linux diagnostic tools like nslookup (or dig) and ntpq are used from the CVM to verify DNS resolution and NTP synchronization. These are foundational services that must be functioning correctly for Nutanix Files to operate properly.

---

### Q71
An administrator needs to collect logs from a Nutanix cluster for a support case. Which tool is the recommended method for log collection?
- A) The Windows Event Viewer on each FSVM
- B) The Objects MSP Kubernetes dashboard log viewer
- C) The Prism Element alert dashboard export to CSV
- D) Logbay, accessed from the CVM command line, to collect and bundle logs from all cluster components

**Answer: D**
Logbay is the Nutanix-recommended log collection utility. It runs from the CVM and can collect logs from all cluster components including CVMs, FSVMs, and hypervisors, bundling them for upload to the Nutanix support portal.

---

### Q72
An administrator runs logbay to collect logs but the resulting bundle is too large to upload to the Nutanix support portal. What approach should be taken?
- A) Use logbay with time-range and component filters to create a smaller, focused log bundle
- B) Split the bundle manually using a ZIP utility and upload each part
- C) Delete old logs from the CVMs first and then rerun logbay
- D) Upload the logs to a Nutanix Objects bucket instead of the support portal

**Answer: A**
Logbay supports filtering by time range and specific components. Narrowing the collection to the relevant timeframe and affected components produces a smaller, more targeted bundle that is easier to upload and more useful for troubleshooting.

---

### Q73
An administrator wants to collect logs specifically for a Nutanix Files issue. Which logbay option should be used?
- A) Run kubectl logs on the FSVM pods to extract file service logs
- B) Use the logbay component filter to specify Nutanix Files (minerva) components
- C) Use the NCC Files health check with the --export-logs flag
- D) SSH to each FSVM individually and manually copy the log files

**Answer: B**
Logbay supports component-specific log collection. By specifying the Nutanix Files (minerva) component, the administrator collects only the relevant FSVM logs, reducing bundle size and focusing on the file service issue.

---

### Q74
After collecting logs with logbay and uploading to the support portal, the support engineer requests additional NCC output. What is the most efficient way to provide this?
- A) Re-run logbay with the --include-ncc flag, which adds NCC output to the log bundle
- B) Export the Prism Central alert history as a JSON file
- C) Run ncc log_collector run_all to generate and bundle comprehensive NCC output for upload
- D) Screenshot the NCC results in Prism and email them to support

**Answer: C**
The `ncc log_collector run_all` command generates a comprehensive bundled output that includes health check results and diagnostic data, which can be uploaded to the support portal. This provides the support engineer with structured diagnostic data alongside the log collection.

---

### Q75
An administrator notices that a Nutanix Files server has been experiencing degraded performance after a recent AOS upgrade. NCC checks pass, but FSVM latency metrics are elevated. What should be investigated?
- A) Whether the Objects lifecycle policies need to be reconfigured for the new AOS version
- B) Whether the Volume Group flash mode was disabled during the AOS upgrade
- C) Whether the iSCSI CHAP secrets were rotated as part of the AOS upgrade
- D) Whether the Files version is compatible with the new AOS version and if a Files upgrade is also required

**Answer: D**
After an AOS upgrade, Nutanix Files may require a corresponding upgrade to maintain compatibility. Version mismatches between AOS and Files can cause degraded performance or unexpected behavior. Checking the compatibility matrix is essential.

---

### Q76
An administrator receives alerts about high latency on a Nutanix Files share used by a video editing team. The FSVMs have adequate CPU and memory. NCC checks pass. What should be investigated next?
- A) Storage tier utilization and whether hot data has spilled to the HDD capacity tier due to SSD tier exhaustion
- B) The Objects bucket replication status to verify cross-site sync is not consuming bandwidth
- C) The Volume Group path failover count to check for iSCSI instability
- D) The Prism Central license tier to verify performance features are enabled

**Answer: A**
When FSVM resources are adequate and NCC passes, the bottleneck may be at the storage tier level. If SSD capacity is exhausted, hot data spills to the HDD tier, significantly increasing latency for I/O-intensive workloads like video editing.

---

### Q77
A newly deployed Nutanix Objects store is showing "Service Unavailable" when clients attempt to access the S3 endpoint. The MSP cluster was deployed successfully. What should the administrator check first?
- A) That the NCC disk health check has completed on all nodes
- B) That all required MSP pods (including the envoy load balancer and S3 adapter pods) are running and healthy
- C) That the FSVM minerva_nvm service has started on all nodes
- D) That the Volume Group Data Services IP is configured on the Objects network

**Answer: B**
A "Service Unavailable" response typically indicates that the S3-facing pods in the MSP cluster are not running correctly. The envoy load balancer and S3 adapter pods are critical components that must be healthy for the endpoint to serve requests.

---

### Q78
An administrator is troubleshooting Nutanix Objects and needs to view logs from a specific MSP pod. Which command should be used?
- A) ncli volume-group get-logs for the pod name
- B) logbay --component=msp-pod --name=<pod-name> from the CVM
- C) kubectl logs <pod-name> -n <namespace> from the MSP management context
- D) afs info.get_logs <pod-name> from the FSVM

**Answer: C**
Since Nutanix Objects runs on the Kubernetes-based MSP platform, standard kubectl commands are used to view pod logs. The `kubectl logs` command with the appropriate pod name and namespace retrieves the container-level logs for diagnosis.

---

### Q79
An administrator configures a Nutanix Volume Group for an external Oracle database server. After initial configuration, the database reports I/O errors during heavy write workloads. The iSCSI connection is stable. What should be investigated?
- A) The FSVM smart tiering policy that may be interfering with Volume Group writes
- B) The Objects WORM retention policy that may be locking database blocks
- C) The MSP pod resource limits that may be throttling Volume Group I/O
- D) The Volume Group's storage container configuration, including replication factor and erasure coding overhead impacting write performance

**Answer: D**
I/O errors during heavy writes on a Volume Group can be caused by the underlying storage container configuration. High erasure coding overhead, combined with the replication factor, may exceed the available write throughput. Evaluating the container settings and potentially using RF2 instead of EC is recommended.

---

### Q80
An administrator has been troubleshooting a complex Nutanix Files issue involving multi-protocol access, intermittent FSVM health failures, and slow NFS performance. After exhausting local diagnostics, what is the recommended escalation approach?
- A) Collect a logbay bundle including minerva logs, NCC output, and FSVM configuration, then upload to the Nutanix support portal with a detailed case description
- B) Restart all FSVMs simultaneously and monitor if the issue reoccurs
- C) Delete and redeploy the file server from the latest LCM bundle
- D) Switch all clients to Objects S3 access to bypass the Files issues

**Answer: A**
For complex multi-symptom issues, the proper escalation is to collect comprehensive diagnostics (logbay bundle with minerva components, NCC output, and FSVM configuration details), then open a support case with a detailed description. This gives the Nutanix support team the data needed for root cause analysis.

---

*End of NCP-US 6.10 Domain 4: Troubleshoot — 80 Questions*
