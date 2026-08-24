import os
import sys
import json

from entropy_check import calc_entropy, calc_bytes_per_pixel

VALID_EXTENSIONS = (".jpg", ".jpeg", ".png", ".bmp")


def build_baseline(sample_dir, output_path=r"C:\wazuh_scripts\baseline_stats.json"):
    stats_by_ext = {}

    for root, _, files in os.walk(sample_dir):
        for fname in files:
            ext = os.path.splitext(fname)[1].lower()
            if ext not in VALID_EXTENSIONS:
                continue
            path = os.path.join(root, fname)
            bpp = calc_bytes_per_pixel(path)
            if bpp is None:
                print(f"Skipping unreadable image: {path}")
                continue
            entropy = calc_entropy(path)
            stats_by_ext.setdefault(ext, {"entropies": [], "bpps": []})
            stats_by_ext[ext]["entropies"].append(entropy)
            stats_by_ext[ext]["bpps"].append(bpp)

    result = {}
    for ext, data in stats_by_ext.items():
        n = len(data["entropies"])
        if n < 5:
            print(f"Warning: only {n} samples for {ext} - baseline will be unreliable, add more clean samples")

        e_mean = sum(data["entropies"]) / n
        e_std = (sum((x - e_mean) ** 2 for x in data["entropies"]) / n) ** 0.5
        b_mean = sum(data["bpps"]) / n
        b_std = (sum((x - b_mean) ** 2 for x in data["bpps"]) / n) ** 0.5

        result[ext] = {
            "entropy_mean": round(e_mean, 3),
            "entropy_std": round(e_std, 3),
            "bpp_mean": round(b_mean, 4),
            "bpp_std": round(b_std, 4),
            "sample_count": n
        }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(result, f, indent=2)

    print(f"Baseline written to {output_path}")
    for ext, s in result.items():
        print(f"  {ext}: entropy={s['entropy_mean']}±{s['entropy_std']}, bpp={s['bpp_mean']}±{s['bpp_std']} (n={s['sample_count']})")


if __name__ == "__main__":
    sample_dir = sys.argv[1] if len(sys.argv) > 1 else "clean_samples"
    build_baseline(sample_dir)
