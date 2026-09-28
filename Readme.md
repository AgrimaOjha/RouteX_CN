# RouteX — Computer Networks Course Project

## Private Network Service Platform — Phase 1

RouteX is a fully local private network service platform built for the
Computer Networks Course Project.

The project demonstrates how a client request travels through a local
network using:

**Private DNS → TCP → HTTPS/TLS → Nginx Reverse Proxy → Load Balancing → Backend Service**

The entire system runs on four macOS laptops connected to the same
private Wi-Fi/LAN. No cloud infrastructure is used.

---

## 👥 Team & Machine Roles

| Machine | Team Member | Role | IP Address | Service |
|---|---|---|---|---|
| Mac 1 | Agrima | Private DNS Server | `10.7.25.7` | dnsmasq / DNS :53 |
| Mac 2 | Suhani | Edge / Reverse Proxy / Load Balancer | `10.7.8.7` | nginx / HTTPS :8443 |
| Mac 3 | Khyati | Backend Server A | `10.7.19.83` | HTTP :3001 |
| Mac 4 | Khushi | Backend Server B | `10.7.18.104` | HTTP :3002 |

### LAN Configuration

| Property | Value |
|---|---|
| Network | `10.7.0.0/19` |
| Subnet Mask | `255.255.224.0` |
| Gateway | `10.7.0.1` |
| Interface | Wi-Fi |

---

# 🏗️ System Architecture

```text
                         RouteX Private LAN
                              10.7.0.0/19
                                  │
                                  │
                         DNS Query :53/UDP
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │     AGRIMA — Mac 1      │
                    │     Private DNS Server   │
                    │        10.7.25.7         │
                    │         dnsmasq           │
                    └────────────┬────────────┘
                                 │
                    app.routex.test
                         → 10.7.8.7
                                 │
                                 │ HTTPS :8443
                                 ▼
                    ┌─────────────────────────┐
                    │     SUHANI — Mac 2      │
                    │     nginx Edge / LB      │
                    │        10.7.8.7          │
                    │         HTTPS :8443      │
                    └────────────┬────────────┘
                                 │
                       Round-Robin Load
                           Balancing
                         ┌───────┴───────┐
                         │               │
                         ▼               ▼
              ┌────────────────┐  ┌────────────────┐
              │ KHYATI — Mac 3 │  │ KHUSHI — Mac 4 │
              │   Backend A    │  │   Backend B    │
              │  10.7.19.83    │  │  10.7.18.104   │
              │   HTTP :3001   │  │   HTTP :3002   │
              │ X-Backend: A   │  │ X-Backend: B   │
              └────────────────┘  └────────────────┘
```

The client does not need to know the backend IP addresses.
Nginx acts as the single application entry point.

---

# 🔄 Request Flow

A normal RouteX request follows these steps:

1. The client requests `app.routex.test`.
2. The client sends a DNS query to Agrima's private DNS server.
3. dnsmasq resolves `app.routex.test` to `10.7.8.7`.
4. The client establishes a TCP connection to the Nginx server.
5. HTTPS/TLS is established on port `8443`.
6. Nginx receives the HTTPS request.
7. Nginx forwards the request to Backend A or Backend B.
8. The selected backend returns the response.
9. Nginx sends the response back to the client.

```text
Client
   │
   │ DNS Query
   ▼
Agrima / dnsmasq
10.7.25.7:53
   │
   │ app.routex.test → 10.7.8.7
   ▼
Suhani / nginx
10.7.8.7:8443
   │
   ├──────────────► Khyati / Backend A
   │                10.7.19.83:3001
   │
   └──────────────► Khushi / Backend B
                    10.7.18.104:3002
```

---

# 🌐 Private DNS

The RouteX private DNS server runs on Mac 1 using `dnsmasq`.

The following private DNS records are configured:

```text
app.routex.test → 10.7.8.7
api.routex.test → 10.7.8.7
```

At least two client Macs are configured to use:

```text
10.7.25.7
```

as their DNS resolver.

DNS resolution can be verified using:

```bash
dig app.routex.test
```

The final application is accessed using the hostname rather than
directly entering the Nginx IP address.

---

# 🖥️ Backend Services

RouteX uses two simple Node.js + Express HTTP REST backends.

## Backend A

**Host:** Khyati — Mac 3

```text
IP:       10.7.19.83
Port:     3001
Backend:  A
```

Endpoints:

```text
GET /
GET /api/status
```

Example status response:

```json
{
  "backend": "A",
  "status": "ok"
}
```

Response header:

```text
X-Backend: A
```

---

## Backend B

**Host:** Khushi — Mac 4

```text
IP:       10.7.18.104
Port:     3002
Backend:  B
```

Endpoints:

```text
GET /
GET /api/status
```

Example status response:

```json
{
  "backend": "B",
  "status": "ok"
}
```

Response header:

```text
X-Backend: B
```

---

# ⚖️ Nginx Load Balancing

Nginx runs on Mac 2 and acts as the single public entry point.

The backend pool contains:

```text
Backend A → 10.7.19.83:3001
Backend B → 10.7.18.104:3002
```

The project uses round-robin load balancing.

Repeated requests to:

```text
https://app.routex.test:8443/api/status
```

produce responses from both backends.

Example:

```text
Request 1 → X-Backend: A
Request 2 → X-Backend: B
Request 3 → X-Backend: A
Request 4 → X-Backend: B
```

This demonstrates that the client communicates with the Nginx edge
rather than directly selecting a backend.

---

# 🔐 HTTPS / TLS

HTTPS is terminated at the Nginx edge server.

```text
HTTPS Port: 8443
Server:     10.7.8.7
Hostname:   app.routex.test
```

The TLS flow demonstrated in the project includes:

```text
ClientHello
    ↓
ServerHello
    ↓
Certificate
    ↓
Key Exchange
    ↓
Finished
    ↓
Encrypted Application Data
```

The final HTTPS demonstration is performed without using the
`-k` certificate-validation bypass.

Example:

```bash
curl -i https://app.routex.test:8443/api/status
```

---

# 💾 HTTP Caching

The backend responses include:

```text
Cache-Control: max-age=60
```

and an ETag.

Example:

```text
Cache-Control: max-age=60
ETag: W/"..."
```

A conditional request was also demonstrated.

The client supplied the previously received ETag:

```text
If-None-Match: W/"..."
```

and the backend returned:

```text
HTTP/1.1 304 Not Modified
```

This demonstrates conditional HTTP caching without retransmitting
the response body when the resource has not changed.

---

# 📡 Wireshark Protocol Analysis

Wireshark was used to observe the network protocol flow.

The project captures/evidence cover:

### DNS

```text
Client → DNS Server
DNS Query → app.routex.test
DNS Response → 10.7.8.7
```

### TCP

The TCP three-way handshake:

```text
SYN
↓
SYN-ACK
↓
ACK
```

### TLS

The TLS handshake and encrypted application data are observed in
the packet capture.

### HTTP / Load Balancing

HTTP response headers are used to identify which backend processed
the request:

```text
X-Backend: A
```

or

```text
X-Backend: B
```

---

# 🧪 Failure Demonstrations

Phase 1 includes controlled failure demonstrations to verify that
different network layers can be diagnosed independently.

The following scenarios were tested:

| Failure Scenario | Observed Result |
|---|---|
| Wrong DNS server | DNS lookup failed |
| DNS record points to wrong IP | DNS resolution succeeded but returned the wrong destination |
| Backend A stopped | Requests continued through Backend B |
| Both backends stopped | Nginx returned `502 Bad Gateway` |
| Wrong destination port | TCP connection to the specified port failed |

After testing, the working configuration was restored.

---

# 🧰 Technologies Used

- macOS
- Wi-Fi / Private LAN
- dnsmasq
- Nginx
- Node.js
- Express.js
- OpenSSL / TLS
- curl
- dig
- Wireshark
- Git / GitHub

---

# 📁 Repository Structure

```text
ROUTEX_CN/
│
├── README.md
│
├── architecture/
│   ├── topology.png
│   └── Phase1_Report.pdf
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
├── dns/
│   ├── dnsmasq.conf.example
│   └── README.md
│
├── nginx/
│   ├── nginx.conf.example
│   └── README.md
│
├── tls/
│   └── README.md
│
└── evidence/
    ├── task-a/
    ├── task-b/
    ├── task-c/
    ├── task-d/
    ├── task-e/
    ├── task-f/
    ├── task-g/
    └── failures/
```

---

# 🚀 Running the Backends

## Backend A

On Khyati's Mac:

```bash
cd backend-a
npm install
node server.js
```

Backend A listens on:

```text
http://10.7.19.83:3001
```

---

## Backend B

On Khushi's Mac:

```bash
cd backend-b
npm install
node server.js
```

Backend B listens on:

```text
http://10.7.18.104:3002
```

---

# ✅ Phase 1 Verification

The RouteX Phase 1 system was verified through:

- Private LAN connectivity
- Network inventory
- Private DNS resolution
- Two HTTP backend services
- Nginx reverse proxy
- Round-robin load balancing
- HTTPS/TLS
- HTTP caching
- Conditional `304 Not Modified`
- Wireshark packet analysis
- Controlled failure demonstrations

Final application endpoint:

```text
https://app.routex.test:8443
```

---

# 📚 Evidence

Detailed screenshots and packet-capture evidence are stored in:

```text
evidence/
```

Evidence is organized by task so that each Phase 1 requirement
can be located quickly.

---

# 🎓 Project Scope

This repository documents **Phase 1 — Build and Observe** of the
Computer Networks Course Project.

Phase 1 focuses on:

```text
DNS
HTTP/REST
TCP
TLS/HTTPS
Load Balancing
HTTP Caching
Packet Analysis
Failure Diagnosis
```

The project is designed to demonstrate how these networking concepts
work together in a complete local service environment.