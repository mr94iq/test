"""Downscale the 2x renders (out/hi-NN.png) to final Instagram 1080x1350 files and build a preview sheet."""
import glob, os
from PIL import Image

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, 'out')
files = sorted(glob.glob(os.path.join(out, 'hi-*.png')))
for f in files:
    n = os.path.basename(f)[3:5]
    Image.open(f).convert('RGB').resize((1080, 1350), Image.LANCZOS).save(os.path.join(out, f'{n}.png'), optimize=True)

W, H, g = 360, 450, 12
cols = 5
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * W + (cols + 1) * g, rows * H + (rows + 1) * g), (6, 14, 11))
for i, f in enumerate(files):
    im = Image.open(f).resize((W, H), Image.LANCZOS)
    r, c = divmod(i, cols)
    sheet.paste(im, (g + (cols - 1 - c) * (W + g), g + r * (H + g)))  # RTL order
sheet.save(os.path.join(root, 'preview.jpg'), quality=88)
print(len(files), 'slides exported')
