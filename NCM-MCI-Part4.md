# NCM-MCI 6.10 — Supplementary Advanced Questions (Part 4)
## CLI Commands, Troubleshooting Procedures & Live-Lab Practical Knowledge

> **80 Questions** | 8 Focus Areas × 10 Questions Each
> Designed to test exact command syntax, log paths, port numbers, and hands-on procedures.

---

## Section 1: Exact CLI Commands for Common Tasks (Q1–Q10)

---

### Q1
An administrator needs to create a new virtual machine named "prod-web01" with 4 vCPUs and 8 GB of RAM using the AHV command line. Which command is correct?

- A) `ncli vm create name=prod-web01 num_vcpus=4 memory=8G`
- B) `acli vm.create prod-web01 num_vcpus=4 memory=8G`
- C) `acli vm.create prod-web01 cpu=4 ram=8192`
- D) `nuclei vm.create prod-web01 --vcpus 4 --memory 8G`

**Answer: B**
The `acli vm.create` command uses positional VM name followed by `num_vcpus=` and `memory=` parameters. `ncli` does not have a `vm create` subcommand — VM lifecycle is managed through `acli` on AHV clusters.

---

### Q2
An administrator wants to create a VLAN-backed network named "Production-VLAN100" on VLAN 100 with an IP pool for DHCP. Which command correctly creates the network?

- A) `ncli net create name=Production-VLAN100 vlan-id=100 ip-config=10.1.1.0/24`
- B) `acli net.create Production-VLAN100 vlan=100 ip_config=10.1.1.0/24,10.1.1.100,10.1.1.200,10.1.1.1`
- C) `acli network.create Production-VLAN100 --vlan 100 --subnet 10.1.1.0/24`
- D) `acli net.create Production-VLAN100 vlan=100 network=10.1.1.0/24 gateway=10.1.1.1`

**Answer: B**
The `acli net.create` syntax uses `vlan=` for the VLAN ID and `ip_config=` with a comma-separated list of network CIDR, pool start, pool end, and default gateway. Option D uses incorrect parameter names (`network=` and `gateway=` are not valid `acli` parameters).

---

### Q3
An administrator needs to create an asynchronous protection domain named "PD-Finance" for replication. Which command is correct?

- A) `ncli pd create name=PD-Finance type=async`
- B) `ncli protection-domain create name=PD-Finance mode=async`
- C) `acli pd.create PD-Finance replication_type=async`
- D) `ncli pd create name=PD-Finance replication-mode=asynchronous`

**Answer: A**
The `ncli pd create` command uses `name=` and `type=async` to create an asynchronous protection domain. The full subcommand is `pd`, not `protection-domain`, and the type parameter accepts `async` or `sync`.

---

### Q4
A new storage container named "Gold-Tier" needs to be created on the existing storage pool "SP-01" with compression enabled. Which command is correct?

- A) `ncli container create name=Gold-Tier sp-name=SP-01 compression-enabled=true`
- B) `ncli ctr create name=Gold-Tier storage-pool=SP-01 enable-compression=yes`
- C) `acli container.create Gold-Tier pool=SP-01 compression=on`
- D) `ncli container create name=Gold-Tier sp-name=SP-01 compression=inline`

**Answer: A**
The `ncli container create` command uses `sp-name=` to specify the storage pool and `compression-enabled=true` to enable inline compression. Option D incorrectly uses `compression=inline` which is not a valid parameter format.

---

### Q5
An administrator wants to verify the overall cluster health, including service status and cluster configuration. Which pair of commands provides the most comprehensive view?

- A) `ncli cluster info` and `ncli cluster status`
- B) `ncli cluster get-params` and `ncli cluster list`
- C) `acli cluster.info` and `acli cluster.health`
- D) `cluster status` and `cluster info`

**Answer: A**
`ncli cluster info` displays cluster configuration details (name, ID, IPs, version), while `ncli cluster status` shows real-time service health across all CVMs. These are the two primary commands for cluster verification. `acli` does not have cluster-level commands.

---

### Q6
An administrator needs to add an existing disk image to a VM named "test-vm01" as a SCSI disk using `acli`. Which command correctly attaches the disk?

- A) `acli vm.disk_create test-vm01 clone_from_image=CentOS-8 bus=scsi`
- B) `acli vm.add_disk test-vm01 image=CentOS-8 type=scsi`
- C) `acli vm.disk_create test-vm01 image_name=CentOS-8 bus=scsi`
- D) `acli vm.disk_attach test-vm01 clone_from_image=CentOS-8 bus=scsi`

**Answer: A**
The correct `acli` syntax uses `vm.disk_create` with `clone_from_image=` to clone from an existing image and `bus=scsi` to specify the bus type. There is no `vm.add_disk` or `vm.disk_attach` subcommand in `acli`.

---

### Q7
An administrator needs to list all VMs on the cluster and filter for those in a powered-on state. Which command is correct?

- A) `acli vm.list power_state=on`
- B) `ncli vm list power-state=on`
- C) `acli vm.list | grep "on"`
- D) `acli vm.list filter=power_state==on`

**Answer: A**
The `acli vm.list` command supports direct filtering with `power_state=on`. While piping through `grep` (option C) could work as a workaround, option A uses the native filtering capability and is the correct approach.

---

### Q8
An administrator needs to add a virtual NIC to an existing VM named "db-server01" and connect it to the network "VLAN-200". Which command is correct?

- A) `acli vm.nic_create db-server01 network=VLAN-200`
- B) `acli vm.add_nic db-server01 net=VLAN-200`
- C) `acli vm.nic_create db-server01 network=VLAN-200 model=virtio`
- D) `ncli vm add-nic name=db-server01 network=VLAN-200`

**Answer: A**
The `acli vm.nic_create` command uses `network=` to specify the target network. While option C also uses the correct base command, `model=virtio` is the default and does not need to be explicitly specified. Option A is the simplest correct syntax.

---

### Q9
An administrator wants to update the memory of a running VM named "app-server" from 4 GB to 8 GB. The VM supports hot-add. Which command is correct?

- A) `acli vm.update app-server memory=8G`
- B) `acli vm.modify app-server mem=8192`
- C) `ncli vm edit name=app-server memory-mb=8192`
- D) `acli vm.mem_update app-server size=8G`

**Answer: A**
The `acli vm.update` command with `memory=8G` correctly updates the VM's memory allocation. If the guest OS supports memory hot-add, this change takes effect without a reboot. There is no `vm.modify` or `vm.mem_update` subcommand.

---

### Q10
An administrator wants to take a snapshot of a VM named "critical-app" and label it "pre-upgrade-snap". Which command is correct?

- A) `acli vm.snapshot_create critical-app snapshot_name_list=pre-upgrade-snap`
- B) `acli vm.create_snapshot critical-app name=pre-upgrade-snap`
- C) `ncli snapshot create vm-name=critical-app name=pre-upgrade-snap`
- D) `acli vm.snapshot critical-app label=pre-upgrade-snap`

**Answer: A**
The `acli vm.snapshot_create` command uses `snapshot_name_list=` to assign a name to the snapshot. The parameter is `snapshot_name_list` because `acli` supports creating snapshots of multiple VMs simultaneously.

---

## Section 2: REST API Operations (Q11–Q20)

---

### Q11
An administrator needs to create a VM using the Nutanix v3 API. Which HTTP method and endpoint are correct?

- A) `PUT /api/nutanix/v3/vms/{uuid}`
- B) `POST /api/nutanix/v3/vms`
- C) `POST /api/nutanix/v3/vms/create`
- D) `POST /api/nutanix/v2.0/vms`

**Answer: B**
The v3 API uses `POST /api/nutanix/v3/vms` with a JSON body containing `spec` and `metadata` objects to create a new VM. There is no `/create` suffix — the POST method on the collection endpoint implies creation. `PUT` is used for updates on an existing resource identified by UUID.

---

### Q12
An administrator wants to list all VMs on the cluster using the v3 API with pagination. Which request is correct?

- A) `GET /api/nutanix/v3/vms?limit=50&offset=0`
- B) `POST /api/nutanix/v3/vms/list` with body `{"kind": "vm", "length": 50, "offset": 0, "sort_order": "ASCENDING", "sort_attribute": "name"}`
- C) `GET /api/nutanix/v3/vms/list?length=50`
- D) `POST /api/nutanix/v3/vms/list` with body `{"limit": 50, "page": 1}`

**Answer: B**
The v3 API uses a `POST` to the `/list` endpoint with a JSON body specifying `kind`, `length`, `offset`, `sort_order`, and `sort_attribute`. Including sort fields is critical for pagination stability — without explicit sorting, results may vary between API calls, causing offset-based pagination to skip or duplicate records. The standard response includes: `{"entities": [...], "metadata": {"total_matches": N, "length": 50, "offset": 0}}`. The parameter names are `length` and `offset`, not `limit` and `page`.

---

### Q13
An administrator needs to authenticate to the Prism Central v3 API. Which authentication method is correct?

- A) `Authorization: Bearer <JWT-token>`
- B) `Authorization: Basic <base64(username:password)>`
- C) `X-Nutanix-Auth: <api-key>`
- D) `Cookie: NTNX_SESSION=<session-id>`

**Answer: B**
The Nutanix v3 API uses HTTP Basic Authentication with a Base64-encoded `username:password` string in the `Authorization` header. JWT bearer tokens and API keys are not supported for direct API authentication. Session cookies exist but are not the recommended programmatic approach.

---

### Q14
An administrator wants to upload an image to the cluster via the v3 API using a URL source. Which is the correct JSON body structure for `POST /api/nutanix/v3/images`?

- A) `{"spec": {"name": "centos8", "resources": {"image_type": "DISK_IMAGE", "source_uri": "http://server/centos8.qcow2"}}, "metadata": {"kind": "image"}}`
- B) `{"name": "centos8", "image_type": "DISK_IMAGE", "url": "http://server/centos8.qcow2"}`
- C) `{"spec": {"name": "centos8", "resources": {"image_type": "DISK_IMAGE"}}, "metadata": {"kind": "image"}, "source_url": "http://server/centos8.qcow2"}`
- D) `{"spec": {"name": "centos8", "resources": {"image_type": "DISK_IMAGE", "source_url": "http://server/centos8.qcow2"}}, "metadata": {"kind": "image"}}`

**Answer: A**
The v3 images API nests the image configuration under `spec.resources` with the field name `source_uri` (not `source_url`). The `metadata` block with `kind: image` is required. Option D is close but uses `source_url` instead of the correct `source_uri`.

---

### Q15
An administrator needs to assign a category value "Production" under category key "Environment" using the v3 API. Which request is correct?

- A) `POST /api/nutanix/v3/categories/Environment/Production`
- B) `PUT /api/nutanix/v3/categories/Environment/Production` with body `{"value": "Production"}`
- C) `PUT /api/nutanix/v3/categories/Environment` with body `{"value": "Production"}`
- D) `POST /api/nutanix/v3/categories` with body `{"name": "Environment", "value": "Production"}`

**Answer: B**
Category values in the v3 API are created or updated using `PUT /api/nutanix/v3/categories/{name}/{value}` with a JSON body containing the `value` field. The `PUT` method is used because category values are idempotent — creating and updating use the same operation.

---

### Q16
An administrator wants to filter the VM list to only return VMs with the category "Environment:Production" using the v3 API. Which request body filter is correct?

- A) `{"kind": "vm", "filter": "category==Environment:Production"}`
- B) `{"kind": "vm", "filter": "categories.Environment==Production"}`
- C) `{"kind": "vm", "filter": "category_name==Environment;category_value==Production"}`
- D) `{"kind": "vm", "filter": "Environment==Production"}`

**Answer: B**
The v3 list API filter syntax for categories uses the FIQL format with a `categories.` prefix: `"categories.CategoryKey==CategoryValue"`. The filter string `"categories.Environment==Production"` matches VMs assigned that category. The bare format without the prefix does not work — the `categories.` qualifier is required to indicate a category-based filter rather than a top-level entity attribute filter.

---

### Q17
An administrator needs to power on a VM with a known UUID using the v3 API. Which approach is correct?

- A) `POST /api/nutanix/v3/vms/{uuid}/power_on`
- B) `POST /api/nutanix/v3/vms/{uuid}/acpi_shutdown` with `{"transition": "ON"}`
- C) Retrieve the VM with `GET`, update `spec.resources.power_state` to `ON`, then `PUT /api/nutanix/v3/vms/{uuid}`
- D) `PATCH /api/nutanix/v3/vms/{uuid}` with body `{"power_state": "ON"}`

**Answer: C**
The v3 API follows an intent-based model — there is no dedicated power-on endpoint. To change VM power state, you must GET the current VM spec, modify `spec.resources.power_state` to `ON`, and PUT the updated spec back. The `spec_version` must match to prevent conflicts.

---

### Q18
An administrator is writing a script and receives an HTTP 409 Conflict when trying to update a VM via the v3 API. What is the most likely cause?

- A) The VM UUID does not exist on the cluster
- B) The `spec_version` in the PUT body does not match the current version
- C) The API rate limit has been exceeded
- D) The VM is in a powered-on state and cannot be modified

**Answer: B**
A 409 Conflict in the v3 API indicates an optimistic concurrency control failure — the `spec_version` in the request body does not match the server's current version. This occurs when another operation modified the entity between the GET and PUT. The solution is to re-GET the entity and retry the update.

---

### Q19
An administrator wants to retrieve a task status after submitting an asynchronous v3 API operation. The task UUID was returned in the initial response. Which endpoint should be polled?

- A) `GET /api/nutanix/v3/tasks/{task_uuid}`
- B) `GET /api/nutanix/v3/jobs/{task_uuid}`
- C) `POST /api/nutanix/v3/tasks/list` with filter for task UUID
- D) `GET /api/nutanix/v2.0/tasks/{task_uuid}`

**Answer: A**
Asynchronous v3 API operations return a `task_uuid` which can be polled at `GET /api/nutanix/v3/tasks/{task_uuid}`. The response includes `status` (QUEUED, RUNNING, SUCCEEDED, FAILED) and `percentage_complete` fields to track progress.

---

### Q20
An administrator needs to delete a VM and its associated disks using the v3 API. Which request is correct?

- A) `DELETE /api/nutanix/v3/vms/{uuid}` (disks are automatically deleted)
- B) `DELETE /api/nutanix/v3/vms/{uuid}?delete_snapshots=true&delete_disks=true`
- C) `POST /api/nutanix/v3/vms/{uuid}/delete` with body `{"delete_disks": true}`
- D) `DELETE /api/nutanix/v3/vms/{uuid}` followed by separate `DELETE` for each disk

**Answer: A**
The v3 API `DELETE /api/nutanix/v3/vms/{uuid}` automatically deletes all disks that were created with the VM (cloned disks). Disks that were explicitly attached from an existing volume are preserved. No additional parameters or separate disk deletion calls are needed.

---

## Section 3: CVM Service Troubleshooting (Q21–Q30)

---

### Q21
An administrator reports that virtual machines are experiencing high storage I/O latency. Which CVM service is primarily responsible for handling storage I/O, and on which port does its status page run?

- A) Curator on port 2010
- B) Stargate on port 2009
- C) Cerebro on port 2020
- D) Prism on port 9080

**Answer: B**
Stargate is the primary I/O handler managing all storage read/write operations. Its status page at `http://<cvm_ip>:2009` provides oplog utilization, iSCSI sessions, NFS exports, and disk queue depths. For comprehensive latency diagnosis, also monitor: **Curator (port 2010)** for garbage collection pause times and extent group calculations (GC pauses can block I/O), and **Zookeeper (port 2181)** for consistency coordination. Cross-reference Stargate oplog usage with Curator GC metrics in Prism to isolate whether latency is from I/O dispatch or background maintenance tasks.

---

### Q22
An administrator needs to dump the entire Zeus configuration database to review the cluster's authoritative configuration. Which command should be used?

- A) `zeus_config_printer`
- B) `zeus --dump-config`
- C) `ncli zeus show-config`
- D) `cat /home/nutanix/data/zeus/config.db`

**Answer: A**
The `zeus_config_printer` command outputs the complete Zeus configuration in a human-readable protobuf format. Zeus is the distributed configuration database built on Zookeeper, and its configuration includes all cluster, node, container, and network definitions. The configuration is not stored as a flat file that can be read with `cat`.

---

### Q23
An administrator suspects the Genesis service has crashed on a CVM and needs to restart it. Which approach is correct?

- A) `genesis restart`
- B) `sudo systemctl restart genesis`
- C) `cluster restart` (Genesis auto-restarts all services)
- D) Genesis is self-healing and restarts automatically via the watchdog; manually restart with `genesis stop && cluster start`

**Answer: A**
The `genesis restart` command is a valid command documented in the AOS Command Reference (AOS 6.5+). Genesis supports `start|stop|restart|status` subcommands. While Genesis does have a self-healing watchdog that auto-restarts crashed services, when manual intervention is explicitly needed, `genesis restart` is the most direct approach. The alternative `genesis stop && cluster start` also works but is a two-step process typically used for broader cluster service reinitialization.

---

### Q24
An administrator needs to check the status of the Cassandra metadata ring across all CVMs. Which command should be run from a CVM?

- A) `nodetool -h localhost ring`
- B) `cassandra_status`
- C) `nodetool -h 0 ring`
- D) `ncli cassandra get-ring-status`

**Answer: C**
The `nodetool -h 0` command connects to the local Cassandra (Medusa) instance. The `-h 0` shorthand is used instead of `-h localhost` due to Nutanix's custom Cassandra configuration. The `ring` subcommand shows the token ring status across all CVMs, including each node's state (Up/Down) and load.

---

### Q25
An administrator wants to check which CVM services are currently running on the local CVM. Which command provides this information?

- A) `cluster status`
- B) `genesis status`
- C) `ncli cluster get-service-status`
- D) `systemctl list-units --type=service | grep nutanix`

**Answer: B**
The `genesis status` command (run on a single CVM) shows the status of all services managed by Genesis on that specific CVM. `cluster status` (option A) also works but shows status across ALL CVMs in the cluster, which is broader than what was asked.

---

### Q26
An administrator notices that background storage optimization tasks (dedup, compression, garbage collection) are not running. Which CVM service should be investigated, and what is its status page port?

- A) Stargate on port 2009
- B) Cerebro on port 2020
- C) Curator on port 2010
- D) Chronos on port 2011

**Answer: C**
Curator is the MapReduce framework responsible for background storage tasks including deduplication, compression, garbage collection, and disk balancing. Its status page at `http://<cvm_ip>:2010` shows scan status, job history, and task execution details. Chronos (port 2011) is the job scheduler but Curator owns the optimization logic.

---

### Q27
An administrator needs to restart the Prism service on a specific CVM because the web UI is unresponsive. Which sequence of commands is correct?

- A) `genesis stop prism && genesis start prism`
- B) `sudo systemctl restart prism`
- C) `genesis stop prism` followed by `cluster start`
- D) `restart_prism`

**Answer: C**
The correct procedure is to stop the individual service with `genesis stop prism` and then use `cluster start` to restart it. The `cluster start` command is idempotent and only starts services that are not running. There is no `genesis start` command — `genesis stop` stops services, but `cluster start` is used to bring them back.

---

### Q28
An administrator notices that replication between two clusters has stalled. Which CVM service handles inter-cluster replication, and on which port is its status page?

- A) Stargate on port 2009
- B) Curator on port 2010
- C) Cerebro on port 2020
- D) Pithos on port 2027

**Answer: C**
Cerebro is the replication service responsible for managing protection domains, snapshots, and inter-cluster data replication. Its status page at `http://<cvm_ip>:2020` provides details on replication progress, bandwidth utilization, and any replication errors between paired remote sites.

---

### Q29
An administrator wants to check the Prism leader CVM in the cluster to direct API requests efficiently. Which command identifies the Prism leader?

- A) `ncli cluster get-prism-leader`
- B) `curl -s http://localhost:9080/PrismGateway/services/rest/v1/cluster/prism_leader`
- C) `genesis status | grep prism`
- D) `zeus_config_printer | grep prism_leader`

**Answer: B**
The Prism leader can be identified by querying the local Prism REST API endpoint at `http://localhost:9080/PrismGateway/services/rest/v1/cluster/prism_leader`. This returns the IP address of the CVM currently acting as the Prism leader, which handles all web UI and API requests for the cluster.

---

### Q30
An administrator needs to troubleshoot Zookeeper quorum issues on the cluster. Which command checks the Zookeeper status on a CVM?

- A) `zkCli.sh status`
- B) `echo ruok | nc localhost 2181`
- C) `echo stat | nc localhost 9161`
- D) `zookeeper_status`

**Answer: B**
Zookeeper runs on port 2181 and responds to four-letter commands. Sending `ruok` ("are you okay?") to port 2181 returns `imok` if the Zookeeper instance is healthy. The `stat` command can also be used for detailed status. Port 9161 (option C) is Cassandra's Thrift port, not Zookeeper.

---

## Section 4: Log File Locations (Q31–Q40)

---

### Q31
An administrator needs to review Stargate I/O errors on a CVM. Which log file should be examined first?

- A) `/home/nutanix/data/logs/stargate.INFO`
- B) `/home/nutanix/data/logs/stargate.out`
- C) `/var/log/stargate/stargate.log`
- D) `/home/nutanix/data/logs/storage_io.log`

**Answer: A**
Stargate logs follow the Google glog convention and are located at `/home/nutanix/data/logs/stargate.INFO`. For error investigation, also check `stargate.WARNING` and `stargate.ERROR` in the same directory. The `.INFO` file contains all severity levels and is the most comprehensive starting point.

---

### Q32
An administrator is troubleshooting Prism Central web UI errors. Which log file contains the Prism gateway application logs?

- A) `/home/nutanix/data/logs/prism.log`
- B) `/home/nutanix/data/logs/prism_gateway.log`
- C) `/home/nutanix/data/logs/prism_web.log`
- D) `/var/log/prism/gateway.log`

**Answer: B**
The Prism gateway logs are stored at `/home/nutanix/data/logs/prism_gateway.log` on each CVM. This log contains API request/response details, authentication events, and application-level errors for the Prism web interface.

---

### Q33
An administrator ran an NCC health check and needs to review the full output. Where is the latest NCC output stored?

- A) `/home/nutanix/data/logs/ncc.log`
- B) `/home/nutanix/data/logs/ncc-output-latest.log`
- C) `/home/nutanix/data/ncc/output/latest.log`
- D) `/home/nutanix/data/logs/health_check.log`

**Answer: B**
The latest NCC (Nutanix Cluster Check) output is always symlinked at `/home/nutanix/data/logs/ncc-output-latest.log`. This file contains the complete results of the most recent NCC run, including all PASS, WARN, FAIL, and ERROR statuses for each check.

---

### Q34
An administrator is investigating a VM crash on an AHV host. Where should they look for hypervisor-level virtual machine logs?

- A) `/var/log/libvirt/qemu/`
- B) `/var/log/kvm/`
- C) `/home/nutanix/data/logs/acropolis.log`
- D) `/var/log/xen/`

**Answer: A**
On AHV hosts, individual VM logs (QEMU process output) are stored in `/var/log/libvirt/qemu/` with one log file per VM. These logs contain hypervisor-level VM events including boot sequences, device emulation errors, and crash dumps. Option C is the Acropolis service log on the CVM, not the AHV host.

---

### Q35
An administrator needs to review the Genesis service manager log to understand why services failed to start after a CVM reboot. Which log file should be reviewed?

- A) `/home/nutanix/data/logs/genesis.log`
- B) `/home/nutanix/data/logs/genesis.out`
- C) `/home/nutanix/data/logs/genesis_service.log`
- D) `/var/log/genesis/startup.log`

**Answer: B**
The Genesis service manager writes its output to `/home/nutanix/data/logs/genesis.out`. This log contains service startup sequences, dependency resolution, and any errors encountered during service initialization. Unlike other services that use glog format (.INFO/.WARNING), Genesis uses a `.out` file.

---

### Q36
An administrator needs to check AHV host system-level logs for kernel panics or hardware errors. Which log file on the AHV host should be examined?

- A) `/var/log/syslog`
- B) `/var/log/messages`
- C) `/var/log/kern.log`
- D) `/var/log/dmesg.log`

**Answer: B**
AHV is based on CentOS/RHEL, which uses `/var/log/messages` as the primary system log. This file contains kernel messages, hardware events, service status changes, and system-level errors. `/var/log/syslog` (option A) is a Debian/Ubuntu convention and is not present on AHV.

---

### Q37
An administrator needs to review the Curator scan history to determine when the last full scan completed. Which log file should be reviewed?

- A) `/home/nutanix/data/logs/curator.INFO`
- B) `/home/nutanix/data/logs/curator_cli.log`
- C) `/home/nutanix/data/logs/background_tasks.log`
- D) `/home/nutanix/data/logs/curator.out`

**Answer: A**
Curator logs follow the glog convention at `/home/nutanix/data/logs/curator.INFO`. This log contains details of partial and full scan initiation, duration, tasks executed, and data processed. The Curator status page at port 2010 also shows scan history but the log provides more detail.

---

### Q38
An administrator is troubleshooting a failed LCM (Life Cycle Manager) firmware update. Where should they look for LCM-specific logs?

- A) `/home/nutanix/data/logs/lcm.log`
- B) `/home/nutanix/data/logs/lcm/lcm_ops.log`
- C) `/home/nutanix/data/logs/genesis.out` (LCM operations logged here)
- D) `/home/nutanix/data/logs/lcm_leader.log`

**Answer: B**
LCM maintains its own log directory at `/home/nutanix/data/logs/lcm/` with the primary operations log at `lcm_ops.log`. This log contains inventory detection results, firmware download status, update execution steps, and any failure details. While Genesis may log LCM service events, the detailed update operations are in the dedicated LCM log directory.

---

### Q39
An administrator needs to review Cerebro replication logs to troubleshoot a failed snapshot replication. Which log file is relevant?

- A) `/home/nutanix/data/logs/cerebro.INFO`
- B) `/home/nutanix/data/logs/replication.log`
- C) `/home/nutanix/data/logs/cerebro_repl.log`
- D) `/home/nutanix/data/logs/data_protection.log`

**Answer: A**
Cerebro logs follow the glog convention at `/home/nutanix/data/logs/cerebro.INFO`. This log contains replication schedule execution, snapshot transfer progress, bandwidth throttling events, and any replication failures between paired remote sites.

---

### Q40
An administrator wants to collect all relevant logs from a CVM for a Nutanix support case. Which command generates a comprehensive log bundle?

- A) `ncc log_collector run_all`
- B) `logbay collect`
- C) `ncli log-collector start`
- D) `collect_logs --all`

**Answer: B**
The `logbay collect` command is the standard Nutanix log collection utility that gathers logs from CVMs, AHV hosts, and cluster services into a compressed bundle. Logbay replaces the older `collect_logs` utility and supports filtering by time range, component, and node to minimize bundle size.

---

## Section 5: Network Troubleshooting (Q41–Q50)

---

### Q41
An administrator needs to view the Open vSwitch configuration on an AHV host, including bridges, ports, and interfaces. Which command should be used?

- A) `ovs-vsctl show`
- B) `ovs-ofctl show br0`
- C) `brctl show`
- D) `ip link show type bridge`

**Answer: A**
The `ovs-vsctl show` command displays the complete OVS database configuration, including all bridges (br0, br1), their ports, interfaces, and VLAN tags. Option B (`ovs-ofctl show br0`) shows OpenFlow information for a specific bridge, not the overall OVS topology. `brctl` (option C) is for Linux bridge, not OVS.

---

### Q42
An administrator suspects that VLAN tagging is not working correctly on an AHV host. Which command shows the OpenFlow rules that handle VLAN traffic on bridge br0?

- A) `ovs-vsctl list-ports br0`
- B) `ovs-ofctl dump-flows br0`
- C) `ovs-appctl fdb/show br0`
- D) `ovs-vsctl get bridge br0 vlans`

**Answer: B**
The `ovs-ofctl dump-flows br0` command displays all OpenFlow rules on the bridge, including VLAN push/pop actions and traffic matching rules. This is essential for verifying that VLAN tagging and stripping are configured correctly for VM traffic.

---

### Q43
An administrator needs to check the bond status and active-backup configuration on an AHV host. Which command provides detailed bond information?

- A) `cat /proc/net/bonding/bond0`
- B) `ovs-appctl bond/show br0-up`
- C) `manage_ovs --bridge_status`
- D) `ovs-vsctl get port bond0 bond_mode`

**Answer: B**
The `ovs-appctl bond/show br0-up` command shows the OVS bond status including the bond mode, active member interface, LACP status, and hash distribution. Option C (`manage_ovs --bridge_status`) provides a higher-level overview of all bridges but less bond-specific detail. Option A is for Linux bonding, which is not used on AHV.

---

### Q44
An administrator needs to verify that jumbo frames (MTU 9000) are working end-to-end between two VMs. Which command correctly tests jumbo frame connectivity?

- A) `ping -s 9000 -M do <destination_ip>`
- B) `ping -s 8972 -M do <destination_ip>`
- C) `ping -s 9000 <destination_ip>`
- D) `ping -s 8972 <destination_ip>`

**Answer: B**
The correct test uses `ping -s 8972 -M do` because: the `-s 8972` sets the payload size, and with 20 bytes of IP header + 8 bytes of ICMP header, the total frame is 9000 bytes. The `-M do` flag ("don't fragment") prevents fragmentation, ensuring the full jumbo frame traverses the entire path.

---

### Q45
An administrator needs to verify the overall OVS bridge configuration and uplink status on an AHV host. Which Nutanix-specific command provides a consolidated view?

- A) `manage_ovs --bridge_status`
- B) `manage_ovs show_uplinks`
- C) `acli host.list_networks`
- D) `ncli host get-network-config`

**Answer: A**
The `manage_ovs --bridge_status` command is the Nutanix-provided wrapper that shows a consolidated view of all OVS bridges, their uplinks, bond configurations, and MTU settings on the AHV host. This is the recommended first command for network troubleshooting as it presents information in a summarized format.

---

### Q46
An administrator has configured VLAN 200 for a new network in Prism, but VMs on that network cannot communicate. Physical switch configuration is confirmed correct. Which command on the AHV host verifies that VLAN 200 traffic is flowing through the bridge?

- A) `ovs-ofctl dump-flows br0 | grep "dl_vlan=200"`
- B) `tcpdump -i br0 vlan 200`
- C) `ovs-vsctl list port | grep "tag: 200"`
- D) `ovs-dpctl dump-flows | grep "vlan(vid=200)"`

**Answer: A**
Checking OpenFlow rules with `ovs-ofctl dump-flows br0 | grep "dl_vlan=200"` verifies that the OVS bridge has active flow rules for VLAN 200 traffic. If no matching flows exist, the VLAN is not properly configured in OVS. Option D shows datapath flows which are kernel-cached and may not always be present.

---

### Q47
An administrator notices intermittent network connectivity for VMs. They suspect a physical NIC is experiencing errors. Which command on the AHV host shows NIC interface statistics including error counters?

- A) `ethtool -S eth0`
- B) `ifconfig eth0`
- C) `ovs-vsctl get interface eth0 statistics`
- D) `ip -s link show eth0`

**Answer: D**
The `ip -s link show eth0` command displays comprehensive interface statistics including RX/TX packets, bytes, errors, dropped packets, and overruns. While `ethtool -S eth0` (option A) provides driver-specific counters, `ip -s link show` is the standard approach and is always available.

---

### Q48
An administrator needs to change the MTU on the OVS bridge br0 to 9000 for jumbo frame support on an AHV host. Which is the correct and persistent method?

- A) `ovs-vsctl set interface br0 mtu_request=9000`
- B) `manage_ovs --mtu 9000 --bridge_name br0 update_uplinks`
- C) `ifconfig br0 mtu 9000`
- D) `ip link set br0 mtu 9000`

**Answer: B**
The `manage_ovs` utility is the Nutanix-supported method for modifying OVS configuration on AHV hosts because it persists changes across reboots. Options C and D would change the MTU temporarily but would not survive a host reboot. Directly modifying OVS with `ovs-vsctl` (option A) may also not persist correctly through Nutanix's configuration management.

---

### Q49
An administrator needs to verify CVM-to-CVM network connectivity for cluster communication. Which port should they specifically test to validate the internal management plane?

- A) Port 80 (HTTP)
- B) Port 9440 (Prism HTTPS)
- C) Port 2049 (NFS)
- D) Port 2181 (Zookeeper)

**Answer: D**
Port 2181 (Zookeeper) is critical for CVM-to-CVM cluster communication as it maintains the cluster's distributed configuration. While port 9440 is important for Prism access and port 2049 for NFS storage I/O, Zookeeper quorum communication on port 2181 is the foundational requirement for cluster health.

---

### Q50
An administrator is troubleshooting a VM that cannot reach its default gateway. The VM is on VLAN 100. On the AHV host, which command verifies that the VM's virtual NIC (tap interface) is correctly tagged to VLAN 100?

- A) `ovs-vsctl show | grep -A2 "tap"`
- B) `ovs-vsctl list port <tap-interface-name>`
- C) `virsh domiflist <vm-name>`
- D) `ovs-ofctl show br0 | grep tap`

**Answer: B**
The `ovs-vsctl list port <tap-interface-name>` command shows the full port configuration for the VM's tap interface, including the `tag` field that specifies the VLAN assignment. If the `tag` field is missing or set incorrectly, the VM will not be placed on the intended VLAN.

---

## Section 6: Storage Troubleshooting (Q51–Q60)

---

### Q51
An administrator suspects a physical disk has failed in the cluster. Which command lists all disks and their current status?

- A) `ncli disk ls`
- B) `ncli disk list`
- C) `acli disk.list`
- D) `ncli storage list-disks`

**Answer: A**
The `ncli disk ls` command lists all physical disks in the cluster with their status (online, offline, bad), tier (SSD/HDD), storage pool assignment, and capacity. The short form `ls` is used instead of `list` for the disk subcommand.

---

### Q52
An administrator notices that a storage container is nearly full. Which command provides detailed container usage including reserved space, replication factor overhead, and snapshot usage?

- A) `ncli container ls`
- B) `ncli ctr stats`
- C) `ncli container stats name=<container-name>`
- D) `ncli container list name=<container-name>`

**Answer: A**
The `ncli container ls` command provides a comprehensive view of all containers with their capacity statistics including total capacity, used space, reserved capacity, implicit reservation (RF overhead), and snapshot usage. For a specific container, filtering with `name=` can be appended.

---

### Q53
An administrator is investigating high storage latency and suspects the OpLog (write buffer on SSD) is full. Where can OpLog utilization be checked?

- A) `ncli storage get-oplog-status`
- B) The Stargate 2009 page under the "OpLog" section
- C) `/home/nutanix/data/logs/oplog.INFO`
- D) `ncli disk ls tier=ssd-oplog`

**Answer: B**
OpLog utilization is visible on the Stargate status page at `http://<cvm_ip>:2009` under the OpLog section. This shows current OpLog usage, drain rate, and whether OpLog is bypassed for sequential I/O. When OpLog utilization is consistently high, write latency increases because new writes must wait for OpLog space.

---

### Q54
An administrator has a failed SSD disk in a node within an RF2 cluster. What happens to the data automatically?

- A) The cluster enters read-only mode until the disk is replaced
- B) The data is automatically rebuilt to other disks in the cluster to maintain RF2 redundancy
- C) An administrator must manually trigger a rebuild with `ncli disk rebuild`
- D) Only metadata is rebuilt; data blocks remain degraded until disk replacement

**Answer: B**
When a disk fails in an RF2 cluster, the Curator service automatically detects the failure and triggers a self-healing rebuild. Data blocks that had a replica on the failed disk are re-replicated to other available disks to maintain RF2 redundancy. No manual intervention is required, and the cluster remains fully operational during the rebuild.

---

### Q55
An administrator notices that deduplication savings are lower than expected on a container. Which command checks the actual dedup ratio and savings?

- A) `ncli container stats name=<name> | grep dedup`
- B) `ncli container ls name=<name>`
- C) `curator_cli display_data_reduction_report`
- D) `ncli container get-dedup-stats name=<name>`

**Answer: C**
The `curator_cli display_data_reduction_report` command provides a detailed breakdown of storage savings from deduplication, compression, and erasure coding across the cluster. This report shows pre-dedup size, post-dedup size, and actual savings ratios — more detailed than the container-level statistics.

---

### Q56
An administrator needs to check SSD wear level (endurance) across all cluster nodes. Which tool provides this information?

- A) `ncli disk ls | grep "wear"`
- B) `smartctl -a /dev/sda`
- C) NCC check: `ncc health_checks hardware_checks disk_checks ssd_wear_check`
- D) `ncli hardware get-ssd-health`

**Answer: C**
The NCC SSD wear check (`ncc health_checks hardware_checks disk_checks ssd_wear_check`) specifically reports SSD wear level percentages across all nodes in the cluster. This is the recommended method because it aggregates data across all nodes and alerts when SSDs approach end-of-life thresholds.

---

### Q57
An administrator notices that the Cassandra metadata store is reporting inconsistency warnings. Which command can be used to verify the Cassandra ring status on the local CVM?

- A) `nodetool -h 0 status`
- B) `nodetool -h localhost describecluster`
- C) `cassandra_ring_status`
- D) `ncli metadata check-consistency`

**Answer: A**
The `nodetool -h 0 status` command shows the Cassandra cluster status including each node's state (UN=Up Normal, DN=Down Normal), load, tokens, and rack assignment. This is the primary command for verifying that all Cassandra nodes in the Nutanix cluster are participating correctly in the metadata ring.

---

### Q58
An administrator needs to identify which VMs are consuming the most storage in a specific container. Which approach is most effective?

- A) `ncli vm ls | sort-by storage`
- B) Use the Prism Storage > Container > VM Usage view or `nuclei vm.list` with storage details
- C) `acli vm.list container=<name> sort_by=disk_usage`
- D) `ncli container get-vm-usage name=<name>`

**Answer: B**
The Prism web interface provides a Storage > Container view that shows per-VM disk usage within a container. Programmatically, `nuclei vm.list` with appropriate fields provides storage consumption details. There is no direct `ncli` or `acli` command that sorts VMs by storage usage within a container.

---

### Q59
An administrator suspects that orphaned snapshots are consuming excessive storage in a protection domain. Which command lists all snapshots for a protection domain?

- A) `ncli pd list-snapshots name=<pd-name>`
- B) `ncli snapshot list protection-domain=<pd-name>`
- C) `ncli pd ls-snaps name=<pd-name>`
- D) `acli pd.snapshot_list <pd-name>`

**Answer: A**
The `ncli pd list-snapshots name=<pd-name>` command lists all snapshots associated with a protection domain, including snapshot IDs, creation timestamps, and sizes. This allows administrators to identify old or orphaned snapshots that may need to be manually expired to reclaim storage space.

---

### Q60
An administrator wants to force a Curator full scan to reclaim space after a large number of VM deletions. Which command triggers a full scan?

- A) `curator_cli start_scan type=full`
- B) `allssh "genesis stop curator && cluster start"`
- C) `ncli curator start-full-scan`
- D) `curator_cli start_curator_full_scan`

**Answer: A**
The `curator_cli start_scan type=full` command manually triggers a Curator full scan. Full scans analyze all data across the cluster and perform garbage collection, deduplication, and space reclamation. Partial scans run more frequently but only process recently changed data.

---

## Section 7: BCDR Procedures (Q61–Q70)

---

### Q61
An administrator needs to create a protection domain with an hourly replication schedule. Which sequence of commands is correct?

- A) `ncli pd create name=PD-HR type=async` then `ncli pd add-hourly-schedule name=PD-HR every-nth-hour=1`
- B) `ncli pd create name=PD-HR type=async` then `ncli pd set-schedule name=PD-HR every-nth-min=60`
- C) `ncli pd create name=PD-HR type=async schedule=hourly`
- D) `acli pd.create PD-HR repl_schedule=3600`

**Answer: A**
Protection domain creation and schedule configuration are separate operations. First, create the PD with `ncli pd create`, then add a replication schedule with `ncli pd add-hourly-schedule` specifying the interval. The two-step process allows multiple schedules on a single PD. Alternative schedule commands include `add-daily-schedule` and `add-minutely-schedule`.

---

### Q62
An administrator needs to configure a remote site for replication between Cluster-A and Cluster-B. Which command on Cluster-A initiates the pairing?

- A) `ncli remote-site create name=ClusterB address-list=<ClusterB-VIP>`
- B) `ncli pd add-remote-site name=PD-1 remote=ClusterB ip=<ClusterB-IP>`
- C) `acli remote.create ClusterB ip=<ClusterB-VIP>`
- D) `ncli replication create-pair local=ClusterA remote=ClusterB`

**Answer: A**
The `ncli remote-site create` command establishes a remote site pairing by specifying the remote cluster's virtual IP via `address-list=`. Authentication is handled through cluster-level trust (Prism credentials are exchanged during setup). The remote site can then be referenced when configuring protection domain replication schedules.

---

### Q63
An administrator needs to add specific VMs to an existing protection domain named "PD-Finance". Which command adds VMs to the PD?

- A) `ncli pd add-vms name=PD-Finance vm-names=VM1,VM2`
- B) `ncli pd protect name=PD-Finance vm-name=VM1`
- C) `acli pd.add_entity PD-Finance vm=VM1`
- D) `ncli pd add-entity name=PD-Finance vm-name=VM1`

**Answer: A**
The `ncli pd add-vms` command adds one or more VMs to a protection domain using a comma-separated list of VM names. This is the direct method for protecting VMs — once added, the VMs are included in the PD's replication schedule.

---

### Q64
An administrator needs to perform a planned failover of protection domain "PD-Finance" from the primary cluster to the remote site. What is the correct sequence?

- A) On primary: `ncli pd migrate name=PD-Finance remote-site=ClusterB` — this triggers a final replication and activates VMs on the remote site
- B) On remote: `ncli pd activate name=PD-Finance` without any action on primary
- C) On primary: `ncli pd deactivate name=PD-Finance` then on remote: `ncli pd activate name=PD-Finance`
- D) On primary: `ncli pd failover name=PD-Finance remote-site=ClusterB`

**Answer: A**
A planned (graceful) failover uses `ncli pd migrate` with `remote-site=` on the primary cluster. This performs a final replication of any outstanding changes, deactivates VMs on the primary, and activates them on the remote site. This ensures zero data loss because the final replication completes before failover.

---

### Q65
During a disaster, the primary cluster is unavailable. An administrator needs to activate the protection domain on the remote (DR) site. Which command is used?

- A) `ncli pd activate name=PD-Finance`
- B) `ncli pd emergency-failover name=PD-Finance`
- C) `ncli pd restore name=PD-Finance from-snapshot=latest`
- D) `ncli pd start name=PD-Finance force=true`

**Answer: A**
In an unplanned (disaster) failover, `ncli pd activate name=PD-Finance` is executed on the remote/DR cluster. This activates the protection domain using the most recent replicated snapshot. Some data loss may occur (up to the RPO interval) since no final replication was possible from the failed primary.

---

### Q66
After a failover, the original primary cluster has been recovered. The administrator needs to set up reverse replication from the DR site back to the recovered primary. What is the correct procedure?

- A) Re-create the protection domain on the recovered primary and perform initial replication
- B) On the DR site (now active): configure the recovered primary as a remote site and update the PD schedule to replicate back
- C) Run `ncli pd reverse-replication name=PD-Finance` on the DR site
- D) Simply run `ncli pd migrate name=PD-Finance` on the DR site to fail back

**Answer: B**
After failover, the DR site is now the active site. To set up reverse replication, you must ensure the recovered primary is configured as a remote site on the DR cluster and then update (or create) the replication schedule on the protection domain to target the recovered primary. There is no automatic reverse replication command.

---

### Q67
An administrator wants to perform a test failover to verify DR readiness without affecting production replication. Which approach is correct?

- A) `ncli pd test-failover name=PD-Finance` — creates test VMs from the latest snapshot on the remote site
- B) On the remote site: `ncli pd activate name=PD-Finance test-mode=true`
- C) On the remote site: (1) Identify latest replicated PD snapshot, (2) Create a new VLAN/network segment isolated from production, (3) Use Prism to restore individual VMs from the snapshot to that isolated network, (4) Power on VMs and validate application functionality, (5) Document test results, (6) Delete test VMs to free storage
- D) `ncli pd clone name=PD-Finance target=Test-PD`

**Answer: C**
Nutanix does not have an automated "test failover" command. The approved procedure is manual: identify the latest replicated snapshot on the remote cluster, isolate test VMs to a separate VLAN (preventing accidental production network access), restore VMs from snapshot via Prism, verify applications function correctly, then clean up test VMs. This validates disaster recovery procedures and RPO/RTO metrics without disrupting ongoing replication or production systems. Document any configuration differences discovered during testing.

---

### Q68
An administrator needs to check the replication status and last successful replication time for a protection domain. Which command provides this information?

- A) `ncli pd get-replication-status name=PD-Finance`
- B) `ncli pd ls name=PD-Finance`
- C) `ncli pd list-replications name=PD-Finance`
- D) `cerebro_cli show_replication_status`

**Answer: B**
The `ncli pd ls name=PD-Finance` command shows the protection domain details including replication schedules, last successful replication time, replication status, and any pending replications. For more detailed replication metrics, the Cerebro status page at port 2020 can also be consulted.

---

### Q69
An administrator needs to expire (delete) old snapshots from a protection domain to free up storage on the remote site. Which command is correct?

- A) `ncli pd remove-snapshot name=PD-Finance snapshot-id=<id>`
- B) `ncli pd expire-snapshot name=PD-Finance id=<snapshot-id>`
- C) `ncli snapshot delete id=<snapshot-id>`
- D) `ncli pd delete-snapshot name=PD-Finance snapshot-id=<id>`

**Answer: A**
The `ncli pd remove-snapshot` command with the protection domain name and snapshot ID removes a specific snapshot and reclaims the associated storage. Administrators should verify that the snapshot is not needed for ongoing replication chains before deletion.

---

### Q70
An administrator is configuring a NearSync protection domain for an RPO of 1 minute. Which is a key requirement for NearSync replication?

- A) Both clusters must be running AOS 5.0 or later and have SSD-only storage pools
- B) The network latency between clusters must be under 5ms, and a dedicated NearSync storage container is required
- C) NearSync requires lightweight snapshots and operates at the vStore level with network latency under 5ms RTT
- D) NearSync requires synchronous replication licenses and identical hardware on both clusters

**Answer: C**
NearSync replication achieves RPOs as low as 1 minute by using lightweight snapshots at the vStore (container) level rather than full crash-consistent snapshots. A key requirement is that network round-trip latency between the two clusters must be less than 5 milliseconds. NearSync is an enhancement of the async replication engine, not a separate synchronous feature.

---

## Section 8: Security Hardening (Q71–Q80)

---

### Q71
An administrator needs to enable cluster lockdown to disable password-based SSH access to CVMs. Which command is correct?

- A) `ncli cluster edit-params enable-ssh-lockdown=true`
- B) `ncli cluster edit enable-lockdown=true`
- C) `ncli cluster lockdown enable`
- D) `ncli cluster edit-params ssh-lockdown=enabled`

**Answer: A**
The `ncli cluster edit-params enable-ssh-lockdown=true` command enables cluster lockdown mode, which disables password-based SSH access to all CVMs. After enabling, only key-based SSH authentication is permitted. Administrator SSH keys must be added before enabling lockdown to avoid being locked out.

---

### Q72
Before enabling cluster lockdown, an administrator must add their SSH public key. Which command adds an SSH key for continued access?

- A) `ncli cluster add-public-key name=admin-key file-path=/home/nutanix/.ssh/id_rsa.pub`
- B) `ncli cluster add-ssh-key name=admin-key key-file=/home/nutanix/.ssh/id_rsa.pub`
- C) `ssh-copy-id nutanix@<cvm-ip>`
- D) `ncli user add-ssh-key username=admin file=/home/nutanix/.ssh/id_rsa.pub`

**Answer: A**
The `ncli cluster add-public-key name=admin-key file-path=<path>` command adds an SSH public key to the cluster-wide authorized keys. The `name=` parameter provides a friendly label for the key. This must be done before enabling lockdown to ensure continued SSH access.

---

### Q73
An administrator wants to run a Security Configuration Management Automation (SCMA) check to verify CVM security compliance. Which command triggers the SCMA scan?

- A) `ncc health_checks security_checks scma_check`
- B) `ncli security run-scma`
- C) `salt-call state.highstate`
- D) `ncc health_checks system_checks stig_check`

**Answer: A**
SCMA is integrated into the NCC framework and can be triggered with `ncc health_checks security_checks scma_check`. This check verifies that CVM configurations comply with the Nutanix security baseline, including file permissions, service configurations, and system hardening settings. Non-compliant settings can be auto-remediated through the SCMA salt state.

---

### Q74
An administrator needs to replace the default self-signed SSL certificate on Prism Element with a CA-signed certificate. Which command installs the new certificate?

- A) `ncli cluster edit-params ssl-cert-file=<cert.pem> ssl-key-file=<key.pem>`
- B) `ncli http-proxy edit cert-file=<cert.pem> key-file=<key.pem>`
- C) Import via Prism > Settings > SSL Certificate, or use `nuclei certificate install` with cert and key files
- D) `openssl s_server -cert <cert.pem> -key <key.pem> -accept 9440`

**Answer: C**
SSL certificate replacement for Prism is performed through the Prism UI under Settings > SSL Certificate, or programmatically using the `nuclei` CLI. The certificate, private key, and CA chain are uploaded together. After installation, Prism services automatically restart to apply the new certificate. There is no `ncli` command for certificate management.

---

### Q75
An administrator wants to enable data-at-rest encryption on the cluster using a local key manager (LKM). Which is the correct first step?

- A) `ncli cluster edit-params enable-encryption=true encryption-type=software`
- B) Enable encryption through Prism > Settings > Data at Rest Encryption, and select Local Key Manager
- C) `ncli data-encryption enable key-management=local`
- D) `ncli container edit name=<name> encryption-enabled=true`

**Answer: B**
Data-at-rest encryption is enabled through the Prism UI under Settings > Data at Rest Encryption. The administrator selects either Local Key Manager (LKM) for self-managed keys or an external Key Management Server (KMS). Encryption is a cluster-wide setting, not per-container, and requires self-encrypting drives (SEDs) or software-based encryption.

---

### Q76
An administrator wants to verify the current security hardening status of the cluster, including SCMA compliance state. Which NCC command provides a comprehensive security report?

- A) `ncc health_checks run_all type=security`
- B) `ncc health_checks security_checks all_checks`
- C) `ncc health_checks security_checks`
- D) `ncc --security-audit`

**Answer: C**
Running `ncc health_checks security_checks` executes all security-related NCC checks, including SCMA compliance, CVE vulnerability status, certificate expiration, and cluster lockdown state. This provides a comprehensive security posture assessment of the cluster.

---

### Q77
An administrator needs to configure an external Key Management Server (KMS) for data-at-rest encryption. Which protocol does Nutanix use to communicate with the KMS?

- A) HTTPS REST API
- B) KMIP (Key Management Interoperability Protocol)
- C) PKCS#11
- D) TLS-PSK (Pre-Shared Key)

**Answer: B**
Nutanix uses KMIP (Key Management Interoperability Protocol) to communicate with external Key Management Servers. KMIP is the industry-standard protocol for key lifecycle management operations. Supported KMS solutions include SafeNet, Vormetric, and IBM Security Key Lifecycle Manager, all communicating over KMIP.

---

### Q78
An administrator needs to verify which CVMs have SSH password authentication currently disabled (lockdown active). Which command checks the lockdown status?

- A) `ncli cluster get-params | grep ssh`
- B) `ncli cluster info | grep lockdown`
- C) `ncli cluster get-ssh-status`
- D) `ssh -o PasswordAuthentication=yes nutanix@<cvm-ip>` (test if password login is rejected)

**Answer: A**
The `ncli cluster get-params` command with a grep for SSH-related parameters shows whether `enable-ssh-lockdown` is set to true or false. This is the definitive check for cluster lockdown status. While option D would functionally test lockdown, it is not the proper administrative verification method.

---

### Q79
An administrator needs to configure RBAC in Prism Central to restrict a user group to only manage VMs in a specific project. Which Prism Central feature should be used?

- A) Create a custom Role with VM permissions and assign it to the user group within the Project
- B) Configure directory-level AD group policies to restrict access
- C) Enable cluster lockdown and restrict SSH access per user group
- D) Create a separate Prism Central instance for each user group

**Answer: A**
Prism Central RBAC uses the combination of Roles (defining permissions) and Projects (defining scope) to implement granular access control. A custom role with specific VM management permissions is created and then assigned to the user group within the target project, ensuring they can only manage VMs within that project's scope.

---

### Q80
An administrator has been alerted that the Prism SSL certificate will expire in 7 days. They need to generate a Certificate Signing Request (CSR) from the cluster. What is the correct approach?

- A) Generate the CSR using `openssl req -new -key /etc/ssl/prism.key -out prism.csr` on the CVM
- B) Use Prism > Settings > SSL Certificate > "Generate CSR" to create the request with cluster-specific details
- C) `ncli cluster generate-csr common-name=<cluster-fqdn>`
- D) `nuclei certificate generate-csr --cn <cluster-fqdn> --san <cvm-ips>`

**Answer: B**
The Prism UI provides a built-in CSR generation wizard under Settings > SSL Certificate that pre-populates the cluster FQDN, CVM IPs as Subject Alternative Names, and other required fields. This ensures the CSR includes all necessary SANs for the cluster's multi-CVM architecture. Generating it manually with `openssl` (option A) risks missing required SANs.

---

## Answer Key — Quick Reference

| Q | Answer | Q | Answer | Q | Answer | Q | Answer |
|---|--------|---|--------|---|--------|---|--------|
| 1 | B | 21 | B | 41 | A | 61 | A |
| 2 | B | 22 | A | 42 | B | 62 | A |
| 3 | A | 23 | A | 43 | B | 63 | A |
| 4 | A | 24 | C | 44 | B | 64 | A |
| 5 | A | 25 | B | 45 | A | 65 | A |
| 6 | A | 26 | C | 46 | A | 66 | B |
| 7 | A | 27 | C | 47 | D | 67 | C |
| 8 | A | 28 | C | 48 | B | 68 | B |
| 9 | A | 29 | B | 49 | D | 69 | A |
| 10 | A | 30 | B | 50 | B | 70 | C |
| 11 | B | 31 | A | 51 | A | 71 | A |
| 12 | B | 32 | B | 52 | A | 72 | A |
| 13 | B | 33 | B | 53 | B | 73 | A |
| 14 | A | 34 | A | 54 | B | 74 | C |
| 15 | B | 35 | B | 55 | C | 75 | B |
| 16 | B | 36 | B | 56 | C | 76 | C |
| 17 | C | 37 | A | 57 | A | 77 | B |
| 18 | B | 38 | B | 58 | B | 78 | A |
| 19 | A | 39 | A | 59 | A | 79 | A |
| 20 | A | 40 | B | 60 | A | 80 | B |

---

*NCM-MCI 6.10 — Part 4: CLI Commands, Troubleshooting & Live-Lab Supplementary Questions*
*80 Questions | Generated for advanced exam preparation*
