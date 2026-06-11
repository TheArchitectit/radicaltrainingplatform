# NCP-AI 6.10 Practice Exam — Part 5: Blueprint Gap-Fill
## 15 Targeted Questions for Coverage Gaps

---

## GAP 1 — Obj 1.2a: NKP vs Non-NKP Installation Comparison (Q1–Q3)

---

### Q1
An organization is evaluating whether to deploy Nutanix AI (NAI) on NKP or on a vanilla upstream Kubernetes cluster. Which capability is available **exclusively** when NAI is installed via the NKP App Catalog?

- A) Serving models through an OpenAI-compatible API endpoint
- B) One-click NAI installation, lifecycle management, and integrated upgrades through the NKP platform UI
- C) Using vLLM as the inference engine for LLM workloads
- D) Mounting persistent volumes via Nutanix CSI for model storage

**Answer: B**
The NKP App Catalog provides a GUI-driven, one-click install and upgrade experience that manages the NAI Operator lifecycle directly from the NKP management plane. Core inference features like the OpenAI-compatible API, vLLM engine, and Nutanix CSI storage are available regardless of whether NAI is deployed on NKP or vanilla Kubernetes.

---

### Q2
An administrator is deploying NAI on an upstream Kubernetes cluster that is **not** running NKP. Which installation method must they use?

- A) Deploy through the NKP App Catalog by adding the upstream cluster as a managed cluster
- B) Use `kubectl apply` with Helm charts and manually deploy the NAI Operator CRDs and manifests
- C) Install NAI directly from Prism Central's LCM (Life Cycle Manager) module
- D) Run the `nai-cli bootstrap` command, which auto-detects any CNCF-conformant cluster

**Answer: B**
Without NKP, the App Catalog is unavailable. The administrator must use kubectl and Helm to manually install the NAI Operator, apply CRDs, configure prerequisites (GPU Operator, CSI driver), and manage upgrades. Prism Central LCM manages AOS/AHV lifecycle, not Kubernetes workloads, and there is no standalone `nai-cli bootstrap` tool.

---

### Q3
A solutions architect is comparing NKP-based NAI deployment to a non-NKP kubectl-based deployment. Which statement accurately describes a difference between the two approaches?

- A) Non-NKP deployments cannot use NVIDIA GPU Operator; GPU scheduling must be configured manually through device plugins
- B) NKP deployments automatically handle NAI Operator version compatibility with the GPU Operator, whereas non-NKP deployments require the administrator to manually verify version compatibility
- C) Only NKP deployments support multi-node GPU clusters; non-NKP is limited to single-node inference
- D) Non-NKP deployments require a separate commercial license for vLLM since it is bundled only with NKP

**Answer: B**
NKP's App Catalog validates and enforces version compatibility between the NAI Operator, GPU Operator, and the NKP platform during install and upgrade. On non-NKP clusters, the administrator must manually consult the compatibility matrix and ensure all component versions align. Both deployment types support NVIDIA GPU Operator, multi-node inference, and vLLM without separate licensing.

---

## GAP 2 — Obj 3.3a: NAI Dashboard "Top 5 API Keys" Widget (Q4–Q5)

---

### Q4
An NAI platform administrator wants to identify which API keys are generating the most inference traffic across all deployed endpoints. Where in the NAI web UI should they look?

- A) The global NAI Dashboard, which includes a "Top 5 API Keys" widget showing the highest-usage keys by request count
- B) The Kubernetes Metrics Server dashboard accessible through NKP > Monitoring > GPU Utilization
- C) The individual endpoint detail page under the "API Keys" tab, which ranks keys by latency
- D) Prism Central > Analysis > AI Workloads, which aggregates API key usage across clusters

**Answer: A**
The NAI Dashboard (main overview page) includes a "Top 5 API Keys" widget that surfaces the API keys with the highest request volume across all endpoints. This provides a centralized view without requiring the administrator to inspect each endpoint individually. It is part of the NAI web UI, not Prism Central or the Kubernetes monitoring stack.

---

### Q5
Using the NAI Dashboard's "Top 5 API Keys" widget, an administrator notices that one API key accounts for 85% of total inference requests while the other four keys have roughly equal usage. What is the most appropriate operational response?

- A) Immediately revoke the high-usage API key since it is likely compromised
- B) Investigate the outlier key to determine if the usage pattern is expected (e.g., a production application) and consider applying rate limits or provisioning dedicated resources if needed
- C) Redistribute the requests evenly across all API keys by enabling the built-in NAI round-robin key balancer
- D) Ignore the disparity because the "Top 5" widget only reflects cached metrics and is not real-time accurate

**Answer: B**
The "Top 5 API Keys" widget is designed to help administrators detect usage outliers. A key consuming 85% of traffic may be legitimate (e.g., a high-volume production service) or may indicate misuse. The correct response is to investigate the source, validate the usage pattern, and apply rate limits or scale resources accordingly—not to revoke without investigation or assume the data is inaccurate.

---

## PARTIAL GAPS — Reinforcement Questions (Q6–Q15)

---

### Q6
*Obj 1.2b — NAI / NKP / GPU Operator Version Compatibility*

An administrator plans to upgrade NAI from version 1.0 to 1.1 on an existing NKP 2.12 cluster running GPU Operator 23.9. Before upgrading, what must the administrator verify?

- A) That NAI 1.1 is listed as compatible with both NKP 2.12 and GPU Operator 23.9 in the official NAI compatibility matrix
- B) That the Kubernetes API server version is at least v1.30, as NAI 1.1 requires the latest API deprecations
- C) That all running inference endpoints are deleted before the upgrade, since NAI does not support in-place upgrades
- D) That Prism Central is upgraded to the same version as NAI, since their release versions must match

**Answer: A**
NAI, NKP, and the GPU Operator each follow independent release cadences. The NAI compatibility matrix published in the documentation specifies which NAI versions are supported on which NKP and GPU Operator versions. Upgrading NAI without verifying this matrix can cause operator failures, GPU detection issues, or broken CRD schemas.

---

### Q7
*Obj 1.2b — NAI / NKP / GPU Operator Version Compatibility*

Which scenario would most likely cause a failed NAI deployment due to a version mismatch?

- A) Deploying NAI on an NKP cluster that uses Containerd instead of Docker as the container runtime
- B) Installing a newer version of the NVIDIA GPU Operator that is not yet validated against the installed NAI Operator version
- C) Using Nutanix Volumes instead of Nutanix Files for persistent model storage
- D) Running the NKP cluster on AHV instead of ESXi as the hypervisor

**Answer: B**
The NVIDIA GPU Operator and NAI Operator must be at validated, compatible versions. A newer GPU Operator may introduce CRD changes, different driver versions, or altered runtime behavior that the NAI Operator does not yet support, causing GPU detection failures or pod scheduling errors. Container runtime choice, storage backend, and hypervisor type are independent of the NAI/GPU Operator version contract.

---

### Q8
*Obj 1.3c — Validating Login to NAI Web UI After FQDN/Cert Setup*

After configuring a custom FQDN and TLS certificate for the NAI web UI, an administrator opens the FQDN URL in a browser and receives a "connection refused" error. Which step should they verify first?

- A) That the DNS A record for the FQDN resolves to the correct Ingress controller external IP and the Kubernetes Ingress resource for NAI references the correct TLS secret
- B) That the NAI license key has been re-entered after the FQDN change, as license validation is tied to the hostname
- C) That the TLS certificate's RSA key size is exactly 4096 bits, as NAI rejects 2048-bit certificates
- D) That Prism Central's SSL certificate matches the NAI FQDN certificate, since they share a trust chain

**Answer: A**
A "connection refused" error after FQDN/cert configuration typically indicates a DNS or Ingress misconfiguration. The administrator should confirm that the FQDN resolves to the Ingress controller's external IP and that the Ingress resource is correctly configured with the TLS secret containing the certificate and private key. NAI does not tie licensing to hostnames, does not mandate 4096-bit keys, and does not share a trust chain with Prism Central.

---

### Q9
*Obj 2.1b — NAI UI User Management: Creating Users*

An NAI administrator needs to onboard a new data scientist who requires access to deploy inference endpoints but should not be able to manage other users. What is the correct procedure in the NAI web UI?

- A) Navigate to the Users section in NAI, create a new user account, and assign the user a role that grants endpoint management permissions but not user administration privileges
- B) Create the user in Prism Central and enable the "AI Services" flag, which automatically syncs the user to NAI with full admin rights
- C) Ask the data scientist to self-register via the NAI login page, then approve the pending request in the admin queue
- D) Add the user's SSH public key to the NKP master node; NAI inherits Kubernetes RBAC automatically

**Answer: A**
The NAI web UI provides a dedicated Users management section where administrators can create user accounts and assign roles with specific permissions. This allows granular access control—granting endpoint management without user administration rights. NAI user management is handled within the NAI UI, not through Prism Central user flags or SSH key distribution.

---

### Q10
*Obj 2.1b — NAI UI User Management: Deactivating Users*

A team member has left the organization and the NAI administrator needs to revoke their access. What is the recommended approach in the NAI web UI?

- A) Deactivate the user account in the NAI Users section, which immediately revokes their access and invalidates any active sessions while preserving audit history
- B) Delete the user's Kubernetes namespace, which cascades the deletion to their NAI account and all associated endpoints
- C) Change the user's password to a random string and wait for their session token to expire naturally
- D) Remove the user from the NKP cluster's kubeconfig file, as NAI authenticates exclusively through Kubernetes service accounts

**Answer: A**
The NAI UI allows administrators to deactivate user accounts directly, which revokes access immediately and ensures that active sessions are invalidated. Deactivation (rather than deletion) preserves audit logs and historical records for compliance. Deleting Kubernetes namespaces or modifying kubeconfig does not affect NAI's internal user management, and changing passwords without deactivation leaves residual access.

---

### Q11
*Obj 2.2c — Adding HuggingFace/NGC API Tokens in NAI UI*

An administrator needs to download a gated model from Hugging Face Hub into NAI. Where in the NAI web UI should they configure the Hugging Face API token?

- A) In the NAI Settings or Model Repository configuration section, where external API tokens for Hugging Face Hub and NVIDIA NGC can be added and securely stored
- B) In the Kubernetes Secrets page of the NKP UI, by creating a secret named `hf-token` in the NAI namespace
- C) In Prism Central under Settings > API Keys > Third-Party Integrations
- D) In the model endpoint YAML manifest by adding the token as an inline environment variable

**Answer: A**
The NAI web UI provides a dedicated settings area where administrators can enter API tokens for external model registries such as Hugging Face Hub and NVIDIA NGC. These tokens are securely stored and used when pulling gated or licensed models. While Kubernetes secrets could work at a lower level, the supported and recommended approach is through the NAI UI's built-in token configuration.

---

### Q12
*Obj 2.4b — Viewing API Keys in Endpoint Detail Page*

An administrator wants to see which API keys have been assigned to a specific inference endpoint. Where in the NAI UI can they find this information?

- A) On the endpoint's detail page, which includes a widget or section listing all API keys currently assigned to that endpoint along with their usage metrics
- B) On the global NAI Dashboard under the "All API Keys" tab, filtered by endpoint name
- C) In the NKP Secrets manager, by searching for secrets with the label `nai-endpoint=<name>`
- D) In Prism Central > Services > AI Endpoints > API Key Mapping

**Answer: A**
Each endpoint's detail page in the NAI UI includes a section that shows the API keys assigned to that specific endpoint. This provides a focused view of which keys can access the endpoint, along with associated usage data. Administrators do not need to search through global dashboards or Kubernetes secrets to find endpoint-specific key assignments.

---

### Q13
*Obj 3.1a — "View Sample Code" Feature in NAI UI*

A developer has just been given access to an NAI inference endpoint and wants to quickly test it from their application. Which NAI UI feature helps them get started with minimal effort?

- A) The "View Sample Code" button on the endpoint page, which provides ready-to-use code snippets (e.g., Python, cURL) pre-populated with the endpoint URL and the correct API format
- B) The "Export Swagger" button, which downloads a full OpenAPI specification YAML that the developer must parse to construct requests
- C) The "Generate SDK" option, which compiles a custom Python package specific to the deployed model
- D) The "Interactive Playground" terminal embedded in the NAI UI, which provides a full Jupyter notebook environment

**Answer: A**
The NAI UI provides a "View Sample Code" feature on the endpoint page that gives developers ready-to-use code snippets in formats like Python and cURL. These snippets are pre-configured with the endpoint URL, correct headers, and the OpenAI-compatible API format, allowing developers to copy-paste and begin testing immediately without manually constructing API requests.

---

### Q14
*Obj 3.3b — Endpoint Detail Page Dashboard and Assigned API Keys*

An NAI administrator is troubleshooting slow response times on a specific model endpoint. On the endpoint's detail page dashboard, which combination of information is available to help diagnose the issue?

- A) Real-time inference metrics (latency, throughput, request counts) and the list of API keys assigned to the endpoint
- B) GPU core temperature readings and CUDA driver version for each node serving the endpoint
- C) A full packet capture (PCAP) download for the last 24 hours of endpoint traffic
- D) The Kubernetes scheduler logs showing pod placement decisions for the endpoint's replica set

**Answer: A**
The endpoint detail page dashboard in the NAI UI provides operational metrics such as inference latency, throughput, and request counts alongside the list of API keys assigned to that endpoint. This combination allows administrators to correlate performance issues with specific traffic sources. Low-level GPU diagnostics, packet captures, and scheduler logs are available through other tools but are not part of the NAI endpoint detail page.

---

### Q15
*Obj 3.4d — Deploying and Using Rerank Models in NAI*

An organization has deployed a RAG pipeline that retrieves documents from a vector database and passes them to an LLM. They want to improve answer quality by adding a reranking step. How can they accomplish this using NAI?

- A) Deploy a rerank model (e.g., a cross-encoder) as a separate NAI inference endpoint, then configure the RAG pipeline to call the rerank endpoint to re-score retrieved documents before sending the top results to the LLM
- B) Enable the "Auto-Rerank" toggle on the existing LLM endpoint, which automatically reranks all retrieved context chunks using the LLM itself
- C) Upload a reranking configuration JSON file to Nutanix Objects and reference it in the LLM endpoint's environment variables
- D) Replace the vector database with Nutanix Era, which has built-in semantic reranking capabilities

**Answer: A**
NAI supports deploying rerank models (such as cross-encoder models) as dedicated inference endpoints. In a RAG pipeline, the application first retrieves candidate documents from the vector database, then calls the rerank endpoint to re-score and reorder them by relevance, and finally sends only the top-ranked documents as context to the LLM endpoint. This two-stage retrieval approach significantly improves answer quality without modifying the LLM itself.

---

## Answer Key

| Question | Answer | Blueprint Objective |
|----------|--------|---------------------|
| Q1 | B | 1.2a — NKP vs non-NKP features |
| Q2 | B | 1.2a — Non-NKP installation method |
| Q3 | B | 1.2a — NKP vs non-NKP comparison |
| Q4 | A | 3.3a — Top 5 API Keys widget location |
| Q5 | B | 3.3a — Top 5 API Keys outlier detection |
| Q6 | A | 1.2b — Version compatibility matrix |
| Q7 | B | 1.2b — Version mismatch failure |
| Q8 | A | 1.3c — FQDN/cert login validation |
| Q9 | A | 2.1b — Creating users in NAI UI |
| Q10 | A | 2.1b — Deactivating users in NAI UI |
| Q11 | A | 2.2c — Adding HF/NGC API tokens |
| Q12 | A | 2.4b — Endpoint detail API keys |
| Q13 | A | 3.1a — View Sample Code feature |
| Q14 | A | 3.3b — Endpoint detail dashboard |
| Q15 | A | 3.4d — Rerank model deployment |

---

*End of NCP-AI 6.10 Practice Questions — Part 5: Blueprint Gap-Fill (15 Questions)*
