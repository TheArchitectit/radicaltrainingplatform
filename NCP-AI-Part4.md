# NCP-AI 6.10 Practice Exam - Part 4
## 80 Multiple-Choice Questions

---

## STANDARD MCQ (Questions 1-60)

### Q1
A customer wants to fine-tune a 70B parameter model using 4-bit quantization on Nutanix AI. They need to understand the VRAM requirement per GPU. Assuming the model needs 70B parameters × 0.5B per parameter (INT4), plus 40GB for optimizer state and batch processing, what is the minimum GPU required?

- A) NVIDIA T4 (16GB) - insufficient
- B) NVIDIA L40S (48GB) - insufficient  
- C) NVIDIA A100 (80GB) - sufficient
- D) NVIDIA H100 (80GB) - sufficient, but requires MIG partitioning

**Answer: C**
INT4 quantization of 70B model = 35GB base + 40GB overhead (optimizer state, batch processing, activations) = 75GB total. The A100 with 80GB provides the minimum single-GPU VRAM needed with adequate headroom, while T4 and L40S lack sufficient capacity. H100 can also work but does not require MIG partitioning for this use case (MIG would be necessary only for splitting across multiple smaller partitions).

---

### Q2
Which of the following best describes the primary role of the NAI Operator in a Nutanix AI deployment on NKP (Nutanix Kubernetes Platform)?

- A) It handles all GPU scheduling and CUDA version management directly on nodes
- B) It manages the lifecycle of NAI components including model serving, API endpoints, and controller reconciliation
- C) It provides persistent storage exclusively through NFS integration
- D) It replaces Helm and manages all Kubernetes manifests manually

**Answer: B**
The NAI Operator is a Kubernetes operator that watches for custom resources and reconciles the desired state, managing model serving deployments, API endpoints, and other NAI lifecycle aspects. GPU scheduling is Kubernetes' responsibility via node selectors.

---

### Q3
A customer deploys a Llama 2 13B model in FP16 format on NAI. What is the approximate VRAM requirement for the model weights alone?

- A) 13GB
- B) 26GB
- C) 52GB
- D) 104GB

**Answer: B**
FP16 (half-precision) = 2 bytes per parameter. 13B parameters × 2B = 26GB for model weights only, before accounting for KV cache or optimizer state.

---

### Q4
When configuring a model serving deployment on NAI, which inference engine would you select if you need the broadest LLM support with Python-based optimization and moderate performance requirements?

- A) TensorRT-LLM compiled with ONNX runtime
- B) vLLM with PagedAttention optimization
- C) NVIDIA Triton without PagedAttention
- D) JAX-based inference server

**Answer: B**
vLLM is Python-based, supports a wide range of models, and uses PagedAttention for efficient KV cache management. TensorRT-LLM is more specialized and requires compilation; it's better for maximum performance but narrower model support.

---

### Q5
A NAI deployment requires GPU passthrough for a specialized ML workload. You notice the GPU is not detected inside the pod despite being assigned to the node. Which is the MOST likely cause?

- A) The node lacks nvidia.com/gpu node selectors
- B) NVIDIA container toolkit is not installed or NVIDIA drivers are outdated on the node
- C) The pod is using a non-NVIDIA container image
- D) The NAI Operator hasn't been updated to latest version

**Answer: B**
GPU passthrough requires NVIDIA drivers and the container runtime to support GPU access. Without proper drivers or container toolkit, the GPU won't appear inside containers despite passthrough being configured.

---

### Q6
Which model format is preferred for quantized inference on NAI when using vLLM, offering broad framework support and excellent compression?

- A) ONNX only
- B) SafeTensors, GPTQ, and AWQ (quantized formats optimized for vLLM)
- C) Raw PyTorch pickles
- D) TensorFlow SavedModel

**Answer: B**
vLLM natively supports SafeTensors, GPTQ, and AWQ formats, which provide excellent compression and framework compatibility. While GGUF is a popular quantized format, it's primarily designed for llama.cpp rather than vLLM. vLLM's optimization focuses on the aforementioned formats for maximum performance and compatibility.

---

### Q7
An organization implements NAI with OpenAI-compatible API endpoints. What is the correct endpoint path for sending a completion request that returns token usage information?

- A) /v1/chat/completions
- B) /v1/completions
- C) /v1/models
- D) /v1/tokens

**Answer: A**
The /v1/chat/completions endpoint is the standard OpenAI-compatible endpoint for chat-based completions and returns detailed token usage metrics. The /v1/completions endpoint is for older completion models.

---

### Q8
A model deployment on NAI experiences OOM (Out of Memory) errors during inference. The model is Mistral 7B in FP16 (14GB), but 4 concurrent requests cause failure on a V100-class 32GB GPU. What is the most likely issue?

- A) FP16 precision is too low for this model
- B) KV cache accumulation with batch size 4 exceeds available VRAM
- C) The model requires INT4 quantization regardless
- D) The GPU is faulty

**Answer: B**
With batch size 4, KV cache (key-value tensors from attention layers) accumulates significantly, easily consuming 18-20GB additional VRAM on top of the 14GB model, exceeding 32GB total. Reducing batch size or enabling PagedAttention would help.

---

### Q9
NAI deployments require persistent storage for model artifacts. Which Nutanix component provides Kubernetes-compatible persistent volumes?

- A) Nutanix Prism Central storage policy management
- B) Nutanix CSI (Container Storage Interface) driver
- C) Nutanix NTNX volumes mounted directly
- D) Kubernetes hostPath only

**Answer: B**
The Nutanix CSI driver integrates Nutanix storage with Kubernetes, providing PersistentVolumes for model artifacts, datasets, and logs. hostPath is not recommended for production due to node affinity limitations.

---

### Q10
When using the Nutanix CSI driver with NAI model deployments, which statement accurately describes the workflow?

- A) All models must be pre-downloaded to node local storage before pod creation
- B) PersistentVolumes are dynamically provisioned on Nutanix storage, mounted at pod startup
- C) The CSI driver only supports read-only volumes
- D) Models must be stored in HDFS

**Answer: B**
The CSI driver dynamically provisions Nutanix storage volumes, which are mounted into pods at startup. This enables flexible model management without node-local storage constraints.

---

### Q11
A customer has trained a 30B parameter model with LoRA fine-tuning for domain adaptation. After quantizing to INT8 (1B per parameter), what is the approximate base model size plus LoRA adapter overhead?

- A) 15GB base + 5GB adapter = 20GB
- B) 30GB base + 5GB adapter = 35GB
- C) 30GB base + 1GB adapter = 31GB
- D) 60GB base + 10GB adapter = 70GB

**Answer: C**
Base model: 30B × 1B (INT8) = 30GB. LoRA adapters are typically 1-2% of base model size, so ~0.3-0.6GB. Total ~31GB. LoRA doesn't require full optimizer state at inference time.

---

### Q12
You're deploying vLLM on NAI with a 13B model and notice inference throughput is suboptimal despite sufficient VRAM. Which vLLM feature directly addresses KV cache memory pressure and batch size limitations?

- A) Mixed precision training
- B) PagedAttention (virtual paging for KV cache)
- C) Tensor parallelism only
- D) Beam search optimization

**Answer: B**
PagedAttention pages KV cache blocks like OS virtual memory, allowing larger batch sizes and higher throughput by managing VRAM more efficiently than traditional dense KV storage.

---

### Q13
A NAI model serving deployment must support OpenAI SDK as a drop-in replacement. What is the minimum configuration change to the client code?

- A) Rewrite all API calls to use gRPC
- B) Change base_url to the NAI OpenAI-compatible endpoint; Bearer token auth
- C) Switch to a different API library entirely
- D) No changes needed; it works automatically

**Answer: B**
OpenAI SDK supports custom base_url and custom API keys (Bearer token). Setting `client = OpenAI(api_key="token", base_url="https://nai-endpoint")` enables drop-in compatibility with NAI.

---

### Q14
Your organization requires per-user API key management and audit logging for NAI API access. Which security mechanism aligns with this requirement?

- A) Single shared API key for all users
- B) Per-user API keys managed in Prism Central RBAC with API audit logging
- C) No authentication required for internal use
- D) Use Kubernetes secrets without RBAC

**Answer: B**
Nutanix Prism Central provides RBAC for per-user API key generation and rotation, with audit logging tracking all API requests by user. This satisfies compliance requirements for multi-user environments.

---

### Q15
A model serving pod fails with CrashLoopBackOff status. The most direct troubleshooting step is:

- A) Restart the entire NAI Operator
- B) Check pod logs and describe pod events for resource constraints or configuration errors
- C) Assume the model is incompatible and select a different model
- D) Increase node CPU to arbitrary high value

**Answer: B**
CrashLoopBackOff indicates the container is crashing repeatedly. `kubectl logs` and `kubectl describe pod` reveal the actual error (missing volume mount, insufficient memory requests, syntax errors, etc.).

---

### Q16
When configuring TensorRT-LLM for a 70B model on NAI, what additional step is required compared to vLLM?

- A) Dynamic batch size tuning at runtime
- B) Compilation of the model for target GPU architecture
- C) No difference; both use identical configuration
- D) Manual CUDA kernel writing

**Answer: B**
TensorRT-LLM requires an explicit compilation step that generates optimized CUDA kernels for the target GPU (A100, H100, etc.). This provides maximum performance but adds deployment complexity versus vLLM's dynamic approach.

---

### Q17
A NAI cluster with Kubernetes auto-scaling is configured with replica counts: min=2, max=10. During peak load, the API response time increases from 50ms to 500ms despite 6 active replicas. What is the FIRST troubleshooting step?

- A) Increase max replicas to 20
- B) Check individual pod performance metrics; the issue may be per-pod resource limits, not scaling
- C) Reduce min replicas to 1
- D) Disable auto-scaling

**Answer: B**
Slow responses despite sufficient replicas indicate individual pods are resource-constrained (CPU/memory limits, slow disk I/O for model loading). Scaling won't help if each pod is bottlenecked. Inspect resource requests/limits and pod metrics.

---

### Q18
Which Kubernetes primitive is used in NAI deployments to schedule GPU-requiring pods on appropriate nodes?

- A) PodPreset
- B) NodeAffinity with nvidia.com/gpu labels
- C) Namespace policies
- D) Service mesh routing

**Answer: B**
Kubernetes nodes with NVIDIA GPUs are labeled with `nvidia.com/gpu=true`. Pod node selectors or affinity rules match this label to ensure GPU pods run on GPU-capable nodes.

---

### Q19
A NAI deployment requires TLS encryption for API endpoints. Where is the certificate typically managed?

- A) Hardcoded in Python application code
- B) Kubernetes Secret mounted into the NAI pod, referenced by Ingress or NAI configuration
- C) NVIDIA driver manages TLS
- D) No TLS needed for internal Kubernetes communication

**Answer: B**
TLS certificates are stored in Kubernetes Secrets and referenced by Ingress objects or NAI service configuration, enabling secure external API access without hardcoding secrets.

---

### Q20
You're building a RAG (Retrieval-Augmented Generation) pipeline with NAI. Which components are essential?

- A) LLM inference endpoint + vector database for embeddings + retrieval mechanism
- B) LLM alone; retrieval is automatic
- C) Vector database only
- D) External GPUs not needed

**Answer: A**
RAG requires: (1) embedding model to vectorize documents, (2) vector store for similarity search, (3) LLM inference for generating responses. All three are essential for effective retrieval and generation.

---

### Q21
A customer deploys a model and configures an Ingress for the NAI API endpoint. After successful deployment, external clients cannot reach the endpoint despite pod logs showing normal operation. What is the most likely cause?

- A) The pod is crashing silently
- B) Ingress routing rules don't match the service port or hostname
- C) Models don't support Ingress
- D) The NAI cluster is misconfigured at the operator level

**Answer: B**
Ingress routes external traffic to Kubernetes services based on hostname and path rules. Mismatched port numbers, hostname rules, or missing service selector bindings prevent traffic from reaching the pod.

---

### Q22
For a 7B parameter model in FP16, which GPU can comfortably support it with room for KV cache and batch processing?

- A) NVIDIA T4 (16GB)
- B) NVIDIA L40S (48GB)
- C) NVIDIA A100 (80GB)
- D) All of the above

**Answer: B**
7B × 2B (FP16) = 14GB. L40S with 48GB provides ample headroom for 14GB model + 20-30GB KV cache and batch processing. T4's 16GB is too tight; A100/H100 are overkill for this size.

---

### Q23
A NAI model update requires rolling new container images without downtime. What Kubernetes deployment strategy enables this?

- A) Delete old pod, launch new pod
- B) Readiness probes with rolling updates (RollingUpdateStrategy)
- C) Blue-green deployment requires cluster downtime
- D) Manual pod replacement one at a time

**Answer: B**
RollingUpdateStrategy progressively replaces old pods with new ones, using readiness probes to verify health before removing old replicas. This ensures zero-downtime updates.

---

### Q24
MIG (Multi-Instance GPU) partitioning on Nutanix AI is supported on which GPU types?

- A) T4 and L40S
- B) A100 and H100 only
- C) All NVIDIA GPUs support MIG
- D) MIG is not supported on any NAI GPU

**Answer: B**
Only A100 and H100 support MIG mode, dividing a single GPU into multiple isolated instances. Older generations like T4 and newer data center GPUs like L40S don't support MIG.

---

### Q25
When using MIG on an H100 with a 40B parameter model, you partition the GPU into two 40GB instances. What is a key constraint you must consider?

- A) MIG partitions can dynamically share memory between instances
- B) Each MIG instance is independently managed; a 40GB partition cannot borrow from the other
- C) MIG doesn't work on H100
- D) All H100 memory is shared regardless of MIG partition

**Answer: B**
MIG creates independent logical GPUs with isolated memory pools. A 40GB partition cannot access the adjacent partition's memory, so model size must fit within the partition size.

---

### Q26
A customer uploads a custom model to NAI via manual artifact upload. Which formats are immediately supported for inference without conversion?

- A) SafeTensors, GPTQ, and AWQ formats
- B) Raw PyTorch checkpoints only
- C) TensorFlow SavedModel exclusively
- D) All formats require conversion to ONNX first

**Answer: A**
SafeTensors (efficient tensor serialization), GPTQ (quantized), and AWQ (quantized) are directly supported by vLLM on NAI. GGUF is designed for llama.cpp and is not natively supported by vLLM or TensorRT-LLM. Raw PyTorch checkpoints require loading as Python objects.

---

### Q27
Which Nutanix component ensures LoRA fine-tuning adapters are properly versioned and retrieved during model serving on NAI?

- A) NVIDIA driver versioning
- B) Helm chart with ConfigMap for adapter registry
- C) Kubernetes CSI driver and PersistentVolume management
- D) Prism Central storage snapshots only

**Answer: C**
LoRA adapters are small files stored in PersistentVolumes via the Nutanix CSI driver. This provides versioning, retrieval, and management of adapter artifacts.

---

### Q28
A NAI cluster requires Prometheus monitoring for inference metrics. Which metric is most critical for performance troubleshooting?

- A) Pod restart count only
- B) Inference latency (p50, p95, p99) + token generation throughput + model memory usage
- C) Node CPU count
- D) Kubernetes API server uptime

**Answer: B**
For inference workloads, latency percentiles reveal user experience, throughput indicates efficiency, and memory tracks resource pressure. These directly correlate with model performance and scaling needs.

---

### Q29
When rotating API keys in a NAI multi-tenant environment, which best practice ensures uninterrupted access?

- A) Revoke old key immediately, generate new key
- B) Generate new key first, allow dual operation for a grace period, then revoke old key
- C) Disable RBAC during rotation to avoid lockout
- D) Keys never need rotation

**Answer: B**
Grace period rotation (overlap) prevents client lockout. Generate new key → communicate to users → allow both to work temporarily → retire old key after confirmed adoption.

---

### Q30
A model's inference is slow despite sufficient GPU VRAM. Prometheus metrics show low GPU utilization (~20%) and high I/O wait. What is the likely bottleneck?

- A) Model requires recompilation
- B) Slow model artifact loading from storage or slow PersistentVolume I/O
- C) Batch size is too small
- D) The GPU needs more VRAM

**Answer: B**
Low GPU utilization + high I/O wait indicates storage/I/O bottleneck (slow PersistentVolume, slow network storage). Model isn't starved for compute; it's starved for data. Optimize CSI driver, storage backend, or model caching.

---

### Q31
A customer needs to fine-tune a model using HuggingFace transformers on NAI. What is the recommended workflow?

- A) Run training directly in production pods
- B) Use a training pod with GPU, save model, store in CSI volume, then deploy for inference
- C) Training cannot be done on NAI
- D) Download model, train locally, manually reupload

**Answer: B**
NAI training pods run in isolated environments with GPU access, save results to Nutanix CSI volumes, then redeploy the trained model via the serving stack. This separates training from inference workloads.

---

### Q32
An NGC (NVIDIA GPU Cloud) model is imported into NAI via manual pull. Which statement is correct?

- A) NGC models are proprietary and cannot run on NAI
- B) NGC models (pre-optimized containers, weights) can be pulled, containerized, and deployed on NAI
- C) NAI automatically fetches NGC models without explicit import
- D) NGC models require special licensing for NAI use

**Answer: B**
NGC hosts optimized containers and model weights (quantized, compiled TensorRT-LLM, etc.). These can be pulled and deployed on NAI with proper licenses, offering performance advantages.

---

### Q33
A NAI Helm deployment fails with "nvidia.com/gpu resource not available" error. What is the root cause?

- A) Kubernetes version is too old
- B) NVIDIA GPU device plugin not installed or configured on the cluster
- C) Helm chart is outdated
- D) The cluster has no GPUs

**Answer: B**
The NVIDIA GPU device plugin is a Kubernetes DaemonSet that advertises nvidia.com/gpu as a schedulable resource. Without it, GPUs exist but aren't discoverable by the scheduler.

---

### Q34
SSE (Server-Sent Events) streaming is enabled for NAI chat completions. What is the primary benefit for users?

- A) Faster response times by 50%
- B) Token-by-token streaming for real-time output display (better UX, reduced perceived latency)
- C) Lower API cost
- D) No functional benefit; purely aesthetic

**Answer: B**
SSE streaming returns tokens as they're generated, enabling real-time display in client applications. Users see partial responses immediately rather than waiting for complete generation.

---

### Q35
Rate limiting is configured on NAI API endpoints (100 requests/minute per key). A client exceeds limits. What HTTP status code should the API return?

- A) 200 OK
- B) 404 Not Found
- C) 429 Too Many Requests
- D) 500 Internal Server Error

**Answer: C**
HTTP 429 indicates rate limit exceeded. Client should implement exponential backoff and retry after the delay specified in response headers.

---

### Q36
A deployed model requires inference across multiple GPUs (tensor parallelism). Which is true for vLLM?

- A) vLLM doesn't support tensor parallelism
- B) vLLM supports tensor parallelism via --tensor-parallel-size flag, splitting model across GPUs
- C) Tensor parallelism requires manual CUDA coding
- D) Only TensorRT-LLM supports tensor parallelism

**Answer: B**
vLLM's `--tensor-parallel-size` flag enables tensor parallelism, distributing model layers across multiple GPUs on the same node. This is simpler than TensorRT-LLM's approach.

---

### Q37
A customer requests function calling support via NAI OpenAI-compatible endpoints. Which model family natively supports this feature?

- A) Llama 2 (base model)
- B) GPT-3.5 and higher, or Mistral-Nemo, or open models fine-tuned for tool use
- C) All models support function calling automatically
- D) Function calling is not possible on open-source models

**Answer: B**
Function calling requires models trained with tool-use instructions (GPT models inherently, or open models like Mistral-Nemo fine-tuned for it). Base Llama 2 lacks this capability unless fine-tuned.

---

### Q38
An embeddings endpoint is deployed on NAI alongside an LLM. A client calls /v1/embeddings with a 1000-token document. What determines the output dimensions?

- A) GPU VRAM size
- B) Token count of input
- C) The specific embedding model used (e.g., BERT = 768D, NVIDIA e5-large = 1024D)
- D) OpenAI's default is always 1536D

**Answer: C**
Embedding model architecture (transformer layers, hidden size) determines output dimension, independent of input length or hardware. BERT ≈768D, e5-large ≈1024D.

---

### Q39
A NAI namespace isolates a customer's models and API keys from others. Which Kubernetes RBAC element enforces this isolation?

- A) Ingress policies alone
- B) NetworkPolicy and RBAC Role/RoleBinding scoped to the namespace
- C) Pod names are unique globally
- D) No isolation is possible on shared clusters

**Answer: B**
Kubernetes RBAC (Role, RoleBinding) and NetworkPolicy enforce namespace isolation, preventing cross-namespace API calls and resource access. ServiceAccounts are namespace-scoped.

---

### Q40
A model deployment has replica count = 3. One pod is evicted due to node failure. How does auto-scaling respond?

- A) Auto-scaling is disabled when a node fails
- B) The Deployment controller immediately spins up a replacement pod on a healthy node
- C) Manual intervention is required
- D) Replicas remain at 2 permanently

**Answer: B**
Kubernetes Deployment controller maintains desired replica count automatically. If a pod is evicted or node fails, a new pod launches on another available node.

---

### Q41
Certificate rotation for NAI TLS endpoints must occur every 90 days. Which approach integrates with Kubernetes Secret management?

- A) Manual certificate update to each pod
- B) cert-manager operator watches Kubernetes Secrets and auto-rotates before expiry
- C) Certificates never need rotation
- D) NVIDIA driver manages certificates

**Answer: B**
cert-manager is a Kubernetes operator that automates certificate lifecycle management (issuance, renewal, rotation) before expiry, storing certificates in Secrets.

---

### Q42
A model serving pod requests 8GB GPU memory but the node only has 6GB available. What happens?

- A) Kubernetes allows the pod to launch and GPU oversubscription occurs
- B) The pod remains Pending (unschedulable) until a node with 8GB is available
- C) The pod launches with reduced performance
- D) GPU memory is automatically borrowed from CPU RAM

**Answer: B**
Kubernetes checks resource requests before scheduling. If no node matches the request, the pod stays Pending in queue until a suitable node is available.

---

### Q43
A customer uses Nutanix Files NFS mount for model artifacts. Performance degrades when 5 concurrent pods load a 50GB model. What is the primary bottleneck?

- A) NFS is not suitable for model serving
- B) Network bandwidth saturation: 5 × 50GB concurrent reads overwhelm NFS network throughput
- C) NVIDIA drivers don't support NFS
- D) Pod CPU is insufficient

**Answer: B**
NFS uses network bandwidth for all I/O. Concurrent large model loads can saturate network, causing slowness. Solution: pre-cache models locally, use Nutanix iSCSI block storage, or implement read-only PersistentVolume replicas.

---

### Q44
When deploying a model via Helm on NAI, where are model URIs and hyperparameters specified?

- A) Hardcoded in Python source
- B) Helm values.yaml or ConfigMap referenced by pod
- C) NVIDIA environment variables only
- D) Kubernetes secrets exclusively

**Answer: B**
Helm charts use values.yaml to externalize configuration (model URI, inference engine, batch size, etc.). ConfigMaps provide runtime configuration, decoupling model artifacts from application code.

---

### Q45
A 13B model fine-tuned with LoRA is deployed. The base model and LoRA adapter are stored separately. At inference, what is loaded?

- A) Base model only; LoRA is ignored
- B) LoRA only; base model is not needed
- C) Base model weights merged with LoRA adapter at pod startup
- D) Both are concatenated without merging

**Answer: C**
During inference initialization, LoRA adapters are merged (injected into attention/MLP modules) with base model weights, creating an effective combined model. This merging happens once at startup.

---

### Q46
A customer requires audit logging of all API requests (model, user, timestamp, tokens) for compliance. Which component logs this?

- A) NVIDIA driver audit module
- B) NAI API server with structured logging to Kubernetes cluster log aggregator (Loki, ELK, etc.)
- C) Prism Central only
- D) Audit logs are not supported

**Answer: B**
NAI API endpoints log requests structured as JSON (model, user, timestamp, tokens, latency). Kubernetes log aggregators (Loki, ELK, Splunk) centralize these for audit trails and compliance reporting.

---

### Q47
A model checkpoint stored as SafeTensors is 60GB. After quantization to INT8, the new size is approximately:

- A) 15GB
- B) 30GB
- C) 40GB
- D) 60GB

**Answer: A**
Quantization reduces bit depth through the formula: params × bytes_per_param. FP32 → INT8 reduces from 4 bytes/param to 1 byte/param, a 4x reduction. For a 60B parameter model: 60GB (FP32) ÷ 4 = 15GB (INT8). Note: Actual file size may vary slightly depending on the model's original precision and metadata included in SafeTensors, but the 4x reduction factor for FP32→INT8 conversion is consistent.

---

### Q48
vLLM's PagedAttention optimization works by:

- A) Pre-allocating all KV cache at pod startup
- B) Paging KV cache blocks to disk during inference
- C) Dynamically allocating/deallocating KV cache pages in GPU VRAM as requests arrive and complete
- D) Disabling attention computation

**Answer: C**
PagedAttention manages KV cache in small pages, allocating only what's needed per request and deallocating when requests complete. This memory-efficient approach enables higher batch concurrency and reduces peak GPU memory usage. Unlike static pre-allocation (option A), PagedAttention avoids wasting memory on unused allocations, while remaining strictly on GPU (option B describes disk paging, which would be much slower).

---

### Q49
A Kubernetes pod fails with "ImagePullBackOff" status when deploying a custom NAI model container. What is the root cause?

- A) The container image doesn't exist at the specified registry path or pull credentials are missing
- B) GPU is not available
- C) Kubernetes version is incompatible
- D) The model file is too large

**Answer: A**
ImagePullBackOff indicates the pod failed to pull the container image—either the image name/tag is wrong, the registry is unreachable, or pull credentials (imagePullSecret) are missing.

---

### Q50
A NAI cluster is upgraded from vLLM 0.2 to 0.4. The deployment manifest references a specific vLLM version. How should you update it?

- A) No action needed; Kubernetes automatically uses latest version
- B) Update image tag in Deployment spec to 0.4, trigger rolling update
- C) Manually pull and rebuild containers
- D) Version upgrades are not supported

**Answer: B**
Update the container image tag in Deployment spec (e.g., `vllm:0.4-openai`), then Kubernetes applies a rolling update. Readiness probes ensure new version is healthy before removing old pods.

---

### Q51
A model's inference latency is 2 seconds per token on a single H100. A customer wants sub-second per-token latency. Which optimization is NOT directly applicable?

- A) Increase batch size to 32
- B) Enable PagedAttention to reduce memory pressure
- C) Use speculative decoding (draft model for faster prediction)
- D) Switch to smaller model (7B instead of 70B)

**Answer: A**
Increasing batch size improves *throughput* (tokens/second across all requests) but increases *latency* per request (more queuing). For single-request latency, batch size doesn't help. Speculative decoding, smaller models, or faster inference engines reduce latency.

---

### Q52
A customer's API key is exposed in a GitHub commit. What is the immediate remediation on NAI?

- A) No action needed; GitHub will hide it
- B) Immediately revoke the compromised key in Prism Central, generate new key, update clients
- C) Change only the RBAC role, keep the same key
- D) Keys cannot be revoked

**Answer: B**
Compromised keys must be revoked immediately in Prism Central (removes API access), then a new key is generated and distributed to clients. This prevents unauthorized API usage.

---

### Q53
A NAI pod has resource requests (GPU: 1, Memory: 16Gi) but limits (GPU: 1, Memory: 32Gi). The pod crashes after 10 minutes with OOM. What is the issue?

- A) Requests are too high
- B) Limits are too low; the running model consumes >32GB memory (model + batch + KV cache)
- C) GPU and memory limits must be equal
- D) Kubernetes misconfigured

**Answer: B**
Memory limit (32Gi) is the hard cap; exceeding it terminates the pod (OOM Kill). If model + KV cache + batch > 32GB, it will crash. Increase memory limit or reduce model size/batch size.

---

### Q54
TensorRT-LLM requires explicit compilation. What is the primary purpose of this build step?

- A) To convert model weights to ONNX format
- B) To generate optimized CUDA kernels for target GPU and model architecture
- C) To add NVIDIA driver support
- D) To apply quantization

**Answer: B**
TensorRT-LLM compilation generates hand-optimized CUDA kernels specific to the target GPU (A100, H100, etc.) and model structure (layer counts, dimensions), delivering maximum performance but reducing portability.

---

### Q55
A NAI deployment uses ServiceMonitor (Prometheus operator) to scrape metrics from model serving pods. What metrics are typically exposed?

- A) Pod creation timestamp only
- B) Inference latency, token throughput, model load time, GPU memory usage, request queue length
- C) Kubernetes API server metrics only
- D) Metrics are not supported in NAI

**Answer: B**
Model serving pods expose application-level metrics (latency percentiles, throughput) alongside resource metrics (GPU memory, CPU). ServiceMonitor defines scrape configuration for Prometheus collection.

---

### Q56
A model supporting function calling is deployed. The client sends a request with tools parameter. What must the model's response include?

- A) Plain text response only
- B) Structured response with tool_calls array (function name, arguments) and text; client executes tools, sends results back
- C) Immediate tool execution by the model
- D) Function calling doesn't involve responses

**Answer: B**
Function-enabled models return structured JSON with `tool_calls` (name, arguments) alongside optional text. The client executes the requested tool, then sends results back for model's next response iteration.

---

### Q57
A NAI cluster scales to 10 nodes, each with 4 × H100 GPUs. How many A100 GPU equivalents is this in terms of FP32 compute?

- A) 40 GPUs (not directly comparable)
- B) H100 ≈ 2× A100 performance, so 40 H100s ≈ 80 A100 equivalents
- C) H100s are slower than A100s
- D) Comparison is meaningless

**Answer: B**
H100 delivers roughly 2–3× the inference throughput of A100 depending on workload (A100 SXM FP32 ≈ 19.5 TFLOPS, H100 SXM FP32 ≈ 67 TFLOPS; for FP16 with Tensor Cores the gap widens further). So 40 H100s ≈ 80–120 A100 equivalents in compute. This helps capacity planning when mixing GPU types.

---

### Q58
An inference request specifies max_tokens=2000 for a 7B model. The API returns 2048 tokens. Why?

- A) max_tokens is not enforced
- B) max_tokens is a soft limit; the model stops at completion token or max_tokens, but may include special tokens beyond max_tokens
- C) The model is misconfigured
- D) 48 tokens were hallucinated

**Answer: B**
max_tokens typically limits generated content tokens, but special tokens (EOS, BOS) or token-counting differences can result in slightly more output tokens. True limit is approximately honored.

---

### Q59
A customer requires multi-language support (English, Mandarin, Spanish) for model inference. Which model characteristic is most relevant?

- A) GPU memory only
- B) Model tokenizer and training data language coverage (e.g., multilingual models like Llama 2-7B which support 6+ languages)
- C) NVIDIA driver version
- D) Kubernetes namespace count

**Answer: B**
Model's tokenizer and training data determine language support. Multilingual models (Llama 2, Mistral) have diverse language coverage; English-only models fail on other languages. Check model card for language support matrix.

---

### Q60
The NAI team monitors a 99th percentile latency (p99) SLO of 1 second. A spike occurs where p99 = 3 seconds. Prometheus shows:
- GPU utilization: 95%
- Memory: 80%
- CPU: 30%
- Network: 10%

What is the likely cause?

- A) Network congestion
- B) CPU bottleneck
- C) GPU compute or memory saturation (queue buildup, long kernel execution)
- D) Model is faulty

**Answer: C**
High GPU utilization and memory with low CPU/network indicate GPU is the bottleneck. Requests queue waiting for GPU, causing latency spike. Solution: reduce batch size, add GPUs, or enable model parallelism.

---

## "SELECT TWO" QUESTIONS (Questions 61-70)

### Q61
You need to troubleshoot poor inference performance on NAI. Which TWO of the following should you investigate FIRST?

- A) Kubernetes API server logs
- B) Prometheus metrics: GPU utilization, memory usage, inference latency percentiles
- C) NVIDIA driver debug symbols
- D) Model serving pod logs and application metrics (vLLM/TensorRT-LLM output)
- E) Prism Central license expiry

**Answer: B and D**
Pod logs and application metrics reveal model-level issues (OOM, slow generation), while Prometheus metrics show GPU/memory pressure and latency patterns. API server and driver logs are secondary; license issues are rare.

---

### Q62
A customer is planning a NAI deployment for a 13B parameter model with 100 concurrent users. Which TWO factors must be carefully sized?

- A) Number of Kubernetes namespace labels
- B) GPU VRAM (per-pod model + KV cache + batch size)
- C) Network bandwidth (model artifact download, API ingress)
- D) Kubernetes etcd database size
- E) Nutanix CSI storage throughput and capacity

**Answer: B and E**
GPU VRAM determines how many pods fit per node (concurrent batch × model size × overhead). Storage throughput affects model loading speed; capacity holds artifacts. Other factors are secondary for inference workloads.

---

### Q63
To achieve zero-downtime model updates in NAI, which TWO Kubernetes features must be configured?

- A) Service mesh (Istio, Linkerd)
- B) RollingUpdateStrategy with maxUnavailable/maxSurge tuned for gradual replacement
- C) Pod readiness probes that verify model is loaded and responsive
- D) NetworkPolicy to block old pods
- E) Helm hooks for pre/post-upgrade validation

**Answer: B and C**
RollingUpdateStrategy controls pod replacement rate (maxUnavailable=0 for zero downtime). Readiness probes ensure new pods are healthy before receiving traffic. Service mesh and NetworkPolicy are optional; Helm hooks are nice-to-have.

---

### Q64
NAI model serving requires both inference optimization AND API compatibility. Which TWO choices provide this?

- A) TensorRT-LLM with OpenAI endpoint wrapper
- B) vLLM with built-in OpenAI-compatible /v1/chat/completions endpoint
- C) Raw PyTorch inference server (custom development)
- D) NVIDIA Triton with OpenAI-compatible frontends (plugins/extensions)
- E) JAX compiled models

**Answer: A and B**
vLLM natively provides OpenAI-compatible endpoints. TensorRT-LLM requires wrapping (e.g., Triton or custom server) to add API compatibility, but achieves maximum performance. PyTorch and JAX require custom development.

---

### Q65
A NAI cluster requires HA (high availability) for production workloads. Which TWO infrastructure components are critical to redundancy?

- A) Multi-node Kubernetes cluster with pod anti-affinity
- B) Replicated Nutanix storage (RAID/redundancy) with CSI driver for pod persistence
- C) Single master node (costs less)
- D) Multiple master nodes in Kubernetes (3+ for etcd quorum)
- E) Shared NFS mount on one filer

**Answer: B and D**
HA requires: (1) redundant storage (Nutanix CSI with RAID protection), (2) redundant Kubernetes masters (3+ for HA etcd). Single NFS filer, single master, or single storage node creates SPOF (single point of failure).

---

### Q66
For a LoRA fine-tuning task on NAI, which TWO components are essential to manage?

- A) Base model weights (frozen during LoRA training)
- B) Adapter layers (trainable weights injected into attention modules)
- C) Optimizer state (stored in GPU memory during training)
- D) NVIDIA driver version
- E) Model input tokenizer (shared with base model)

**Answer: A and B**
LoRA training freezes base model weights, only trains adapter weights (small matrices in attention/MLP). These are the two managed components. Optimizer state, drivers, tokenizer are dependencies but not the core LoRA components.

---

### Q67
An organization requires per-tenant isolation on a shared NAI cluster. Which TWO Kubernetes constructs enforce this?

- A) Separate namespaces for each tenant with RBAC roles scoped to namespace
- B) NetworkPolicy restricting cross-namespace communication
- C) Pod labels (don't enforce isolation alone)
- D) Single shared namespace with naming conventions
- E) Kubernetes user accounts (no isolation benefit)

**Answer: A and B**
Namespaces isolate resources and RBAC prevents cross-tenant access. NetworkPolicy adds network-level isolation. Labels alone don't enforce security; shared namespaces eliminate isolation; user accounts ≠ isolation.

---

### Q68
You're optimizing vLLM for 1000 concurrent requests on a 13B model. Which TWO configurations directly address latency and throughput?

- A) PagedAttention for efficient KV cache utilization
- B) Increasing max_num_seqs (batch size) to maximize GPU utilization
- C) Quantizing model to INT4 (reduces latency at accuracy cost)
- D) Using speculative decoding with a draft model
- E) Increasing model parameter count

**Answer: A and B**
PagedAttention enables higher batch sizes by managing KV cache efficiently. Larger batches improve throughput. INT4 quantization and speculative decoding help specific scenarios but aren't universally optimal. More parameters worsen latency.

---

### Q69
NAI API security requires both authentication AND authorization. Which TWO mechanisms should be implemented?

- A) Bearer token (API key) authentication
- B) Per-user API keys with Prism Central RBAC roles (authorization)
- C) Firewall rules alone (insufficient)
- D) Shared API key (security risk)
- E) HTTP Basic Auth over unencrypted connections

**Answer: A and B**
Bearer tokens authenticate identity. Prism Central RBAC authorizes what each authenticated user can access (model, rate limits). Firewalls provide network security but not API-level auth. Shared keys and unencrypted Basic Auth are insecure.

---

### Q70
For disaster recovery of NAI deployments, which TWO are most critical?

- A) Daily backup of Helm release configurations and values
- B) Snapshot/backup of Nutanix CSI-managed PersistentVolumes containing model artifacts
- C) Regular testing of restore procedures in a non-production environment
- D) Manual documentation of all pod IP addresses
- E) Backup of Kubernetes etcd cluster state

**Answer: B and E**
CSI volume backups preserve models, data, and state. etcd backup preserves Kubernetes cluster config, deployments, secrets. Together they enable full recovery. Testing (C) is best practice but not a backup mechanism itself. Pod IPs change; manual docs are unreliable. Helm backups (A) help but require CSI + etcd to be useful.

---

## ORDERING/SEQUENCE QUESTIONS (Questions 71-80)

### Q71
You are deploying a new model version on NAI with zero-downtime requirements. What is the correct order of these steps?

1. Create new Deployment with updated image tag
2. Verify old pods are receiving no traffic
3. Gradually scale down old deployment replicas
4. Wait for readiness probes to pass on new pods
5. Update Ingress/Service to route to new deployment

- A) 1 → 3 → 5 → 4 → 2
- B) 1 → 4 → 5 → 3 → 2
- C) 5 → 1 → 4 → 3 → 2
- D) 1 → 4 → 3 → 5 → 2

**Answer: B**
First, create new deployment (1), wait for new pods to be ready (4), then route traffic via Ingress/Service (5). Once new pods are healthy and receiving traffic, scale down old deployment (3) and verify they're offline (2). Rolling updates with readiness probes simplify this, but the manual sequence is: new → healthy → route → retire → verify.

---

### Q72
A customer is setting up LoRA fine-tuning on NAI. What is the correct order of these phases?

1. Save merged model (base + LoRA adapter) to PersistentVolume
2. Load base model from Nutanix CSI volume
3. Initialize training pod with GPU, load training data
4. Create LoRA adapter layers (inject into attention modules)
5. Run training loop; update adapter weights via optimizer
6. Save LoRA adapter weights separately

- A) 2 → 3 → 4 → 5 → 6 → 1
- B) 3 → 2 → 4 → 5 → 6 → 1
- C) 2 → 4 → 3 → 5 → 6 → 1
- D) 2 → 3 → 4 → 5 → 1 → 6

**Answer: A**
Load base model (2), prepare training environment (3), inject trainable adapters (4), optimize during training (5), save lightweight adapter to storage (6), and merge with base for inference deployment (1).

---

### Q73
When troubleshooting GPU passthrough issues, what is the correct diagnostic sequence?

1. Check pod logs for CUDA errors
2. Verify NVIDIA drivers installed on node and at correct version
3. Inspect pod description for GPU resource allocation
4. Run nvidia-smi in a debug pod to detect GPU
5. Check node labels for nvidia.com/gpu=true

- A) 1 → 2 → 3 → 4 → 5
- B) 5 → 2 → 3 → 4 → 1
- C) 2 → 5 → 3 → 4 → 1
- D) 5 → 3 → 2 → 4 → 1

**Answer: B**
First, verify node is labeled GPU-capable (5). Then ensure drivers are installed (2). Check pod spec for GPU requests (3), run nvidia-smi to confirm detection (4), then examine logs for application errors (1).

---

### Q74
A NAI cluster certificate is expiring soon. What is the correct renewal sequence?

1. Revoke the old certificate
2. Deploy the new certificate to Kubernetes Secret
3. Trigger pod restart (new pods mount updated Secret)
4. Update cert-manager or manual renewal request
5. Verify TLS handshake succeeds with new cert

- A) 1 → 4 → 2 → 3 → 5
- B) 4 → 2 → 3 → 5 → 1
- C) 4 → 2 → 1 → 3 → 5
- D) 4 → 3 → 2 → 5 → 1

**Answer: B**
Request/generate new certificate (4), store in Kubernetes Secret (2), restart pods to use new cert (3), verify TLS works (5), then retire old cert (1). Revoke first would cause outage.

---

### Q75
Optimizing a slow inference pipeline on NAI. What is the logical troubleshooting sequence?

1. Profile model layers to identify slowest operations
2. Check baseline metrics (GPU util, memory, latency)
3. Apply optimization (PagedAttention, quantization, batch tuning)
4. Measure improvement against baseline
5. Identify bottleneck (GPU compute vs memory vs I/O)

- A) 1 → 2 → 5 → 3 → 4
- B) 2 → 5 → 1 → 3 → 4
- C) 2 → 1 → 5 → 3 → 4
- D) 5 → 2 → 1 → 3 → 4

**Answer: B**
Establish baseline (2), identify bottleneck type (5), dig deeper with profiling (1), implement optimization (3), measure results (4). This is a standard optimization cycle.

---

### Q76
Setting up multi-tenant NAI with isolation. What is the correct order of these configuration steps?

1. Create Role/RoleBinding for tenant, scoped to namespace
2. Create Kubernetes Namespace per tenant
3. Deploy NetworkPolicy to block inter-namespace traffic
4. Create tenant API key in Prism Central with Namespace-scoped RBAC
5. Configure CSI PersistentVolume claim in tenant namespace
6. Deploy model serving pod in tenant namespace

- A) 1 → 2 → 3 → 4 → 5 → 6
- B) 2 → 1 → 3 → 4 → 5 → 6
- C) 2 → 3 → 1 → 4 → 5 → 6
- D) 2 → 3 → 4 → 1 → 5 → 6

**Answer: C**
Create namespace first (2), enforce network isolation (3), define RBAC roles (1), provision API keys (4), setup storage (5), deploy workload (6). Storage and pods depend on namespace/RBAC existing.

---

### Q77
A model fails to load into vLLM, reporting memory error. What is the correct diagnostic order?

1. Reduce batch size and test
2. Calculate required VRAM: model size + KV cache estimate + batch overhead
3. Check pod memory requests/limits vs actual node available memory
4. Check model quantization level (FP32, FP16, INT8, INT4)
5. Examine vLLM logs for allocation failures
6. Increase GPU per pod or add more GPU nodes

- A) 4 → 5 → 2 → 3 → 1 → 6
- B) 2 → 4 → 5 → 3 → 1 → 6
- C) 5 → 4 → 2 → 3 → 1 → 6
- D) 5 → 2 → 4 → 3 → 1 → 6

**Answer: C**
Review logs first (5), determine model format (4), calculate required memory (2), check pod/node limits (3), reduce batch size as quick fix (1), scale infrastructure if needed (6).

---

### Q78
Rolling out a new vLLM version with feature improvements. What is the correct deployment sequence?

1. Build and tag new vLLM image: v0.4-custom
2. Push image to container registry
3. Update Deployment image field to new tag
4. Monitor rolling update progress with kubectl
5. Run smoke tests against new deployment
6. Update documentation with new features
7. Keep old image available for quick rollback

- A) 3 → 1 → 2 → 4 → 5 → 6 (with 7 throughout)
- B) 1 → 2 → 3 → 5 → 4 → 6 (with 7 throughout)
- C) 1 → 2 → 3 → 4 → 5 → 6 (with 7 throughout)
- D) 1 → 3 → 2 → 4 → 5 → 6 (with 7 throughout)

**Answer: C**
Build image (1), push to registry (2), trigger Kubernetes update (3), monitor progress (4), validate with tests (5), document changes (6). Always retain old image for rollback (7). Never delete old images immediately.

---

### Q79
Implementing disaster recovery for NAI. What is the correct preparation sequence?

1. Document all configuration (Helm values, RBAC, CSI storage classes)
2. Create automated backup of Kubernetes etcd
3. Create snapshots of Nutanix CSI PersistentVolumes (models, data)
4. Set up restore testing environment (isolated cluster)
5. Perform restore drill: rebuild cluster from backups
6. Document and automate restore procedures
7. Schedule monthly backup/restore validation

- A) 2 → 3 → 1 → 4 → 5 → 6 → 7
- B) 1 → 2 → 3 → 4 → 5 → 6 → 7
- C) 1 → 2 → 3 → 4 → 6 → 5 → 7
- D) 1 → 4 → 2 → 3 → 5 → 6 → 7

**Answer: B**
Document everything first (1), implement automated backups (2-3), setup isolated test environment (4), execute restore test (5), refine procedures (6), establish recurring validation cadence (7).

---

### Q80
A customer wants to add a second model (Mistral 7B) to an existing NAI deployment serving Llama 13B. What is the correct sequence of steps?

1. Allocate GPU resources (ensure sufficient VRAM on cluster)
2. Upload Mistral 7B model to Nutanix CSI volume
3. Create new Deployment/Pod for Mistral (separate from Llama)
4. Test inference on Mistral via API
5. Update OpenAI-compatible API gateway/router to serve both models (model selection in request)
6. Verify API backward compatibility for existing Llama clients
7. Update documentation with new model availability

- A) 2 → 1 → 3 → 4 → 5 → 6 → 7
- B) 1 → 2 → 3 → 4 → 5 → 6 → 7
- C) 1 → 2 → 3 → 5 → 4 → 6 → 7
- D) 1 → 3 → 2 → 4 → 5 → 6 → 7

**Answer: B**
Verify capacity (1), stage model artifacts (2), deploy infrastructure (3), validate workload (4), integrate routing (5), ensure existing clients still work (6), communicate changes (7).

---

## End of Exam

**Total Questions: 80**
- Standard MCQ: 60 (Q1-Q60)
- Select TWO: 10 (Q61-Q70)
- Ordering/Sequence: 10 (Q71-Q80)

**Topics Covered:**
1. GPU sizing and VRAM calculations
2. NAI architecture (NKP, Operator, Helm, CSI)
3. Model management (formats, quantization, LoRA)
4. Inference engines (vLLM vs TensorRT-LLM)
5. OpenAI-compatible API
6. Kubernetes operations (GPU selectors, storage, Ingress)
7. Troubleshooting (GPU detection, OOM, CrashLoopBackOff)
8. Operations (auto-scaling, certificate rotation, rolling updates, monitoring)
9. Integration (RAG, embeddings, function calling)
10. Security (RBAC, API keys, TLS, audit logging)

---
