"""
Performance Monitoring Utility for Cryptographic Operations

Tracks CPU, GPU, and memory consumption for security operations
to ensure system stability and performance optimization.
"""

import os
import psutil
import time
import json
import logging
from contextlib import contextmanager
from typing import Dict, Any, Optional, List
from datetime import datetime


# Configure logging
logger = logging.getLogger(__name__)


class GPUMonitor:
    """
    Monitor GPU usage during operations.
    
    Supports NVIDIA GPUs (via pynvml) and can detect GPU availability.
    Falls back gracefully if GPU libraries are not available.
    """
    
    def __init__(self):
        """Initialize GPU monitor with availability check."""
        self.available = False
        self.pynvml = None
        self._init_nvidia()
    
    def _init_nvidia(self) -> None:
        """Initialize NVIDIA GPU monitoring if available."""
        try:
            import pynvml
            pynvml.nvmlInit()
            self.available = True
            self.pynvml = pynvml
            self.device_count = pynvml.nvmlDeviceGetCount()
        except Exception as e:
            logger.debug(f"GPU monitoring not available: {e}")
            self.available = False
    
    def get_gpu_info(self) -> Dict[str, Any]:
        """
        Get current GPU usage information.
        
        Returns:
            Dictionary with GPU metrics or empty dict if GPU unavailable
        """
        if not self.available or not self.pynvml:
            return {'available': False, 'devices': []}
        
        try:
            devices = []
            for i in range(self.device_count):
                handle = self.pynvml.nvmlDeviceGetHandleByIndex(i)
                mem_info = self.pynvml.nvmlDeviceGetMemoryInfo(handle)
                util = self.pynvml.nvmlDeviceGetUtilizationRates(handle)
                temp = self.pynvml.nvmlDeviceGetTemperature(handle, 0)
                power = self._get_power_usage(handle)
                
                devices.append({
                    'id': i,
                    'name': self._get_gpu_name(handle),
                    'gpu_percent': util.gpu,
                    'memory_used_mb': round(mem_info.used / 1024 / 1024, 2),
                    'memory_total_mb': round(mem_info.total / 1024 / 1024, 2),
                    'memory_percent': round((mem_info.used / mem_info.total) * 100, 2),
                    'temperature_celsius': temp,
                    'power_watts': power,
                })
            
            return {
                'available': True,
                'device_count': self.device_count,
                'devices': devices
            }
        except Exception as e:
            logger.debug(f"Error reading GPU info: {e}")
            return {'available': False, 'devices': []}
    
    def _get_gpu_name(self, handle) -> str:
        """Get GPU name."""
        try:
            return self.pynvml.nvmlDeviceGetName(handle).decode('utf-8')
        except:
            return "Unknown GPU"
    
    def _get_power_usage(self, handle) -> Optional[float]:
        """Get power usage in watts."""
        try:
            power_mw = self.pynvml.nvmlDeviceGetPowerUsage(handle)
            return round(power_mw / 1000, 2)
        except:
            return None
    
    def cleanup(self) -> None:
        """Cleanup GPU monitoring resources."""
        if self.available and self.pynvml:
            try:
                self.pynvml.nvmlShutdown()
            except:
                pass


class PerformanceMonitor:
    """
    Monitor CPU, GPU, and memory usage during cryptographic operations.
    
    Provides comprehensive resource tracking with minimal overhead
    and accurate measurements.
    """
    
    def __init__(self):
        """Initialize performance monitor with current process reference."""
        self.process = psutil.Process(os.getpid())
        self.gpu_monitor = GPUMonitor()
        # Prime CPU counters so future calls return meaningful values.
        self.process.cpu_percent(interval=None)
        psutil.cpu_percent(interval=None)
    
    def get_memory_info(self) -> Dict[str, float]:
        """
        Get current memory usage information.
        
        Returns:
            Dictionary with memory metrics in MB:
            - rss: Resident Set Size (physical memory)
            - vms: Virtual Memory Size
            - percent: Memory usage percentage
        """
        try:
            memory_info = self.process.memory_info()
            memory_percent = self.process.memory_percent()
            
            return {
                'rss_mb': round(memory_info.rss / 1024 / 1024, 2),  # Convert to MB
                'vms_mb': round(memory_info.vms / 1024 / 1024, 2),  # Convert to MB
                'percent': round(memory_percent, 2),
            }
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            return {'rss_mb': 0, 'vms_mb': 0, 'percent': 0}
    
    def get_cpu_info(self) -> Dict[str, Any]:
        """
        Get current CPU usage information.
        
        Returns:
            Dictionary with CPU metrics:
            - num_threads: Number of threads used by process
            - cpu_percent: CPU percentage (per core)
            - cpu_times: Cumulative CPU time info
        """
        try:
            cpu_percent = self.process.cpu_percent(interval=None)
            cpu_times = self.process.cpu_times()
            num_threads = self.process.num_threads()
            system_cpu = psutil.cpu_percent(interval=None)
            
            return {
                'process_cpu_percent': round(cpu_percent, 2),
                'system_cpu_percent': round(system_cpu, 2),
                'num_threads': num_threads,
                'user_time_ms': round(cpu_times.user * 1000, 2),
                'system_time_ms': round(cpu_times.system * 1000, 2),
                'cpu_count': psutil.cpu_count(),
            }
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            return {'process_cpu_percent': 0, 'system_cpu_percent': 0, 'num_threads': 0, 
                   'user_time_ms': 0, 'system_time_ms': 0, 'cpu_count': 0}
    
    def get_gpu_info(self) -> Dict[str, Any]:
        """
        Get current GPU usage information.
        
        Returns:
            Dictionary with GPU metrics (empty if not available)
        """
        return self.gpu_monitor.get_gpu_info()
    
    def get_system_health(self) -> Dict[str, Any]:
        """
        Get overall system health metrics.
        
        Returns:
            Dictionary with system-wide metrics:
            - total_cpu_percent: System-wide CPU usage
            - total_memory_mb: Total system memory
            - available_memory_mb: Available system memory
            - memory_percent: System memory usage percentage
        """
        try:
            svmem = psutil.virtual_memory()
            cpu_percent = psutil.cpu_percent(interval=None)
            
            return {
                'cpu_percent': round(cpu_percent, 2),
                'total_memory_mb': round(svmem.total / 1024 / 1024, 2),
                'available_memory_mb': round(svmem.available / 1024 / 1024, 2),
                'memory_percent': round(svmem.percent, 2),
            }
        except Exception:
            return {'cpu_percent': 0, 'total_memory_mb': 0, 'available_memory_mb': 0, 'memory_percent': 0}
    
    def cleanup(self) -> None:
        """Cleanup monitoring resources."""
        self.gpu_monitor.cleanup()


@contextmanager
def measure_performance(operation_name: str = "operation", verbose: bool = False):
    """
    Context manager for measuring comprehensive performance metrics.
    
    Captures CPU, GPU, memory, and timing information before and after
    the operation execution.
    
    Usage:
        with measure_performance("hashing") as metrics:
            # Your operation here
            pass
        print(metrics['data'])
    
    Args:
        operation_name: Name of the operation being measured
        verbose: If True, print real-time metrics to console
        
    Yields:
        Dictionary containing performance metrics
    """
    monitor = PerformanceMonitor()
    
    # Pre-operation metrics
    pre_memory = monitor.get_memory_info()
    pre_cpu = monitor.get_cpu_info()
    pre_gpu = monitor.get_gpu_info()
    pre_system = monitor.get_system_health()
    start_time = time.perf_counter()
    
    metrics = {
        'operation': operation_name,
        'timestamp': datetime.now().isoformat(),
        'data': None,
    }
    
    if verbose:
        print(f"\n▶ Starting: {operation_name}")
    
    try:
        yield metrics
    finally:
        # Post-operation metrics
        end_time = time.perf_counter()
        post_memory = monitor.get_memory_info()
        post_cpu = monitor.get_cpu_info()
        post_gpu = monitor.get_gpu_info()
        post_system = monitor.get_system_health()
        
        # Calculate deltas
        memory_delta_mb = post_memory['rss_mb'] - pre_memory['rss_mb']
        elapsed_ms = (end_time - start_time) * 1000
        
        # Build comprehensive performance data
        perf_data = {
            'operation': operation_name,
            'timestamp': datetime.now().isoformat(),
            'elapsed_ms': round(elapsed_ms, 3),
            'memory': {
                'before_mb': round(pre_memory['rss_mb'], 2),
                'after_mb': round(post_memory['rss_mb'], 2),
                'delta_mb': round(memory_delta_mb, 2),
                'percent': round(post_memory['percent'], 2),
            },
            'cpu': {
                'process_percent': round(post_cpu['process_cpu_percent'], 2),
                'system_percent': round(post_cpu['system_cpu_percent'], 2),
                'threads': post_cpu['num_threads'],
                'user_time_ms': round(post_cpu['user_time_ms'] - pre_cpu['user_time_ms'], 2),
                'system_time_ms': round(post_cpu['system_time_ms'] - pre_cpu['system_time_ms'], 2),
            },
            'system': {
                'cpu_percent': round(post_system['cpu_percent'], 2),
                'memory_percent': round(post_system['memory_percent'], 2),
            }
        }
        
        # Add GPU metrics if available
        if post_gpu.get('available'):
            perf_data['gpu'] = post_gpu
        
        metrics['data'] = perf_data
        
        if verbose:
            _print_performance_summary(perf_data)
        
        monitor.cleanup()


def _print_performance_summary(perf_data: Dict[str, Any]) -> None:
    """Print a formatted performance summary."""
    print(f"\n✓ Completed: {perf_data['operation']}")
    print(f"  ⏱  Time: {perf_data['elapsed_ms']}ms")
    print(f"  💾 Memory: {perf_data['memory']['before_mb']}MB → {perf_data['memory']['after_mb']}MB (Δ {perf_data['memory']['delta_mb']}MB)")
    print(f"  🔧 CPU: Process {perf_data['cpu']['process_percent']}% | System {perf_data['cpu']['system_percent']}%")
    
    if 'gpu' in perf_data and perf_data['gpu'].get('available'):
        print(f"  🎮 GPU: {len(perf_data['gpu']['devices'])} device(s)")
        for device in perf_data['gpu']['devices']:
            print(f"     {device['name']}: {device['gpu_percent']}% util, {device['memory_used_mb']}MB/{device['memory_total_mb']}MB")


@contextmanager
def measure_crypto_operation(operation_name: str, file_path: Optional[str] = None, verbose: bool = True):
    """
    Specialized context manager for cryptographic operations.
    
    Provides detailed monitoring specifically for hashing, signing, and verification.
    
    Usage:
        with measure_crypto_operation("hash_generation", file_path="document.pdf") as metrics:
            result = generate_file_hash(file_path)
        print(metrics['data'])
    
    Args:
        operation_name: Type of crypto operation (e.g., "hash_generation", "sign", "verify")
        file_path: Optional path to file being processed
        verbose: Print metrics to console
        
    Yields:
        Dictionary with operation metrics
    """
    op_desc = f"{operation_name}"
    if file_path:
        op_desc += f" ({os.path.basename(file_path)})"
    
    with measure_performance(op_desc, verbose=verbose) as metrics:
        yield metrics


def get_operation_performance(operation_name: str) -> Dict[str, Any]:
    """
    Get current performance metrics snapshot.
    
    Usage:
        perf = get_operation_performance("snapshot")
        print(perf['cpu'])
    
    Args:
        operation_name: Label for this snapshot
        
    Returns:
        Dictionary with current CPU, GPU, memory, and system metrics
    """
    monitor = PerformanceMonitor()
    
    data = {
        'operation': operation_name,
        'timestamp': datetime.now().isoformat(),
        'memory': monitor.get_memory_info(),
        'cpu': monitor.get_cpu_info(),
        'gpu': monitor.get_gpu_info(),
        'system': monitor.get_system_health(),
    }
    
    monitor.cleanup()
    return data


def export_metrics_to_json(metrics: Dict[str, Any], file_path: str) -> None:
    """
    Export performance metrics to JSON file.
    
    Args:
        metrics: Metrics dictionary from measure_performance
        file_path: Destination JSON file path
    """
    try:
        with open(file_path, 'w') as f:
            json.dump(metrics, f, indent=2)
        logger.info(f"Metrics exported to {file_path}")
    except Exception as e:
        logger.error(f"Failed to export metrics: {e}")
