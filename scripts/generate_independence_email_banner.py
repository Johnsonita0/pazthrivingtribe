from PIL import Image, ImageDraw
import math


WIDTH, HEIGHT = 640, 240
FRAME_COUNT = 36
DURATION_MS = 90
BURSTS = [(390, 82, 0.0), (535, 142, 0.31), (455, 205, 0.63), (600, 48, 0.48)]
BURST_COLORS = [(0, 210, 119), (255, 255, 255), (255, 215, 112)]
frames = []

for frame_index in range(FRAME_COUNT):
    phase = frame_index / FRAME_COUNT
    image = Image.new('RGB', (WIDTH, HEIGHT))
    pixels = image.load()
    for y in range(HEIGHT):
        blend = y / (HEIGHT - 1)
        base = tuple(round(top * (1 - blend) + bottom * blend) for top, bottom in zip((7, 65, 43), (2, 30, 23)))
        for x in range(WIDTH):
            glow = max(0, 1 - math.sqrt(((x - 460) / 340) ** 2 + ((y - 110) / 210) ** 2))
            pixels[x, y] = tuple(min(255, round(channel + glow * (5 if index != 1 else 13))) for index, channel in enumerate(base))

    draw = ImageDraw.Draw(image)
    for burst_x, burst_y, offset in BURSTS:
        progress = (phase + offset) % 1
        radius = 7 + progress * 62
        brightness = max(55, int(255 * (1 - progress * 0.78)))
        for ray in range(20):
            angle = math.tau * ray / 20
            inner = radius * 0.48
            outer = radius * (0.82 + 0.13 * math.sin(ray * 4 + frame_index))
            base_color = BURST_COLORS[(ray + int(offset * 10)) % len(BURST_COLORS)]
            color = tuple(round(channel * brightness / 255) for channel in base_color)
            start = (burst_x + math.cos(angle) * inner, burst_y + math.sin(angle) * inner)
            end = (burst_x + math.cos(angle) * outer, burst_y + math.sin(angle) * outer)
            draw.line((start, end), fill=color, width=2 if ray % 3 else 3)
            dot = 2 if ray % 4 else 3
            draw.ellipse((end[0] - dot, end[1] - dot, end[0] + dot, end[1] + dot), fill=color)

    pole_x, flag_x, flag_y, flag_width, flag_height = 49, 62, 48, 275, 142
    draw.line((pole_x, 33, pole_x, 211), fill=(224, 235, 226), width=5)
    draw.ellipse((pole_x - 4, 27, pole_x + 4, 35), fill=(247, 217, 128))

    def wave(x):
        progress = (x - flag_x) / flag_width
        return math.sin(progress * 5.2 - phase * math.tau) * (2 + progress * 9) + math.sin(progress * 10.4 - phase * math.tau * 1.4) * progress * 2

    edge_points = []
    for step in range(57):
        x = flag_x + step * flag_width / 56
        edge_points.append((x + wave(x), flag_y + wave(x)))
    for step in reversed(range(57)):
        x = flag_x + step * flag_width / 56
        edge_points.append((x + wave(x), flag_y + flag_height + wave(x)))
    draw.polygon([(x + 4, y + 5) for x, y in edge_points], fill=(0, 16, 11))

    segment_count = 66
    stripe_width = flag_width / 3
    for segment in range(segment_count):
        x0 = flag_x + segment * flag_width / segment_count
        x1 = flag_x + (segment + 1) * flag_width / segment_count + 1
        wave0, wave1 = wave(x0), wave(x1)
        center = (x0 + x1) / 2
        stripe = min(2, int((center - flag_x) / stripe_width))
        fold = math.cos(((center - flag_x) / flag_width) * math.pi * 4 - phase * math.tau)
        if stripe == 1:
            shade = max(0.68, min(1.1, 0.9 + fold * 0.1))
            color = (round(255 * shade), round(255 * shade), round(255 * shade))
        else:
            shade = max(0.58, min(1.05, 0.84 + fold * 0.16))
            color = (0, round(135 * shade), round(81 * shade))
        draw.polygon([
            (x0 + wave0, flag_y + wave0),
            (x1 + wave1, flag_y + wave1),
            (x1 + wave1, flag_y + flag_height + wave1),
            (x0 + wave0, flag_y + flag_height + wave0)
        ], fill=color)

    frames.append(image.convert('P', palette=Image.Palette.ADAPTIVE, colors=128))

frames[0].save(
    'public/image/nigeria-independence-email.gif',
    save_all=True,
    append_images=frames[1:],
    duration=DURATION_MS,
    loop=0,
    optimize=True,
    disposal=2
)
print(f'Created {FRAME_COUNT} frames with a waving Nigeria flag and looping fireworks.')