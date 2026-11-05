# NCP-US 6.10 – Domain 3: Analyze and Monitor

## Practice Exam Questions (80 Questions)

---

### Q1
An administrator is reviewing the File Analytics dashboard and notices a spike in write operations from a single user account across multiple shares. What should the administrator investigate first?

- A) Verify the Volume Group iSCSI session count
- B) Check the ransomware detection alerts for entropy-based anomalies
- C) Review the Data Lens compliance scan results
- D) Examine the Objects lifecycle policy execution log

**Answer: B**
File Analytics provides ransomware detection using entropy-based analysis. A spike in write operations from a single user across multiple shares is a classic indicator of potential ransomware activity, and the administrator should check ransomware alerts first.

---

### Q2
A Nutanix administrator is planning to deploy File Analytics for a Nutanix Files cluster. Which statement accurately describes a deployment requirement?

- A) File Analytics must be deployed on Prism Central and supports multiple Files instances simultaneously
- B) File Analytics is a SaaS service activated through the Nutanix Cloud Portal
- C) File Analytics is deployed as a container on the Files cluster VMs
- D) File Analytics is deployed as a separate VM and managed through Prism Element

**Answer: D**
File Analytics is deployed as a dedicated, separate VM that is managed through Prism Element. Each File Analytics VM connects to a single Nutanix Files instance.

---

### Q3
An organization has three separate Nutanix Files instances across different clusters. The storage team wants to deploy File Analytics for all of them. How many File Analytics VMs are required?

- A) Two File Analytics VMs — one for production and one shared for the remaining two
- B) Three File Analytics VMs — one per Files instance
- C) One File Analytics VM deployed on any cluster with network access to all three
- D) One File Analytics VM deployed on Prism Central to monitor all three

**Answer: B**
Each File Analytics VM connects to exactly one Nutanix Files instance. Therefore, three separate Files instances require three individual File Analytics VMs.

---

### Q4
An administrator attempts to deploy File Analytics but receives an error that the deployment cannot proceed. Which prerequisite is the administrator most likely missing?

- A) Prism Central must be registered and the Files instance must be managed from Prism Central
- B) Prism Element must be accessible and the Files instance must be running on the same cluster
- C) Data Lens must be activated before File Analytics can be deployed on-premises
- D) The Objects store must be configured to provide the analytics metadata repository

**Answer: B**
File Analytics deployment is performed through Prism Element, and the Files instance must be running on the same cluster where the File Analytics VM will be deployed. Prism Central registration is not a prerequisite for File Analytics deployment.

---

### Q5
An administrator opens the File Analytics dashboard and wants to quickly identify which users are consuming the most storage. Which dashboard widget provides this information?

- A) Capacity Trending Forecast
- B) Anomaly Detection Summary
- C) Top Contributors
- D) Audit Trail History

**Answer: C**
The Top Contributors widget on the File Analytics dashboard displays the users who are consuming the most storage or performing the most file operations, enabling quick identification of heavy storage consumers.

---

### Q6
A storage administrator needs to determine the breakdown of data stored on a Nutanix Files share by file type. Where in File Analytics can this information be found?

- A) The ransomware detection panel listing file entropy by extension
- B) The Data Lens classification report for the Files share
- C) The audit trail detail view filtered by file extension
- D) The file distribution dashboard showing distribution by type, size, and age

**Answer: D**
The File Analytics dashboard includes a file distribution view that categorizes data by type, size, and age. This provides a visual breakdown of what kinds of files are stored on each share.

---

### Q7
An IT manager asks the storage team to provide a report showing how storage consumption on Nutanix Files shares has changed over the last 90 days, including a forecast. Which File Analytics feature should the team use?

- A) Capacity trending with growth rate analysis and prediction
- B) File distribution by age showing files older than 90 days
- C) Anomaly detection timeline with a 90-day lookback window
- D) Audit trail export filtered to the last 90 days

**Answer: A**
File Analytics provides capacity trending that includes growth rate analysis and predictive forecasting for Files shares. This feature can show historical consumption and project future growth.

---

### Q8
A compliance officer needs to know every action a specific user performed on a particular SMB share over the last 30 days, including file reads and permission changes. Which File Analytics capability provides this level of detail?

- A) Top Contributors filtered by username and share name
- B) Anomaly detection alert log for the specified user
- C) Audit trail tracking per user per share
- D) Data Lens permission scanning for the target share

**Answer: C**
File Analytics audit trails track create, read, write, delete, and permission change operations per user per share, providing the detailed activity history the compliance officer needs.

---

### Q9
An administrator is reviewing audit trails in File Analytics and wants to identify all files that had their access permissions modified last week. Which operation type should the administrator filter on?

- A) Metadata read operations
- B) Write operations
- C) Delete operations
- D) Permission change operations

**Answer: D**
File Analytics audit trails specifically track permission change operations as a distinct operation type alongside create, read, write, and delete. Filtering on permission changes will show exactly the files that had access modifications.

---

### Q10
A security team receives an alert from File Analytics indicating that a user account has renamed hundreds of files with unusual extensions in a short time period. Which File Analytics detection mechanism most likely triggered this alert?

- A) Audit trail anomaly from excessive read operations
- B) File distribution deviation from baseline type ratios
- C) Capacity trending threshold breach
- D) Ransomware detection using entropy-based analysis

**Answer: D**
File Analytics ransomware detection uses entropy-based analysis to identify suspicious file modification patterns. Mass renaming of files with unusual extensions is a strong ransomware indicator that triggers this detection mechanism.

---

### Q11
An administrator wants to proactively block known ransomware file extensions on Nutanix Files. Which File Analytics feature supports this?

- A) Configurable blocklist of file extensions
- B) Data Lens behavioral analysis with extension filtering
- C) Audit trail alerts configured per file extension
- D) Anomaly detection with automatic quarantine policies

**Answer: A**
File Analytics provides a configurable blocklist of file extensions as part of its ransomware protection. Administrators can add known ransomware extensions to this blocklist to proactively detect and alert on these file types.

---

### Q12
A Nutanix administrator configures ransomware detection in File Analytics and wants to receive notifications when suspicious activity is detected. Where are these alerts surfaced?

- A) Only in the File Analytics dashboard under the Anomaly tab
- B) In Prism alerts and the File Analytics dashboard
- C) Exclusively through email notifications configured in Data Lens
- D) In the Objects store event log linked to the Files metadata

**Answer: B**
Ransomware detection alerts from File Analytics are surfaced in Prism alerts as well as within the File Analytics dashboard, ensuring administrators can be notified through the standard Nutanix alerting framework.

---

### Q13
An administrator notices that the File Analytics ransomware detection has generated a false positive for a legitimate batch processing application that creates high-entropy compressed files. What is the best corrective action?

- A) Increase the entropy analysis threshold and adjust the anomaly detection configuration
- B) Disable ransomware detection entirely until the batch job completes
- C) Update the blocklist to exclude the file extensions used by the application
- D) Migrate the batch application data to an Objects bucket to bypass file-level monitoring

**Answer: A**
When legitimate applications generate high-entropy files, the administrator should adjust the entropy analysis threshold and anomaly detection configuration to reduce false positives while maintaining protection, rather than disabling detection entirely.

---

### Q14
A storage administrator reviews File Analytics capacity trending and sees that a particular share is growing at 15% per month. The share currently uses 8 TB of its 20 TB allocation. Approximately when will the share reach capacity based on this trend?

- A) In about 8 months
- B) In about 12 months
- C) In about 4 months
- D) In about 6 months

**Answer: D**
At 15% monthly compound growth starting from 8 TB, the share would approach 20 TB in roughly 6 months (8 → 9.2 → 10.6 → 12.2 → 14.0 → 16.1 → 18.5 TB). Capacity trending in File Analytics provides this type of predictive analysis.

---

### Q15
An administrator wants to compare file age distribution across two different Nutanix Files shares to identify stale data candidates. Which File Analytics dashboard capability supports this?

- A) File distribution analysis by age per share
- B) Data Lens stale data classification scan
- C) Capacity trending differential analysis
- D) Audit trail cross-share comparison report

**Answer: A**
File Analytics provides file distribution analysis that can show data categorized by age on a per-share basis. The administrator can review the age distribution for each share to identify where stale data resides.

---

### Q16
A company recently experienced a ransomware incident and wants to review which files were affected. An administrator opens File Analytics and needs to trace all file modifications made by the compromised account during the attack window. Which feature combination provides the most complete picture?

- A) Ransomware detection alerts combined with the audit trail for the compromised user
- B) Top Contributors widget combined with capacity trending for the affected shares
- C) File distribution by type combined with anomaly detection summary
- D) Data Lens compliance scan combined with permission scanning results

**Answer: A**
The ransomware detection alerts identify the scope of suspicious activity, while the audit trail provides a detailed, per-user, per-share record of every create, read, write, delete, and permission change operation during the attack window.

---

### Q17
An administrator deploys File Analytics and notices that historical data prior to deployment is not visible in the audit trail. Why is this expected behavior?

- A) File Analytics requires a Data Lens connection to import historical audit records
- B) File Analytics only collects audit data from the moment of deployment forward
- C) Historical audit data requires a separate license activation in Prism Element
- D) The audit trail backfill process runs for 72 hours before historical data appears

**Answer: B**
File Analytics begins collecting audit trail data from the point of deployment. It does not retroactively capture historical file operations that occurred before the File Analytics VM was deployed and connected to the Files instance.

---

### Q18
A Nutanix Files administrator notices that File Analytics is showing high latency in its dashboard updates. Which action is most appropriate to investigate?

- A) Increase the Objects store replication factor for the analytics metadata
- B) Redeploy the Data Lens connector to improve data pipeline throughput
- C) Check the File Analytics VM resource allocation for CPU and memory constraints
- D) Restart the Prism Central service to reset the analytics connection

**Answer: C**
Since File Analytics runs as a separate VM, performance issues such as dashboard latency are often related to the VM's resource allocation. Checking CPU and memory usage on the File Analytics VM is the appropriate first step.

---

### Q19
An administrator is configuring File Analytics for a new Nutanix Files deployment. During setup, the wizard asks for credentials. What are these credentials used for?

- A) Connecting the File Analytics VM to the Nutanix Files instance for data collection
- B) Registering the File Analytics VM with Data Lens for cloud-based reporting
- C) Enabling CHAP authentication between File Analytics and the Volume Group
- D) Authenticating the File Analytics VM to the Objects store for metadata backup

**Answer: A**
During File Analytics deployment, the credentials provided are used to authenticate and connect the File Analytics VM to the specific Nutanix Files instance it will monitor for data collection and audit trail recording.

---

### Q20
A company wants to perform file analytics on a Nutanix Files cluster but has a strict policy against deploying additional VMs on the cluster. Which alternative can they consider?

- A) Enable built-in analytics within the Nutanix Files configuration without a separate VM
- B) Use Data Lens as a SaaS-based alternative that does not require an on-premises VM
- C) Deploy File Analytics on Prism Central to share resources with existing management services
- D) Use the Objects monitoring dashboard as a substitute for File Analytics

**Answer: B**
Data Lens is the SaaS (cloud-based) alternative to File Analytics. While File Analytics requires a dedicated on-premises VM, Data Lens provides analytics capabilities from the cloud without requiring additional on-premises VM resources.

---

### Q21
A storage team needs visibility into file operations across Nutanix Files clusters in multiple data centers from a single interface. Which Nutanix solution provides this capability?

- A) Objects Browser with cross-site analytics integration
- B) File Analytics with cross-cluster federation enabled
- C) Prism Central with Files Manager multi-site view
- D) Data Lens with multi-cluster visibility

**Answer: D**
Data Lens is a SaaS-based solution that provides multi-cluster visibility, allowing administrators to monitor and analyze file operations across multiple Nutanix Files clusters and data centers from a single cloud-based interface.

---

### Q22
An administrator is comparing Data Lens and File Analytics to determine which solution to deploy. Which statement accurately describes a key difference?

- A) Data Lens is a SaaS (cloud-based) service while File Analytics is an on-premises VM
- B) Both solutions are deployed identically but Data Lens adds Objects monitoring
- C) Data Lens is deployed as an on-premises VM while File Analytics is cloud-based
- D) File Analytics is a SaaS solution while Data Lens requires an on-premises VM

**Answer: A**
The key architectural difference is that Data Lens is a cloud-based SaaS service managed through the Nutanix Cloud Portal, while File Analytics is deployed as a dedicated on-premises VM managed through Prism Element.

---

### Q23
A compliance team requires automated detection of personally identifiable information (PII) stored on Nutanix Files shares. Which Nutanix solution provides data classification with PII detection?

- A) Data Lens with data classification and PII detection
- B) Prism Central with compliance policy enforcement
- C) Objects lifecycle policies with content-aware tiering
- D) File Analytics with audit trail keyword scanning

**Answer: A**
Data Lens includes data classification capabilities with PII detection, sensitive data tagging, and custom regex patterns. This enables automated identification of personally identifiable information stored on Nutanix Files shares.

---

### Q24
An organization needs to identify shares on Nutanix Files that have overly permissive access settings, potentially exposing sensitive data. Which Data Lens feature addresses this requirement?

- A) Ransomware behavioral analysis
- B) Capacity trending and growth prediction
- C) Permissions scanning for open shares and excessive permissions
- D) Audit trail export with access control filtering

**Answer: C**
Data Lens permissions scanning identifies open shares, excessive permissions, and stale data. This feature helps organizations discover and remediate overly permissive access settings that could expose sensitive data.

---

### Q25
A security auditor asks the Nutanix team to identify all shares that contain files matching a specific custom data pattern, such as internal project codes in a particular format. Which Data Lens capability should be used?

- A) File distribution analysis filtered by file naming convention
- B) Anomaly detection with custom pattern matching
- C) Data classification with custom regex patterns
- D) Audit trail search with regular expression filters

**Answer: C**
Data Lens data classification supports custom regex patterns in addition to built-in PII detection. Administrators can define custom patterns to identify and tag files containing specific data formats like internal project codes.

---

### Q26
A Nutanix administrator wants to use Data Lens to detect potential ransomware attacks across the organization's Files environment. How does Data Lens approach ransomware protection differently than File Analytics?

- A) Data Lens quarantines files automatically while File Analytics only generates alerts
- B) Data Lens scans files with antivirus signatures while File Analytics monitors access patterns
- C) Data Lens uses file extension blocklists exclusively while File Analytics uses entropy analysis
- D) Data Lens provides behavioral analysis with anomaly scoring while File Analytics uses entropy-based analysis

**Answer: D**
Data Lens provides ransomware protection through behavioral analysis and anomaly scoring with automatic alerting, while File Analytics uses entropy-based analysis. Both detect ransomware but employ different analytical approaches.

---

### Q27
An administrator has Data Lens enabled and receives an anomaly score alert for a user account. What does a high anomaly score in Data Lens indicate?

- A) The user's file access behavior deviates significantly from their established baseline
- B) The user's CHAP authentication has failed multiple times
- C) The user has accessed Objects buckets without proper IAM credentials
- D) The user has exceeded their storage quota on multiple shares

**Answer: A**
Data Lens anomaly scoring measures how much a user's current behavior deviates from their established baseline patterns. A high anomaly score indicates significant behavioral deviation, which could indicate compromised credentials or insider threats.

---

### Q28
A multinational company needs to scan Nutanix Files data for compliance with data privacy regulations, including tagging files that contain sensitive personal data. Which Data Lens feature set addresses this?

- A) Audit trail with compliance export and regulatory tagging
- B) Data classification with sensitive data tagging and compliance scanning
- C) Permissions scanning with regulatory access control templates
- D) Capacity trending with compliance-based retention forecasting

**Answer: B**
Data Lens provides data classification with sensitive data tagging and compliance scanning capabilities. These features enable organizations to automatically identify, classify, and tag files containing sensitive data for regulatory compliance.

---

### Q29
An administrator notices that Data Lens identifies several "stale data" items across multiple shares. What does Data Lens classify as stale data?

- A) Files that have been moved between shares more than three times
- B) Files that have been flagged by ransomware detection as potentially encrypted
- C) Files that have not been accessed or modified for an extended period
- D) Files that exceed the maximum size threshold configured in the share policy

**Answer: C**
Data Lens permissions scanning identifies stale data as files that have not been accessed or modified for an extended period. Identifying stale data helps organizations reclaim storage and reduce the attack surface.

---

### Q30
An organization uses both File Analytics and Data Lens. An administrator wants to understand when to use each tool. Which statement best describes the appropriate use case for each?

- A) File Analytics for Objects monitoring and Data Lens for Files monitoring
- B) File Analytics for ransomware detection only and Data Lens for all other analytics tasks
- C) File Analytics for multi-cluster views and Data Lens for single-cluster deep dives
- D) File Analytics for detailed on-prem auditing of a single Files instance and Data Lens for multi-cluster SaaS-based visibility and classification

**Answer: D**
File Analytics is best suited for detailed, on-premises auditing of a single Files instance with deep audit trails, while Data Lens provides SaaS-based multi-cluster visibility, data classification, compliance scanning, and permissions analysis across the organization.

---

### Q31
A Data Lens administrator wants to configure automatic alerts when ransomware-like behavior is detected. Which Data Lens mechanism provides this capability?

- A) Anomaly scoring with automatic alerting based on behavioral analysis
- B) File extension blocklist violation notifications
- C) Audit trail anomaly triggers based on operation count thresholds
- D) Capacity threshold alerts configured per share

**Answer: A**
Data Lens provides ransomware protection through behavioral analysis with anomaly scoring and automatic alerting. When user behavior matches ransomware patterns, Data Lens automatically generates alerts based on the anomaly scoring system.

---

### Q32
An administrator configures Data Lens permissions scanning and discovers that several shares have "Everyone" access with full control. What is the recommended next step based on Data Lens findings?

- A) Enable ransomware detection to monitor the open shares more aggressively
- B) Remediate excessive permissions by restricting access to authorized groups only
- C) Move the affected shares to an Objects bucket for better access control
- D) Deploy additional File Analytics VMs to increase audit coverage on the open shares

**Answer: B**
When Data Lens permissions scanning identifies shares with excessive permissions such as "Everyone" with full control, the recommended action is to remediate by restricting access to only authorized groups, reducing the security risk and attack surface.

---

### Q33
An administrator accesses the Objects dashboard in Prism Central and wants to review the performance of a specific S3-compatible bucket. Which metrics are available on the Objects dashboard?

- A) Data classification results, PII detection count, and compliance scan status
- B) File distribution by type, user audit trails, and anomaly detection scores
- C) Bucket statistics, throughput, latency, and IOPS per bucket
- D) Volume Group IOPS, iSCSI session count, and CHAP authentication status

**Answer: C**
The Objects dashboard in Prism Central provides bucket-level metrics including bucket statistics, throughput, latency, and IOPS per bucket, enabling administrators to monitor the performance of individual S3-compatible buckets.

---

### Q34
A developer reports that S3 PUT operations to a Nutanix Objects bucket are experiencing higher than normal latency. Which Objects performance metric should the administrator check first?

- A) iSCSI session latency in the Volume Group monitor
- B) File Analytics write operation latency for the connected share
- C) GET latency per bucket in the Objects dashboard
- D) PUT latency per bucket in the Objects dashboard

**Answer: D**
The Objects dashboard provides specific GET and PUT latency metrics per bucket. Since the developer is reporting slow PUT operations, the administrator should check the PUT latency metric in the Objects dashboard to confirm and investigate the issue.

---

### Q35
An administrator receives an alert that a Nutanix Objects store is approaching its capacity threshold. Which monitoring feature provided this alert?

- A) Objects alerts for capacity thresholds configured in Prism Central
- B) Data Lens storage consumption anomaly detection
- C) Volume Group storage utilization alert from the iSCSI monitor
- D) File Analytics capacity trending alert for the Objects metadata share

**Answer: A**
Nutanix Objects provides configurable alerts in Prism Central for capacity thresholds, performance degradation, and node health. The capacity threshold alert notifies administrators when the object store approaches its configured storage limit.

---

### Q36
A Nutanix administrator needs to track how a specific Objects lifecycle policy is performing, including whether objects are being transitioned and deleted as expected. Which Objects feature provides this visibility?

- A) File Analytics audit trail filtered to Objects operations
- B) Objects lifecycle monitoring with policy execution tracking
- C) Data Lens compliance scan for Objects data retention
- D) Prism Central task list filtered by Objects background jobs

**Answer: B**
Objects lifecycle monitoring includes policy execution tracking, transition status, and deletion queue monitoring. This allows administrators to verify that lifecycle policies are executing correctly and objects are being transitioned or deleted on schedule.

---

### Q37
An administrator notices that objects configured for deletion by a lifecycle policy are accumulating in the deletion queue rather than being removed. What should the administrator check in the Objects monitoring?

- A) The Data Lens data classification tags that may mark objects as retention-required
- B) The Objects bucket versioning setting that may be preventing permanent deletion
- C) The lifecycle policy deletion queue status and any associated error alerts
- D) The File Analytics ransomware blocklist that may be protecting the files

**Answer: C**
Objects lifecycle monitoring includes deletion queue tracking. When objects accumulate instead of being deleted, the administrator should check the deletion queue status and associated alerts to identify any errors or bottlenecks in policy execution.

---

### Q38
A storage administrator needs to determine how much capacity each individual bucket is consuming in a Nutanix Objects store. Which monitoring approach provides this data?

- A) Data Lens storage classification grouped by object store target
- B) Prism Element storage pool utilization filtered by Objects containers
- C) File Analytics file distribution report filtered by bucket name
- D) Per-bucket usage metrics in the Objects capacity management dashboard

**Answer: D**
Objects capacity management in Prism Central provides per-bucket usage metrics, total store utilization, and growth trending. This allows administrators to see individual bucket consumption within the object store.

---

### Q39
An administrator is planning capacity for a Nutanix Objects store that is experiencing 20% monthly growth. Which Objects monitoring feature helps predict when additional capacity will be needed?

- A) Objects capacity management with growth trending
- B) Data Lens growth anomaly detection for Objects stores
- C) Prism Central runway analysis for Volume Groups backing the Objects store
- D) File Analytics capacity trending applied to the Objects metadata share

**Answer: A**
Objects capacity management includes growth trending capabilities that analyze historical consumption patterns and project future capacity needs, helping administrators plan expansion before the store reaches its limits.

---

### Q40
An administrator wants to set up proactive monitoring for a Nutanix Objects store to be alerted when performance drops below acceptable levels. Which Objects alerting capability should be configured?

- A) File Analytics anomaly detection with custom performance thresholds
- B) Objects alerts for performance degradation in Prism Central
- C) Data Lens behavioral analysis alerts for Objects access patterns
- D) Volume Group performance alerts applied to Objects backend storage

**Answer: B**
Objects alerts in Prism Central can be configured for performance degradation, capacity thresholds, and node health. Configuring performance degradation alerts enables proactive notification when Objects store performance drops below acceptable levels.

---

### Q41
An administrator reviews the Objects dashboard and sees a significant spike in GET operations per second on a specific bucket. What additional metric should be reviewed to assess impact on the bucket's performance?

- A) The bucket's file age distribution and stale data percentage
- B) The bucket's audit trail in File Analytics
- C) The bucket's GET latency and data transfer rate
- D) The bucket's iSCSI session count and initiator connections

**Answer: C**
When GET operations per second spike, the administrator should check the corresponding GET latency and data transfer rate to assess whether the increased operations are causing performance degradation for that bucket.

---

### Q42
A Nutanix Objects store has multiple buckets. An administrator needs to determine which bucket is responsible for the highest throughput on the cluster. Where is this information found?

- A) File Analytics top contributors view grouped by Objects bucket
- B) Data Lens multi-cluster dashboard with Objects throughput overlay
- C) Prism Element storage container performance view
- D) Objects dashboard in Prism Central showing throughput per bucket

**Answer: D**
The Objects dashboard in Prism Central displays throughput metrics on a per-bucket basis, allowing administrators to identify which bucket is generating the most throughput on the Objects store.

---

### Q43
An administrator receives an Objects alert about node health degradation in the Objects store. What does this alert typically indicate?

- A) One or more nodes in the Objects store cluster are experiencing issues
- B) The iSCSI path to the Objects backend Volume Group has failed
- C) The Data Lens connection to the Objects store has timed out
- D) A Files VM hosting Objects metadata has run out of memory

**Answer: A**
Objects alerts for node health indicate that one or more nodes participating in the Objects store infrastructure are experiencing issues such as high resource utilization, connectivity problems, or hardware faults.

---

### Q44
An administrator needs to verify that a recently created Objects lifecycle policy that transitions objects to a lower storage tier after 90 days is working correctly. Which metric should be monitored?

- A) Objects file distribution showing age of objects in each tier
- B) Objects lifecycle transition status in the lifecycle monitoring dashboard
- C) File Analytics capacity trending showing reduced primary tier usage
- D) Data Lens data classification showing tier assignment per object

**Answer: B**
Objects lifecycle monitoring provides transition status tracking that shows whether objects are being transitioned between tiers as specified by the lifecycle policy, allowing verification that the 90-day transition rule is executing correctly.

---

### Q45
An administrator is monitoring a Nutanix Volume Group and notices inconsistent performance reported by the application using it. Which Volume Group performance metrics should the administrator review?

- A) Data classification results, PII count, and compliance scan status
- B) File distribution by type, audit trail, and anomaly detection
- C) IOPS, throughput, and latency per Volume Group
- D) Bucket statistics, GET/PUT operations per second, and data transfer rate

**Answer: C**
Volume Group performance metrics include IOPS, throughput, and latency measured per Volume Group. These metrics help administrators identify whether the inconsistent application performance correlates with storage-level performance variations.

---

### Q46
A database administrator reports that a critical database running on a Nutanix Volume Group is experiencing periodic latency spikes. Which monitoring approach should the Nutanix administrator take first?

- A) Examine the File Analytics audit trail for concurrent file access on the cluster
- B) Check the Data Lens anomaly score for the database server's user account
- C) Check the Objects bucket latency metrics for the database backup target
- D) Review the Volume Group latency metrics during the reported spike periods

**Answer: D**
The Nutanix administrator should first review the Volume Group's latency metrics during the reported spike periods to determine whether the latency issue originates at the storage level before investigating other potential causes.

---

### Q47
An administrator needs to verify which external hosts are currently connected to a Nutanix Volume Group via iSCSI. Which monitoring feature provides this information?

- A) iSCSI session monitoring showing active sessions and initiator IPs
- B) Objects dashboard showing connected S3 client endpoints
- C) Data Lens permissions scanning showing authenticated hosts
- D) File Analytics audit trail showing connected clients

**Answer: A**
iSCSI session monitoring for Volume Groups shows active sessions, initiator IPs, and connection status, allowing administrators to see exactly which external hosts are currently connected via iSCSI.

---

### Q48
An administrator configures a Volume Group with multiple iSCSI paths for high availability. How can the administrator confirm that all paths are active and available?

- A) Check the File Analytics dashboard for multi-path file access patterns
- B) Review the Volume Group health metrics including path availability status
- C) Verify the Objects lifecycle policy is not competing for the same storage paths
- D) Examine the Data Lens connection health dashboard for iSCSI path status

**Answer: B**
Volume Group health monitoring includes path availability status, allowing administrators to verify that all configured iSCSI paths are active and functioning correctly for high availability configurations.

---

### Q49
An administrator enables CHAP authentication on a Volume Group to enhance security. After deployment, the administrator wants to monitor for unauthorized access attempts. What should be monitored?

- A) Data Lens behavioral analysis for iSCSI session anomalies
- B) File Analytics ransomware detection alerts for the Volume Group's backing files
- C) CHAP authentication monitoring for failed authentication attempts
- D) Objects access logging for S3 requests targeting the Volume Group endpoint

**Answer: C**
CHAP authentication monitoring tracks failed authentication attempts and session security status for Volume Groups. Monitoring failed CHAP authentications helps identify unauthorized access attempts against the iSCSI targets.

---

### Q50
A Nutanix administrator notices that a Volume Group shows degraded disk status in the health monitoring panel. What is the most likely implication?

- A) The Objects store connected to the Volume Group will pause lifecycle operations
- B) The Data Lens agent monitoring the Volume Group will lose connectivity
- C) The Files share backed by the Volume Group will become read-only
- D) One or more virtual disks in the Volume Group may be experiencing issues affecting availability

**Answer: D**
Volume Group health monitoring includes disk status, which indicates the health of virtual disks within the group. Degraded disk status suggests that one or more virtual disks may be experiencing issues that could affect the Volume Group's performance or availability.

---

### Q51
An administrator is troubleshooting slow iSCSI performance on a Volume Group and wants to check if there are too many active sessions from a single initiator. Where should the administrator look?

- A) iSCSI session monitoring showing active session count per initiator
- B) Objects dashboard showing concurrent connections per client endpoint
- C) Prism Central network analytics for iSCSI VLAN traffic distribution
- D) File Analytics top contributors view for the iSCSI-connected host

**Answer: A**
iSCSI session monitoring for Volume Groups provides details about active sessions per initiator, including session counts and connection status. This helps identify if a single initiator has excessive sessions that could affect performance.

---

### Q52
An administrator reviews Volume Group replication status and sees that a secondary copy is lagging behind the primary. Which Volume Group health metric indicates this condition?

- A) IOPS variance between primary and secondary Volume Groups
- B) Replication status showing synchronization lag in the Volume Group health dashboard
- C) Objects replication factor mismatch alert in Prism Central
- D) File Analytics audit trail discrepancy between primary and replicated shares

**Answer: B**
Volume Group health monitoring includes replication status, which shows the synchronization state between primary and replicated copies. A replication lag is visible in this health metric and indicates the secondary copy is not fully synchronized.

---

### Q53
A security administrator requires a report of all CHAP authentication failures for Volume Groups over the past week. Which monitoring approach provides this data?

- A) Checking the Objects access log for S3 authentication failures on Volume Group endpoints
- B) Exporting the File Analytics audit trail filtered by authentication events
- C) Reviewing CHAP authentication monitoring data for failed attempts and session security status
- D) Running a Data Lens compliance scan focused on iSCSI access control

**Answer: C**
CHAP authentication monitoring specifically tracks failed authentication attempts and session security status for Volume Groups, providing the data needed to generate a report of authentication failures over a given time period.

---

### Q54
An administrator needs to monitor the overall throughput of all Volume Groups on a cluster to plan for network bandwidth upgrades. Which metric set is most relevant?

- A) File Analytics write throughput for all shares on the cluster
- B) Data Lens ingestion rate for all connected Files instances
- C) Objects store data transfer rate aggregated across all buckets
- D) Volume Group throughput metrics aggregated across all Volume Groups

**Answer: D**
Volume Group performance metrics include throughput per Volume Group. Aggregating throughput across all Volume Groups on the cluster provides the total iSCSI storage bandwidth consumption needed for network capacity planning.

---

### Q55
An administrator opens the File Analytics dashboard and sees that the file distribution by size shows 60% of data is in files larger than 1 GB. What is the operational significance of this finding?

- A) It suggests the storage workload is dominated by large files, which affects capacity planning and backup strategies
- B) It means the Files cluster needs to be rebalanced across additional File Server VMs
- C) It confirms that Data Lens PII scanning will require extended processing time
- D) It indicates potential ransomware activity targeting large files

**Answer: A**
File distribution by size provides insight into the workload characteristics of the storage environment. Knowing that the majority of data consists of large files helps with capacity planning, backup window estimation, and understanding storage growth patterns.

---

### Q56
An administrator needs to track which applications are generating the most new files on a Nutanix Files share over the past month. Which File Analytics approach is most effective?

- A) Use the capacity trending forecast to estimate application-driven growth
- B) Review the audit trail for create operations and correlate with user accounts tied to application service accounts
- C) Check the Data Lens data classification for application-generated file types
- D) Review the Objects lifecycle policy execution count for application-specific prefixes

**Answer: B**
File Analytics audit trails track create operations per user per share. By filtering on create operations and correlating activity with application service accounts, the administrator can identify which applications are generating the most new files.

---

### Q57
A company has deployed Data Lens and wants to ensure that files containing credit card numbers are automatically identified across all their Nutanix Files shares. Which Data Lens feature should be configured?

- A) Audit trail analysis with keyword search for numeric strings
- B) Ransomware behavioral analysis with financial data pattern recognition
- C) Permissions scanning with payment card industry (PCI) templates
- D) Data classification with PII detection for credit card number patterns

**Answer: D**
Data Lens data classification includes PII detection capabilities that can identify credit card numbers and other sensitive data patterns. This feature automatically scans and tags files containing such data across all connected Nutanix Files shares.

---

### Q58
An administrator is comparing alerts from Data Lens and File Analytics for a suspected ransomware event. Data Lens shows a high anomaly score while File Analytics shows entropy-based alerts. Which statement best explains the complementary nature of these alerts?

- A) File Analytics alerts take priority because on-premises detection is always more accurate than cloud-based detection
- B) Data Lens alerts should be ignored if File Analytics has already confirmed the threat
- C) Data Lens and File Analytics use the same detection engine, so the alerts are redundant
- D) Data Lens analyzes behavioral patterns and anomaly scoring while File Analytics analyzes file entropy, providing two different detection perspectives

**Answer: D**
Data Lens and File Analytics use complementary approaches: Data Lens employs behavioral analysis with anomaly scoring, while File Analytics uses entropy-based analysis. Together they provide two different detection perspectives that strengthen the overall ransomware detection capability.

---

### Q59
An administrator wants to identify Nutanix Files shares where data has not been accessed in over a year and permissions are still set to allow broad access. Which tool provides both pieces of information in a single view?

- A) Data Lens combining permissions scanning with stale data identification
- B) Prism Central combining Files Manager share settings with capacity reports
- C) Objects dashboard combining lifecycle transition status with bucket policies
- D) File Analytics combining file distribution by age with audit trail access logs

**Answer: A**
Data Lens permissions scanning identifies both stale data (files not accessed for extended periods) and excessive permissions (broadly accessible shares), providing the combined visibility needed in a single solution.

---

### Q60
An administrator configures a Nutanix Objects store with tiered storage and lifecycle policies. After several weeks, the administrator wants to verify the total data moved to the lower tier. Where should the administrator look?

- A) File Analytics capacity trending showing reduced primary storage consumption
- B) Objects lifecycle monitoring showing transition status and data volume moved
- C) Data Lens data classification showing reclassified objects by tier
- D) Prism Element storage container statistics showing tier distribution

**Answer: B**
Objects lifecycle monitoring tracks policy execution including transition status, which shows the volume of data that has been successfully moved between storage tiers as a result of lifecycle policy execution.

---

### Q61
An administrator is reviewing the Objects dashboard and notices that latency for a particular bucket has increased by 300% over the past hour. Which additional Objects metric should be correlated to understand the root cause?

- A) The Volume Group replication lag for the Objects backend storage
- B) The File Analytics audit trail for the user accessing the bucket
- C) The operations per second (IOPS) for the bucket to check for a workload spike
- D) The Data Lens anomaly score for the Objects store service account

**Answer: C**
When bucket latency increases dramatically, correlating with operations per second (IOPS) helps determine whether the latency is caused by a workload spike (more operations than the bucket can handle) or by an infrastructure issue.

---

### Q62
A Nutanix administrator is asked to provide a dashboard that shows both Files and Objects utilization metrics in a single management interface. Which approach is correct?

- A) Configure Data Lens to aggregate Files and Objects metrics into a unified view
- B) Create a custom dashboard in Prism Element combining Files and Objects widgets
- C) Deploy File Analytics with Objects monitoring plugins
- D) Use Prism Central, which provides dashboards for both Files and Objects

**Answer: D**
Prism Central serves as the unified management interface for the Nutanix platform, providing dashboards for both Files (via Files Manager) and Objects (via the Objects dashboard) in a single console.

---

### Q63
An administrator deployed File Analytics several months ago and now receives a capacity trending alert indicating that a share will reach capacity in 30 days. What is the most proactive response?

- A) Review the growth rate analysis, identify top contributors, and plan capacity expansion or data tiering
- B) Disable the capacity alert threshold to prevent recurring notifications
- C) Migrate the share to an Objects bucket where capacity is unlimited
- D) Delete old files from the share immediately to free space

**Answer: A**
The proactive response is to use File Analytics capacity trending and top contributors data to understand the growth pattern, identify the sources of growth, and plan either capacity expansion or data management strategies such as tiering or archiving.

---

### Q64
An administrator is configuring the File Analytics ransomware blocklist and wants to add common ransomware extensions. Which statement is true about the blocklist?

- A) The blocklist automatically includes all known ransomware extensions from a cloud-updated database
- B) The blocklist is configurable, allowing administrators to add specific file extensions to monitor
- C) The blocklist can only be modified through Data Lens, not directly in File Analytics
- D) The blocklist replaces entropy-based detection and cannot be used alongside it

**Answer: B**
The File Analytics ransomware blocklist is configurable, allowing administrators to add specific file extensions associated with known ransomware variants. This works alongside entropy-based detection as a complementary protection mechanism.

---

### Q65
A Nutanix administrator needs to generate an audit report showing all delete operations performed on a specific NFS export over the last quarter. Which tool and feature should be used?

- A) Prism Central task audit log filtered by Files delete events
- B) Data Lens compliance scan report filtered to delete actions
- C) File Analytics audit trail filtered by delete operations on the specific share
- D) Objects lifecycle deletion queue history for the NFS-backed bucket

**Answer: C**
File Analytics audit trails track all operations including delete actions per user per share. Filtering the audit trail by delete operations on the specific NFS export for the last quarter generates the required report.

---

### Q66
An administrator reviews the File Analytics file distribution by age and discovers that 40% of data on a critical share is over three years old. What insight does this provide for storage management?

- A) The capacity trending prediction is inaccurate because growth should have been higher
- B) The audit trail data for the old files has expired and needs to be re-collected
- C) The ransomware detection is not functioning because old files should have been flagged
- D) A significant portion of storage is consumed by potentially stale data that may be a candidate for archiving or tiering

**Answer: D**
File distribution by age reveals that a large portion of storage is occupied by old data. This insight helps administrators identify archiving or tiering opportunities to optimize storage utilization on high-performance tiers.

---

### Q67
An administrator has configured Data Lens for a Nutanix Files environment and wants to validate that sensitive data tagging is working correctly. What should the administrator check?

- A) Data Lens data classification results showing tagged files with their sensitivity labels
- B) Prism Central alert history for data classification policy violations
- C) Objects metadata browser for sensitivity tags applied to file objects
- D) File Analytics ransomware detection for tagged file anomalies

**Answer: A**
Data Lens data classification automatically tags files with sensitivity labels. To validate that tagging is working correctly, the administrator should review the data classification results in Data Lens showing tagged files and their assigned sensitivity categories.

---

### Q68
An administrator is monitoring a Volume Group that serves a Microsoft SQL Server Always On Availability Group via iSCSI. The administrator notices that one iSCSI session shows a disconnected status. What is the potential impact?

- A) The File Analytics audit trail will stop recording operations for the SQL database
- B) The SQL Server may lose access to the storage path, potentially causing failover or performance degradation
- C) The Objects lifecycle policies for the SQL database backup bucket will pause
- D) Data Lens will stop classifying data within the SQL database files

**Answer: B**
A disconnected iSCSI session means the SQL Server has lost one of its storage paths. In a multipath configuration, this may cause path failover with potential performance impact, or in a single-path configuration, it could cause complete loss of storage access.

---

### Q69
An administrator configures CHAP authentication for a Volume Group and wants to verify that all connected initiators are using CHAP. Which monitoring metric confirms this?

- A) Objects IAM policy validation for iSCSI service accounts
- B) File Analytics authentication event log
- C) CHAP authentication session security status for each connected initiator
- D) Data Lens access control compliance report

**Answer: C**
CHAP authentication monitoring provides session security status for each connected initiator, allowing the administrator to verify which sessions are authenticated using CHAP and identify any connections that are not using CHAP authentication.

---

### Q70
An administrator notices in the Objects dashboard that one bucket has significantly higher IOPS than all other buckets combined. What is the recommended monitoring action?

- A) Migrate the bucket to a Volume Group for better IOPS performance monitoring
- B) Configure Data Lens behavioral analysis for the high-IOPS bucket
- C) Enable File Analytics for the Objects store to get user-level audit trails
- D) Review the bucket's operations per second, latency, and throughput to assess impact on the overall Objects store performance

**Answer: D**
When a single bucket shows disproportionately high IOPS, the administrator should review its complete performance metrics (operations per second, latency, throughput) to determine whether this workload is impacting the overall Objects store performance for other buckets.

---

### Q71
A storage architect needs to present capacity consumption trends for a Nutanix Objects store to management, including projected growth over the next six months. Which Objects monitoring capability provides this data?

- A) Objects capacity management with total store utilization and growth trending
- B) Data Lens storage consumption forecast based on data classification growth
- C) Prism Central cluster runway report for the Objects container
- D) File Analytics capacity trending report exported for the Objects metadata

**Answer: A**
Objects capacity management provides total store utilization data along with growth trending capabilities. This information can be used to project future capacity needs and present consumption trends to management.

---

### Q72
An administrator enables File Analytics and wants to set up alerts for when a single user deletes more than 100 files in one hour. Which File Analytics capability supports this type of alerting?

- A) Capacity trending threshold alerts based on free space reduction
- B) Anomaly detection that identifies unusual patterns in user file operations
- C) CHAP authentication alerting for excessive deletion requests
- D) Objects lifecycle deletion queue monitoring with user attribution

**Answer: B**
File Analytics anomaly detection identifies unusual patterns in user behavior, including excessive file operations such as mass deletions. This capability can alert administrators when a user's delete activity significantly deviates from normal behavior.

---

### Q73
An administrator is reviewing the Data Lens permissions scanning results and notices that a share shows "inherited permissions inconsistency." What does this finding suggest?

- A) The Volume Group access control list is conflicting with the Files share permissions
- B) The share's ransomware protection policy conflicts with its access control list
- C) The effective permissions on files differ from what the share-level permissions should grant due to inheritance issues
- D) The Objects bucket policy linked to the share has overridden the file-level permissions

**Answer: C**
Data Lens permissions scanning identifies situations where effective permissions on files within a share are inconsistent with expected inherited permissions, which could lead to unintended access or access denial issues.

---

### Q74
A Nutanix administrator is troubleshooting an Objects store where lifecycle policies appear to be running but objects are not transitioning. What Objects monitoring information helps identify the issue?

- A) Data Lens behavioral analysis showing unusual Objects access patterns
- B) Volume Group health showing backend storage issues for the Objects store
- C) File Analytics audit trail showing Objects API calls that failed
- D) Objects lifecycle monitoring showing policy execution tracking and transition status

**Answer: D**
Objects lifecycle monitoring provides detailed policy execution tracking and transition status. When policies run but objects do not transition, this monitoring data shows execution details and any errors preventing successful transitions.

---

### Q75
An administrator wants to monitor whether a Volume Group is meeting the IOPS requirements of a performance-critical application. Which approach provides the most direct measurement?

- A) Review the Volume Group IOPS metric in the performance monitoring dashboard
- B) Examine the Objects GET/PUT operations per second for the application's data bucket
- C) Monitor the Data Lens anomaly score for the application's service account
- D) Check File Analytics write IOPS for the share hosting the application data

**Answer: A**
Volume Group performance metrics include IOPS measured per Volume Group. This provides the most direct measurement of whether the Volume Group is delivering the required IOPS for the application.

---

### Q76
An administrator deployed File Analytics and Data Lens for the same Nutanix Files environment. How do these solutions complement each other for ransomware protection?

- A) They provide identical protection and only one should be active to avoid alert duplication
- B) File Analytics provides entropy-based detection on-premises while Data Lens provides SaaS-based behavioral analysis and anomaly scoring
- C) File Analytics detects ransomware on Files shares while Data Lens detects ransomware on Objects buckets
- D) Data Lens replaces File Analytics ransomware detection when both are deployed together

**Answer: B**
File Analytics and Data Lens use complementary ransomware detection approaches. File Analytics provides on-premises entropy-based analysis with configurable extension blocklists, while Data Lens adds SaaS-based behavioral analysis with anomaly scoring for defense in depth.

---

### Q77
An administrator is reviewing iSCSI session monitoring for a Volume Group and sees sessions from an IP address that does not belong to any known host. What should the administrator investigate?

- A) Check Data Lens permissions scanning for the unknown IP's access grants
- B) Check File Analytics for unauthorized file access from the unknown IP
- C) Review the CHAP authentication status for the unknown initiator and investigate potential unauthorized access
- D) Examine the Objects dashboard for S3 API calls from the unknown IP

**Answer: C**
When an unknown IP appears in iSCSI session monitoring, the administrator should check the CHAP authentication status for that session and investigate whether unauthorized access is occurring, potentially indicating a security breach.

---

### Q78
An administrator is asked to demonstrate that the Nutanix storage environment meets an internal SLA of less than 5ms average latency for database Volume Groups. Which monitoring data provides this evidence?

- A) Objects bucket latency metrics for the database tier storage
- B) Data Lens performance analytics for the database cluster
- C) File Analytics share-level latency metrics for the database share
- D) Volume Group latency metrics showing average latency per Volume Group over time

**Answer: D**
Volume Group performance metrics include per-VG latency tracking over time. This data provides direct evidence of whether each Volume Group serving database workloads is meeting the specified latency SLA.

---

### Q79
An administrator deploys a new Nutanix Objects store and wants to establish performance baselines. Which set of metrics should be collected from the Objects dashboard during the initial monitoring period?

- A) GET/PUT latency, operations per second, data transfer rate, and per-bucket throughput
- B) iSCSI session count, CHAP authentication rate, and Volume Group IOPS
- C) Data classification hit rate, PII detection count, and compliance scan duration
- D) File distribution by type, audit trail frequency, and anomaly detection score

**Answer: A**
Establishing Objects store performance baselines requires collecting key performance metrics including GET/PUT latency, operations per second, data transfer rate, and per-bucket throughput during the initial period of normal operation.

---

### Q80
An administrator notices that Data Lens is reporting an increasing number of anomaly alerts across multiple Nutanix Files clusters. The alerts reference behavioral deviations from baseline for several service accounts. What is the most important immediate action?

- A) Increase the Data Lens anomaly scoring threshold to reduce alert volume
- B) Investigate the flagged service accounts for potential compromise and verify the behavioral deviations are not indicators of a coordinated attack
- C) Disable the service accounts in File Analytics to stop the alert generation
- D) Migrate the affected shares to Objects to remove them from Data Lens monitoring scope

**Answer: B**
When Data Lens reports behavioral anomalies across multiple clusters for several service accounts, it could indicate a coordinated security incident. The immediate priority is to investigate the flagged accounts for potential compromise rather than suppressing alerts or disabling monitoring.

---

*End of NCP-US 6.10 Domain 3: Analyze and Monitor – 80 Questions*
