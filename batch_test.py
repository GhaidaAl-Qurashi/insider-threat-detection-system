import os
import sys

from entropy_check import check_file

VALID_EXTENSIONS = (".jpg", ".jpeg", ".png", ".bmp")


def batch_test(folder):
    total = 0
    suspicious_count = 0
    errors = []
    flagged = []

    for root, _, files in os.walk(folder):
        for fname in files:
            ext = os.path.splitext(fname)[1].lower()
            if ext not in VALID_EXTENSIONS:
                continue
            path = os.path.join(root, fname)
            result = check_file(path)
            total += 1

            if "error" in result:
                errors.append((path, result["error"]))
                continue

            if result["suspicious"]:
                suspicious_count += 1
                flagged.append((path, result["entropy"], result["entropy_zscore"], result["bpp_zscore"]))

    print(f"\n=== Batch test results for: {folder} ===")
    print(f"Total images checked: {total}")
    print(f"Flagged suspicious:   {suspicious_count}  ({(suspicious_count / total * 100) if total else 0:.1f}%)")
    if errors:
        print(f"Errors:               {len(errors)}")

    if flagged:
        print("\n--- Flagged files ---")
        for path, entropy, ez, sz in flagged:
            print(f"  {path} | entropy={entropy} (z={ez}) | bpp_z={sz}")

    if errors:
        print("\n--- Errors ---")
        for path, err in errors:
            print(f"  {path}: {err}")

    print()
    if total > 0:
        rate = suspicious_count / total
        if rate > 0.15:
            print("⚠ WARNING: >15% of clean images flagged as suspicious. Baseline is likely too narrow "
                  "(overfit to the 30 build_baseline samples) or Z_THRESHOLD is too strict. "
                  "Consider a larger/more varied baseline sample or raising Z_THRESHOLD.")
        else:
            print("Flag rate looks reasonable for a clean held-out set.")


if __name__ == "__main__":
    folder = sys.argv[1] if len(sys.argv) > 1 else "held_out_samples"
    batch_test(folder)
