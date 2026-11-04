#!/usr/bin/env python3
"""抽帧流水线：视频 -> 逐帧 -> 去白底 -> 裁切 -> WebP 序列 + manifest.js

依赖（全部开源免费）：ffmpeg / Python3 / numpy / scipy / Pillow

用法：
    python3 tools/extract_frames.py <视频文件> [-o 输出目录] [--fps 24] [--width 512] [--quality 82]

默认输出到 ../frames（即站点根目录下的 frames/），并生成 frames/manifest.js。
"""
import argparse
import glob
import json
import os
import shutil
import subprocess
import tempfile

import numpy as np
from PIL import Image
from scipy import ndimage


def bg_mask(rgb: np.ndarray) -> np.ndarray:
    """与图像四边连通的近白区域，即真正的“外部背景”。"""
    near_white = np.all(rgb > 228, axis=2)
    lab, n = ndimage.label(near_white)
    if n == 0:
        return np.zeros(rgb.shape[:2], bool)
    border = np.unique(np.concatenate([lab[0, :], lab[-1, :], lab[:, 0], lab[:, -1]]))
    border = border[border != 0]
    if border.size == 0:
        return np.zeros(rgb.shape[:2], bool)
    return np.isin(lab, border)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("video", help="输入视频路径")
    ap.add_argument("-o", "--out", default=None, help="输出目录（默认 <脚本>/../frames）")
    ap.add_argument("--fps", type=float, default=24, help="抽帧帧率")
    ap.add_argument("--width", type=int, default=512, help="输出帧宽度")
    ap.add_argument("--quality", type=int, default=82, help="WebP 质量 0-100")
    ap.add_argument("--pad", type=int, default=8, help="裁切留白像素")
    args = ap.parse_args()

    here = os.path.dirname(os.path.abspath(__file__))
    out_dir = args.out or os.path.join(here, os.pardir, "frames")
    out_dir = os.path.abspath(out_dir)
    tmp = tempfile.mkdtemp(prefix="catframes_")

    try:
        # 1) 抽帧
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-i", args.video,
             "-vf", f"fps={args.fps}", "-vsync", "0",
             os.path.join(tmp, "%04d.png")],
            check=True,
        )
        files = sorted(glob.glob(os.path.join(tmp, "*.png")))
        if not files:
            raise SystemExit("抽帧失败：没有产生任何帧")
        print(f"抽帧完成：{len(files)} 帧")

        # 2) 所有帧的并集包围盒（保证逐帧对齐）
        minx = miny = 10 ** 9
        maxx = maxy = -1
        h = w = 0
        for f in files:
            rgb = np.asarray(Image.open(f).convert("RGB"))
            h, w = rgb.shape[:2]
            ys, xs = np.where(~bg_mask(rgb))
            if xs.size == 0:
                continue
            minx, maxx = min(minx, int(xs.min())), max(maxx, int(xs.max()))
            miny, maxy = min(miny, int(ys.min())), max(maxy, int(ys.max()))
        x0, y0 = max(0, minx - args.pad), max(0, miny - args.pad)
        x1, y1 = min(w, maxx + 1 + args.pad), min(h, maxy + 1 + args.pad)
        tw = args.width
        th = round((y1 - y0) * args.width / (x1 - x0))
        print(f"裁切 ({x0},{y0})-({x1},{y1}) -> {tw}x{th}")

        # 3) 逐帧去背 + 缩放 + 编码
        shutil.rmtree(out_dir, ignore_errors=True)
        os.makedirs(out_dir, exist_ok=True)
        names = []
        for i, f in enumerate(files, 1):
            rgb = np.asarray(Image.open(f).convert("RGB"))
            outside = bg_mask(rgb)
            alpha = np.where(outside, 0.0, 255.0).astype(np.float32)
            # 边缘 2px：按“接近白色的程度”半透明，消除白边
            ring = ndimage.binary_dilation(outside, iterations=2) & ~outside
            if ring.any():
                white = rgb.min(axis=2).astype(np.float32) / 255.0
                alpha[ring] = np.clip(255.0 * (1.0 - white), 0.0, 255.0)[ring]
            rgba = np.dstack([rgb, alpha]).astype(np.uint8)
            img = Image.fromarray(rgba, "RGBA").crop((x0, y0, x1, y1))
            img = img.resize((tw, th), Image.LANCZOS)
            name = f"{i:04d}.webp"
            img.save(os.path.join(out_dir, name), "WEBP", quality=args.quality, method=6)
            names.append(name)

        # 4) 前端清单（写成 js，file:// 直接打开也不会有跨域问题）
        with open(os.path.join(out_dir, "manifest.js"), "w") as fp:
            fp.write("window.CAT_FRAMES = " + json.dumps(
                {"count": len(names), "w": tw, "h": th,
                 "files": ["frames/" + n for n in names]},
                separators=(",", ":")) + ";\n")

        total = sum(os.path.getsize(os.path.join(out_dir, n)) for n in names)
        print(f"输出 {len(names)} 帧 / {total / 1048576:.2f} MB -> {out_dir}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
