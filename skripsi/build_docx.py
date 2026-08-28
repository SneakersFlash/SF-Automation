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

NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
RE_LIST = re.compile(r"^([a-z])\.\s+(.*)$")
RE_BOLDMARK = re.compile(r"(\[[^\]]+\])")


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def runs(text, bold=False, size=SZ_BODY):
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
            props = f'<w:rFonts w:ascii="{FONT}" w:hAnsi="{FONT}" w:cs="{FONT}"/>'
            if b:
                props += "<w:b/>"
            if italic:
                props += "<w:i/>"
            props += f'<w:sz w:val="{size}"/><w:szCs w:val="{size}"/>'
            out.append(f'<w:r><w:rPr>{props}</w:rPr>'
                       f'<w:t xml:space="preserve">{esc(piece)}</w:t></w:r>')
    return "".join(out)


def para(text, *, jc="both", bold=False, size=SZ_BODY,
         first_line=0, left=0, hanging=0):
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
    return (f'<w:p><w:pPr><w:jc w:val="{jc}"/>'
            f'<w:spacing w:before="0" w:after="0" w:line="{LINE}" w:lineRule="auto"/>'
            f'{ind}</w:pPr>{runs(text, bold=bold, size=size)}</w:p>')


def parse(md):
    body, prev = [], None
    for raw in md.splitlines():
        line = raw.strip()
        if not line:
            continue

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

    return "".join(body)


def build(md_path, out_path):
    md = open(md_path, encoding="utf-8").read()
    body = parse(md)

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
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    out = None
    if "-o" in sys.argv:
        i = sys.argv.index("-o")
        if i + 1 >= len(sys.argv):
            sys.exit("ERROR: -o butuh nama berkas keluaran")
        out = sys.argv[i + 1]
        args = [a for a in args if a != out]
    if len(args) != 1:
        sys.exit("Pemakaian: python3 build_docx.py <sumber.md> [-o keluaran.docx]")

    src = args[0]
    out = out or src.rsplit(".", 1)[0] + ".docx"
    build(src, out)
    print(f"OK  {src} -> {out}")


if __name__ == "__main__":
    main()
