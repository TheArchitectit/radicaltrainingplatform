# Determine high-performing and scalable storage solutions (S3.1)

*Module S3.1 — AWS Solutions Architect Associate SAA-C03 study track. Independent study material — see the disclaimer at the end.*

Storage is the first place a design either holds up or falls over, because the shape of the data decides which services are even eligible. A complaint that arrives as "the database is slow" is often a storage problem wearing a costume: the volume ran out of input/output operations per second (IOPS), or a workload that needed to be shared was placed on storage that was never shared. This lesson is about the three shapes of data, and matching them to a service whose limits you can reason about before the load arrives.

## Three shapes: block, file, object

- **Block** storage presents a raw device made of fixed-size blocks. The operating system puts a filesystem on it and decides what the bytes mean. It is fast and familiar, and it is what a database or a boot disk wants. Amazon Elastic Block Store (Amazon EBS) and EC2 instance store are the block options.
- **File** storage presents a shared hierarchy of folders over a network protocol. Many machines mount the same filesystem and see the same files. Amazon Elastic File System (Amazon EFS) and Amazon FSx are the file options.
- **Object** storage presents a flat namespace of keys holding whole objects, reached over an HTTP API rather than mounted. Amazon Simple Storage Service (Amazon S3) is the object option, and it is effectively unbounded.

The failure mode to internalise: people reach for block storage when the requirement was really *shared*. An EBS volume attaches to instances in a single Availability Zone, so it is not the answer to "several instances across two zones must read the same files at once". That is EFS or FSx.

## Matching the service to the demand

- **Boot volume or database data for one instance** — EBS: block, low latency, snapshot-able.
- **Scratch space that is fine to lose on stop** — EC2 instance store: fastest, not persistent.
- **A filesystem shared by many Linux instances** — EFS: NFS, elastic capacity, multi-AZ.
- **A shared Windows filesystem with SMB** — Amazon FSx for Windows File Server.
- **High-throughput parallel reads for HPC** — Amazon FSx for Lustre.
- **Images, logs, static assets, a data lake** — S3: durable, scales without planning.

## The mechanics behind EBS performance

**General purpose SSD (gp3 and gp2).** With gp3 you choose IOPS and throughput independently of the volume size, so a small volume can still be fast. With gp2, performance is *tied to capacity*: a bigger volume is a faster volume.

**Provisioned IOPS SSD (io2).** You state the IOPS you need and pay for it, which is what a latency-sensitive database wants. Provisioned IOPS volumes also support **multi-attach**, letting a small cluster of instances in one Availability Zone share a volume — but multi-attach is not a general-purpose shared filesystem, because the instances must coordinate their own writes.

Hard disk volumes (st1 and sc1) trade latency for throughput and suit sequential work such as log processing, not random database reads.

## The mechanics behind S3 performance

S3 scales by spreading requests, and you help it by spreading your keys and your uploads:

- **Multipart upload** splits a large object into parts sent in parallel, which is faster and resilient to a failed part.
- **Transfer acceleration** routes uploads through edge locations, which helps when the uploader is far from the bucket's region.
- **Byte-range fetches** retrieve only the part of an object you need, so a large file can be read in parallel.

## Hybrid storage

When part of the estate stays on premises, **AWS Storage Gateway** presents cloud storage through interfaces the local systems already speak: File Gateway as an SMB or NFS share backed by S3, Volume Gateway as iSCSI block volumes, Tape Gateway as a virtual tape library. **AWS DataSync** handles migration and ongoing transfer, with scheduling, integrity checks, and bandwidth limits.

## Worked example: four symptoms

1. **A database on gp2 gets slower as the table grows, and the team keeps enlarging the volume.** That is expected on gp2, where IOPS scale with capacity. Move to **io2** (or gp3 with provisioned IOPS) so performance is stated directly rather than bought through size.
2. **Six Linux web servers in two Availability Zones must share uploaded files.** Choose **EFS**. An EBS volume cannot span zones, and a multi-attach volume is limited to one zone and one coordinating cluster.
3. **A nightly job uploads 200 GB of logs in one request and often restarts from zero.** Use **multipart upload**. Parallel parts finish sooner and a failed part is retried alone.
4. **A rendering farm needs scratch space faster than any network volume, and losing it on reboot is acceptable.** Use **EC2 instance store**, which is physically attached and therefore the fastest option, precisely because it is not durable.

## Where this leads

Storage is the foundation. The next lesson climbs one layer up to the compute that reads and writes it, and to the question of how much compute should be running at any moment.

---

*This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.*
