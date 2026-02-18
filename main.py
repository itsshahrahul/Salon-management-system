import os
import re
import shutil
import subprocess
import sys
import threading
import time
import webbrowser
from pathlib import Path


def get_npm_executable() -> str | None:
    if os.name == "nt":
        return shutil.which("npm.cmd") or shutil.which("npm")
    return shutil.which("npm")


def open_browser_when_ready(process: subprocess.Popen[str]) -> None:
    opened = False
    local_url = None
    local_regex = re.compile(r"Local:\s*(http://\S+)")

    for line in process.stdout:
        print(line, end="")

        match = local_regex.search(line)
        if match and not opened:
            local_url = match.group(1).strip()
            try:
                webbrowser.open(local_url)
                opened = True
                print(f"\nOpened browser: {local_url}\n")
            except Exception:
                pass

    if not opened:
        fallback_url = local_url or "http://localhost:3000"
        try:
            webbrowser.open(fallback_url)
            print(f"\nOpened browser (fallback): {fallback_url}\n")
        except Exception:
            pass


def main() -> int:
    project_dir = Path(__file__).resolve().parent
    os.chdir(project_dir)

    if not (project_dir / "package.json").exists():
        print("Error: package.json not found. Run this file from the project root.")
        return 1

    npm_executable = get_npm_executable()

    if npm_executable is None:
        print("Error: npm is not installed or not in PATH.")
        print("Please install Node.js first: https://nodejs.org/")
        return 1

    if not (project_dir / "node_modules").exists():
        print("node_modules not found. Installing dependencies...\n")
        install = subprocess.run([npm_executable, "install"], text=True)
        if install.returncode != 0:
            print("\nDependency installation failed.")
            return install.returncode

    print("Starting The Beard Shop app...\n")

    process = subprocess.Popen(
        [npm_executable, "run", "dev"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )

    reader = threading.Thread(target=open_browser_when_ready, args=(process,), daemon=True)
    reader.start()

    try:
        while process.poll() is None:
            time.sleep(0.2)
    except KeyboardInterrupt:
        print("\nStopping server...")
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()

    return process.returncode or 0


if __name__ == "__main__":
    sys.exit(main())
