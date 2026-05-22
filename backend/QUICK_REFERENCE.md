"""
QUICK REFERENCE: Performance Monitoring for Crypto Operations
==============================================================

Copy-paste ready code snippets for common use cases.
"""

# ============================================================================
# QUICK REFERENCE 1: Monitor File Hashing
# ============================================================================

"""
from crypto_performance_monitor import CryptoOperationMonitor

monitor = CryptoOperationMonitor(verbose=True)
result = monitor.hash_file_with_monitoring("document.pdf")

# Access results
print(f"Hash: {result['hash']}")
print(f"Time: {result['metrics']['data']['elapsed_ms']}ms")
print(f"CPU: {result['metrics']['data']['cpu']['process_percent']}%")
print(f"Memory: {result['metrics']['data']['memory']['delta_mb']}MB")
"""


# ============================================================================
# QUICK REFERENCE 2: Monitor Key Generation
# ============================================================================

"""
from crypto_performance_monitor import CryptoOperationMonitor

monitor = CryptoOperationMonitor(verbose=True)
result = monitor.generate_keys_with_monitoring()

private_key = result['private_key']
public_key = result['public_key']

print(f"Keys generated in {result['metrics']['data']['elapsed_ms']}ms")
print(f"Memory used: {result['metrics']['data']['memory']['delta_mb']}MB")
"""


# ============================================================================
# QUICK REFERENCE 3: Monitor Signature Generation
# ============================================================================

"""
from crypto_performance_monitor import CryptoOperationMonitor

monitor = CryptoOperationMonitor(verbose=True)

result = monitor.sign_with_monitoring(
    private_key,
    hash_value,
    "document_name"
)

signature = result['signature']
print(f"Signed in {result['metrics']['data']['elapsed_ms']}ms")
"""


# ============================================================================
# QUICK REFERENCE 4: Monitor Signature Verification
# ============================================================================

"""
from crypto_performance_monitor import CryptoOperationMonitor

monitor = CryptoOperationMonitor(verbose=True)

result = monitor.verify_with_monitoring(
    public_key,
    signature,
    hash_value,
    "document_name"
)

is_valid = result['is_valid']
print(f"Verified in {result['metrics']['data']['elapsed_ms']}ms")
print(f"Valid: {result['status']}")
"""


# ============================================================================
# QUICK REFERENCE 5: Complete Workflow (Hash → Sign → Verify)
# ============================================================================

"""
from crypto_performance_monitor import CryptoOperationMonitor

monitor = CryptoOperationMonitor(verbose=True)
result = monitor.full_workflow_monitoring("document.pdf")

print(f"File: {result['file_path']}")
print(f"Valid: {result['is_valid']}")
print(f"Total time: {result['summary']['total_elapsed_ms']}ms")
print(f"Peak CPU: {result['summary']['peak_cpu_percent']}%")
"""


# ============================================================================
# QUICK REFERENCE 6: Get Metrics for Multiple Files
# ============================================================================

"""
from crypto_performance_monitor import CryptoOperationMonitor
from pathlib import Path

monitor = CryptoOperationMonitor(verbose=False)

for file_path in Path("documents/").glob("*.pdf"):
    result = monitor.hash_file_with_monitoring(file_path)
    time_ms = result['metrics']['data']['elapsed_ms']
    print(f"{file_path.name}: {time_ms}ms")

# Print summary
monitor.print_history_summary()
"""


# ============================================================================
# QUICK REFERENCE 7: Calculate Throughput (MB/s)
# ============================================================================

"""
from crypto_performance_monitor import CryptoOperationMonitor

monitor = CryptoOperationMonitor(verbose=True)
result = monitor.hash_file_with_monitoring("large_file.bin")

file_size_mb = result['file_size_mb']
time_ms = result['metrics']['data']['elapsed_ms']
throughput = file_size_mb / (time_ms / 1000)

print(f"File size: {file_size_mb}MB")
print(f"Time: {time_ms}ms")
print(f"Throughput: {throughput:.2f}MB/s")
"""


# ============================================================================
# QUICK REFERENCE 8: Monitor with Context Manager
# ============================================================================

"""
from performance_monitor import measure_performance
from crypto_engine import generate_file_hash

with measure_performance("hash_operation", verbose=True) as metrics:
    hash_value = generate_file_hash("document.pdf")

print(f"Hash: {hash_value}")
print(f"Metrics: {metrics['data']}")
"""


# ============================================================================
# QUICK REFERENCE 9: Get System Snapshot
# ============================================================================

"""
from performance_monitor import get_operation_performance

snapshot = get_operation_performance("system_check")

print(f"CPU: {snapshot['cpu']['process_cpu_percent']}%")
print(f"Memory: {snapshot['memory']['rss_mb']}MB")
print(f"System CPU: {snapshot['system']['cpu_percent']}%")
print(f"GPU available: {snapshot['gpu']['available']}")
"""


# ============================================================================
# QUICK REFERENCE 10: Check GPU Status
# ============================================================================

"""
from performance_monitor import get_operation_performance

metrics = get_operation_performance("gpu_check")

if metrics['gpu']['available']:
    for device in metrics['gpu']['devices']:
        print(f"{device['name']}: {device['gpu_percent']}% util")
else:
    print("GPU monitoring not available")
"""


# ============================================================================
# QUICK REFERENCE 11: Export Metrics to JSON
# ============================================================================

"""
from crypto_performance_monitor import CryptoOperationMonitor
from performance_monitor import export_metrics_to_json

monitor = CryptoOperationMonitor(verbose=True)
result = monitor.hash_file_with_monitoring("document.pdf")

# Export to JSON
export_metrics_to_json(result, "metrics/hash_operation.json")

# View the JSON file to see detailed metrics
"""


# ============================================================================
# QUICK REFERENCE 12: Batch Processing with Metrics Collection
# ============================================================================

"""
from crypto_performance_monitor import CryptoOperationMonitor
from pathlib import Path

monitor = CryptoOperationMonitor(verbose=False, export_metrics=True)
results = []

# Process multiple files
for file_path in Path("documents/").glob("*.pdf"):
    result = monitor.hash_file_with_monitoring(file_path)
    results.append({
        'file': file_path.name,
        'size_mb': result['file_size_mb'],
        'time_ms': result['metrics']['data']['elapsed_ms'],
        'cpu_percent': result['metrics']['data']['cpu']['process_percent'],
    })

# Print summary table
for r in results:
    size = r['size_mb']
    time = r['time_ms']
    throughput = size / (time / 1000) if time > 0 else 0
    print(f"{r['file']:30s} {size:10.2f}MB {time:10.2f}ms {throughput:10.2f}MB/s")
"""


# ============================================================================
# QUICK REFERENCE 13: Monitor Custom Crypto Sequence
# ============================================================================

"""
from crypto_performance_monitor import CryptoOperationMonitor
from crypto_engine import generate_key_pair

monitor = CryptoOperationMonitor(verbose=False)

# Generate keys
keys = monitor.generate_keys_with_monitoring()
print(f"Key generation: {keys['metrics']['data']['elapsed_ms']}ms")

# Hash multiple documents
files = ["doc1.pdf", "doc2.pdf", "doc3.pdf"]
hashes = []

for file_path in files:
    result = monitor.hash_file_with_monitoring(file_path)
    hashes.append(result['hash'])
    print(f"Hashed {file_path}: {result['metrics']['data']['elapsed_ms']}ms")

# Sign all hashes
for i, file_path in enumerate(files):
    result = monitor.sign_with_monitoring(
        keys['private_key'],
        hashes[i],
        file_path
    )
    print(f"Signed {file_path}: {result['metrics']['data']['elapsed_ms']}ms")
"""


# ============================================================================
# QUICK REFERENCE 14: Performance Comparison
# ============================================================================

"""
from crypto_performance_monitor import CryptoOperationMonitor
from pathlib import Path

monitor = CryptoOperationMonitor(verbose=False)

# Compare performance across file sizes
print("Performance Analysis:")
print(f"{'Size':<15} {'Time (ms)':<15} {'CPU %':<15} {'Throughput':<15}")
print("-" * 60)

for size_mb in [1, 5, 10, 50, 100]:
    # Create test file
    test_file = Path(f"test_{size_mb}mb.bin")
    with open(test_file, 'wb') as f:
        f.write(b'x' * (size_mb * 1024 * 1024))
    
    # Measure
    result = monitor.hash_file_with_monitoring(test_file)
    time_ms = result['metrics']['data']['elapsed_ms']
    cpu_percent = result['metrics']['data']['cpu']['process_percent']
    throughput = size_mb / (time_ms / 1000) if time_ms > 0 else 0
    
    print(f"{size_mb}MB{'':<10} {time_ms:<15.2f} {cpu_percent:<15.1f} {throughput:<15.2f}MB/s")
    
    # Cleanup
    test_file.unlink()
"""


# ============================================================================
# QUICK REFERENCE 15: Advanced - Direct Monitor Usage
# ============================================================================

"""
from performance_monitor import PerformanceMonitor
import time

monitor = PerformanceMonitor()

# Take baseline measurements
pre_cpu = monitor.get_cpu_info()
pre_mem = monitor.get_memory_info()
pre_gpu = monitor.get_gpu_info()

print(f"Before operation:")
print(f"  CPU: {pre_cpu['process_cpu_percent']}%")
print(f"  Memory: {pre_mem['rss_mb']}MB")
print(f"  GPU: {pre_gpu}")

# Run your operation
time.sleep(1)

# Take post-operation measurements
post_cpu = monitor.get_cpu_info()
post_mem = monitor.get_memory_info()
post_gpu = monitor.get_gpu_info()

print(f"After operation:")
print(f"  CPU: {post_cpu['process_cpu_percent']}%")
print(f"  Memory: {post_mem['rss_mb']}MB")
print(f"  GPU: {post_gpu}")

# Cleanup
monitor.cleanup()
"""


# ============================================================================
# INTEGRATION EXAMPLE: Django View
# ============================================================================

"""
from django.http import JsonResponse
from crypto_performance_monitor import CryptoOperationMonitor

def hash_file_view(request):
    if request.method == 'POST':
        file_obj = request.FILES['file']
        
        # Monitor the hashing operation
        monitor = CryptoOperationMonitor(verbose=False)
        result = monitor.hash_file_with_monitoring(file_obj.temporary_file_path())
        
        return JsonResponse({
            'hash': result['hash'],
            'file_size_mb': result['file_size_mb'],
            'time_ms': result['metrics']['data']['elapsed_ms'],
            'cpu_percent': result['metrics']['data']['cpu']['process_percent'],
        })
"""


# ============================================================================
# INTEGRATION EXAMPLE: API Endpoint
# ============================================================================

"""
from fastapi import FastAPI, UploadFile, File
from crypto_performance_monitor import CryptoOperationMonitor
import tempfile

app = FastAPI()

@app.post("/api/hash")
async def hash_file(file: UploadFile = File(...)):
    monitor = CryptoOperationMonitor(verbose=False)
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name
    
    # Monitor hashing
    result = monitor.hash_file_with_monitoring(tmp_path)
    
    return {
        'filename': file.filename,
        'hash': result['hash'],
        'time_ms': result['metrics']['data']['elapsed_ms'],
        'cpu_percent': result['metrics']['data']['cpu']['process_percent'],
        'memory_mb': result['metrics']['data']['memory']['delta_mb'],
    }
"""


# ============================================================================
# Setup Instructions
# ============================================================================

"""
1. Install dependencies:
   pip install -r requirements.txt

2. Import and use:
   from crypto_performance_monitor import CryptoOperationMonitor
   
   monitor = CryptoOperationMonitor(verbose=True)
   result = monitor.hash_file_with_monitoring("file.pdf")

3. View metrics:
   print(result['metrics']['data'])

4. For GPU monitoring:
   - Must have NVIDIA GPU and drivers installed
   - pynvml included in requirements
   - Gracefully falls back if GPU unavailable

5. Run examples:
   python example_performance_monitoring.py
"""
