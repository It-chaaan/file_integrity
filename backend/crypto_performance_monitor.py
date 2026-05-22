"""
Cryptographic Operations with Performance Monitoring

Wraps cryptographic functions from crypto_engine.py with comprehensive
CPU, GPU, and memory performance tracking.

Usage:
    monitor = CryptoOperationMonitor()
    result = monitor.hash_file_with_monitoring("document.pdf")
    print(result['metrics']['data'])
"""

import logging
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, Union

from crypto_engine import (
    generate_file_hash,
    generate_hash_from_bytes,
    generate_key_pair,
    sign_hash,
    verify_signature,
    load_private_key,
    load_public_key,
)
from cryptography.hazmat.primitives.asymmetric.ec import (
    EllipticCurvePrivateKey,
    EllipticCurvePublicKey,
)
from performance_monitor import (
    measure_performance,
    measure_crypto_operation,
    get_operation_performance,
    export_metrics_to_json,
)

logger = logging.getLogger(__name__)


class CryptoOperationMonitor:
    """
    Wrapper for cryptographic operations with comprehensive performance tracking.
    
    Monitors CPU, GPU, and memory usage for:
    - File hashing
    - Hash generation from bytes
    - Key pair generation
    - Signature generation
    - Signature verification
    """
    
    def __init__(self, verbose: bool = True, export_metrics: bool = False):
        """
        Initialize crypto operation monitor.
        
        Args:
            verbose: Print metrics to console after each operation
            export_metrics: Export metrics to JSON files
        """
        self.verbose = verbose
        self.export_metrics = export_metrics
        self.operations_history = []
    
    def hash_file_with_monitoring(self, file_path: Union[str, Path]) -> Dict[str, Any]:
        """
        Generate file hash with performance monitoring.
        
        Args:
            file_path: Path to file to hash
            
        Returns:
            Dictionary containing:
            - hash: The SHA-256 hash
            - metrics: Performance data (CPU, GPU, memory, time)
        """
        file_path = Path(file_path)
        
        with measure_crypto_operation("hash_file_generation", str(file_path), self.verbose) as metrics:
            hash_value = generate_file_hash(file_path)
        
        result = {
            'hash': hash_value,
            'file_path': str(file_path),
            'file_size_mb': round(file_path.stat().st_size / 1024 / 1024, 2),
            'metrics': metrics
        }
        
        self._record_operation(result)
        
        if self.export_metrics:
            self._export_operation_metrics(result, "hash_file")
        
        return result
    
    def hash_bytes_with_monitoring(self, data: bytes, label: str = "bytes") -> Dict[str, Any]:
        """
        Generate hash from bytes with performance monitoring.
        
        Args:
            data: Raw bytes to hash
            label: Label for this data
            
        Returns:
            Dictionary containing:
            - hash: The SHA-256 hash
            - metrics: Performance data
            - data_size_kb: Size of data in KB
        """
        with measure_crypto_operation("hash_bytes_generation", f"{label} ({len(data)} bytes)", self.verbose) as metrics:
            hash_value = generate_hash_from_bytes(data)
        
        result = {
            'hash': hash_value,
            'label': label,
            'data_size_kb': round(len(data) / 1024, 2),
            'metrics': metrics
        }
        
        self._record_operation(result)
        
        if self.export_metrics:
            self._export_operation_metrics(result, "hash_bytes")
        
        return result
    
    def generate_keys_with_monitoring(self) -> Dict[str, Any]:
        """
        Generate ECDSA key pair with performance monitoring.
        
        Returns:
            Dictionary containing:
            - private_key: EllipticCurvePrivateKey
            - public_key: EllipticCurvePublicKey
            - metrics: Performance data
        """
        with measure_crypto_operation("key_pair_generation", verbose=self.verbose) as metrics:
            private_key, public_key = generate_key_pair()
        
        result = {
            'private_key': private_key,
            'public_key': public_key,
            'key_type': 'ECDSA SECP256R1 (NIST P-256)',
            'metrics': metrics
        }
        
        self._record_operation(result)
        
        if self.export_metrics:
            self._export_operation_metrics(result, "keygen")
        
        return result
    
    def sign_with_monitoring(
        self, 
        private_key: EllipticCurvePrivateKey,
        hash_string: str,
        document_label: str = "document"
    ) -> Dict[str, Any]:
        """
        Sign a hash with performance monitoring.
        
        Args:
            private_key: ECDSA private key for signing
            hash_string: SHA-256 hash as hex string
            document_label: Label for the document
            
        Returns:
            Dictionary containing:
            - signature: Base64-encoded signature
            - hash: Original hash
            - metrics: Performance data
        """
        with measure_crypto_operation("signature_generation", document_label, self.verbose) as metrics:
            signature = sign_hash(private_key, hash_string)
        
        result = {
            'signature': signature,
            'hash': hash_string,
            'document_label': document_label,
            'algorithm': 'ECDSA with SHA-256',
            'metrics': metrics
        }
        
        self._record_operation(result)
        
        if self.export_metrics:
            self._export_operation_metrics(result, "sign")
        
        return result
    
    def verify_with_monitoring(
        self,
        public_key: EllipticCurvePublicKey,
        signature_base64: str,
        original_hash: str,
        document_label: str = "document"
    ) -> Dict[str, Any]:
        """
        Verify a signature with performance monitoring.
        
        Args:
            public_key: ECDSA public key for verification
            signature_base64: Base64-encoded signature
            original_hash: SHA-256 hash of the document
            document_label: Label for the document
            
        Returns:
            Dictionary containing:
            - is_valid: Boolean indicating if signature is valid
            - hash: Original hash
            - metrics: Performance data
        """
        with measure_crypto_operation("signature_verification", document_label, self.verbose) as metrics:
            is_valid = verify_signature(public_key, signature_base64, original_hash)
        
        result = {
            'is_valid': is_valid,
            'hash': original_hash,
            'document_label': document_label,
            'algorithm': 'ECDSA with SHA-256',
            'status': '✓ Valid' if is_valid else '✗ Invalid',
            'metrics': metrics
        }
        
        self._record_operation(result)
        
        if self.export_metrics:
            self._export_operation_metrics(result, "verify")
        
        return result
    
    def full_workflow_monitoring(
        self,
        file_path: Union[str, Path],
        private_key_path: Optional[Union[str, Path]] = None,
        key_password: Optional[bytes] = None
    ) -> Dict[str, Any]:
        """
        Run complete workflow: hash → sign → verify with monitoring.
        
        Args:
            file_path: Path to file to process
            private_key_path: Path to private key (will generate new if not provided)
            key_password: Password for private key (optional)
            
        Returns:
            Dictionary with complete workflow results and metrics
        """
        file_path = Path(file_path)
        
        print("\n" + "="*60)
        print(f"CRYPTOGRAPHIC WORKFLOW: {file_path.name}")
        print("="*60)
        
        # Step 1: Hash the file
        print("\n[1/4] Hashing file...")
        hash_result = self.hash_file_with_monitoring(file_path)
        file_hash = hash_result['hash']
        
        # Step 2: Generate or load keys
        print("\n[2/4] Preparing keys...")
        if private_key_path:
            with measure_crypto_operation("key_loading", "private_key", verbose=False) as metrics:
                private_key = load_private_key(private_key_path, key_password)
        else:
            keygen_result = self.generate_keys_with_monitoring()
            private_key = keygen_result['private_key']
        
        # Step 3: Sign the hash
        print("\n[3/4] Signing hash...")
        sign_result = self.sign_with_monitoring(
            private_key,
            file_hash,
            f"{file_path.name} signature"
        )
        signature = sign_result['signature']
        
        # Step 4: Verify the signature
        print("\n[4/4] Verifying signature...")
        public_key = private_key.public_key()
        verify_result = self.verify_with_monitoring(
            public_key,
            signature,
            file_hash,
            f"{file_path.name} verification"
        )
        
        # Aggregate results
        workflow_result = {
            'file_path': str(file_path),
            'file_size_mb': hash_result['file_size_mb'],
            'hash': file_hash,
            'signature': signature,
            'is_valid': verify_result['is_valid'],
            'steps': {
                'hash': hash_result['metrics'],
                'sign': sign_result['metrics'],
                'verify': verify_result['metrics'],
            },
            'summary': self._compute_workflow_summary(
                hash_result['metrics'],
                sign_result['metrics'],
                verify_result['metrics']
            )
        }
        
        self._print_workflow_summary(workflow_result)
        
        if self.export_metrics:
            self._export_operation_metrics(workflow_result, "workflow")
        
        return workflow_result
    
    def _record_operation(self, result: Dict[str, Any]) -> None:
        """Record operation in history."""
        self.operations_history.append(result)
    
    def _export_operation_metrics(self, result: Dict[str, Any], operation_type: str) -> None:
        """Export metrics to JSON file."""
        try:
            timestamp = result['metrics']['timestamp'].replace(':', '-').replace('.', '_')
            filename = f"metrics/{operation_type}_{timestamp}.json"
            export_metrics_to_json(result, filename)
        except Exception as e:
            logger.warning(f"Failed to export metrics: {e}")
    
    def _compute_workflow_summary(self, *step_metrics) -> Dict[str, Any]:
        """Compute aggregate metrics across workflow steps."""
        total_time = sum(m['data']['elapsed_ms'] for m in step_metrics)
        total_memory_delta = sum(m['data']['memory']['delta_mb'] for m in step_metrics)
        peak_cpu = max(m['data']['cpu']['process_percent'] for m in step_metrics)
        
        return {
            'total_elapsed_ms': round(total_time, 2),
            'total_memory_delta_mb': round(total_memory_delta, 2),
            'peak_cpu_percent': round(peak_cpu, 2),
            'steps_count': len(step_metrics)
        }
    
    def _print_workflow_summary(self, workflow: Dict[str, Any]) -> None:
        """Print formatted workflow summary."""
        print("\n" + "="*60)
        print("WORKFLOW SUMMARY")
        print("="*60)
        print(f"File: {workflow['file_path']}")
        print(f"Size: {workflow['file_size_mb']} MB")
        print(f"Status: {'✓ VERIFIED' if workflow['is_valid'] else '✗ FAILED'}")
        print(f"\nHash: {workflow['hash'][:32]}...")
        print(f"Signature: {workflow['signature'][:32]}...")
        print(f"\nPerformance:")
        print(f"  Total Time: {workflow['summary']['total_elapsed_ms']}ms")
        print(f"  Memory Delta: {workflow['summary']['total_memory_delta_mb']}MB")
        print(f"  Peak CPU: {workflow['summary']['peak_cpu_percent']}%")
        print("="*60 + "\n")
    
    def get_history(self) -> list:
        """Get history of all monitored operations."""
        return self.operations_history
    
    def print_history_summary(self) -> None:
        """Print summary of all recorded operations."""
        if not self.operations_history:
            print("No operations recorded yet.")
            return
        
        print("\n" + "="*60)
        print("OPERATIONS HISTORY")
        print("="*60)
        
        for i, op in enumerate(self.operations_history, 1):
            op_type = op.get('metrics', {}).get('operation', 'Unknown')
            elapsed = op.get('metrics', {}).get('data', {}).get('elapsed_ms', 0)
            print(f"{i}. {op_type}: {elapsed}ms")
        
        print("="*60 + "\n")
