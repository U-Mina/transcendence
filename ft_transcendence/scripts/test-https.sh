#!/bin/bash

set -u

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CA_CERT="$PROJECT_ROOT/.certificates/ca/ca.crt"

API_GATEWAY_PORT="${API_GATEWAY_PORT:-3000}"
USER_SERVICE_PORT="${USER_SERVICE_PORT:-3001}"
EVENT_SERVICE_PORT="${EVENT_SERVICE_PORT:-3002}"
PROMETHEUS_PORT="${PROMETHEUS_PORT:-9090}"
GRAFANA_PORT="${GRAFANA_PORT:-3003}"

if [ ! -f "$CA_CERT" ]; then
    echo "ERROR: CA certificate not found: $CA_CERT"
    exit 1
fi

failures=0

test_endpoint() {
    local name="$1"
    local url="$2"

    printf "%-20s " "$name"

    if curl \
        --fail \
        --silent \
        --show-error \
        --cacert "$CA_CERT" \
        --connect-timeout 5 \
        --max-time 10 \
        "$url" >/dev/null; then
        echo "OK"
    else
        echo "FAILED"
        failures=$((failures + 1))
    fi
}

test_endpoint "API Gateway" \
    "https://localhost:${API_GATEWAY_PORT}/health"

test_endpoint "User Service" \
    "https://localhost:${USER_SERVICE_PORT}/health"

test_endpoint "Event Service" \
    "https://localhost:${EVENT_SERVICE_PORT}/health"

test_endpoint "Prometheus" \
    "https://localhost:${PROMETHEUS_PORT}/-/healthy"

test_endpoint "Grafana" \
    "https://localhost:${GRAFANA_PORT}/api/health"

echo

if [ "$failures" -eq 0 ]; then
    echo "All HTTPS endpoints passed."
    exit 0
fi

echo "$failures HTTPS test(s) failed."
exit 1