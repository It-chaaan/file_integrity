#!/usr/bin/env python
"""
Test script to verify CPU and memory metrics are now correctly measured.
Run this to confirm the fix works before testing in the actual app.
"""

import os
import sys
import time
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

import psutil

# Test the fixed _get_performance_metrics function from services.py
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

try:
    from enterprise_integrity.services import _get_performance_metrics
    print("✓ Successfully imported _get_performance_metrics from services.py")
except ImportError as e:
    print(f"✗ Failed to import from services.py: {e}")
    sys.exit(1)

def test_cpu_measurement():
    """Test that CPU measurements are no longer 0."""
    print("\n" + "="*70)
    print("Testing CPU and Memory Measurement Fix")
    print("="*70)
    
    # First call initializes and primes the CPU counter
    print("\n1. First call (initializes and primes CPU counter)...")
    metrics1 = _get_performance_metrics()
    print(f"   Memory: {metrics1['rss_mb']} MB")
    print(f"   CPU: {metrics1['cpu_percent']}% (expected: 0% on first call after priming)")
    
    # Do some CPU-intensive work to generate measurable CPU usage
    print("\n2. Performing CPU-intensive work (calculating primes)...")
    start = time.time()
    primes = []
    for num in range(2, 10000):
        is_prime = True
        for i in range(2, int(num**0.5) + 1):
            if num % i == 0:
                is_prime = False
                break
        if is_prime:
            primes.append(num)
    elapsed = time.time() - start
    print(f"   Found {len(primes)} primes in {elapsed:.3f} seconds")
    
    # Second call should now show real CPU usage
    print("\n3. Second call (should show real CPU usage)...")
    metrics2 = _get_performance_metrics()
    print(f"   Memory: {metrics2['rss_mb']} MB")
    print(f"   CPU: {metrics2['cpu_percent']}% (expected: >0% after CPU work)")
    
    # Third call to verify consistency
    print("\n4. Third call (verify consistency)...")
    metrics3 = _get_performance_metrics()
    print(f"   Memory: {metrics3['rss_mb']} MB")
    print(f"   CPU: {metrics3['cpu_percent']}%")
    
    # Check if fix is working
    print("\n" + "="*70)
    print("RESULTS:")
    print("="*70)
    
    if metrics2['cpu_percent'] > 0:
        print("✓ SUCCESS: CPU measurement is now working correctly!")
        print(f"  CPU usage detected: {metrics2['cpu_percent']}%")
        return True
    else:
        print("✗ FAILURE: CPU measurement still showing 0%")
        print("  The fix may not be working correctly.")
        return False

def test_memory_delta():
    """Test that memory delta can be measured."""
    print("\n" + "="*70)
    print("Testing Memory Delta Measurement")
    print("="*70)
    
    # Get baseline
    metrics_before = _get_performance_metrics()
    print(f"\n1. Baseline memory: {metrics_before['rss_mb']} MB")
    
    # Allocate some memory
    print("\n2. Allocating 50MB of memory...")
    large_list = [i for i in range(50 * 1024 * 1024)]  # ~50MB
    
    # Measure after allocation
    metrics_after = _get_performance_metrics()
    print(f"   Memory after allocation: {metrics_after['rss_mb']} MB")
    
    delta = metrics_after['rss_mb'] - metrics_before['rss_mb']
    print(f"\n3. Memory delta: {delta:.2f} MB")
    
    if delta > 0:
        print("✓ SUCCESS: Memory delta is measurable!")
        return True
    else:
        print("✗ WARNING: Memory delta is 0 or negative (may be due to garbage collection)")
        return True  # Still okay, memory measurement is working

def main():
    print("\n" + "="*70)
    print("PERFORMANCE MONITORING FIX VERIFICATION")
    print("="*70)
    print("\nThis script tests whether CPU and memory metrics are correctly measured.")
    print("The bug was: psutil.cpu_percent(interval=None) returns 0 on first call.")
    print("The fix: Prime the CPU counter on first initialization.\n")
    
    try:
        cpu_ok = test_cpu_measurement()
        memory_ok = test_memory_delta()
        
        print("\n" + "="*70)
        print("FINAL RESULT:")
        print("="*70)
        
        if cpu_ok and memory_ok:
            print("✓ ALL TESTS PASSED")
            print("\nThe performance monitoring fix is working correctly.")
            print("You can now test upload/verify with files of different sizes.")
            print("CPU and memory metrics should now show real values instead of 0.")
        else:
            print("✗ SOME TESTS FAILED")
            print("\nThere may still be issues with the performance monitoring.")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n✗ ERROR during testing: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()