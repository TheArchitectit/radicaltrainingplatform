# NCP-AI 6.10 — Nutanix Certified Professional – AI
## Practice Exam Questions: Domains 1 & 2 (80 Questions)

---

## Domain 1 — Deploy NAI Environment (Q1–Q40)

---

### Q1
A data scientist needs to deploy a 70B parameter LLM on an NAI cluster. The cluster has nodes with NVIDIA T4 GPUs (16GB VRAM each). What is the primary concern?
- A) T4 GPUs have insufficient VRAM for a 70B model even with INT4 quantization; A100 or H100 GPUs are needed
- B) The T4 GPU does not support TensorRT-LLM inference engine
- C) NAI does not support models larger than 13B parameters
- D) The NKP cluster requires a minimum of 8 T4 GPUs for any model deployment

**Answer: A**
A 70B parameter model requires approximately 35GB+ of VRAM even with INT4 quantization. The T4 has only 16GB VRAM, which is insufficient. A100 or H100 GPUs with 80GB VRAM are required for models of this size.

---

### Q2
An infrastructure engineer is planning an NAI deployment and wants to confirm that the Kubernetes layer is healthy before installing the NAI Operator. Which component must be operational as a prerequisite?
- A) Nutanix Kubernetes Platform (NKP) cluster with GPU-enabled worker nodes
- B) Nutanix Objects bucket configured with S3-compatible model storage
- C) NVIDIA DCGM Exporter running on all cluster nodes
- D) vLLM inference pods pre-deployed in the default namespace

**Answer: A**
NAI runs on NKP clusters. The NKP cluster must be healthy with GPU-enabled worker nodes detected before the NAI Operator can be installed and begin managing AI workloads.

---

### Q3
During an NAI pre-deployment check, the GPU detection step fails on a node that has a physical NVIDIA A100 installed. What should the administrator verify first?
- A) That GPU passthrough is enabled for the VM in AHV and the correct PCI device is assigned
- B) That the Nutanix CSI driver version matches the A100 firmware revision
- C) That Prism Central has the GPU Analytics license applied
- D) That the NKP control plane is running on a separate GPU-enabled node

**Answer: A**
GPUs must be passed through to VMs via AHV GPU passthrough. If the PCI device is not properly assigned to the worker node VM, Kubernetes will not detect the GPU resource.

---

### Q4
A network engineer is configuring the environment for NAI. Which network requirement is essential for successful NAI deployment?
- A) DNS resolution must be functional for NAI service endpoints and external model registries
- B) All GPU nodes must reside on a VXLAN overlay network with jumbo frames enabled
- C) The NAI Operator requires a dedicated VLAN with BGP peering to the inference pods
- D) Multicast must be enabled on the GPU node subnet for inter-pod GPU communication

**Answer: A**
DNS resolution is required so that NAI endpoints can be reached by clients and so the cluster can resolve external registries like Hugging Face Hub for model downloads.

---

### Q5
An administrator deploys NAI but notices that inference endpoint URLs return TLS certificate errors in client applications. What is the most likely cause in a test environment?
- A) Self-signed TLS certificates were used for NAI endpoints and the client does not trust the CA
- B) The NAI Operator automatically disables TLS when GPU passthrough is active
- C) vLLM inference pods only support mutual TLS with client certificates
- D) The Nutanix CSI driver is intercepting HTTPS traffic on the storage network

**Answer: A**
NAI supports self-signed certificates for testing, but clients must trust the certificate authority or explicitly skip verification. In production, valid TLS certificates should be configured.

---

### Q6
Which statement about the NAI Operator is correct?
- A) It is a Kubernetes operator that manages the full lifecycle of NAI components including inference servers and model repositories
- B) It is a Prism Central plugin that replaces NKP for AI-specific workloads
- C) It runs exclusively on the AHV hypervisor outside of any Kubernetes cluster
- D) It is an NVIDIA-provided binary that must be installed on bare-metal GPU hosts

**Answer: A**
The NAI Operator is a Kubernetes operator deployed within the NKP cluster. It automates the deployment, scaling, and lifecycle management of inference servers, model repositories, and API gateways.

---

### Q7
An engineer needs to provide persistent storage for downloaded model files in the NAI environment. Which Nutanix component fulfills this requirement?
- A) Nutanix CSI driver providing persistent volume claims backed by Nutanix storage
- B) Nutanix Era database provisioning for model metadata
- C) Prism Central image service hosting model binaries as disk images
- D) AHV volume groups directly mounted to GPU passthrough devices

**Answer: A**
The Nutanix CSI (Container Storage Interface) driver integrates with Kubernetes to provide persistent volumes for NAI workloads, including model file storage via persistent volume claims.

---

### Q8
During NAI deployment, the storage class availability check fails. The NKP cluster is running and GPU nodes are detected. What should the administrator do?
- A) Verify that the Nutanix CSI driver is installed and a default StorageClass is configured in the NKP cluster
- B) Restart the NVIDIA GPU Operator to re-initialize the storage subsystem
- C) Increase the Prism Central storage container replication factor to 3
- D) Convert the Nutanix cluster from hybrid to all-flash before retrying

**Answer: A**
NAI requires a Kubernetes StorageClass backed by the Nutanix CSI driver to provision persistent volumes for model storage. If the CSI driver is missing or no StorageClass exists, the pre-check will fail.

---

### Q9
A customer asks whether they can install NAI without Prism Central. Which response is accurate?
- A) Prism Central is required as it provides centralized management, RBAC, and the NAI deployment interface
- B) Prism Central is optional; NAI can be fully managed through kubectl and Helm charts alone
- C) Prism Central is only needed if the cluster uses Nutanix Objects for model storage
- D) Prism Central is replaced by the NVIDIA AI Enterprise Manager in NAI deployments

**Answer: A**
Prism Central is a required component for NAI. It provides the centralized management plane, role-based access control, project management, and serves as the primary interface for deploying and managing NAI.

---

### Q10
An engineer is sizing GPU resources for a deployment of a 13B parameter model in FP16 precision. Which GPU option provides sufficient VRAM?
- A) A single NVIDIA A100 with 80GB VRAM
- B) A single NVIDIA T4 with 16GB VRAM
- C) Two NVIDIA T4 GPUs with 16GB VRAM each in a non-MIG configuration
- D) A single NVIDIA A100 in MIG mode with a 10GB partition

**Answer: A**
A 13B parameter model in FP16 requires approximately 26GB of VRAM. A single A100 with 80GB provides ample room. A T4 (16GB) is insufficient, and MIG partitions at 10GB would also be too small.

---

### Q11
Which of the following is NOT a supported GPU for NAI deployments?
- A) NVIDIA RTX 4090
- B) NVIDIA A100
- C) NVIDIA H100
- D) NVIDIA L40S

**Answer: A**
NAI supports enterprise-grade datacenter GPUs including the A100, H100, L40S, and T4. Consumer GPUs like the RTX 4090 are not on the supported hardware compatibility list for NAI.

---

### Q12
An administrator wants to deploy NAI using the command line instead of the Prism Central UI. Which approach is valid?
- A) Deploy the NAI Operator using kubectl apply with the appropriate manifests on the NKP cluster
- B) Run the NAI installer binary directly on the AHV hypervisor host via SSH
- C) Use the Nutanix CLI (ncli) to create an NAI container on Prism Element
- D) Execute a PowerShell script on the Prism Central VM to bootstrap NAI services

**Answer: A**
NAI can be deployed via Prism Central UI or by using kubectl to apply Kubernetes manifests directly to the NKP cluster, giving administrators CLI-based deployment flexibility.

---

### Q13
After deploying NAI, an engineer runs a test inference request but gets a connection timeout. The NAI pods show Running status. What should be checked next?
- A) Kubernetes ingress configuration and whether the API Gateway service has an external IP or NodePort assigned
- B) Whether the NVIDIA GPU driver has been compiled with inference timeout support
- C) The Prism Central network visualization tab for dropped GPU packets
- D) Whether the model repository pod has enough CPU to serve HTTP health checks

**Answer: A**
Even if pods are running, the inference endpoint must be exposed externally via Kubernetes ingress or a LoadBalancer/NodePort service. A missing or misconfigured ingress will cause client connection timeouts.

---

### Q14
What role does the API Gateway play in the NAI architecture?
- A) It provides an OpenAI-compatible REST API endpoint that routes inference requests to the appropriate inference server
- B) It acts as a reverse proxy between Prism Central and the AHV hypervisor for GPU telemetry
- C) It translates Kubernetes API calls into Nutanix Acropolis API calls for storage provisioning
- D) It manages TLS certificate renewal for all NKP cluster nodes

**Answer: A**
The NAI API Gateway exposes OpenAI-compatible endpoints (such as /v1/chat/completions) and routes incoming inference requests to the backend inference server pods running vLLM or TensorRT-LLM.

---

### Q15
An NKP cluster has three worker nodes, each with one NVIDIA H100 GPU. An administrator deploys a model that requires two GPUs. What happens?
- A) The model pod is scheduled across two worker nodes using tensor parallelism if the inference engine and cluster networking support it
- B) NAI automatically enables MIG mode on one H100 to simulate two GPUs on a single node
- C) The deployment fails because NAI requires all GPUs to be on the same physical node
- D) Prism Central migrates one H100 GPU to another node using live GPU migration

**Answer: A**
When a model requires multiple GPUs and they span nodes, tensor parallelism over the network can be used if supported. However, single-node multi-GPU is preferred for performance. The key is that NAI and NKP scheduling work together to allocate the needed GPU resources.

---

### Q16
During NAI installation, which Kubernetes resource does the NAI Operator create to store downloaded model files?
- A) PersistentVolumeClaim backed by the Nutanix CSI StorageClass
- B) ConfigMap with base64-encoded model weights
- C) Kubernetes Secret containing the serialized model binary
- D) EmptyDir volume on the inference pod's local disk

**Answer: A**
The NAI Operator creates PersistentVolumeClaims to request storage from the Nutanix CSI driver, ensuring model files persist independently of pod lifecycle and can be reused across pod restarts.

---

### Q17
An engineer notices NTP synchronization is not configured on the GPU worker nodes. Why is this a concern for NAI?
- A) Time skew between nodes can cause TLS certificate validation failures and Kubernetes scheduling issues
- B) GPU clock speeds are regulated by NTP and will throttle without synchronization
- C) The vLLM inference engine uses NTP timestamps to order token generation
- D) Nutanix CSI driver snapshots rely on NTP for point-in-time consistency

**Answer: A**
NTP synchronization is required to prevent certificate validation errors (certificates have validity windows) and to ensure consistent Kubernetes cluster operations including logging, scheduling, and health checks.

---

### Q18
A customer wants to use Nutanix Files for storing AI model files that will be imported into NAI. How would these models be accessed?
- A) Models stored on Nutanix Files can be uploaded to the NAI model repository for use by inference endpoints
- B) NAI inference pods directly mount Nutanix Files shares via NFS at runtime as the primary model source
- C) Nutanix Files automatically converts model files to SafeTensors format before NAI ingestion
- D) The NAI Operator replaces Nutanix Files with a built-in S3-compatible model store

**Answer: A**
Nutanix Files or Objects can serve as external storage for model files. Administrators upload models from these locations into the NAI model repository, which then serves them to inference endpoints.

---

### Q19
Which Kubernetes component is responsible for exposing NAI inference endpoints to external clients?
- A) Ingress controller with configured rules for the NAI API Gateway service
- B) KubeProxy with GPU-aware load balancing extensions
- C) CoreDNS with inference-specific service discovery plugins
- D) The Nutanix CSI driver's built-in HTTP proxy mode

**Answer: A**
Kubernetes Ingress resources, managed by an ingress controller, define external routing rules that expose the NAI API Gateway service to clients outside the cluster.

---

### Q20
An administrator is performing post-deployment verification of NAI. Which action confirms the inference pipeline is fully operational?
- A) Sending a test prompt to the /v1/chat/completions endpoint and receiving a generated response
- B) Checking that the NAI Operator pod has zero restart counts in kubectl
- C) Verifying that Prism Central shows the NKP cluster in a healthy state
- D) Confirming that the Nutanix CSI driver PersistentVolumes are in Bound status

**Answer: A**
The definitive test of a working NAI deployment is an end-to-end inference request. Sending a prompt to the OpenAI-compatible endpoint and receiving a valid generated response confirms all components are functioning.

---

### Q21
What is the relationship between NAI and GPT-in-a-Box?
- A) NAI (Nutanix Enterprise AI) is the current product name; GPT-in-a-Box was the former name for the same solution
- B) GPT-in-a-Box is a separate Nutanix product focused exclusively on OpenAI GPT models
- C) NAI is the cloud-hosted version while GPT-in-a-Box is the on-premises version
- D) GPT-in-a-Box is an NVIDIA product that NAI replaced with a Nutanix-native inference engine

**Answer: A**
Nutanix Enterprise AI (NAI), formerly known as GPT-in-a-Box, is Nutanix's solution for deploying and managing large language models on Nutanix infrastructure with GPU-enabled nodes.

---

### Q22
An engineer plans to deploy NAI on an existing NKP cluster that currently runs stateless web applications. What must be added to the cluster?
- A) GPU-enabled worker nodes with NVIDIA GPUs passed through from AHV and the NVIDIA GPU device plugin
- B) A dedicated NKP control plane running on GPU nodes separate from the existing control plane
- C) Nutanix Calm blueprints for AI workload orchestration replacing NKP scheduling
- D) A Prism Element storage-only node to host the vLLM binary artifacts

**Answer: A**
An existing NKP cluster can be extended for NAI by adding GPU-enabled worker nodes. The GPU device plugin in Kubernetes allows the scheduler to allocate GPU resources to NAI pods.

---

### Q23
During NAI deployment, an administrator receives an error that no GPU resources are available in the Kubernetes cluster despite GPUs being physically installed. What is the most likely missing component?
- A) The NVIDIA GPU device plugin or GPU Operator is not deployed on the NKP cluster
- B) The Nutanix CSI driver does not have GPU resource quotas configured
- C) Prism Central's GPU licensing has expired
- D) The AHV hypervisor requires a reboot to activate GPU passthrough after initial configuration

**Answer: A**
Kubernetes requires the NVIDIA GPU device plugin (often deployed via the GPU Operator) to discover and advertise GPU resources. Without it, the cluster scheduler cannot see or allocate GPUs.

---

### Q24
Which statement best describes how GPU passthrough works for NAI on AHV?
- A) AHV assigns the physical GPU directly to a VM, giving the guest OS exclusive access to the GPU hardware
- B) AHV virtualizes the GPU using SR-IOV, sharing it equally across all VMs on the host
- C) AHV uses NVIDIA GRID vGPU to provide virtual GPU profiles to Kubernetes pods
- D) AHV emulates GPU hardware in software so that any VM can use GPU acceleration

**Answer: A**
GPU passthrough on AHV assigns the physical GPU device directly to a specific VM via PCI passthrough, giving that VM (and its Kubernetes workloads) exclusive, bare-metal access to the GPU.

---

### Q25
An enterprise customer requires high availability for their NAI inference service. Which Kubernetes-native approach supports this?
- A) Deploying multiple inference pod replicas behind a Kubernetes Service with load balancing
- B) Running the NAI Operator in active-passive mode across two separate NKP clusters
- C) Configuring Prism Central to live-migrate GPU VMs between hosts during failures
- D) Using Nutanix Metro Availability to replicate GPU memory state across sites

**Answer: A**
Kubernetes Services distribute traffic across multiple inference pod replicas. If one pod fails, the Service routes requests to healthy replicas, providing high availability for the inference endpoint.

---

### Q26
An architect is designing a network topology for an NAI deployment. Which network consideration is specific to GPU-enabled nodes?
- A) GPU nodes should be on a dedicated network segment to ensure sufficient bandwidth for model loading and inference traffic
- B) GPU nodes require InfiniBand networking; standard Ethernet is not supported for inference
- C) Each GPU must have its own dedicated NIC for direct GPU-to-GPU RDMA communication
- D) GPU nodes must use IPv6 exclusively as NAI does not support IPv4 for inference traffic

**Answer: A**
A dedicated network for GPU nodes helps ensure that model data transfer and inference traffic are not contended by other cluster traffic, improving performance and reliability.

---

### Q27
What happens if the NAI Operator pod crashes or is evicted in a running NAI environment?
- A) Kubernetes restarts the NAI Operator pod automatically; existing inference endpoints continue serving requests during the restart
- B) All inference pods are immediately terminated and client requests fail until the Operator is manually redeployed
- C) Prism Central takes over NAI management until the Operator pod recovers
- D) The NVIDIA GPU Operator assumes NAI Operator responsibilities as a failover mechanism

**Answer: A**
The NAI Operator is managed by a Kubernetes Deployment, so it is automatically restarted. Existing inference pods are independent and continue serving traffic since they are already running.

---

### Q28
An administrator is reviewing the minimum requirements for an NAI deployment. Which combination is necessary?
- A) Prism Central, NKP cluster, GPU-enabled nodes, Nutanix CSI driver, and sufficient storage capacity
- B) Prism Element only, Nutanix Calm, GPU-enabled nodes, and NVIDIA AI Enterprise license
- C) Prism Central, AOS 5.x, Kubernetes vanilla cluster, and CPU-only nodes with AVX-512
- D) Prism Element, Nutanix Karbon, NVIDIA GRID license, and vSphere hypervisor

**Answer: A**
NAI requires Prism Central for management, an NKP cluster for Kubernetes orchestration, GPU-enabled nodes for inference, and the Nutanix CSI driver for persistent storage.

---

### Q29
A junior administrator accidentally deletes the PersistentVolumeClaim used by the NAI model repository. What is the impact?
- A) Downloaded model files are lost; models must be re-downloaded or re-uploaded to a newly created PVC
- B) The NAI Operator automatically recreates the PVC with all data intact from Nutanix snapshots
- C) Inference endpoints continue working indefinitely as models are cached in GPU VRAM
- D) Prism Central restores the PVC from its built-in model version control system

**Answer: A**
PVCs store model files persistently. If the PVC is deleted and no backup or reclaim policy preserves the data, the model files are lost and must be re-downloaded or re-uploaded.

---

### Q30
An engineer wants to verify that GPU resources are correctly detected by the NKP cluster before deploying NAI. Which kubectl command provides this information?
- A) kubectl describe nodes and checking for nvidia.com/gpu in the Allocatable resources section
- B) kubectl get configmaps -n gpu-system to view GPU allocation maps
- C) kubectl logs kube-scheduler to find GPU registration events
- D) kubectl get pv to check for GPU-backed PersistentVolumes

**Answer: A**
Running `kubectl describe nodes` shows the allocatable resources for each node, including `nvidia.com/gpu` entries that confirm GPUs are detected and available for scheduling.

---

### Q31
Which inference server architecture component in NAI handles the tokenization and batching of incoming requests?
- A) The inference engine (vLLM or TensorRT-LLM) which manages request batching, tokenization, and GPU execution
- B) The Kubernetes Horizontal Pod Autoscaler which batches requests before forwarding to pods
- C) The Nutanix CSI driver which caches tokenized inputs on persistent storage
- D) The NAI Operator which pre-processes all API requests before routing them

**Answer: A**
The inference engine (vLLM or TensorRT-LLM) is responsible for receiving prompts, tokenizing them, batching multiple requests for efficient GPU utilization, and executing the model inference.

---

### Q32
During NAI deployment via Prism Central, the wizard indicates that the NKP cluster is unreachable. All NKP pods are running normally. What should the administrator check?
- A) Network connectivity between Prism Central and the NKP cluster API server, including firewall rules and DNS resolution
- B) Whether the NVIDIA GPU Operator is conflicting with Prism Central's cluster agent
- C) That the NAI model repository has been pre-populated before the wizard can proceed
- D) Whether the Nutanix CSI driver has consumed all available IP addresses in the subnet

**Answer: A**
Prism Central must be able to reach the NKP API server over the network. Firewall rules, DNS resolution, and routing between Prism Central and the NKP cluster are common points of failure.

---

### Q33
Which of the following describes the correct order of NAI deployment steps?
- A) Provision NKP cluster → Configure GPU passthrough → Install NVIDIA GPU Operator → Deploy NAI Operator → Create inference endpoints
- B) Deploy NAI Operator → Provision NKP cluster → Install NVIDIA GPU Operator → Configure GPU passthrough → Create inference endpoints
- C) Create inference endpoints → Deploy NAI Operator → Provision NKP cluster → Configure GPU passthrough → Install NVIDIA GPU Operator
- D) Install NVIDIA GPU Operator → Configure GPU passthrough → Create inference endpoints → Deploy NAI Operator → Provision NKP cluster

**Answer: A**
The deployment follows a logical dependency chain: the NKP cluster must exist first, then GPUs are configured and detected, then the NAI Operator is deployed, and finally inference endpoints are created.

---

### Q34
An administrator observes that an NAI inference pod is stuck in Pending state with the event "Insufficient nvidia.com/gpu." What does this indicate?
- A) The cluster does not have enough available GPU resources to satisfy the pod's GPU request
- B) The NVIDIA GPU driver inside the pod has failed to initialize
- C) The model format is incompatible with the allocated GPU type
- D) The NAI Operator has reached its maximum endpoint license limit

**Answer: A**
A pod stuck in Pending with "Insufficient nvidia.com/gpu" means the Kubernetes scheduler cannot find a node with enough free GPU resources to fulfill the pod's resource request.

---

### Q35
What is the primary purpose of the model repository component in the NAI architecture?
- A) It stores and manages downloaded or uploaded model files so they can be served by inference endpoints
- B) It provides a Git-based version control system for tracking model code changes
- C) It runs continuous training jobs to improve model accuracy over time
- D) It acts as a Kubernetes admission controller to validate model deployment manifests

**Answer: A**
The model repository is a storage component that holds model files (weights, configuration, tokenizer) making them available for inference endpoints to load and serve.

---

### Q36
A systems engineer is deploying an NAI cluster in an air-gapped environment with no internet access. How can models be made available?
- A) Manually upload model files from local storage to the NAI model repository after transferring them via secure media
- B) NAI requires internet access to Hugging Face Hub at all times and cannot operate air-gapped
- C) Configure Prism Central to act as a proxy for Hugging Face Hub model downloads
- D) Use NVIDIA NGC's offline satellite server which is bundled with the NAI Operator

**Answer: A**
In air-gapped environments, models can be downloaded externally, transferred to the secure environment, and manually uploaded to the NAI model repository for deployment.

---

### Q37
Which NVIDIA GPU feature allows a single A100 or H100 GPU to be partitioned into multiple smaller GPU instances for NAI workloads?
- A) Multi-Instance GPU (MIG) which creates isolated GPU partitions with dedicated memory and compute
- B) NVIDIA vGPU (GRID) which provides time-sliced virtual GPU access to multiple VMs
- C) NVLink which combines multiple GPUs into a single logical GPU
- D) NVIDIA CUDA MPS (Multi-Process Service) which shares a single GPU context

**Answer: A**
Multi-Instance GPU (MIG), available on A100 and H100 GPUs, allows hardware-level partitioning into isolated GPU instances, each with its own memory and compute resources, enabling fractional GPU allocation.

---

### Q38
An NAI deployment uses self-signed certificates for testing. The administrator now needs to move to production. What must be updated?
- A) Replace self-signed certificates with certificates issued by a trusted Certificate Authority for all NAI endpoints
- B) Disable TLS entirely since production NAI traffic should use IPsec instead
- C) Move the NAI Operator to a different namespace that has built-in TLS termination
- D) Enable NVIDIA Confidential Computing which replaces TLS with GPU-encrypted channels

**Answer: A**
Production NAI deployments should use TLS certificates from a trusted CA to ensure client trust and secure communication without requiring clients to bypass certificate verification.

---

### Q39
An engineer is choosing between deploying NAI on a single-node NKP cluster versus a multi-node cluster. What is a key limitation of the single-node approach?
- A) No high availability for inference workloads; if the single node fails, all inference endpoints become unavailable
- B) Single-node NKP clusters cannot use GPU passthrough on AHV
- C) The NAI Operator cannot run on the same node as inference pods
- D) Single-node deployments are limited to the vLLM engine and cannot use TensorRT-LLM

**Answer: A**
A single-node NKP cluster has no redundancy. If that node fails, all Kubernetes workloads including NAI inference endpoints go down, making it unsuitable for production without external HA measures.

---

### Q40
Which Nutanix storage option can be used with the CSI driver to provide persistent volumes for NAI model storage?
- A) Nutanix Volumes (block storage) provisioned through the Nutanix CSI driver as ReadWriteOnce PersistentVolumes
- B) Nutanix Mine backup appliance acting as the primary model store
- C) Prism Central image library serving model files as ISO images to pods
- D) AHV local disk passthrough volumes that bypass the Nutanix storage layer entirely

**Answer: A**
The Nutanix CSI driver supports provisioning PersistentVolumes backed by Nutanix storage (Volumes/Files), which NAI uses for model repository storage and other persistent data needs.

---

## Domain 2 — Configure NAI Environment (Q41–Q80)

---

### Q41
An NAI administrator needs to grant a data scientist the ability to create inference endpoints and run inference but not manage other users. Which role should be assigned?
- A) User role, which permits endpoint deployment, inference execution, and management of own resources
- B) Admin role with a custom Prism Central policy restricting user management APIs
- C) Kubernetes cluster-admin ClusterRole bound to the scientist's service account
- D) NVIDIA NGC Viewer role federated through Prism Central SSO

**Answer: A**
The User role in NAI provides the ability to deploy endpoints, run inference, and manage one's own resources without granting administrative capabilities like user provisioning.

---

### Q42
A security team requires that all programmatic access to NAI inference endpoints use unique, traceable credentials. Which NAI feature addresses this?
- A) Per-user API keys that identify individual users and can be rotated according to policy
- B) Shared Kubernetes ServiceAccount tokens distributed to all inference clients
- C) NVIDIA NGC API keys imported into Prism Central for unified access
- D) OAuth2 client credentials provisioned by the Nutanix CSI driver

**Answer: A**
NAI supports per-user API keys for programmatic access. Each key is tied to a specific user, providing traceability and the ability to rotate or revoke individual keys.

---

### Q43
An organization uses Hugging Face Hub as its primary model source. An NAI administrator wants to import a Llama 2 model. What is the correct workflow?
- A) In NAI, select import from Hugging Face Hub, specify the model repository ID, and NAI downloads and registers the model
- B) Clone the Hugging Face Git repository to a Nutanix Files share and NFS-mount it directly into inference pods
- C) Use the NVIDIA NGC CLI to convert the Hugging Face model to TensorRT format before NAI can accept it
- D) Upload the model to Prism Central's image service and attach it as a virtual disk to the inference pod

**Answer: A**
NAI integrates with Hugging Face Hub as a model source. Administrators specify the model repository ID, and NAI handles downloading the model files and registering them in the model repository.

---

### Q44
A data engineer wants to reduce the GPU memory footprint of a 7B parameter model currently running in FP16. Which quantization option provides the greatest memory reduction?
- A) INT4 quantization, which reduces memory usage by approximately 75% compared to FP16 with some quality tradeoff
- B) FP32 up-casting, which compresses the model through higher precision redundancy elimination
- C) INT8 quantization with FP16 activations, which doubles the memory compared to pure FP16
- D) BF16 conversion, which halves the memory footprint compared to FP16

**Answer: A**
INT4 quantization reduces each parameter from 16 bits to 4 bits, cutting memory usage by roughly 75%. This is the most aggressive supported quantization, with an expected minor quality tradeoff.

---

### Q45
Which model format is commonly used with vLLM inference engine in NAI for efficient model loading?
- A) SafeTensors, which provides safe and efficient serialization of model tensors
- B) ONNX Runtime format optimized for CPU-only inference
- C) TensorFlow SavedModel format for TPU acceleration
- D) Apple CoreML packages for GPU inference on ARM-based servers

**Answer: A**
SafeTensors is a widely used format for storing model weights safely and efficiently. vLLM supports loading models in SafeTensors format for inference on NVIDIA GPUs.

---

### Q46
An administrator is configuring an NAI endpoint with auto-scaling. Which metric does NAI use to determine when to scale out inference replicas?
- A) Request queue depth, scaling out when pending requests exceed the configured threshold
- B) GPU temperature readings from NVIDIA DCGM, scaling out when thermal throttling is detected
- C) Nutanix cluster CPU utilization reported by Prism Element
- D) Number of unique API keys that have sent requests in the last minute

**Answer: A**
NAI auto-scaling is based on request queue depth. When the number of queued inference requests exceeds the threshold, additional replicas are spun up to handle the load.

---

### Q47
A developer integrates their application with an NAI inference endpoint. Which API path should they use for chat-based interactions?
- A) /v1/chat/completions, the OpenAI-compatible endpoint for conversational inference
- B) /api/v2/inference/predict, the Nutanix-proprietary inference endpoint
- C) /v1/models/chat, the model-specific chat handler
- D) /nvidia/trt/inference, the TensorRT-LLM native protocol endpoint

**Answer: A**
NAI exposes OpenAI-compatible API endpoints. For chat-based interactions, clients use /v1/chat/completions, making it easy to integrate with existing OpenAI client libraries.

---

### Q48
What is the purpose of LoRA adapters in the context of NAI model management?
- A) LoRA adapters enable model customization by training small additional parameter matrices without retraining the full base model
- B) LoRA adapters convert models from SafeTensors format to GGUF format for quantized inference
- C) LoRA adapters provide network-level load balancing between multiple inference endpoints
- D) LoRA adapters are Kubernetes resource adapters that translate GPU resource requests for the scheduler

**Answer: A**
LoRA (Low-Rank Adaptation) adapters allow fine-tuning of models by training small, additional weight matrices. This enables model customization at a fraction of the computational cost of full retraining.

---

### Q49
An NAI administrator creates a new endpoint and selects "2" for the minimum replicas and "5" for maximum replicas. What does this configuration mean?
- A) The endpoint always has at least 2 inference pods running and can scale up to 5 pods based on demand
- B) The endpoint uses 2 GPUs minimum and 5 GPUs maximum per inference pod
- C) The model is sharded across 2 to 5 nodes using tensor parallelism
- D) The endpoint retains 2 model versions and can cache up to 5 versions simultaneously

**Answer: A**
Auto-scaling configuration sets the floor and ceiling for inference pod replicas. With min=2 and max=5, at least 2 pods always run for availability, scaling up to 5 under load.

---

### Q50
Which inference engine should an administrator choose for maximum performance on NVIDIA H100 GPUs with a supported model?
- A) TensorRT-LLM, which is optimized by NVIDIA for maximum performance on NVIDIA GPUs through model compilation
- B) vLLM, which provides exclusive support for H100 FP8 tensor cores
- C) ONNX Runtime with DirectML backend for H100 GPU acceleration
- D) PyTorch eager mode execution which bypasses the need for an inference engine

**Answer: A**
TensorRT-LLM is NVIDIA's optimized inference engine that compiles models for maximum throughput and lowest latency on NVIDIA GPUs, making it the highest-performance option for H100s.

---

### Q51
A developer notices that the /v1/models endpoint on their NAI deployment returns an empty list. What is the most likely cause?
- A) No inference endpoints have been created yet, or existing endpoints have no models loaded and ready
- B) The vLLM engine does not support the /v1/models endpoint; only /v1/completions is available
- C) The developer's API key has insufficient permissions to list GPU resources
- D) The NAI Operator has not synchronized with the NVIDIA NGC model catalog

**Answer: A**
The /v1/models endpoint lists models that are actively deployed and serving. If no endpoints have been created or models are not in a ready state, the list will be empty.

---

### Q52
An organization needs to control which users can deploy specific models on NAI. Which mechanism provides this governance?
- A) Prism Central RBAC using categories and projects to restrict user access to specific NAI resources
- B) Kubernetes NetworkPolicies that block unauthorized pods from accessing model files
- C) NVIDIA GPU Operator admission webhooks that validate user identity before GPU allocation
- D) Model-level encryption keys where only authorized users hold the decryption key

**Answer: A**
Prism Central's RBAC system uses categories and projects to define fine-grained access policies, controlling which users and groups can access and manage specific NAI resources.

---

### Q53
What is the GGUF model format and when is it relevant for NAI?
- A) GGUF is a quantized model format optimized for efficient inference that supports various quantization levels
- B) GGUF is a Nutanix-proprietary format that encrypts model weights for secure storage on Nutanix Objects
- C) GGUF is the GPU Graphical Unified Format used exclusively by TensorRT-LLM for model compilation
- D) GGUF is a container image format that packages models as OCI-compatible container layers

**Answer: A**
GGUF (GPT-Generated Unified Format) is a model file format that supports various quantization levels and is designed for efficient model loading and inference.

---

### Q54
An NAI administrator needs to rotate API keys for all users as part of a security compliance requirement. What is the recommended approach?
- A) Generate new API keys for each user through the NAI management interface and revoke the old keys according to the rotation policy
- B) Restart the NAI Operator which automatically regenerates all API keys with new secrets
- C) Delete and recreate all user accounts, which issues fresh API keys
- D) Update the Kubernetes Secret containing the shared API key that all users reference

**Answer: A**
API key rotation involves generating new per-user keys and revoking old ones. NAI supports this through its management interface, allowing controlled rotation without disrupting user accounts.

---

### Q55
An engineer deploys a model endpoint and wants to limit the maximum number of requests per minute from a single client. Which NAI feature addresses this?
- A) Rate limiting configuration on the endpoint, which caps the number of requests allowed per time period
- B) Kubernetes ResourceQuota on the namespace, which limits pod CPU cycles available for request processing
- C) Nutanix Flow microsegmentation rules that drop packets exceeding a bandwidth threshold
- D) NVIDIA MPS (Multi-Process Service) throttling, which limits GPU context switches per client

**Answer: A**
NAI supports configurable rate limiting per endpoint. This allows administrators to set request-per-minute caps to prevent any single client from overwhelming the inference service.

---

### Q56
Which quantization level offers the best balance between model quality and memory savings for most production deployments?
- A) INT8 quantization, which reduces memory by approximately 50% with minimal quality degradation for most models
- B) INT2 quantization, which provides 87.5% memory savings with negligible quality impact
- C) FP64 precision, which improves quality enough to compensate for increased memory use
- D) INT4 with FP32 activations, which is the default and only supported quantization in NAI

**Answer: A**
INT8 quantization is generally considered the best balance for production, cutting memory usage roughly in half while preserving most of the model's output quality across diverse tasks.

---

### Q57
An administrator notices that model inference responses are being cut off mid-sentence. Which endpoint configuration parameter should be adjusted?
- A) Maximum token limit (max_tokens) for the inference endpoint, which controls the maximum length of generated responses
- B) GPU memory overcommit ratio, which when too low truncates output tensors
- C) Kubernetes pod liveness probe timeout, which kills pods that take too long to respond
- D) Nutanix CSI volume throughput limit, which throttles model weight reads during generation

**Answer: A**
The max_tokens parameter controls how many tokens the model generates per response. If set too low, responses will be truncated. Increasing this value allows longer completions.

---

### Q58
A customer needs to run inference on a model using the NVIDIA NGC catalog as the source. How does NAI support this?
- A) NAI can import models directly from the NVIDIA NGC catalog by specifying the NGC model path during model import
- B) NGC models must first be converted to ONNX format using NVIDIA's nemo2onnx tool before NAI import
- C) NAI only supports Hugging Face Hub; NGC models must be re-uploaded to Hugging Face first
- D) The NVIDIA NGC catalog is automatically mirrored to the NAI model repository on a daily schedule

**Answer: A**
NAI supports NVIDIA NGC as a model source alongside Hugging Face Hub. Administrators can specify the NGC model identifier during import, and NAI handles the download.

---

### Q59
An administrator is configuring fractional GPU access so that two small models can share a single A100 GPU. Which technology enables this?
- A) Multi-Instance GPU (MIG) on the A100, which partitions the GPU into isolated instances with dedicated memory
- B) Kubernetes CPU-based request limits applied to GPU resources via the NAI scheduler plugin
- C) NVIDIA Unified Memory which automatically pages GPU memory to system RAM when overcommitted
- D) vLLM's built-in model multiplexing which loads both models into a single inference process

**Answer: A**
MIG on A100 (and H100) GPUs creates hardware-isolated partitions, each with its own GPU memory and compute resources, allowing multiple smaller models to run on a single physical GPU.

---

### Q60
Which vLLM feature makes it particularly efficient for serving LLMs with variable-length sequences?
- A) PagedAttention, which manages attention key-value cache in non-contiguous memory pages to reduce waste
- B) FlashAttention-3, which compiles attention kernels at deployment time for each model architecture
- C) NVIDIA NCCL collective operations for distributing attention computation across multiple GPUs
- D) Speculative decoding with a draft model that pre-allocates fixed memory blocks for all possible sequences

**Answer: A**
PagedAttention in vLLM manages the KV cache using a paging mechanism similar to OS virtual memory, reducing memory fragmentation and waste when serving variable-length sequences.

---

### Q61
A data science team wants to test a new fine-tuned model before exposing it to production users. What is the recommended approach in NAI?
- A) Create a separate endpoint for the new model, test with internal users, then promote to production once validated
- B) Overwrite the production model in-place since NAI automatically rolls back if errors exceed 5%
- C) Use Nutanix Calm to orchestrate a blue-green deployment of the entire NKP cluster
- D) Modify the production endpoint's TensorRT-LLM compilation flags to enable A/B testing mode

**Answer: A**
NAI allows creating multiple endpoints. The recommended practice is to deploy the new model on a separate test endpoint, validate its performance, and then update or replace the production endpoint.

---

### Q62
Which Admin role capability is NOT available to users with the standard User role in NAI?
- A) User provisioning and role management for other NAI users
- B) Creating new inference endpoints with assigned GPU resources
- C) Running inference requests against deployed model endpoints
- D) Managing their own API keys and viewing their resource usage

**Answer: A**
The Admin role includes user provisioning and role management capabilities. The User role can create endpoints, run inference, and manage own resources but cannot manage other users.

---

### Q63
An engineer needs to configure a timeout for long-running inference requests that process large prompts. Where is this setting configured?
- A) On the NAI endpoint configuration, where request timeout values can be set per endpoint
- B) In the NVIDIA GPU driver settings by adjusting the GPU compute timeout registry value
- C) On the Kubernetes cluster by modifying the kube-apiserver request timeout flag
- D) In Prism Central's network configuration under TCP session timeout policies

**Answer: A**
NAI endpoints support configurable timeout values. This allows administrators to set appropriate timeouts for different use cases, such as longer timeouts for endpoints processing large prompts.

---

### Q64
A company has uploaded several models to NAI but wants to remove unused ones to free storage. How should the administrator proceed?
- A) Delete the unused models from the NAI model repository, which releases the associated PersistentVolume storage
- B) Reduce the Nutanix CSI StorageClass reclaim policy timer to auto-delete old models
- C) Scale the model repository pod to zero replicas to trigger garbage collection
- D) Use Prism Central Data Lens to identify and archive unused model files to cold storage

**Answer: A**
Unused models can be deleted from the NAI model repository through the management interface, freeing the persistent storage that was allocated for those model files.

---

### Q65
What is the difference between FP16 and BF16 precision for model inference in NAI?
- A) Both are 16-bit formats, but BF16 has a larger exponent range matching FP32 while FP16 has higher mantissa precision; BF16 is often preferred for training stability
- B) FP16 is for NVIDIA GPUs only while BF16 is exclusively for AMD GPUs
- C) BF16 uses 16 bits for the mantissa and 16 bits for the exponent, totaling 32 bits
- D) FP16 is the inference format while BF16 is only used during model fine-tuning in NAI

**Answer: A**
BF16 (BFloat16) has the same exponent range as FP32 (8 bits) but fewer mantissa bits (7 vs 23), while FP16 has a smaller exponent range (5 bits) but more mantissa bits (10). BF16's wider range reduces overflow issues.

---

### Q66
An NAI endpoint is configured with auto-scaling, but during a traffic spike the endpoint takes too long to scale up. What configuration should be reviewed?
- A) The request queue depth threshold and scale-up cooldown period, which may be too conservative
- B) The Nutanix cluster CPU overcommit ratio in Prism Element
- C) The NVIDIA GPU Operator node labeling frequency
- D) The Kubernetes CoreDNS cache TTL for inference service endpoints

**Answer: A**
If scaling is too slow, the queue depth threshold may be set too high (requiring too many queued requests before scaling) or the cooldown period may delay successive scale-up actions.

---

### Q67
Which API endpoint should a developer use for text completion (non-chat) workloads on an NAI deployment?
- A) /v1/completions, the OpenAI-compatible endpoint for single-turn text completion
- B) /v1/embeddings, which generates completions as vector embeddings
- C) /v1/chat/completions with an empty system message array
- D) /v1/fine-tunes, which generates completions while simultaneously fine-tuning the model

**Answer: A**
For non-chat text completion tasks, NAI exposes the /v1/completions endpoint, following the OpenAI API specification for standard text generation without chat message formatting.

---

### Q68
An administrator configures an NAI endpoint with GPU allocation set to "full passthrough" rather than MIG. What is the implication?
- A) Each inference pod receives an entire physical GPU with all memory and compute resources exclusively allocated
- B) The GPU is shared across all pods on the node using time-slicing with no memory isolation
- C) The inference pod receives a virtual GPU profile with a guaranteed minimum of 50% GPU resources
- D) The GPU is placed in performance mode where all error-correcting memory (ECC) is disabled

**Answer: A**
Full GPU passthrough means the inference pod gets exclusive access to the entire physical GPU, including all VRAM and compute units, with no sharing.

---

### Q69
A data scientist uploads a custom model to NAI but receives an error about unsupported model format. Which formats should they verify the model is saved in?
- A) SafeTensors, GPTQ, or AWQ — the supported model formats for vLLM-based NAI inference
- B) TensorFlow Lite (.tflite) or Apple CoreML (.mlmodel) format
- C) Pickled PyTorch state dict (.pkl) with no additional metadata files
- D) Caffe model format (.caffemodel) with Prototxt architecture definition

**Answer: A**
NAI's vLLM engine supports SafeTensors (FP16/BF16), GPTQ, and AWQ quantized formats. GGUF is designed for llama.cpp runtimes and is not natively supported by vLLM. Models in other formats need conversion before deployment.

---

### Q70
An operations team wants to use existing OpenAI client libraries to interact with NAI without code changes. Is this possible?
- A) Yes, NAI provides OpenAI-compatible API endpoints, so clients only need to change the base URL and API key
- B) No, NAI uses a proprietary protocol that requires the Nutanix Python SDK
- C) Yes, but only if the client library version matches the exact NAI API version
- D) No, NAI only supports gRPC-based inference and does not expose REST endpoints

**Answer: A**
NAI's OpenAI-compatible API means existing client libraries (like the openai Python package) work by simply pointing the base URL to the NAI endpoint and providing an NAI API key.

---

### Q71
An administrator needs to deploy a model that requires TensorRT-LLM but the model has not been compiled for the target GPU architecture. What must be done?
- A) The model must be compiled using TensorRT-LLM's build process for the specific GPU architecture before deployment
- B) NAI automatically compiles all models to TensorRT format when an endpoint is created
- C) Switch to a CPU-only inference mode which bypasses the need for GPU-specific compilation
- D) Install the NVIDIA CUDA Compatibility Layer which allows any compiled model to run on any GPU

**Answer: A**
TensorRT-LLM requires model compilation for the specific target GPU architecture. This compilation step optimizes the model for that GPU's capabilities and must be completed before deployment.

---

### Q72
A multi-tenant organization wants to ensure that one team's NAI workloads cannot access another team's models. Which Nutanix feature supports this isolation?
- A) Prism Central projects with separate namespaces and RBAC policies isolating resources between teams
- B) AHV network microsegmentation applied at the GPU passthrough device level
- C) Nutanix CSI driver encryption with per-tenant encryption keys applied to PersistentVolumes
- D) NVIDIA GPU Operator namespace isolation which creates separate GPU driver instances per team

**Answer: A**
Prism Central projects provide multi-tenancy by isolating Kubernetes namespaces and applying RBAC policies. Each team's NAI resources exist in separate projects with controlled access.

---

### Q73
When choosing between vLLM and TensorRT-LLM for an NAI endpoint, which factor favors vLLM?
- A) Need for broad model compatibility and faster deployment without a model compilation step
- B) Requirement for maximum throughput on NVIDIA H100 GPUs with compiled model optimization
- C) Deployment of models exclusively from the NVIDIA NGC catalog
- D) Running inference on AMD Instinct MI300 GPUs alongside NVIDIA GPUs

**Answer: A**
vLLM supports a wider range of models out-of-the-box and does not require a compilation step, making it easier and faster to deploy new models. TensorRT-LLM offers better performance but requires compilation.

---

### Q74
An administrator configures an endpoint with INT4 quantization for a model that was originally trained in FP16. What tradeoff should they communicate to the data science team?
- A) Significantly reduced GPU memory usage and faster inference, but potential degradation in output quality for nuanced tasks
- B) Improved output quality due to reduced numerical noise, but doubled memory consumption
- C) No change in memory or quality; INT4 only affects disk storage format, not GPU memory
- D) The model will only support English language prompts since quantization removes multilingual embeddings

**Answer: A**
INT4 quantization reduces memory usage by ~75% and can speed up inference, but the aggressive reduction in precision may cause noticeable quality degradation, especially for tasks requiring nuanced reasoning.

---

### Q75
A customer asks how many concurrent inference endpoints NAI can support. What primarily determines this limit?
- A) Available GPU resources in the NKP cluster — each endpoint requires dedicated GPU allocation
- B) The Prism Central license tier, which caps the number of endpoints at 5, 10, or unlimited
- C) The NAI Operator version, with each major release supporting a fixed maximum endpoint count
- D) The number of Kubernetes namespaces, since NAI allows exactly one endpoint per namespace

**Answer: A**
The number of concurrent endpoints is limited by available GPU resources. Each endpoint requires GPU allocation, so the total GPU capacity determines how many endpoints can be active simultaneously.

---

### Q76
An engineer wants to fine-tune a base Llama model deployed on NAI for domain-specific customer support tasks. Which approach minimizes compute requirements?
- A) Apply LoRA fine-tuning with a domain-specific dataset, which trains small adapter layers without modifying the full model weights
- B) Retrain the full Llama model from scratch on the customer support dataset using all available GPUs
- C) Use INT2 quantization on the base model, which simulates fine-tuning through extreme weight compression
- D) Deploy a prompt engineering service in front of NAI that reformats all queries for the base model

**Answer: A**
LoRA fine-tuning trains small adapter matrices (often <1% of total parameters) that augment the base model. This requires a fraction of the compute needed for full model retraining.

---

### Q77
An NAI endpoint is returning 503 Service Unavailable errors under heavy load despite auto-scaling being enabled. What should the administrator check?
- A) Whether the maximum replica count has been reached and no additional GPU resources are available for scaling
- B) Whether the Nutanix CSI driver has reached its maximum PersistentVolume count
- C) Whether Prism Central's API rate limit is blocking requests to the NAI management plane
- D) Whether the NVIDIA GPU driver needs to be upgraded to support concurrent kernel execution

**Answer: A**
503 errors under load with auto-scaling enabled suggest the maximum replica count has been reached or the cluster lacks additional GPU resources. The administrator should check scaling limits and GPU availability.

---

### Q78
Which of the following is NOT a valid model source for importing models into NAI?
- A) AWS SageMaker Model Registry direct integration
- B) Hugging Face Hub
- C) NVIDIA NGC catalog
- D) Manual upload from local storage

**Answer: A**
NAI supports Hugging Face Hub, NVIDIA NGC catalog, and manual upload as model sources. Direct integration with AWS SageMaker Model Registry is not a built-in NAI model source.

---

### Q79
A security-conscious organization requires that all NAI inference traffic between the client and the API Gateway is encrypted. Which configuration ensures this?
- A) Enable TLS on the NAI endpoint with a valid certificate and configure the Kubernetes Ingress to terminate TLS
- B) Configure Nutanix Flow to encrypt all traffic at Layer 2 between client and NAI pods
- C) Enable NVIDIA GPUDirect RDMA encryption between the API Gateway and the inference pod
- D) Install Nutanix Beam which automatically encrypts all cloud-adjacent API traffic

**Answer: A**
TLS configuration on the NAI endpoint and Ingress controller ensures all client-to-API-Gateway communication is encrypted, meeting the security requirement for encrypted inference traffic.

---

### Q80
An administrator has deployed an NAI endpoint using vLLM and receives a request to switch to TensorRT-LLM for better performance. What is required for this change?
- A) Create a new endpoint with TensorRT-LLM as the inference engine using a compiled version of the model, then redirect traffic and decommission the old endpoint
- B) Change the inference engine setting on the existing endpoint; NAI hot-swaps the engine without downtime
- C) Uninstall and reinstall the NAI Operator since the engine selection is a cluster-wide setting
- D) Submit a support ticket to Nutanix since engine changes require NVIDIA re-licensing

**Answer: A**
Switching inference engines typically requires creating a new endpoint since TensorRT-LLM needs a compiled model. The administrator should deploy the new endpoint, validate it, redirect traffic, and retire the old one.

---

*End of NCP-AI 6.10 Practice Questions — Domains 1 & 2 (80 Questions)*
