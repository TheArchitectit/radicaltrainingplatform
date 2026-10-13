# Design secure access to AWS resources (S1.1)

*Module S1.1 — AWS Solutions Architect Associate SAA-C03 study track. Independent study material — see the disclaimer at the end.*

Before you can decide who may do what in AWS, you have to know where your responsibility ends and Amazon's begins. Most access questions on this exam are really questions about that line, and the answer is usually "the customer owns that part".

## The shared responsibility model

AWS secures **security of the cloud** — the buildings, the hardware, the hypervisor, and the internals of managed services. You secure **security in the cloud** — your data, your identities, your configuration, and your network rules. The split moves with the service: on a managed database AWS patches the engine and you control who connects, while on an EC2 instance you own the operating system and its firewall. The exam likes to place the boundary in the wrong spot, so "AWS will patch my EC2 instances" and "I must patch my RDS engine" are both wrong.

## Identities: users, groups, roles, and policies

Four things carry access in IAM:

- **Users** are long-lived identities, usually a person, with a password and optionally access keys.
- **Groups** are collections of users. Permissions attach to the group, so adding a hire is one membership rather than twenty policy edits.
- **Roles** have *no* permanent credential. A trusted principal assumes a role and receives temporary credentials from AWS Security Token Service (STS).
- **Policies** are JSON documents stating what is allowed. An identity-based policy attaches to a user, group, or role. A resource-based policy attaches to a resource — an S3 bucket policy, a KMS key policy, a queue policy — and can name principals in *other* accounts.

Reach for a role before a user: ask what a principal should assume, not what key it should hold.

## The root user

The root user can do anything, including closing the account, and cannot be restricted by IAM policy. Treat it as a break-glass account: enable multi-factor authentication immediately, never create access keys for it, and use it only for tasks that genuinely require it. If a scenario shows routine work being done as root, that is the defect being tested.

## Least privilege, and why it fails in practice

Least privilege means granting the smallest set of actions on the smallest set of resources for the shortest time. It fails predictably: someone hits `AccessDenied`, and the fix applied is to attach `AdministratorAccess` rather than add the one missing action. Keeping permissions in groups and roles means widening one thing widens it for the right people. **Permissions boundaries** set a ceiling on what a policy can grant, which is how you let a team manage its own roles without letting it escalate.

## Temporary credentials and cross-account access

When a principal assumes a role, STS returns short-lived credentials that expire, so a leaked temporary credential is worthless within the hour. Two patterns matter:

- **Cross-account access.** Account A defines a role trusting account B; a principal in B calls `sts:AssumeRole` and works in A. No keys are copied between accounts. For third parties, add an **external ID** condition so a confused-deputy attack cannot trick them into assuming your role.
- **Workload credentials.** An instance profile, an ECS task role, or a Lambda execution role supplies credentials that AWS rotates for you. Hard-coded keys in an AMI, user data, or a config file are the anti-pattern these questions hunt for.

## Many accounts: Organizations, Control Tower, and SCPs

A serious AWS estate is many accounts, grouped into **organizational units** inside AWS Organizations. **Service control policies (SCPs)** attach to an OU and define the maximum permissions for everything inside it — including the account's own administrators. An SCP denying `cloudtrail:StopLogging`, or denying resource creation outside the permitted Regions, cannot be undone by a local admin. AWS Control Tower layers guardrails and account provisioning on top. Remember the ceiling idea: an SCP never *grants*, it only removes.

## Worked example: three small decisions

1. **Developers keep long-lived access keys in a shared file, and leadership wants them gone without changing how people sign in.** Federate the corporate directory through IAM Identity Center and issue temporary credentials via permission sets. Tightening the password policy, or moving the same keys into Secrets Manager, leaves the long-lived credential in place.
2. **A workload in one account must read a bucket in another, and no keys may be distributed.** Give the instance a role through an instance profile and have the bucket policy trust that role. Embedding an IAM user's key in user data, or making the bucket public with an IP condition, both fail the requirement.
3. **Leadership wants a guardrail no account administrator can remove.** Attach an SCP to the organizational unit. A permissions boundary is per-principal and locally editable, and an AWS Config rule reports drift after the fact but does not prevent it.

## Where this leads

You now know who may act and with what credentials. The next lesson moves outward to the network and the application: how traffic is contained, how it is inspected, and how secrets and customer identities are handled.

---

*This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.*
