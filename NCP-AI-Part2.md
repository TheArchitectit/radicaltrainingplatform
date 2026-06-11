# NCP-AI 6.10 Certification Exam – Domains 3, 4 & 5

## Domain 3 – Day 2 Operations (Questions 1–27)

---

### Q1
An ML engineer notices that inference latency for a large language model hosted on NAI has increased significantly during peak hours. The NKP dashboard shows GPU utilization at 98% with a growing request queue depth. Which action should the engineer take FIRST to reduce latency without deploying additional hardware?

- A) Increase the KV cache allocation and enable PagedAttention in the vLLM serving configuration
- B) Rotate the TLS certificates on the inference API endpoint
- C) Switch the model from FP16 to FP32 precision for higher accuracy
- D) Reduce the Kubernetes namespace resource quota to limit concurrent users

**Answer: A**
PagedAttention in vLLM optimizes GPU memory usage for the KV cache, allowing more concurrent requests to be served efficiently on existing hardware. Switching to FP32 would double memory consumption, worsening the problem.

---

### Q2
A platform administrator needs to monitor GPU health across a Nutanix AHV cluster running NAI workloads. Which combination of tools provides the MOST comprehensive view of GPU utilization, temperature, and ECC error counts?

- A) nvidia-smi on the GPU node combined with Prism Central VM metrics
- B) Kubernetes Horizontal Pod Autoscaler logs combined with Objects storage metrics
- C) Nutanix Files analytics combined with NKP ingress controller logs
- D) Prism Element storage dashboard combined with AOS replication metrics

**Answer: A**
nvidia-smi reports real-time GPU utilization, memory usage, temperature, and ECC errors directly from the NVIDIA driver. Prism Central adds infrastructure-level VM health and resource tracking, giving a full picture of GPU node status.

---

### Q3
An organization requires that GPU pods for NAI inference endpoints never exceed 24 GB of GPU memory per container. Where should the administrator enforce this limit?

- A) In the Kubernetes resource limits section of the pod spec, setting `nvidia.com/gpu-memory` limits
- B) In Prism Central by configuring a storage policy on the volume group
- C) In the AHV hypervisor by adjusting the VM BIOS settings
- D) In the Nutanix Objects bucket policy attached to the model repository

**Answer: A**
Kubernetes resource limits in the pod specification are the correct mechanism to enforce GPU memory constraints per container. This ensures the Kubernetes scheduler and NVIDIA device plugin respect the allocation boundaries.

---

### Q4
A DevOps team wants to perform a zero-downtime model update for a production NAI inference endpoint currently serving an LLM. Which strategy ensures continuous availability during the model swap?

- A) Use a Kubernetes rolling update strategy on the deployment, allowing new pods with the updated model to become ready before old pods are terminated
- B) Delete all existing pods simultaneously and then deploy the new model version
- C) Stop the NKP cluster, replace the model files on the persistent volume, and restart the cluster
- D) Change the DNS record to point to a different cluster while manually copying model files

**Answer: A**
A Kubernetes rolling update gradually replaces old pods with new ones, ensuring that some pods are always available to serve requests. This is the standard approach for zero-downtime model swaps in a containerized environment.

---

### Q5
Which metric is MOST useful for evaluating the real-time responsiveness of a streaming chat endpoint hosted on NAI?

- A) Time-to-first-token (TTFT)
- B) Total persistent volume IOPS
- C) Nutanix Files share latency
- D) Prism Central alert count

**Answer: A**
Time-to-first-token (TTFT) measures the delay between sending a prompt and receiving the first output token, directly reflecting the perceived responsiveness of a streaming inference endpoint.

---

### Q6
An administrator receives an alert that the Prometheus scrape target for NAI inference metrics is returning errors. The Grafana dashboards are showing no data. Which is the MOST likely first step to diagnose the issue?

- A) Verify that the NAI metrics endpoint is healthy and that the Prometheus ServiceMonitor is correctly targeting the inference service
- B) Restart the Prism Central VM and re-register the NKP cluster
- C) Re-download the model artifacts from the Nutanix Objects bucket
- D) Increase the GPU passthrough allocation in AHV to provide more VRAM

**Answer: A**
Prometheus scrape failures are typically caused by a misconfigured ServiceMonitor or an unhealthy metrics endpoint. Verifying the endpoint health and Prometheus target configuration is the correct first diagnostic step.

---

### Q7
A security team mandates that all NAI API keys must be rotated every 90 days. A compromised key is discovered during a routine audit. What should the administrator do IMMEDIATELY?

- A) Revoke the compromised API key immediately, issue a new key, and update all consuming applications
- B) Wait until the next scheduled 90-day rotation to replace the key
- C) Disable GPU passthrough on the cluster to prevent further inference requests
- D) Delete the NAI inference endpoint and redeploy it with a new name

**Answer: A**
A compromised API key must be revoked immediately regardless of the rotation schedule to prevent unauthorized access. Waiting for the scheduled rotation would leave the system vulnerable.

---

### Q8
An NAI operator log shows repeated `ImagePullBackOff` errors for an inference endpoint pod. Which action should the administrator investigate FIRST?

- A) Verify the container image registry credentials and network connectivity from the NKP worker nodes to the registry
- B) Increase the GPU memory allocation in the pod resource requests
- C) Rotate the TLS certificates on the Kubernetes API server
- D) Reconfigure the PagedAttention settings in the vLLM serving runtime

**Answer: A**
`ImagePullBackOff` indicates the kubelet cannot pull the container image, typically due to invalid registry credentials, network issues, or an incorrect image reference — not GPU or TLS configuration problems.

---

### Q9
Which of the following is NOT a valid reason to add additional GPU nodes to an NAI cluster instead of optimizing the existing model configuration?

- A) The model is already quantized to the smallest viable precision, and request queue depth continues to grow during peak hours
- B) The administrator wants to reduce Prometheus alert noise by spreading pods across more nodes
- C) Multiple teams need dedicated GPU resources with hard namespace quotas that exceed current cluster capacity
- D) The organization plans to serve additional models concurrently, and existing GPU memory is fully allocated

**Answer: B**
Reducing Prometheus alert noise is not a valid scaling justification. Scaling decisions should be driven by resource saturation, multi-tenancy requirements, or the need to serve additional models — not monitoring cosmetics.

---

### Q10
An administrator is configuring Kubernetes resource quotas for a namespace that runs NAI inference pods. Which resource type must be included in the ResourceQuota to control GPU allocation?

- A) `requests.nvidia.com/gpu`
- B) `requests.nutanix.com/storage-class`
- C) `limits.kubernetes.io/ingress-bandwidth`
- D) `requests.amd.com/vgpu`

**Answer: A**
The NVIDIA device plugin registers GPUs as `nvidia.com/gpu` extended resources in Kubernetes. Resource quotas must reference this resource type to control GPU allocation per namespace.

---

### Q11
A data scientist reports that tokens-per-second (TPS) throughput dropped after a model update. The GPU utilization is only at 40%. Which configuration change is MOST likely to improve throughput?

- A) Increase the maximum batch size in the vLLM serving configuration to allow more concurrent requests to be processed together
- B) Reduce the number of pod replicas to concentrate GPU usage on fewer pods
- C) Disable Prometheus metric collection to free CPU cycles
- D) Migrate the persistent volume from Nutanix Volumes to Nutanix Files

**Answer: A**
Low GPU utilization with reduced TPS typically indicates the inference engine is not batching enough requests together. Increasing the batch size allows vLLM to process more tokens in parallel, improving throughput on underutilized GPUs.

---

### Q12
An organization needs to back up NAI model artifacts and endpoint configurations for disaster recovery. Which approach provides the MOST complete backup?

- A) Store model artifacts on Nutanix Objects with versioning enabled and export Kubernetes deployment manifests and ConfigMaps to a Git repository
- B) Take an AHV VM snapshot of the NKP control plane node only
- C) Copy the Grafana dashboard JSON files to a local workstation
- D) Export the Prism Central alert configuration to a CSV file

**Answer: A**
A comprehensive backup includes model files (stored durably on Objects with versioning) and the Kubernetes configuration (deployment specs, ConfigMaps, secrets) stored in version control for reproducible recovery.

---

### Q13
An administrator wants to set up alerting rules so the on-call team is notified when inference latency exceeds an SLA threshold. Which approach is MOST appropriate in an NAI environment?

- A) Create a Prometheus alerting rule that triggers when the p99 inference latency metric exceeds the SLA threshold, routed via Alertmanager
- B) Configure a Prism Central storage alert on volume group IOPS
- C) Set up a cron job that runs nvidia-smi every 5 minutes and emails the output
- D) Enable Kubernetes pod eviction policies based on memory pressure

**Answer: A**
Prometheus alerting rules with Alertmanager provide automated, threshold-based alerting on inference latency metrics, which is the standard approach for SLA monitoring in Kubernetes-based ML serving environments.

---

### Q14
During a routine audit, the security team needs to determine which users accessed a specific NAI inference endpoint over the past 30 days and how many tokens each consumed. Which data source provides this information?

- A) API gateway or NAI audit logs that record API key identity, endpoint, and token usage per request
- B) AHV hypervisor console logs on each GPU node
- C) Nutanix Files share access logs for the model artifact directory
- D) NKP etcd backup snapshots from the control plane

**Answer: A**
Audit logs from the API gateway or NAI platform capture per-request metadata including the authenticated identity (API key), target endpoint, and token consumption — essential for usage attribution and compliance.

---

### Q15
An ML engineer observes that a newly deployed NAI endpoint is consuming significantly more GPU memory than the previous version of the same model. The model file size has not changed. What is the MOST likely explanation?

- A) The new deployment uses a larger KV cache allocation or increased maximum context length, consuming additional GPU memory at runtime
- B) The Nutanix Objects bucket storing the model is using a different erasure coding policy
- C) The Prism Central VM was upgraded to a newer AOS version
- D) The Kubernetes namespace was moved to a different NKP cluster

**Answer: A**
GPU memory usage during inference depends heavily on the KV cache size, which scales with the configured maximum context length and batch size — not just the static model file size.

---

### Q16
An administrator needs to rotate TLS certificates for NAI API endpoints before they expire. Which step is essential to avoid service disruption during certificate rotation?

- A) Update the Kubernetes TLS Secret with the new certificate and key, then trigger a rolling restart of the ingress controller or inference pods
- B) Delete the entire NKP cluster and redeploy with new certificates
- C) Disable HTTPS on the endpoint and switch to HTTP until new certificates are ready
- D) Reboot all AHV hosts in the Nutanix cluster simultaneously

**Answer: A**
Updating the Kubernetes TLS Secret and performing a rolling restart ensures that pods pick up the new certificate without full service interruption. Deleting the cluster or disabling HTTPS would cause unnecessary downtime or security risk.

---

### Q17
Which statement about Kubernetes event logs in an NAI deployment is TRUE?

- A) Kubernetes events record pod scheduling decisions, image pull status, and resource allocation failures, and they are automatically garbage-collected after a default retention period
- B) Kubernetes events contain the full model weights and can be used to restore a model
- C) Kubernetes events are stored permanently in Nutanix Objects and never expire
- D) Kubernetes events can only be viewed through Prism Central and are not accessible via kubectl

**Answer: A**
Kubernetes events are short-lived records of cluster operations (scheduling, pulling images, errors) that are garbage-collected by default (typically after 1 hour). They are accessible via `kubectl get events` and through the NKP dashboard.

---

### Q18
A platform team notices that a single tenant is consuming 80% of the GPU resources in a shared NAI cluster, starving other teams. What is the BEST way to enforce fair GPU sharing?

- A) Create per-namespace Kubernetes ResourceQuotas with GPU limits and assign each team to a separate namespace
- B) Manually stop the tenant's pods during business hours and restart them overnight
- C) Reduce the total GPU count in the cluster to discourage overconsumption
- D) Disable GPU passthrough for the tenant's AHV VMs

**Answer: A**
Per-namespace ResourceQuotas with GPU limits enforce hard boundaries on GPU consumption per team, ensuring fair resource sharing without manual intervention or infrastructure reduction.

---

### Q19
An NAI inference endpoint has been running reliably for months. After a routine NKP cluster upgrade, the endpoint starts returning 503 errors. Inference pods are running, but the Kubernetes Service shows no healthy endpoints. What should the administrator check FIRST?

- A) Verify that the pod readiness probe configuration is correct and that pods are passing health checks after the cluster upgrade
- B) Re-download the model artifacts from Hugging Face Hub
- C) Increase the GPU memory allocation by 50%
- D) Rotate the API keys for all consuming applications

**Answer: A**
A 503 with running pods but no healthy endpoints in the Service typically means readiness probes are failing. Cluster upgrades can change probe behavior or timing, so verifying probe configuration is the correct first step.

---

### Q20
An administrator wants to track anomalous access patterns on NAI endpoints, such as a sudden spike in token consumption from a single API key. Which approach is MOST effective?

- A) Configure alerting rules on per-key token consumption metrics, triggering when usage exceeds a rolling average threshold
- B) Manually review Prism Central storage utilization daily
- C) Check nvidia-smi output once per week for GPU temperature anomalies
- D) Enable Kubernetes pod disruption budgets for inference deployments

**Answer: A**
Per-key token consumption alerting detects anomalous usage patterns in near real-time, enabling rapid investigation of potentially compromised keys or unexpected workload changes.

---

### Q21
An ML engineer needs to view the NAI operator logs to debug why an endpoint deployment is stuck in a pending state. Which command retrieves the relevant logs?

- A) `kubectl logs -n nai-system deployment/nai-operator`
- B) `nvidia-smi --query-gpu=temperature.gpu --format=csv`
- C) `ncli cluster get-status`
- D) `acli vm.list`

**Answer: A**
The NAI operator runs as a Kubernetes deployment. Using `kubectl logs` against the operator deployment in the `nai-system` namespace retrieves the operator's log output, which includes endpoint lifecycle events and error messages.

---

### Q22
Which batch size tuning strategy is MOST appropriate when the goal is to maximize inference throughput on a GPU with 80 GB of VRAM serving a 13B parameter model?

- A) Gradually increase the batch size while monitoring GPU memory usage and TPS until memory utilization approaches capacity without triggering OOM errors
- B) Set the batch size to 1 and rely on vertical pod autoscaling to increase GPU count
- C) Set the batch size to the maximum possible value regardless of model size or memory
- D) Disable batching entirely and process one request at a time for lowest latency

**Answer: A**
Optimal batch size is found by incrementally increasing it and monitoring the GPU memory/TPS tradeoff. Too large risks OOM; too small underutilizes the GPU. Systematic tuning balances throughput and stability.

---

### Q23
An organization stores NAI model artifacts on Nutanix Objects. Which feature of Nutanix Objects is MOST important for protecting against accidental model deletion?

- A) Object versioning, which retains previous versions of objects even after overwrite or deletion
- B) NKP pod disruption budgets, which prevent pod evictions
- C) AHV live migration, which moves VMs between hosts without downtime
- D) Prism Central Calm blueprints, which automate VM provisioning

**Answer: A**
Object versioning on Nutanix Objects preserves every version of stored artifacts, allowing recovery of previous model versions even if files are accidentally overwritten or deleted.

---

### Q24
A monitoring dashboard shows that GPU utilization on an NAI inference node fluctuates between 10% and 95% over the course of a day. Request latency spikes correlate with high utilization periods. Which scaling approach addresses this pattern?

- A) Configure Kubernetes Horizontal Pod Autoscaler (HPA) with GPU utilization as the custom metric to scale inference pod replicas based on demand
- B) Permanently double the number of GPU nodes regardless of demand patterns
- C) Reduce the model precision from FP16 to INT2 to minimize GPU usage
- D) Disable request queuing in vLLM to reject excess traffic immediately

**Answer: A**
HPA with GPU-based custom metrics dynamically scales inference replicas in response to utilization changes, matching capacity to demand without permanent over-provisioning.

---

### Q25
An administrator configures Grafana dashboards for NAI monitoring. Which Prometheus metric provides the BEST signal for detecting that inference requests are waiting too long before processing begins?

- A) Request queue depth or pending request count in the inference engine metrics
- B) Nutanix cluster storage replication factor
- C) AHV hypervisor CPU ready time
- D) Kubernetes etcd commit duration

**Answer: A**
Request queue depth directly measures how many inference requests are waiting to be processed, which is the primary indicator of queuing delay and processing bottlenecks in the serving pipeline.

---

### Q26
A compliance requirement states that all changes to NAI endpoint configurations must be traceable to an individual administrator. Which approach BEST satisfies this requirement?

- A) Enable Kubernetes RBAC audit logging to record which authenticated user modified deployments, ConfigMaps, and Secrets in the NAI namespace
- B) Require all administrators to share a single kubeconfig with cluster-admin privileges
- C) Store all configuration files on an unversioned NFS share
- D) Disable RBAC and rely on network segmentation to control access

**Answer: A**
Kubernetes RBAC audit logging records the authenticated identity, timestamp, and action for every API request, providing a traceable audit trail that satisfies compliance requirements for configuration change tracking.

---

### Q27
An engineer is evaluating whether to add a second GPU node or optimize the existing model serving configuration. The current node has an NVIDIA A100 80 GB GPU running a 7B parameter model in FP16. GPU memory utilization is at 30%, and GPU compute utilization is at 45%. Request queue depth is zero. What should the engineer recommend?

- A) Optimize the existing configuration by increasing batch size and concurrent request limits before adding hardware, since GPU resources are significantly underutilized
- B) Add a second GPU node immediately because the GPU utilization is below 50%
- C) Replace the A100 with an NVIDIA T4 to save costs since the workload is light
- D) Migrate the model from NAI to Prism Central Files for better throughput

**Answer: A**
With 30% memory and 45% compute utilization and no queue depth, the existing GPU has substantial headroom. Increasing batch size or concurrency will improve utilization and throughput before any hardware investment is warranted.

---

## Domain 4 – Troubleshoot NAI (Questions 28–54)

---

### Q28
An administrator deploys an NAI inference endpoint, but the pod enters a `CrashLoopBackOff` state. The pod logs show `CUDA error: no CUDA-capable device is detected`. What is the MOST likely cause?

- A) GPU passthrough is not configured on the AHV VM hosting the NKP worker node, so the container cannot access the physical GPU
- B) The Nutanix Objects bucket containing the model has exceeded its storage quota
- C) The Prometheus ServiceMonitor is targeting the wrong namespace
- D) The Kubernetes Horizontal Pod Autoscaler has scaled the deployment to zero replicas

**Answer: A**
The `no CUDA-capable device is detected` error means the container runtime cannot see a GPU. This is typically caused by GPU passthrough not being enabled on the AHV VM or the NVIDIA device plugin not running on the node.

---

### Q29
An inference endpoint returns `OutOfMemoryError: CUDA out of memory` when processing long prompts. The model loads successfully for short prompts. What is the MOST likely cause?

- A) The KV cache grows with prompt length and exceeds available GPU memory when processing long context inputs
- B) The Kubernetes API server has run out of etcd storage
- C) The NKP control plane node does not have a GPU assigned
- D) The Nutanix Files share holding the model has a file size limit of 1 GB

**Answer: A**
The KV cache in transformer inference scales linearly with sequence length. Long prompts require proportionally more GPU memory for the cache, which can exceed available VRAM even when the model weights fit comfortably.

---

### Q30
A newly deployed NAI inference endpoint is not reachable from external clients, but `kubectl port-forward` to the pod works correctly. Where should the administrator investigate?

- A) The Kubernetes ingress controller configuration and the associated Service/Ingress resources to ensure external traffic is being routed to the inference pods
- B) The GPU driver version installed inside the inference container
- C) The vLLM PagedAttention configuration parameters
- D) The Nutanix Objects lifecycle policy for model artifacts

**Answer: A**
If the pod is reachable via port-forward but not externally, the issue lies in the networking layer — typically a misconfigured Ingress resource, missing ingress controller, or incorrect Service selector that prevents external traffic from reaching the pods.

---

### Q31
An administrator runs `nvidia-smi` on an NKP worker node and sees `ERR!` in the ECC error column for a GPU. Inference pods on this node are experiencing intermittent incorrect outputs. What should the administrator do?

- A) Drain the node using `kubectl drain`, schedule GPU hardware inspection or replacement, and allow workloads to reschedule to healthy nodes
- B) Increase the batch size in vLLM to compensate for the error rate
- C) Restart the Prism Central VM to reset the GPU error counters
- D) Delete and recreate the Kubernetes namespace to clear the error state

**Answer: A**
ECC errors indicate potential GPU hardware degradation that can cause computation errors. The correct procedure is to drain the node (safely evacuating workloads), then inspect or replace the GPU to prevent data corruption.

---

### Q32
An ML engineer attempts to load a model in GGUF format on an NAI endpoint configured with the vLLM runtime. The pod logs show `ValueError: Unsupported model format`. What is the issue?

- A) vLLM natively supports models in Hugging Face safetensors/PyTorch formats but does not support GGUF format, which is designed for llama.cpp-based runtimes
- B) The GPU does not have enough VRAM to hold the GGUF header
- C) The Kubernetes PersistentVolumeClaim is in ReadOnlyMany mode
- D) The NAI operator is running an outdated version of Prometheus

**Answer: A**
GGUF is a quantized model format for llama.cpp and compatible runtimes. vLLM uses Hugging Face-compatible formats (safetensors, PyTorch bin). Loading a GGUF model on vLLM results in a format mismatch error.

---

### Q33
An NAI inference pod is stuck in `Pending` state. Running `kubectl describe pod` shows the event: `0/3 nodes are available: 3 Insufficient nvidia.com/gpu`. What does this indicate?

- A) All GPU resources across the three worker nodes are fully allocated to existing pods, and no GPUs are available to schedule the new pod
- B) The NVIDIA driver is not installed on the pod container image
- C) The Nutanix Objects bucket has reached its object count limit
- D) The Kubernetes API server certificate has expired

**Answer: A**
The `Insufficient nvidia.com/gpu` scheduling error means every node in the cluster has already allocated its GPU resources to other pods. The new pod cannot be scheduled until GPUs are freed or new GPU nodes are added.

---

### Q34
After restarting an NKP worker node, the NVIDIA device plugin pod on that node is in `CrashLoopBackOff`. Inference pods are not being scheduled to this node. What should the administrator check FIRST?

- A) Verify that the NVIDIA GPU drivers are properly loaded on the host and that the GPU device files are accessible in `/dev/nvidia*`
- B) Check if the Nutanix Files share is mounted on Prism Central
- C) Verify the Grafana dashboard JSON syntax
- D) Inspect the Kubernetes HPA minimum replica count

**Answer: A**
The NVIDIA device plugin requires the host NVIDIA drivers to be loaded and GPU devices to be accessible. If drivers fail to load after a reboot, the device plugin crashes, preventing GPU resource advertisement to the Kubernetes scheduler.

---

### Q35
An inference endpoint intermittently returns HTTP 504 Gateway Timeout errors. The pod logs show that inference completes successfully but takes 45 seconds. What is the MOST likely cause?

- A) The ingress controller or load balancer has a request timeout configured lower than the actual inference time, causing it to terminate the connection before the response is ready
- B) The model has been corrupted and needs to be re-downloaded
- C) The GPU has overheated and entered thermal throttling
- D) The Kubernetes namespace has exceeded its ResourceQuota for CPU

**Answer: A**
HTTP 504 errors from the ingress controller with successful but slow pod-level inference indicate a timeout mismatch. The ingress/load balancer timeout must be increased to accommodate the expected inference duration.

---

### Q36
An administrator needs to troubleshoot a failed NAI endpoint deployment. Which sequence of kubectl commands provides the MOST effective diagnostic workflow?

- A) `kubectl get pods -n <namespace>` → `kubectl describe pod <pod-name>` → `kubectl logs <pod-name>` → `kubectl exec -it <pod-name> -- bash`
- B) `kubectl delete namespace <namespace>` → `kubectl create namespace <namespace>` → `kubectl apply -f deployment.yaml`
- C) `kubectl scale deployment --replicas=0` → `kubectl scale deployment --replicas=1` → `kubectl get svc`
- D) `kubectl top nodes` → `kubectl cordon <node>` → `kubectl drain <node>`

**Answer: A**
The standard diagnostic workflow starts by listing pods to see their status, describing the pod for events and conditions, checking logs for application errors, and finally exec-ing into the container for interactive debugging.

---

### Q37
An NAI endpoint pod is running but inference requests return `Connection refused` on port 8000. The pod logs show the model loaded successfully. What should the administrator check?

- A) Verify that the containerPort in the pod spec matches port 8000 and that the Kubernetes Service `targetPort` is correctly mapped to the container's listening port
- B) Check the Nutanix Objects bucket ACL for the model artifact
- C) Restart the Prism Central management VM
- D) Increase the GPU count from 1 to 4 in the pod resource request

**Answer: A**
`Connection refused` on a running pod with a loaded model typically means a port mismatch between the Service targetPort and the container's actual listening port, or the container is binding to localhost instead of 0.0.0.0.

---

### Q38
A model download to Nutanix Objects fails repeatedly with a checksum mismatch error. The network connectivity test to the model source passes. What should the administrator do?

- A) Delete the partially downloaded file, verify the expected checksum from the model source, and retry the download, ensuring no proxy or CDN is caching a corrupted version
- B) Increase GPU memory on the inference pod
- C) Change the vLLM batch size to 1
- D) Rotate the TLS certificate on the NKP API server

**Answer: A**
Checksum mismatches typically indicate a corrupted or incomplete download, sometimes caused by caching proxies. Clearing the cached file and retrying from the source with checksum verification resolves the issue.

---

### Q39
An administrator receives a `FailedScheduling` event for an NAI pod with the message `node(s) didn't match Pod's node affinity/selector`. The cluster has available GPU nodes. What is the MOST likely cause?

- A) The pod specification includes a nodeSelector or nodeAffinity rule that does not match the labels on the available GPU nodes
- B) The NVIDIA driver version is too new for the GPU hardware
- C) The model file is stored in an incompatible format
- D) The Kubernetes Service type is set to ClusterIP instead of NodePort

**Answer: A**
Node affinity/selector mismatches occur when the pod's scheduling constraints reference labels that don't exist on any available nodes. The administrator must either update the pod's affinity rules or label the GPU nodes accordingly.

---

### Q40
An inference pod repeatedly terminates with `OOMKilled` status, but GPU memory shows only 60% utilization. What is the MOST likely explanation?

- A) The pod is being killed due to exceeding its Kubernetes memory limit for system RAM (not GPU VRAM), because the inference runtime also uses significant host memory for tokenization and request handling
- B) The GPU has a hardware defect causing it to report incorrect memory utilization
- C) The Nutanix Objects bucket has run out of storage capacity
- D) The Prometheus alerting rule is incorrectly triggering pod termination

**Answer: A**
`OOMKilled` in Kubernetes refers to the container exceeding its system RAM (not GPU VRAM) limit. Inference runtimes use host memory for tokenization, request queues, and the Python runtime, which can exceed the container's memory limit independently of GPU usage.

---

### Q41
An administrator notices that DNS resolution for an NAI inference endpoint fails intermittently from client applications. Pods and the Kubernetes Service are healthy. What should be investigated?

- A) The CoreDNS pods in the kube-system namespace and any external DNS configuration for the ingress hostname
- B) The GPU thermal throttling thresholds on the worker nodes
- C) The Nutanix Files share quota settings
- D) The vLLM KV cache eviction policy

**Answer: A**
Intermittent DNS failures with healthy pods typically point to CoreDNS issues (pod health, resource limits, upstream DNS forwarding) or external DNS misconfiguration for the ingress hostname.

---

### Q42
After scaling an NAI inference deployment from 2 to 4 replicas, two of the new pods are stuck in `ContainerCreating` state. What should the administrator investigate?

- A) Check if the PersistentVolumeClaim for the model files supports `ReadWriteMany` access mode, as multiple pods may be unable to mount the same volume simultaneously
- B) Verify that the Grafana dashboard has been updated to show 4 replicas
- C) Check if the Prism Central license has expired
- D) Verify that the Nutanix Objects bucket versioning policy is enabled

**Answer: A**
When scaling replicas, all pods need access to the model files. If the PVC uses `ReadWriteOnce`, only one node can mount it. `ReadWriteMany` (e.g., backed by Nutanix Files) is needed for multi-node pod scheduling.

---

### Q43
An NKP cluster health check shows a worker node in `NotReady` state. NAI pods previously running on this node are being rescheduled. Which Prism Central view helps determine the underlying infrastructure issue?

- A) The VM list view filtered to the affected worker node VM, showing CPU, memory, disk, and network health metrics
- B) The Calm marketplace showing available blueprints
- C) The Karbon cluster creation wizard
- D) The Objects browser showing bucket access logs

**Answer: A**
Prism Central's VM-level view provides infrastructure diagnostics — CPU, memory, disk I/O, and network metrics — for the underlying VM hosting the NKP worker node, helping identify hardware or hypervisor-level issues causing the `NotReady` state.

---

### Q44
A model endpoint returns `context length exceeded` errors when users submit prompts with extensive conversation history. Which parameter should the administrator adjust to handle longer inputs?

- A) Increase the `max_model_len` parameter in the vLLM configuration, ensuring sufficient GPU memory is available for the larger KV cache
- B) Increase the Nutanix Objects bucket size limit
- C) Change the Kubernetes Service from ClusterIP to LoadBalancer
- D) Add additional Prometheus scrape targets

**Answer: A**
The `max_model_len` parameter in vLLM controls the maximum context length the server will accept. Increasing it allows longer prompts but requires proportionally more GPU memory for the KV cache.

---

### Q45
An administrator needs to recover an NAI endpoint after its configuration was accidentally corrupted by an unauthorized `kubectl apply`. What is the recommended recovery procedure?

- A) Delete the corrupted endpoint resources and recreate them from the version-controlled manifests stored in the Git repository
- B) Restart all AHV hosts in the Nutanix cluster
- C) Re-register the NKP cluster with Prism Central
- D) Increase the Kubernetes etcd snapshot retention count

**Answer: A**
The standard recovery procedure for corrupted Kubernetes configurations is to delete the corrupted resources and reapply the known-good manifests from version control, which is why storing configurations in Git is a best practice.

---

### Q46
An NKP cluster node needs maintenance. The administrator must ensure NAI inference pods are gracefully migrated. Which kubectl command should be used BEFORE taking the node offline?

- A) `kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data`
- B) `kubectl delete node <node-name> --force`
- C) `kubectl taint nodes <node-name> gpu=broken:NoSchedule`
- D) `kubectl cordon <node-name>` only, without draining

**Answer: A**
`kubectl drain` safely evicts all pods from the node (respecting PodDisruptionBudgets), reschedules them on other nodes, and cordons the node to prevent new scheduling — the correct pre-maintenance procedure.

---

### Q47
An NAI inference pod's GPU shows 0% utilization in nvidia-smi even though the pod is in `Running` state and claims to have loaded the model. Inference requests return errors. What should the administrator check?

- A) Verify that the CUDA libraries inside the container match the NVIDIA driver version on the host and that the model was loaded to the GPU, not CPU-only mode
- B) Check if the Prism Central dashboard theme was changed recently
- C) Verify that the Nutanix Files share has deduplication enabled
- D) Ensure that the Kubernetes namespace has a NetworkPolicy allowing egress to Nutanix Objects

**Answer: A**
Zero GPU utilization with a "loaded" model suggests a CUDA version mismatch or the runtime falling back to CPU. Verifying driver/library compatibility and confirming the model is on the GPU device is the correct diagnostic step.

---

### Q48
Which kubectl command is MOST useful for determining why a specific NAI pod was evicted from a node?

- A) `kubectl describe pod <pod-name> -n <namespace>` to view the Events section and conditions showing eviction reason
- B) `kubectl top pod <pod-name>` to view current resource usage
- C) `kubectl get endpoints <service-name>` to list service endpoints
- D) `kubectl rollout history deployment/<name>` to view deployment history

**Answer: A**
`kubectl describe pod` shows the Events section with detailed eviction reasons (resource pressure, preemption, etc.) and the pod's status conditions, which are essential for diagnosing why a pod was removed from a node.

---

### Q49
An NAI endpoint was working but stops responding after a Kubernetes Secret containing the model download credentials was accidentally deleted. What is the correct recovery approach?

- A) Recreate the Kubernetes Secret with the correct credentials and restart the affected pods to trigger a fresh credential mount
- B) Increase GPU memory to allow the model to run from cache
- C) Delete and recreate the NKP cluster
- D) Switch the inference runtime from vLLM to a CPU-only framework

**Answer: A**
Kubernetes Secrets are mounted into pods at runtime. Recreating the deleted Secret and restarting the pods ensures they pick up the new credentials for model access and operations.

---

### Q50
An administrator suspects a storage performance issue is causing slow model loading times on NAI endpoints. Which Prism Central metric is MOST relevant?

- A) Storage controller IOPS and latency metrics for the volume backing the PersistentVolume used by inference pods
- B) Prism Central login page load time
- C) NKP cluster certificate expiration date
- D) Nutanix Files share replication lag to a remote site

**Answer: A**
Model loading is a storage-intensive operation that reads large files from persistent storage. Storage controller IOPS and latency metrics in Prism Central directly indicate whether storage performance is the bottleneck.

---

### Q51
An inference endpoint returns correct responses for simple prompts but produces garbled output for complex multi-turn conversations. GPU health checks pass. What is the MOST likely issue?

- A) The model's maximum context length is being silently truncated, causing the conversation history to be cut off mid-token, resulting in incoherent generation
- B) The Kubernetes Service is using session affinity instead of round-robin
- C) The AHV hypervisor CPU scheduling priority is set too low
- D) The Nutanix Objects WORM policy is preventing model file updates

**Answer: A**
Silent context truncation is a common issue when multi-turn conversations exceed the model's maximum context window. The model receives incomplete context and generates incoherent output as a result.

---

### Q52
An administrator is troubleshooting a network issue where NAI endpoints are accessible within the Kubernetes cluster but not from external clients. The ingress controller pods are running. Which resource should be examined?

- A) The Ingress resource configuration, verifying correct hostnames, paths, TLS settings, and the backend Service reference
- B) The NVIDIA device plugin DaemonSet
- C) The Nutanix Objects bucket lifecycle policy
- D) The Prism Central report generation schedule

**Answer: A**
With functioning ingress controller pods but no external access, the Ingress resource itself is the most likely problem — incorrect hostname, path matching, TLS configuration, or backend Service reference.

---

### Q53
After a power outage, an NKP cluster comes back online but NAI inference pods fail to start, reporting `VolumeMount` errors. What should the administrator verify?

- A) The PersistentVolumes and PersistentVolumeClaims are in `Bound` state and the underlying Nutanix storage (Volumes or Files) is accessible after the power restoration
- B) The Grafana dashboards are displaying real-time data
- C) The GPU temperature is within normal operating range
- D) The Kubernetes ConfigMap for Prometheus contains valid YAML

**Answer: A**
After a power outage, storage subsystems may not recover immediately. Verifying PV/PVC bind state and underlying Nutanix storage accessibility is critical before inference pods can mount their model data volumes.

---

### Q54
A user reports that inference requests succeed from one application but fail with `401 Unauthorized` from another application, both using the same NAI endpoint. What should be checked?

- A) Verify that the failing application is correctly including the API key in the `Authorization: Bearer` header and that the key has not been revoked or rotated since configuration
- B) Check if the GPU has ECC errors affecting only certain clients
- C) Verify that Nutanix Objects versioning is enabled for the model bucket
- D) Ensure the Prometheus ServiceMonitor is scraping both applications

**Answer: A**
A 401 error from one client but not another points to an authentication issue in the failing client — typically a missing, malformed, or expired API key in the Authorization header rather than an infrastructure problem.

---

## Domain 5 – Connect Applications (Questions 55–80)

---

### Q55
A development team currently uses the OpenAI Python SDK to call GPT-4 in production. They want to switch to a locally hosted model on NAI without rewriting their application. What is the MINIMUM change required?

- A) Change the `base_url` parameter in the OpenAI client initialization to point to the NAI endpoint URL and update the API key
- B) Rewrite the entire application using a Nutanix-specific SDK
- C) Convert the model from safetensors to ONNX format
- D) Install the NVIDIA CUDA toolkit on the application server

**Answer: A**
NAI exposes an OpenAI-compatible API, so the OpenAI SDK works as a drop-in client. Only the `base_url` and API key need to change — no code rewrite or special SDK is needed.

---

### Q56
Which API endpoint on an NAI inference server should a developer use to submit a multi-turn conversation with system, user, and assistant messages?

- A) `/v1/chat/completions` with a `messages` array containing objects with `role` and `content` fields
- B) `/v1/models` with a `conversation_history` query parameter
- C) `/v1/completions` with a `turns` array containing plain text strings
- D) `/v1/embeddings` with a `dialogue` field in the request body

**Answer: A**
The `/v1/chat/completions` endpoint accepts a `messages` array where each message has a `role` (system, user, assistant) and `content` field, which is the standard format for multi-turn conversations.

---

### Q57
A developer wants to implement streaming responses from an NAI endpoint so users see tokens as they are generated. Which combination of API settings enables this?

- A) Set `stream: true` in the request body and handle Server-Sent Events (SSE) in the client
- B) Set `batch_size: 1` in the request body and use a WebSocket connection
- C) Set `async: true` in the HTTP headers and poll a separate `/v1/results` endpoint
- D) Set `chunked_transfer: enabled` in the Kubernetes Ingress annotation

**Answer: A**
The OpenAI-compatible API uses `stream: true` to enable streaming, which returns tokens incrementally via Server-Sent Events (SSE). The client must process the event stream to display tokens as they arrive.

---

### Q58
A developer is building a RAG (Retrieval Augmented Generation) application using NAI. Which architecture correctly describes the RAG pattern?

- A) The application queries a vector database with the user's question to retrieve relevant documents, then sends those documents along with the question to NAI's `/v1/chat/completions` endpoint as context
- B) The application sends the user's question directly to Nutanix Objects, which performs inference and returns a response
- C) The application stores the model weights in a vector database and queries them directly without calling NAI
- D) The application uses NAI's `/v1/models` endpoint to search through documents and generate embeddings

**Answer: A**
RAG works by first retrieving relevant context from a vector database, then including that context in the prompt sent to the LLM for grounded generation. NAI serves as the generation component in this architecture.

---

### Q59
Which HTTP header is required for authenticating API requests to an NAI inference endpoint?

- A) `Authorization: Bearer <api-key>`
- B) `X-Nutanix-Auth: <cluster-uuid>`
- C) `Cookie: session=<prism-central-token>`
- D) `X-GPU-Key: <nvidia-license-key>`

**Answer: A**
NAI uses the standard Bearer token authentication scheme in the Authorization HTTP header, consistent with the OpenAI API specification it is compatible with.

---

### Q60
A developer needs to list all available models on an NAI inference server to dynamically select a model at runtime. Which API endpoint should they call?

- A) `GET /v1/models`
- B) `POST /v1/chat/completions` with an empty messages array
- C) `GET /v1/health/models` with a Prism Central session cookie
- D) `POST /v1/embeddings` with `list_models: true`

**Answer: A**
The `GET /v1/models` endpoint returns a list of all models currently available on the inference server, following the OpenAI API specification. Applications can use this to dynamically discover and select models.

---

### Q61
A developer is setting the `temperature` parameter for a document classification task using NAI. Which value is MOST appropriate for consistent, deterministic classification?

- A) `temperature: 0` or a very low value like `0.1` to minimize randomness in the output
- B) `temperature: 2.0` to maximize creativity in classification labels
- C) `temperature: 1.0` because it is the universal default for all tasks
- D) `temperature: -1` to enable greedy decoding mode

**Answer: A**
For classification tasks requiring consistent and deterministic output, a temperature of 0 (or near-zero) minimizes the randomness in token sampling, producing the most probable output reliably.

---

### Q62
An application team wants to integrate a health check for the NAI inference endpoint into their load balancer configuration. Which endpoint should they use?

- A) The `/health` endpoint, which returns the readiness status of the inference server
- B) The `/v1/chat/completions` endpoint with a test prompt on every health check interval
- C) The `/v1/models` endpoint, parsing the HTML response for an "OK" string
- D) The `/nvidia-smi` endpoint, which returns raw GPU utilization data

**Answer: A**
The `/health` endpoint is designed specifically for health checks, returning a lightweight status response suitable for load balancer and Kubernetes probe integration without the overhead of running actual inference.

---

### Q63
A developer notices that their application receives duplicate responses from NAI when using multiple inference pod replicas behind a Kubernetes Service. What is the MOST likely cause?

- A) The application is not handling the HTTP response correctly and is retrying requests that were already processed, not a duplicate response from NAI itself
- B) The Kubernetes Service is configured with `sessionAffinity: ClientIP`, causing the same pod to receive all requests
- C) The vLLM PagedAttention mechanism is duplicating KV cache entries
- D) The NVIDIA device plugin is advertising twice the actual GPU count

**Answer: A**
Kubernetes Services with multiple replicas use round-robin distribution and do not send duplicate responses. Apparent duplicates are typically caused by client-side retry logic sending the same request multiple times.

---

### Q64
Which request body parameter controls the maximum number of tokens the NAI inference endpoint will generate in a single response?

- A) `max_tokens`
- B) `gpu_memory_limit`
- C) `batch_size`
- D) `replica_count`

**Answer: A**
The `max_tokens` parameter specifies the upper limit on the number of tokens the model will generate in the response, controlling output length and cost regardless of the serving infrastructure.

---

### Q65
A developer is building a chatbot using NAI and needs to maintain conversation context across multiple API calls. Which approach correctly implements stateful conversation?

- A) Include the full conversation history as a `messages` array in each API request, appending new user and assistant messages after each turn
- B) Store the conversation ID in a Kubernetes ConfigMap and reference it in the `X-Session-ID` header
- C) Use the `/v1/sessions/create` endpoint to initialize a server-side session
- D) Set `stateful: true` in the NAI operator custom resource definition

**Answer: A**
The OpenAI-compatible API is stateless — each request must contain the complete conversation history in the messages array. The application is responsible for accumulating and sending the full message history on each turn.

---

### Q66
A developer wants to use an NAI-hosted model for code generation. Which configuration MOST improves code output quality?

- A) Deploy a code-optimized model (e.g., Code Llama or StarCoder) and set `temperature` to a low value with a code-specific system prompt
- B) Use any general-purpose chat model with `temperature: 2.0` and no system prompt
- C) Deploy the model on CPU-only nodes for better determinism
- D) Set `top_p: 0` and `max_tokens: 1` for one token at a time generation

**Answer: A**
Code-optimized models are trained specifically on code corpora and produce better code output. Low temperature reduces randomness for more syntactically correct generation, and a code-specific system prompt guides output formatting.

---

### Q67
An application sends a request to NAI's `/v1/chat/completions` endpoint but receives a `422 Unprocessable Entity` error. The request body contains `{"prompt": "Hello"}`. What is wrong?

- A) The `/v1/chat/completions` endpoint requires a `messages` array, not a `prompt` string — the `prompt` field is used with the `/v1/completions` endpoint
- B) The model has been deleted from Nutanix Objects
- C) The GPU has run out of memory
- D) The API key has expired

**Answer: A**
The `/v1/chat/completions` endpoint expects a `messages` array with role/content objects, while the `/v1/completions` endpoint uses a `prompt` string. Using the wrong field format returns a 422 validation error.

---

### Q68
A developer is implementing a document summarization pipeline that sends full documents to NAI. Some documents exceed the model's context window. What is the BEST approach?

- A) Implement a chunking strategy that splits documents into sections within the context limit, summarizes each chunk, and then summarizes the summaries
- B) Set `max_tokens: 999999` to override the context window limit
- C) Convert documents to GGUF format before sending them to the API
- D) Use the `/v1/embeddings` endpoint to summarize the document directly

**Answer: A**
Map-reduce summarization (chunk → summarize → combine) is the standard technique for processing documents that exceed the model's context window, maintaining information coverage while respecting token limits.

---

### Q69
A developer needs to monitor the performance of their application's NAI API calls. Which endpoint provides Prometheus-compatible metrics about inference performance?

- A) The metrics endpoint (typically `/metrics`) on the inference server, which exposes request counts, latencies, and queue depth in Prometheus format
- B) The `/v1/models` endpoint, which includes performance statistics in the model list
- C) The `/health` endpoint, which returns detailed latency percentiles
- D) The `/v1/chat/completions` endpoint with a `metrics: true` query parameter

**Answer: A**
The `/metrics` endpoint exposes Prometheus-format metrics including request count, latency histograms, queue depth, and GPU utilization — designed for scraping by Prometheus and visualization in Grafana.

---

### Q70
A developer's application calls NAI with `top_p: 0.95` and `temperature: 0.7`. What effect do these parameters have on the model's output?

- A) `temperature: 0.7` moderately reduces sampling randomness, and `top_p: 0.95` (nucleus sampling) limits token selection to the most probable tokens whose cumulative probability reaches 95%
- B) `top_p: 0.95` sets the GPU utilization target to 95%, and `temperature: 0.7` sets the cooling threshold
- C) Both parameters control the number of inference replicas behind the Kubernetes Service
- D) `temperature: 0.7` sets the request timeout to 0.7 seconds, and `top_p: 0.95` sets the success rate SLA

**Answer: A**
Temperature controls the randomness of token selection (lower = more deterministic), while top_p (nucleus sampling) restricts sampling to the smallest set of tokens whose cumulative probability exceeds the threshold (0.95), balancing diversity and quality.

---

### Q71
An operations team wants to implement canary deployments for a new model version on NAI. How should they configure the Kubernetes resources?

- A) Deploy the new model version as a separate Deployment with a small number of replicas and use a Kubernetes Service with weighted traffic splitting or an Istio VirtualService to route a percentage of traffic to the canary
- B) Replace the model file on the PersistentVolume while pods are running
- C) Change the Docker image tag in the existing Deployment and wait for Kubernetes to detect the change
- D) Create a new Nutanix Objects bucket for the canary model and redirect Prism Central traffic

**Answer: A**
Canary deployments use a separate Deployment with limited replicas and traffic management (via Service mesh or ingress weights) to route a small percentage of traffic to the new version, enabling safe validation before full rollout.

---

### Q72
A developer wants their application to handle NAI API errors gracefully. Which HTTP status code indicates that the inference server is temporarily overloaded and the request should be retried?

- A) `429 Too Many Requests`, indicating rate limiting, with a `Retry-After` header suggesting when to retry
- B) `200 OK` with an error message in the response body
- C) `301 Moved Permanently`, indicating the model has been migrated
- D) `501 Not Implemented`, indicating the model does not support the requested operation

**Answer: A**
HTTP 429 is the standard rate-limiting response code indicating temporary overload. Clients should implement exponential backoff retry logic, respecting the `Retry-After` header when present.

---

### Q73
A developer configures their NAI API client with the wrong `base_url`, pointing to the Prism Central address instead of the NAI endpoint. What error will they MOST likely receive?

- A) An HTTP error (such as `404 Not Found` or `Connection Refused`) because Prism Central does not serve the OpenAI-compatible API paths
- B) Successful inference responses from Prism Central's built-in LLM
- C) A `CUDA out of memory` error returned by Prism Central
- D) A valid model list from the `/v1/models` endpoint showing Prism Central system models

**Answer: A**
Prism Central is the Nutanix management plane and does not serve OpenAI-compatible API endpoints. Requests to `/v1/chat/completions` on Prism Central will receive HTTP 404 or connection errors.

---

### Q74
An application developer needs to use NAI for extracting structured information from invoices. Which API pattern is MOST effective?

- A) Send each invoice's text to `/v1/chat/completions` with a system prompt that specifies the desired output schema (e.g., JSON with fields for vendor, amount, date) and set `temperature: 0`
- B) Upload the invoice PDF directly to the `/v1/embeddings` endpoint for automatic parsing
- C) Use the `/v1/models` endpoint to create a custom fine-tuned model for each invoice format
- D) Send the invoice to Nutanix Objects and use an Objects lifecycle policy to trigger extraction

**Answer: A**
Structured extraction is best performed by providing clear output schema instructions in the system prompt with low temperature for consistent results. The chat completions endpoint handles the instruction-following required for extraction.

---

### Q75
A developer implements a RAG application with NAI but finds that the model sometimes ignores the retrieved context and generates answers from its training data. What is the MOST effective mitigation?

- A) Strengthen the system prompt to explicitly instruct the model to answer ONLY based on the provided context, and include a clear delimiter separating context from the question
- B) Increase `temperature` to 2.0 to force the model to use retrieved context
- C) Switch from `/v1/chat/completions` to `/v1/embeddings` for the generation step
- D) Reduce the vector database's similarity threshold to 0.0 to retrieve more irrelevant documents

**Answer: A**
Explicit system prompt instructions to use only the provided context, combined with clear context formatting and delimiters, significantly reduce the model's tendency to rely on parametric knowledge over the retrieved documents.

---

### Q76
A team has multiple NAI inference endpoints for different models. They want their application to dynamically discover and route requests to the appropriate model. What approach should they use?

- A) Call `GET /v1/models` to discover available models, then specify the desired model in the `model` field of each `/v1/chat/completions` request
- B) Hard-code the model names in the application's configuration file and redeploy for each change
- C) Use Prism Central Calm blueprints to dynamically provision a new NAI cluster per model request
- D) Query the Kubernetes etcd database directly for model endpoint information

**Answer: A**
The `/v1/models` endpoint provides dynamic model discovery. The application can cache the model list and route requests by specifying the desired `model` field in each API call, avoiding hard-coded configurations.

---

### Q77
A developer wants to limit the cost and latency of NAI API calls by preventing the model from generating excessively long responses. Which combination of parameters is MOST effective?

- A) Set `max_tokens` to a reasonable upper bound and use `stop` sequences to halt generation at logical boundaries
- B) Set `temperature: 0` and `top_p: 0`, which prevents the model from generating any tokens
- C) Set `batch_size: 1` in the request body to limit output to one batch
- D) Set the Kubernetes pod memory limit to 1 MB to force truncation

**Answer: A**
`max_tokens` hard-caps the generation length, while `stop` sequences allow the model to halt at natural boundaries (like end-of-paragraph or special tokens), providing both a safety limit and graceful termination.

---

### Q78
A load balancer health check to an NAI endpoint starts failing, and the endpoint is removed from the pool. Pods are healthy and inference works when tested directly via `kubectl port-forward`. What should the administrator check?

- A) Verify that the load balancer is configured to use the correct health check path (`/health`), port, and protocol, and that the endpoint's firewall rules allow health check traffic from the load balancer's IP range
- B) Replace the GPU in the worker node
- C) Delete the model artifacts and re-download from the source
- D) Increase the vLLM batch size to allow health check requests

**Answer: A**
Health check failures with healthy pods indicate a load balancer configuration issue — wrong path, port, protocol, or firewall rules blocking health check traffic. The `/health` endpoint and network path must be verified.

---

### Q79
Which statement about NAI's OpenAI-compatible API is NOT true?

- A) NAI requires a proprietary Nutanix SDK and does not support the standard OpenAI client libraries
- B) NAI supports the `/v1/chat/completions` endpoint with the same request/response format as OpenAI
- C) Applications can switch from OpenAI to NAI by changing the `base_url` and API key
- D) NAI supports streaming responses via Server-Sent Events using the `stream: true` parameter

**Answer: A**
This statement is false — NAI specifically provides an OpenAI-compatible API so that standard OpenAI client libraries work without modification. Only the base URL and API key need to change.

---

### Q80
An enterprise application team wants to build a customer support chatbot using NAI with these requirements: (1) answers grounded in company documentation, (2) conversation history maintained, (3) responses streamed to the user in real-time. Which architecture satisfies ALL three requirements?

- A) A RAG pipeline with a vector database for document retrieval, the application maintaining the full message history in the `messages` array, and `stream: true` set in `/v1/chat/completions` requests to NAI
- B) A batch processing pipeline that stores responses in Nutanix Objects and sends them via email
- C) Direct calls to `/v1/embeddings` with conversation history stored in the GPU KV cache across requests
- D) A Prism Central Calm blueprint that provisions a new NAI cluster for each user session

**Answer: A**
This architecture combines: (1) RAG with a vector database for knowledge grounding, (2) application-managed message history in the stateless API's messages array for conversation continuity, and (3) SSE streaming via `stream: true` for real-time token delivery.

---

*End of NCP-AI 6.10 Domains 3–5 Exam Questions*
