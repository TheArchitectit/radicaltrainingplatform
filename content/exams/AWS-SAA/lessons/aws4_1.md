# Design cost-optimized storage solutions (S4.1)

*Module S4.1 — AWS Solutions Architect Associate SAA-C03 study track. Independent study material — see the disclaimer at the end.*

Storage looks like the simplest line on a cloud bill and is usually the one people misread. The question that saves money is rarely "how many gigabytes do we have" — it is how much of that data is priced for the wrong access pattern, held for the wrong length of time, or moved when it did not need to move. This lesson builds the model for reading a storage bill and for choosing the service and the tier that fit the workload.

## What actually drives a storage bill

Four levers explain almost every cost question:

- **Capacity per GB-month** — the standing charge for data at rest. Cold storage classes are dramatically cheaper per gigabyte.
- **Requests** — every PUT, GET and LIST is metered. A workload reading millions of tiny objects can spend more on requests than on capacity.
- **Retrieval and minimum duration** — archive classes charge to read data back and require the data to stay for a minimum period; deleting early triggers an early-deletion charge.
- **Data transfer** — data leaving for the internet is billed, and cross-Region movement is billed, while some service-to-service paths are free.

A fifth lever behaves differently: **provisioned** capacity. EBS volumes with provisioned IOPS and file systems with provisioned throughput bill for what you reserved, used or not. Idle reservation is pure waste.

## Choosing the service before the tier

The access pattern picks the service:

- **Amazon S3** — object storage for unstructured data read over HTTP, effectively unlimited, and the only service with a genuine cold-archive tier.
- **Amazon EBS** — block storage attached to a single EC2 instance. A disk, not a share.
- **Amazon EFS** — a shared elastic file system for Linux clients across many instances.
- **Amazon FSx** — managed file systems for specific needs: Windows (SMB), Lustre for high-performance computing, NetApp, and OpenZFS.
- **AWS Storage Gateway** — a hybrid bridge presenting S3-backed storage to on-premises clients as files, volumes or virtual tapes.
- **AWS DataSync** — online, scheduled data movement for migrations and replication.
- **AWS Transfer Family** — managed SFTP, FTPS and FTP endpoints that land files directly in S3 or EFS.

## S3 storage classes and lifecycle rules

**S3 Standard** serves hot data. **S3 Intelligent-Tiering** moves objects between tiers automatically for a small monitoring fee, suiting data with unpredictable access. **S3 Standard-IA** and **One Zone-IA** cost less per gigabyte for infrequent reads; One Zone-IA gives up Availability Zone redundancy to go cheaper still. The archive family runs from **Glacier Instant Retrieval** (milliseconds) through **Glacier Flexible Retrieval** (minutes to hours) to **Glacier Deep Archive** (hours, lowest cost).

Minimum storage durations are the trap. Infrequent-access classes require 30 days, Glacier Instant Retrieval and Flexible Retrieval require 90, and Deep Archive requires 180. Transitioning eagerly is the classic mistake: an object deleted after ten days never earns back the cost of moving it.

**Lifecycle rules** automate the work — transition after N days, expire after N days, and abort incomplete multipart uploads. That last rule is easy to forget and quietly bills for fragments of failed uploads indefinitely.

## Cost controls and block storage choices

**Requester Pays** on an S3 bucket shifts request and data transfer charges to the caller, which suits a published dataset you do not want to fund. **Cost allocation tags** let Cost Explorer and the Cost and Usage Report break spend down by team or project; without them a shared account is one undifferentiated number. **Consolidated billing** pools usage across accounts and can reach volume discount thresholds sooner.

For EBS, match the volume to the workload. **gp3** is general-purpose SSD, cheaper than the older gp2 and able to scale IOPS independently of capacity. **io2** is for latency-critical databases that need sustained provisioned IOPS. **st1** is throughput-optimized HDD for streaming and log processing, and **sc1** is the coldest, cheapest HDD for data touched rarely. Snapshots are incremental, so a nightly snapshot costs only what changed since the last one.

## Worked example: three cost decisions

1. **A team stores 40 TB of compliance logs that are read only during audits, yet the bill shows S3 Standard.** A lifecycle rule moving objects to a Glacier class after 30 days is the fix. Buying more Standard capacity changes nothing about the standing charge.
2. **An application writes many small objects and the request line dwarfs the storage line.** Aggregate the writes — batch into fewer, larger objects — or move the hot path to a service that is not metered per request. Changing storage class does not reduce the number of requests.
3. **A nightly snapshot job appears to cost more than the volume it protects.** Snapshots are incremental, so growth like that points at a full-copy pattern or at orphaned snapshots left behind after their volume was deleted. Check for those and shorten the retention rule.

## Where this leads

Storage is now priced by access pattern. The next lesson applies the same discipline to compute, where the levers are purchasing options, instance sizing, and how long an idle resource is left running.

---

*This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.*
