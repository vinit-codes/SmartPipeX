#!/usr/bin/env python3
"""Send realistic ESP32-style readings to the SmartPipeX ingestion API."""

from __future__ import annotations

import argparse
import os
import random
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

import requests


@dataclass(frozen=True)
class SimulatorConfig:
    url: str
    device_id: str
    api_key: str | None
    interval: float
    timeout: float


class ESP32Simulator:
    def __init__(self, config: SimulatorConfig) -> None:
        self.config = config
        self.session = requests.Session()
        self.base_flow = 3.1

    def create_reading(self) -> dict[str, Any]:
        input_flow = max(0.0, self.base_flow + random.uniform(-0.22, 0.22))
        leak = random.random() < 0.18
        loss = random.uniform(0.4, 1.25) if leak else random.uniform(0.02, 0.12)
        output_flow = max(0.0, input_flow - loss)

        return {
            "deviceId": self.config.device_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "inputFlow": round(input_flow, 3),
            "outputFlow": round(output_flow, 3),
        }

    def send(self, reading: dict[str, Any]) -> bool:
        headers = {"Content-Type": "application/json"}
        if self.config.api_key:
            headers["x-api-key"] = self.config.api_key

        try:
            response = self.session.post(
                self.config.url,
                json=reading,
                headers=headers,
                timeout=self.config.timeout,
            )
        except requests.RequestException as exc:
            print(f"Network error: {exc}", file=sys.stderr)
            return False

        try:
            payload = response.json()
        except requests.JSONDecodeError:
            print(
                f"Unexpected response ({response.status_code}): {response.text}",
                file=sys.stderr,
            )
            return False

        if response.status_code != 201 or not payload.get("success"):
            error = payload.get("error", {})
            print(
                f"Ingestion failed ({response.status_code}): "
                f"{error.get('code', 'UNKNOWN')} - {error.get('message', payload)}",
                file=sys.stderr,
            )
            return False

        stored = payload["data"]
        print(
            f"stored {stored['deviceId']} | "
            f"in {stored['inputFlow']:.3f} L/min | "
            f"out {stored['outputFlow']:.3f} L/min | "
            f"loss {stored['waterLoss']:.3f} L/min | "
            f"leak {'yes' if stored['leakDetected'] else 'no'}"
        )
        return True

    def run(self, once: bool) -> int:
        while True:
            success = self.send(self.create_reading())
            if once:
                return 0 if success else 1
            time.sleep(self.config.interval if success else max(5, self.config.interval))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--url",
        default=os.getenv("SMARTPIPEX_API_URL", "http://localhost:3000/api/ingest"),
        help="SmartPipeX ingestion endpoint",
    )
    parser.add_argument(
        "--device-id",
        default=os.getenv("SMARTPIPEX_DEVICE_ID", "ESP32_SIMULATOR_001"),
    )
    parser.add_argument(
        "--api-key",
        default=os.getenv("SMARTPIPEX_API_KEY"),
        help="Value sent in the x-api-key header",
    )
    parser.add_argument("--interval", type=float, default=5.0)
    parser.add_argument("--timeout", type=float, default=10.0)
    parser.add_argument("--once", action="store_true", help="Send one reading and exit")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    config = SimulatorConfig(
        url=args.url,
        device_id=args.device_id,
        api_key=args.api_key,
        interval=max(1.0, args.interval),
        timeout=max(1.0, args.timeout),
    )
    print(f"SmartPipeX simulator -> {config.url} ({config.device_id})")
    return ESP32Simulator(config).run(once=args.once)


if __name__ == "__main__":
    raise SystemExit(main())
