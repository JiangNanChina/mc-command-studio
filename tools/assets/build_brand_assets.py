"""Build the application icon and in-app logo from the supplied brand artwork."""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
source = Image.open(ROOT / "tools" / "assets" / "brand-source.jpg").convert("RGB")

# Full logo for in-app branding.
logo = source.resize((800, round(800 * source.height / source.width)), Image.LANCZOS)
logo_path = ROOT / "apps" / "desktop" / "src" / "renderer" / "src" / "assets" / "logo.png"
logo_path.parent.mkdir(parents=True, exist_ok=True)
logo.save(logo_path, optimize=True)

# Square icon crop: central command block, excluding the wordmark.
icon = source.crop((280, 60, 1780, 1560)).resize((1024, 1024), Image.LANCZOS).convert("RGBA")
mask = Image.new("L", (1024, 1024), 0)
ImageDraw.Draw(mask).rounded_rectangle((0, 0, 1023, 1023), radius=190, fill=255)
icon.putalpha(mask)

build = ROOT / "apps" / "desktop" / "build"
build.mkdir(parents=True, exist_ok=True)
icon.save(build / "icon.png", optimize=True)
icon.save(
    build / "icon.ico",
    sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
)
print("logo", logo.size, "icon", icon.size)
