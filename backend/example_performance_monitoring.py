"""
Example: CPU and GPU Monitoring for Cryptographic Operations

This script demonstrates how to use the enhanced performance monitoring system
to track CPU, GPU, memory, and execution time during:
- Hash generation
- Signature generation
- Signature verification

Run this to see real-time performance metrics.
"""

import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from crypto_engine import generate_file_hash, generate_key_pair, sign_hash, verify_signature
from crypto_performance_monitor import CryptoOperationMonitor
from performance_monitor import measure_performance, measure_crypto_operation, get_operation_performance


def demo_individual_operations():
    """Demonstrate monitoring individual cryptographic operations."""
    print("\n" + "="*70)
    print("DEMO 1: Individual Operations with Performance Monitoring")
    print("="*70)
    
    # Create a test file for hashing (using an existing file or creating a temporary one)
    test_file = Path("test_document.txt")
    if not test_file.exists():
        test_file.write_text("This is a test document for cryptographic operations. " * 100)
    
    monitor = CryptoOperationMonitor(verbose=True, export_metrics=False)
    
    # 1. Hash Generation
    print("\n[OPERATION 1] File Hash Generation")
    print("-" * 70)
    hash_result = monitor.hash_file_with_monitoring(test_file)
    print(f"\n✓ Hash generated: {hash_result['hash'][:32]}...")
    print(f"  Time: {hash_result['metrics']['data']['elapsed_ms']}ms")
    print(f"  Memory: {hash_result['metrics']['data']['memory']['delta_mb']}MB")
    print(f"  CPU: {hash_result['metrics']['data']['cpu']['process_percent']}%")
    
    # 2. Key Generation
    print("\n[OPERATION 2] ECDSA Key Pair Generation")
    print("-" * 70)
    keys_result = monitor.generate_keys_with_monitoring()
    print(f"\n✓ Keys generated")
    print(f"  Algorithm: {keys_result['key_type']}")
    print(f"  Time: {keys_result['metrics']['data']['elapsed_ms']}ms")
    print(f"  Memory: {keys_result['metrics']['data']['memory']['delta_mb']}MB")
    print(f"  CPU: {keys_result['metrics']['data']['cpu']['process_percent']}%")
    
    # 3. Signature Generation
    print("\n[OPERATION 3] Digital Signature Generation")
    print("-" * 70)
    sign_result = monitor.sign_with_monitoring(
        keys_result['private_key'],
        hash_result['hash'],
        test_file.name
    )
    print(f"\n✓ Signature generated: {sign_result['signature'][:32]}...")
    print(f"  Time: {sign_result['metrics']['data']['elapsed_ms']}ms")
    print(f"  Memory: {sign_result['metrics']['data']['memory']['delta_mb']}MB")
    print(f"  CPU: {sign_result['metrics']['data']['cpu']['process_percent']}%")
    
    # 4. Signature Verification
    print("\n[OPERATION 4] Digital Signature Verification")
    print("-" * 70)
    verify_result = monitor.verify_with_monitoring(
        keys_result['public_key'],
        sign_result['signature'],
        hash_result['hash'],
        test_file.name
    )
    print(f"\n✓ Verification Status: {verify_result['status']}")
    print(f"  Time: {verify_result['metrics']['data']['elapsed_ms']}ms")
    print(f"  Memory: {verify_result['metrics']['data']['memory']['delta_mb']}MB")
    print(f"  CPU: {verify_result['metrics']['data']['cpu']['process_percent']}%")
    
    # Cleanup
    test_file.unlink(missing_ok=True)
    
    return monitor


def demo_full_workflow():
    """Demonstrate complete workflow monitoring."""
    print("\n" + "="*70)
    print("DEMO 2: Complete Cryptographic Workflow")
    print("="*70)
    
    # Create a test file
    test_file = Path("test_workflow.txt")
    if not test_file.exists():
        test_file.write_text("Complete workflow test. " * 50)
    
    monitor = CryptoOperationMonitor(verbose=True, export_metrics=False)
    
    # Run full workflow with monitoring
    workflow_result = monitor.full_workflow_monitoring(test_file)
    
    # Cleanup
    test_file.unlink(missing_ok=True)
    
    return workflow_result


def demo_context_manager():
    """Demonstrate using context manager directly."""
    print("\n" + "="*70)
    print("DEMO 3: Using Context Manager Directly")
    print("="*70)
    
    test_file = Path("test_context.txt")
    if not test_file.exists():
        test_file.write_text("Context manager test. " * 100)
    
    print("\nExample: Monitoring a custom operation")
    print("-" * 70)
    
    # Using measure_performance directly
    with measure_performance("custom_operation", verbose=True) as metrics:
        hash_value = generate_file_hash(test_file)
    
    print(f"\n✓ Custom operation completed")
    print(f"  Hash: {hash_value[:32]}...")
    print(f"  Performance data available in metrics['data']")
    
    # Access raw metrics
    perf_data = metrics['data']
    print(f"\n  Elapsed time: {perf_data['elapsed_ms']}ms")
    print(f"  Memory delta: {perf_data['memory']['delta_mb']}MB")
    print(f"  CPU usage: {perf_data['cpu']['process_percent']}%")
    print(f"  System CPU: {perf_data['system']['cpu_percent']}%")
    
    if 'gpu' in perf_data and perf_data['gpu'].get('available'):
        print(f"  GPU available: Yes")
        for device in perf_data['gpu']['devices']:
            print(f"    - {device['name']}: {device['gpu_percent']}% utilization")
    else:
        print(f"  GPU monitoring: Not available")
    
    test_file.unlink(missing_ok=True)


def demo_snapshot():
    """Demonstrate getting instantaneous performance snapshot."""
    print("\n" + "="*70)
    print("DEMO 4: Real-time Performance Snapshot")
    print("="*70)
    
    from performance_monitor import get_operation_performance
    
    print("\nCapturing current system metrics...")
    snapshot = get_operation_performance("system_snapshot")
    
    print("\n✓ Snapshot captured")
    print("\nCPU Metrics:")
    print(f"  Process CPU: {snapshot['cpu']['process_cpu_percent']}%")
    print(f"  System CPU: {snapshot['cpu']['system_cpu_percent']}%")
    print(f"  Threads: {snapshot['cpu']['num_threads']}")
    
    print("\nMemory Metrics:")
    print(f"  Process RSS: {snapshot['memory']['rss_mb']}MB")
    print(f"  Process VMS: {snapshot['memory']['vms_mb']}MB")
    print(f"  Percent: {snapshot['memory']['percent']}%")
    
    print("\nSystem Metrics:")
    print(f"  System CPU: {snapshot['system']['cpu_percent']}%")
    print(f"  System Memory: {snapshot['system']['memory_percent']}%")
    print(f"  Available Memory: {snapshot['system']['available_memory_mb']}MB")
    
    if snapshot['gpu'].get('available'):
        print("\nGPU Metrics:")
        for device in snapshot['gpu']['devices']:
            print(f"  {device['name']}:")
            print(f"    Utilization: {device['gpu_percent']}%")
            print(f"    Memory: {device['memory_used_mb']}/{device['memory_total_mb']}MB")
            print(f"    Temperature: {device['temperature_celsius']}°C")
            if device['power_watts']:
                print(f"    Power: {device['power_watts']}W")
    else:
        print("\nGPU: Not available")


def demo_large_file_performance():
    """Demonstrate monitoring with larger file processing."""
    print("\n" + "="*70)
    print("DEMO 5: Large File Performance Monitoring")
    print("="*70)
    
    # Create a larger test file (10MB)
    large_file = Path("test_large.bin")
    file_size_mb = 10
    
    print(f"\nCreating {file_size_mb}MB test file...")
    with open(large_file, 'wb') as f:
        f.write(b'x' * (file_size_mb * 1024 * 1024))
    
    monitor = CryptoOperationMonitor(verbose=True, export_metrics=False)
    
    print(f"\nMonitoring hash generation of {file_size_mb}MB file...")
    print("-" * 70)
    
    result = monitor.hash_file_with_monitoring(large_file)
    
    print(f"\n✓ Large file hash generated")
    print(f"  Hash: {result['hash'][:32]}...")
    print(f"  File Size: {result['file_size_mb']}MB")
    print(f"  Time: {result['metrics']['data']['elapsed_ms']}ms")
    print(f"  Memory: {result['metrics']['data']['memory']['delta_mb']}MB")
    print(f"  CPU: {result['metrics']['data']['cpu']['process_percent']}%")
    print(f"  Throughput: {result['file_size_mb'] / (result['metrics']['data']['elapsed_ms'] / 1000):.2f} MB/s")
    
    # Cleanup
    large_file.unlink(missing_ok=True)


def main():
    """Run all demonstrations."""
    print("\n" + "="*70)
    print("CRYPTOGRAPHIC OPERATIONS - PERFORMANCE MONITORING DEMONSTRATION")
    print("="*70)
    
    try:
        # Run demos
        demo_individual_operations()
        demo_full_workflow()
        demo_context_manager()
        demo_snapshot()
        demo_large_file_performance()
        
        print("\n" + "="*70)
        print("✓ ALL DEMONSTRATIONS COMPLETED")
        print("="*70)
        print("\nKey Features Demonstrated:")
        print("  ✓ Individual operation monitoring (hash, sign, verify)")
        print("  ✓ Complete workflow monitoring")
        print("  ✓ Context manager usage")
        print("  ✓ Real-time performance snapshots")
        print("  ✓ Large file performance analysis")
        print("\nMetrics Tracked:")
        print("  ✓ Execution time (milliseconds)")
        print("  ✓ Memory usage (MB delta)")
        print("  ✓ CPU utilization (%)")
        print("  ✓ GPU utilization (if available)")
        print("  ✓ System health metrics")
        print("\n" + "="*70 + "\n")
        
    except Exception as e:
        print(f"\n✗ Error during demonstration: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
