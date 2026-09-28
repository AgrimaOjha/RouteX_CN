# RouteX Nginx Reverse Proxy and Load Balancer

## Overview

RouteX uses Nginx on Mac 2 as the single public application entry
point.

Nginx provides:

- HTTPS/TLS termination
- Reverse proxying
- Load balancing between Backend A and Backend B

The Nginx server is hosted by:

- Team Member: Suhani
- Machine: Mac 2
- IP Address: `10.7.8.7`
- HTTPS Port: `8443`

---

## Backend Pool

Nginx forwards requests to two backend servers:

| Backend | IP Address | Port |
|---|---|---|
| Backend A | `10.7.19.83` | `3001` |
| Backend B | `10.7.18.104` | `3002` |

The backend servers are defined in the Nginx upstream block.

---

## Load Balancing

RouteX uses Nginx round-robin load balancing.

The backend pool is:

```nginx
upstream routex_backends {
    server 10.7.19.83:3001;
    server 10.7.18.104:3002;
}
