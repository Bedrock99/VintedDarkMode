import json
import os
import sys
import subprocess

def bump_version():
    manifest_path = "manifest.json"
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    current_version = manifest.get("version", "1.0.0")
    parts = current_version.split(".")
    while len(parts) < 3:
        parts.append("0")

    arg = sys.argv[1] if len(sys.argv) > 1 else "patch"

    if arg == "major":
        new_version = f"{int(parts[0]) + 1}.0.0"
    elif arg == "minor":
        new_version = f"{parts[0]}.{int(parts[1]) + 1}.0"
    elif arg == "patch":
        new_version = f"{parts[0]}.{parts[1]}.{int(parts[2]) + 1}"
    else:
        new_version = arg

    print(f"Aktualisiere Version: {current_version} -> {new_version}")

    manifest["version"] = new_version
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        f.write("\n")

    # Pakete neu bauen
    import package
    package.package_extension()

    # Git commit & Tag
    tag_name = f"v{new_version}"
    try:
        subprocess.run(["git", "add", "manifest.json", "dist/"], check=True)
        subprocess.run(["git", "commit", "-m", f"Release {tag_name}"], check=True)
        subprocess.run(["git", "tag", "-a", tag_name, "-m", f"Release {tag_name}"], check=True)
        print(f"\n[OK] Release {tag_name} erfolgreich erstellt und getaggt!")
        print(f"Fuehre 'git push origin main --follow-tags' aus, um das Release auf GitHub zu veroeffentlichen.")
    except Exception as e:
        print(f"\n[Hinweis] Git Tag konnte nicht automatisch gesetzt werden: {e}")
        print(f"Version in manifest.json und dist/ ist auf {new_version} aktualisiert.")

if __name__ == "__main__":
    bump_version()
