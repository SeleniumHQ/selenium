#!/usr/bin/env bash
# Regenerates the self-signed loopback certificate served by the test web servers.
set -euo pipefail
cd "$(dirname "$0")"
openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes \
  -keyout localhost.key -out localhost.crt -days 36500 \
  -subj /CN=localhost -addext subjectAltName=DNS:localhost
