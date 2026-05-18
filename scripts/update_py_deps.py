#!/usr/bin/env python

import json
import subprocess
import sys
import tempfile
from pathlib import Path

# Updates pinned repo tooling dependencies in py/requirements.txt using pip.
# Published runtime dependency constraints are managed in py/pyproject.toml.
# Run with: bazel run //scripts:update_py_deps


def main():
    script_dir = Path(__file__).resolve().parent
    requirements_file = script_dir.parent / "py" / "requirements.txt"

    if not requirements_file.exists():
        raise FileNotFoundError(f"{requirements_file} not found")

    print(f"Checking repo tooling requirements in {requirements_file}")

    # Parse current requirements preserving original format
    current_lines = requirements_file.read_text().strip().split("\n")
    packages = []  # (original_line, package_name_with_extras, package_name_normalized)
    for line in current_lines:
        line = line.strip()
        if line and not line.startswith("#") and "==" in line:
            name_with_extras, version = line.split("==", 1)
            # Normalize by removing extras for pip queries.
            name_normalized = name_with_extras.split("[")[0].lower()
            packages.append((line, name_with_extras, name_normalized))

    with tempfile.TemporaryDirectory() as tmpdir:
        venv_dir = Path(tmpdir) / "venv"

        # Create virtual environment
        print("Creating temporary virtual environment...")
        subprocess.run(
            [sys.executable, "-m", "venv", str(venv_dir)],
            check=True,
            capture_output=True,
        )

        pip = venv_dir / "bin" / "pip"

        # Upgrade pip first
        subprocess.run(
            [str(pip), "install", "-q", "--upgrade", "pip"],
            check=True,
            capture_output=True,
        )

        # Install packages with extras to let pip resolve versions.
        install_names = [p[1] for p in packages]  # name_with_extras
        print(f"Installing {len(install_names)} packages...")
        result = subprocess.run(
            [str(pip), "install", "-q"] + install_names,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            raise RuntimeError(f"Error installing packages:\n{result.stderr}")

        # Get installed versions
        result = subprocess.run(
            [str(pip), "list", "--format=json"],
            capture_output=True,
            text=True,
            check=True,
        )
        installed = {pkg["name"].lower(): pkg["version"] for pkg in json.loads(result.stdout)}

        # Update versions in original lines
        updated_lines = []
        updates = []
        for orig_line, name_with_extras, name_normalized in packages:
            old_version = orig_line.split("==")[1]
            new_version = installed.get(name_normalized)

            if new_version and new_version != old_version:
                updates.append((name_with_extras, old_version, new_version))
                updated_lines.append(f"{name_with_extras}=={new_version}")
                print(f"  {name_with_extras}: {old_version} -> {new_version}")
            else:
                updated_lines.append(orig_line)

        if not updates:
            print("\nAll repo tooling requirements are up to date!")
            return

        # Rebuild file preserving non-package lines
        new_content = []
        pkg_idx = 0
        for line in current_lines:
            stripped = line.strip()
            if stripped and not stripped.startswith("#") and "==" in stripped:
                new_content.append(updated_lines[pkg_idx])
                pkg_idx += 1
            else:
                new_content.append(line)

        requirements_file.write_text("\n".join(new_content) + "\n")
        print(f"\nUpdated {len(updates)} package(s)")
        print("\nNow run: bazel run //py:requirements.update")


if __name__ == "__main__":
    main()
