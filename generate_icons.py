import os
import zlib
import struct
import math

def create_png(width, height, get_pixel_func):
    """
    Creates a PNG file in memory using pure standard library (struct + zlib).
    get_pixel_func(x, y, width, height) -> (r, g, b, a) with values 0-255.
    """
    raw_rows = []
    for y in range(height):
        row = [0]  # Filter type 0 (None)
        for x in range(width):
            r, g, b, a = get_pixel_func(x, y, width, height)
            row.extend([int(r) & 0xff, int(g) & 0xff, int(b) & 0xff, int(a) & 0xff])
        raw_rows.append(bytes(row))
    
    raw_data = b"".join(raw_rows)
    compressed = zlib.compress(raw_data, level=9)
    
    png_signature = b"\x89PNG\r\n\x1a\n"
    
    def make_chunk(chunk_type, data):
        length = struct.pack(">I", len(data))
        crc = struct.pack(">I", zlib.crc32(chunk_type + data) & 0xffffffff)
        return length + chunk_type + data + crc
    
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    ihdr = make_chunk(b"IHDR", ihdr_data)
    idat = make_chunk(b"IDAT", compressed)
    iend = make_chunk(b"IEND", b"")
    
    return png_signature + ihdr + idat + iend

def draw_icon_pixel(x, y, w, h):
    # Normalized coords: -1.0 to 1.0
    nx = (x + 0.5) / (w / 2.0) - 1.0
    ny = (y + 0.5) / (h / 2.0) - 1.0
    dist = math.hypot(nx, ny)
    
    # Outer circle mask (radius ~ 0.88 with smooth anti-aliasing)
    bg_radius = 0.88
    edge_width = 1.5 / (w / 2.0)
    
    if dist > bg_radius + edge_width:
        return (0, 0, 0, 0)
    
    # Alpha for background circle
    if dist > bg_radius - edge_width:
        bg_alpha = max(0.0, min(1.0, (bg_radius + edge_width - dist) / (2.0 * edge_width)))
    else:
        bg_alpha = 1.0
        
    # Background color: sleek dark slate gradient
    # Top-left dark blue-gray (23, 32, 34) to bottom-right deep black-teal (14, 18, 19)
    grad = (nx + ny + 2.0) / 4.0
    br = 16 + grad * 10
    bg = 22 + grad * 12
    bb = 24 + grad * 12
    
    # Crescent moon shape:
    # Outer moon circle: center (-0.05, 0.05), radius ~0.55
    # Inner cut circle: center (0.22, -0.22), radius ~0.48
    d_outer = math.hypot(nx - (-0.05), ny - 0.05)
    d_inner = math.hypot(nx - 0.22, ny - (-0.22))
    
    r_outer = 0.52
    r_inner = 0.46
    
    in_outer = d_outer <= r_outer + edge_width
    in_inner = d_inner < r_inner - edge_width
    
    moon_alpha = 0.0
    if in_outer and not in_inner:
        # Distance to outer boundary
        a_outer = 1.0 if d_outer <= r_outer - edge_width else max(0.0, min(1.0, (r_outer + edge_width - d_outer) / (2.0 * edge_width)))
        # Distance to inner boundary (inverted)
        a_inner = 0.0 if d_inner >= r_inner + edge_width else max(0.0, min(1.0, (d_inner - (r_inner - edge_width)) / (2.0 * edge_width)))
        moon_alpha = a_outer * a_inner
    
    # Little star / spark at top right: center (0.42, -0.38)
    d_star = math.hypot(nx - 0.42, ny - (-0.38))
    star_alpha = 0.0
    if d_star < 0.15 + edge_width:
        star_alpha = max(0.0, min(1.0, (0.15 + edge_width - d_star) / (2.0 * edge_width)))
        # Give star a 4-point twinkle shape
        dx_star = abs(nx - 0.42)
        dy_star = abs(ny - (-0.38))
        if dx_star * dy_star > 0.003:
            star_alpha *= max(0.0, 1.0 - (dx_star * dy_star * 200.0))
            
    # Second small star at bottom right: center (0.48, 0.25)
    d_star2 = math.hypot(nx - 0.48, ny - 0.25)
    star2_alpha = 0.0
    if d_star2 < 0.09 + edge_width:
        star2_alpha = max(0.0, min(1.0, (0.09 + edge_width - d_star2) / (2.0 * edge_width)))

    # Foreground elements: Vinted Teal / Cyan (#09b1ba -> RGB 9, 177, 186 or #00d2d3)
    fg_r, fg_g, fg_b = 9, 177, 186
    
    # Stars are brighter / white-cyan (#a6f3f7)
    s_r, s_g, s_b = 166, 243, 247
    
    # Combine moon and stars
    elem_alpha = max(moon_alpha, star_alpha, star2_alpha)
    if elem_alpha > 0:
        if star_alpha > moon_alpha or star2_alpha > moon_alpha:
            fr, fg_col, fb = s_r, s_g, s_b
        else:
            fr, fg_col, fb = fg_r, fg_g, fg_b
            
        final_r = br * (1.0 - elem_alpha) + fr * elem_alpha
        final_g = bg * (1.0 - elem_alpha) + fg_col * elem_alpha
        final_b = bb * (1.0 - elem_alpha) + fb * elem_alpha
        return (final_r, final_g, final_b, bg_alpha * 255)
    else:
        return (br, bg, bb, bg_alpha * 255)

def main():
    os.makedirs("icons", exist_ok=True)
    
    # Generate SVG
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1b2527" />
      <stop offset="100%" stop-color="#0e1314" />
    </linearGradient>
    <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2dd4bf" />
      <stop offset="100%" stop-color="#09b1ba" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Circle -->
  <circle cx="64" cy="64" r="56" fill="url(#bgGrad)" stroke="#09b1ba" stroke-width="3" stroke-opacity="0.35" />

  <!-- Crescent Moon -->
  <path d="M60.8 28 C41.5 28 25.8 43.7 25.8 63 C25.8 82.3 41.5 98 60.8 98 C72.8 98 83.3 91.9 89.5 82.5 C72.1 82.1 58.2 68.1 58.2 50.8 C58.2 41.6 62.3 33.3 68.8 27.6 C66.2 27.2 63.5 27 60.8 28 Z"
        fill="url(#moonGrad)" filter="url(#glow)" />

  <!-- Stars / Sparkles -->
  <path d="M92 36 L94 42 L100 44 L94 46 L92 52 L90 46 L84 44 L90 42 Z" fill="#a6f3f7" />
  <circle cx="98" cy="74" r="3" fill="#a6f3f7" opacity="0.85" />
  <circle cx="38" cy="40" r="1.8" fill="#a6f3f7" opacity="0.6" />
</svg>
'''
    with open("icons/icon.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)
    print("Generated icons/icon.svg")

    # Generate PNGs: 16, 32, 48, 128
    for size in [16, 32, 48, 128]:
        png_bytes = create_png(size, size, draw_icon_pixel)
        filename = f"icons/icon-{size}.png"
        with open(filename, "wb") as f:
            f.write(png_bytes)
        print(f"Generated {filename} ({size}x{size})")

if __name__ == "__main__":
    main()
