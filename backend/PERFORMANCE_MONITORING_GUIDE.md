"""
CPU and GPU Performance Monitoring for Cryptographic Operations
================================================================

Complete guide for monitoring CPU, GPU, memory, and performance metrics
during cryptographic operations (hashing, signing, verification).

## Table of Contents
1. Overview
2. Installation
3. Quick Start
4. Usage Patterns
5. Advanced Usage
6. Metrics Explained
7. GPU Monitoring
8. Best Practices
9. Troubleshooting
"""

# =============================================================================
# 1. OVERVIEW
# =============================================================================

"""
The monitoring system provides real-time tracking of system resources
during cryptographic operations:

✓ CPU Monitoring
  - Process CPU utilization (%)
  - System-wide CPU utilization (%)
  - Thread count
  - CPU time (user and system)

✓ GPU Monitoring (NVIDIA)
  - GPU utilization (%)
  - Memory usage (MB)
  - Temperature (°C)
  - Power consumption (W)

✓ Memory Monitoring
  - Process memory (RSS, VMS)
  - Memory delta (before/after)
  - Memory percentage
  - System memory availability

✓ Performance Metrics
  - Execution time (milliseconds)
  - Throughput (MB/s for file operations)
  - Operation-specific timings
"""

# =============================================================================
# 2. INSTALLATION
# =============================================================================

"""
Step 1: Install dependencies
  pip install -r requirements.txt

Step 2: Verify installation
  python -c "import psutil; import pynvml; print('✓ All dependencies installed')"

Required packages:
- psutil==7.2.2          (CPU, memory, process monitoring)
- pynvml==12.535.161     (NVIDIA GPU monitoring, optional)

Note: pynvml requires NVIDIA drivers to be installed.
      It will gracefully fall back if GPU is not available.
"""

# =============================================================================
# 3. QUICK START
# =============================================================================

"""
Pattern 1: Using the CryptoOperationMonitor wrapper
----------------------------------------------------

from crypto_performance_monitor import CryptoOperationMonitor

# Initialize monitor
monitor = CryptoOperationMonitor(verbose=True, export_metrics=False)

# Monitor file hashing
hash_result = monitor.hash_file_with_monitoring("document.pdf")
print(f"Hash: {hash_result['hash']}")
print(f"Time: {hash_result['metrics']['data']['elapsed_ms']}ms")
print(f"CPU: {hash_result['metrics']['data']['cpu']['process_percent']}%")
print(f"Memory: {hash_result['metrics']['data']['memory']['delta_mb']}MB")

# Monitor signature generation
sign_result = monitor.sign_with_monitoring(private_key, hash_value, "document")
print(f"Signature: {sign_result['signature']}")
print(f"Time: {sign_result['metrics']['data']['elapsed_ms']}ms")

# Monitor signature verification
verify_result = monitor.verify_with_monitoring(public_key, signature, hash_value, "document")
print(f"Valid: {verify_result['is_valid']}")
print(f"Time: {verify_result['metrics']['data']['elapsed_ms']}ms")


Pattern 2: Using context managers directly
--------------------------------------------

from performance_monitor import measure_performance
from crypto_engine import generate_file_hash

with measure_performance("file_hash", verbose=True) as metrics:
    hash_value = generate_file_hash("document.pdf")

print(metrics['data'])  # Full metrics dictionary


Pattern 3: Monitoring a complete workflow
------------------------------------------

from crypto_performance_monitor import CryptoOperationMonitor

monitor = CryptoOperationMonitor(verbose=True)
workflow_result = monitor.full_workflow_monitoring("document.pdf")

# Results include:
# - file_path
# - file_size_mb
# - hash
# - signature
# - is_valid
# - steps (detailed metrics for each step)
# - summary (aggregate metrics)


Pattern 4: Real-time system snapshot
-------------------------------------

from performance_monitor import get_operation_performance

snapshot = get_operation_performance("system_snapshot")

print(f"CPU: {snapshot['cpu']['process_cpu_percent']}%")
print(f"Memory: {snapshot['memory']['rss_mb']}MB")
print(f"GPU available: {snapshot['gpu']['available']}")
"""

# =============================================================================
# 4. USAGE PATTERNS
# =============================================================================

"""
PATTERN A: Monitor Individual Hash Generation
----------------------------------------------

from crypto_performance_monitor import CryptoOperationMonitor

monitor = CryptoOperationMonitor(verbose=True)

# For files
result = monitor.hash_file_with_monitoring("large_document.pdf")
print(f"Hash computed in {result['metrics']['data']['elapsed_ms']}ms")

# For bytes
result = monitor.hash_bytes_with_monitoring(b"data to hash", label="user_input")
print(f"Hash computed in {result['metrics']['data']['elapsed_ms']}ms")


PATTERN B: Monitor Signature Operations
----------------------------------------

from crypto_performance_monitor import CryptoOperationMonitor
from crypto_engine import generate_key_pair

monitor = CryptoOperationMonitor(verbose=True)
private_key, public_key = generate_key_pair()

# Sign with monitoring
sign_result = monitor.sign_with_monitoring(
    private_key,
    hash_value,
    "document"
)

# Verify with monitoring
verify_result = monitor.verify_with_monitoring(
    public_key,
    sign_result['signature'],
    hash_value,
    "document"
)

print(f"Signature valid: {verify_result['is_valid']}")


PATTERN C: Batch Operations with History
------------------------------------------

from crypto_performance_monitor import CryptoOperationMonitor
from pathlib import Path

monitor = CryptoOperationMonitor(verbose=False)

# Process multiple files
for file_path in Path("documents/").glob("*.pdf"):
    result = monitor.hash_file_with_monitoring(file_path)
    print(f"{file_path.name}: {result['metrics']['data']['elapsed_ms']}ms")

# View history
monitor.print_history_summary()


PATTERN D: Performance Analysis
--------------------------------

from crypto_performance_monitor import CryptoOperationMonitor

monitor = CryptoOperationMonitor(verbose=False)

# Process a large file
result = monitor.hash_file_with_monitoring("10gb_file.bin")

# Calculate throughput
file_size_mb = result['file_size_mb']
time_ms = result['metrics']['data']['elapsed_ms']
time_seconds = time_ms / 1000
throughput_mbs = file_size_mb / time_seconds

print(f"File size: {file_size_mb}MB")
print(f"Time: {time_ms}ms")
print(f"Throughput: {throughput_mbs:.2f}MB/s")


PATTERN E: Export Metrics to JSON
----------------------------------

from crypto_performance_monitor import CryptoOperationMonitor
from performance_monitor import export_metrics_to_json

monitor = CryptoOperationMonitor(verbose=True, export_metrics=True)

# Metrics will be automatically exported to JSON files
result = monitor.hash_file_with_monitoring("document.pdf")

# Or export manually
export_metrics_to_json(result, "metrics/hash_operation.json")
"""

# =============================================================================
# 5. ADVANCED USAGE
# =============================================================================

"""
ADVANCED 1: Custom Monitoring with Context Manager
---------------------------------------------------

from performance_monitor import measure_performance
import crypto_engine

# Detailed custom monitoring
with measure_performance("custom_crypto_operation", verbose=True) as metrics:
    # Your operation here
    hash1 = crypto_engine.generate_hash_from_bytes(b"data1")
    hash2 = crypto_engine.generate_hash_from_bytes(b"data2")

metrics_data = metrics['data']
print(f"Operation: {metrics_data['operation']}")
print(f"Elapsed: {metrics_data['elapsed_ms']}ms")
print(f"Memory before: {metrics_data['memory']['before_mb']}MB")
print(f"Memory after: {metrics_data['memory']['after_mb']}MB")
print(f"Memory delta: {metrics_data['memory']['delta_mb']}MB")
print(f"CPU percent: {metrics_data['cpu']['process_percent']}%")


ADVANCED 2: Comparing Performance Across Operations
----------------------------------------------------

from crypto_performance_monitor import CryptoOperationMonitor
from pathlib import Path

monitor = CryptoOperationMonitor(verbose=False)

# Test different file sizes
for size_mb in [1, 10, 100]:
    test_file = Path(f"test_{size_mb}mb.bin")
    with open(test_file, 'wb') as f:
        f.write(b'x' * (size_mb * 1024 * 1024))
    
    result = monitor.hash_file_with_monitoring(test_file)
    time_ms = result['metrics']['data']['elapsed_ms']
    throughput = size_mb / (time_ms / 1000)
    
    print(f"{size_mb}MB: {time_ms}ms ({throughput:.1f}MB/s)")
    test_file.unlink()


ADVANCED 3: Monitor with System Health Checks
----------------------------------------------

from performance_monitor import get_operation_performance

# Check system before operation
pre_health = get_operation_performance("pre_check")
print(f"Pre-operation system CPU: {pre_health['system']['cpu_percent']}%")
print(f"Pre-operation memory: {pre_health['memory']['percent']}%")

# Your operation here

# Check system after operation
post_health = get_operation_performance("post_check")
print(f"Post-operation system CPU: {post_health['system']['cpu_percent']}%")
print(f"Post-operation memory: {post_health['memory']['percent']}%")


ADVANCED 4: GPU Monitoring (NVIDIA)
------------------------------------

from performance_monitor import get_operation_performance

metrics = get_operation_performance("check_gpu")

if metrics['gpu']['available']:
    print(f"GPU devices available: {metrics['gpu']['device_count']}")
    for device in metrics['gpu']['devices']:
        print(f"\n{device['name']}:")
        print(f"  Utilization: {device['gpu_percent']}%")
        print(f"  Memory: {device['memory_used_mb']}/{device['memory_total_mb']}MB")
        print(f"  Temperature: {device['temperature_celsius']}°C")
        if device['power_watts']:
            print(f"  Power: {device['power_watts']}W")
else:
    print("No GPU monitoring available")
"""

# =============================================================================
# 6. METRICS EXPLAINED
# =============================================================================

"""
metrics['data'] structure:
{
    'operation': str,                 # Operation name
    'timestamp': str,                 # ISO format timestamp
    'elapsed_ms': float,              # Total execution time in milliseconds
    
    'memory': {
        'before_mb': float,           # Memory before operation (MB)
        'after_mb': float,            # Memory after operation (MB)
        'delta_mb': float,            # Memory change (MB)
        'percent': float,             # Process memory percentage
    },
    
    'cpu': {
        'process_percent': float,     # Process CPU utilization (%)
        'system_percent': float,      # System-wide CPU utilization (%)
        'threads': int,               # Number of threads used
        'user_time_ms': float,        # User mode CPU time (ms)
        'system_time_ms': float,      # System mode CPU time (ms)
    },
    
    'system': {
        'cpu_percent': float,         # System CPU utilization (%)
        'memory_percent': float,      # System memory utilization (%)
    },
    
    'gpu': {                          # Only if available
        'available': bool,
        'device_count': int,
        'devices': [
            {
                'id': int,
                'name': str,
                'gpu_percent': float,         # GPU utilization (%)
                'memory_used_mb': float,      # VRAM used (MB)
                'memory_total_mb': float,     # Total VRAM (MB)
                'memory_percent': float,      # VRAM utilization (%)
                'temperature_celsius': float, # GPU temperature
                'power_watts': float,         # Power consumption (W)
            }
        ]
    }
}


Metrics Interpretation:
-----------------------

elapsed_ms:
  - Execution time of the operation
  - Higher = slower operation
  - Useful for performance optimization

memory delta_mb:
  - Memory allocated or freed during operation
  - Positive = memory allocated
  - Negative = memory freed
  - Large positive values might indicate memory leaks

cpu process_percent:
  - Percentage of single CPU core used by process
  - 100% = using one core fully
  - Can exceed 100% if multi-threaded
  - Cryptographic operations typically single-threaded

cpu system_percent:
  - Total system CPU utilization
  - Higher = system is busy
  - Context for interpreting process_percent

gpu_percent:
  - GPU utilization during operation
  - 0-100% indicating GPU usage
  - Cryptographic operations typically use GPU minimally
"""

# =============================================================================
# 7. GPU MONITORING
# =============================================================================

"""
NVIDIA GPU Support
-------------------

Requirements:
1. NVIDIA GPU
2. NVIDIA drivers installed
3. pynvml package (included in requirements.txt)

Check if GPU is available:
  from performance_monitor import get_operation_performance
  metrics = get_operation_performance("check")
  print(metrics['gpu']['available'])

Metrics provided per GPU:
- GPU utilization (%)
- VRAM usage (MB and %)
- Temperature (°C)
- Power consumption (W)

Note: Cryptographic operations (hashing, signing, verification) rarely
use GPU and will show minimal GPU utilization. GPU monitoring is included
for comprehensive system monitoring.

Troubleshooting GPU monitoring:
- If pynvml import fails, install: pip install pynvml
- If no GPUs detected, check NVIDIA drivers: nvidia-smi
- GPU monitoring automatically disables if unavailable
"""

# =============================================================================
# 8. BEST PRACTICES
# =============================================================================

"""
BEST PRACTICE 1: Use verbose=False for Production
--------------------------------------------------
verbose=True prints formatted output to console.
Use verbose=False in production to reduce overhead.

  monitor = CryptoOperationMonitor(verbose=False)


BEST PRACTICE 2: Export Metrics for Analysis
---------------------------------------------
Set export_metrics=True to save JSON for analysis.
Useful for performance tuning and benchmarking.

  monitor = CryptoOperationMonitor(export_metrics=True)


BEST PRACTICE 3: Monitor in Isolation
--------------------------------------
Run performance tests when system is idle.
Other processes can skew results.

  # Stop other applications before benchmarking


BEST PRACTICE 4: Use Appropriate Measurement for Your Use Case
--------------------------------------------------------------

For quick checks:
  metrics = get_operation_performance("snapshot")

For single operations:
  with measure_performance("operation") as metrics:
      # your code

For cryptographic operations:
  monitor = CryptoOperationMonitor()
  result = monitor.hash_file_with_monitoring(file)

For complete workflows:
  result = monitor.full_workflow_monitoring(file)


BEST PRACTICE 5: Aggregate Multiple Measurements
-------------------------------------------------
Single measurements can be noisy. Run multiple times.

  from crypto_performance_monitor import CryptoOperationMonitor
  
  monitor = CryptoOperationMonitor(verbose=False)
  times = []
  
  for i in range(10):
      result = monitor.hash_file_with_monitoring(file)
      times.append(result['metrics']['data']['elapsed_ms'])
  
  avg_time = sum(times) / len(times)
  print(f"Average time: {avg_time}ms")


BEST PRACTICE 6: Clean Up Resources
------------------------------------
Monitor always cleans up after context manager exit.
For manual usage, call cleanup():

  monitor = PerformanceMonitor()
  # Use monitor
  monitor.cleanup()
"""

# =============================================================================
# 9. TROUBLESHOOTING
# =============================================================================

"""
Issue: GPU monitoring not working
Solution:
  1. Check NVIDIA drivers: nvidia-smi in terminal
  2. Install pynvml: pip install pynvml
  3. System will work without GPU (graceful fallback)

Issue: High memory usage in metrics
Solution:
  1. This is normal for large file operations
  2. Check memory is released (delta_mb becomes negative in next op)
  3. If memory grows unbounded, investigate memory leaks

Issue: CPU percent seems low
Solution:
  1. Cryptographic operations on modern hardware are fast
  2. Operation may complete faster than measurement granularity
  3. Run on larger files or aggregate multiple operations

Issue: Inconsistent timing measurements
Solution:
  1. System load affects measurements
  2. Run tests when system is idle
  3. Average multiple runs for reliable data
  4. Close other applications during benchmarking

Issue: Import errors
Solution:
  1. Install requirements: pip install -r requirements.txt
  2. Check Python version >= 3.8
  3. Use virtual environment if needed
  4. Verify packages installed: pip list

Issue: Permission errors
Solution:
  1. Some GPU monitoring requires elevated privileges
  2. Try running with admin/sudo
  3. Check file permissions for output directories
"""

# =============================================================================
# SUMMARY
# =============================================================================

"""
This monitoring system provides comprehensive CPU, GPU, and memory tracking
for cryptographic operations.

Key files:
- performance_monitor.py                 (Core monitoring engine)
- crypto_performance_monitor.py          (Crypto operation wrapper)
- example_performance_monitoring.py      (Usage examples)

Key classes:
- PerformanceMonitor                     (Low-level monitoring)
- GPUMonitor                             (GPU-specific monitoring)
- CryptoOperationMonitor                 (High-level crypto wrapper)

Key functions:
- measure_performance()                  (Context manager for any operation)
- measure_crypto_operation()             (Context manager for crypto ops)
- get_operation_performance()            (Snapshot metrics)
- export_metrics_to_json()               (Save metrics to file)

For questions or issues, refer to the example_performance_monitoring.py
file for comprehensive usage demonstrations.
"""
