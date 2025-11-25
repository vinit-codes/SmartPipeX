#!/usr/bin/env python3
"""
ESP32 Sensor Data Simulator

This script simulates an ESP32 device sending sensor data to the SmartPipeX ingest API.
It demonstrates how real ESP32 hardware would interact with the system.

Usage: python3 esp32_simulator.py
"""

import json
import time
import random
from datetime import datetime, timezone
import requests
from typing import Dict, Any

class ESP32Simulator:
    def __init__(self, device_id: str = "ESP32_SIMULATOR_001", api_url: str = "http://localhost:3000/api/ingest"):
        self.device_id = device_id
        self.api_url = api_url
        self.base_flow = 3.0  # Base flow rate in L/min
        self.session = requests.Session()
        
    def read_sensors(self) -> Dict[str, Any]:
        """
        Simulate reading from flow rate sensors
        In real ESP32, this would interface with hardware sensors
        """
        # Simulate input flow with some variation
        input_variation = random.uniform(-0.2, 0.2)
        input_flow = max(0, self.base_flow + input_variation)
        
        # Simulate output flow (with potential leak)
        leak_probability = 0.2  # 20% chance of leak
        if random.random() < leak_probability:
            # Simulate leak - output lower than input
            leak_amount = random.uniform(0.1, 0.8)
            output_flow = max(0, input_flow - leak_amount)
        else:
            # Normal operation - minimal difference
            output_flow = max(0, input_flow - random.uniform(0, 0.1))
        
        # Round to realistic sensor precision
        input_flow = round(input_flow, 3)
        output_flow = round(output_flow, 3)
        
        return {
            "inputFlow": input_flow,
            "outputFlow": output_flow,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "deviceId": self.device_id
        }
    
    def send_data(self, sensor_data: Dict[str, Any]) -> bool:
        """
        Send sensor data to the SmartPipeX API
        Returns True if successful, False otherwise
        """
        try:
            headers = {
                'Content-Type': 'application/json',
                # In production, you would add authentication headers here
                # 'Authorization': f'Bearer {self.auth_token}'
            }
            
            response = self.session.post(
                self.api_url,
                json=sensor_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 201:
                result = response.json()
                print(f"✅ Data sent successfully:")
                print(f"   Input: {sensor_data['inputFlow']} L/min")
                print(f"   Output: {sensor_data['outputFlow']} L/min")
                print(f"   Leak: {'Yes' if result['data']['processed']['leakDetected'] else 'No'}")
                if result['data']['processed']['leakDetected']:
                    severity = result['data']['processed']['severity']
                    score = result['data']['processed']['severityScore']
                    print(f"   Severity: {severity.upper()} (score: {score})")
                print(f"   Total readings stored: {result['data']['totalReadings']}")
                return True
            else:
                print(f"❌ Error: {response.status_code} - {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Network error: {e}")
            return False
    
    def run_continuous(self, interval_seconds: int = 5):
        """
        Run continuous sensor reading and data transmission
        """
        print(f"🚀 Starting ESP32 Simulator for {self.device_id}")
        print(f"📡 Sending data to: {self.api_url}")
        print(f"⏱️  Interval: {interval_seconds} seconds")
        print("🛑 Press Ctrl+C to stop\n")
        
        try:
            while True:
                # Read sensor data
                sensor_data = self.read_sensors()
                
                # Send to API
                success = self.send_data(sensor_data)
                
                if not success:
                    print("⚠️  Retrying in 10 seconds...")
                    time.sleep(10)
                    continue
                
                print(f"💤 Waiting {interval_seconds} seconds...\n")
                time.sleep(interval_seconds)
                
        except KeyboardInterrupt:
            print("\n🛑 Simulator stopped by user")
        except Exception as e:
            print(f"\n💥 Unexpected error: {e}")

def main():
    # Create simulator instance
    simulator = ESP32Simulator()
    
    # Test single reading
    print("🧪 Testing single sensor reading:")
    test_data = simulator.read_sensors()
    print(f"📊 Generated data: {json.dumps(test_data, indent=2)}")
    
    # Send test data
    success = simulator.send_data(test_data)
    
    if success:
        print("\n✅ Test successful! Starting continuous simulation...")
        time.sleep(2)
        simulator.run_continuous(interval_seconds=3)
    else:
        print("\n❌ Test failed. Please check if the SmartPipeX server is running on localhost:3000")

if __name__ == "__main__":
    main()
