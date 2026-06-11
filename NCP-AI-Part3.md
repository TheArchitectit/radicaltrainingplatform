# NCP-AI 6.10 — Supplementary Advanced Questions (Part 3)

> 80 advanced/edge-case multiple-choice questions across 8 focus areas.
> Designed for candidates who need extra practice on tricky scenarios and subtle distinctions.

---

## Section 1: GPU Specifics and Sizing

---

### Q1
An architect needs to serve a Llama 2 70B model in FP16 for maximum accuracy. The model requires approximately 140 GB of VRAM. Which GPU configuration is the MINIMUM that can host this model?

- A) 2× NVIDIA A100 80 GB with NVLink
- B) 1× NVIDIA H100 80 GB
- C) 3× NVIDIA L40S 48 GB with PCIe
- D) 4× NVIDIA T4 16 GB with PCIe

**Answer: A**
The FP16 Llama 2 70B model requires ~140 GB VRAM. Two A100 80 GB GPUs connected via NVLink provide 160 GB of unified memory, which is the minimum viable option. A single H100 at 80 GB is insufficient, and T4s lack NVLink support for tensor parallelism.

---

### Q2
A team wants to run multiple smaller AI workloads on a single physical GPU to maximize utilization. Which GPU feature and hardware combination supports this natively?

- A) GPU passthrough on NVIDIA T4
- B) Multi-Instance GPU (MIG) on NVIDIA A100 or H100
- C) vGPU time-slicing on NVIDIA L40S only
- D) MIG on any NVIDIA GPU with 48 GB or more VRAM

**Answer: B**
MIG (Multi-Instance GPU) is only supported on NVIDIA A100 and H100 GPUs. It partitions a single GPU into up to seven isolated instances with dedicated VRAM, compute, and memory bandwidth. T4 and L40S do not support MIG.

---

### Q3
An administrator configures GPU passthrough for an inference VM. After the VM boots, the GPU is not detected. What is the MOST likely cause?

- A) The model file is corrupted on the NFS share
- B) IOMMU/VT-d is not enabled in the host BIOS
- C) The vLLM container version is outdated
- D) The Kubernetes node selector label is incorrect

**Answer: B**
GPU passthrough requires IOMMU (Intel VT-d or AMD-Vi) to be enabled in the host BIOS. Without it, the hypervisor cannot assign the physical GPU device directly to the VM, causing the GPU to be invisible inside the guest.

---

### Q4
When comparing NVIDIA A100 and H100 for large language model inference, which statement is TRUE?

- A) The H100 supports MIG but the A100 does not
- B) The A100 has higher memory bandwidth than the H100
- C) The H100 includes a Transformer Engine with FP8 support, improving LLM throughput over A100
- D) Both GPUs have identical CUDA core counts but differ only in VRAM capacity

**Answer: C**
The H100 introduces the Transformer Engine with native FP8 (8-bit floating point) computation, which significantly accelerates transformer-based LLM inference and training compared to the A100. Both support MIG, but the H100 offers substantially higher memory bandwidth and compute performance.

---

### Q5
A customer has 4× NVIDIA T4 GPUs (16 GB each) and wants to serve a 13B parameter model in FP16 (~26 GB VRAM). What is the primary challenge?

- A) T4 GPUs do not support CUDA 12
- B) T4 GPUs lack NVLink, making efficient tensor parallelism across GPUs difficult
- C) T4 GPUs cannot be used with Kubernetes
- D) The T4 driver does not support FP16 inference

**Answer: B**
While 4× T4s have 64 GB total VRAM, T4 GPUs only support PCIe interconnect, not NVLink. Tensor parallelism over PCIe incurs significant inter-GPU communication overhead, making it impractical for serving a single model across multiple T4 cards efficiently.

---

### Q6
An engineer is sizing GPUs for a batch of inference workloads. The workloads include: a 7B model in INT4, a 13B model in INT8, and a 70B model in FP16. What are the approximate VRAM requirements?

- A) 3.5 GB, 13 GB, 140 GB
- B) 7 GB, 13 GB, 70 GB
- C) 14 GB, 26 GB, 140 GB
- D) 3.5 GB, 6.5 GB, 35 GB

**Answer: A**
The rough formula is: parameters × bytes per parameter. INT4 = 0.5 bytes/param (7B × 0.5 = 3.5 GB), INT8 = 1 byte/param (13B × 1 = 13 GB), FP16 = 2 bytes/param (70B × 2 = 140 GB). These are base model weights only; runtime overhead (KV cache, activations) adds more.

---

### Q7
A Nutanix cluster has nodes with mixed GPU types — some with A100 and others with L40S. An administrator wants to ensure that a 70B FP16 model endpoint only schedules on A100 nodes. What is the correct approach?

- A) Set the model's quantization to INT4 so it fits on any GPU
- B) Use Kubernetes node selectors or node affinity rules to target nodes with A100 GPUs
- C) Configure MIG on the L40S GPUs to combine their VRAM
- D) Change the PCIe bus speed on L40S nodes to match A100 bandwidth

**Answer: B**
Kubernetes node selectors or node affinity rules allow you to constrain pod scheduling to nodes with specific GPU types. Labels such as `nvidia.com/gpu.product=A100` ensure the workload only runs on appropriate hardware. MIG is not available on L40S.

---

### Q8
Which statement about NVLink vs PCIe for multi-GPU inference is CORRECT?

- A) PCIe Gen5 provides higher GPU-to-GPU bandwidth than NVLink 4.0
- B) NVLink allows GPUs to share a unified memory address space, critical for tensor parallelism
- C) NVLink is required for GPU passthrough but not for vGPU
- D) PCIe connections support MIG partitioning while NVLink does not

**Answer: B**
NVLink provides significantly higher bidirectional bandwidth (NVLink 4.0 = 900 GB/s) compared to PCIe Gen5 (~128 GB/s full duplex), a 7x advantage. More importantly, NVLink enables GPUs to access each other's memory directly through a unified address space, which is essential for efficient tensor parallelism across multiple GPUs. This unified memory access is a key differentiator for distributed inference on large models.

---

### Q9
An architect must choose between NVIDIA L40S (48 GB) and NVIDIA A100 (80 GB) for serving a 33B model in FP16 (~66 GB VRAM). Which is correct?

- A) A single L40S is sufficient since 48 GB > 33 GB parameter count
- B) A single A100 80 GB is the minimum single-GPU option; L40S requires at least two cards
- C) Both GPUs are insufficient; only H100 supports 33B models
- D) The L40S is preferred because its Ada Lovelace architecture is newer than A100's Ampere

**Answer: B**
A 33B FP16 model needs ~66 GB VRAM for weights alone, plus overhead for KV cache and activations. A single L40S at 48 GB is insufficient. A single A100 at 80 GB can accommodate it. Two L40S cards (96 GB total) could work but require tensor parallelism.

---

### Q10
In a Nutanix AHV environment, an admin assigns a GPU via passthrough to a VM. Later, they attempt to live-migrate that VM to another node. What happens?

- A) The VM migrates seamlessly, and the GPU is re-attached on the target node
- B) Live migration fails because GPU passthrough pins the VM to a specific physical host
- C) The GPU is automatically converted to vGPU mode during migration
- D) Live migration succeeds but the GPU is disconnected until the VM is rebooted

**Answer: B**
GPU passthrough creates a direct hardware assignment between the physical GPU and the VM. This pins the VM to that specific host, making live migration impossible. The admin must power off the VM, migrate it, and reassign a GPU on the destination host.

---

## Section 2: Model Management Deep Dive

---

### Q11
A data scientist wants to deploy a 13B model but only has a single T4 GPU (16 GB VRAM). Which quantization level would BEST allow the model to fit while maintaining reasonable quality?

- A) FP16 — full precision, 26 GB required
- B) INT8 — half memory, 13 GB required
- C) INT4 — quarter memory, 6.5 GB required
- D) FP32 — double precision, 52 GB required

**Answer: C**
INT8 (13 GB) would barely fit without leaving room for KV cache and runtime overhead. INT4 at ~6.5 GB leaves sufficient headroom on a 16 GB T4 for the KV cache, activations, and batch processing. FP16 and FP32 are too large.

---

### Q12
What is the PRIMARY advantage of LoRA (Low-Rank Adaptation) fine-tuning compared to full fine-tuning?

- A) LoRA produces higher accuracy than full fine-tuning on all benchmarks
- B) LoRA trains only a small set of adapter weights, requiring significantly less GPU memory and compute
- C) LoRA modifies every layer of the model but uses FP8 precision
- D) LoRA eliminates the need for any training data

**Answer: B**
LoRA freezes the original model weights and injects small low-rank decomposition matrices into select layers. This dramatically reduces the number of trainable parameters (often <1% of total), cutting GPU memory requirements and training time while achieving competitive quality.

---

### Q13
An engineer downloads a model from Hugging Face in SafeTensors format. They attempt to load it with a TensorRT-LLM inference engine. What happens?

- A) TensorRT-LLM loads SafeTensors directly with no additional steps
- B) The model must first be converted/compiled into a TensorRT-LLM engine format before serving
- C) SafeTensors is only compatible with PyTorch and cannot be used for inference
- D) The engineer must convert it to ONNX first, then to TensorRT-LLM

**Answer: B**
TensorRT-LLM requires models to be compiled into its optimized engine format. The SafeTensors/Hugging Face weights must be converted using TensorRT-LLM's build scripts, which generate optimized execution plans specific to the target GPU architecture.

---

### Q14
A company operates in an air-gapped environment with no internet access. How should they obtain models for NAI deployment?

- A) NAI automatically caches all popular models during installation
- B) Models must be pre-downloaded externally, transferred via secure media, and loaded into a local model registry or storage accessible by the cluster
- C) NAI requires a persistent internet connection and cannot operate air-gapped
- D) Models are embedded in the NAI container images and require no separate download

**Answer: B**
In air-gapped environments, models must be downloaded from sources like Hugging Face on a connected system, transferred to the air-gapped environment via approved media, and placed in accessible storage (NFS, S3-compatible, or local PV) that the NAI platform can reference.

---

### Q15
When downloading gated models (like Llama 2) from Hugging Face, what is required?

- A) Only a standard Hugging Face account — no additional approval needed
- B) A Hugging Face access token AND acceptance of the model's license agreement on the Hugging Face website
- C) A paid Hugging Face Pro subscription
- D) An NVIDIA NGC API key only

**Answer: B**
Gated models require the user to accept the model provider's license terms on Hugging Face AND provide a valid Hugging Face access token during download. Without both, the download will be denied with a 403 or 401 error.

---

### Q16
Which statement about INT8 quantization is TRUE?

- A) INT8 doubles the model size compared to FP16
- B) INT8 reduces model size by half compared to FP16 with moderate accuracy impact
- C) INT8 quantization is only available for models under 7B parameters
- D) INT8 requires NVLink to function correctly

**Answer: B**
INT8 uses 1 byte per parameter compared to FP16's 2 bytes, halving the model size. The accuracy impact is usually small for well-calibrated quantization, making it a popular choice for deploying larger models on limited GPU memory.

---

### Q17
A team fine-tuned a model using LoRA and produced adapter weights of 50 MB. How are these adapter weights used during inference?

- A) The adapter weights replace the original model weights entirely
- B) The adapter weights are merged with or applied on top of the base model at inference time
- C) The adapter weights are only used during training and discarded for inference
- D) The adapter weights are loaded into CPU memory while the base model stays on GPU

**Answer: B**
LoRA adapter weights are applied on top of the frozen base model. They can either be merged into the base weights before deployment (for zero overhead) or applied dynamically at inference time, allowing multiple LoRA adapters to share the same base model.

---

### Q18
An engineer sees that a model repository offers weights in GGUF, GPTQ, AWQ, and SafeTensors formats. Which format is MOST directly usable with vLLM?

- A) GGUF — the universal GPU format
- B) GPTQ or AWQ quantized formats, as well as SafeTensors (FP16/BF16)
- C) Only GGUF is supported by vLLM
- D) Only SafeTensors with FP32 precision

**Answer: B**
vLLM supports Hugging Face SafeTensors (FP16/BF16) as well as popular quantization formats like GPTQ and AWQ. GGUF is primarily associated with llama.cpp and is not natively supported by vLLM. vLLM's broad format support is one of its advantages.

---

### Q19
What is the key risk of using INT4 quantization on a 7B model for a production medical diagnosis assistant?

- A) INT4 models cannot generate text longer than 512 tokens
- B) INT4 quantization may introduce subtle accuracy degradation, which is critical in high-stakes domains like healthcare
- C) INT4 requires at least 4 GPUs to run
- D) INT4 models do not support streaming output

**Answer: B**
While INT4 dramatically reduces memory requirements, it can introduce quantization errors that degrade accuracy — particularly for nuanced reasoning tasks. In high-stakes domains like healthcare, even small accuracy drops can have serious consequences, so thorough evaluation is essential.

---

### Q20
A model's Hugging Face page lists "BF16" as the native precision. What does this mean for deployment?

- A) BF16 (Brain Float 16) uses 2 bytes per parameter, similar memory to FP16, but with better numerical range for training and inference on modern GPUs
- B) BF16 uses 1 byte per parameter, same as INT8
- C) BF16 is only supported on CPU inference, not GPU
- D) BF16 requires NVIDIA T4 GPUs specifically

**Answer: A**
BF16 (Brain Floating Point 16) uses 16 bits (2 bytes) per parameter like FP16 but allocates more bits to the exponent for greater dynamic range. It's natively supported on A100, H100, and newer GPUs, and is the preferred training/inference precision for many modern LLMs.

---

## Section 3: vLLM vs TensorRT-LLM

---

### Q21
A team needs to deploy a newly released open-source model within hours of its release. Which inference engine is MORE suitable and why?

- A) TensorRT-LLM — because it supports all models instantly
- B) vLLM — because it can load Hugging Face models directly without a compilation step
- C) Both require equal setup time
- D) Neither can deploy a model without at least one week of optimization

**Answer: B**
vLLM can load models directly from Hugging Face-compatible formats (SafeTensors, GPTQ, AWQ) without a compilation step. TensorRT-LLM requires converting and compiling the model into an optimized engine first, which adds significant setup time.

---

### Q22
What is PagedAttention, and which inference engine uses it?

- A) A GPU memory allocation technique used by TensorRT-LLM to pre-allocate fixed KV cache blocks
- B) A vLLM innovation that manages KV cache memory like virtual memory pages, reducing waste and enabling higher throughput
- C) A Kubernetes scheduling algorithm for distributing GPU workloads
- D) An NVIDIA hardware feature exclusive to H100 GPUs

**Answer: B**
PagedAttention is vLLM's key innovation that manages the key-value (KV) cache using a paging mechanism similar to OS virtual memory. It eliminates memory fragmentation and waste in the KV cache, allowing more concurrent requests and higher throughput.

---

### Q23
Which statement about TensorRT-LLM is CORRECT?

- A) TensorRT-LLM is a Python-only framework that interprets models at runtime
- B) TensorRT-LLM compiles models into optimized CUDA kernels specific to the target GPU, yielding lower latency
- C) TensorRT-LLM supports AMD GPUs through ROCm integration
- D) TensorRT-LLM does not support quantization of any kind

**Answer: B**
TensorRT-LLM compiles model graphs into highly optimized CUDA kernels tailored to the specific GPU architecture (e.g., A100, H100). This compilation step produces lower inference latency compared to interpreted frameworks, but requires upfront build time.

---

### Q24
A developer reports that their vLLM endpoint handles 50 concurrent users well but TensorRT-LLM serves the same model with 20% lower per-request latency. What explains this?

- A) TensorRT-LLM uses more VRAM, which always means faster inference
- B) TensorRT-LLM's compiled engine executes optimized CUDA kernels with less overhead, reducing per-token latency
- C) vLLM cannot handle concurrent users
- D) The developer miscounted the users

**Answer: B**
TensorRT-LLM's ahead-of-time compilation produces fused, architecture-specific CUDA kernels that reduce per-operation overhead. This typically yields lower per-request latency. vLLM's advantage is in throughput via PagedAttention and dynamic batching, not raw per-request latency.

---

### Q25
An organization wants to serve the same model on both NVIDIA and non-NVIDIA (AMD) hardware. Which engine is the better choice?

- A) TensorRT-LLM — it supports all GPU vendors
- B) vLLM — it has broader hardware support including AMD GPUs via ROCm
- C) Both engines are vendor-agnostic
- D) Neither engine supports AMD GPUs

**Answer: B**
vLLM has experimental/growing support for AMD GPUs via ROCm, making it more suitable for multi-vendor environments. TensorRT-LLM is tightly coupled to NVIDIA's CUDA and TensorRT stack and does not support non-NVIDIA hardware.

---

### Q26
When should an administrator choose TensorRT-LLM over vLLM for an NAI deployment?

- A) When they need the fastest possible setup with no model preparation
- B) When they prioritize minimum per-request latency on NVIDIA GPUs and can invest time in model compilation
- C) When they are running on ARM-based servers
- D) When the model is only available in GGUF format

**Answer: B**
TensorRT-LLM is the better choice when the deployment target is exclusively NVIDIA GPUs, the model is stable (not frequently changing), and the team can invest in the compilation step. The resulting engine provides superior per-request latency and GPU utilization.

---

### Q27
A vLLM deployment is experiencing out-of-memory errors during peak traffic despite the model fitting in VRAM at startup. What is the MOST likely cause?

- A) The model weights grew larger during inference
- B) The KV cache expanded as concurrent requests increased, consuming the remaining VRAM
- C) vLLM does not support concurrent requests
- D) The GPU firmware is outdated

**Answer: B**
vLLM dynamically allocates KV cache memory for each active request. During high concurrency, the KV cache for all active sequences can consume significant VRAM beyond the model weights. Tuning `--gpu-memory-utilization` and `--max-num-seqs` helps manage this.

---

### Q28
Which feature allows vLLM to efficiently batch requests that arrive at different times?

- A) Static batching — all requests must arrive within the same time window
- B) Continuous batching — new requests can join an in-progress batch dynamically
- C) Manual batching — the developer must group requests in application code
- D) TensorRT compilation — which pre-determines batch sizes

**Answer: B**
vLLM implements continuous (or iteration-level) batching, where new requests can be added to the batch at each decoding iteration. This eliminates the head-of-line blocking problem in static batching, significantly improving throughput and GPU utilization.

---

### Q29
An engineer compiled a model with TensorRT-LLM on an A100 GPU. They then move the compiled engine to an H100 node. What happens?

- A) The engine runs identically on both GPUs since they are both NVIDIA
- B) The engine may fail or run suboptimally because TensorRT-LLM compiles for a specific GPU architecture
- C) The engine automatically recompiles on the H100
- D) TensorRT-LLM engines are fully architecture-independent

**Answer: B**
TensorRT-LLM engines are compiled for specific GPU compute capabilities (e.g., sm_80 for A100, sm_90 for H100). An engine compiled for A100 may not run or may not leverage H100-specific features. The model should be recompiled for the target architecture.

---

### Q30
A benchmark shows vLLM achieving higher throughput (tokens/second across all users) while TensorRT-LLM achieves lower latency (time-to-first-token). Which deployment scenario favors vLLM?

- A) A real-time voice assistant requiring sub-100ms responses
- B) A high-traffic API serving thousands of concurrent document summarization requests
- C) A single-user interactive coding assistant
- D) A latency-sensitive trading system

**Answer: B**
vLLM excels in high-throughput scenarios with many concurrent requests due to PagedAttention and continuous batching. TensorRT-LLM's lower per-request latency is preferred for interactive, latency-sensitive applications with fewer concurrent users.

---

## Section 4: Kubernetes/NKP Details

---

### Q31
What is the MINIMUM Kubernetes platform requirement for deploying Nutanix AI (NAI)?

- A) Any CNCF-conformant Kubernetes cluster version 1.24+
- B) Nutanix Kubernetes Platform (NKP) with GPU-capable worker nodes
- C) OpenShift 4.12+ with Nutanix CSI driver
- D) Amazon EKS with Nutanix storage classes

**Answer: B**
NAI is designed to run on NKP (Nutanix Kubernetes Platform). It requires NKP with properly configured GPU worker nodes, the NVIDIA GPU Operator, and Nutanix storage integration for model persistence.

---

### Q32
An NAI endpoint pod is stuck in "Pending" state. The `kubectl describe pod` output shows: "0/5 nodes are available: 5 Insufficient nvidia.com/gpu." What is the cause?

- A) The NVIDIA driver is not installed on the cluster
- B) All GPU resources on the cluster are already allocated to other pods, or the requested GPU count exceeds available GPUs
- C) The model file is corrupted
- D) The Kubernetes API server is down

**Answer: B**
The error "Insufficient nvidia.com/gpu" means the scheduler cannot find a node with enough unallocated GPUs to satisfy the pod's resource request. Either all GPUs are in use, or the pod requests more GPUs than any single node has available.

---

### Q33
Which Kubernetes component is responsible for making NVIDIA GPUs visible as schedulable resources in the cluster?

- A) Nutanix CSI Driver
- B) NVIDIA GPU Operator (including the device plugin)
- C) Kubernetes Metrics Server
- D) CoreDNS

**Answer: B**
The NVIDIA GPU Operator deploys the NVIDIA device plugin, driver containers, and related components. The device plugin registers GPUs as extended resources (`nvidia.com/gpu`) with the kubelet, making them visible to the Kubernetes scheduler.

---

### Q34
An administrator needs to configure persistent storage for downloaded model files in an NAI deployment. Which storage component is REQUIRED?

- A) Nutanix Volumes with iSCSI only
- B) A Kubernetes StorageClass backed by the Nutanix CSI Driver with ReadWriteMany (RWX) support for shared model access
- C) Local SSD storage on each GPU node
- D) An external NFS server not managed by Nutanix

**Answer: B**
Model files often need to be accessible by multiple pods (for multi-replica endpoints). A StorageClass using the Nutanix CSI Driver with ReadWriteMany (RWX) access mode — typically backed by Nutanix Files — enables shared, persistent model storage across pods.

---

### Q35
What is the purpose of an Ingress controller in the context of NAI?

- A) It manages GPU driver installations on worker nodes
- B) It routes external HTTP/HTTPS traffic to NAI inference endpoint services within the cluster
- C) It schedules pods onto GPU nodes
- D) It monitors GPU temperature and throttling

**Answer: B**
The Ingress controller (e.g., NGINX Ingress, Traefik, or Istio) provides external access to NAI inference endpoints by routing incoming HTTP/HTTPS requests to the appropriate Kubernetes services. It handles TLS termination, path-based routing, and load balancing.

---

### Q36
A GPU node in the NKP cluster becomes unavailable. What happens to NAI inference endpoints that had replicas running on that node?

- A) All inference endpoints across the entire cluster immediately stop
- B) Kubernetes reschedules the affected pods to other GPU-capable nodes if resources are available; other replicas continue serving
- C) The NAI control plane automatically provisions a new physical node
- D) The model must be re-downloaded from Hugging Face before rescheduling

**Answer: B**
Kubernetes detects the node failure and marks the pods as terminated. If the deployment has multiple replicas, the remaining replicas on healthy nodes continue serving. The scheduler attempts to reschedule the failed pods to other GPU-capable nodes with available resources.

---

### Q37
An admin configures a GPU node selector as `nvidia.com/gpu.product: "NVIDIA-A100-SXM4-80GB"` on an NAI endpoint. The pod stays in Pending state even though A100 nodes exist. What is the MOST likely issue?

- A) The label value on the actual nodes does not exactly match the selector string (e.g., different formatting or casing)
- B) A100 GPUs do not support node selectors
- C) The NAI endpoint ignores Kubernetes scheduling constraints
- D) Node selectors only work with CPU resources

**Answer: A**
Node selector labels must match exactly, including casing, hyphens, and spacing. The GPU product label is auto-generated by the NVIDIA device plugin and may vary (e.g., "NVIDIA-A100-SXM4-80GB" vs "A100-SXM-80GB"). Always verify actual node labels with `kubectl get nodes --show-labels`.

---

### Q38
Which Kubernetes resource type does NAI typically use to manage inference endpoint pods?

- A) DaemonSet — to run one inference pod per node
- B) Deployment — to manage replicated inference pods with rolling updates
- C) StatefulSet — because each pod needs a unique network identity
- D) CronJob — to run inference on a schedule

**Answer: B**
NAI uses Kubernetes Deployments to manage inference endpoint pods. Deployments provide replica management, rolling updates, and rollback capabilities. Inference pods are stateless (model weights are loaded from shared storage), so StatefulSets are unnecessary.

---

### Q39
An NKP cluster has the NVIDIA GPU Operator installed, but `kubectl describe node` shows no `nvidia.com/gpu` resource. What should the admin check FIRST?

- A) Whether the Nutanix CSI driver is installed
- B) Whether the NVIDIA device plugin pods are running and the GPU drivers loaded successfully on the nodes
- C) Whether the model has been downloaded
- D) Whether the Ingress controller has TLS configured

**Answer: B**
If `nvidia.com/gpu` does not appear in node resources, the NVIDIA device plugin is either not running or has failed. The admin should check GPU Operator pod status (`kubectl get pods -n gpu-operator`), driver container logs, and verify that the physical GPUs are detected at the OS level.

---

### Q40
An administrator wants to limit NAI inference pods to only use GPU nodes and prevent them from being scheduled on CPU-only nodes. What is the BEST approach?

- A) Delete all CPU-only nodes from the cluster
- B) Apply a taint (e.g., `nvidia.com/gpu=present:NoSchedule`) to GPU nodes and add a matching toleration to NAI pods, combined with node affinity rules
- C) Set CPU resource requests to zero on inference pods
- D) Disable the Kubernetes scheduler entirely

**Answer: B**
Using a combination of taints/tolerations and node affinity ensures that GPU workloads land on GPU nodes and non-GPU workloads are repelled from GPU nodes. This is the standard Kubernetes pattern for dedicated GPU node pools.

---

## Section 5: API Integration Patterns

---

### Q41
A developer wants to use the OpenAI Python SDK to call an NAI endpoint. What changes are needed?

- A) Complete SDK replacement — NAI uses a proprietary API incompatible with OpenAI
- B) Only change `base_url` to the NAI endpoint URL and `api_key` to the NAI API key; the rest of the code remains the same
- C) Install a separate Nutanix Python SDK
- D) Convert all requests to GraphQL format

**Answer: B**
NAI endpoints are OpenAI API-compatible. Developers simply set `base_url` to the NAI endpoint URL and `api_key` to their NAI key. All standard OpenAI SDK methods (`chat.completions.create`, etc.) work without modification.

---

### Q42
A developer enables `stream=True` in their API request. What format does the NAI endpoint use for streaming responses?

- A) WebSocket frames with JSON payloads
- B) Server-Sent Events (SSE) with `data:` prefixed JSON chunks, ending with `data: [DONE]`
- C) HTTP chunked transfer encoding with raw text
- D) gRPC streaming with protobuf messages

**Answer: B**
NAI (like OpenAI) uses the Server-Sent Events (SSE) protocol for streaming. Each chunk is a `data:` prefixed JSON object containing a delta token. The stream terminates with `data: [DONE]`. This is standard for OpenAI-compatible APIs.

---

### Q43
An API response shows: `"usage": {"prompt_tokens": 150, "completion_tokens": 85, "total_tokens": 235}`. A developer is optimizing costs. Which action MOST directly reduces `prompt_tokens`?

- A) Lowering the `temperature` parameter
- B) Reducing the length of the system prompt and user message
- C) Setting `max_tokens` to a lower value
- D) Switching from streaming to non-streaming mode

**Answer: B**
`prompt_tokens` counts the tokenized input (system prompt + user message + conversation history). The only way to reduce it is to shorten the input content. `max_tokens` only limits output length, `temperature` affects randomness, and streaming mode doesn't affect token counts.

---

### Q44
A production application sends requests to an NAI endpoint and occasionally receives HTTP 429 responses. What does this indicate and how should the developer handle it?

- A) HTTP 429 means the model is corrupted; redeploy the endpoint
- B) HTTP 429 indicates rate limiting; the developer should implement exponential backoff and retry logic
- C) HTTP 429 means the API key is invalid; generate a new key
- D) HTTP 429 indicates a GPU hardware failure

**Answer: B**
HTTP 429 "Too Many Requests" means the client has exceeded the rate limit. The correct handling is to implement exponential backoff with jitter and retry. Application code should also consider queuing requests and respecting `Retry-After` headers if provided.

---

### Q45
A developer calls the `/v1/chat/completions` endpoint but receives `"error": {"type": "invalid_request_error", "message": "model not found"}`. What is the MOST likely cause?

- A) The GPU has run out of memory
- B) The model name in the request does not match the model name configured on the NAI endpoint
- C) The API key has expired
- D) The Kubernetes cluster is at full capacity

**Answer: B**
The `model` field in the API request must exactly match the model identifier configured when the NAI endpoint was created. A mismatch (e.g., "llama-2-7b" vs "meta-llama/Llama-2-7b-chat-hf") returns this error. Check the endpoint configuration for the exact model name.

---

### Q46
When implementing a chat application using an NAI endpoint, why is it important to manage the conversation history (messages array) carefully?

- A) NAI endpoints automatically store all conversation history server-side
- B) The entire messages array is sent with each request, consuming prompt tokens and potentially exceeding the model's context window
- C) Conversation history is only relevant for fine-tuning, not inference
- D) NAI endpoints reject requests with more than 3 messages

**Answer: B**
LLM inference is stateless — the full messages array is sent with every request. As conversation grows, prompt tokens increase linearly, eventually hitting the model's context window limit. Developers must implement conversation truncation or summarization strategies.

---

### Q47
A developer wants to make concurrent API requests to an NAI endpoint for batch processing. What is the recommended approach?

- A) Send all requests sequentially to avoid overloading the endpoint
- B) Use async HTTP clients to send concurrent requests, respecting the endpoint's concurrency limits and implementing rate limit handling
- C) Create a separate NAI endpoint for each concurrent request
- D) Batch all texts into a single request body with line separators

**Answer: B**
Concurrent requests are expected and efficient — NAI endpoints support continuous batching internally. Use async HTTP clients (aiohttp, httpx) with a connection pool, respect rate limits (handle 429s), and monitor endpoint metrics to find the optimal concurrency level.

---

### Q48
What is the key difference between `max_tokens` and the model's context window size?

- A) They are the same parameter with different names
- B) Context window is the total limit for input + output tokens; `max_tokens` limits only the output (completion) tokens within that window
- C) `max_tokens` applies only to streaming mode; context window applies to non-streaming
- D) Context window is a hardware limit; `max_tokens` is a software limit

**Answer: B**
The context window (e.g., 4096, 8192, 128K tokens) is the model's maximum combined input and output length. `max_tokens` controls only the maximum output length. If prompt_tokens + max_tokens exceeds the context window, the request will fail or be truncated.

---

### Q49
An application uses the NAI endpoint with `temperature=0`. What behavior should the developer expect?

- A) The model will refuse to generate any output
- B) The output will be nearly deterministic — the model selects the highest-probability token at each step
- C) The output will be maximally creative and random
- D) Temperature only affects streaming speed, not output quality

**Answer: B**
Temperature=0 makes the model greedy, always selecting the most probable next token. This produces nearly deterministic output (ideal for factual Q&A, code generation). Higher temperatures increase randomness and creativity by flattening the probability distribution.

---

### Q50
A developer notices that their streaming response occasionally includes empty `content` fields in the delta. Is this expected?

- A) No — empty deltas indicate a server error and the request should be retried
- B) Yes — the first chunk often has an empty content delta (containing only the role), and this is normal SSE behavior
- C) Empty deltas mean the model has been rate-limited mid-response
- D) This only happens with INT4 quantized models

**Answer: B**
In OpenAI-compatible SSE streaming, the first chunk typically contains `"delta": {"role": "assistant"}` with no `content` field. Subsequent chunks contain `"delta": {"content": "token"}`. This is standard protocol behavior, not an error.

---

## Section 6: Security and Access Control

---

### Q51
An organization requires that each development team has a unique API key for their NAI endpoint. What is the PRIMARY benefit of per-team API keys?

- A) Per-team keys automatically improve inference speed
- B) They enable granular usage tracking, independent rate limiting, and the ability to revoke access for a single team without affecting others
- C) They allow each team to use a different model version simultaneously
- D) Per-team keys eliminate the need for TLS encryption

**Answer: B**
Per-team API keys provide accountability (track which team makes which requests), independent rate limiting per consumer, and granular revocation. If a key is compromised, only that team's access is revoked without disrupting other teams.

---

### Q52
An NAI inference endpoint is accessible over HTTPS. What happens if a client sends a request over plain HTTP?

- A) The request succeeds with a warning header
- B) Depending on Ingress configuration, the request should be rejected or redirected to HTTPS to prevent credentials from being transmitted in plaintext
- C) HTTP requests are automatically faster than HTTPS
- D) The model output is encrypted regardless of protocol

**Answer: B**
Best practice is to configure the Ingress controller to either redirect HTTP to HTTPS (301/308) or reject HTTP entirely. API keys transmitted over plain HTTP are exposed in plaintext, creating a serious security vulnerability.

---

### Q53
How does Prism Central provide RBAC for NAI resources?

- A) Prism Central has no integration with NAI
- B) Through projects and categories that assign role-based permissions, controlling who can create, manage, and access NAI endpoints
- C) By directly modifying Kubernetes RBAC roles in the NKP cluster
- D) Through SSH key management on GPU nodes

**Answer: B**
Prism Central uses projects and categories to implement RBAC for NAI. Administrators assign users/groups to projects with specific roles (e.g., admin, operator, viewer), controlling access to NAI endpoints, models, and configurations within the project scope.

---

### Q54
An API key for an NAI endpoint is accidentally committed to a public GitHub repository. What is the CORRECT immediate response?

- A) Delete the GitHub commit history and assume the key is safe
- B) Immediately rotate (revoke and regenerate) the API key, audit logs for unauthorized usage, and implement secrets scanning in CI/CD
- C) Change the model served by the endpoint to invalidate the key
- D) Restart the inference pods to invalidate active sessions

**Answer: B**
A leaked API key must be immediately revoked and regenerated. Audit logs should be reviewed for any unauthorized requests made with the compromised key. Preventive measures like GitHub secret scanning, pre-commit hooks, and secrets management tools should be implemented.

---

### Q55
An organization needs to demonstrate compliance with data access regulations. Which NAI capability supports this?

- A) Model quantization — smaller models are inherently more compliant
- B) Audit logging — tracking API calls, user access, and endpoint operations for compliance reporting
- C) Using INT4 instead of FP16 precision
- D) Running inference on CPU instead of GPU

**Answer: B**
Audit logging records who accessed which endpoints, when, and what operations were performed. This creates an audit trail required by regulations like GDPR, HIPAA, and SOC2 for demonstrating data access governance and accountability.

---

### Q56
What is the recommended approach for storing NAI API keys in a production application?

- A) Hardcode them in application source code for convenience
- B) Store them in environment variables or a secrets management system (e.g., Kubernetes Secrets, HashiCorp Vault) and never in source code
- C) Store them in a shared text file accessible to all developers
- D) Embed them in Docker image layers during the build process

**Answer: B**
API keys should be managed through Kubernetes Secrets, environment variables injected at runtime, or dedicated secrets management systems. They must never appear in source code, configuration files checked into version control, or Docker image layers.

---

### Q57
An administrator wants to restrict NAI endpoint access to only internal corporate network traffic. Which is the MOST effective approach?

- A) Use a weak API key that's easy to remember
- B) Configure the Ingress controller or network policies to restrict access to specific IP ranges (CIDR blocks) and deploy the endpoint on an internal-only load balancer
- C) Disable HTTPS so external traffic cannot connect securely
- D) Set the model's max_tokens to 1 for external users

**Answer: B**
Network-level controls are the most effective restriction. Use Kubernetes NetworkPolicies and Ingress annotations to whitelist internal IP ranges, deploy on internal-only (ClusterIP or internal LoadBalancer) services, and optionally add a VPN requirement.

---

### Q58
How should API key rotation be handled for an NAI endpoint with zero downtime?

- A) Revoke the old key, then generate a new key, then update applications (brief outage expected)
- B) Generate a new API key, update all client applications to use the new key, verify connectivity, then revoke the old key
- C) Key rotation always requires endpoint redeployment
- D) Keys do not expire and never need rotation

**Answer: B**
Zero-downtime rotation follows a parallel key strategy: issue the new key first, update all clients, verify they work with the new key, then revoke the old key. This ensures no window where valid credentials are unavailable.

---

### Q59
A security auditor asks how NAI ensures that inference data is not accessible between different tenants on the same cluster. What is the PRIMARY isolation mechanism?

- A) Each tenant gets a separate physical GPU
- B) Kubernetes namespaces with network policies and RBAC ensure logical isolation of endpoints, API keys, and network traffic between tenants
- C) Data is encrypted with a tenant-specific GPU hardware key
- D) NAI does not support multi-tenancy

**Answer: B**
Multi-tenant isolation in NAI leverages Kubernetes namespaces for resource separation, network policies to prevent cross-namespace traffic, RBAC for access control, and separate API keys per tenant. This provides logical isolation without requiring dedicated hardware.

---

### Q60
An organization using NAI must comply with requirements that all inference requests and responses be logged for 90 days. Where should this logging be implemented?

- A) Inside the model weights themselves
- B) At the API gateway / Ingress level and within the application layer, forwarding logs to a centralized logging system (ELK, Splunk, etc.)
- C) On the GPU driver level
- D) This is not possible with NAI

**Answer: B**
Compliance logging should be implemented at the API gateway/Ingress level (capturing request metadata) and in the application layer (capturing request/response content if required). Logs should be forwarded to a centralized, tamper-evident logging system with appropriate retention policies.

---

## Section 7: Troubleshooting Scenarios

---

### Q61
An NAI inference endpoint returns CUDA Out of Memory (OOM) errors after running successfully for several hours. What is the MOST likely cause?

- A) The GPU hardware has physically degraded
- B) Memory leaks in the KV cache, or increasing concurrent requests are exhausting GPU memory not reserved for the KV cache
- C) The model file has grown larger on disk
- D) The Kubernetes scheduler has moved the pod to a smaller GPU

**Answer: B**
Gradual OOM is typically caused by KV cache growth as concurrent requests increase, or memory leaks in the inference engine. Solutions include setting `--gpu-memory-utilization` limits, capping `--max-num-seqs`, and monitoring GPU memory usage over time.

---

### Q62
An administrator notices that GPU utilization for an inference endpoint is consistently below 20%. What should they investigate FIRST?

- A) Replace the GPU with a newer model
- B) Check if request volume is too low to saturate the GPU, and consider increasing batch sizes or reducing the number of replicas
- C) Increase the VRAM allocation beyond the physical GPU limit
- D) Switch from GPU to CPU inference

**Answer: B**
Low GPU utilization usually indicates insufficient request volume to keep the GPU busy. Solutions include consolidating replicas (fewer replicas, higher traffic per replica), enabling continuous batching, increasing `--max-num-seqs`, or serving multiple models on the same GPU.

---

### Q63
A pod running an NAI inference endpoint enters CrashLoopBackOff. The logs show "CUDA error: no CUDA-capable device is detected." What is the cause?

- A) The model is too large for the GPU
- B) The pod is scheduled on a node without a GPU, or the NVIDIA device plugin is not properly exposing GPUs to the container runtime
- C) The API key is misconfigured
- D) The container image does not include Python

**Answer: B**
This CUDA error means the container cannot see any GPU. Either the pod was scheduled on a CPU-only node (missing GPU resource request), the NVIDIA device plugin is not running, or the container runtime (nvidia-container-runtime) is not configured properly.

---

### Q64
A user reports that NAI inference responses are extremely slow (>30 seconds per request) even though the endpoint is healthy. What should the administrator check?

- A) The user's internet browser version
- B) GPU utilization (thermal throttling?), request queue depth, batch size settings, and whether the model is swapping between GPU and CPU memory
- C) The color scheme of the Prism Central dashboard
- D) The DNS TTL settings for the cluster

**Answer: B**
Slow inference can result from: GPU thermal throttling, high request queue depth (too many concurrent requests), suboptimal batch sizes, the model being partially loaded on CPU (exceeding VRAM), or network latency. Check `nvidia-smi` for GPU stats and endpoint metrics.

---

### Q65
An NAI endpoint URL returns "502 Bad Gateway" when accessed from a browser. What should the admin troubleshoot?

- A) The model's training data is invalid
- B) The Ingress controller is receiving the request but the backend service/pod is unavailable — check pod readiness, service endpoints, and Ingress configuration
- C) The browser does not support AI inference
- D) The GPU temperature is too high

**Answer: B**
A 502 from the Ingress means the reverse proxy cannot reach the backend. Check: (1) pod status (`kubectl get pods`), (2) service endpoints (`kubectl get endpoints`), (3) pod readiness probes, (4) Ingress backend configuration, and (5) pod logs for startup failures.

---

### Q66
An inference endpoint pod is running but readiness probes are failing. The pod shows as "Running" but "0/1 Ready." What is the impact?

- A) The pod continues to receive and process all traffic normally
- B) Kubernetes removes the pod from the Service endpoints, so no traffic is routed to it until it becomes ready
- C) The pod is immediately deleted and restarted
- D) The readiness probe has no effect on traffic routing

**Answer: B**
Failed readiness probes cause Kubernetes to remove the pod from the Service's endpoint list, stopping traffic from being routed to it. This is actually a safety feature — the model may still be loading into VRAM. Once the probe passes, traffic resumes.

---

### Q67
After scaling an NAI endpoint from 1 to 3 replicas, only 1 replica starts successfully while the other 2 remain in Pending state. What is the MOST likely issue?

- A) NAI only supports single-replica deployments
- B) Insufficient GPU resources — the cluster does not have enough available GPUs to schedule all 3 replicas
- C) The model license only permits one concurrent instance
- D) The Kubernetes scheduler has a bug

**Answer: B**
Each replica requires its own GPU allocation. If the cluster has only enough free GPUs for one replica, the remaining pods stay Pending with "Insufficient nvidia.com/gpu." The admin must add GPU nodes or free up existing GPUs.

---

### Q68
A developer reports that their NAI endpoint returns different results for the same prompt each time. Is this a bug?

- A) Yes — LLMs should always produce identical output
- B) No — LLMs are stochastic by default due to sampling; setting `temperature=0` and `seed` parameter produces near-deterministic output
- C) This only happens with quantized models and indicates corruption
- D) The model needs to be re-downloaded

**Answer: B**
LLMs use probabilistic sampling by default, introducing randomness. For deterministic output, set `temperature=0` (greedy decoding). Some engines also support a `seed` parameter. Minor variation across runs can also occur due to floating-point non-determinism in GPU operations.

---

### Q69
An administrator upgrades the NVIDIA GPU Operator on the NKP cluster and NAI endpoints stop working. Pods show "Error: container runtime error." What happened?

- A) The model files became incompatible with the new operator
- B) The GPU Operator upgrade may have changed the nvidia-container-runtime version or configuration, causing compatibility issues with existing pod configurations
- C) GPU hardware has failed
- D) The API keys expired during the upgrade

**Answer: B**
GPU Operator upgrades can modify the nvidia-container-runtime, driver versions, or device plugin configuration. If the new versions are incompatible with existing pod specs or node configurations, containers cannot access GPUs. Rolling back or updating pod configurations may be needed.

---

### Q70
An NAI endpoint intermittently returns "connection reset" errors under heavy load. What should the administrator investigate?

- A) The model's vocabulary file is corrupted
- B) Resource exhaustion: check pod memory limits, Ingress timeout settings, kernel connection limits, and whether the inference engine is crashing under load
- C) The TLS certificate is self-signed
- D) DNS entries for the endpoint have incorrect TTL

**Answer: B**
Intermittent connection resets under load indicate resource exhaustion or timeouts. Check: (1) pod OOM kills (`kubectl describe pod`), (2) Ingress proxy timeouts, (3) kernel socket/connection limits, (4) inference engine logs for crash/restart, and (5) load balancer connection limits.

---

## Section 8: Architecture and Planning

---

### Q71
When should an organization choose NAI over a direct manual Kubernetes deployment for LLM serving?

- A) Only when running models smaller than 7B parameters
- B) When they want simplified lifecycle management, Prism Central integration, built-in model management, and don't want to manually configure vLLM/TRT-LLM, GPU operators, and storage
- C) Only when using non-NVIDIA GPUs
- D) NAI is always inferior to manual deployment

**Answer: B**
NAI provides an opinionated, integrated platform that simplifies endpoint creation, model management, GPU allocation, and monitoring through Prism Central. Manual Kubernetes deployment offers more flexibility but requires deep expertise in Kubernetes, GPU operators, inference engines, and storage configuration.

---

### Q72
A company plans to serve 5 different models simultaneously on a single NKP cluster. What is the KEY architectural consideration?

- A) Only one model can be served per cluster
- B) Total GPU capacity must accommodate all models' VRAM requirements plus overhead, and proper resource quotas should prevent any single model from consuming all cluster GPUs
- C) Each model requires its own separate NKP cluster
- D) Multiple models require a paid NAI Enterprise license per model

**Answer: B**
Multi-model serving on a shared cluster requires careful GPU capacity planning. Sum all models' VRAM needs (including KV cache overhead), add headroom for scaling, and implement Kubernetes resource quotas to ensure fair GPU allocation across endpoints.

---

### Q73
An architect is planning for high availability of an NAI inference endpoint. What is the MINIMUM deployment configuration?

- A) A single replica with daily snapshots
- B) At least 2 replicas spread across different nodes, with health checks and a load-balanced service
- C) A single replica with a restart policy
- D) Three NKP clusters in different regions

**Answer: B**
HA for inference requires at least 2 replicas on separate nodes so that a single node failure doesn't cause an outage. The Kubernetes Service load-balances across healthy replicas, and readiness probes ensure traffic only goes to ready instances.

---

### Q74
How should an architect calculate the number of GPUs needed for a target concurrent user count?

- A) One GPU per concurrent user
- B) Benchmark the model's throughput (tokens/second) per GPU, then divide total required throughput (concurrent users × average tokens per request) by per-GPU throughput
- C) Concurrent users have no impact on GPU requirements
- D) Use one GPU per 1000 concurrent users regardless of model size

**Answer: B**
Capacity planning requires benchmarking: measure tokens/second per GPU for the specific model and configuration, estimate per-user token requirements (prompt + completion), multiply by target concurrent users, then divide by per-GPU throughput to determine GPU count.

---

### Q75
An organization wants to run inference on a 70B model with the lowest possible latency. They have budget for either 4× A100 80GB or 2× H100 80GB. Which should they choose for latency?

- A) 4× A100 — more GPUs always means lower latency
- B) 2× H100 — the H100's Transformer Engine, higher memory bandwidth, and NVLink 4.0 typically deliver lower per-request latency with fewer cards
- C) They are identical in latency performance
- D) Neither can run a 70B model

**Answer: B**
H100s offer significantly higher memory bandwidth (3.35 TB/s vs 2.0 TB/s for A100), the Transformer Engine with FP8 support, and NVLink 4.0. For latency-sensitive inference, 2 faster GPUs with less inter-GPU communication overhead typically outperform 4 slower ones.

---

### Q76
A team deploys a model with 3 replicas across 3 GPU nodes. During a rolling update to a new model version, what ensures zero-downtime?

- A) All 3 replicas are stopped and replaced simultaneously
- B) Kubernetes rolling update strategy creates new pods before terminating old ones, ensuring at least some replicas are always available during the transition
- C) Rolling updates are not supported for GPU workloads
- D) The Ingress controller caches responses during the update

**Answer: B**
The Kubernetes Deployment rolling update strategy (`maxUnavailable` and `maxSurge` settings) ensures that new pods with the updated model version are created and pass readiness checks before old pods are terminated. This maintains continuous availability.

---

### Q77
What is the PRIMARY challenge of serving a model that requires more VRAM than a single GPU provides?

- A) The model cannot be served under any circumstances
- B) Tensor parallelism must be used to shard the model across multiple GPUs, requiring high-bandwidth interconnects (NVLink) and increasing deployment complexity
- C) The model must be retrained to use less VRAM
- D) VRAM can be supplemented with system RAM with no performance impact

**Answer: B**
When a model exceeds single-GPU VRAM, tensor parallelism splits the model across GPUs. This requires NVLink for acceptable inter-GPU communication bandwidth. PCIe-based parallelism introduces significant latency. This adds complexity in configuration, scheduling, and resource management.

---

### Q78
An architect needs to plan for GPU hours in a shared NAI environment. What is a "GPU hour"?

- A) The number of hours a GPU operates at maximum temperature
- B) One GPU running for one hour — used as a capacity unit for planning and chargeback (e.g., 4 GPUs for 6 hours = 24 GPU hours)
- C) The time required to download a model to GPU memory
- D) The latency of a single GPU inference request in hours

**Answer: B**
A GPU hour is a standard capacity measurement: one GPU allocated for one hour. It's used for capacity planning, budgeting, and chargeback in multi-tenant environments. For example, a 70B model using 4 GPUs running 24/7 consumes 4 × 24 = 96 GPU hours per day.

---

### Q79
An organization is evaluating whether to add a second NKP cluster for NAI or scale their existing cluster. What factors favor adding a second cluster?

- A) A second cluster is never beneficial
- B) Fault isolation (blast radius), geographic distribution for lower latency, regulatory requirements for data residency, and separate lifecycle management for different environments (dev vs prod)
- C) A second cluster doubles inference speed for all endpoints
- D) Kubernetes cannot scale beyond 5 nodes

**Answer: B**
A second cluster provides fault isolation (cluster-level failure doesn't affect the other), geographic proximity for global users, data residency compliance, and environment separation. Single-cluster scaling is simpler and more cost-effective when these requirements don't apply.

---

### Q80
An architect is designing an NAI deployment for a customer who will start with one 7B model and gradually expand to ten models including a 70B model. What is the BEST approach?

- A) Deploy the maximum GPU capacity needed on day one for all 10 models
- B) Start with GPU capacity for the initial model, design the architecture for horizontal scaling, and plan incremental GPU node additions as models are added
- C) Deploy all 10 models immediately on a single T4 GPU
- D) Use CPU-only nodes and add GPUs later

**Answer: B**
A phased approach aligns costs with actual usage. Start with sufficient GPUs for the initial workload, but design the NKP cluster architecture (node pools, storage, networking) to accommodate horizontal scaling. Add GPU nodes incrementally as new models are deployed, ensuring the cluster can grow to support the 70B model's multi-GPU requirements.

---

*End of NCP-AI 6.10 Part 3 — 80 Advanced Supplementary Questions*
