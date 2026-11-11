"""호빗 움직이는 그림(public/mascot/*.webp) 만들 때 쓴 배경 지우기 — 원본 mp4는 hobit_renewal/mascot_src/

만드는 순서: ffmpeg로 280px 전체 프레임 → 첫·끝 프레임을 포함해 76장 고르게 뽑기 → 이 스크립트 →
  img2webp -loop 1 -lossy -q 65 -m 6 -d 67 (76장 × 67ms = Mascot.tsx CLIP_MS)

흰 배경(테두리와 이어진 부분만) → 투명. 어두운 배경에서 흰 테두리가 안 보이게:
1) 흰색이 섞인 바깥 1px은 깎고(알파 침식) 살짝 부드럽게
2) 투명·반투명 픽셀의 색은 안쪽 색으로 채움 (손실 압축이 테두리 색을 투명 부분의 엉뚱한 색과 섞지 않게)
사용: key2.py 입력폴더 출력폴더"""
import sys, glob, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
LO, HI = 205, 248
for f in sorted(glob.glob(f"{src}/*.png")):
    rgb = np.asarray(Image.open(f).convert("RGB")).astype(np.float32)
    v = rgb.min(axis=2)
    cand = Image.fromarray(((v >= LO) * 255).astype(np.uint8)).copy()
    h, w = v.shape
    for x in range(0, w, 8):
        for y in (0, h - 1):
            if cand.getpixel((x, y)) == 255: ImageDraw.floodfill(cand, (x, y), 128)
    for y in range(0, h, 8):
        for x in (0, w - 1):
            if cand.getpixel((x, y)) == 255: ImageDraw.floodfill(cand, (x, y), 128)
    bg = np.asarray(cand) == 128
    a = np.ones_like(v)
    a[bg] = np.clip((HI - v[bg]) / (HI - LO), 0, 1)
    am = Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
    a2 = np.asarray(am).astype(np.float32) / 255
    a2 = np.minimum(a2, a)  # 침식 결과가 원래보다 불투명해지지 않게
    # 안쪽(완전 불투명) 색으로 바깥을 채움 — 아는 픽셀 이웃 평균으로 한 칸씩 넓힘 (6칸이면 테두리 압축 범위를 덮음)
    solid = a2 >= 0.99
    known = solid.copy()
    fill_c = np.where(known[..., None], rgb, 0.0)
    for _ in range(6):
        acc = np.zeros_like(fill_c); cnt = np.zeros(known.shape, np.float32)
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dy == dx == 0: continue
                k = np.roll(np.roll(known, dy, 0), dx, 1)
                acc += np.roll(np.roll(fill_c, dy, 0), dx, 1) * k[..., None]
                cnt += k
        new = (~known) & (cnt > 0)
        fill_c[new] = acc[new] / cnt[new][:, None]
        known |= new
    fill_c[~known] = rgb[solid].mean(axis=0) if solid.any() else 0
    solid = solid[..., None]
    out = np.where(solid > 0, rgb, np.clip(fill_c, 0, 255))
    rgba = np.dstack([out, a2 * 255]).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(f"{dst}/{os.path.basename(f)}")
