#!/bin/bash

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CERT_DIR="$PROJECT_ROOT/.certificates"
CA_DIR="$CERT_DIR/ca"
CA_KEY="$CA_DIR/ca.key"
CA_CERT="$CA_DIR/ca.crt"

mkdir -p "$CA_DIR"

if [ ! -f "$CA_KEY" ] || [ ! -f "$CA_CERT" ]; then
    openssl req \
        -x509 \
        -newkey rsa:4096 \
        -noenc \
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

generate_service_certificate() {
    SERVICE_NAME="$1"
    SUBJECT_ALT_NAMES="$2"

    SERVICE_DIR="$CERT_DIR/$SERVICE_NAME"
    SERVICE_KEY="$SERVICE_DIR/$SERVICE_NAME.key"
    SERVICE_CSR="$SERVICE_DIR/$SERVICE_NAME.csr"
    SERVICE_CERT="$SERVICE_DIR/$SERVICE_NAME.crt"
    SERVICE_EXT="$SERVICE_DIR/$SERVICE_NAME.ext"

    mkdir -p "$SERVICE_DIR"

    if [ -f "$SERVICE_KEY" ] && [ -f "$SERVICE_CERT" ]; then
        return
    fi


    openssl req \
        -new \
        -newkey rsa:4096 \
        -noenc \
        -keyout "$SERVICE_KEY" \
        -out "$SERVICE_CSR" \
        -subj "/CN=$SERVICE_NAME"


    cat > "$SERVICE_EXT" <<EOF
basicConstraints=critical,CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=$SUBJECT_ALT_NAMES
EOF

    openssl x509 \
        -req \
        -in "$SERVICE_CSR" \
        -CA "$CA_CERT" \
        -CAkey "$CA_KEY" \
        -CAcreateserial \
        -out "$SERVICE_CERT" \
        -days 365 \
        -sha256 \
        -extfile "$SERVICE_EXT"

    rm -f "$SERVICE_CSR" "$SERVICE_EXT"

    chmod 644 "$SERVICE_KEY"
    chmod 644 "$SERVICE_CERT"
}

generate_service_certificate \
    "api-gateway" \
    "DNS:api-gateway,DNS:localhost,IP:127.0.0.1"

generate_service_certificate \
    "user-service" \
    "DNS:user-service,DNS:localhost,IP:127.0.0.1"

generate_service_certificate \
    "event-service" \
    "DNS:event-service,DNS:localhost,IP:127.0.0.1"

generate_service_certificate \
    "database" \
    "DNS:database,DNS:localhost,IP:127.0.0.1"

generate_service_certificate \
    "prometheus" \
    "DNS:prometheus,DNS:localhost,IP:127.0.0.1"

generate_service_certificate \
    "grafana" \
    "DNS:grafana,DNS:localhost,IP:127.0.0.1"

generate_service_certificate \
    "alertmanager" \
    "DNS:alertmanager,DNS:localhost,IP:127.0.0.1"    