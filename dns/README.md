Configuration Explanation
domain-needed prevents forwarding queries that do not contain a
domain name.
bogus-priv prevents private reverse-DNS queries from being
unnecessarily forwarded.
address=/app.routex.test/10.7.8.7 maps the application hostname
to the Nginx server.
address=/api.routex.test/10.7.8.7 maps the API hostname to the
Nginx server.
server=8.8.8.8 forwards other DNS queries to Google's public DNS
server.

The complete example configuration is available in:

dnsmasq.conf.example
Installation

dnsmasq was installed on Mac 1 using Homebrew.

brew install dnsmasq

The installed configuration file is located at:

/opt/homebrew/etc/dnsmasq.conf

The dnsmasq service can be started using:

brew services start dnsmasq

The service status can be checked using:

brew services list
Client DNS Configuration

Client machines on the RouteX LAN are configured to use the private
DNS server:

10.7.25.7

The private DNS server was configured on at least two other Macs in
the team.

The clients can also retain a public DNS server such as:

8.8.8.8

for external Internet name resolution.

DNS Verification

DNS resolution can be tested using:

dig app.routex.test

The expected result is:

app.routex.test → 10.7.8.7

The DNS server shown in the response should be:

10.7.25.7

For example:

SERVER: 10.7.25.7#53

The API hostname can also be tested:

dig api.routex.test

Expected result:

api.routex.test → 10.7.8.7
Local DNS Server Verification

The DNS server can also be queried directly from Mac 1:

dig @127.0.0.1 app.routex.test

Expected answer:

app.routex.test → 10.7.8.7

This verifies that dnsmasq is correctly serving the RouteX private
DNS records locally.

Application Verification

After DNS resolution is successful, the RouteX application can be
accessed using the hostname:

https://app.routex.test:8443

The client does not need to enter the Nginx IP address directly.

The request flow is:

Client
   |
   | DNS Query
   | app.routex.test
   v
Agrima — dnsmasq
10.7.25.7:53
   |
   | DNS Response
   | 10.7.8.7
   v
Suhani — Nginx
10.7.8.7:8443
DNS Failure Testing

Controlled DNS failures were tested as part of the Phase 1
failure demonstrations.

1. Wrong DNS Server

The client was temporarily configured to use only a public DNS
server instead of the RouteX private DNS server.

The command:

dig app.routex.test

returned a failed DNS lookup because the public DNS server did not
contain the private RouteX hostname.

Observed result:

NXDOMAIN

The client DNS configuration was then restored to use:

10.7.25.7
2. Wrong DNS Record

The private DNS record for app.routex.test was temporarily
changed to an incorrect IP address.

The DNS query still succeeded, but returned the incorrect destination.

Observed behavior:

DNS resolution succeeded
but the returned IP address was incorrect.

The correct record was then restored:

app.routex.test → 10.7.8.7
DNS and Application Architecture
                    RouteX Private LAN
                         10.7.0.0/19
                              |
                              |
                              | DNS :53
                              v
                 +--------------------------+
                 |     Agrima — Mac 1       |
                 |     dnsmasq DNS Server   |
                 |        10.7.25.7         |
                 +------------+-------------+
                              |
                              | app.routex.test
                              | → 10.7.8.7
                              v
                 +--------------------------+
                 |     Suhani — Mac 2       |
                 |      Nginx Edge/LB        |
                 |        10.7.8.7           |
                 |        HTTPS :8443        |
                 +--------------------------+
Evidence

DNS-related evidence is stored in the project evidence directory.

The evidence demonstrates:

Private DNS query for app.routex.test
DNS response containing 10.7.8.7
Client using 10.7.25.7 as the DNS resolver
Wrong DNS server failure
Wrong DNS record failure
Restored working DNS configuration

Refer to the main project README.md and the evidence/ directory
for the complete Phase 1 evidence.