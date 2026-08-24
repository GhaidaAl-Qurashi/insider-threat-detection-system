import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from entropy_check import check_file

WATCHED_PATHS = [
    r"C:\HR_Confidential",
    r"C:\CompanyShare\HR_Department\02_Restricted_Executive_HR"
]

IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".bmp")


RETRY_ATTEMPTS = 5
RETRY_DELAY_SECONDS = 0.5


class ImageHandler(FileSystemEventHandler):
    def process(self, path):
        if not path.lower().endswith(IMAGE_EXTENSIONS):
            return

        # The file may still be locked by whatever process just wrote it
        # (e.g. OpenStego, or Explorer holding a handle) - retry briefly instead
        # of failing immediately on a transient Permission denied.
        result = None
        for attempt in range(RETRY_ATTEMPTS):
            result = check_file(path)
            if "error" not in result or "Permission denied" not in result["error"]:
                break
            time.sleep(RETRY_DELAY_SECONDS)

        if "error" in result:
            print(f"[ERROR] {path}: {result['error']}")
        elif result["suspicious"]:
            print(f"[SUSPICIOUS] {path} | entropy={result['entropy']} (z={result['entropy_zscore']}) "
                  f"| bpp_z={result['bpp_zscore']} | reasons={result['reasons']}")
        else:
            print(f"[ok] {path} | entropy={result['entropy']}")

    def on_created(self, event):
        if not event.is_directory:
            self.process(event.src_path)

    def on_modified(self, event):
        if not event.is_directory:
            self.process(event.src_path)


if __name__ == "__main__":
    print("Entropy watcher started. Watching folders directly...")
    observer = Observer()
    handler = ImageHandler()
    for path in WATCHED_PATHS:
        observer.schedule(handler, path, recursive=True)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
