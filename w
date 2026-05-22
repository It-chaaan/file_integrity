import os
import uuid

folder_path = "mock_files_100mb"
number_of_files = 30
target_size_mb = 100
target_size_bytes = target_size_mb * 1024 * 1024

os.makedirs(folder_path, exist_ok=True)

for i in range(1, number_of_files + 1):
    file_path = os.path.join(folder_path, f"mock_{i}.txt")

    with open(file_path, "w", encoding="utf-8") as f:
        chunk = ""

        while len(chunk.encode("utf-8")) < 1024 * 1024:  # 1MB chunk
            chunk += f"FILE_{i}_{uuid.uuid4()}\n"

        bytes_written = 0

        while bytes_written < target_size_bytes:
            remaining = target_size_bytes - bytes_written

            if remaining >= len(chunk.encode("utf-8")):
                f.write(chunk)
                bytes_written += len(chunk.encode("utf-8"))
            else:
                f.write(chunk[:remaining])
                bytes_written += remaining

    print(f"Created: {file_path}")

print("Done generating 30 unique 100MB files.")