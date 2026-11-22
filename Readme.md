# 🚀 RouteX — Network Infrastructure & High Availability

<p align="center">
  <strong>A Computer Networks Project</strong><br>
  DNS • Reverse Proxy • Load Balancing • HTTPS • Caching • Fault Tolerance
</p>

<p align="center">
  ![Project](https://img.shields.io/badge/Project-RouteX-blue?style=for-the-badge)
  ![Platform](https://img.shields.io/badge/Platform-macOS-lightgrey?style=for-the-badge)
  ![Networking](https://img.shields.io/badge/Domain-Computer%20Networks-purple?style=for-the-badge)
</p>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Project Objectives](#-project-objectives)
- [Network Architecture](#-network-architecture)
- [Machine and Service Configuration](#-machine-and-service-configuration)
- [Technology Stack](#-technology-stack)
- [Phase 1 — Core Implementation](#-phase-1--core-implementation)
- [Phase 2 — Advanced Extensions](#-phase-2--advanced-extensions)
- [Ports and Services](#-ports-and-services)
- [Testing and Verification](#-testing-and-verification)
- [Project Structure](#-project-structure)
- [Known Limitations and Pending Verification](#-known-limitations-and-pending-verification)
- [Conclusion](#-conclusion)

---

## 🌐 About the Project

**RouteX** is a multi-machine network infrastructure project developed as part of a Computer Networks course.

The project demonstrates how multiple machines on a local network can work together to provide a reliable web application infrastructure.

It combines private DNS, backend servers, an Nginx reverse proxy, HTTPS communication, load balancing, caching, and fault-tolerance mechanisms.

The implementation is divided into two phases:

- **Phase 1 — Core Implementation:** Establishing the network infrastructure and making the application accessible through a domain name.
- **Phase 2 — Advanced Extensions:** Improving availability, resilience, service isolation, DNS behaviour, and troubleshooting capabilities.

---

## 🎯 Project Objectives

The main objectives of RouteX are to:

- Establish communication between multiple machines on a local network.
- Configure a private DNS service for domain-name resolution.
- Deploy two independent backend servers.
- Configure Nginx as a reverse proxy and load balancer.
- Enable HTTPS using TLS certificates.
- Implement HTTP caching.
- Introduce DNS redundancy and controlled DNS updates.
- Demonstrate backend and edge-server failover.
- Restrict direct backend access.
- Analyse network communication and troubleshoot failures.

---

## 🏗️ Network Architecture

RouteX follows a distributed architecture in which different machines perform dedicated network roles.

```text
                         CLIENT MACHINES
                               |
                               |
                         Private DNS
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
                  +------------+------------+
                  |                         |
                  |                         |
             BACKEND A                 BACKEND B
             10.7.9.69                10.7.31.40
              Node.js                   Node.js
              Port 3001                 Port 3002
```

A standby Edge Server is also configured on the Backend A machine for the Edge migration extension.

> **Note:** The Backup DNS server is part of the project architecture. Its final IP address should be added to the machine inventory once confirmed.

---

## 🖥️ Machine and Service Configuration

| Team Member | Machine Role | IP Address | Service |
|---|---|---|---|
| Agrima | Primary DNS | `10.7.2.153` | dnsmasq |
| Suhani | Primary Edge Server | `10.7.30.238` | Nginx |
| Khyati | Backend A + Standby Edge | `10.7.9.69` | Node.js + Nginx |
| Khushi | Backend B | `10.7.31.40` | Node.js |

### Domain Configuration

| Domain | Purpose | Configuration |
|---|---|---|
| `app.routex.test` | Main application | Primary Edge Server |
| `api.routex.test` | API endpoint | Add confirmed DNS mapping |

The primary DNS server uses dnsmasq, with the main application domain configured to resolve to `10.7.30.238`.

The DNS record uses a TTL of **30 seconds** to support controlled DNS updates and migration testing.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| macOS | Operating system |
| dnsmasq | Private DNS service |
| Nginx | Reverse proxy and load balancer |
| Node.js | Backend runtime |
| Express.js | Backend application framework |
| HTTPS / TLS | Secure communication |
| cURL | HTTP and HTTPS testing |
| dig | DNS verification |
| netcat (`nc`) | TCP connectivity testing |
| Wireshark | Network packet analysis |

---

## 🔵 Phase 1 — Core Implementation

Phase 1 focuses on building the basic RouteX infrastructure.

### Task A — LAN Setup and Connectivity

- Connected the participating machines to the same local network.
- Assigned and identified the IP addresses of the machines.
- Verified connectivity between machines using `ping`.
- Established the network topology and machine roles.

**Verification command:**

```bash
ping <IP_ADDRESS>
```

### Task B — Private DNS Configuration

- Configured dnsmasq as the primary private DNS server.
- Added the application domain `app.routex.test`.
- Configured DNS resolution for the participating client machines.
- Used a TTL of 30 seconds for DNS update testing.

**Verification command:**

```bash
dig @10.7.2.153 app.routex.test
```

### Task C — Backend Server Deployment

Two independent backend servers were developed using Node.js and Express.

| Backend | IP Address | Port |
|---|---|---|
| Backend A | `10.7.9.69` | `3001` |
| Backend B | `10.7.31.40` | `3002` |

Both backends provide:

- A root endpoint (`/`).
- An API status endpoint (`/api/status`).
- Backend-identifying response headers.
- JSON responses indicating backend status.

The `X-Backend` response header identifies which backend handled a request.

**Example testing commands:**

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

Nginx was configured on the Primary Edge Server to act as:

- A reverse proxy between clients and backend servers.
- A load balancer distributing requests between Backend A and Backend B.
- The main entry point for application traffic.

The upstream configuration includes both backend servers:

```nginx
upstream routex_backends {
    server 10.7.9.69:3001;
    server 10.7.31.40:3002;
}
```

This allows incoming application requests to be forwarded to the configured backend pool.

### Task E — HTTPS and TLS Configuration

- Configured HTTPS on the Primary Edge Server.
- Enabled TLS communication through Nginx.
- Created and configured a certificate for `app.routex.test`.
- Verified the TLS handshake and HTTPS response.

**Testing command:**

```bash
curl -k -Iv https://app.routex.test:8443/
```

The `-k` option allows testing with the project's self-signed certificate without requiring the client to trust it.

### Task F — HTTP Caching

HTTP caching was configured at the Edge Server.

The response headers include:

```http
Cache-Control: max-age=60
```

This specifies a cache freshness lifetime of 60 seconds.

Caching is intended to reduce repeated backend requests and improve response efficiency.

### Task G — Network Packet Analysis

Wireshark was used as the network analysis tool for examining communication between the machines.

The relevant protocols and traffic include:

- DNS queries and responses.
- TCP connection establishment.
- TLS handshake communication.
- HTTP request and response traffic.

Useful Wireshark display filters:

```text
dns
```

```text
tcp
```

```text
tls
```

```text
http
```

---

## 🟣 Phase 2 — Advanced Extensions

Phase 2 extends the core infrastructure by introducing redundancy, controlled migration, service isolation, and fault-tolerance mechanisms.

### Extension A — Backup DNS and Redundancy

This extension introduces a secondary DNS server to improve DNS availability.

The intended behaviour is:

- Configure a Backup DNS server.
- Provide the required DNS records on the backup.
- Configure clients to use the backup DNS server when appropriate.
- Stop the Primary DNS service.
- Verify that DNS resolution continues through the Backup DNS server.

**Example verification command:**

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

The intended network behaviour is:

- Backend services should accept application traffic through authorised Edge Servers.
- Direct client access to backend ports should be restricted.
- Backend access should be verified from both permitted and non-permitted sources.

The current backend implementation includes an application-level IP allowlist.

> Application-level access restrictions are not equivalent to operating-system firewall rules. OS-level firewall enforcement should be separately configured and verified if required by the project evaluation.

### Extension D — Backend High Availability

This extension demonstrates continued application availability when one backend becomes unavailable.

The expected behaviour is:

- Both Backend A and Backend B are initially available.
- Stop Backend A.
- Send application requests through the Edge Server.
- Verify that Backend B continues serving requests.
- Restore Backend A and verify normal operation.

This demonstrates backend resilience through the configured Nginx upstream.

### Extension E — Controlled Edge Server Migration

This extension demonstrates migration from the Primary Edge Server to a Standby Edge Server.

The process involves:

1. Configure the Standby Edge Server.
2. Verify that the standby service is accessible.
3. Update the DNS record to point to the standby machine.
4. Test application access after the DNS change.
5. Observe the effect of DNS TTL and client-side caching.
6. Restore the DNS record to the Primary Edge Server.

For RouteX, the migration was tested using:

| Role | IP Address |
|---|---|
| Primary Edge | `10.7.30.238` |
| Standby Edge | `10.7.9.69` |

The primary DNS record was restored to `10.7.30.238` after the migration test.

### Extension F — Troubleshooting and Fault Diagnosis

This extension focuses on identifying and resolving network and service failures.

The troubleshooting process is divided into layers:

| Layer | What to Verify | Useful Tool |
|---|---|---|
| DNS | Domain resolves to the expected IP | `dig` |
| Network | Machines can communicate | `ping` |
| TCP | Required service port is reachable | `nc` |
| TLS | HTTPS handshake succeeds | `curl` |
| Application | Backend returns the expected response | `curl` |
| Proxy | Nginx forwards requests correctly | Nginx logs |

The objective is to identify the layer responsible for a failure rather than changing multiple configurations without isolating the problem.

---

## 🔌 Ports and Services

| Service | Port | Machine |
|---|---:|---|
| Backend A | `3001` | `10.7.9.69` |
| Backend B | `3002` | `10.7.31.40` |
| Primary Edge HTTPS | `8443` | `10.7.30.238` |
| DNS | `53` | `10.7.2.153` |

---

## 🧪 Testing and Verification

The following commands can be used during testing and demonstration.

### 1. DNS Resolution

```bash
dig @10.7.2.153 app.routex.test
```

### 2. TCP Port Connectivity

```bash
nc -vz 10.7.30.238 8443
```

### 3. HTTPS Request

```bash
curl -k -Iv https://app.routex.test:8443/
```

### 4. Test HTTPS Using a Specific Edge IP

If the client DNS resolver is not resolving the domain correctly, `--resolve` can be used to test the Edge Server directly while preserving the hostname for TLS:

```bash
curl -k -Iv \
  --resolve app.routex.test:8443:10.7.30.238 \
  https://app.routex.test:8443/
```

### 5. Backend Testing

```bash
curl http://10.7.9.69:3001/
```

```bash
curl http://10.7.31.40:3002/
```

### 6. Inspect Response Headers

```bash
curl -k -I https://app.routex.test:8443/
```

---

## 📁 Project Structure

A suggested repository structure:

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

*This is a suggested organisation. Update it to match the actual files in the repository.*

---

## ⚠️ Known Limitations and Pending Verification

The following points should be considered when evaluating the implementation:

- The configured TLS certificate is self-signed. A successful test using `curl -k` does not establish that the certificate is trusted by a browser or client.
- The backend allowlist is implemented at the application level. Separate OS-level firewall restrictions need independent verification.
- The `Cache-Control` header is configured, but an actual cache hit or HTTP `304 Not Modified` response should be captured before claiming that caching behaviour has been fully demonstrated.
- Successful DNS queries directed to the Primary DNS server do not necessarily prove that every client's default system resolver is configured correctly.
- The Backup DNS server's final IP and its failover test results should be documented once confirmed.
- The final `api.routex.test` DNS mapping should be added after verifying its configured value.
- Wireshark screenshots or capture files should be included as evidence of the relevant protocol exchanges.
- Any extension not yet tested should be marked as pending rather than reported as successfully completed.

---

## 🎓 Conclusion

RouteX demonstrates the practical application of Computer Networks concepts through a distributed, multi-machine infrastructure.

By combining private DNS, backend services, Nginx reverse proxying, load balancing, HTTPS, caching, and redundancy mechanisms, the project explores how real-world web infrastructure is configured, tested, and maintained.

The two project phases provide experience in both establishing a working network architecture and improving its reliability through fault tolerance, controlled migration, service isolation, and systematic troubleshooting.

**RouteX brings together networking concepts and practical implementation to demonstrate a more reliable and resilient application infrastructure.**

---

<p align="center">
  <strong>Made with 💻 by Team RouteX</strong><br>
  <sub>Computer Networks Project</sub>
</p>
