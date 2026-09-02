"""Render slide .pptx jadi PNG memakai PIL, langsung dari XML di dalam berkas.

Huruf Calibri tidak ada di mesin ini, jadi dipakai DejaVu Sans yang lebih lebar —
hasil render karena itu bersifat pesimistis: yang muat di sini pasti muat di Calibri.
"""
import re, sys, zipfile
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw, ImageFont

A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
P = "{http://schemas.openxmlformats.org/presentationml/2006/main}"
W_EMU, H_EMU = 12192000, 6858000
PX = 1400
S = PX / W_EMU
PT = PX / 960.0
F = "/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf"
_cache = {}

def font(sz, b, i):
    suf = {(0,0):"", (1,0):"-Bold", (0,1):"-Oblique", (1,1):"-BoldOblique"}[(int(b),int(i))]
    k = (sz, suf)
    if k not in _cache:
        _cache[k] = ImageFont.truetype(F % suf, max(int(sz * PT), 6))
    return _cache[k]

def warna(el, tag):
    c = el.find(f"{A}{tag}/{A}srgbClr") if el is not None else None
    return "#" + c.get("val") if c is not None else None

def potong(d, teks_runs, lebar):
    """Bungkus daftar (teks, font, warna) jadi baris-baris."""
    baris, kini, w = [], [], 0
    for teks, f, c in teks_runs:
        for kata in re.split(r"(\s+)", teks):
            if not kata: continue
            lw = d.textlength(kata, font=f)
            if w + lw > lebar and kini and kata.strip():
                baris.append(kini); kini, w = [], 0
                if not kata.strip(): continue
            kini.append((kata, f, c)); w += lw
    if kini: baris.append(kini)
    return baris

def ambil_runs(par):
    out = []
    for r in par.findall(A+"r"):
        rpr = r.find(A+"rPr")
        sz = int(rpr.get("sz", "1800"))/100.0 if rpr is not None else 18
        b = rpr is not None and rpr.get("b") == "1"
        i = rpr is not None and rpr.get("i") == "1"
        c = warna(rpr, "solidFill") or "#000000"
        out.append((r.find(A+"t").text or "", font(sz, b, i), c, sz))
    return out

def gambar_teks(d, tx, x, y, cx, cy):
    body = tx.find(A+"bodyPr")
    anchor = body.get("anchor", "t") if body is not None else "t"
    blok = []
    for par in tx.findall(A+"p"):
        runs = ambil_runs(par)
        ppr = par.find(A+"pPr")
        marL = int(ppr.get("marL", "0")) if ppr is not None else 0
        indent = int(ppr.get("indent", "0")) if ppr is not None else 0
        algn = ppr.get("algn", "l") if ppr is not None else "l"
        spc = ppr.find(A+"spcBef/"+A+"spcPts") if ppr is not None else None
        sebelum = int(spc.get("val"))/100.0*PT if spc is not None else 0
        peluru = None
        if ppr is not None:
            if ppr.find(A+"buChar") is not None:
                peluru = ppr.find(A+"buChar").get("char")
            elif ppr.find(A+"buAutoNum") is not None:
                peluru = "a."
        if not runs:
            blok.append((sebelum, [], 0, "l", None, 12)); continue
        sz = runs[0][3]
        baris = potong(d, [(t, f, c) for t, f, c, _ in runs], cx - marL*S)
        blok.append((sebelum, baris, marL*S, algn, peluru, sz))
    tinggi = sum(sb + len(b)*sz*PT*1.22 for sb, b, _, _, _, sz in blok)
    cur = y + (max(0, (cy - tinggi)/2) if anchor == "ctr" else 0)
    for sebelum, baris, mar, algn, peluru, sz in blok:
        cur += sebelum
        for n, br in enumerate(baris):
            lw = sum(d.textlength(t, font=f) for t, f, _ in br)
            bx = x + mar
            if algn == "ctr": bx = x + (cx - lw)/2
            elif algn == "r": bx = x + cx - lw
            if n == 0 and peluru:
                d.text((x + mar - 14, cur), peluru, font=font(sz, False, False),
                       fill="#E4572E")
            for t, f, c in br:
                d.text((bx, cur), t, font=f, fill=c)
                bx += d.textlength(t, font=f)
            cur += sz * PT * 1.22
    return cur

def render(z, n, keluar):
    root = ET.fromstring(z.read(f"ppt/slides/slide{n}.xml"))
    im = Image.new("RGB", (PX, int(H_EMU*S)), "white")
    d = ImageDraw.Draw(im)
    for sp in root.iter(P+"sp"):
        xf = sp.find(P+"spPr/"+A+"xfrm")
        if xf is None: continue
        o, e = xf.find(A+"off"), xf.find(A+"ext")
        x, y = int(o.get("x"))*S, int(o.get("y"))*S
        cx, cy = int(e.get("cx"))*S, int(e.get("cy"))*S
        spPr = sp.find(P+"spPr")
        isi = warna(spPr, "solidFill")
        ln = spPr.find(A+"ln")
        tepi = warna(ln, "solidFill") if ln is not None else None
        if isi or tepi:
            d.rectangle([x, y, x+cx, y+cy], fill=isi, outline=tepi, width=1)
        tx = sp.find(P+"txBody")
        if tx is not None:
            gambar_teks(d, tx, x, y, cx, cy)
    for gf in root.iter(P+"graphicFrame"):
        xf = gf.find(P+"xfrm"); o, e = xf.find(A+"off"), xf.find(A+"ext")
        x0, y = int(o.get("x"))*S, int(o.get("y"))*S
        cx = int(e.get("cx"))*S
        tbl = gf.find(f"{A}graphic/{A}graphicData/{A}tbl")
        kol = [int(g.get("w"))*S for g in tbl.findall(A+"tblGrid/"+A+"gridCol")]
        skala = cx / sum(kol)
        kol = [k*skala for k in kol]
        for tr in tbl.findall(A+"tr"):
            h = int(tr.get("h"))*S
            x = x0
            for j, tc in enumerate(tr.findall(A+"tc")):
                tcPr = tc.find(A+"tcPr")
                d.rectangle([x, y, x+kol[j], y+h],
                            fill=warna(tcPr, "solidFill"), outline="#DCE3E8")
                gambar_teks(d, tc.find(A+"txBody"), x+8, y+6, kol[j]-16, h-12)
                x += kol[j]
            y += h
    im.save(keluar)

z = zipfile.ZipFile(sys.argv[1])
n = len([x for x in z.namelist() if re.fullmatch(r"ppt/slides/slide\d+\.xml", x)])
for i in range(1, n+1):
    render(z, i, f"{sys.argv[2]}/slide{i:02d}.png")
print(f"{n} slide dirender")
