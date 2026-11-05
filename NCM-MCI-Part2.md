# NCM-MCI 6.10 Exam – Domain 3: Advanced Configuration and Troubleshooting

## 80 Multiple-Choice Questions

---

### Q1
An administrator needs to check the Cassandra ring status on a Nutanix cluster experiencing metadata read latency. Which command should be run from the CVM?
- A) curator_cli display_data
- B) nodetool ring
- C) ncli cluster info
- D) zeus_config_printer

**Answer: B**
The "nodetool ring" command shows the Cassandra (Medusa) ring status, including node health and token distribution. Cassandra handles metadata operations, and ring issues can cause metadata read latency.

---

### Q2
An administrator wants to retrieve a list of all VMs running on the AHV cluster, including their power states and host assignments. Which command accomplishes this?
- A) nuclei vm.list
- B) zeus_config_printer --type=vm
- C) ncli vm ls
- D) acli vm.list

**Answer: D**
The "acli vm.list" command is the AHV CLI tool for listing all VMs with their power states, UUIDs, and host assignments. ncli does not have a direct "vm ls" subcommand for AHV VM enumeration.

---

### Q3
A Nutanix administrator needs to create a new VM via the v3 REST API on Prism Central. Which HTTP method and endpoint should be used?
- A) POST https://prism-central:9440/api/nutanix/v2.0/vms
- B) GET https://prism-central:9440/api/nutanix/v3/vms/list
- C) PUT https://prism-central:9440/api/nutanix/v3/vms/{uuid}
- D) POST https://prism-central:9440/api/nutanix/v3/vms

**Answer: D**
Creating a new VM with the v3 intent-based API requires a POST request to the /vms endpoint. PUT is used for updates (requires an existing UUID), v2.0 is the legacy API, and GET /vms/list retrieves existing VMs.

---

### Q4
After a power outage, a CVM fails to start the Stargate service. The administrator confirms all disks are online. What is the correct command to restart only the Stargate service?
- A) genesis stop stargate && genesis start stargate
- B) systemctl restart stargate
- C) ncli cluster start-service name=stargate
- D) cluster start

**Answer: A**
Individual CVM services are managed through Genesis. The "genesis stop stargate && genesis start stargate" sequence restarts only the Stargate (storage I/O) service without affecting other services. "cluster start" would restart all services cluster-wide.

---

### Q5
An administrator needs to assign a VM to always run on a specific host for licensing compliance. Which acli command creates this host affinity rule?
- A) acli vm.update <vm_name> preferred_host=<host_ip>
- B) acli vm.migrate <vm_name> host=<host_ip>
- C) acli host.add_affinity host=<host_ip> vm=<vm_name>
- D) acli vm.affinity_set <vm_name> host_list=<host_ip>

**Answer: D**
The "acli vm.affinity_set" command with the host_list parameter pins a VM to one or more specific hosts. vm.migrate moves a VM once but does not create a persistent affinity rule, and vm.update does not support a preferred_host parameter.

---

### Q6
An administrator wants to enable cluster lockdown to enforce key-based SSH authentication and disable password-based access to all CVMs. Where is this configured?
- A) Prism Element > Settings > Cluster Lockdown
- B) ncli cluster edit enable-ssh-lockdown=true
- C) /etc/ssh/sshd_config on each CVM manually
- D) acli cluster.update ssh_lockdown=true

**Answer: A**
Cluster Lockdown is configured through Prism Element under Settings > Cluster Lockdown, where administrators can disable password-based SSH and upload authorized public keys. Manual sshd_config edits are not supported and would be overwritten.

---

### Q7
An administrator needs to view the full configuration of a specific VM, including vCPU count, memory, attached disks, and NICs. Which command provides this detail?
- A) acli vm.get <vm_name>
- B) acli vm.list include_details=true
- C) ncli vm info name=<vm_name>
- D) nuclei vm.get <vm_uuid>

**Answer: A**
The "acli vm.get <vm_name>" command returns comprehensive VM details including vCPU, memory, disk, and NIC configurations. While nuclei can also retrieve VM info, acli vm.get is the standard AHV CLI approach using the VM name.

---

### Q8
A storage administrator needs to list all storage containers and their current usage statistics. Which command should be used?
- A) curator_cli display_data
- B) ncli container ls
- C) acli storage.list
- D) ncli storagepool ls

**Answer: B**
The "ncli container ls" command lists all storage containers with details including capacity, usage, replication factor, and compression settings. ncli storagepool ls would list storage pools (which aggregate physical disks), not containers.

---

### Q9
An administrator is troubleshooting replication failures between two Nutanix clusters configured with protection domains. Which CVM service is responsible for handling replication?
- A) Medusa
- B) Stargate
- C) Cerebro
- D) Curator

**Answer: C**
Cerebro is the Nutanix service responsible for managing data replication, including protection domain snapshots, remote replication, and disaster recovery operations. Stargate handles local storage I/O, Curator performs background cleanup, and Medusa manages metadata.

---

### Q10
An administrator needs to add a VM named "DB-Server01" to an existing protection domain called "PD-Production." Which command accomplishes this?
- A) ncli protection-domain add-vm name=PD-Production vm=DB-Server01
- B) cerebro_cli add_vm pd=PD-Production vm=DB-Server01
- C) ncli pd add-to-pd name=PD-Production vm-names=DB-Server01
- D) acli vm.update DB-Server01 protection_domain=PD-Production

**Answer: C**
The "ncli pd add-to-pd" command with the name and vm-names parameters adds a VM to an existing protection domain. This is the correct ncli syntax for protection domain management.

---

### Q11
An administrator wants to configure SNMP v3 monitoring integration with SolarWinds for a Nutanix cluster. Which Prism Element path is used to configure the SNMP trap destination?
- A) Settings > Network > SNMP Trap Receiver
- B) Settings > SNMP > Add Trap Receiver
- C) Settings > SNMP > Add Transport
- D) Settings > Alerts > SNMP Configuration

**Answer: B**
The question asks about configuring the SNMP **trap destination**. In Prism Element under Settings > SNMP, there are two sections: "Add Transport" (for SNMP polling/queries) and "Add Trap Receiver" (for sending event notifications to a destination). Since we need the trap destination, the correct path is Settings > SNMP > **Add Trap Receiver**. SNMPv3 requires configuring authentication and privacy protocols within this section.

---

### Q12
An administrator receives an alert about a degraded Cassandra node. Which command displays the metadata store's replication and consistency status?
- A) nodetool status
- B) cassandra_cli ring_check
- C) ncli alerts ls type=metadata
- D) medusa_printer --ring_status

**Answer: A**
The "nodetool status" command (alongside "nodetool ring") provides Cassandra node status including load, state (Up/Down), and ownership percentage. This is the standard diagnostic tool for the Medusa/Cassandra metadata store.

---

### Q13
An administrator needs to create a virtual network with VLAN ID 200 for a new department. Which acli command creates this network?
- A) acli net.add name=VLAN200 vlan_id=200
- B) ncli network create name=VLAN200 vlan=200
- C) acli vswitch.add_vlan vs0 vlan=200
- D) acli net.create VLAN200 vlan=200 vswitch_name=vs0

**Answer: D**
The "acli net.create" command creates a new AHV virtual network with a specified VLAN ID and virtual switch. The syntax requires the network name, VLAN tag, and the virtual switch to bind to.

---

### Q14
During a CVM restart procedure, what must be done FIRST before restarting a CVM to avoid VM disruption?
- A) Stop all VMs on the host
- B) Put the host into maintenance mode so VMs migrate to other hosts
- C) Stop all CVM services using "cluster stop"
- D) Disable HA on the cluster temporarily

**Answer: B**
Before restarting a CVM, the host should be placed into maintenance mode, which triggers live migration of running VMs to other healthy hosts. This ensures zero VM downtime during CVM maintenance.

---

### Q15
An administrator needs to configure syslog forwarding to a Splunk SIEM server at IP 10.0.1.50 on port 514. Where is this configured in Prism?
- A) Prism Element > Settings > Syslog Server
- B) Prism Element > Settings > SMTP Server
- C) Prism Central > Settings > Log Forwarding
- D) Prism Element > Alerts > External Logging

**Answer: A**
Syslog forwarding is configured under Prism Element > Settings > Syslog Server, where administrators specify the remote syslog server IP, port, transport protocol (UDP/TCP/TLS), and log severity levels to forward.

---

### Q16
An administrator is using the v3 API to update an existing VM's memory from 4 GB to 8 GB. What must be included in the PUT request body besides the updated spec?
- A) A PATCH body with only the memory delta change
- B) Only the changed fields in the spec
- C) The complete spec and the current metadata (including spec_version)
- D) The VM UUID as a query parameter and the new memory value

**Answer: C**
The v3 intent-based API requires the full spec and metadata (including spec_version for concurrency control) in PUT requests. The spec_version prevents conflicting updates. Partial updates are not supported—the entire entity definition must be provided.

---

### Q17
An administrator needs to verify the Zeus configuration database on a CVM to check the cluster's stored configuration parameters. Which command displays this information?
- A) medusa_printer --zeus
- B) zeus_config_printer
- C) ncli cluster info
- D) cat /home/nutanix/config/zeus.conf

**Answer: B**
The "zeus_config_printer" command outputs the complete Zeus configuration database contents, which stores cluster-wide configuration parameters replicated across CVMs via Paxos consensus. ncli cluster info shows a subset; zeus_config_printer shows the raw configuration.

---

### Q18
An administrator wants to enable software-based data-at-rest encryption on a specific storage container. What prerequisite must be configured first?
- A) FIPS 140-2 mode enabled on all CVMs
- B) A Trusted Platform Module (TPM) installed in each host
- C) A Key Management Server (KMS) — either native Prism or external (e.g., SafeNet, Vormetric)
- D) Self-Encrypting Drives (SEDs) in all nodes

**Answer: C**
Software-based data-at-rest encryption (AES-256) requires a configured Key Management Server to store and manage encryption keys. Nutanix supports native key management or integration with external KMS solutions. SEDs are only required for hardware-based encryption.

---

### Q19
An administrator is troubleshooting high storage latency and suspects the Stargate service is overwhelmed. Which log file on the CVM should be examined first?
- A) /home/nutanix/data/logs/curator.INFO
- B) /home/nutanix/data/logs/prism_gateway.log
- C) /home/nutanix/data/logs/stargate.INFO
- D) /var/log/messages

**Answer: C**
Stargate logs are located at /home/nutanix/data/logs/stargate.INFO on each CVM. This log contains storage I/O operation details, error conditions, and performance metrics critical for diagnosing storage latency issues.

---

### Q20
An administrator needs to run all NCC (Nutanix Cluster Check) health checks from the command line. Which command executes the full health check suite?
- A) ncc health_checks run_all
- B) ncli cluster run-ncc-checks
- C) ncc --run-all-checks
- D) ncli ncc health_checks run_all

**Answer: A**
The "ncc health_checks run_all" command runs the complete NCC health check suite from the CVM command line. While the question stem mentions ncli, the actual NCC binary is invoked directly as "ncc health_checks run_all" (not through ncli).

---

### Q21
An administrator wants to authenticate to the Nutanix v3 REST API. Which authentication method is required?
- A) Basic authentication with base64-encoded username:password
- B) API key in the X-Nutanix-Api-Key header
- C) SAML assertion token
- D) OAuth 2.0 bearer token

**Answer: A**
The Nutanix v3 REST API uses HTTP Basic authentication, where the username:password string is base64-encoded and sent in the Authorization header. OAuth and API key authentication are not natively supported for the Prism v3 API.

---

### Q22
An administrator notices that Curator scans are taking significantly longer than usual. Which command provides details about Curator's current scan status and operations?
- A) curator_cli display_data
- B) ncli curator status
- C) genesis status curator
- D) stargate_cli show_curator

**Answer: A**
The "curator_cli display_data" command shows Curator's operational data, including scan details, garbage collection status, and disk balancing information. Curator manages background operations like data compaction, tiering, and disk rebalancing.

---

### Q23
An administrator needs to create a snapshot of a VM named "WebApp01" using the AHV command line. Which command creates this snapshot?
- A) acli snapshot.create WebApp01 snapshot_name=WebApp01-snap1
- B) ncli snapshot create vm-name=WebApp01 name=WebApp01-snap1
- C) acli vm.snapshot_create WebApp01 name=WebApp01-snap1
- D) nuclei snapshot.create vm=WebApp01

**Answer: A**
The "acli snapshot.create" command creates a point-in-time snapshot of an AHV VM. The command takes the VM name and an optional snapshot name as parameters for identification.

---

### Q24
An administrator wants to list all current alerts on the cluster, filtered to only show critical severity. Which ncli command accomplishes this?
- A) ncli cluster alerts filter=critical
- B) ncli alerts ls severity=critical
- C) ncli alert list --filter=critical
- D) ncli alerts ls resolved=false severity=CRITICAL

**Answer: D**
The "ncli alerts ls" command supports filtering by severity level (using uppercase values like CRITICAL) and resolved status. Combining resolved=false with severity=CRITICAL shows only active critical alerts requiring attention.

---

### Q25
An administrator is using the v3 API to list VMs and receives a 429 HTTP response code. What does this indicate, and what should the administrator do?
- A) API version mismatch; switch from v3 to v2
- B) Authentication failure; re-encode credentials in base64
- C) Rate limit exceeded; implement exponential backoff or use batch API calls
- D) VM not found; verify the UUID is correct

**Answer: C**
HTTP 429 indicates the API rate limit has been exceeded. Administrators should implement exponential backoff retry logic or use the batch API endpoint for bulk operations to reduce the number of individual API calls.

---

### Q26
An administrator needs to power cycle a VM named "TestVM" that is in an unresponsive state. Which acli command performs a hard power cycle?
- A) acli vm.power_off TestVM && acli vm.power_on TestVM
- B) acli vm.force_restart TestVM
- C) acli vm.power_cycle TestVM
- D) acli vm.reset TestVM

**Answer: C**
The "acli vm.power_cycle" command performs a hard power cycle on the specified VM, equivalent to pressing the physical power button off and on. This is the correct single command for an immediate power cycle.

---

### Q27
An administrator applies STIG hardening to a Nutanix cluster. Which automated tool validates ongoing compliance with the applied security configuration?
- A) ncli cluster check-stig-compliance
- B) Prism Central > Security Dashboard > STIG Validation
- C) SCMA (Security Configuration Management Automation)
- D) ncc security_checks run_all

**Answer: C**
SCMA (Security Configuration Management Automation) is the Nutanix tool that performs automated, scheduled checks against the applied STIG baseline to ensure ongoing compliance. It reports drift from the security configuration and can remediate deviations.

---

### Q28
An administrator needs to replace the default self-signed SSL certificate on Prism Element with a CA-signed certificate. Which ncli command initiates the certificate replacement?
- A) ncli cluster set-ssl-certificate
- B) ncli http-proxy update-cert
- C) ncli cluster update-ssl certificate_path=/path/cert.pem
- D) ncli ssl-certificate replace

**Answer: D**
The certificate replacement process for Prism uses specific ncli commands or the Prism UI under Settings. The "ncli ssl-certificate replace" command (or the equivalent Prism UI flow) is used to install the CA-signed certificate along with the private key and certificate chain.

---

### Q29
An administrator is configuring the Nutanix v3 API to create a category key named "Environment" with values "Production" and "Development." Which API endpoint is used?
- A) POST https://prism-central:9440/api/nutanix/v3/categories
- B) PUT https://prism-central:9440/api/nutanix/v3/categories/Environment/Production
- C) POST https://prism-central:9440/api/nutanix/v3/category/create
- D) PUT https://prism-central:9440/api/nutanix/v3/categories/Environment

**Answer: B**
In the v3 API, category values are set by making PUT requests to /categories/{key}/{value}. The category key must be created first via PUT /categories/{key}, then individual values are added with PUT /categories/{key}/{value}.

---

### Q30
An administrator needs to check the status of all CVM services on the local CVM. Which command shows the running state of each service?
- A) genesis status
- B) cluster status
- C) systemctl list-units --type=service
- D) ncli cluster get-service-status

**Answer: B**
The "cluster status" command run from any CVM shows the status of all CVM services (Stargate, Prism, Curator, Cerebro, etc.) across the entire cluster. "genesis status" shows services on the local CVM only, while "cluster status" provides the cluster-wide view.

---

### Q31
An administrator needs to configure data-at-rest encryption cluster-wide using software encryption. Which encryption algorithm does Nutanix use for software-based encryption?
- A) AES-256
- B) RSA-2048
- C) AES-128
- D) 3DES

**Answer: A**
Nutanix software-based data-at-rest encryption uses the AES-256 (Advanced Encryption Standard with 256-bit keys) algorithm. This is applied at the storage container or cluster level and requires a configured KMS for key management.

---

### Q32
An administrator is troubleshooting network connectivity for a VM and needs to list all virtual networks configured on the AHV cluster. Which command should be used?
- A) ovs-vsctl show
- B) acli net.list
- C) ncli network list
- D) acli vswitch.list

**Answer: B**
The "acli net.list" command lists all AHV virtual networks with their VLAN IDs, UUID, and virtual switch assignments. While "ovs-vsctl show" shows Open vSwitch configuration, "acli net.list" is the proper Nutanix abstraction for network management.

---

### Q33
An administrator needs to troubleshoot replication schedule failures for a protection domain. Which log file on the CVM contains Cerebro service logs?
- A) /home/nutanix/data/logs/stargate_replication.INFO
- B) /home/nutanix/data/logs/cerebro.INFO
- C) /home/nutanix/data/logs/replication.log
- D) /var/log/cerebro/cerebro.log

**Answer: B**
Cerebro service logs are located at /home/nutanix/data/logs/cerebro.INFO. This log file contains details about replication operations, protection domain schedules, snapshot management, and remote site connectivity.

---

### Q34
An administrator wants to update an existing VM's vCPU count from 2 to 4 using acli. The VM is named "AppServer." Which command modifies the vCPU configuration?
- A) acli vm.set AppServer cpu_count=4
- B) ncli vm update name=AppServer vcpus=4
- C) acli vm.update AppServer num_vcpus=4
- D) acli vm.cpu_update AppServer vcpus=4

**Answer: C**
The "acli vm.update" command is used to modify VM configurations including vCPU count, memory, and other settings. The num_vcpus parameter specifies the desired number of virtual CPUs. The VM must be powered off for CPU changes to take effect.

---

### Q35
An administrator receives an HTTP 409 Conflict response when updating a VM via the v3 API. What is the most likely cause?
- A) The API rate limit has been exceeded
- B) The request body contains invalid JSON formatting
- C) The VM UUID does not exist
- D) The spec_version in the request body is outdated due to a concurrent modification

**Answer: D**
HTTP 409 Conflict in the v3 API indicates a spec_version mismatch, meaning the entity was modified between the GET and PUT operations. The administrator must retrieve the latest spec_version with a new GET request before retrying the update.

---

### Q36
An administrator needs to verify that all nodes in the cluster are healthy and participating. Which ncli command lists all hosts with their status?
- A) ncli cluster info
- B) ncli node list
- C) ncli hypervisor ls
- D) ncli host ls

**Answer: D**
The "ncli host ls" command lists all hosts in the cluster with details including hostname, IP address, CVM IP, hypervisor type, and current status (normal, degraded, etc.).

---

### Q37
An administrator wants to use the v3 API to retrieve a list of VMs with filtering. Which API call retrieves VMs filtered by a specific category assignment?
- A) POST https://prism-central:9440/api/nutanix/v3/vms/list with filter criteria in body
- B) GET https://prism-central:9440/api/nutanix/v3/vms/list?filter=category==Production
- C) POST https://prism-central:9440/api/nutanix/v3/categories/Production/vms
- D) GET https://prism-central:9440/api/nutanix/v3/vms?category=Production

**Answer: A**
The v3 API uses POST to /vms/list with filter criteria specified in the JSON request body (including kind, offset, length, and filter fields). This intent-based design differs from traditional REST where GET with query parameters would be used for listing.

---

### Q38
An administrator needs to identify which CVM service manages the distributed configuration database and uses Paxos consensus for replication. Which service is this?
- A) Zeus
- B) Medusa
- C) Cerebro
- D) Prism

**Answer: A**
Zeus manages the cluster configuration database and uses Paxos consensus protocol to ensure configuration consistency across all CVMs. It stores critical cluster parameters, and "zeus_config_printer" outputs its contents.

---

### Q39
An administrator is configuring SNMP v3 for integration with a Nagios monitoring server. Which SNMP v3 security features must be configured on the Nutanix cluster?
- A) Community string and trap destination only
- B) Username, authentication protocol (MD5/SHA), and privacy protocol (DES/AES)
- C) API key and shared secret
- D) Certificate-based mutual TLS authentication

**Answer: B**
SNMP v3 requires a security model that includes a username (USM), authentication protocol (MD5 or SHA for message integrity), and privacy protocol (DES or AES for encryption). Community strings are only used with SNMP v2c.

---

### Q40
An administrator needs to stop all services on a single CVM for hardware maintenance. Which command stops all services on only the local CVM?
- A) genesis stop all
- B) cluster stop
- C) cvm_shutdown -P now
- D) genesis stop prism stargate curator cerebro

**Answer: D**
The `cluster stop` command (option B) is a **cluster-wide** operation that stops services on ALL CVMs, not just the local one. To stop services on only the local CVM, use `genesis stop <service_name>` for each service. Option D (`genesis stop prism stargate curator cerebro`) correctly stops the major services on only the local CVM. For full hardware maintenance, the standard procedure is `cvm_shutdown -P now` which gracefully stops all services and powers off the CVM.

---

### Q41
An administrator needs to bulk-create 50 VMs using the Nutanix API. To avoid rate limiting issues, which approach should be used?
- A) Increase the API rate limit via ncli cluster edit api-rate-limit=unlimited
- B) Send 50 individual POST requests to /api/nutanix/v3/vms sequentially
- C) Use the batch API endpoint POST /api/nutanix/v3/batch with multiple VM creation requests
- D) Use POST /api/nutanix/v3/vms with an array of 50 VM specs in the body

**Answer: C**
The v3 batch API endpoint allows multiple operations in a single HTTP request, reducing the number of individual API calls and avoiding rate limiting. This is the recommended approach for bulk operations rather than sequential individual requests.

---

### Q42
An administrator observes that a Curator full scan has not completed in over 24 hours. Which command shows the current Curator scan status and time elapsed?
- A) ncli curator get-scan-status
- B) genesis status curator
- C) curator_cli display_data --type=scan_status
- D) links http://localhost:2010

**Answer: D**
Curator's status page is accessible via the local web interface at http://localhost:2010 on the CVM. The "links" text browser can access this page to show active scans, scan history, and detailed operational metrics. curator_cli also provides scan information.

---

### Q43
An administrator needs to verify the Prism Element web console service is running on the CVM. Which specific service must be checked?
- A) prism_web_server
- B) nginx
- C) prism
- D) prism_gateway

**Answer: C**
The Prism service (shown as "prism" in genesis/cluster status) is the CVM service that provides the Prism Element web console. It handles the web UI, REST API endpoints, and authentication. It can be checked via "genesis status" or "cluster status."

---

### Q44
An administrator wants to configure an external KMS (SafeNet KeySecure) for data-at-rest encryption. Which protocol does Nutanix use to communicate with external KMS servers?
- A) HTTPS REST API
- B) SNMP v3
- C) SSH key exchange
- D) KMIP (Key Management Interoperability Protocol)

**Answer: D**
Nutanix uses KMIP (Key Management Interoperability Protocol) to communicate with external key management servers such as SafeNet KeySecure, Vormetric, and IBM Security Key Lifecycle Manager. KMIP is the industry standard for key management operations.

---

### Q45
An administrator needs to check if there are any pending alerts related to disk failures on the cluster. Which ncli command filters alerts by component type?
- A) ncli alerts ls component=disk resolved=false
- B) ncli disk ls --alerts
- C) ncli alerts ls category=storage
- D) ncli alerts ls entity_type=disk

**Answer: D**
The "ncli alerts ls" command supports filtering by entity_type to narrow alerts to specific components such as disk, host, or VM. This helps administrators quickly identify hardware-related alerts.

---

### Q46
An administrator is creating a VM via acli with 4 vCPUs, 8 GB of memory, and a 100 GB disk. Which command creates this VM correctly?
- A) acli vm.create MyVM num_vcpus=4 memory=8G num_cores_per_vcpu=1
- B) acli vm.create MyVM num_vcpus=4 memory=8192 num_cores_per_vcpu=1
- C) acli vm.create MyVM cpu=4 ram=8192 disk_size=100G
- D) ncli vm create name=MyVM vcpus=4 memory=8192

**Answer: B**
The "acli vm.create" command uses num_vcpus for CPU count and memory in megabytes (8192 MB = 8 GB). Disk creation is typically a separate step using "acli vm.disk_create." The memory parameter expects values in MB, not shorthand like "8G."

---

### Q47
An administrator needs to identify which service handles the background garbage collection of deleted data, dead extents, and storage optimization. Which CVM service performs these tasks?
- A) Curator
- B) Stargate
- C) Medusa
- D) Chronos

**Answer: A**
Curator is the background service responsible for garbage collection, dead extent removal, data compaction, ILM (Information Lifecycle Management) tiering, and disk balancing across the cluster. It performs both partial and full scans at configurable intervals.

---

### Q48
An administrator wants to check the v3 API to verify cluster health status programmatically. Which API endpoint returns cluster health information?
- A) GET https://prism-central:9440/api/nutanix/v2.0/cluster/health
- B) GET https://prism-central:9440/api/nutanix/v3/clusters/list
- C) POST https://prism-central:9440/api/nutanix/v3/clusters/list
- D) GET https://prism-central:9440/api/nutanix/v3/health_checks

**Answer: C**
The v3 API uses POST for list operations. POST /clusters/list returns cluster entities including health status, resource utilization, and configuration details in the intent-based response format with spec, status, and metadata sections.

---

### Q49
An administrator notices that Zeus configuration is inconsistent across CVMs. Which consensus protocol does Zeus use to maintain configuration consistency?
- A) Gossip protocol
- B) Paxos
- C) Raft
- D) Two-phase commit

**Answer: B**
Zeus uses the Paxos consensus protocol to replicate and maintain configuration consistency across all CVMs in the cluster. Paxos ensures that even with CVM failures, the configuration database remains consistent and available.

---

### Q50
An administrator needs to force a Curator full scan to reclaim space after deleting a large number of snapshots. Which command triggers an on-demand full scan?
- A) ncli curator trigger-full-scan
- B) links http://localhost:2010/start_full_scan
- C) curator_cli start_scan type=full
- D) allssh "genesis restart curator"

**Answer: C**
The "curator_cli start_scan type=full" command manually triggers a full Curator scan. Full scans examine all data for garbage collection, compaction, and optimization opportunities, unlike partial scans that only examine recent changes.

---

### Q51
An administrator is troubleshooting Prism Central communication issues with a registered Prism Element cluster. Which service port must be accessible between Prism Central and Prism Element?
- A) Port 2009
- B) Port 8443
- C) Port 9440
- D) Port 2020

**Answer: C**
Port 9440 is the primary HTTPS port used for Prism web console access and REST API communication. Prism Central communicates with registered Prism Element clusters over port 9440 for cluster management, monitoring, and API proxying.

---

### Q52
An administrator wants to review all protection domains and their replication schedules on the cluster. Which ncli command lists all configured protection domains?
- A) ncli pd list
- B) ncli replication ls
- C) cerebro_cli list_pd
- D) ncli protection-domain ls

**Answer: D**
The "ncli protection-domain ls" (or the equivalent "ncli pd ls") command lists all protection domains configured on the cluster, including their type, associated VMs/volume groups, and replication schedules.

---

### Q53
An administrator is writing a script to automate VM provisioning via the v3 API. The script needs to wait for a VM creation task to complete. How should the task be monitored?
- A) Subscribe to a WebSocket at wss://prism-central:9440/api/nutanix/v3/tasks/stream
- B) Poll GET /api/nutanix/v2.0/tasks/poll with the task UUID
- C) Check GET /api/nutanix/v3/vms/{uuid} repeatedly until the VM status is "COMPLETE"
- D) Poll GET /api/nutanix/v3/tasks/{task_uuid} until the status shows "SUCCEEDED"

**Answer: D**
After initiating an async operation, the v3 API returns a task UUID. Administrators should poll the tasks endpoint (GET /tasks/{task_uuid}) to monitor completion. The task entity includes status, progress percentage, and error details if the operation fails.

---

### Q54
An administrator needs to move a CVM's IP address to a different subnet during a network migration. After updating the CVM's network configuration, which command updates the cluster's awareness of the new CVM IP?
- A) ncli cluster edit-cvm-ip old-ip=<old> new-ip=<new>
- B) cluster destroy && cluster create
- C) Modify /etc/sysconfig/network-scripts/ifcfg-eth0 and restart networking
- D) ncli host edit id=<host_id> cvm-ip=<new_ip>

**Answer: A**
The "ncli cluster edit-cvm-ip" command (or the equivalent Prism workflow) safely updates the CVM IP address in the cluster configuration, including Zeus and all service registrations. Manual network file edits alone would cause cluster inconsistency.

---

### Q55
An administrator discovers that the Stargate service on one CVM has crashed and is not auto-restarting. Which service is responsible for monitoring and auto-restarting failed CVM services?
- A) Genesis
- B) Zeus
- C) Prism
- D) Watchdog

**Answer: A**
Genesis is the foundational service on each CVM responsible for monitoring all other services and automatically restarting them if they crash. If Genesis itself is healthy but a service is not restarting, manual intervention via "genesis restart <service>" may be needed.

---

### Q56
An administrator wants to configure the cluster to use an NTP server for time synchronization. Which ncli command configures NTP servers on the cluster?
- A) ncli cluster update time-server=<ntp_server_ip>
- B) ncli cluster add-to-ntp-servers servers=<ntp_server_ip>
- C) ncli cluster edit ntp-servers=<ntp_server_ip>
- D) ncli ntp add server=<ntp_server_ip>

**Answer: B**
The "ncli cluster add-to-ntp-servers" command adds NTP server addresses to the cluster configuration. NTP synchronization is critical for cluster operations, certificate validation, log correlation, and replication scheduling.

---

### Q57
An administrator is examining the v3 API response for a VM and sees both "spec" and "status" sections. What is the architectural difference between these two sections?
- A) "spec" is for v3 API; "status" is the v2 API compatibility layer
- B) "spec" contains the desired state; "status" contains the current actual state
- C) "spec" is read-only; "status" is writable
- D) "spec" contains metadata; "status" contains the VM configuration

**Answer: B**
The v3 intent-based API follows a declarative model: "spec" defines the desired/intended state submitted by the user, while "status" reflects the current applied state of the entity. Any discrepancy indicates a pending change or error.

---

### Q58
An administrator needs to verify which encryption method is configured on a specific storage container. Which ncli command shows encryption details for containers?
- A) ncli container get-encryption-status name=<container_name>
- B) ncli data-at-rest-encryption status
- C) ncli container ls name=<container_name>
- D) ncli encryption ls

**Answer: C**
The "ncli container ls" command (with or without a name filter) shows container properties including encryption status, replication factor, compression, and deduplication settings. Encryption status is displayed as part of the container's detailed properties.

---

### Q59
An administrator needs to run a health check specifically for network connectivity between CVMs. Which NCC check should be executed?
- A) ncc health_checks run_all --filter=network
- B) ncli ncc run check=network_connectivity
- C) ncc health_checks network_checks cvm_ntp_check
- D) ncc health_checks network_checks inter_cvm_connectivity_check

**Answer: D**
NCC includes specific checks that can be run individually. The inter-CVM connectivity check validates network communication between all CVMs in the cluster, which is critical for cluster services that rely on inter-CVM communication.

---

### Q60
An administrator wants to power on all VMs in a specific protection domain after a DR failover. Which approach is the most efficient?
- A) Use the protection domain activate operation from ncli or Prism
- B) Use the v3 API to send parallel POST requests to power on each VM
- C) Restart all CVMs to trigger automatic VM power-on
- D) Use acli vm.power_on for each VM individually

**Answer: A**
During DR operations, activating a protection domain (failover) through ncli or Prism automatically handles powering on the protected VMs, restoring network configurations, and managing the replication state. This is more efficient and reliable than individual VM power-on commands.

---

### Q61
An administrator needs to check whether the cluster is configured for RF2 or RF3 redundancy. Which command shows the cluster's current replication factor configuration?
- A) ncli container ls
- B) zeus_config_printer | grep replication
- C) acli cluster.get
- D) ncli cluster info

**Answer: A**
The replication factor (RF2 or RF3) is configured at the storage container level, not the cluster level. "ncli container ls" shows each container's replication factor. While "ncli cluster info" shows the desired redundancy factor, container-level settings show the actual RF applied to data.

---

### Q62
An administrator receives an alert that Medusa (Cassandra) metadata operations are slow. Which diagnostic command checks the status of Cassandra compactions on the CVM?
- A) nodetool compactionstats
- B) cassandra_status --compaction
- C) medusa_printer --compaction_info
- D) ncli medusa check-compaction

**Answer: A**
The "nodetool compactionstats" command shows active and pending Cassandra compaction operations. Excessive compaction activity can cause metadata operation latency, as compaction competes with normal read/write operations for I/O resources.

---

### Q63
An administrator needs to update the DNS server configuration on the cluster. Which ncli command sets the DNS servers?
- A) ncli cluster add-to-name-servers servers=<dns_ip>
- B) ncli cluster edit dns-servers=<dns_ip>
- C) ncli dns add server=<dns_ip>
- D) ncli network update dns=<dns_ip>

**Answer: A**
The "ncli cluster add-to-name-servers" command adds DNS server addresses to the cluster configuration. DNS is essential for hostname resolution, Active Directory integration, and external service communication.

---

### Q64
An administrator is configuring a webhook to notify an external system when specific events occur in the Nutanix cluster. Which Prism Central feature enables event-driven HTTP callbacks?
- A) Nutanix Calm runbooks triggered by alert policies
- B) REST API webhooks configured under Prism Central > Settings
- C) SNMP trap forwarding to an HTTP gateway
- D) Syslog forwarding with HTTP transport

**Answer: B**
Prism Central supports webhook configurations that send HTTP POST notifications to external endpoints when specified cluster events occur. This enables event-driven integration with ticketing systems, orchestration platforms, and custom automation.

---

### Q65
An administrator needs to troubleshoot a failed live migration of a VM between two AHV hosts. Which log file should be examined for migration-related errors?
- A) /home/nutanix/data/logs/cerebro.INFO
- B) /home/nutanix/data/logs/acropolis.out
- C) /home/nutanix/data/logs/stargate.INFO
- D) /var/log/libvirt/qemu/<vm_name>.log

**Answer: B**
The Acropolis service manages VM operations on AHV, including live migration. The acropolis.out log file contains details about VM lifecycle operations, migration attempts, failure reasons, and host scheduling decisions.

---

### Q66
An administrator wants to enable SCMA (Security Configuration Management Automation) to run on a scheduled basis. What is the primary function of SCMA?
- A) Manage SSL certificate rotation for Prism services
- B) Configure firewall rules between CVMs and hypervisor hosts
- C) Automatically detect and report deviations from the applied STIG security baseline
- D) Encrypt all data at rest using AES-256

**Answer: C**
SCMA continuously monitors the cluster's security configuration against the applied STIG baseline and reports any deviations. It can be scheduled to run periodically, generating compliance reports and alerting administrators to configuration drift.

---

### Q67
An administrator needs to determine the task UUID returned from a recently submitted v3 API call to create a VM. Where in the API response is this task UUID found?
- A) In the response body under "metadata.task_id"
- B) In the X-Nutanix-Task-Id response header
- C) In the response body under "status.execution_context.task_uuid"
- D) In the HTTP Location response header

**Answer: C**
When a v3 API operation creates an asynchronous task, the response body includes the task UUID in the "status.execution_context.task_uuid" field. This UUID is used to poll the /tasks endpoint for completion status.

---

### Q68
An administrator wants to attach an ISO image to a running VM for OS installation. Which acli command mounts the ISO to the VM's CD-ROM?
- A) acli vm.disk_create <vm_name> cdrom=true clone_from_image=<iso_name>
- B) acli vm.cdrom_insert <vm_name> image=<iso_name>
- C) acli vm.mount_iso <vm_name> iso_name=<iso_name>
- D) acli vm.disk_update <vm_name> ide.0 clone_from_image=<iso_name>

**Answer: A**
The "acli vm.disk_create" command with the cdrom=true parameter creates a virtual CD-ROM device and clones the specified ISO image from the image service. This attaches the ISO to the VM for booting or software installation.

---

### Q69
An administrator is running "allssh" commands across the cluster but one CVM is not responding. What does the "allssh" utility do?
- A) Restarts SSH services on all CVMs
- B) Tests SSH connectivity to all hypervisor hosts
- C) Distributes SSH keys to all nodes in the cluster
- D) Executes an SSH command on all CVMs in the cluster simultaneously

**Answer: D**
The "allssh" utility is a Nutanix helper command that executes a specified command on all CVMs in the cluster via SSH. It is commonly used for cluster-wide diagnostics, log collection, and service management operations.

---

### Q70
An administrator is configuring the v3 API for a CI/CD pipeline and needs to set appropriate HTTP headers. Which Content-Type header is required for v3 API requests?
- A) application/json
- B) application/xml
- C) multipart/form-data
- D) text/plain

**Answer: A**
The Nutanix v3 REST API exclusively uses JSON for request and response bodies. All API requests must include the "Content-Type: application/json" header, and responses are returned in JSON format.

---

### Q71
An administrator wants to run a command across all CVMs to collect Stargate log files. Which command collects logs from all CVMs?
- A) allssh "ls -la /home/nutanix/data/logs/stargate.INFO"
- B) ncli cluster collect-logs service=stargate
- C) ncc log_collector --service=stargate
- D) logbay collect --service=stargate

**Answer: D**
Logbay is the Nutanix log collection utility that gathers logs from all CVMs and hypervisor hosts. The "logbay collect" command with service filters creates a compressed bundle of relevant logs for troubleshooting or support case attachment.

---

### Q72
An administrator needs to check the disk status on all nodes to identify any offline or degraded disks. Which ncli command lists all physical disks and their states?
- A) ncli container disk-status
- B) ncli disk ls
- C) ncli host list-disks
- D) ncli storage list-physical-disks

**Answer: B**
The "ncli disk ls" command lists all physical disks across the cluster, showing their status (online, offline, bad), tier (SSD, HDD), capacity, and which host they belong to. This is the primary command for disk health verification.

---

### Q73
An administrator receives an alert that a CVM's /home partition is running low on space. Which directory typically consumes the most space and should be checked for old log files?
- A) /home/nutanix/bin/
- B) /home/nutanix/data/logs/
- C) /home/nutanix/prism/
- D) /home/nutanix/config/

**Answer: B**
The /home/nutanix/data/logs/ directory contains service log files that can accumulate significant space over time, especially if verbose logging is enabled or if services are generating excessive error logs. Log rotation and cleanup should be verified.

---

### Q74
An administrator is integrating Nutanix with vCenter for managing VMs on ESXi hosts. Which Nutanix service handles the communication with vCenter Server?
- A) Prism
- B) Genesis
- C) Uhura
- D) Acropolis

**Answer: C**
Uhura is the Nutanix CVM service responsible for communication with external hypervisor management platforms, including VMware vCenter. It handles VM discovery, operation proxying, and event synchronization between Nutanix and vCenter.

---

### Q75
An administrator needs to delete a VM snapshot named "snap-daily-01" for the VM "FileServer01." Which acli command removes this snapshot?
- A) ncli snapshot delete name=snap-daily-01
- B) acli snapshot.remove vm=FileServer01 name=snap-daily-01
- C) acli snapshot.delete snap-daily-01
- D) acli vm.snapshot_delete FileServer01 snapshot_name=snap-daily-01

**Answer: C**
The "acli snapshot.delete" command removes a specified snapshot by name or UUID. Snapshots are global objects identified by their name, so the VM name is not required in the delete command — only the snapshot identifier.

---

### Q76
An administrator needs to verify that the Paxos leader election is functioning correctly for Zeus. Which approach provides this information?
- A) ncli cluster info --paxos-status
- B) paxos_cli leader_status
- C) genesis status zeus --verbose
- D) zeus_config_printer and checking the leader/epoch information

**Answer: D**
The "zeus_config_printer" output includes Paxos-related information such as the current leader CVM and epoch number. Examining this output across multiple CVMs helps verify consensus and leader election health.

---

### Q77
An administrator is writing an API script and needs to paginate through a large list of VMs using the v3 API. Which parameters in the POST /vms/list request body control pagination?
- A) "page" and "per_page" as query parameters
- B) "start" and "count" in the request body
- C) "skip" and "limit" as query parameters
- D) "offset" and "length" in the request body

**Answer: D**
The v3 API list operations use "offset" (starting position) and "length" (number of results) in the JSON request body for pagination. The response includes "total_matches" to determine how many pages remain.

---

### Q78
An administrator needs to check which CVM is currently the Prism Leader (the CVM serving the Prism web interface). Which command identifies the Prism Leader?
- A) curl -s localhost:2019/prism/leader
- B) ncli cluster get-prism-leader
- C) zeus_config_printer | grep prism_leader
- D) cluster status | grep PRISM

**Answer: A**
The Prism Leader can be identified by querying the local CVM's Prism service endpoint. The "curl localhost:2019/prism/leader" command (or similar internal endpoint) returns the IP of the CVM currently serving as the Prism Leader, which handles all web UI requests.

---

### Q79
An administrator wants to enable hardware-based encryption using Self-Encrypting Drives (SEDs) on the cluster. What is required in addition to SED drives being present?
- A) A configured Key Management Server (KMS) and enabling SED encryption from Prism
- B) Only the SEDs — hardware encryption is enabled by default
- C) FIPS 140-2 certification and software encryption must also be enabled
- D) TPM modules on each host and SED firmware update from Nutanix support

**Answer: A**
Hardware-based encryption with SEDs still requires a KMS to manage the authentication keys used to lock/unlock the drives. SED encryption must be explicitly enabled through Prism after the KMS is configured, even if the drives support hardware encryption natively.

---

### Q80
An administrator needs to troubleshoot intermittent VM disk I/O errors and suspects an issue with the storage path. Which command shows the current I/O path and data locality information for a VM's virtual disks?
- A) acli vm.get <vm_name> include_vdisk_info=true
- B) vdisk_config_printer
- C) ncli vdisk ls
- D) stargate_cli show_vdisks

**Answer: B**
The "vdisk_config_printer" command displays detailed virtual disk configuration, including the current I/O path, hosting extent store, data locality status, and replication state. This information is critical for diagnosing storage performance issues related to non-local I/O paths.

---

*End of NCM-MCI 6.10 Domain 3 Questions — 80 Total*
