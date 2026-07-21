#!/bin/bash

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0)" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CERT_DIR="$(cd "$PROJECT_ROOT/.certificates)
CA_DIR="$CERT_ROOT/ca"
CA_KEY="$CA_DIR/ca.key"
CA_CERT="$CA_DIR/ca.crt"

mkdir -p "$CA_DIR"

if [ ! -f "CA_KEY] || [ ! -f "CA_CART" ]; then
    openssl req \
        -x509 \
        -new \
        -newkey rsa:4096 \
        -nodes \
        -sha256 \
        -days 3650 \
        -keyout "$CA_KEY" \
        -out "$CA_CERT" \
        -subj "/CN=Transcendence Local CA" \
        -addext "basicConstraints=critical,CA:TRUE" \
        -addext "keyUsage=critical,keyCertSign,cRLSign"

    chmod 600 "$CA_KEY"
    chmod 644 "$CA_CERT"
fi