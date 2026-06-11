# NCM-MCI 6.10 Master-Level Practice Exam Questions
## Part 5: Gap-Fill Comprehensive Assessment
**40 Advanced Scenario-Based Questions with Live Lab & CLI Focus**

---

## SECTION 1: MONITORING & DIAGNOSTICS (8 Questions)

### Q1. Creating Analysis Graph in Prism Central for VM Latency Diagnosis
You need to diagnose why a critical application VM shows high latency. In Prism Central Analysis page, you want to create a custom graph comparing VM read/write latency against host CPU utilization. Which steps correctly add these entities and metrics to the chart?

- A) Click "Analyze" > Select VM entity > Add "Latency" metric > Add Host > Add "CPU Utilization" > Click "Create Graph"
- B) Navigate to Dashboard > Create Chart > Search for VM by name > Select "Read Latency" and "Write Latency" separately > Add Host CPU from Entity dropdown > Apply
- C) Go to Analysis > Custom Analysis > Select Analysis Type "Entity Metrics" > Choose VM entities > Add metrics "Read Latency", "Write Latency", Host "CPU Utilization" > Set time range > Generate
- D) Use Prism Element CLI command: prism_cli analyze --entity=vm --metrics=latency,cpu --host=all --output=graph

**Answer: C**
In Prism Central, navigate to Analysis > Custom Analysis, select the VM entities you're investigating, and add the specific metrics (Read Latency, Write Latency) alongside host CPU utilization to correlate performance. Set your desired time range and generate the graph to identify correlation between host CPU spikes and VM latency increases.

---

### Q2. MSSQL Instance Details Dashboard - Identifying Query Latency Bottleneck
Your SQL Server VM in Prism Central shows "High Query Latency" alert. When you open the MSSQL Instance Details page, which metric most accurately identifies the bottleneck source—storage I/O, CPU, or network?

- A) "Avg Query Execution Time" combined with "Storage Latency (ms)" to isolate I/O wait times
- B) "Cache Hit Ratio" and "Memory Utilization" - low ratio indicates memory pressure forcing disk I/O
- C) "Batch Requests/sec" vs "CPU Time %" - high requests with high CPU indicates CPU bottleneck
- D) "Disk Queue Length" and "Checkpoint Pages/Sec" - indicates storage subsystem saturation

**Answer: A**
The MSSQL dashboard shows "Avg Query Execution Time" which includes query wait time. Cross-reference this with the "Storage Latency (ms)" metric on the same page to determine if delays are I/O-related. If storage latency is consistently high during query peaks, the storage subsystem is the bottleneck; if latency is low but execution time remains high, investigate CPU or memory pressure.

---

### Q3. Using Prism Audit Trail to Identify Configuration Change That Broke Cluster Connectivity
A cluster loses network connectivity after a configuration change 3 hours ago. You need to identify which setting was changed and who made it. Where in Prism Central do you navigate and what filter do you apply?

- A) Settings > Audit Trail > Filter by "Network" category and "Network" entity type > Sort by timestamp descending
- B) Gear icon (Administration) > Audit > Filter by "Changed" action > Search for "connectivity" keyword > Identify administrator
- C) System > Logs > Filter by "ERROR" level and "Network" service > Check Stargate and AHV logs
- D) Administration > Event Log > Filter by "Cluster" entity > Sort by timestamp > Identify network-related config changes

**Answer: A**
Navigate to Prism Central > Settings > Audit Trail in Prism Central. Filter by "Network" category to show only network-related configuration changes. Sort by timestamp in descending order to see the most recent changes first. This will display who changed what and when, allowing you to identify the configuration change that broke connectivity.

---

### Q4. NCC Reports backup_schedule_check FAIL - Root Cause and Fix
NCC (Nutanix Cluster Check) reports a FAIL status for "backup_schedule_check" on the cluster. You have access to KB article NTX-7834 which covers this failure. What is the most common root cause and remediation?

- A) Backup service not running on CVMs; fix: ncli service-vm-service restart backup
- B) No backup policies defined; fix: create at least one backup policy in Prism Central
- C) Snapshot schedule not configured; fix: enable Snapshot Schedule in cluster settings
- D) Backup retention policy expired; fix: extend retention period in Settings > Backup Policies

**Answer: B**
The backup_schedule_check FAIL typically indicates that no backup policies are configured in the cluster. According to NTX-7834, the NCC check validates that at least one backup policy exists to ensure the cluster has backup coverage. Create a backup policy in Prism Central covering at least one VM or container to pass this check.

---

### Q5. Creating Custom Alert Policy for VM Storage Latency Threshold
You need to create an alert in Prism Central that fires when ANY VM in the cluster exceeds 20ms storage latency for 5 consecutive minutes. How do you configure this custom alert policy?

- A) Prism Central > Alerts > Create Alert > Select entity "VM" > Threshold: "Storage Latency > 20ms" > Duration: "5 minutes" > Create
- B) Alerts > Alert Policy > Add Custom Rule > Entity Type: "VM" > Metric: "Storage.Latency.Ms" > Operator: ">" > Value: "20" > Severity: "Warning" > Duration: "5" > Scope: "All" > Save
- C) Administration > Alerts > New Alert Policy > Condition: "Storage latency(ms) > 20" > Applies to: "All VMs" > Trigger after: "5 minutes" > Action: Email Admin > Save
- D) Settings > Notifications > Add Alert Rule > Select Metric "VM Storage Latency" > Set Threshold 20ms > Select Notification Channel > Create

**Answer: B**
In Prism Central, navigate to Alerts > Alert Policies > Create New. Select Entity Type "VM", choose Metric "Storage.Latency.Ms", set Operator to "greater than", Value to "20", and Duration to "5 minutes" to ensure the threshold is exceeded for the full duration before triggering. This creates an alert that applies to all VMs in the cluster.

---

### Q6. Creating Scheduled Prism Central Report - Top 10 VMs by Latency
You need to generate a weekly email report showing the top 10 VMs with highest storage latency across the cluster. Where do you configure this scheduled report in Prism Central?

- A) Reports > Create Report > Report Type: "Performance" > Metric: "VM Storage Latency" > Sort: "Descending" > Top 10 > Schedule: "Weekly" > Email recipients > Save
- B) Analyze > Generate Report > Chart Type: "VM Latency Ranking" > Scope: "All VMs" > Results: "Top 10" > Schedule Weekly > Configure email distribution > Submit
- C) Administration > Reports > New Report > Select Template "VM Performance" > Customize: add metric "Storage Latency" > Sort by descending > Limit to top 10 > Set schedule "Weekly" > Add recipients > Create
- D) Dashboard > Report Builder > Add metric "Storage Latency by VM" > Filter top 10 > Schedule: "Every Monday 8:00 AM" > Email: admin@company.com > Generate

**Answer: A**
Navigate to Reports > Create Report in Prism Central, select Report Type "Performance", choose VM Storage Latency metric, sort in descending order, and limit results to top 10. Configure the schedule as "Weekly", specify recipient email addresses, and save. The system will automatically generate and email the report on your specified schedule.

---

### Q7. Reviewing Capacity Report - Identifying Cluster Needing Immediate Attention
A capacity report shows three clusters with these 90-day utilization trends:
- Cluster A: CPU 45%, Memory 52%, Storage 68%
- Cluster B: CPU 72%, Memory 78%, Storage 91%
- Cluster C: CPU 38%, Memory 41%, Storage 35%

Which cluster requires immediate attention and why?

- A) Cluster A - CPU approaching critical threshold at 45%
- B) Cluster B - Storage utilization at 91% indicates immediate risk of space exhaustion
- C) Cluster C - CPU and memory are too low, indicating underutilized investment
- D) All three clusters are within acceptable thresholds; no action needed

**Answer: B**
Cluster B shows storage utilization at 91%, which exceeds the recommended threshold of 80-85%. This cluster requires immediate attention to add storage capacity or remove unnecessary data before it reaches 100% and causes performance degradation or VM provisioning failures. The other resources (CPU/Memory at 72-78%) are elevated but not critical.

---

### Q8. Planning Dashboard - Creating Runway Scenario for 50 VDI Desktops
Your cluster shows 60-day CPU runway in the Planning Dashboard. You want to model adding 50 Windows 11 VDI desktops (4vCPU, 8GB RAM each) to determine if the cluster needs expansion before 60 days. What steps do you follow?

- A) Planning > Scenarios > Create What-If > Add 50 VMs > Resource Profile: "4vCPU, 8GB" > Compare current vs projected runway > View new runway calculation
- B) Dashboard > Capacity Planning > Add workload simulation > VM count: 50 > CPU per VM: 4 > Memory per VM: 8GB > Calculate projected runway > Review results
- C) Analyze > Capacity Runway > Modify assumptions > Add 50 VMs with specified resource allocation > Recalculate 60-day projection > Compare to current state
- D) Administration > Planning Tools > Scenario Builder > Define scenario "50 VDI Add" > Input VM specs (4v, 8GB each) > Execute simulation > Review runway extension/reduction

**Answer: A**
Navigate to Planning > Scenarios in Prism Central, create a new What-If scenario, specify adding 50 VMs with the resource profile (4vCPU, 8GB RAM each), and run the analysis. The system will calculate the new CPU runway based on current consumption rates plus the additional VDI workload, helping determine if immediate expansion is necessary or if the cluster can sustain 60 days with the new workload.

---

## SECTION 2: OPTIMIZE & SCALE (8 Questions)

### Q9. Creating Runway Scenario - Modeling 3-Node Expansion Impact
Your 4-node cluster has 45-day CPU runway. You create a scenario adding 3 new nodes with identical specs to model expansion impact. What is the most likely new runway projection for handling 200 additional VMs?

- A) 45-day runway unchanged - adding nodes adds proportional capacity matching proportional load
- B) Approximately 90+ days - doubling node count nearly doubles available CPU capacity
- C) Approximately 60-75 days - new nodes add capacity but efficiency of larger cluster differs
- D) Cannot be determined without knowing current CPU consumption and per-VM CPU requirement

**Answer: B**
Adding 3 nodes to a 4-node cluster represents a 75% capacity increase (3/4 ratio). If the current 45-day runway is driven purely by CPU capacity, this 75% increase extends the runway proportionally: approximately 45 days × 1.75 = ~78 days. For the 200 additional VMs scenario with significant per-VM load, the actual runway depends on consumption patterns and may not reach 90+ days; however, the improvement from added cluster capacity is substantial. The Planning Dashboard Scenario Builder will calculate the exact new runway.

---

### Q10. Configuring SQL Server VM per Best Practice Guide BP-2015
You reference Nutanix SQL Server BPG (BP-2015) to configure a new 4-socket database VM for production OLTP workloads. What are the recommended vCPU, memory, and disk layout specifications?

- A) vCPU: 8, Memory: 64GB, Disk: 2x RAID-1 (OS) + separate data/log on single RAID-5 container
- B) vCPU: Match physical socket count (4), Memory: 128GB minimum, Disk: Separate containers for OS, Data, Log, TempDB with RAID-0 for TempDB
- C) vCPU: 16 (4 sockets × 4 cores), Memory: 256GB, Disk: All workloads on single RAID-1 container with SMB3 shares
- D) vCPU: 32, Memory: 512GB, Disk: Distributed across 10 virtual disks for maximum parallelism

**Answer: B**
BP-2015 recommends vCPU allocation matching the physical socket count (4 sockets = 4 vCPU minimum), 128GB+ RAM, and critical disk separation: OS on RAID-1 container, Data files on high-performance RAID-0 container, Transaction Logs on dedicated RAID-1 container, and TempDB on separate RAID-0 container. This layout optimizes I/O performance for database workloads.

---

### Q11. Configuring Windows 11 VDI with vGPU Profile per TN-2164
You reference Technote TN-2164 to configure a Windows 11 VDI VM with NVIDIA T4 GPU acceleration. The specification calls for vGPU profile "T4-2Q". How do you apply this in Prism?

- A) VM Settings > vGPU > Select Profile "T4-2Q" > Confirm NVIDIA driver version 471.0+ installed in guest > Apply and reboot
- B) Create VM > Add vGPU Device > Profile: NVIDIA T4 Quadro (2GB variant) > Map to available T4 slot > Complete VM creation
- C) VM Detail Page > Hardware > Edit > Add GPU > Select Model "T4" > Profile "2Q" > Ensure hypervisor PCIe passthrough enabled > Save
- D) During VM provisioning, add vGPU under "Guest Customization" > Select T4-2Q profile > System automatically installs drivers > Boot VM

**Answer: A**
Access the Windows 11 VDI VM Settings in Prism Element > VM Detail > Hardware > Edit, locate the vGPU section, and select profile "T4-2Q" (NVIDIA Tesla T4 with 2GB per-session allocation for multi-user desktop). Confirm the guest has NVIDIA driver version 471.0 or later installed to support the vGPU profile, then apply the configuration and reboot the VM.

---

### Q12. Configuring Rebuild Capacity Reservation for Single Node Failure Recovery
You need to ensure the cluster can rebuild data from a failed node within 24 hours (cluster has 3TB aggregate capacity). Where do you configure Rebuild Capacity Reservation and what % should you set?

- A) Prism Element > Settings > Cluster > Rebuild Capacity Reservation > Set to 1/N where N=node count > For 8 nodes, set 12.5% (375GB)
- B) Prism Element > Settings > Rebuild Capacity Reservation > Calculate per KB-12456: Reservation % = Largest Node Capacity / Total Capacity
- C) Prism Element > Cluster Settings > Advanced > RF Policy > Rebuild Reserve: 1 node capacity reserved automatically
- D) Navigate to Container Settings > Advanced > Rebuild Reservation > Set percentage ensuring rebuild completes within 24-hour window

**Answer: B**
Navigate to Prism Element > Settings > Rebuild Capacity Reservation. According to KB-12456, set the reservation percentage equal to the largest node's capacity divided by total cluster capacity. For a cluster with nodes sized 400GB each (3.2TB total), set reservation to ~12.5%. This ensures the cluster reserves capacity for rebuilding if any single node fails.

---

### Q13. Setting Cluster Resiliency Preference - VM Availability vs Data Resiliency
During a planned maintenance window, you want to prioritize VM availability (keep running) over perfect data resiliency. During unplanned failures, you want to prioritize data protection. How do you configure Cluster Resiliency Preference?

- A) Prism Element > Settings > Cluster Resiliency > Set "Planned" to Prioritize Availability, "Unplanned" to Prioritize Data Resiliency > Save
- B) Administration > Cluster Settings > Resiliency Preference > Toggle "Prioritize Availability during Maintenance" and "Prioritize Resiliency during Failure"
- C) Cluster > Advanced Settings > Fault Domain Preference > Select "Mixed" mode (availability-first, then data-aware)
- D) This is configured per VM, not cluster-wide, in VM Settings > Resiliency Policy

**Answer: A**
In Prism Element, navigate to Settings > Cluster Settings > Resiliency Preference. You can configure separate policies for planned maintenance (set to "Prioritize Availability" to keep VMs running) and unplanned failures (set to "Prioritize Data Resiliency" to maintain data integrity). This allows flexible tradeoffs based on scenario.

---

### Q14. Creating X-Play Playbook - VM Alert Triggered ServiceNow Ticket Creation
You want to create an X-Play playbook that triggers when a specific application VM alert fires and automatically creates a ServiceNow ticket via REST API. What are the configuration steps?

- A) X-Play > Create Playbook > Trigger: "Alert on VM [name]" > Action: "Call REST API" > URL: https://your-instance.service-now.com/api/v2/incidents > Method: POST > Headers: Authorization > Body with JSON (short_description, assignment_group, priority) > Save
- B) Operations > Plays > New Play > Condition: "VM Alert triggered" > Action: "ServiceNow Integration" > Configure ServiceNow credentials > Map alert fields to ticket fields > Activate
- C) Automation > X-Play > Create Rule > Event: "VM Alert" > Destination: "ServiceNow" > Auth: OAuth2 with credentials > Map parameters from alert to ticket > Enable > Test
- D) Prism Central > Administration > Playbooks > Import ServiceNow template > Customize trigger VM alert > Configure API endpoint > Deploy

**Answer: A**
Navigate to X-Play > Create Playbook. Set the trigger to "Alert on VM [name]". Add an action "Call REST API" with the ServiceNow API endpoint URL (https://instance.service-now.com/api/v2/incidents), method POST, authorization header with your API key, and JSON body mapping alert parameters (short_description, assignment_group, priority) to ServiceNow ticket fields. Save and test the playbook.

---

### Q15. Creating X-Play Playbook - Auto-Add vCPU for High CPU Alert
You want to create an X-Play playbook that monitors a specific VM's CPU utilization; when it exceeds 90% for 15 minutes, the playbook automatically adds one vCPU to the VM. Where do you configure this in Prism Central?

- A) Operations > X-Play > Create Playbook > Trigger: "VM CPU > 90% for 15 min" > Action: "Edit VM" > Parameter: "vCPU" > Value: "+1" > Restart VM > Activate
- B) X-Play > Create Playbook > Condition: "VM CPU Utilization threshold alert >90%" > Action: "Remediate VM" > Select "Add vCPU (1)" > Pre-action: pause alerting > Post-action: reboot > Save
- C) Automation Center > Create Play > Trigger Type: "Alert Policy Match" > Condition: CPU alert for VM > Execution: Call "VM CPU Scale" action > Increment vCPU > Target: VM [name] > Activate
- D) Administration > Playbooks > Create > Trigger: Alert (CPU >90%, duration 15min) > Action: VM Configuration Change > vCPU: +1 > Conditional restart after 30 min > Enable

**Answer: B**
Navigate to X-Play in Prism Central and create a new playbook. Set the trigger to a CPU utilization threshold alert exceeding 90%. Add an action to "Remediate VM" and select "Add vCPU (1)". Configure pre-action logic to pause alerting temporarily (avoiding duplicate triggers) and post-action to reboot the VM gracefully if needed. Save and activate the playbook. **NOTE: Production Impact - Automatic vCPU addition and VM reboot may impact running workloads; consider scheduling this during maintenance windows for critical VMs or adding conditional logic to check workload status before reboot.**

---

### Q16. Configuring Cluster Fault Tolerance - Block Awareness vs Node Awareness
You're designing a multi-node cluster and need to decide on fault tolerance granularity. Should you configure block awareness (fault domain across blocks within a chassis) or node awareness (fault domain across entire nodes)? Where do this, and what's the impact?

- A) Prism Element > Cluster Settings > Fault Domain Configuration > Choose "Node-aware" to tolerate single-node failure in any cluster
- B) ncli cluster edit-params fault-tolerance-domain=node-aware enables failover within logical node groups; block-aware limits to block-level failures
- C) Administrator > Cluster > Advanced > Fault Tolerance Mode: Select "Node Awareness" for maximum HA; "Block Awareness" for dense single-chassis clusters
- D) Fault tolerance is automatic; Nutanix detects physical topology and applies block-aware or node-aware automatically based on cluster configuration

**Answer: A**
Navigate to Prism Element > Cluster Settings > Advanced Settings > Fault Domain Configuration. Choose "Node-aware" to tolerate single full-node failures (recommended for most deployments to maximize HA across different physical nodes). Block-awareness applies only to blocks within the same chassis and is less common. Configure based on your desired failure domain scope.

---

## SECTION 3: SECURITY (10 Questions)

### Q17. Configuring Syslog Export for Stargate WARNING+ Messages
You need to export Stargate service logs at WARNING level and above to an external SIEM at IP 10.0.1.50 over TLS-encrypted TCP on port 6514. How do you configure this on Prism Element?

- A) Gear icon > Administration > Syslog > Add Server: 10.0.1.50:6514 > Protocol: TCP/TLS > Filter: Service=Stargate, Level=WARNING > Enable > Save
- B) Settings > Log Configuration > Syslog Server > Destination: 10.0.1.50 > Port: 6514 > TLS/SSL: Enabled > Message Filter: Stargate WARNING+ > Apply
- C) ncli cluster create-syslog-server --server-address=10.0.1.50 --port=6514 --protocol=tcp-tls --service-filter=stargate --min-level=warning
- D) Prism Central > Administration > Syslog Configuration > Add External Syslog Destination > IP: 10.0.1.50 > Port: 6514 > Security: TLS > Message Classes: Stargate Warning/Error/Critical > Save

**Answer: C**
Use the Prism Element command-line: `ncli cluster create-syslog-server --server-address=10.0.1.50 --port=6514 --protocol=tcp-tls --service-filter=stargate --min-level=warning`. This configures syslog export of Stargate messages at WARNING level and above over TLS-encrypted TCP to the specified SIEM endpoint. Verify connectivity with `ncli syslog verify-server --server-address=10.0.1.50`.

---

### Q18. Troubleshooting Syslog - SIEM Receives No Messages
You configured syslog export to 10.0.1.50:6514 TCP/TLS but your SIEM receives no messages. What troubleshooting steps do you perform?

- A) SSH to CVM, run `tcpdump -i eth0 host 10.0.1.50` to verify traffic leaving cluster; check firewall ACLs allow CVM to SIEM; verify certificate validity on both ends
- B) Prism Element > Logs > Syslog Status > Check "Connected" status; if not, test network: `ping 10.0.1.50`; verify SIEM is listening on port 6514
- C) ncli cluster get-syslog-server-config to verify configuration; check SIEM firewall rules; validate TLS certificates with `openssl s_client -connect 10.0.1.50:6514`
- D) All of the above are valid troubleshooting steps

**Answer: D**
All are essential troubleshooting steps. Verify network connectivity with `ping` and `tcpdump` from CVM to SIEM IP/port. Confirm syslog configuration with `ncli cluster get-syslog-server-config`. Check firewall ACLs on both cluster and SIEM side allow TCP/6514. Validate TLS certificates haven't expired using `openssl s_client -connect 10.0.1.50:6514`. Check SIEM is actually listening and not misconfigured.

---

### Q19. Configuring Prism Central AD Authentication - LDAP Integration
You want to enable Active Directory authentication on Prism Central so users can log in with AD credentials. The AD domain is nutanix.local, and you want to map the AD group "Cluster Admins" to Prism Central "Cluster Admin" role. What steps do you follow?

- A) Prism Central > Settings > Authentication > Add LDAP Server > Server: ldap.nutanix.local > Port: 389 > Service Account: svc-ldap@nutanix.local > Base DN: dc=nutanix,dc=local > Search Filter: (|(cn=*Cluster Admins*)) > Sync and Map to Role "Cluster Admin" > Save
- B) Administration > Security > Directory Services > Enable LDAP > Domain Controller: nutanix.local > Service Account credentials > Complete LDAP connection > Add Role Mapping: AD Group "Cluster Admins" to Prism Role "Cluster Admin" > Apply
- C) Settings > Users & Roles > Add Directory Service > Type: LDAP > Server: ldap.nutanix.local:389 > Domain: nutanix.local > Bind account: svc-ldap > Add Group Mapping "Cluster Admins" to Admin role > Verify and enable
- D) Prism Central > Security > SAML Configuration > Enable LDAP backend > LDAP server nutanix.local > Service account for queries > Attribute mapping: cn=*Cluster Admins* > Role mapping > Confirm

**Answer: A**
Navigate to Prism Central > Settings > Authentication > Add LDAP Server. Enter server address (ldap.nutanix.local), port 389 (standard LDAP directory query port), service account credentials (svc-ldap@nutanix.local with password), and base DN (dc=nutanix,dc=local). Configure the search filter to identify Cluster Admins AD group and map this group to the Prism Central "Cluster Admin" role. Test the connection and save configuration.

---

### Q20. Configuring SAML SSO with External IDP (Okta/ADFS)
Your organization uses Okta as the external identity provider. You want to configure SAML SSO on Prism Central so users authenticate via Okta single sign-on. What are the required configuration steps?

- A) Prism Central > Settings > SAML Configuration > Enable SAML > Upload IdP metadata (Okta XML) > Configure NameID format (emailAddress) > Map Okta groups to Prism roles > Test SSO with test account > Save
- B) Administration > Security > Single Sign-On > Add Identity Provider > IDP type: SAML > Okta metadata URL > Extract certificate and NameID > Role mapping > Complete setup
- C) Okta admin panel > Add Nutanix Prism as SAML application > Prism Central > Settings > SAML > Enable SSO > Paste Okta metadata XML > Configure assertion mapping > Enable > Test
- D) Prism Central > Security > SAML > Upload IdP metadata, configure preferred NameID attribute (email/username), map Okta groups to Prism Central roles (Admin, Viewer), set redirect URL to Okta, activate

**Answer: A**
In Prism Central, navigate to Settings > SAML Configuration and enable SAML SSO. Upload the Okta IdP metadata (XML file from Okta SAML setup). Configure the NameID format (typically emailAddress) to match your Okta user attributes. Map Okta groups to Prism Central roles (e.g., okta-admins to Cluster Admin, okta-users to Viewer). Test SSO login with a test account from Okta.

---

### Q21. Changing Default Admin Password and Enforcing Password Complexity
Your security audit requires all CVMs to have strong, unique passwords and enforce complexity requirements. What ncli command changes the default admin password and enables high-strength password policy?

- A) ncli user edit-password --username=admin --password=NewSecurePassword123! && ncli cluster edit-cvm-security-params enable-high-strength-password=yes
- B) ncli admin reset-password --new-password=NewSecurePassword123! && ncli cluster edit-security-config password-policy=strong
- C) ncli cluster change-root-password --password=NewSecurePassword123! && ncli cluster edit-cvm-security-params enable-high-strength-password=yes
- D) ncli cvm admin-reset --password=NewSecurePassword123! && ncli security enable-strong-passwords

**Answer: A**
Use `ncli user edit-password --username=admin --password=NewSecurePassword123!` to change the default admin password. Then run `ncli cluster edit-cvm-security-params enable-high-strength-password=yes` to enforce password complexity requirements across all CVMs. Verify with `ncli cluster get-cvm-security-config` to confirm the policy is enabled.

---

### Q22. Enabling Data-in-Transit Encryption Between CVMs
You need to enable encryption for data transmitted between CVMs during replication and cluster communication. What are the prerequisites and how do you enable this feature?

- A) All CVMs must have valid TLS certificates (CA-signed or self-signed), AES-NI CPU support enabled, all CVMs in healthy state. Enable with: ncli cluster edit-cvm-security-params enable-data-transit-encryption=yes
- B) Prerequisites: FIPS mode enabled on all CVMs, DRAM encryption, AES-NI CPU verification. Command: ncli cluster enable-tls-transport
- C) Prerequisites: Valid certificates on all CVMs, no active replication jobs, cluster in optimal state. Enable: Prism Element > Settings > Security > Data-in-Transit Encryption > Enable > Restart CVMs
- D) Prerequisites: DRAM encryption enabled, all CVMs on same software version, witness VM configured (if Metro). Command: ncli cluster edit-transit-security enable=yes --mode=aes256-gcm

**Answer: A**
Prerequisites for Data-in-Transit Encryption: valid TLS certificates (self-signed acceptable), AES-NI CPU support on all nodes, and all CVMs in healthy state. Enable with `ncli cluster edit-cvm-security-params enable-data-transit-encryption=yes`. Note: this does NOT encrypt RDMA traffic or guest VM traffic; it only protects CVM-to-CVM communication.

---

### Q23. Creating Storage Policy for PCI-Compliant VM Encryption Only
Your company has VMs tagged with category "Compliance:PCI" that must be encrypted, while other VMs can remain unencrypted for performance. How do you create a storage policy that selectively encrypts only PCI VMs?

- A) Prism Central > Administration > Storage Policies > Create > Name: "PCI-Encrypt" > Scope: "VMs with category Compliance:PCI" > Enable Encryption > Apply to matching VMs only > Save
- B) Storage Policy Based Encryption (SPBE) > New Policy > Name: "PCI-Encrypt" > Category Filter: "Compliance = PCI" > Encryption: AES-256-GCM > Scope: "matching VMs only" > Enforce
- C) Prism Central > Storage Policies > Create Policy > Condition: "Category Compliance contains PCI" > Action: "Enable encryption for these VMs" > Exclude others from encryption > Save and apply
- D) Container Settings > Encryption Policy > Enable category-based encryption > Category Scope: Compliance:PCI > Encryption algorithm: AES > Apply

**Answer: B**
Use Storage Policy Based Encryption (SPBE) in Prism Central. Create a new policy named "PCI-Encrypt" with a category filter matching "Compliance = PCI". Enable AES-256-GCM encryption and scope the policy to only VMs matching this category. VMs without the PCI category tag remain unencrypted. Apply the policy to activate encryption selectively.

---

### Q24. Enabling AIDE (Advanced Intrusion Detection Engine) on CVMs and Hypervisors
Your security policy requires AIDE monitoring on both CVMs and hypervisors to detect unauthorized file modifications. What command enables AIDE on both, and what is the update schedule?

- A) ncli cluster edit-cvm-security-params enable-aide=yes AND ncli cluster edit-hypervisor-security-params enable-aide=yes - AIDE runs a full baseline check weekly and monitors for changes
- B) ncli security enable-aide --scope=all-cvms,all-hypervisors - AIDE scans run every 12 hours
- C) Prism Element > Security > AIDE Configuration > Enable on CVMs > Enable on Hypervisors > Schedule: Daily > Apply
- D) ncli cluster aide-enable --cvm --hypervisor --schedule=weekly

**Answer: A**
Use two commands: `ncli cluster edit-cvm-security-params enable-aide=yes` to enable on CVMs and `ncli cluster edit-hypervisor-security-params enable-aide=yes` to enable on hypervisors. AIDE automatically runs a weekly baseline establishment and then monitors for unauthorized file system modifications across both layers. Verify status with `ncli cluster get-cvm-security-config`.

---

### Q25. Creating VDI Security Policy in Flow with AD Group-Based Categories
You want to implement network segmentation for VDI desktops using Flow. The policy should apply security rules to VMs in the "VDI:Production" category, which is dynamically populated from an AD group. What are the policy evaluation order and Flow configuration steps?

- A) Flow > Policy > VDI Policy > Security Category: "VDI:Production" (mapped to AD group) > Rules in order: Quarantine > Isolation > Application > VDI > Apply block by default > Save
- B) Flow > Create Policy > Name: "VDI-Security" > Scope: LDAP attribute mapping AD group to "VDI:Production" category > Flow evaluation: System > Quarantine > Isolation > Application > Custom rules > Deny all else > Activate
- C) Flow > Policies > New VDI Policy > Scope by category "VDI:Production" (LDAP backend configured) > Rules evaluation order: Quarantine (highest priority) → Isolation → Application → VDI (lowest priority) > Configure rules per tier > Apply
- D) Administration > Flow > VDI Category Policy > Map AD group to category > Configure Isolation rules > Set Application whitelist > VDI policy rules > Enforcement order > Save

**Answer: C**
In Flow, create a new VDI policy scoped to the "VDI:Production" category (configured with LDAP backend to sync from AD group membership, requires LDAP port 389). The evaluation order is fixed: Quarantine rules (highest priority) → Isolation rules → Application rules → VDI rules (lowest priority). Configure rules at each tier and apply; default behavior is deny-all for traffic not matching a rule.

---

### Q26. Implementing Network Segmentation - CVM Management vs VM Production Traffic
Your security team requires network segmentation to isolate CVM management traffic from VM production traffic. How should you validate your VLAN configuration against design specifications?

- A) Navigate to Prism Element > Network > Virtual Networks > Verify CVM management VLAN (dedicated, restricted to CVM subnet) is separate from VM production VLANs > Check AHV Host VLAN isolation > Review against NVD-2031 networking guide
- B) Use AHV host CLI to verify: `ovs-vsctl show` displays bridge configuration; confirm CVM management bridge separate from br-int (VM bridge); validate VLAN tags don't overlap
- C) In Prism, check Cluster > Network Configuration > CVM VLAN: one dedicated IP range, separate from VM network ranges; verify firewall rules restrict CVM-to-VM direct traffic
- D) All of the above validate proper network segmentation per NVD-2031

**Answer: D**
All steps are necessary to validate proper segmentation. In Prism, verify CVM management VLAN uses a dedicated, restricted subnet separate from VM production networks. On AHV hosts, use `ovs-vsctl show` to confirm bridge separation (CVMs on dedicated bridge, VMs on br-int). Review firewall policies to ensure CVM management traffic cannot route directly to VM production VLANs. Cross-reference against NVD-2031 security architecture guide.

---

## SECTION 4: DESIGN (4 Questions)

### Q27. Creating RF=1 Container for Temporary Scratch Data
Your cluster needs to host temporary build artifacts and staging data that doesn't require redundancy. When is an RF=1 (Replication Factor 1) container appropriate, and how do you create it?

- A) RF=1 is appropriate for temp data, build caches, non-critical staging workloads. Trade-off: no data protection if node fails, but significantly better performance. Create: Prism Element > Storage > Containers > Create > Name, pool selection > Replication Factor: 1 > Advanced: no snapshots > Create
- B) RF=1 should never be used in production. Only acceptable for development/test VMs. Use ncli ctr create --container-name=scratch --pool=pool1 --replication-factor=1
- C) RF=1 containers lack HA. Use only for read-only workloads or data that can be regenerated. Prism: Storage > Containers > Advanced Settings > RF = 1 > Accept warning > Save
- D) Cannot create RF=1 on clusters with HA enabled. Requires standalone single-node mode.

**Answer: A**
RF=1 containers are appropriate for temporary scratch data, build caches, non-critical staging workloads, and test environments. The tradeoff is NO data redundancy if a node fails (data loss is possible), but you gain significant performance improvement due to no replication overhead. Create via Prism Element > Storage > Containers > Create, select pool, and set Replication Factor to 1.

---

### Q28. Configuring Load-Balanced Volume Group for Oracle RAC
You're deploying an Oracle RAC cluster requiring shared storage with load balancing across multiple CVMs for iSCSI connectivity. How do you configure a Volume Group to enable load balancing for RAC iSCSI initiators?

- A) Prism Element > Storage > Volume Groups > Create > Add vDisks > Enable "Load Balancing" toggle under iSCSI settings > Path selection policy: Round-Robin > Active-Active mode > Save
- B) Create Volume Group with multiple vDisks > iSCSI Configuration > Enable vDisk load balancing > Set path selection to "Active-Active" across multiple Stargate instances > Configure multipathing on hosts
- C) Volume Groups > New VG > vDisk layout: distribute across multiple CVMs > iSCSI settings > Load Balancing: "Enabled" > Automatic failover: yes > MPIO on Oracle hosts required
- D) Storage > Volume Groups > iSCSI Load Balancing: set "Round-Robin" load distribution across available CVMs > Create multiple iSCSI target portals per VG > Configure MPIO on Oracle initiators

**Answer: B**
Create a Volume Group with multiple vDisks distributed across different CVMs/pools. In iSCSI configuration, enable "vDisk load balancing" to distribute I/O across multiple Stargate instances. Set path selection to "Active-Active" mode allowing simultaneous use of all paths. Configure MPIO (Multipath I/O) on Oracle RAC hosts to leverage the multiple iSCSI paths for load distribution and resilience.

---

### Q29. Validating CVM/Hypervisor VLAN Configuration Against NVD-2031
Your security team requires validation that cluster VLAN configuration aligns with Nutanix's NVD-2031 network design specification. What deviations should you identify and correct?

- A) Compare current VLAN setup to NVD-2031 spec: management VLAN should be isolated from VM network VLAN, storage traffic may share VM VLAN or be separate, iLO/BMC on separate out-of-band VLAN, AHV migration/heartbeat on dedicated VLAN. Document any deviations for remediation.
- B) NVD-2031 specifies mandatory VLAN separation: CVM management, VM production, iSCSI storage, replication, iLO. Any shared VLAN is a design violation requiring refactoring.
- C) Check Prism > Network > VLAN assignments match NVD-2031 minimum requirements: separate CVM management, dedicated VM VLAN, storage on same as VMs acceptable per standard
- D) NVD-2031 recommendations are optional guidance. Standard best practice is: 1 VLAN for all cluster traffic, separate management subnet for security

**Answer: A**
Reference NVD-2031 network design guide. Compare your configuration against these baseline requirements: CVM management traffic on isolated VLAN separate from VM network VLANs; storage traffic on dedicated VLAN or shared with VMs (both acceptable); iLO/IPMI on separate out-of-band VLAN; AHV host heartbeat on dedicated VLAN. Document any deviations (shared management/VM VLAN, storage on management VLAN, etc.) for remediation.

---

### Q30. Validating Cluster HA Configuration for N+1 Redundancy
Your cluster design must provide N+1 redundancy per NVD specifications. How do you validate HA is properly configured in Prism, and what settings must you verify?

- A) Prism Element > Cluster > Availability > Verify "Redundancy Factor: N+1" enabled > HA reservation shows nodes reserved for failover > Admission control rejects VMs that exceed available capacity > Validate RF=2 minimum for critical containers
- B) Check Prism > Administration > High Availability > Status: "HA Healthy" > Verify VM protection enabled by default > Reservation: Sufficient nodes reserved > Create test VM > Live migrate to confirm HA restart capability
- C) Cluster settings > HA Configuration > Admission Control: "Enabled" > Reservation: minimum N+1 capacity reserved > All nodes healty and connected > vMotion/Live migration working > Verify RF=2 on user containers
- D) Settings > Cluster Redundancy > Confirm Redundancy Factor > HA Orchestration running > Isolation Response configured > Verify all VMs protected by HA

**Answer: C**
Validate HA configuration in Prism Element > Cluster Settings > High Availability. Confirm: (1) Admission Control is enabled to prevent over-provisioning, (2) at least N nodes worth of capacity is reserved for failover (where N = cluster node count), (3) all nodes are healthy and connected, (4) vMotion/Live migration is functional, (5) critical user-created containers use RF=2 or higher for data protection. These elements together ensure N+1 redundancy.

---

## SECTION 5: BUSINESS CONTINUITY (10 Questions)

### Q31. Troubleshooting Protection Policy - VMs Not Auto-Assigned to Target
A protection policy configured with automatic target cluster assignment stops assigning new VMs. Previously created VMs replicate normally, but new VMs are not added to the policy. What are the likely root causes and diagnostic steps?

- A) Navigate to Prism Central > Data Protection > Policies > Check "Automatic target assignment" toggle is still enabled > Verify categories on new VMs match policy filter > Check remote cluster connectivity in "Clusters" page > Verify replication licenses on source and target
- B) Diagnostic: 1) Check policy category scope - new VMs may not have required category tags. 2) Verify target cluster capacity - assignment halts if target full. 3) Check Remote Site status is "Active" in Prism Central > Administration > Cluster Connections
- C) Likely cause: Category mismatch (new VMs not tagged with protection policy category) or target cluster connection lost. Verify: 1) New VM has category matching policy filter, 2) Target cluster reachable: `ncli remote-site get-info`, 3) Replication service healthy on both sites
- D) All of the above are valid diagnostic approaches

**Answer: D**
All are essential diagnostics. Check that automatic assignment is enabled in the protection policy. Verify new VMs have the categories matching the policy filter (category mismatch is the most common cause). Verify target cluster connectivity: navigate to Prism Central > Administration > Cluster Connections and confirm status is "Active". Check target cluster has available replication capacity. Use `ncli remote-site get-info` or Prism to verify connectivity.

---

### Q32. Configuring Recovery Plan Network Mapping - Static IP Assignment
You're creating a recovery plan for a database VM with static IP 10.1.1.50 on production VLAN 100. The DR site has VLAN 200 (10.2.1.0/24). You want the VM to get static IP 10.2.1.50 during failover. How do you configure network mapping?

- A) Recovery Plan > Network Mapping > Source VLAN: 100 (10.1.1.0/24) > Target VLAN: 200 (10.2.1.0/24) > IP Mapping Mode: "Static" > Add mapping: 10.1.1.50 → 10.2.1.50 > Save. Requires NGT installed on VM.
- B) Prism Central > Recovery Plans > Network Configuration > Map Production VLAN 100 to DR VLAN 200 > Enable IP translation > Add IP mapping entry > Requires GuestTools for NGT
- C) Recovery Plan > Network > Add Network Mapping > Source: 10.1.1.0/24 on VLAN 100 > Target: 10.2.1.0/24 on VLAN 200 > Static IP mappings: source→target > Enable network virtualization > Apply
- D) Advanced network mapping requires Calm automation. Use Recovery Plan only for VLAN mapping; IP assignment handled by DHCP on target site.

**Answer: A**
In the Recovery Plan, configure Network Mapping: map source VLAN 100 (10.1.1.0/24) to target VLAN 200 (10.2.1.0/24). Set IP Mapping Mode to "Static" and add specific IP mapping entry: source 10.1.1.50 → target 10.2.1.50. This requires Nutanix Guest Tools (NGT, also called GuestTools) installed on the VM; NGT applies the IP address at boot time during failover. Test the mapping in a failover drill before production failover.

---

### Q33. Converting Protection from Asynchronous to Synchronous Replication
Your protection policy currently uses asynchronous replication (RPO ~1 hour). Your compliance requirements changed to require zero RPO. How do you convert to synchronous replication, and what prerequisites must be met?

- A) Edit Protection Policy > Replication Mode: "Synchronous" > Prerequisites: <5ms latency between sites, Metro Availability license required, witness VM must be operational. Failover behavior changes to immediate consistency.
- B) Protection > Policies > Select policy > Change replication: "Sync" > Requirements: both sites must be <10ms apart, metro license, stable network, no bandwidth constraints. Test with one VM first.
- C) Prism Central > Data Protection > Policy > Edit > Replication Type: "Synchronous RPO=0" > Prerequisite checks: confirm <5ms latency, Metro license available, witness configured, both sites optimal state > Apply
- D) Synchronous requires dedicated cluster: can't mix sync and async on same policy. Create new sync-only policy with Metro Availability license, meet latency/witness requirements.

**Answer: A**
Edit the Protection Policy and set Replication Mode to "Synchronous" for zero RPO. Prerequisites: network latency <5ms between source and target (critical), Metro Availability license, witness VM operational and reachable. Synchronous mode ensures every write is replicated before acknowledgment, guaranteeing zero data loss at the cost of higher I/O latency. Test on non-critical VMs before production deployment.

---

### Q34. Troubleshooting Test Failover - VMs Boot with Incorrect IP Addresses
During a failover test, VMs boot successfully on the target cluster but receive incorrect IP addresses from DHCP instead of the mapped static IPs configured in the recovery plan. The network mapping shows correct source→target VLAN and IP mappings. What is the root cause?

- A) NGT (Nutanix Guest Tools) not running on VMs prevents IP mapping application during boot. Verify: `netsh interface ipv4 show config` (Windows) or `ip addr` (Linux) shows DHCP instead of static. Solution: ensure NGT is installed and running on all protected VMs.
- B) IP mapping not applied because recovery plan network mapping isn't enabled. Enable "Apply Network Configuration" toggle in Recovery Plan before test.
- C) DHCP server on target VLAN 200 is assigning incorrect addresses. Add exclusion range or reconfigure DHCP to not serve the static IP range.
- D) Recovery plan metadata not updated. Resave the network mapping configuration to force sync with latest settings.

**Answer: A**
The most common cause is NGT (Nutanix Guest Tools) not installed or running on the protected VMs. NGT is required to apply the static IP address mappings at boot time during failover. Verify NGT is installed and running on protected VMs: on Windows check Services for "Nutanix Guest Tools"; on Linux check `service nutanix-guest-tools status`. Install NGT on all protected VMs before failover. Without NGT, the VM boots with DHCP-assigned addresses ignoring recovery plan mapping.

---

### Q35. Metro Availability Reports "Metro Disabled" After Network Event
Your Metro Availability setup stops replicating after a brief network outage. Prism Central shows "Metro Disabled" status. The witness VM is unreachable from the source cluster. How do you recover Metro Availability?

- A) Restore witness VM network connectivity first. Verify witness VM is operational and reachable: `ping witness-ip` from source cluster. Once connected, Metro auto-recovers within 2 minutes. Verify replication resumes: Prism > Data Protection > Metro status shows "Active"
- B) In Prism Central, navigate to Data Protection > Metro Availability > Disabled > Click "Enable Metro" button > System re-establishes witness connection > Confirm status changes to "Active"
- C) Manual recovery: 1) Restore witness VM connectivity, 2) Prism Central > Data Protection > Edit Metro setup > Verify witness IP is correct > Apply > Metro re-syncs
- D) Metro cannot recover automatically after network event. Must create new Metro Availability setup with new witness VM.

**Answer: A**
The witness VM is critical for Metro Availability quorum. First, restore its network connectivity: verify it's running and reachable via `ping witness-ip` from the source cluster. Once the witness is reachable, Metro Availability automatically recovers and resumes replication within ~2 minutes. Verify recovery: check Prism Central > Data Protection > Metro status shows "Active" and replication metrics show resuming activity.

---

### Q36. Recovery Plan Failover Fails - "VM Network Not Found on Target Cluster"
During failover, you receive error "VM network [name] not found on target cluster." The recovery plan network mapping is configured. What is the cause and how do you resolve it?

- A) The virtual network referenced in the recovery plan doesn't exist on the target cluster. Create matching virtual network on target cluster: Prism Element > Network > Virtual Networks > Create > Name/VLAN matching source network > Create. Then update recovery plan network mapping > Apply and retry failover.
- B) Network mapping in recovery plan doesn't match actual target cluster network. Edit recovery plan > Network Mapping > Verify target network name/VLAN is correct for target cluster > Correct any mismatches > Save > Retry failover.
- C) Virtual network name exists but with different VLAN tag. Edit recovery plan mapping: ensure mapped target network uses same VLAN or confirm target has network on correct VLAN. Failover requires exact VLAN match.
- D) All of the above - verify network exists on target, recovery plan mapping is correct, VLAN tags match

**Answer: D**
The error indicates the virtual network referenced in the recovery plan doesn't exist on the target cluster. Verify: (1) the target cluster has a virtual network matching the recovery plan's target network name, (2) the network uses the correct VLAN (e.g., VLAN 200 for the mapped target network), (3) recovery plan network mapping points to the correct network on the target. Create the network if missing, correct the mapping if needed, then retry failover.

---

### Q37. Recovery Plan Test Failover Script Timeout - Pre-Recovery Script Exceeds Time Limit
Your recovery plan includes a pre-recovery script (database pre-flight checks) that times out during failover test. Error: "Script exceeded execution timeout of 120 seconds." The script actually takes 180 seconds to complete. How do you resolve this?

- A) Recovery Plan > Execution Settings > Pre-Recovery Script > Timeout: increase from default 120s to 180s (or higher) > Apply > Retry test failover
- B) Optimize the pre-recovery script to complete in <120 seconds. Refactor database checks for parallel execution or simplify validation logic.
- C) Split pre-recovery script into multiple smaller scripts, each <120s, executed sequentially in the recovery plan runbook
- D) A or B - either increase timeout or optimize the script

**Answer: D**
You have two options: (1) increase the timeout threshold - edit the Recovery Plan, locate Execution Settings or Pre-Recovery Script configuration, increase timeout from default 120 seconds to 180+ seconds, and re-test, OR (2) optimize the pre-recovery script to complete within 120 seconds by parallelizing checks or removing unnecessary steps. For compliance-critical scripts, increasing timeout is often the safer approach to ensure completeness.

---

### Q38. Verifying AIDE Baseline Status and SCMA Schedule
Your security audit requires verification that AIDE (Advanced Intrusion Detection Engine) is properly configured on all CVMs with daily baselines, and SCMA (Secure Cluster Monitoring Agent) is scheduled correctly. What commands provide this verification?

- A) `ncli cluster get-cvm-security-config` shows "Enable Aide: true" and "Aide Schedule: DAILY". `ncli cluster get-scma-info` shows schedule and status.
- B) SSH to CVM and check: `/var/log/aide-baseline.log` shows daily scheduled execution, `systemctl status aide-monitor` running
- C) Prism Element > Security > AIDE Configuration shows "Enabled: yes" and "Schedule: Daily". Verify SCMA: Administration > Monitoring > SCMA Status shows "Active" with daily collection
- D) A and B together provide full verification - ncli commands show policy, log files and systemctl confirm actual execution

**Answer: A**
Use `ncli cluster get-cvm-security-config` to verify AIDE is enabled and scheduled. The output displays "Enable Aide: true" and "Aide Schedule: WEEKLY" confirming the weekly baseline and monitoring configuration. Use `ncli cluster get-scma-info` to verify SCMA configuration and collection schedule. These commands provide the authoritative configuration state. Verify the schedule matches security policy requirements and AIDE status is "true". This satisfies security audit requirements for AIDE configuration verification.

---

### Q39. Collecting Logs from Prism Element UI for Stargate Service Crash
You need to collect diagnostic logs for a Stargate service crash that occurred in the last 2 hours. You want to gather logs from all CVMs covering this timeframe from Prism Element UI (not CLI). How do you do this?

- A) Prism Element > Gear icon > Log Collector > Set Start time: 2 hours ago > Select Components: Stargate > Download logs > Logs include all CVMs with Stargate activity in the window
- B) Administration > Logs > Filter: Service=Stargate, Time range=Last 2 hours > Export > Logs saved to local directory
- C) Cluster > Diagnostics > System Logs > Time Range: Last 2 hours > Services: Stargate > Collect > Wait for bundle to complete > Download
- D) Prism Element > System > Logs > Advanced Filter > Stargate errors, last 2 hours > Generate Report > Download

**Answer: A**
Navigate to Prism Element, click the Gear icon (Administration) > Log Collector. Set the start time to 2 hours ago (or select a time range). Select "Stargate" from the Components list. Click Collect/Download to gather logs from all CVMs covering the Stargate service during the specified timeframe. The log bundle will include Stargate daemon logs and related system messages helpful for root-cause analysis.

---

### Q40. Troubleshooting Protection Policy vs Protection Domain - Category-Based Replication Fails
You've been asked to troubleshoot why a protection policy (Prism Central managed) isn't replicating a VM to the target site. The policy is category-based and should apply to all VMs tagged "Compliance:Backup=yes". The VM exists but isn't replicating. What are the diagnostic steps?

- A) Verify VM has correct category assigned: Prism Central > VMs > Select VM > Categories tab > Confirm category "Compliance:Backup" with value "yes" is present. Check policy scope: Data Protection > Policies > Verify policy filter matches. Check remote site: Clusters > Remote sites shows target site "Active". If any missing, correct and replication starts within minutes.
- B) Confirm protection policy (not protection domain) is in use. Protection domains are PE-managed legacy feature; protection policies are PC-managed (current). Verify: Prism Central > Data Protection > Policies (not Domains). Check VM category match, remote site connectivity, replication license availability.
- C) Run diagnostic: `ncli datastore get-protection-policies` on PE shows policy configured. Verify VM is assigned: `ncli vm get vm-name` shows protection policy in metadata. Check connectivity: `ncli remote-site get-info` shows target site reachable.
- D) All of the above - comprehensive approach checks category assignment, protection policy scope, remote site connectivity, and licensing

**Answer: D**
Comprehensive troubleshooting requires checking multiple factors: (1) Verify the VM has the correct category tag matching the protection policy filter (Prism Central > VMs > Categories), (2) Confirm you're using protection policies (PC-managed, current) not protection domains (PE-managed, legacy), (3) Check remote site connectivity (Prism Central > Administration > Clusters > Remote Sites shows "Active"), (4) Verify replication license availability. Category mismatch is the most common cause; incorrect scope or missing remote site connectivity are also typical issues.

---

---

## ANSWER KEY

| Question | Answer |
|----------|--------|
| Q1 | C |
| Q2 | A |
| Q3 | A |
| Q4 | B |
| Q5 | B |
| Q6 | A |
| Q7 | B |
| Q8 | A |
| Q9 | B |
| Q10 | B |
| Q11 | A |
| Q12 | B |
| Q13 | A |
| Q14 | A |
| Q15 | B |
| Q16 | A |
| Q17 | C |
| Q18 | D |
| Q19 | A |
| Q20 | A |
| Q21 | A |
| Q22 | A |
| Q23 | B |
| Q24 | A |
| Q25 | C |
| Q26 | D |
| Q27 | A |
| Q28 | B |
| Q29 | A |
| Q30 | C |
| Q31 | D |
| Q32 | A |
| Q33 | A |
| Q34 | A |
| Q35 | A |
| Q36 | D |
| Q37 | D |
| Q38 | A |
| Q39 | A |
| Q40 | D |

---

**Exam Notes:**
- These questions emphasize LIVE LAB scenarios requiring hands-on Prism Element/Central UI navigation and CLI command execution
- Each question includes specific prerequisites, configuration steps, and troubleshooting approaches
- Master-level difficulty targets deep product knowledge across monitoring, optimization, security, design, and business continuity domains
- References to KB articles, technotes, and design standards (NVD-2031, BP-2015, TN-2164) simulate real exam content
- Suggested study: perform each scenario in a lab environment; practice CLI commands and UI navigation paths
