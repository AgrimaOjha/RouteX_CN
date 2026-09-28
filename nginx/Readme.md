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

Nginx distributes repeated requests between the two backend servers.

Example:

Request 1 → Backend A
Request 2 → Backend B
Request 3 → Backend A
Request 4 → Backend B

The backend that handled a request can be identified using the
X-Backend response header.

HTTPS Configuration

Nginx listens for HTTPS connections on port 8443.

listen 8443 ssl;
server_name app.routex.test;

The TLS certificate and private key are configured using:

ssl_certificate /opt/homebrew/etc/nginx/certs/routex.crt;
ssl_certificate_key /opt/homebrew/etc/nginx/certs/routex.key;

Certificate files and private keys are not included in this
repository.

Reverse Proxy Configuration

Requests received by Nginx are forwarded to the backend pool:

location / {
    proxy_pass http://routex_backends;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

This allows Nginx to act as the single application entry point.

Clients access:

https://app.routex.test:8443

instead of directly connecting to:

10.7.19.83:3001
10.7.18.104:3002
Nginx Configuration Testing

The Nginx configuration can be checked using:

sudo nginx -t

A successful configuration test reports that the syntax is valid
and the configuration test is successful.

After configuration changes, Nginx can be reloaded using:

sudo nginx -s reload
Load Balancing Verification

Repeated requests can be made using:

curl -i https://app.routex.test:8443/api/status

The response contains the backend identifier:

X-Backend: A

or:

X-Backend: B

Repeated requests demonstrate round-robin distribution between the
two backend servers.

Backend Failure Testing
Backend A Stopped

When Backend A was stopped, requests continued through Backend B.

This demonstrated that the remaining backend could continue serving
requests through the Nginx entry point.

Both Backends Stopped

When both backend servers were stopped, Nginx returned:

HTTP/1.1 502 Bad Gateway

This demonstrated that Nginx was reachable but no backend service
was available to process the request.

Nginx Architecture
                    Client
                      |
                      | HTTPS :8443
                      v
             +-------------------+
             |  Suhani — Mac 2   |
             |      Nginx        |
             |    10.7.8.7       |
             +---------+---------+
                       |
                 Round-Robin
                 Load Balancing
                  /          \
                 /            \
                v              v
       +---------------+  +---------------+
       | Backend A     |  | Backend B     |
       | 10.7.19.83    |  | 10.7.18.104   |
       | Port 3001     |  | Port 3002     |
       +---------------+  +---------------+
Configuration File

The example Nginx configuration is available in:

nginx.conf.example

It contains the RouteX upstream backend configuration, HTTPS
listener, TLS certificate references, and reverse proxy settings.


### One important thing, bro

**Don't put these into GitHub:**

```text
routex.key

or any real private certificate key.

Your repo should have:

nginx/
├── nginx.conf.example
└── README.md
