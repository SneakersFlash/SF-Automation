#!/usr/bin/env python3
"""
Rakit .docx dari sumber Markdown sesuai Panduan Proposal Skripsi
Prodi Sistem Informasi S-1, Universitas Pamulang, Ver. 3.0 (2024).

Tanpa dependensi luar — .docx dirakit langsung sebagai arsip ZIP berisi
OOXML, karena pandoc/libreoffice/python-docx tidak tersedia di mesin ini.

Format yang diterapkan (semuanya dari pedoman):
  kertas A4; margin kiri 4 cm, atas/kanan/bawah 3 cm
  isi Times New Roman 12, rata kiri-kanan, spasi 1,5, before/after 0 pt
  judul bab Times New Roman 14, kapital, bold, rata tengah
  awal alinea menjorok 1 cm
  kata asing dicetak miring

Subset Markdown yang dikenali:
  # BAB I PENDAHULUAN     -> judul bab, dipecah dua baris
  ## 1.1 Latar Belakang   -> judul sub-bab
  ### 2.2.1. Judul        -> judul sub-sub-bab
  | a | b |               -> tabel (baris pertama jadi kepala tabel)
  |: 2100 1459 1459       -> lebar kolom (twips) untuk tabel berikutnya
  a. teks                 -> butir daftar (huruf kecil, sesuai pedoman)
  *teks*                  -> cetak miring
  [TEKS DALAM KURUNG]     -> ditebalkan agar mudah dicari saat penyuntingan
  baris lain              -> paragraf isi

Pemakaian:
    python3 build_docx.py bab-1-pendahuluan.md
    python3 build_docx.py bab-1-pendahuluan.md -o keluaran.docx
"""

import re
import sys
import zipfile

CM = 566.929                    # 1 cm dalam twips
A4_W, A4_H = 11906, 16838
MAR = {"left": round(4 * CM), "top": round(3 * CM),
       "right": round(3 * CM), "bottom": round(3 * CM)}
INDENT = round(1 * CM)          # menjorok 1 cm
LIST_LEFT = round(2 * CM)
LINE = 360                      # spasi 1,5
SZ_BODY, SZ_BAB = 24, 28        # setengah-poin -> 12 pt dan 14 pt
FONT = "Times New Roman"
LINE_TABEL = 240                # tabel pakai spasi 1 (pedoman mengecualikan tabel)
KOLOM = [1417, 2268, 1417, 1701, 1134]   # lebar kolom default, total 14 cm

NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
RE_LIST = re.compile(r"^([a-z])\.\s+(.*)$")
RE_BOLDMARK = re.compile(r"(\[[^\]]+\])")


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def runs(text, bold=False, size=SZ_BODY, font=None):
    """Ubah teks jadi run OOXML; *...* jadi miring, [...] jadi tebal."""
    out = []
    for i, chunk in enumerate(text.split("*")):
        if not chunk:
            continue
        italic = i % 2 == 1
        for piece in RE_BOLDMARK.split(chunk):
            if not piece:
                continue
            b = bold or piece.startswith("[")
            f = font or FONT
            props = f'<w:rFonts w:ascii="{f}" w:hAnsi="{f}" w:cs="{f}"/>'
            if b:
                props += "<w:b/>"
            if italic:
                props += "<w:i/>"
            props += f'<w:sz w:val="{size}"/><w:szCs w:val="{size}"/>'
            out.append(f'<w:r><w:rPr>{props}</w:rPr>'
                       f'<w:t xml:space="preserve">{esc(piece)}</w:t></w:r>')
    return "".join(out)


def para(text, *, jc="both", bold=False, size=SZ_BODY,
         first_line=0, left=0, hanging=0, font=None, line=None, leader=False):
    ind = ""
    if left or first_line or hanging:
        bits = []
        if left:
            bits.append(f'w:left="{left}"')
        if hanging:
            bits.append(f'w:hanging="{hanging}"')
        elif first_line:
            bits.append(f'w:firstLine="{first_line}"')
        ind = f'<w:ind {" ".join(bits)}/>'
    tabs = ('<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="7937"/></w:tabs>'
            if leader else '')
    ekor = '<w:r><w:tab/></w:r>' if leader else ''
    return (f'<w:p><w:pPr>{tabs}<w:jc w:val="{jc}"/>'
            f'<w:spacing w:before="0" w:after="0" w:line="{line or LINE}" '
            f'w:lineRule="auto"/>'
            f'{ind}</w:pPr>{runs(text, bold=bold, size=size, font=font)}{ekor}</w:p>')


def sel(text, *, header=False, width=1417):
    shd = '<w:shd w:val="clear" w:fill="EDEDED"/>' if header else ""
    pr = f'<w:tcPr><w:tcW w:w="{width}" w:type="dxa"/>{shd}</w:tcPr>'
    p = (f'<w:p><w:pPr><w:jc w:val="left"/>'
         f'<w:spacing w:before="0" w:after="0" w:line="{LINE_TABEL}" '
         f'w:lineRule="auto"/></w:pPr>{runs(text, bold=header)}</w:p>')
    return f"<w:tc>{pr}{p}</w:tc>"


def tabel(rows, lebar_khusus=None):
    """rows: list of list[str]; baris pertama = kepala tabel."""
    n = max(len(r) for r in rows)
    if lebar_khusus and len(lebar_khusus) == n:
        lebar = list(lebar_khusus)
    elif n == len(KOLOM):
        lebar = list(KOLOM)                       # bentuk Tabel 2.1
    else:
        # tabel "label + data": kolom pertama 30%, sisanya dibagi rata
        satu = round(7937 * 0.30)
        lebar = [satu] + [(7937 - satu) // (n - 1)] * (n - 1) if n > 1 else [7937]
    borders = ("<w:tblBorders>" + "".join(
        f'<w:{sisi} w:val="single" w:sz="4" w:color="000000"/>'
        for sisi in ("top", "left", "bottom", "right", "insideH", "insideV")
    ) + "</w:tblBorders>")
    pr = (f'<w:tblPr><w:tblW w:w="{sum(lebar)}" w:type="dxa"/>{borders}</w:tblPr>')
    out = [pr]
    for i, row in enumerate(rows):
        cells = "".join(sel(row[j] if j < len(row) else "",
                            header=(i == 0), width=lebar[j]) for j in range(n))
        head = '<w:trPr><w:tblHeader/></w:trPr>' if i == 0 else ""
        out.append(f"<w:tr>{head}{cells}</w:tr>")
    return "<w:tbl>" + "".join(out) + "</w:tbl>"


HANGING = 720                   # 0,5 inci, indensi gantung gaya APA


def ganti_halaman():
    return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'


def baca_entri_pustaka(path):
    """Gabungkan baris bersambung jadi satu entri (baris lanjutan menjorok)."""
    entri = []
    for baris in open(path, encoding="utf-8").read().splitlines():
        if not baris.strip() or baris.strip().upper() in ("DAFTAR PUSTAKA", "REFERENSI"):
            continue
        if baris[:1].isspace() and entri:
            entri[-1] += " " + baris.strip()
        else:
            entri.append(baris.strip())
    return [re.sub(r"\s+", " ", e) for e in entri]


def blok_pustaka(path):
    out = [para("DAFTAR PUSTAKA", jc="center", bold=True, size=SZ_BAB),
           para("", jc="both")]
    for e in baca_entri_pustaka(path):
        # Pedoman menuntut rata kiri-kanan dan tidak mengecualikan daftar pustaka.
        out.append(para(e, jc="both", left=HANGING, hanging=HANGING))
    return "".join(out)


TAHOMA = "Tahoma"
LINE_SATU = 240                 # spasi 1 untuk isi daftar


def halaman_judul(judul, nama, nim, tahun):
    """Susunan dan ukuran huruf mengikuti Contoh 3 pedoman (font Tahoma)."""
    T = lambda t, sz: para(t, jc="center", bold=True, size=sz, font=TAHOMA)
    kosong = para("", jc="center")
    return "".join([
        T(judul.upper(), 40),                       # Tahoma 20
        kosong,
        T("PROPOSAL SKRIPSI", 28),                  # Tahoma 14
        kosong, kosong,
        para("[ SISIPKAN LOGO UNIVERSITAS PAMULANG DI SINI — UKURAN 4 cm x 4 cm ]",
             jc="center", bold=True, size=24, font=TAHOMA),
        kosong, kosong,
        T("Oleh :", 24),                            # Tahoma 12
        T(nama, 24),
        T(nim, 24),
        kosong, kosong,
        T("PROGRAM STUDI SISTEM INFORMASI", 32),    # Tahoma 16
        T("FAKULTAS ILMU KOMPUTER", 36),            # Tahoma 18
        T("UNIVERSITAS PAMULANG", 40),              # Tahoma 20
        T(str(tahun), 28),                          # Tahoma 14
    ])


def daftar(judul, entri):
    """Judul TNR 14 bold, jarak 2 x 1,5 spasi, isi spasi 1 dengan titik penuntun."""
    out = [para(judul, jc="center", bold=True, size=SZ_BAB),
           para("", jc="both"), para("", jc="both")]
    for teks, menjorok in entri:
        out.append(para(teks, jc="left", left=(INDENT if menjorok else 0),
                        line=LINE_SATU, leader=True))
    return "".join(out)


def kumpulkan_entri(md_paths):
    """Turunkan entri Daftar Isi dari judul bab dan sub-bab pada naskah."""
    entri = []
    for m in md_paths:
        for baris in open(m, encoding="utf-8").read().splitlines():
            b = baris.strip()
            if b.startswith("# "):
                entri.append((b[2:].strip(), False))
            elif b.startswith("## "):
                entri.append((b[3:].strip(), True))
    return entri


def kumpulkan_label(md_paths, awalan):
    """Kumpulkan rujukan 'Gambar N.N' / 'Tabel N.N' sesuai urutan kemunculan."""
    pola = re.compile(rf"\b{awalan} (\d+\.\d+)\b")
    urut = []
    for m in md_paths:
        for nomor in pola.findall(open(m, encoding="utf-8").read()):
            if nomor not in urut:
                urut.append(nomor)
    return sorted(urut, key=lambda x: [int(v) for v in x.split(".")])


def parse(md):
    body, prev, buf, lebar_next = [], None, [], []

    def flush():
        """Keluarkan tabel yang tertampung; buang baris pemisah |---|."""
        if not buf:
            return
        rows = [r for r in buf
                if not all(set(c) <= set("-: ") for c in r)]
        if rows:
            body.append(tabel(rows, lebar_next or None))
            body.append(para("", jc="both"))
        buf.clear()
        lebar_next.clear()

    for raw in md.splitlines():
        line = raw.strip()
        if not line:
            flush()
            continue
        if not line.startswith("|"):
            flush()

        if line.startswith("# "):
            judul = line[2:].strip()
            bagian = judul.split(" ", 2)
            kepala = " ".join(bagian[:2])                 # "BAB I"
            ekor = bagian[2] if len(bagian) > 2 else ""   # "PENDAHULUAN"
            body.append(para(kepala, jc="center", bold=True, size=SZ_BAB))
            if ekor:
                body.append(para(ekor, jc="center", bold=True, size=SZ_BAB))
            # jarak akhir judul bab ke teks = 2 x 1,5 spasi
            body.append(para("", jc="both"))
            prev = "bab"
            continue

        if line.startswith("### "):
            body.append(para("", jc="both"))
            body.append(para(line[4:].strip(), jc="left", bold=True))
            prev = "subsubbab"
            continue

        if line.startswith("|:"):
            lebar_next[:] = [int(x) for x in line[2:].replace(",", " ").split()]
            prev = "lebar"
            continue

        if line.startswith("|"):
            buf.append([c.strip() for c in line.strip("|").split("|")])
            prev = "tabel"
            continue

        if line.startswith("## "):
            body.append(para("", jc="both"))             # jarak sebelum sub-judul
            body.append(para(line[3:].strip(), jc="left", bold=True))
            prev = "subbab"
            continue

        m = RE_LIST.match(line)
        if m:
            body.append(para(f"{m.group(1)}. {m.group(2)}", jc="both",
                             left=LIST_LEFT, hanging=INDENT))
            prev = "list"
            continue

        # Paragraf tepat setelah butir daftar disejajarkan dengan butirnya.
        if prev == "list":
            body.append(para(line, jc="both", left=LIST_LEFT))
        else:
            body.append(para(line, jc="both", first_line=INDENT))
        prev = "para"

    flush()
    return "".join(body)


def baca_label(path):
    """Baca berkas keterangan gambar/tabel -> ({nomor: judul}, {nomor: judul})."""
    gambar, tabel, mode = {}, {}, None
    for baris in open(path, encoding="utf-8").read().splitlines():
        b = baris.strip()
        if not b or b.startswith("#"):
            continue
        if b.upper() == "GAMBAR":
            mode = gambar; continue
        if b.upper() == "TABEL":
            mode = tabel; continue
        if mode is not None and "|" in b:
            nomor, judul = b.split("|", 1)
            mode[nomor.strip()] = judul.strip()
    return gambar, tabel


def build(md_paths, out_path, pustaka=None, awal=None, label=None):
    bagian = []
    if awal:
        judul, nama, nim, tahun = awal
        bagian.append(halaman_judul(judul, nama, nim, tahun))

        isi = [("HALAMAN JUDUL", False), ("DAFTAR ISI", False),
               ("DAFTAR GAMBAR", False), ("DAFTAR TABEL", False)]
        isi += kumpulkan_entri(md_paths)
        if pustaka:
            isi.append(("DAFTAR PUSTAKA", False))
        bagian.append(daftar("DAFTAR ISI", isi))

        ket_g, ket_t = baca_label(label) if label else ({}, {})
        for nama_daftar, awalan, ket in (("DAFTAR GAMBAR", "Gambar", ket_g),
                                         ("DAFTAR TABEL", "Tabel", ket_t)):
            nomor = kumpulkan_label(md_paths, awalan)
            entri = [(f"{awalan} {n}  {ket.get(n, '')}".rstrip(), False) for n in nomor]
            bagian.append(daftar(nama_daftar, entri))

    bagian += [parse(open(m, encoding="utf-8").read()) for m in md_paths]
    if pustaka:
        bagian.append(blok_pustaka(pustaka))
    body = ganti_halaman().join(bagian)

    sect = (f'<w:sectPr><w:pgSz w:w="{A4_W}" w:h="{A4_H}"/>'
            f'<w:pgMar w:top="{MAR["top"]}" w:right="{MAR["right"]}" '
            f'w:bottom="{MAR["bottom"]}" w:left="{MAR["left"]}" '
            f'w:header="850" w:footer="850" w:gutter="0"/></w:sectPr>')

    document = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                f'<w:document {NS}><w:body>{body}{sect}</w:body></w:document>')

    styles = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
              f'<w:styles {NS}><w:docDefaults><w:rPrDefault><w:rPr>'
              f'<w:rFonts w:ascii="{FONT}" w:hAnsi="{FONT}" w:cs="{FONT}"/>'
              f'<w:sz w:val="{SZ_BODY}"/><w:szCs w:val="{SZ_BODY}"/>'
              f'<w:lang w:val="id-ID"/></w:rPr></w:rPrDefault>'
              f'<w:pPrDefault><w:pPr><w:jc w:val="both"/>'
              f'<w:spacing w:before="0" w:after="0" w:line="{LINE}" '
              f'w:lineRule="auto"/></w:pPr></w:pPrDefault>'
              f'</w:docDefaults></w:styles>')

    content_types = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-'
        'officedocument.wordprocessingml.document.main+xml"/>'
        '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-'
        'officedocument.wordprocessingml.styles+xml"/></Types>')

    rels = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/'
            '2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>')

    doc_rels = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/'
                '2006/relationships/styles" Target="styles.xml"/></Relationships>')

    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types)
        z.writestr("_rels/.rels", rels)
        z.writestr("word/document.xml", document)
        z.writestr("word/_rels/document.xml.rels", doc_rels)
        z.writestr("word/styles.xml", styles)

    return out_path


def main():
    argv = sys.argv[1:]
    out = pustaka = label = None
    nama = nim = tahun = judul = None
    src, i = [], 0
    opsi = {"-o", "--pustaka", "--label", "--nama", "--nim", "--tahun", "--judul"}
    while i < len(argv):
        a = argv[i]
        if a in opsi:
            if i + 1 >= len(argv):
                sys.exit(f"ERROR: {a} butuh nilai")
            nilai = argv[i + 1]
            if a == "-o": out = nilai
            elif a == "--pustaka": pustaka = nilai
            elif a == "--label": label = nilai
            elif a == "--nama": nama = nilai
            elif a == "--nim": nim = nilai
            elif a == "--tahun": tahun = nilai
            else: judul = nilai
            i += 2
            continue
        if a.startswith("-"):
            sys.exit(f"ERROR: opsi tidak dikenal: {a}")
        src.append(a)
        i += 1

    if not src:
        sys.exit("Pemakaian: python3 build_docx.py <sumber.md> [sumber2.md ...] "
                 "[--pustaka daftar-pustaka.md] [--label daftar-gambar-tabel.md] "
                 "[--judul \"...\" --nama \"...\" --nim ... --tahun ...] "
                 "[-o keluaran.docx]")

    awal = None
    if nama or nim or judul:
        kurang = [k for k, v in (("--judul", judul), ("--nama", nama),
                                 ("--nim", nim), ("--tahun", tahun)) if not v]
        if kurang:
            sys.exit("ERROR: bagian awal butuh " + ", ".join(kurang))
        awal = (judul, nama, nim, tahun)

    out = out or src[0].rsplit(".", 1)[0] + ".docx"
    build(src, out, pustaka, awal, label)
    ket = " + bagian awal" if awal else ""
    ket += f" + {pustaka}" if pustaka else ""
    print(f"OK  {' + '.join(src)}{ket} -> {out}")


if __name__ == "__main__":
    main()
