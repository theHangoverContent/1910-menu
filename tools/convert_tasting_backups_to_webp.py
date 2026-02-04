import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Missing Pillow. Install with: pip install pillow")
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "server" / "public" / "media" / "dishes" / "tasting"

EXTS = {".jpg", ".jpeg", ".png"}

def convert_one(src: Path):
    out = src.with_suffix(".webp")
    img = Image.open(src).convert("RGBA")
    img.save(out, "WEBP", quality=88, method=6)
    print(f"Converted: {src.name} -> {out.name}")

def main():
    if not TARGET.exists():
        print(f"Folder not found: {TARGET}")
        sys.exit(1)

    for p in TARGET.iterdir():
        if p.suffix.lower() in EXTS:
            convert_one(p)

if __name__ == "__main__":
    main()
