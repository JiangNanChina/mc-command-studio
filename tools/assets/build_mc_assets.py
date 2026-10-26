#!/usr/bin/env python3
"""Generate Chinese names + icon atlas from a Minecraft client jar.

Usage:
  python tools/assets/build_mc_assets.py \
    --jar artifacts/client-26.3.jar \
    --lang artifacts/zh_cn.json \
    --pack packs/26.3/registries.json \
    --out-app apps/desktop/src/renderer/src

The generated files are committed:
  src/assets/mc-icons.png
  src/data/mc-icons.json
  src/data/mc-names.json
"""
import argparse
import hashlib
import io
import json
import math
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

CELL = 32
COLUMNS = 64
FONT_CANDIDATES = [
    r"C:\Windows\Fonts\msyhbd.ttc",
    r"C:\Windows\Fonts\msyh.ttc",
    r"C:\Windows\Fonts\simhei.ttf",
]


def load_font(size: int):
    for path in FONT_CANDIDATES:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def clean_name(value: str) -> str:
    return value.replace("§.", "").replace("§", "").strip()


def title_name(identifier: str) -> str:
    return identifier.replace("_", " ").title()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--jar", required=True)
    parser.add_argument("--lang", required=True)
    parser.add_argument("--pack", required=True)
    parser.add_argument("--out-app", required=True)
    args = parser.parse_args()

    jar = zipfile.ZipFile(args.jar)
    names = set(jar.namelist())
    lang = json.loads(Path(args.lang).read_text(encoding="utf-8"))
    registries = json.loads(Path(args.pack).read_text(encoding="utf-8"))
    out_app = Path(args.out_app)
    assets_dir = out_app / "assets"
    data_dir = out_app / "data"
    assets_dir.mkdir(parents=True, exist_ok=True)
    data_dir.mkdir(parents=True, exist_ok=True)

    model_cache: dict[str, dict | None] = {}

    def read_json(path: str):
        if path in model_cache:
            return model_cache[path]
        if path not in names:
            model_cache[path] = None
            return None
        try:
            model_cache[path] = json.loads(jar.read(path))
        except (json.JSONDecodeError, UnicodeDecodeError):
            model_cache[path] = None
        return model_cache[path]

    def texture_ref_path(ref) -> str | None:
        if isinstance(ref, dict):
            ref = ref.get("sprite") or ""
        if not isinstance(ref, str) or not ref or ref.startswith("#"):
            return None
        ref = ref.removeprefix("minecraft:")
        path = f"assets/minecraft/textures/{ref}.png"
        return path if path in names else None

    def resolve_model(model_path: str, depth: int = 0) -> str | None:
        if depth > 5:
            return None
        model = read_json(model_path)
        if not model:
            return None
        textures = model.get("textures") or {}
        for key in (
            "layer0",
            "layer1",
            "particle",
            "all",
            "texture",
            "side",
            "top",
            "bottom",
            "end",
            "front",
            "source",
        ):
            if key in textures:
                found = texture_ref_path(textures[key])
                if found:
                    return found
        parent = model.get("parent")
        if parent:
            return resolve_model(f"assets/minecraft/models/{parent}.json", depth + 1)
        return None

    def item_texture(item_id: str) -> str | None:
        if item_id.endswith("_spawn_egg") and "assets/minecraft/textures/item/spawn_egg.png" in names:
            return "assets/minecraft/textures/item/spawn_egg.png"
        generic = {
            "potion": "potion",
            "splash_potion": "splash_potion",
            "lingering_potion": "lingering_potion",
            "tipped_arrow": "tipped_arrow",
        }
        if item_id in generic:
            path = f"assets/minecraft/textures/item/{generic[item_id]}.png"
            if path in names:
                return path
        direct = f"assets/minecraft/textures/item/{item_id}.png"
        if direct in names:
            return direct
        model = resolve_model(f"assets/minecraft/models/item/{item_id}.json")
        if model:
            return model
        block = resolve_model(f"assets/minecraft/models/block/{item_id}.json")
        if block:
            return block
        direct_block = f"assets/minecraft/textures/block/{item_id}.png"
        if direct_block in names:
            return direct_block
        return None

    def block_texture(block_id: str) -> str | None:
        direct = f"assets/minecraft/textures/block/{block_id}.png"
        if direct in names:
            return direct
        model = resolve_model(f"assets/minecraft/models/block/{block_id}.json")
        if model:
            return model
        direct_item = f"assets/minecraft/textures/item/{block_id}.png"
        if direct_item in names:
            return direct_item
        return None

    def load_icon(path: str | None, label: str, category: str) -> Image.Image:
        if path:
            try:
                image = Image.open(io.BytesIO(jar.read(path))).convert("RGBA")
                width, height = image.size
                if height > width and width <= 64:
                    image = image.crop((0, 0, width, width))
                image.thumbnail((CELL, CELL), Image.Resampling.NEAREST)
                canvas = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
                canvas.alpha_composite(
                    image, ((CELL - image.width) // 2, (CELL - image.height) // 2)
                )
                return canvas
            except (OSError, ValueError):
                pass

        # Deterministic colored glyph tile.
        digest = hashlib.sha1(f"{category}:{label}".encode("utf-8")).hexdigest()
        hue = int(digest[:4], 16) % 360
        import colorsys

        r, g, b = colorsys.hsv_to_rgb(hue / 360, 0.55, 0.55)
        background = (int(r * 255), int(g * 255), int(b * 255), 255)
        tile = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
        draw = ImageDraw.Draw(tile)
        draw.rounded_rectangle((1, 1, CELL - 2, CELL - 2), radius=6, fill=background)
        char = (label or "?")[0]
        font = load_font(18 if len(char) == 1 else 14)
        box = draw.textbbox((0, 0), char, font=font)
        x = (CELL - (box[2] - box[0])) / 2 - box[0]
        y = (CELL - (box[3] - box[1])) / 2 - box[1]
        draw.text((x, y), char, fill=(255, 255, 255, 235), font=font)
        return tile

    def names_for(kind: str, ids: list[str], prefixes: list[str]) -> dict[str, str]:
        result = {}
        for raw in ids:
            identifier = raw.removeprefix("minecraft:")
            value = None
            for prefix in prefixes:
                value = lang.get(f"{prefix}{identifier}")
                if value:
                    break
            result[identifier] = clean_name(value) if value else title_name(identifier)
        return result

    item_ids = [x.removeprefix("minecraft:") for x in registries.get("item", [])]
    block_ids = [x.removeprefix("minecraft:") for x in registries.get("block", [])]
    effect_ids = [x.removeprefix("minecraft:") for x in registries.get("mob_effect", [])]
    enchant_ids = [x.removeprefix("minecraft:") for x in registries.get("enchantment", [])]
    entity_ids = [x.removeprefix("minecraft:") for x in registries.get("entity_type", [])]
    sound_ids = [x.removeprefix("minecraft:") for x in registries.get("sound_event", [])]

    sounds_json = {}
    if "assets/minecraft/sounds.json" in names:
        try:
            sounds_json = json.loads(jar.read("assets/minecraft/sounds.json"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            sounds_json = {}

    def sound_name(identifier: str) -> str:
        entry = sounds_json.get(identifier) or {}
        subtitle = entry.get("subtitle")
        if subtitle and lang.get(subtitle):
            return clean_name(lang[subtitle])
        if lang.get(f"subtitles.{identifier}"):
            return clean_name(lang[f"subtitles.{identifier}"])
        return title_name(identifier.split(".")[-1])

    item_names = names_for("item", item_ids, ["item.minecraft.", "block.minecraft."])
    block_names = names_for("block", block_ids, ["block.minecraft.", "item.minecraft."])
    effect_names = names_for("effect", effect_ids, ["effect.minecraft."])
    enchant_names = names_for("enchant", enchant_ids, ["enchantment.minecraft."])
    entity_names = names_for("entity", entity_ids, ["entity.minecraft."])
    sound_names = {identifier: sound_name(identifier) for identifier in sound_ids}

    entries: list[tuple[str, str, Image.Image]] = []
    stats = {}
    for category, ids, texture_fn, label_map in [
        ("items", item_ids, item_texture, item_names),
        ("blocks", block_ids, block_texture, block_names),
        ("effects", effect_ids, lambda _: None, effect_names),
        ("enchantments", enchant_ids, lambda _: None, enchant_names),
        ("entities", entity_ids, lambda _: None, entity_names),
        ("sounds", sound_ids, lambda _: None, sound_names),
    ]:
        found = 0
        for identifier in ids:
            path = texture_fn(identifier)
            if path:
                found += 1
            image = load_icon(path, label_map.get(identifier, identifier), category)
            entries.append((category, identifier, image))
        stats[category] = (found, len(ids))

    rows = math.ceil(len(entries) / COLUMNS)
    atlas = Image.new("RGBA", (COLUMNS * CELL, rows * CELL), (0, 0, 0, 0))
    icons: dict[str, dict[str, int]] = {}
    for index, (category, identifier, image) in enumerate(entries):
        x = (index % COLUMNS) * CELL
        y = (index // COLUMNS) * CELL
        atlas.alpha_composite(image, (x, y))
        icons.setdefault(category, {})[identifier] = index

    atlas.save(assets_dir / "mc-icons.png", optimize=True)
    (data_dir / "mc-icons.json").write_text(
        json.dumps(
            {"cell": CELL, "columns": COLUMNS, "icons": icons},
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        encoding="utf-8",
    )
    (data_dir / "mc-names.json").write_text(
        json.dumps(
            {
                "items": item_names,
                "blocks": block_names,
                "effects": effect_names,
                "enchantments": enchant_names,
                "entities": entity_names,
                "sounds": sound_names,
            },
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        encoding="utf-8",
    )
    print(f"atlas: {atlas.width}x{atlas.height}, entries={len(entries)}")
    for category, (found, total) in stats.items():
        print(f"{category}: real texture {found}/{total}")
    print(f"wrote {assets_dir / 'mc-icons.png'}")
    print(f"wrote {data_dir / 'mc-icons.json'}")
    print(f"wrote {data_dir / 'mc-names.json'}")


if __name__ == "__main__":
    main()
