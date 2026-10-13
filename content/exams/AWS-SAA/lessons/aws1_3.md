# Determine appropriate data security controls (S1.3)

*Module S1.3 — AWS Solutions Architect Associate SAA-C03 study track. Independent study material — see the disclaimer at the end.*

The first two lessons secured the door and the walls. This one is about what is inside: the data itself. Data controls are where compliance requirements turn into architecture: a regulation rarely says "use KMS", it says "encrypt personal data at rest, keep it for seven years, and prove who touched the keys".

## Classify before you protect

You cannot protect what you have not sorted. **Data classification** decides which data is public, internal, confidential, or regulated, and it drives every later choice: which bucket gets a customer managed key, which objects need a retention lock, which dataset Macie should scan.

Classification is also what makes a lifecycle policy defensible. Because the retention clock usually starts at creation rather than last access, lifecycle rules need a fixed age or date trigger rather than an assumption about usage.

## Encryption at rest and the KMS key hierarchy

**AWS Key Management Service (KMS)** is the centre of encryption at rest. A **customer managed key** is one you create, own the policy for, and control the rotation of. An **AWS managed key** is created for you by a service — convenient, but you cannot change its policy or share it across accounts; **AWS owned keys** are invisible entirely.

KMS uses **envelope encryption**: the data is encrypted with a data key, and the data key is itself encrypted under your KMS key. That is why a large S3 object does not send gigabytes to KMS — only the data key travels. It also explains why a KMS key is **Regional**: a key in one Region cannot decrypt data in another, so replicating encrypted data means re-encrypting in the destination.

For S3, the choices line up like this. **SSE-S3** encrypts with keys Amazon manages — fine as a baseline, useless if you must audit key usage. **SSE-KMS with a customer managed key** is the answer whenever the requirement mentions auditing key use, restricting who can decrypt, rotating on your own schedule, or sharing the key across accounts. **Client-side encryption** is for data that must never be readable by the storage service.

## Key policies, grants, and rotation

A **key policy** is the resource policy on a KMS key and it is authoritative: no IAM policy can grant access the key policy does not allow. That is why the most common KMS failure is an `AccessDenied` on a key whose policy never named the calling role. **Grants** are the lighter alternative: temporary, programmatic permission for one principal.

**Rotation** limits how much data a single compromised key version exposes. Customer managed symmetric keys rotate on a schedule (annually by default), and because the key ID stays the same, existing ciphertext keeps working; asymmetric keys do not rotate automatically. The exam rarely asks you to configure rotation — it asks whether you *can*, and with a customer managed key you can.

## Encryption in transit and certificates

Data in transit is protected with TLS, and the certificate lifecycle is the trap. **AWS Certificate Manager (ACM)** issues public certificates that **renew automatically** as long as ACM issued them and the validation record still exists — the classic failure is a DNS validation record deleted during a cleanup, after which renewal silently fails. Imported certificates are *not* renewed by ACM; you replace them yourself.

Placement matters too. A certificate for **CloudFront** must live in **us-east-1**, wherever the origin is, because CloudFront reads certificates from that Region; one for a regional load balancer lives in its own Region. ACM certificates cannot be exported, so if you need the private key elsewhere, ACM is the wrong service.

## Backups, replication, and recovery

**Multi-AZ** and **read replicas** keep a workload running; they do not let you rewind to yesterday. **Automated backups** give **point-in-time recovery** within a retention window. **AWS Backup** centralises backup policy across services and can copy recovery points into a **separate account**, which is how you survive a compromise that deletes backups too. **S3 Cross-Region Replication** copies objects to another Region for durability and locality, and requires versioning on both buckets.

## Worked example: three small decisions

1. **A regulation requires proof of who used each encryption key, plus customer-controlled rotation.** Use SSE-KMS with a customer managed key. SSE-S3 gives no policy control, and a key kept in application configuration is a credential in code.
2. **A database must be recoverable to any point in the last 30 days, and backups must survive compromise of the workload account.** Enable automated backups with 30-day retention and use AWS Backup with a cross-account vault. Multi-AZ and read replicas provide availability, not historical recovery.
3. **A CloudFront distribution must serve a certificate for a custom domain that renews itself.** Request the public certificate in ACM in us-east-1 and attach it to the distribution. A self-signed certificate is untrusted, an IAM server certificate does not auto-renew, and Secrets Manager is not a certificate binding for CloudFront.

## Where this leads

Domain 1 is complete: identities, networks, applications, and data. Domain 2 builds on it with resilience — keeping all of it running when a component, or an entire Availability Zone, fails.

---

*This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.*
