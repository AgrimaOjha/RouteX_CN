# RouteX — Network Infrastructure & High Availability

<div align="center">

### A Multi-Machine Network Infrastructure Implementation

![Networking](https://img.shields.io/badge/Domain-Computer%20Networks-blue)
![DNS](https://img.shields.io/badge/Service-Private%20DNS-green)
![Nginx](https://img.shields.io/badge/Reverse%20Proxy-Nginx-orange)
![HTTPS](https://img.shields.io/badge/Security-HTTPS%20%2F%20TLS-purple)
![High Availability](https://img.shields.io/badge/Architecture-High%20Availability-red)

**Computer Networks — Semester Project**

</div>

---

## 📌 Project Overview

**RouteX** is a multi-machine network infrastructure project developed as part of the Computer Networks course.

The project demonstrates how multiple machines connected over a local network can work together to provide a reliable and resilient web application infrastructure.

It combines private DNS configuration, backend server deployment, Nginx reverse proxying, load balancing, HTTPS communication, HTTP caching, and fault-tolerance mechanisms.

The implementation is divided into two phases:

- **Phase 1:** Establishment of the core network infrastructure and application services.
- **Phase 2:** Implementation of advanced extensions focusing on redundancy, availability, migration, service isolation, and troubleshooting.

## 🎯 Project Objectives

- To establish communication between multiple machines on a local network.
- To configure a private DNS service for domain-name resolution.
- To deploy two independent backend servers using Node.js and Express.
- To configure Nginx as a reverse proxy and load balancer.
- To enable secure communication using HTTPS and TLS.
- To implement HTTP caching at the Edge Server.
- To introduce DNS redundancy and TTL-controlled updates.
- To demonstrate backend and Edge Server failover.
- To restrict unauthorised direct access to backend services.
- To analyse network communication using Wireshark.
- To troubleshoot failures across different network layers.

## ⚙️ Network Configuration

| Component | Configuration |
|---|---|
| Network Type | Local Area Network (LAN) |
| Primary DNS | `10.7.2.153` |
| Primary Edge Server | `10.7.30.238` |
| Backend A | `10.7.9.69` |
| Backend B | `10.7.31.40` |
| Standby Edge Server | `10.7.9.69` |
| DNS Service | dnsmasq |
| Reverse Proxy | Nginx |
| Backend Framework | Node.js + Express |
| HTTPS Port | `8443` |
| Backend A Port | `3001` |
| Backend B Port | `3002` |
| DNS TTL | 30 seconds |

### Domain Configuration

| Domain | Purpose |
|---|---|
| `app.routex.test` | Main application domain |
| `api.routex.test` | API domain |

The primary DNS server is configured using dnsmasq. The main application domain initially resolves to the Primary Edge Server at `10.7.30.238`.

> **Note:** The final `api.routex.test` mapping and Backup DNS IP should be added after confirming their configured values.

## 🏗️ System Architecture

RouteX follows a distributed architecture in which each machine performs a dedicated role.

### Main Components

| Component | IP Address | Description |
|---|---|---|
| Primary DNS | `10.7.2.153` | Resolves application domains using dnsmasq. |
| Primary Edge | `10.7.30.238` | Handles incoming HTTPS requests through Nginx. |
| Backend A | `10.7.9.69` | Hosts the first Node.js backend on port 3001. |
| Backend B | `10.7.31.40` | Hosts the second Node.js backend on port 3002. |
| Standby Edge | `10.7.9.69` | Provides an alternative Edge Server for migration testing. |

### Request Flow

```text
                     CLIENT MACHINES
                            |
                            |
                      PRIVATE DNS
                       10.7.2.153
                            |
                            |
                    app.routex.test
                            |
                            |
                   PRIMARY EDGE SERVER
                      10.7.30.238
                       Nginx :8443
                            |
                     Reverse Proxy
                     Load Balancing
                            |
                +-----------+-----------+
                |                       |
                |                       |
           BACKEND A               BACKEND B
           10.7.9.69              10.7.31.40
            Node.js                 Node.js
            Port 3001               Port 3002
```

### Backend Services

Both backend servers are implemented using Node.js and Express.

| Backend | IP Address | Port | Framework |
|---|---|---:|---|
| Backend A | `10.7.9.69` | 3001 | Express.js |
| Backend B | `10.7.31.40` | 3002 | Express.js |

Each backend provides:

- A root endpoint (`/`).
- An API status endpoint (`/api/status`).
- JSON responses indicating backend status.
- An `X-Backend` response header to identify the responding backend.

### Nginx Reverse Proxy

Nginx acts as the main entry point for incoming application traffic.

The configured upstream contains both backend servers:

```nginx
upstream routex_backends {
    server 10.7.9.69:3001;
    server 10.7.31.40:3002;
}
```

This allows Nginx to distribute incoming requests across the backend pool.

## 🔵 Phase 1 — Core Implementation

Phase 1 focuses on establishing the basic network infrastructure and making the application accessible through a domain name.

### Task A — LAN Setup and Connectivity

- Connected the participating machines to the same local network.
- Identified and configured machine IP addresses.
- Verified connectivity between machines using `ping`.
- Established the network topology and machine roles.

**Verification command:**

```bash
ping <IP_ADDRESS>
```

### Task B — Private DNS Configuration

- Configured dnsmasq as the Primary DNS server.
- Added the `app.routex.test` domain record.
- Configured DNS resolution for participating client machines.
- Set the DNS TTL to 30 seconds.

**Verification command:**

```bash
dig @10.7.2.153 app.routex.test
```

### Task C — Backend Server Deployment

- Developed Backend A using Node.js and Express on port `3001`.
- Developed Backend B using Node.js and Express on port `3002`.
- Implemented the root and API status endpoints.
- Added backend-identifying response headers.

**Testing commands:**

```bash
curl http://10.7.9.69:3001/
```

```bash
curl http://10.7.31.40:3002/
```

```bash
curl http://10.7.9.69:3001/api/status
```

### Task D — Reverse Proxy and Load Balancing

- Configured Nginx on the Primary Edge Server.
- Created an upstream group containing Backend A and Backend B.
- Configured Nginx to forward incoming application requests.
- Enabled load distribution across the backend servers.

### Task E — HTTPS and TLS Configuration

- Configured HTTPS on the Primary Edge Server.
- Enabled TLS communication through Nginx.
- Created and configured a certificate for `app.routex.test`.
- Verified the TLS handshake and HTTPS response.

**Testing command:**

```bash
curl -k -Iv https://app.routex.test:8443/
```

### Task F — HTTP Caching

- Configured HTTP caching-related response headers at the Edge Server.
- Added a cache freshness lifetime of 60 seconds.

The observed response header is:

```http
Cache-Control: max-age=60
```

### Task G — Network Packet Analysis

Wireshark was used to examine network communication and protocol behaviour.

The analysis focuses on:

- DNS queries and responses.
- TCP connection establishment.
- TLS handshake communication.
- HTTP request and response traffic.

**Useful Wireshark filters:**

```text
dns
tcp
tls
http
```

## 🟣 Phase 2 — Advanced Extensions

Phase 2 focuses on improving the reliability, availability, and fault tolerance of the RouteX infrastructure.

### Extension A — Backup DNS and Redundancy

This extension introduces a secondary DNS server to improve DNS availability.

The intended implementation includes:

- Configuring a Backup DNS server.
- Maintaining the required DNS records on the backup.
- Configuring clients to use the backup DNS server.
- Stopping the Primary DNS service.
- Verifying DNS resolution through the Backup DNS server.

**Verification command:**

```bash
dig @<BACKUP_DNS_IP> app.routex.test
```

### Extension B — TTL-Controlled DNS Updates

This extension demonstrates how DNS caching affects infrastructure changes.

The process involves:

1. Resolving the application domain.
2. Recording the returned IP address and TTL.
3. Updating the DNS record to point to another Edge Server.
4. Observing the effect of cached DNS responses.
5. Waiting for the TTL to expire or flushing the client DNS cache.
6. Verifying the updated DNS response.

**Verification command:**

```bash
dig @10.7.2.153 app.routex.test
```

### Extension C — Service Isolation

This extension focuses on restricting direct access to backend services.

The intended behaviour includes:

- Allowing backend traffic from authorised Edge Servers.
- Restricting direct client access to backend ports.
- Verifying access from permitted and non-permitted sources.

The current backend implementation includes an application-level IP allowlist.

**Note:** Application-level access control is different from operating-system firewall enforcement. Separate firewall rules must be configured and verified if required.

### Extension D — Backend High Availability

This extension demonstrates continued application availability when one backend becomes unavailable.

The process involves:

1. Starting Backend A and Backend B.
2. Sending requests through the Primary Edge Server.
3. Stopping Backend A.
4. Verifying that Backend B continues serving requests.
5. Restoring Backend A and checking normal operation.

### Extension E — Controlled Edge Server Migration

This extension demonstrates migration from the Primary Edge Server to the Standby Edge Server.

| Edge Server | IP Address |
|---|---|
| Primary Edge | `10.7.30.238` |
| Standby Edge | `10.7.9.69` |

The migration process involves:

1. Configuring the Standby Edge Server.
2. Verifying that the standby service is accessible.
3. Updating the DNS record to point to the standby machine.
4. Testing application access after the DNS change.
5. Observing DNS TTL and client-side caching behaviour.
6. Restoring the DNS record to the Primary Edge Server.

The primary DNS record was restored to `10.7.30.238` after the migration test.

### Extension F — Troubleshooting and Fault Diagnosis

This extension focuses on identifying and resolving failures across different network layers.

| Layer | Verification | Tool |
|---|---|---|
| DNS | Domain-name resolution | `dig` |
| Network | Machine connectivity | `ping` |
| TCP | Port reachability | `nc` |
| TLS | Secure connection handshake | `curl` |
| Application | Backend response | `curl` |
| Reverse Proxy | Request forwarding | Nginx logs |

The objective is to isolate the source of a failure systematically instead of changing multiple configurations without identifying the underlying problem.

## 💻 Technologies and Tools Used

- **macOS** — Operating system for the participating machines.
- **dnsmasq** — Private DNS server.
- **Nginx** — Reverse proxy and load balancer.
- **Node.js** — Backend runtime environment.
- **Express.js** — Backend application framework.
- **HTTPS / TLS** — Secure communication.
- **cURL** — HTTP and HTTPS testing.
- **dig** — DNS resolution testing.
- **Netcat** — TCP connectivity testing.
- **Wireshark** — Network packet analysis.
- **Git and GitHub** — Version control and project collaboration.

## 🔌 Ports and Services

| Service | Port | Machine |
|---|---:|---|
| DNS | 53 | `10.7.2.153` |
| Backend A | 3001 | `10.7.9.69` |
| Backend B | 3002 | `10.7.31.40` |
| Primary Edge HTTPS | 8443 | `10.7.30.238` |

## 🧪 Testing and Verification

The following commands were used during implementation and testing.

### 1. DNS Resolution

```bash
dig @10.7.2.153 app.routex.test
```

### 2. TCP Connectivity

```bash
nc -vz 10.7.30.238 8443
```

### 3. HTTPS Connection

```bash
curl -k -Iv https://app.routex.test:8443/
```

### 4. HTTPS Testing with a Specific Edge IP

```bash
curl -k -Iv \
  --resolve app.routex.test:8443:10.7.30.238 \
  https://app.routex.test:8443/
```

### 5. Backend Connectivity

```bash
curl http://10.7.9.69:3001/
```

```bash
curl http://10.7.31.40:3002/
```

### 6. Response Header Inspection

```bash
curl -k -I https://app.routex.test:8443/
```

## 📂 Repository Structure

```text
RouteX/
│
├── README.md
│
├── backend-a/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── backend-b/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── nginx/
│   ├── nginx.conf
│   └── servers/
│
├── dns/
│   └── dnsmasq.conf
│
├── documentation/
│   ├── architecture.md
│   ├── configuration.md
│   └── final-report.md
│
└── evidence/
    ├── screenshots/
    ├── terminal-outputs/
    └── wireshark-captures/
```

*The above is a suggested repository structure. Update it according to the actual files maintained in the project.*

## ⚠️ Current Scope and Limitations

- The configured TLS certificate is self-signed. Testing with `curl -k` verifies connectivity but does not establish that the certificate is trusted by browsers or clients.
- Backend access restriction currently includes an application-level IP allowlist. OS-level firewall restrictions require separate configuration and verification.
- The `Cache-Control` response header is present, but an actual cache hit or `304 Not Modified` response should be demonstrated separately.
- DNS queries directed to the Primary DNS server succeeded, but default system resolver behaviour was not consistent on every tested client.
- The Backup DNS server's final IP and failover results should be added after verification.
- The final `api.routex.test` DNS mapping should be documented once confirmed.
- Wireshark screenshots or capture files should be included as evidence of protocol analysis.
- Any extension not fully tested should be marked as pending verification rather than reported as completed.

## 🔮 Future Improvements

- Configure and verify complete Backup DNS failover.
- Establish trusted TLS certificates for warning-free client access.
- Implement and verify OS-level backend firewall restrictions.
- Capture and demonstrate HTTP cache hits or `304 Not Modified` responses.
- Improve client-side DNS resolver configuration.
- Expand network monitoring and automated fault detection.
- Maintain complete packet captures and test evidence.

## 📚 Project Documentation

The project documentation and evidence should include:

- Network architecture and topology diagram.
- Machine IP and service configuration.
- DNS and Nginx configuration files.
- Backend source code.
- Phase 1 and Phase 2 implementation details.
- Terminal screenshots and testing outputs.
- Wireshark packet captures.
- Final project report and demonstration evidence.

---

<div align="center">

### ROUTEX

**Designed and implemented as a multi-machine network infrastructure**

*Computer Networks — Semester Project*

</div>
