import math
import json
import os
from collections import Counter
from datetime import datetime

from PIL import Image

BASELINE_STATS_FILE = r"C:\wazuh_scripts\baseline_stats.json"
Z_THRESHOLD = 2.5  # how many std devs from the mean counts as an outlier
FALLBACK_ENTROPY_THRESHOLD = 7.95  # used only if no baseline exists yet for this extension


def calc_entropy(filepath):
    with open(filepath, 'rb') as f:
        data = f.read()
    if not data:
        return 0.0
    counts = Counter(data)
    length = len(data)
    return -sum((c / length) * math.log2(c / length) for c in counts.values())


def calc_bytes_per_pixel(filepath):
    """File size normalized by pixel count, so images of different resolutions are comparable."""
    size = os.path.getsize(filepath)
    try:
        with Image.open(filepath) as img:
            width, height = img.size
        pixels = width * height
        if pixels == 0:
            return None
        return size / pixels
    except Exception:
        return None  # not a readable image (corrupt, or non-image file with an image extension)


def zscore(value, mean, stddev):
    if stddev == 0:
        return 0.0
    return (value - mean) / stddev


def load_baseline(ext):
    """Loads mean/stddev entropy and bytes-per-pixel for this extension, built by build_baseline.py
    from a folder of known-clean sample images. Returns None if no baseline exists yet."""
    if not os.path.exists(BASELINE_STATS_FILE):
        return None
    with open(BASELINE_STATS_FILE, 'r') as f:
        stats = json.load(f)
    return stats.get(ext.lower())


def check_file(filepath, log_path=r"C:\wazuh_scripts\entropy_results.log"):
    try:
        ext = os.path.splitext(filepath)[1].lower()
        entropy = calc_entropy(filepath)
        bpp = calc_bytes_per_pixel(filepath)

        baseline = load_baseline(ext)
        entropy_z = None
        bpp_z = None
        suspicious = False
        reasons = []

        if baseline:
            entropy_z = zscore(entropy, baseline["entropy_mean"], baseline["entropy_std"])
            if abs(entropy_z) > Z_THRESHOLD:
                suspicious = True
                reasons.append("entropy_outlier")

            if bpp is not None:
                bpp_z = zscore(bpp, baseline["bpp_mean"], baseline["bpp_std"])
                if abs(bpp_z) > Z_THRESHOLD:
                    suspicious = True
                    reasons.append("bytes_per_pixel_outlier")
        else:
            # No baseline built yet for this extension - fall back to a conservative absolute cutoff
            if entropy > FALLBACK_ENTROPY_THRESHOLD:
                suspicious = True
                reasons.append("entropy_absolute_fallback_no_baseline")

        result = {
            "timestamp": datetime.now().isoformat(),
            "file": filepath,
            "entropy": round(entropy, 3),
            "entropy_zscore": round(entropy_z, 2) if entropy_z is not None else None,
            "bytes_per_pixel": round(bpp, 4) if bpp is not None else None,
            "bpp_zscore": round(bpp_z, 2) if bpp_z is not None else None,
            "suspicious": suspicious,
            "reasons": reasons
        }
        with open(log_path, "a") as log:
            log.write(json.dumps(result) + "\n")
        return result
    except Exception as e:
        return {"error": str(e), "file": filepath}
