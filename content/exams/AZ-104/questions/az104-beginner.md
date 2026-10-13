# Microsoft Azure Administrator (AZ-104) — beginner track bank

*Independent study material — see the disclaimer at the end of each lesson. Every item here is original work written for this study pack; no vendor text was lifted.*

---

## Domain 1: Manage Azure identities and governance

---

### Q1
A newly created member user cannot be assigned a Microsoft 365 licence, and the error indicates the account has no location; what should you do?

- A) Convert the user to a guest user in the tenant
- B) Add the user to an administrative unit
- C) Set the user's usage location, then assign the licence
- D) Create a security group with dynamic user membership

**Answer: C**
Licences that depend on geography require the user's usage location to be set, so setting it and retrying the assignment resolves the error. Converting the user to a guest changes how they authenticate and does not supply a location. An administrative unit only narrows the scope of an administrator role, and a dynamic group does not set the missing property.

---

### Q2
You need a group that automatically contains every Windows device enrolled in the tenant and requires no manual maintenance; what should you create?

- A) A security group whose membership type is dynamic device
- B) A security group whose membership type is assigned
- C) A Microsoft 365 group with dynamic user membership
- D) An administrative unit scoped to the enrolled devices

**Answer: A**
Dynamic device membership matches devices by attribute rules, so the group maintains itself, and this membership type is available for security groups only. Assigned membership requires someone to add each device by hand. A Microsoft 365 group with dynamic user membership matches users rather than devices, and an administrative unit scopes administration instead of collecting devices for access.

---

### Q3
Your helpdesk must be able to reset passwords for users in one department only and nothing else in the directory; what should you do?

- A) Assign the helpdesk the User Administrator role at the tenant
- B) Place the department's users in an administrative unit and assign the role there
- C) Assign the helpdesk the Global Administrator directory role
- D) Create a dynamic security group for the department and assign the role to that group

**Answer: B**
An administrative unit narrows an administrator role to a defined set of objects, so the helpdesk can reset passwords for that department alone. The same role assigned at the tenant applies to every user in the directory. Global Administrator grants far more than password resets, and assigning a role to a group does not confine it to the department's users.

---

### Q4
Which statement correctly describes a guest user in a Microsoft Entra tenant?

- A) The tenant stores and manages the guest's password
- B) The guest authenticates with credentials from their home organisation
- C) The guest is removed from the directory when a subscription expires
- D) The guest cannot be added to a security group

**Answer: B**
A guest invited through B2B collaboration keeps their own home credentials, and the tenant holds a representation of the account rather than a password. The tenant does not store the guest's password. Guests are directory objects whose lifetime is independent of any subscription, and they can be added to security groups.

---

### Q5
A developer who holds the Contributor role on a resource group cannot grant a colleague access to that resource group; what should you do?

- A) Assign the developer the Reader role at the resource group as well
- B) Ask the developer to create the assignment with a different client
- C) Assign the developer the Owner role at the subscription
- D) Assign the developer User Access Administrator at the resource group

**Answer: D**
Contributor can manage resources but cannot create role assignments, and User Access Administrator at that resource group supplies exactly the missing permission. Adding Reader grants no access-management permission. Changing client makes no difference because the rule is enforced by the platform, and Owner at the subscription would work but grants far more than required.

---

### Q6
A user is Reader at the subscription and Contributor at a single resource group; what can the user do with resources in that resource group?

- A) Only view them, because the inherited Reader applies everywhere
- B) Manage them and grant access to other users
- C) Nothing, because conflicting assignments cancel each other out
- D) Manage them, but not grant access to other users

**Answer: D**
Effective access is the union of all assignments, so the Contributor grant at the resource group applies there. Contributor cannot create role assignments, so granting access to others remains impossible. Inherited access never cancels a more permissive grant made at a narrower scope, and assignments do not cancel one another.

---

### Q7
A user with the Owner role at a resource group still cannot modify a virtual machine in that group, and no resource lock exists; what is the most likely explanation?

- A) A deny assignment on the virtual machine overrides the Owner role
- B) The user's Owner assignment has not finished propagating
- C) The virtual machine belongs to a different subscription
- D) The Owner role does not include permission to modify virtual machines

**Answer: A**
Deny assignments take precedence over allow assignments regardless of role, and Azure creates them for managed applications and similar constructs. Role propagation is quick and would not block a single resource in isolation. A virtual machine belongs to the resource group that contains it, and Owner includes full management of resources.

---

### Q8
An administrator needs to create user accounts and manage groups in the directory; which type of role must be assigned?

- A) An Azure RBAC role at the subscription scope
- B) An Azure RBAC role at the management group scope
- C) A Microsoft Entra directory role
- D) The Owner role on the tenant root management group

**Answer: C**
Directory objects such as users and groups are governed by Microsoft Entra directory roles. Azure RBAC roles apply to Azure resources, so assigning one at any scope grants nothing over the directory. Owner on the root management group governs resources and access to them, not the creation of directory objects.

---

### Q9
A developer reports that the portal refuses changes to a storage account's configuration, yet the application still writes blobs successfully; what is the cause?

- A) A ReadOnly lock applies to the control plane only
- B) A CanNotDelete lock is blocking configuration changes
- C) The storage account firewall is rejecting portal requests
- D) The developer's Contributor role does not permit configuration changes

**Answer: A**
A ReadOnly lock freezes the resource's management settings while data-plane operations such as writing blobs continue, which matches the symptom exactly. CanNotDelete blocks deletion only, so it would not refuse a configuration change. A firewall affects network access rather than saving settings, and Contributor does permit configuration changes.

---

### Q10
A team must be prevented from deploying resources into any region except two permitted ones; what should you do?

- A) Create a budget on the subscription with an alert threshold
- B) Assign an Azure Policy definition with the Deny effect
- C) Apply a CanNotDelete lock to the subscription
- D) Assign the team the Reader role at the subscription

**Answer: B**
A policy assignment with the Deny effect refuses any deployment request that does not meet the rule, which is exactly the requirement. A budget reports spending and blocks nothing. A CanNotDelete lock prevents deletion rather than creation, and Reader would stop the team from deploying anywhere at all.

---

### Q11
Finance wants to be warned when a subscription's spending approaches a set amount each month; what should you create?

- A) An Azure Policy assignment with the Audit effect
- B) A cost tag applied to every resource group in the subscription
- C) A budget with an alert threshold on the subscription
- D) An Azure Advisor cost recommendation

**Answer: C**
A budget tracks actual and forecasted spend against a target and raises alerts at the thresholds you choose. A policy with the Audit effect reports configuration compliance rather than spending. Tags organise cost data but notify nobody, and Advisor returns recommendations instead of notifications tied to a spending limit.

---

### Q12
Which statement about tags in Azure is correct?

- A) Resources inherit tags from their resource group automatically
- B) Tags are copied from a resource group to resources at creation
- C) Tags are not inherited, and policy can enforce them on resources
- D) Tags on a subscription are inherited by every resource group

**Answer: C**
Tags are not inherited by default at any level of the hierarchy, which is why cost reports show untagged resources, and Azure Policy can require or append tags to close that gap. Resources do not receive their resource group's tags at creation or later, and subscription tags are not inherited by resource groups.

---

---

## Domain 2: Implement and manage storage

---

### Q13
Which two directory services can provide identity-based authentication for an Azure Files share?

- A) Microsoft Entra Domain Services
- B) On-premises Active Directory Domain Services
- C) A shared access signature issued for the share
- D) The storage account's access key

**Answer: A, B**
Identity-based access to Azure Files requires the storage account to be joined to a directory, and the two supported directories are Microsoft Entra Domain Services and on-premises Active Directory Domain Services. The other two options describe shared-secret mechanisms: a SAS and an access key both grant access to whoever holds the token or key and carry no notion of a user identity.

---

### Q14
All of an application's components currently read the storage account access key named key1, and you must rotate credentials without an outage. What should you do first?

- A) Regenerate key1 and immediately redeploy every component with the new value
- B) Regenerate key2, move all components to key2, and then regenerate key1
- C) Delete the storage account and recreate it with fresh keys
- D) Create a stored access policy on the container and issue SAS tokens to each component

**Answer: B**
Rotating the unused key first (key2) gives every consumer a working credential before the old one changes, so the cutover has no downtime; key1 is regenerated afterwards once nothing depends on it. Regenerating key1 first breaks every component at once, recreating the account destroys the data, and a stored access policy is a SAS-revocation mechanism rather than a way to rotate account keys.

---

### Q15
An application running in Azure must read blobs on behalf of signed-in users, and the security team requires that no storage account key be stored in the application. Which SAS type should you use?

- A) An account SAS generated from the storage account key
- B) A service SAS generated from the storage account key
- C) A user delegation SAS obtained with Microsoft Entra ID credentials
- D) A stored access policy attached to the container

**Answer: C**
A user delegation SAS is signed with Microsoft Entra ID credentials rather than the account key, so nothing secret has to live in the application and the token can be tied to the signed-in user. Account and service SAS tokens are both signed with an account key, which the requirement rules out, and a stored access policy is a container-level object that makes a service SAS revocable — it is not itself a SAS.

---

### Q16
A storage account is restricted to selected networks. Security now requires that traffic never traverse the account's public endpoint, and that on-premises clients reach the account over ExpressRoute. What should you configure?

- A) An IP network rule listing the on-premises public address range
- B) A service endpoint added to each virtual network subnet that needs access
- C) A firewall setting that allows access from all networks
- D) A private endpoint placed in the virtual network

**Answer: D**
A private endpoint gives the storage account a private IP address inside the virtual network, so clients use that address instead of the public endpoint, and on-premises clients reach it across ExpressRoute. An IP rule and a service endpoint both still use the public endpoint, and allowing all networks removes the restriction entirely rather than meeting the requirement.

---

### Q17
An application in a single Azure region must keep working through the loss of one availability zone, with no change to the storage endpoint it uses. Which redundancy option meets the requirement?

- A) Locally redundant storage (LRS)
- B) Geo-redundant storage (GRS)
- C) Zone-redundant storage (ZRS)
- D) Read-access geo-redundant storage (RA-GRS)

**Answer: C**
ZRS spreads copies across three availability zones in one region behind a single unchanged endpoint, which is exactly what surviving a zone failure requires. LRS keeps all copies in one datacenter, so a zone failure can take them all; GRS and RA-GRS replicate to a different region asynchronously and do not by themselves protect against a zone failure in the primary region.

---

### Q18
You configure object replication between a source container and a destination container in another account, but no blobs ever arrive at the destination. What is the most likely configuration gap?

- A) Blob versioning is not enabled on the accounts
- B) The two accounts are in different regions
- C) The source container has no stored access policy
- D) The two accounts use different performance tiers

**Answer: A**
Object replication requires blob versioning to be enabled on both the source and the destination, and a missing versioning setting is the usual reason replication appears to do nothing. Replicating across regions is expected rather than a problem, a stored access policy has nothing to do with replication, and differing performance tiers are not the blocker as long as both accounts are of a kind that supports block blobs.

---

### Q19
How is data protected at rest in an Azure storage account, and what does infrastructure encryption add?

- A) Platform-managed keys encrypt the data at rest, and infrastructure encryption adds a second, independent encryption layer
- B) Nothing is encrypted until the account owner enables encryption on each container
- C) Only data in transit is encrypted, and infrastructure encryption adds encryption at rest
- D) A customer-managed key is mandatory, and infrastructure encryption rotates that key on a schedule

**Answer: A**
Storage data is always encrypted at rest with platform-managed keys and this cannot be switched off, while infrastructure encryption applies a second layer of encryption at the infrastructure level. Encryption is not opt-in per container, data at rest is never left unencrypted by default, and customer-managed keys are an option for controlling the key rather than a requirement.

---

### Q20
A compliance review needs a blob that has sat in the archive tier for a year, and the reviewer wants to read it tomorrow morning. What should you do?

- A) Set the blob's tier to hot, which makes it readable straight away
- B) Rehydrate the blob to hot or cool and expect standard-priority rehydration to take several hours
- C) Copy the blob to a new container, which restores immediate read access
- D) Read the blob directly from the archive tier, since archive reads are merely slow

**Answer: B**
Archive blobs are offline, so they must be rehydrated to hot or cool before they can be read, and standard-priority rehydration typically takes hours — which still fits a next-morning deadline. Changing the tier to hot is itself a rehydration and is not instant, copying a blob within archive leaves it unreadable, and archive blobs cannot be read at all while they remain in that tier.

---

### Q21
An application writes telemetry records that are only ever appended to and read sequentially from the end of the stream. Which blob type should the container hold?

- A) Append blobs
- B) Block blobs
- C) Page blobs
- D) An Azure file share instead of blobs

**Answer: A**
Append blobs exist for exactly this pattern: data can only be added at the end, which suits logs and telemetry streams. Block blobs are optimised for whole-object writes and rewrites rather than sequential appends, page blobs are built for random 512-byte page access and back virtual machine disks, and a file share is an SMB or NFS surface rather than an append-oriented object store.

---

### Q22
What does an Azure Blob Storage lifecycle management rule let you do?

- A) Transition or delete blobs when conditions you define are met
- B) Encrypt blobs at rest with a customer-managed key
- C) Move blobs between storage accounts in different regions
- D) Change a container's public access level on a schedule

**Answer: A**
A lifecycle rule evaluates conditions such as days since last modification or last access and then moves blobs to a cooler tier or deletes them, including old versions and snapshots. Key management is handled by encryption settings rather than lifecycle rules, cross-account movement is object replication, and container access levels are a separate access control setting that lifecycle rules do not touch.

---

---

## Domain 3: Deploy and manage Azure compute resources

---

### Q23
You must redeploy a template that describes only a virtual machine into a resource group that also holds a storage account and a virtual network, and neither of those is mentioned in the template. Which deployment mode leaves them untouched?

- A) Complete mode, because it only acts on resources named in the template
- B) Complete mode, because it removes the template from the group after the run
- C) Incremental mode, because it changes only the resources the template describes
- D) Incremental mode, because it refuses to run when the group holds extra resources

**Answer: C**
Incremental mode is the default and reconciles only what the template names, so the storage account and network are left as they are. Complete mode is the opposite: it deletes resources present in the group but absent from the template, which is why both complete options are wrong. The fourth option describes behaviour that does not exist, since an incremental deployment does not inspect the group for extra resources.

---

### Q24
In an ARM template, what does the $schema property tell the deployment tooling?

- A) Which version of the template language the file should be read as
- B) Which resource provider should handle each resource in the file
- C) Which authoring revision of the file this is
- D) Which values must be supplied at deployment time

**Answer: A**
$schema selects the template language version used to parse the file, so a wrong or missing schema stops the tooling before any resource is attempted. The resource provider is selected by each resource's type and apiVersion, not by $schema. The authoring revision is contentVersion, and the values supplied at deployment time are parameters.

---

### Q25
You are about to run a deployment against a resource group that contains a database, and you want to see which resources the run would modify or delete before anything happens. What should you do next?

- A) Change the deployment mode to complete and run it
- B) Increase contentVersion and run the deployment again
- C) Export the resource group as a template and compare the two files by hand
- D) Run what-if for the deployment and read the predicted changes

**Answer: D**
What-if previews the create, modify, and delete actions a deployment would take, which is precisely the information needed before touching a database. Switching to complete mode would perform the deletions rather than preview them. Bumping contentVersion changes only an authoring label, and exporting the group compares documents without reporting what the engine would actually do.

---

### Q26
A virtual machine running a general-purpose size must be resized to a much larger memory-optimised size, and the resize request is rejected while the VM is running. What should you do?

- A) Attach an additional data disk and retry the resize
- B) Deallocate the virtual machine, then apply the new size
- C) Move the virtual machine to another resource group and retry
- D) Change the OS disk tier to Premium SSD and retry

**Answer: B**
A size the current host cannot provide requires the VM to be released so it can be placed on suitable hardware, so deallocation comes first. Adding a data disk changes storage, not the compute shape. Moving the VM between resource groups does not change which host it lands on, and raising the disk tier changes disk performance rather than the size of the machine.

---

### Q27
A virtual machine's operating system was shut down from inside the guest, and the administrator expects the compute charge to stop. What is the actual state and cost?

- A) The VM is stopped but still allocated, so the compute charge continues
- B) The VM is deallocated, so the compute charge has stopped
- C) The VM is deleted, so only the disk charge continues
- D) The VM is stopped and the compute charge continues at half rate

**Answer: A**
Shutting down from inside the guest leaves the VM stopped but still allocated, and the reserved compute is still billed. Only deallocating releases the compute and ends that charge, so the second option describes the wrong action. The VM is not deleted, and there is no half-rate billing state.

---

### Q28
Which managed disk type offers the highest performance tier for a virtual machine's data disk?

- A) Standard HDD
- B) Standard SSD
- C) Ultra Disk
- D) Premium SSD

**Answer: C**
Ultra Disk is the highest performance tier available for managed disks. Premium SSD is the common production choice but sits below Ultra. Standard SSD is a middle tier for lighter workloads, and Standard HDD is the cheapest and slowest of the four.

---

### Q29
A workload must keep running even if an entire datacentre inside the region is lost, and the design currently uses an availability set. What should you change?

- A) Increase the number of fault domains in the availability set
- B) Add more update domains to the availability set
- C) Convert the virtual machines into a scale set in the same datacentre
- D) Place the virtual machines across availability zones instead

**Answer: D**
Availability zones are physically separate datacentres in a region, so spreading across them survives the loss of one datacentre. Fault domains and update domains only group machines within a single datacentre, so adjusting either does not add datacentre-level protection. A scale set placed in the same datacentre also shares that single point of failure.

---

### Q30
A nightly batch job runs for about four minutes in a container, needs no inbound endpoint, and requires no orchestration. Which service should host it?

- A) Azure Container Instances, because it runs a container group without an orchestrator
- B) Azure Container Apps, because it provides revisions and traffic splitting
- C) Azure Container Registry, because it stores and serves the image
- D) Azure App Service, because it provides deployment slots

**Answer: A**
Azure Container Instances runs a container group with no cluster to manage and bills by the second, which suits a short task with no endpoint. Container Apps would work but brings revision and traffic-splitting features this job does not use. A registry stores images and runs nothing, and App Service targets a hosted application rather than a short batch task.

---

### Q31
An API hosted in Azure Container Apps must be released to ten percent of users before the rest. What should you use?

- A) A second container group in Azure Container Instances
- B) A geo-replicated Azure Container Registry
- C) A new revision in Container Apps with traffic split between revisions
- D) A larger CPU and memory allocation per replica

**Answer: C**
Each deployment in Container Apps produces an immutable revision, and traffic can be split across revisions, which is how a partial release is done. A second container group in ACI has no traffic-splitting mechanism between groups. Geo-replication in a registry speeds up image pulls but does not route users, and raising per-replica resources changes capacity rather than the share of traffic.

---

### Q32
What is the role of Azure Container Registry in a container deployment?

- A) It runs container groups on shared hosts without an orchestrator
- B) It stores container images and serves them to the services that run them
- C) It provides scale-to-zero hosting for containerised applications
- D) It builds and schedules replicas across a managed cluster

**Answer: B**
A registry is the private store from which container services pull the images they run. Running container groups without an orchestrator describes Azure Container Instances. Scale-to-zero application hosting describes Azure Container Apps, and replica scheduling is done by the hosting platform, not the registry.

---

### Q33
An app has been verified in a staging slot and is about to be swapped into production, but a database connection string must remain different in production after the swap. What should you do?

- A) Create the connection string again in production after the swap completes
- B) Move the app into a second App Service plan before the swap
- C) Change the app's pricing tier to Premium before the swap
- D) Mark the connection string as a slot setting before the swap

**Answer: D**
A slot setting stays with its slot instead of travelling with the swapped content, so the production value survives the exchange. Re-creating the value afterwards works only if someone remembers to do it and leaves a window of wrong configuration. A separate plan and a higher tier change where and how the app runs, not how settings behave during a swap.

---

### Q34
An App Service app must read from a database that has no public endpoint and is reachable only inside a virtual network. Which setting addresses the app's outbound connection?

- A) Access restrictions on the app's inbound traffic
- B) VNet integration, which gives the app outbound access into the virtual network
- C) A private endpoint on the app, which gives it a private inbound address
- D) A managed TLS certificate bound to the app's custom hostname

**Answer: B**
VNet integration covers the outbound direction, letting the app reach private resources inside a virtual network. Access restrictions filter inbound requests and do nothing for outbound connections. A private endpoint on the app provides a private address for callers reaching the app, which is the opposite direction, and a certificate affects only TLS for inbound hostnames.

---

---

## Domain 4: Implement and manage virtual networking

---

### Q35
A subnet in a virtual network is configured with the address range 10.0.5.0/24. How many addresses in this subnet can actually be assigned to virtual machines?

- A) 251
- B) 256
- C) 250
- D) 252

**Answer: A**
Azure reserves five addresses in every subnet: the network address, the default gateway, two for Azure DNS mapping, and the broadcast address, so a /24 yields 256 minus 5, which is 251 usable addresses. 256 counts the full block and ignores the reservations, 250 over-reserves by one, and 252 assumes only four addresses are held back.

---

### Q36
VNet A is peered to VNet B, and VNet B is peered to VNet C, but VNet A and VNet C have no peering between them. Which statement describes connectivity from VNet A to VNet C?

- A) Traffic flows because peering carries traffic transitively across the backbone
- B) Traffic flows only when both virtual networks use the same address space range
- C) Traffic does not flow because peering is not transitive
- D) Traffic flows once each peering is re-created from both sides

**Answer: C**
VNet peering is non-transitive, so a path through an intermediate VNet does not carry traffic between the two outer networks. Re-creating the peerings does not change that, because the peerings are already connected and the limitation is architectural. Matching address space is not what enables peering, and it does not create a transitive path.

---

### Q37
An administrator attaches a Standard SKU public IP address to a virtual machine, but inbound HTTPS requests fail and no network security group rule permits port 443. What explains the failure?

- A) Standard SKU public IP addresses do not support HTTPS traffic
- B) The public IP address must be dynamic rather than static
- C) A load balancer must be placed in front of the virtual machine
- D) Standard SKU public IP addresses are secure by default and need an explicit allow rule

**Answer: D**
A Standard SKU public IP address is secure by default, so inbound traffic is dropped until a network security group explicitly allows it, which makes the missing port 443 rule the cause. Static versus dynamic allocation only affects whether the address changes, not whether traffic is permitted. Standard SKU public IPs carry any protocol, and no load balancer is required for direct inbound access.

---

### Q38
A user-defined route, a system route and a BGP-learned route all match the same destination prefix for traffic leaving a subnet. Which route is used?

- A) The BGP-learned route
- B) The user-defined route
- C) The system route
- D) The route whose next hop is closest to the destination

**Answer: B**
Azure evaluates routes by type, and a user-defined route takes precedence over a system route, which in turn takes precedence over a route learned through BGP. Proximity of the next hop is not part of the comparison, and the BGP route is the weakest of the three, so neither of those decides the outcome.

---

### Q39
An administrator adds an inbound network security group rule that allows TCP 3389 from the office range, but RDP to the virtual machine still fails. A network security group is attached both to the subnet and to the virtual machine's network interface. What should the administrator check next?

- A) Whether the two network security groups are in the same resource group
- B) Whether the guest operating system firewall has been turned off
- C) Whether the other network security group also allows TCP 3389
- D) Whether the new rule has a priority number below 4096

**Answer: C**
When a network security group is attached at both the subnet and the NIC, traffic must be allowed by both, so a deny in the second group still blocks the session. Resource group membership has no effect on rule evaluation. The guest firewall is a separate layer that would be checked after Azure-side rules are confirmed, and any priority from 100 to 4096 is valid, so the number itself is not the issue.

---

### Q40
A security policy forbids public IP addresses on virtual machines, but administrators must still reach those machines over RDP and SSH. What should be deployed?

- A) Azure Bastion in a dedicated gateway subnet
- B) A site-to-site VPN gateway for every administrator
- C) A Standard load balancer with an inbound NAT rule
- D) A private endpoint in front of each virtual machine

**Answer: A**
Azure Bastion brokers browser-based RDP and SSH through the portal, so the virtual machines need no public IP address and no management port is exposed to the internet. A load balancer with an inbound NAT rule still requires a public frontend address, which the policy forbids. Private endpoints are for reaching platform services, not for management sessions to a VM, and a VPN gateway per administrator is far more than the requirement needs.

---

### Q41
Which statement correctly distinguishes a service endpoint from a private endpoint for a platform service such as a storage account?

- A) A service endpoint assigns the platform service a private IP address in the virtual network
- B) A private endpoint leaves the service on its public address and adds a backbone route
- C) Both approaches remove the platform service's public address entirely
- D) A private endpoint gives the platform service a private IP address from the virtual network

**Answer: D**
A private endpoint places a private IP address from your own virtual network in front of the service, which lets you disable public access completely. A service endpoint instead keeps the service on its public address and routes traffic over the Microsoft backbone, so the first two options describe the two features the wrong way round. Service endpoints do not remove the public address, so neither approach eliminates it in both cases.

---

### Q42
A Standard load balancer reports every instance in its backend pool as unhealthy, even though each application answers requests made from inside its own virtual machine. What is the most likely cause?

- A) The backend pool does not contain any virtual machines
- B) A network security group is blocking the health probe
- C) The load balancer is internal rather than public
- D) The frontend IP configuration is set to dynamic

**Answer: B**
Health probes originate from the address 168.63.129.16, so a network security group that does not allow that source on the probe port marks every instance unhealthy even when the application itself works. A pool that is genuinely empty shows no instances rather than unhealthy ones. An internal frontend and a dynamic frontend address both still allow probing to succeed, so neither would produce an all-unhealthy pool.

---

### Q43
Requests for app.contoso.com/api must be sent to one pool of servers, while all other requests for the same host name go to a different pool. Which service should be used?

- A) Azure Load Balancer with two frontend IP configurations
- B) Azure DNS with two A records for the host name
- C) Application Gateway with path-based routing rules
- D) A public load balancer with two health probes

**Answer: C**
Routing on the request path is a Layer 7 decision, and Application Gateway reads the URL and can send /api to one pool and everything else to another. Azure Load Balancer operates at Layer 4 and cannot see the path, so extra frontends or probes on it would not separate the traffic. Two DNS A records for one host name would distribute requests randomly rather than by path.

---

### Q44
A private DNS zone is linked to a virtual network with auto-registration enabled. What happens when a new virtual machine is created in that network?

- A) An A record for the virtual machine is created in the zone automatically
- B) A CNAME record for the virtual machine is created in the zone automatically
- C) The virtual machine is registered only after its name is added by hand
- D) The zone is recreated with the new virtual machine's address as its apex record

**Answer: A**
Auto-registration on a virtual network link makes Azure create and maintain an A record for each virtual machine in the linked network as machines are created and removed. CNAME records are not what auto-registration writes, and manual entry is exactly what the feature removes the need for. A zone is never recreated when a virtual machine is added.

---

---

## Domain 5: Monitor and maintain Azure resources

---

### Q45
An administrator reports that a virtual machine shows a CPU percentage chart in Azure Monitor but has no memory chart at all. What should you check first?

- A) Whether the virtual machine is in a region that supports memory metrics
- B) Whether the activity log has recorded a recent change to the virtual machine
- C) Whether a diagnostic setting is routing platform metrics to a workspace
- D) Whether the Azure Monitor Agent is installed and reporting from the guest

**Answer: D**
Memory in use is a guest metric, which the platform cannot see unless an agent inside the operating system reports it, so the agent is the first thing to verify. Region choice does not determine metric availability in this way, the activity log records control-plane operations rather than performance data, and diagnostic settings route data that is already being collected rather than creating guest metrics.

---

### Q46
A storage account's configuration was changed overnight and no one on the team will admit to making the change. Where should you look to identify who performed the operation?

- A) The resource logs for the storage account
- B) The metrics blade for the storage account
- C) The activity log for the subscription
- D) A Log Analytics workspace that holds the storage account's logs

**Answer: C**
The activity log records control-plane operations such as configuration changes, including the caller identity and the operation name. Resource logs describe data-plane requests against the account rather than who changed its settings, metrics are numeric performance values, and a workspace only holds what a diagnostic setting has been configured to send it.

---

### Q47
Which three components make up an alert rule in Azure Monitor?

- A) A signal, a condition, and an action group
- B) A workspace, a query, and a dashboard
- C) A vault, a policy, and a recovery point
- D) A metric, a diagnostic setting, and an insight

**Answer: A**
An alert rule watches a signal, evaluates a condition against it, and invokes an action group when the condition is met. The workspace and query pair describes log analytics rather than an alert rule's structure, vault and policy belong to backup, and metrics, diagnostic settings, and insights are separate monitoring features rather than the parts of an alert rule.

---

### Q48
A user has accidentally deleted a single folder from an Azure file share, and all other content on the share is current and correct. Which restore approach is most appropriate?

- A) Perform a file-level recovery from a recovery point
- B) Replace the entire file share from the most recent recovery point
- C) Fail over the file share to the secondary region
- D) Restore the disks that back the file share to a new storage account

**Answer: A**
File-level recovery mounts a recovery point so individual files and folders can be copied out, which restores the deleted folder without disturbing anything else. Replacing the whole share would discard correct changes made since that recovery point, failover is a business-continuity action for an unavailable workload, and file shares do not present restorable disks in the way a virtual machine does.

---

### Q49
A business requirement states that a critical application must remain available if its primary Azure region becomes unavailable. Which service addresses this requirement?

- A) Azure Backup with a daily backup policy
- B) A Recovery Services vault with extended retention
- C) Azure Site Recovery with replication to a secondary region
- D) Soft delete enabled on the backup vault

**Answer: C**
Site Recovery continuously replicates workloads so they can be failed over to another region, which is what keeping an application available through a regional outage requires. Backup restores data after the fact and takes far longer, extended retention only changes how long recovery points are kept, and soft delete protects backup data from deletion rather than keeping a workload running.

---

### Q50
Which statement correctly describes the relationship between a backup vault and a backup policy?

- A) The vault defines the schedule and the policy stores the recovery points
- B) The vault stores the backups and the policy defines frequency and retention
- C) The policy stores the backups and the vault defines the retention period
- D) The vault and the policy are the same object viewed in two different places

**Answer: B**
The vault is the container that holds backup data, while the backup policy is a separate object defining how often backups are taken and how long each is kept. The remaining options reverse those roles or treat the two as a single object, which would make it impossible to apply one schedule to many resources while keeping their data together in one container.

---
