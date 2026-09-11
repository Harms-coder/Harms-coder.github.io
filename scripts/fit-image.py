"""
Klargør et billede med gennemsigtig baggrund til appen: beskær til motivet, læg det midt i et
kvadrat med lidt luft, skalér til 320x320 og gem som komprimeret PNG — samme format som
public/images/exercises/.

    python3 scripts/fit-image.py <ind.png> <ud.png> [side=320]
"""
import sys
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
side = int(sys.argv[3]) if len(sys.argv) > 3 else 320

im = Image.open(src).convert("RGBA")
bbox = im.getchannel("A").getbbox() or (0, 0, *im.size)
im = im.crop(bbox)
canvas = int(max(im.size) * 1.06)
square = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
square.paste(im, ((canvas - im.width) // 2, (canvas - im.height) // 2))
square.resize((side, side), Image.LANCZOS).save(dst, optimize=True)
