import os
import re
import subprocess
import sys
import tempfile

def main() -> None:
    cmd = [
        "gcloud",
        "secrets",
        "versions",
        "access",
        "1",
        "--secret=DATABASE_URL_STAGING",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    secret = result.stdout.strip()

    match = re.search(r"@([^/]+)/", secret)
    if match and match.group(1):
        print(
            "DATABASE_URL_STAGING already contains host segment "
            f"({match.group(1)}); no update performed."
        )
        sys.exit(0)

    if "@/" not in secret:
        print('DATABASE_URL_STAGING does not include "@/" pattern; aborting.')
        sys.exit(1)

    updated = secret.replace("@/", "@localhost:5432/", 1)

    with tempfile.NamedTemporaryFile(
        delete=False, mode="w", encoding="utf-8", newline=""
    ) as tmp:
        tmp.write(updated)
        tmp_path = tmp.name

    try:
        subprocess.run(
            [
                "gcloud",
                "secrets",
                "versions",
                "add",
                "DATABASE_URL_STAGING",
                f"--data-file={tmp_path}",
            ],
            check=True,
        )
        print("DATABASE_URL_STAGING updated to include localhost host segment.")
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


if __name__ == "__main__":
    main()
