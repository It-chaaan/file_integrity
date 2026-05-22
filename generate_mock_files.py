from pathlib import Path
import os

BASE_DIR = "files"

# File sizes in MB
sizes = {
    "1mb": 1,
    "10mb": 10,
    "50mb": 50,
    "100mb": 100
}

FILES_PER_FOLDER = 30

def create_mock_file(path, size_mb):
    size_bytes = size_mb * 1024 * 1024

    with open(path, "wb") as f:
        chunk = b"A" * (1024 * 1024)  # 1 MB chunk

        for _ in range(size_mb):
            f.write(chunk)

for folder_name, size_mb in sizes.items():
    folder_path = Path(BASE_DIR) / folder_name
    folder_path.mkdir(parents=True, exist_ok=True)

    print(f"Creating {folder_name} files...")

    for i in range(1, FILES_PER_FOLDER + 1):
        file_path = folder_path / f"mock_file_{i}.txt"
        create_mock_file(file_path, size_mb)

print("\\nDone generating all mock files.")