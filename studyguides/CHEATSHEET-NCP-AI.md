# NCP-AI 6.10 — AI Infrastructure Cheat Sheet

> **Last-night review** · GPU sizing · NAI architecture · Model formats · MLOps pipeline

---

## NAI (Nutanix AI) Architecture

| Component | Role |
|---|---|
| **GPT-in-a-Box** | Turnkey AI appliance — runs LLMs on Nutanix HCI (on-prem, air-gapped capable) |
| **vLLM** | Default inference engine — PagedAttention, continuous batching, high throughput |
| **NKP** | Nutanix Kubernetes Platform — container orchestration for AI/ML workloads |
| **Prism Central** | Management plane — deploy NAI endpoints, monitor GPU utilization |
| **Hugging Face** | Default model hub integration — download models directly in NAI |

### GPT-in-a-Box Flow
```
User → NAI Endpoint (API) → vLLM Inference Engine → GPU(s) → Response
         ↑ managed via Prism Central / NKP
```

### NKP Architecture
- **Based on Kubernetes** — managed K8s clusters on Nutanix infrastructure
- **NKP deploys** NAI inference workloads as pods with GPU resource requests
- **Persistent volumes** backed by Nutanix CSI driver (Volumes/Files)
- **GPU Operator** manages NVIDIA drivers/container toolkit inside K8s
- **Ingress/LoadBalancer** exposes model endpoints externally

---

## Supported Model Formats (EXAM CRITICAL)

| Format | Supported? | Notes |
|---|---|---|
| **SafeTensors** | ✅ YES | Preferred — safe, fast loading, no arbitrary code execution |
| **GPTQ** | ✅ YES | Post-training quantization (INT4/INT8), GPU-only inference |
| **AWQ** | ✅ YES | Activation-aware quantization, better accuracy than GPTQ at same bit-width |
| **GGUF** | ❌ NO* | *Not supported for exam purposes* — CPU-focused (llama.cpp) |

> ⚠️ **Trap answer:** GGUF is NOT a valid answer on this exam.

---

## GPU Sizing — Memory Per Parameter

| Precision | Bytes/Param | Formula | Use Case |
|---|---|---|---|
| **INT4** | **0.5** bytes | Params(B) × 0.5 GB | Aggressive quantization, edge deploy |
| **INT8** | **1** byte | Params(B) × 1 GB | Good balance speed/accuracy |
| **FP16 / BF16** | **2** bytes | Params(B) × 2 GB | Training, fine-tuning, full precision inference |
| **FP32** | **4** bytes | Params(B) × 4 GB | Reference/debug only, rarely used |

### Quick Sizing Examples
| Model | FP16 VRAM | INT8 VRAM | INT4 VRAM |
|---|---|---|---|
| 7B params | 14 GB | 7 GB | 3.5 GB |
| 13B params | 26 GB | 13 GB | 6.5 GB |
| 70B params | 140 GB | 70 GB | 35 GB |

> **Rule of thumb:** Add ~20% overhead for KV cache, activations, framework

---

## GPU Card Reference (MUST MEMORIZE)

| GPU | VRAM | MIG | NVLink | Key Notes |
|---|---|---|---|---|
| **T4** | **16 GB** | ❌ No | ❌ No | Inference only, low power (70W), Turing arch |
| **L40S** | **48 GB** | ❌ No | ❌ No | Ada Lovelace, good inference + light training |
| **A100** | **40 or 80 GB** | ✅ **7 instances** | ✅ Yes | Ampere, data center workhorse |
| **H100** | **80 GB** | ✅ Yes | ✅ **NVLink 4.0 (900 GB/s)** | Hopper, **Transformer Engine (FP8)**, fastest |

### Key Distinctions
- **MIG (Multi-Instance GPU):** Partition 1 GPU into isolated instances — **A100 = up to 7, H100 = up to 7**
- **NVLink:** High-speed GPU-to-GPU interconnect — needed for **multi-GPU model sharding** (tensor parallelism)
- **H100 Transformer Engine:** Hardware-accelerated FP8 — **2× throughput** vs FP16 for transformer models
- T4 and L40S have **NEITHER** MIG nor NVLink

---

## GPU Passthrough (EXAM CRITICAL)

| Feature | GPU Passthrough | vGPU (GRID) |
|---|---|---|
| Performance | Full native | Near-native (slight overhead) |
| **Live Migration** | ❌ **NOT possible** | ✅ Possible |
| VM-to-Host | **Pinned to specific host** | Can float |
| Sharing | 1 GPU = 1 VM | 1 GPU = multiple VMs |
| Use Case | AI inference, training | VDI, shared workloads |

> ⚠️ **GPU Passthrough = VM pinned to host = NO live migration.** This is a frequent exam question.

---

## Quantization Types

| Type | Method | When to Use |
|---|---|---|
| **GPTQ** | Post-training, layer-by-layer, calibration dataset | When you need GPU-only INT4/INT8, broad model support |
| **AWQ** | Activation-aware weight quantization | Better accuracy than GPTQ at same precision, newer models |
| **INT4** | 4-bit integer | Maximum compression, edge/small GPU deployment |
| **INT8** | 8-bit integer | Balance of size and accuracy |
| **FP8** | 8-bit floating point | **H100 only** (Transformer Engine), training + inference |

---

## MLOps Pipeline Stages

```
Data Collection → Data Prep → Feature Engineering → Model Training
    → Model Evaluation → Model Registry → Model Deployment (NAI/vLLM)
    → Monitoring & Feedback → Retrain (loop)
```

### Model Lifecycle
1. **Develop** — experiment, train, fine-tune
2. **Register** — version in model registry
3. **Deploy** — NAI endpoint via NKP
4. **Monitor** — latency, throughput, drift detection
5. **Retire/Update** — replace with new version

---

## Key Ports

| Port | Service |
|---|---|
| **9440** | Prism Element / Central (HTTPS) |
| **9080** | Prism HTTP (redirect) |
| **443** | NAI API endpoints (HTTPS) |
| **6443** | Kubernetes API Server (NKP) |
| **8443** | NKP Dashboard |

## Prism Navigation Paths

| Task | Path |
|---|---|
| Deploy NAI | Prism Central → Services → NAI → Create Endpoint |
| View GPUs | Prism Central → Hardware → GPUs |
| NKP Clusters | Prism Central → Kubernetes → Clusters |
| Monitor Inference | NAI Dashboard → Endpoints → Metrics |

---

## Quick Recall Mnemonics

- **Model formats:** "**SAG** — SafeTensors, AWQ, GPTQ" (not GGUF!)
- **GPU memory:** "**Half-One-Two**" → INT4=0.5, INT8=1, FP16=2
- **MIG GPUs:** Only **A**100 and **H**100 (**AH** = "Ah, those have MIG!")
- **NVLink GPUs:** Same — **A**100 and **H**100 only
- **Passthrough:** "**Pass** on migration" = no live migration
