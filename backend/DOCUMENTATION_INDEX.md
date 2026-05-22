# Performance Monitoring System - Documentation Index

## 📖 How to Navigate This System

Choose your path based on your needs:

---

## 🚀 I want to get started NOW (5 minutes)

1. **Run validation:**
   ```bash
   python validate_monitoring_setup.py
   ```

2. **See it working:**
   ```bash
   python example_performance_monitoring.py
   ```

3. **Copy this to your code:**
   ```python
   from crypto_performance_monitor import CryptoOperationMonitor
   
   monitor = CryptoOperationMonitor(verbose=True)
   result = monitor.hash_file_with_monitoring("document.pdf")
   print(result['metrics']['data'])
   ```

**📄 Files to read:** `README_MONITORING.md` (quick start section)

---

## 💡 I need copy-paste code examples

**→ Read: `QUICK_REFERENCE.md`**

Contains 15 ready-to-use code snippets for:
- Monitoring file hashing
- Monitoring key generation
- Monitoring signature generation/verification
- Complete workflows
- Batch processing
- Performance analysis
- GPU checking
- Django/FastAPI integration
- And more...

---

## 📚 I need comprehensive documentation

**→ Read: `PERFORMANCE_MONITORING_GUIDE.md`**

600+ line comprehensive guide covering:
- Complete overview
- Installation instructions
- Quick start patterns
- Advanced usage
- Metrics explained
- GPU monitoring details
- Best practices
- Troubleshooting

---

## 📊 I need system overview

**→ Read: `MONITORING_SETUP_SUMMARY.md`**

Covers:
- What was created
- Key features
- Quick start
- Metrics structure
- Usage patterns
- Integration examples
- Configuration options
- Supported operations

---

## 🔧 I need to verify everything is working

**→ Run: `validate_monitoring_setup.py`**

Validates:
- All dependencies installed
- All modules importable
- Core functionality working
- File structure correct
- GPU monitoring available

Output shows:
- ✓ PASS for each test
- ✗ FAIL with details
- ⚠ Warnings for optional features

---

## 👀 I want to see working examples

**→ Run: `example_performance_monitoring.py`**

Shows 5 complete demonstrations:
1. Individual operations monitoring
2. Complete workflow monitoring
3. Context manager usage
4. Real-time snapshots
5. Large file performance

Each example is:
- Fully functional
- Copy-paste ready
- Properly commented
- Shows best practices

---

## 🎯 Use Case: Monitor Hashing

**File to modify/check:** `crypto_engine.py`

**Integration pattern:**
```python
from crypto_performance_monitor import CryptoOperationMonitor

monitor = CryptoOperationMonitor(verbose=True)
result = monitor.hash_file_with_monitoring("your_file.pdf")

# Access metrics
print(f"Time: {result['metrics']['data']['elapsed_ms']}ms")
print(f"CPU: {result['metrics']['data']['cpu']['process_percent']}%")
print(f"Memory: {result['metrics']['data']['memory']['delta_mb']}MB")
```

**Documentation:** `QUICK_REFERENCE.md` #1-2

---

## 🎯 Use Case: Monitor Signing/Verification

**Integration pattern:**
```python
monitor = CryptoOperationMonitor(verbose=True)

# Monitor signing
sign_result = monitor.sign_with_monitoring(
    private_key, hash_value, "document"
)

# Monitor verification
verify_result = monitor.verify_with_monitoring(
    public_key, signature, hash_value, "document"
)

print(f"Valid: {verify_result['is_valid']}")
print(f"Time: {verify_result['metrics']['data']['elapsed_ms']}ms")
```

**Documentation:** `QUICK_REFERENCE.md` #3-4

---

## 🎯 Use Case: Complete Workflow

**Integration pattern:**
```python
monitor = CryptoOperationMonitor(verbose=True)
result = monitor.full_workflow_monitoring("document.pdf")

# Includes: hash → sign → verify
# Returns: all metrics aggregated
print(f"Valid: {result['is_valid']}")
print(f"Total time: {result['summary']['total_elapsed_ms']}ms")
```

**Documentation:** `QUICK_REFERENCE.md` #5

---

## 🎯 Use Case: Batch Processing

**Integration pattern:**
```python
from pathlib import Path

monitor = CryptoOperationMonitor(verbose=False)

for file_path in Path("documents/").glob("*.pdf"):
    result = monitor.hash_file_with_monitoring(file_path)
    print(f"{file_path.name}: {result['metrics']['data']['elapsed_ms']}ms")

monitor.print_history_summary()
```

**Documentation:** `QUICK_REFERENCE.md` #6

---

## 🎯 Use Case: Performance Benchmarking

**Integration pattern:**
```python
# Get throughput
result = monitor.hash_file_with_monitoring("large_file.bin")
file_size_mb = result['file_size_mb']
time_ms = result['metrics']['data']['elapsed_ms']
throughput = file_size_mb / (time_ms / 1000)
print(f"Throughput: {throughput:.2f}MB/s")

# Compare multiple sizes
for size in [1, 10, 100]:
    # Test and compare...
```

**Documentation:** `QUICK_REFERENCE.md` #7, #14

---

## 🎯 Use Case: Django/FastAPI Integration

**Django example:**
```python
from django.http import JsonResponse
from crypto_performance_monitor import CryptoOperationMonitor

def hash_view(request):
    monitor = CryptoOperationMonitor(verbose=False)
    result = monitor.hash_file_with_monitoring(file_path)
    
    return JsonResponse({
        'hash': result['hash'],
        'time_ms': result['metrics']['data']['elapsed_ms'],
    })
```

**FastAPI example in:** `QUICK_REFERENCE.md` #16

---

## 🎯 Use Case: Custom Operations

**Integration pattern:**
```python
from performance_monitor import measure_performance

with measure_performance("custom_operation", verbose=True) as metrics:
    # Your operation here
    result = my_crypto_function()

print(metrics['data'])  # Access all metrics
```

**Documentation:** `PERFORMANCE_MONITORING_GUIDE.md` Advanced #1

---

## 🎯 Use Case: GPU Monitoring

**Check if available:**
```python
from performance_monitor import get_operation_performance

snapshot = get_operation_performance("gpu_check")

if snapshot['gpu']['available']:
    for device in snapshot['gpu']['devices']:
        print(f"{device['name']}: {device['gpu_percent']}% util")
```

**Documentation:** `QUICK_REFERENCE.md` #10, #15

---

## 📊 Files Reference

| File | Purpose | Read When |
|------|---------|-----------|
| `README_MONITORING.md` | Main entry point | First time |
| `QUICK_REFERENCE.md` | Copy-paste code | Need examples |
| `PERFORMANCE_MONITORING_GUIDE.md` | Comprehensive guide | Deep dive |
| `MONITORING_SETUP_SUMMARY.md` | System overview | Want overview |
| `validate_monitoring_setup.py` | Validation script | Verify setup |
| `example_performance_monitoring.py` | Working examples | See it working |
| `performance_monitor.py` | Core module | Need details |
| `crypto_performance_monitor.py` | Wrapper module | Need details |

---

## 🔧 Core Components

### 1. PerformanceMonitor
Low-level monitoring of CPU, GPU, memory
```python
from performance_monitor import PerformanceMonitor

monitor = PerformanceMonitor()
cpu = monitor.get_cpu_info()
mem = monitor.get_memory_info()
gpu = monitor.get_gpu_info()
```

### 2. CryptoOperationMonitor
High-level wrapper for crypto operations
```python
from crypto_performance_monitor import CryptoOperationMonitor

monitor = CryptoOperationMonitor(verbose=True)
result = monitor.hash_file_with_monitoring(file)
```

### 3. Context Managers
General-purpose monitoring
```python
from performance_monitor import measure_performance

with measure_performance("operation") as metrics:
    # Your code
```

---

## ✅ Installation Checklist

- [ ] Install: `pip install -r requirements.txt`
- [ ] Validate: `python validate_monitoring_setup.py`
- [ ] Test: `python example_performance_monitoring.py`
- [ ] Read: `QUICK_REFERENCE.md`
- [ ] Integrate: Add to your code
- [ ] Verify: Test with your files

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Import errors | Run `pip install -r requirements.txt` |
| Tests fail | Check Python >= 3.8, run `pip list` |
| GPU not detected | NVIDIA drivers needed, or it's optional |
| Code samples don't run | See `example_performance_monitoring.py` |
| Don't know where to start | Read `README_MONITORING.md` |

---

## 🎓 Learning Path

### Beginner
1. Run `validate_monitoring_setup.py`
2. Run `example_performance_monitoring.py`
3. Read `README_MONITORING.md` quick start
4. Copy examples from `QUICK_REFERENCE.md`

### Intermediate
1. Read `QUICK_REFERENCE.md` all examples
2. Integrate into Django/FastAPI with examples
3. Monitor batch operations
4. Export metrics to JSON

### Advanced
1. Read `PERFORMANCE_MONITORING_GUIDE.md`
2. Learn custom context managers
3. Build benchmarking tools
4. Analyze metrics over time

---

## 📞 Quick Help

**How do I...?**

**...monitor file hashing?**
→ See `QUICK_REFERENCE.md` #1-2

**...monitor signing/verification?**
→ See `QUICK_REFERENCE.md` #3-4

**...do a complete workflow?**
→ See `QUICK_REFERENCE.md` #5

**...process multiple files?**
→ See `QUICK_REFERENCE.md` #6

**...calculate throughput?**
→ See `QUICK_REFERENCE.md` #7

**...use context managers?**
→ See `QUICK_REFERENCE.md` #8

**...check GPU status?**
→ See `QUICK_REFERENCE.md` #10

**...integrate with Django/FastAPI?**
→ See `QUICK_REFERENCE.md` #13-16

**...understand all metrics?**
→ See `PERFORMANCE_MONITORING_GUIDE.md` Section 6

**...troubleshoot issues?**
→ See `PERFORMANCE_MONITORING_GUIDE.md` Section 9

---

## 🚀 Getting Started NOW

```bash
# 1. Validate installation (2 minutes)
python validate_monitoring_setup.py

# 2. Run examples (3 minutes)
python example_performance_monitoring.py

# 3. Try in your code
python
>>> from crypto_performance_monitor import CryptoOperationMonitor
>>> monitor = CryptoOperationMonitor(verbose=True)
>>> result = monitor.hash_file_with_monitoring("document.pdf")
>>> print(result['metrics']['data'])
```

---

## 📈 Next Steps

1. ✓ Installation complete
2. → Validation passed
3. → Examples ran
4. → Code integrated
5. → Metrics collected
6. → System optimized

**You're ready to monitor CPU and GPU usage during cryptographic operations!**

---

## 📋 Summary

This index helps you navigate:
- 7 documentation files
- 2 executable scripts
- 3 core Python modules
- 15+ code examples
- Complete system for monitoring

**Choose your path above and start monitoring! 🎯**
