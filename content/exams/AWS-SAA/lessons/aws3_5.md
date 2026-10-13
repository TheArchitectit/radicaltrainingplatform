# Determine high-performing data ingestion and transformation solutions (S3.5)

*Module S3.5 — AWS Solutions Architect Associate SAA-C03 study track. Independent study material — see the disclaimer at the end.*

Analytics sounds like a single problem, and that is why beginners reach for the wrong tool. It is really three: getting data in, changing its shape, and answering questions about it. The decisions that matter are about **frequency** — how often data arrives and how quickly it must be usable — and **format**, whether the data is laid out so a query can skip what it does not need.

## Ingestion: batch, streaming, and transfer

- **Streaming** — events arrive continuously and must be usable within seconds. **Amazon Kinesis Data Streams** is the ingestion layer: producers write records to a stream, and one or more consumers read them independently, each with its own position. A stream retains records for a configurable period, so several consumers can read the same stream for different purposes. **Amazon Data Firehose** is the managed delivery variant — you point it at a destination such as S3, Redshift, or OpenSearch and it batches and delivers.
- **Batch file arrival** — files land on a schedule. **AWS DataSync** moves file data between on-premises storage and AWS, or between AWS storage services, with scheduling, integrity verification, and bandwidth control.
- **Hybrid ingestion** — data must be written to AWS from systems that speak a local protocol. **AWS Storage Gateway** presents cloud storage as a local share, so applications keep working unchanged while the data lives in S3.

Frequency decides the architecture: minutes of staleness require streaming; hours allow a scheduled batch job, which is simpler and cheaper.

## Building the data lake

A data lake is S3 used as the single store for raw data, with structure applied at read time rather than write time.

- **Partition the data** by the columns you filter on most — commonly date — so a query reads only the relevant prefixes instead of scanning everything.
- **Convert to a columnar format.** Raw CSV is read row by row, so a query for one column still pays for every other column. **Apache Parquet** stores data by column and compresses it, so a query touching two columns of twenty reads roughly two columns of data — often the largest performance gain available in a data lake. **AWS Glue** performs the conversion.
- **Keep the raw copy.** Transformation is a judgement call, so retaining the original lets you re-derive the clean data when the logic changes.

**AWS Lake Formation** layers permissions on top: instead of writing bucket policies for each consumer, you grant access at the table and column level and let the service manage the underlying S3 permissions — the answer to "let the analytics team query two columns without exposing the rest".

## Transformation and cataloguing

**AWS Glue** is the extract, transform, and load service. Its **Data Catalog** holds the metadata other services use to find the data, and **crawlers** populate it automatically by inspecting data in S3. Glue jobs run on a managed Spark environment, so you do not run a cluster to transform a file.

## Querying, visualising, and processing

- **Amazon Athena** queries data directly in S3 with standard SQL, with no cluster to start and nothing to load. You pay per query based on bytes scanned — exactly why partitioning and Parquet matter. Athena suits ad-hoc analysis over data already in S3.
- **Amazon Redshift** is a warehouse for repeated, high-volume queries where data is loaded and tuned in advance.
- **Amazon Quick Suite** (Amazon QuickSight) is the visualisation layer: dashboards over Athena, Redshift, or other sources.
- **Amazon EMR** runs distributed frameworks such as Spark for heavy transformation. Its useful property is elasticity — **transient clusters** run a job and terminate when it finishes, so you pay for the processing window rather than an idling cluster.

Every ingestion path is an access point: scope IAM roles to the specific producer, and encrypt in transit and at rest.

## Worked example: four ingestion designs

1. **Sensor readings must be queryable within thirty seconds, and two teams need the same feed for different purposes.** Use **Kinesis Data Streams** with two consumers. A stream lets multiple consumers read independently; a queue would give each record to only one of them.
2. **Athena queries over a CSV data lake scan terabytes and cost far too much.** Convert the data to **Parquet** with **Glue** and partition it by date. Athena bills by bytes scanned, so a columnar format and partitions reduce both the time and the cost.
3. **An on-premises file server holds 40 TB that must be copied to S3 with verification and a bandwidth limit.** Use **AWS DataSync**. It verifies integrity and throttles bandwidth, which a simple copy script does not.
4. **The analytics team may query two columns of a table but must not see the rest.** Grant access through **Lake Formation** at the column level. A bucket policy cannot express a column-level restriction.

## Where this leads

This completes the high-performing domain. The next domain turns to the other half of the same decisions — designing the same architecture for cost, and recognising which performance choices are also the economical ones.

---

*This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.*
