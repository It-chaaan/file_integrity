#!/usr/bin/env python3
"""
Validation Script: Verify Performance Monitoring System Setup

This script validates that all dependencies are installed and the monitoring
system is working correctly.

Run with: python validate_monitoring_setup.py
"""

import sys
import os
from pathlib import Path

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'
CHECKMARK = '✓'
CROSS = '✗'
WARNING = '⚠'

def print_section(title):
    """Print a formatted section header."""
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}{title}{RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")

def print_success(message):
    """Print success message."""
    print(f"{GREEN}{CHECKMARK} {message}{RESET}")

def print_error(message):
    """Print error message."""
    print(f"{RED}{CROSS} {message}{RESET}")

def print_warning(message):
    """Print warning message."""
    print(f"{YELLOW}{WARNING} {message}{RESET}")

def test_imports():
    """Test all required imports."""
    print_section("Testing Imports")
    
    tests_passed = 0
    tests_failed = 0
    
    # Test psutil
    try:
        import psutil
        print_success(f"psutil {psutil.__version__} imported")
        tests_passed += 1
    except ImportError as e:
        print_error(f"psutil import failed: {e}")
        tests_failed += 1
    
    # Test pynvml (optional)
    try:
        import pynvml
        print_success(f"pynvml imported (GPU monitoring available)")
        tests_passed += 1
    except ImportError:
        print_warning("pynvml not available (GPU monitoring disabled)")
        tests_passed += 1  # Not critical
    
    # Test cryptography
    try:
        import cryptography
        print_success(f"cryptography {cryptography.__version__} imported")
        tests_passed += 1
    except ImportError as e:
        print_error(f"cryptography import failed: {e}")
        tests_failed += 1
    
    # Test our modules
    backend_path = Path(__file__).parent
    sys.path.insert(0, str(backend_path))
    
    try:
        from performance_monitor import PerformanceMonitor
        print_success("performance_monitor module imported")
        tests_passed += 1
    except ImportError as e:
        print_error(f"performance_monitor import failed: {e}")
        tests_failed += 1
    
    try:
        from crypto_performance_monitor import CryptoOperationMonitor
        print_success("crypto_performance_monitor module imported")
        tests_passed += 1
    except ImportError as e:
        print_error(f"crypto_performance_monitor import failed: {e}")
        tests_failed += 1
    
    try:
        from crypto_engine import generate_file_hash, generate_key_pair
        print_success("crypto_engine module imported")
        tests_passed += 1
    except ImportError as e:
        print_error(f"crypto_engine import failed: {e}")
        tests_failed += 1
    
    return tests_passed, tests_failed

def test_performance_monitor():
    """Test PerformanceMonitor functionality."""
    print_section("Testing PerformanceMonitor Functionality")
    
    tests_passed = 0
    tests_failed = 0
    
    try:
        from performance_monitor import PerformanceMonitor
        
        monitor = PerformanceMonitor()
        print_success("PerformanceMonitor instantiated")
        tests_passed += 1
        
        # Test CPU info
        try:
            cpu_info = monitor.get_cpu_info()
            if isinstance(cpu_info, dict) and 'process_cpu_percent' in cpu_info:
                print_success(f"CPU info retrieved: {cpu_info['process_cpu_percent']}%")
                tests_passed += 1
            else:
                print_error("CPU info format incorrect")
                tests_failed += 1
        except Exception as e:
            print_error(f"CPU info failed: {e}")
            tests_failed += 1
        
        # Test memory info
        try:
            mem_info = monitor.get_memory_info()
            if isinstance(mem_info, dict) and 'rss_mb' in mem_info:
                print_success(f"Memory info retrieved: {mem_info['rss_mb']}MB")
                tests_passed += 1
            else:
                print_error("Memory info format incorrect")
                tests_failed += 1
        except Exception as e:
            print_error(f"Memory info failed: {e}")
            tests_failed += 1
        
        # Test GPU info
        try:
            gpu_info = monitor.get_gpu_info()
            if isinstance(gpu_info, dict) and 'available' in gpu_info:
                if gpu_info['available']:
                    print_success(f"GPU info retrieved: {gpu_info['device_count']} device(s)")
                else:
                    print_warning("GPU monitoring not available")
                tests_passed += 1
            else:
                print_error("GPU info format incorrect")
                tests_failed += 1
        except Exception as e:
            print_error(f"GPU info failed: {e}")
            tests_failed += 1
        
        # Test system health
        try:
            health = monitor.get_system_health()
            if isinstance(health, dict) and 'cpu_percent' in health:
                print_success(f"System health retrieved: CPU {health['cpu_percent']}%")
                tests_passed += 1
            else:
                print_error("System health format incorrect")
                tests_failed += 1
        except Exception as e:
            print_error(f"System health failed: {e}")
            tests_failed += 1
        
        # Cleanup
        monitor.cleanup()
        print_success("Monitor cleaned up successfully")
        tests_passed += 1
        
    except Exception as e:
        print_error(f"Unexpected error in PerformanceMonitor test: {e}")
        tests_failed += 1
    
    return tests_passed, tests_failed

def test_context_manager():
    """Test context manager functionality."""
    print_section("Testing Context Manager")
    
    tests_passed = 0
    tests_failed = 0
    
    try:
        from performance_monitor import measure_performance
        
        # Test context manager
        with measure_performance("test_operation", verbose=False) as metrics:
            import time
            time.sleep(0.1)  # Simple operation
        
        if metrics['data'] and isinstance(metrics['data'], dict):
            data = metrics['data']
            checks = [
                ('operation' in data, "Operation name"),
                ('elapsed_ms' in data, "Elapsed time"),
                ('memory' in data, "Memory metrics"),
                ('cpu' in data, "CPU metrics"),
                ('system' in data, "System metrics"),
            ]
            
            for check, label in checks:
                if check:
                    print_success(f"Context manager - {label}")
                    tests_passed += 1
                else:
                    print_error(f"Context manager - {label} missing")
                    tests_failed += 1
        else:
            print_error("Context manager - No metrics returned")
            tests_failed += 1
    
    except Exception as e:
        print_error(f"Context manager test failed: {e}")
        tests_failed += 1
    
    return tests_passed, tests_failed

def test_crypto_monitoring():
    """Test CryptoOperationMonitor functionality."""
    print_section("Testing CryptoOperationMonitor")
    
    tests_passed = 0
    tests_failed = 0
    
    try:
        from crypto_performance_monitor import CryptoOperationMonitor
        from pathlib import Path
        
        # Create test file
        test_file = Path("test_validation.txt")
        test_file.write_text("Test data for validation")
        
        monitor = CryptoOperationMonitor(verbose=False, export_metrics=False)
        print_success("CryptoOperationMonitor instantiated")
        tests_passed += 1
        
        # Test hash_file_with_monitoring
        try:
            result = monitor.hash_file_with_monitoring(test_file)
            if 'hash' in result and 'metrics' in result:
                print_success(f"File hashing monitored: {result['hash'][:16]}...")
                tests_passed += 1
            else:
                print_error("File hashing result format incorrect")
                tests_failed += 1
        except Exception as e:
            print_error(f"File hashing failed: {e}")
            tests_failed += 1
        
        # Test hash_bytes_with_monitoring
        try:
            result = monitor.hash_bytes_with_monitoring(b"test data", label="test")
            if 'hash' in result and 'metrics' in result:
                print_success(f"Bytes hashing monitored: {result['hash'][:16]}...")
                tests_passed += 1
            else:
                print_error("Bytes hashing result format incorrect")
                tests_failed += 1
        except Exception as e:
            print_error(f"Bytes hashing failed: {e}")
            tests_failed += 1
        
        # Test key generation
        try:
            result = monitor.generate_keys_with_monitoring()
            if 'private_key' in result and 'public_key' in result and 'metrics' in result:
                print_success("Key generation monitored")
                tests_passed += 1
            else:
                print_error("Key generation result format incorrect")
                tests_failed += 1
        except Exception as e:
            print_error(f"Key generation failed: {e}")
            tests_failed += 1
        
        # Test signing
        try:
            hash_value = "a" * 64  # Valid SHA-256 hex
            result = monitor.sign_with_monitoring(
                result['private_key'],
                hash_value,
                "test_document"
            )
            if 'signature' in result and 'metrics' in result:
                print_success(f"Signing monitored: {result['signature'][:16]}...")
                tests_passed += 1
            else:
                print_error("Signing result format incorrect")
                tests_failed += 1
            
            signature = result['signature']
            public_key = result['private_key'].public_key()
        except Exception as e:
            print_error(f"Signing failed: {e}")
            tests_failed += 1
            signature = None
            public_key = None
        
        # Test verification
        if signature and public_key:
            try:
                result = monitor.verify_with_monitoring(
                    public_key,
                    signature,
                    hash_value,
                    "test_document"
                )
                if 'is_valid' in result and 'metrics' in result:
                    print_success(f"Verification monitored: {result['status']}")
                    tests_passed += 1
                else:
                    print_error("Verification result format incorrect")
                    tests_failed += 1
            except Exception as e:
                print_error(f"Verification failed: {e}")
                tests_failed += 1
        
        # Cleanup
        test_file.unlink(missing_ok=True)
        print_success("Test file cleaned up")
        tests_passed += 1
        
    except Exception as e:
        print_error(f"Unexpected error in CryptoOperationMonitor test: {e}")
        tests_failed += 1
    
    return tests_passed, tests_failed

def test_file_structure():
    """Test that all required files exist."""
    print_section("Testing File Structure")
    
    tests_passed = 0
    tests_failed = 0
    
    backend_path = Path(__file__).parent
    
    required_files = [
        ("performance_monitor.py", "Core monitoring module"),
        ("crypto_performance_monitor.py", "Crypto monitoring wrapper"),
        ("crypto_engine.py", "Cryptographic engine"),
        ("example_performance_monitoring.py", "Example demonstrations"),
        ("PERFORMANCE_MONITORING_GUIDE.md", "Comprehensive guide"),
        ("QUICK_REFERENCE.md", "Quick reference guide"),
        ("MONITORING_SETUP_SUMMARY.md", "Setup summary"),
    ]
    
    for filename, description in required_files:
        file_path = backend_path / filename
        if file_path.exists():
            size_kb = file_path.stat().st_size / 1024
            print_success(f"{description}: {filename} ({size_kb:.1f}KB)")
            tests_passed += 1
        else:
            print_error(f"{description}: {filename} not found")
            tests_failed += 1
    
    return tests_passed, tests_failed

def main():
    """Run all validation tests."""
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}Performance Monitoring System - Validation Script{RESET}")
    print(f"{BLUE}{'='*70}{RESET}")
    
    total_passed = 0
    total_failed = 0
    
    # Run all tests
    test_suites = [
        ("File Structure", test_file_structure),
        ("Imports", test_imports),
        ("PerformanceMonitor", test_performance_monitor),
        ("Context Manager", test_context_manager),
        ("CryptoOperationMonitor", test_crypto_monitoring),
    ]
    
    results = []
    
    for suite_name, test_func in test_suites:
        try:
            passed, failed = test_func()
            total_passed += passed
            total_failed += failed
            results.append((suite_name, passed, failed))
        except Exception as e:
            print_error(f"Unexpected error in {suite_name}: {e}")
            total_failed += 1
            results.append((suite_name, 0, 1))
    
    # Print summary
    print_section("Summary")
    
    print(f"{BLUE}Test Results by Suite:{RESET}\n")
    for suite_name, passed, failed in results:
        total = passed + failed
        status = f"{GREEN}PASS{RESET}" if failed == 0 else f"{RED}FAIL{RESET}"
        print(f"  {suite_name:<40} {passed:2d}/{total:2d} {status}")
    
    print(f"\n{BLUE}Overall Results:{RESET}")
    print(f"  Total Tests: {total_passed + total_failed}")
    print(f"  Passed: {GREEN}{total_passed}{RESET}")
    print(f"  Failed: {RED}{total_failed}{RESET}")
    
    # Final status
    print(f"\n{BLUE}{'='*70}{RESET}")
    
    if total_failed == 0:
        print_success("ALL TESTS PASSED - System is ready to use!")
        print(f"{BLUE}{'='*70}{RESET}\n")
        print("Next steps:")
        print("  1. Review MONITORING_SETUP_SUMMARY.md for overview")
        print("  2. Check QUICK_REFERENCE.md for usage examples")
        print("  3. Run example_performance_monitoring.py to see demos")
        print("  4. Integrate into your code using CryptoOperationMonitor")
        print(f"{BLUE}{'='*70}{RESET}\n")
        return 0
    else:
        print_error(f"TESTS FAILED - {total_failed} issue(s) detected")
        print(f"\n{YELLOW}Troubleshooting:{RESET}")
        print("  1. Check all requirements are installed:")
        print("     pip install -r requirements.txt")
        print("  2. Verify Python version >= 3.8:")
        print("     python --version")
        print("  3. Check file paths are correct")
        print("  4. Review error messages above")
        print(f"{BLUE}{'='*70}{RESET}\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
