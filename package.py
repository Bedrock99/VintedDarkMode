import os
import zipfile
import json

def package_extension():
    project_dir = os.path.dirname(os.path.abspath(__file__))
    dist_dir = os.path.join(project_dir, "dist")
    os.makedirs(dist_dir, exist_ok=True)

    manifest_path = os.path.join(project_dir, "manifest.json")
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    version = manifest.get("version", "1.0.0")
    xpi_filename = os.path.join(dist_dir, f"vinted-dark-mode-v{version}.xpi")
    zip_filename = os.path.join(dist_dir, f"vinted-dark-mode-v{version}.zip")

    files_to_include = [
        "manifest.json",
        "content.js",
        "content.css",
        "background.js",
        "popup/popup.html",
        "popup/popup.css",
        "popup/popup.js",
        "icons/icon.svg",
        "icons/icon-16.png",
        "icons/icon-32.png",
        "icons/icon-48.png",
        "icons/icon-128.png",
    ]

    for archive_path in [xpi_filename, zip_filename]:
        with zipfile.ZipFile(archive_path, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for rel_path in files_to_include:
                full_path = os.path.join(project_dir, rel_path)
                if os.path.exists(full_path):
                    zip_file.write(full_path, rel_path)
                    print(f"Added: {rel_path}")
                else:
                    print(f"WARNING: File not found: {rel_path}")
        print(f"Created: {archive_path} ({os.path.getsize(archive_path)} bytes)")

if __name__ == "__main__":
    package_extension()
