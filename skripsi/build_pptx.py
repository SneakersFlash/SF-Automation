#!/usr/bin/env python3
"""Perakit slide sidang proposal skripsi.

Mesin ini tidak punya python-pptx, jadi berkas .pptx dirakit langsung sebagai
arsip ZIP berisi OOXML — cara yang sama dipakai build_docx.py.

    python3 build_pptx.py -o sidang-proposal.pptx

Isi slide ditulis pada SLIDE di bawah. Sunting di situ, lalu rakit ulang.
"""

import re
import sys
import zipfile

# ---------------------------------------------------------------- ukuran
EMU = 914400                      # 1 inci
W, H = 12192000, 6858000          # layar 16:9
TEPI = 838200                     # margin kiri/kanan
LEBAR = W - 2 * TEPI
Y_JUDUL = 480060
Y_GARIS = 1170940
Y_ISI = 1508760
Y_KAKI = 6217920

# ---------------------------------------------------------------- warna
NAVY = "12324F"
JINGGA = "E4572E"
TEKS = "233642"
REDUP = "6B7A85"
GARIS = "DCE3E8"
LEMBUT = "F2F5F7"
PUTIH = "FFFFFF"

HURUF = "Calibri"

NS = ('xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
      'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"')


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def runs(teks, sz, warna, tebal=False, spasi=0):
    """Pecah *miring* menjadi run tersendiri, seperti pada naskah."""
    out = []
    for i, potongan in enumerate(teks.split("*")):
        if not potongan:
            continue
        miring = ' i="1"' if i % 2 else ""
        b = ' b="1"' if tebal else ""
        sp = f' spc="{spasi}"' if spasi else ""
        out.append(
            f'<a:r><a:rPr lang="id-ID" sz="{sz}"{b}{miring}{sp} dirty="0">'
            f'<a:solidFill><a:srgbClr val="{warna}"/></a:solidFill>'
            f'<a:latin typeface="{HURUF}"/><a:cs typeface="{HURUF}"/></a:rPr>'
            f'<a:t>{esc(potongan)}</a:t></a:r>')
    return "".join(out) or '<a:endParaRPr lang="id-ID"/>'


def par(teks, jenis="b", sz=1800, warna=TEKS, jarak=600, tebal=False,
        algn="l", spasi=0):
    """Satu paragraf. jenis: b bulat, a huruf urut, t polos, s anak, h kepala."""
    marL, indent, peluru = 0, 0, "<a:buNone/>"
    if jenis == "b":
        marL, indent = 285750, -285750
        peluru = (f'<a:buClr><a:srgbClr val="{JINGGA}"/></a:buClr>'
                  '<a:buFont typeface="Arial"/><a:buChar char="&#8226;"/>')
    elif jenis == "a":
        marL, indent = 342900, -342900
        peluru = (f'<a:buClr><a:srgbClr val="{JINGGA}"/></a:buClr>'
                  f'<a:buFont typeface="{HURUF}"/>'
                  '<a:buAutoNum type="alphaLcPeriod"/>')
    elif jenis == "s":
        marL, indent = 628650, -228600
        warna = REDUP if warna == TEKS else warna
        peluru = (f'<a:buClr><a:srgbClr val="{REDUP}"/></a:buClr>'
                  '<a:buFont typeface="Arial"/><a:buChar char="&#8211;"/>')
    elif jenis == "h":
        tebal, warna = True, NAVY
    return (f'<a:p><a:pPr marL="{marL}" indent="{indent}" algn="{algn}">'
            f'<a:lnSpc><a:spcPct val="102000"/></a:lnSpc>'
            f'<a:spcBef><a:spcPts val="{jarak}"/></a:spcBef>{peluru}</a:pPr>'
            f'{runs(teks, sz, warna, tebal, spasi)}</a:p>')


class Kanvas:
    """Kumpulan bentuk pada satu slide; menjaga nomor bentuk tetap unik."""

    def __init__(self):
        self.bentuk = []
        self.n = 1

    def _id(self, nama):
        self.n += 1
        return f'<p:cNvPr id="{self.n}" name="{nama} {self.n}"/>'

    def kotak(self, x, y, cx, cy, isi, anchor="t", tengah=False):
        ctr = ' anchorCtr="1"' if tengah else ""
        self.bentuk.append(
            f'<p:sp><p:nvSpPr>{self._id("Teks")}'
            f'<p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr>'
            f'<a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>'
            f'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr>'
            f'<p:txBody><a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" '
            f'anchor="{anchor}"{ctr}>'
            f'<a:normAutofit/></a:bodyPr><a:lstStyle/>{isi}</p:txBody></p:sp>')

    def blok(self, x, y, cx, cy, warna, garis=None, tebal=12700):
        ln = (f'<a:ln w="{tebal}"><a:solidFill><a:srgbClr val="{garis}"/>'
              f'</a:solidFill><a:prstDash val="dash"/></a:ln>'
              if garis else '<a:ln><a:noFill/></a:ln>')
        isi = (f'<a:solidFill><a:srgbClr val="{warna}"/></a:solidFill>'
               if warna else '<a:noFill/>')
        self.bentuk.append(
            f'<p:sp><p:nvSpPr>{self._id("Bidang")}'
            f'<p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr>'
            f'<a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>'
            f'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>{isi}{ln}</p:spPr>'
            f'<p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody></p:sp>')

    def tabel(self, x, y, cx, lebar, kepala, baris, sz=1200):
        skala = cx / sum(lebar)
        kolom = "".join(f'<a:gridCol w="{int(w * skala)}"/>' for w in lebar)

        def sel(teks, tinggi_kepala, akhir):
            warna = PUTIH if tinggi_kepala else TEKS
            isi = (f'<a:p><a:pPr algn="l"><a:lnSpc><a:spcPct val="100000"/></a:lnSpc>'
                   f'<a:buNone/></a:pPr>'
                   f'{runs(teks, sz, warna, tebal=tinggi_kepala)}</a:p>')
            latar = NAVY if tinggi_kepala else (LEMBUT if akhir else PUTIH)
            return (f'<a:tc><a:txBody><a:bodyPr/><a:lstStyle/>{isi}</a:txBody>'
                    f'<a:tcPr marL="91440" marR="91440" marT="54000" marB="54000" '
                    f'anchor="ctr">'
                    f'<a:lnB w="12700"><a:solidFill><a:srgbClr val="{GARIS}"/>'
                    f'</a:solidFill></a:lnB>'
                    f'<a:solidFill><a:srgbClr val="{latar}"/></a:solidFill>'
                    f'</a:tcPr></a:tc>')

        baris_xml = ['<a:tr h="320040">'
                     + "".join(sel(t, True, False) for t in kepala) + "</a:tr>"]
        for i, r in enumerate(baris):
            baris_xml.append('<a:tr h="288000">'
                             + "".join(sel(t, False, i % 2 == 1) for t in r)
                             + "</a:tr>")
        self.n += 1
        self.bentuk.append(
            f'<p:graphicFrame><p:nvGraphicFramePr>'
            f'<p:cNvPr id="{self.n}" name="Tabel {self.n}"/>'
            f'<p:cNvGraphicFramePr><a:graphicFrameLocks noGrp="1"/>'
            f'</p:cNvGraphicFramePr><p:nvPr/></p:nvGraphicFramePr>'
            f'<p:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{cx}" cy="320040"/></p:xfrm>'
            f'<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/'
            f'drawingml/2006/table"><a:tbl><a:tblPr firstRow="1"/>'
            f'<a:tblGrid>{kolom}</a:tblGrid>{"".join(baris_xml)}'
            f'</a:tbl></a:graphicData></a:graphic></p:graphicFrame>')

    def xml(self):
        return (f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                f'<p:sld {NS}><p:cSld><p:spTree>'
                f'<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/>'
                f'</p:nvGrpSpPr><p:grpSpPr><a:xfrm>'
                f'<a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
                f'<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
                f'{"".join(self.bentuk)}</p:spTree></p:cSld>'
                f'<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>')


# ---------------------------------------------------------------- kerangka slide
def kepala(k, judul, sub=None):
    k.kotak(TEPI, Y_JUDUL, LEBAR, 640080,
            par(judul, "t", 2600, NAVY, 0, tebal=True))
    k.blok(TEPI, Y_GARIS, 640080, 41148, JINGGA)
    if sub:
        k.kotak(TEPI + 777240, Y_GARIS - 60000, LEBAR - 777240, 300000,
                par(sub, "t", 1200, REDUP, 0, spasi=120))


def kaki(k, nomor, total):
    if nomor == 1:
        return
    k.blok(TEPI, Y_KAKI, LEBAR, 9525, GARIS)
    k.kotak(TEPI, Y_KAKI + 91440, LEBAR - 800000, 260000,
            par("Sidang Proposal Skripsi · Muhammad Faizal Triasa · 231011701215",
                "t", 1000, REDUP, 0))
    k.kotak(W - TEPI - 800000, Y_KAKI + 91440, 800000, 260000,
            par(f"{nomor} / {total}", "t", 1000, REDUP, 0, algn="r"))


def sorot(k, y, teks, sz=1500):
    k.blok(TEPI, y, LEBAR, 548640, LEMBUT)
    k.blok(TEPI, y, 41148, 548640, JINGGA)
    k.kotak(TEPI + 205740, y, LEBAR - 411480, 548640,
            par(teks, "t", sz, NAVY, 0, tebal=True), anchor="ctr")
    return y + 731520


def gambar_kosong(k, x, y, cx, cy, keterangan):
    k.blok(x, y, cx, cy, LEMBUT, garis=REDUP)
    k.kotak(x + 137160, y, cx - 274320, cy,
            par("[ sisipkan " + keterangan + " ]", "t", 1300, REDUP, 0,
                algn="ctr"), anchor="ctr")


def kartu(k, x, y, cx, cy, judul, baris, sz=1300):
    """Kotak lembut berpita jingga di kiri: satu gagasan per kartu."""
    k.blok(x, y, cx, cy, LEMBUT)
    k.blok(x, y, 41148, cy, JINGGA)
    isi = par(judul, "t", sz + 100, NAVY, 0, tebal=True)
    isi += "".join(par(b, "t", sz, TEKS, 260) for b in baris)
    k.kotak(x + 228600, y + 182880, cx - 411480, cy - 365760, isi)


def lencana(k, x, y, sisi, teks):
    k.blok(x, y, sisi, sisi, NAVY)
    k.kotak(x, y, sisi, sisi, par(teks, "t", 1400, PUTIH, 0, tebal=True,
                                  algn="ctr"), anchor="ctr")


def slide_kartu(s, k):
    n = len(s["kartu"])
    sela = 274320
    cx = (LEBAR - sela * (n - 1)) // n
    cy = s.get("tinggi", 2560320)
    for i, (judul, baris) in enumerate(s["kartu"]):
        kartu(k, TEPI + i * (cx + sela), Y_ISI, cx, cy, judul, baris,
              s.get("sz", 1300))
    if s.get("kaki"):
        k.kotak(TEPI, Y_ISI + cy + 320040, LEBAR, 900000,
                "".join(par(t, j, s.get("sz_kaki", 1400)) for j, t in s["kaki"]))


def slide_alur(s, k):
    n = len(s["langkah"])
    sela = 228600
    cx = (LEBAR - sela * (n - 1)) // n
    cy = 2194560
    y = Y_ISI + 274320
    for i, (judul, baris) in enumerate(s["langkah"]):
        x = TEPI + i * (cx + sela)
        k.blok(x, y, cx, cy, LEMBUT)
        lencana(k, x, y - 228600, 457200, str(i + 1))
        isi = par(judul, "t", 1300, NAVY, 0, tebal=True)
        isi += "".join(par(b, "t", 1150, TEKS, 220) for b in baris)
        k.kotak(x + 182880, y + 320040, cx - 365760, cy - 502920, isi)
        if i < n - 1:
            k.kotak(x + cx, y + cy // 2 - 228600, sela, 457200,
                    par("\u203a", "t", 1800, JINGGA, 0, tebal=True, algn="ctr"))
    if s.get("kaki"):
        y_kaki = y + cy + 365760
        k.kotak(TEPI, y_kaki, LEBAR, Y_KAKI - y_kaki - 137160,
                "".join(par(t, j, 1400) for j, t in s["kaki"]))


def slide_angka(s, k):
    n = len(s["angka"])
    sela = 274320
    cx = (LEBAR - sela * (n - 1)) // n
    cy = 1737360
    for i, (nilai, label) in enumerate(s["angka"]):
        x = TEPI + i * (cx + sela)
        k.blok(x, Y_ISI, cx, cy, LEMBUT)
        k.blok(x, Y_ISI, cx, 41148, JINGGA)
        k.kotak(x + 137160, Y_ISI + 320040, cx - 274320, 640080,
                par(nilai, "t", 3000, NAVY, 0, tebal=True, algn="ctr"))
        k.kotak(x + 137160, Y_ISI + 1051560, cx - 274320, 548640,
                par(label, "t", 1250, REDUP, 0, algn="ctr"))
    if s.get("kaki"):
        k.kotak(TEPI, Y_ISI + cy + 457200, LEBAR, 1500000,
                "".join(par(t, j, s.get("sz", 1600)) for j, t in s["kaki"]))


def slide_cip(s, k):
    """Deretan label pendek — untuk daftar topik yang tidak perlu kalimat."""
    y = Y_ISI
    for kepala_baris, daftar in s["cip"]:
        k.kotak(TEPI, y, LEBAR, 300000,
                par(kepala_baris, "t", 1300, JINGGA, 0, tebal=True, spasi=100))
        y += 411480
        x = TEPI
        for label in daftar:
            lebar = int(len(label.replace("*", "")) * 105000) + 320040
            if x + lebar > TEPI + LEBAR:
                x = TEPI
                y += 548640
            k.blok(x, y, lebar, 411480, LEMBUT)
            k.kotak(x + 137160, y, lebar - 274320, 411480,
                    par(label, "t", 1300, NAVY, 0, algn="ctr"), anchor="ctr")
            x += lebar + 137160
        y += 868680


# ---------------------------------------------------------------- isi slide
JUDUL = ("Perancangan Sistem Otomasi Produksi Konten Pemasaran "
         "Berbasis *Multi-Agent* AI untuk Meningkatkan Efisiensi "
         "dan Konsistensi *Brand Voice*")

SLIDE = [
    {"tipe": "judul"},

    {"tipe": "angka", "judul": "Masalah di SneakersFlash",
     "sub": "BAB I · 1.1 dan 1.2",
     "angka": [
        ("1–3 jam", "penyiapan satu materi konten"),
        ("12 jam", "kasus ekstrem yang pernah terjadi"),
        ("5 materi", "kebutuhan penerbitan per hari"),
        ("5–15 jam", "beban kerja harian yang timbul"),
     ],
     "sz": 1600,
     "kaki": [
        ("b", "*Lama* — melampaui jam kerja tersedia, dan rentangnya lebar "
              "sehingga jadwal peluncuran sulit disusun."),
        ("b", "*Tidak seragam* — gaya bahasa berbeda antar admin; standar merek "
              "hanya kesepakatan lisan."),
        ("b", "*Generik dan tak tercatat* — perintah ke AI tanpa konteks merek, "
              "dan keluarannya tidak dapat ditelusuri kembali."),
     ],
     "catatan": [
        "Angka ini estimasi retrospektif dari praktik kerja tim, bukan catatan waktu",
        "yang terekam sistem. Keterbatasan itu dinyatakan pada batasan 1.4 butir g,",
        "dan itulah sebabnya analisisnya deskriptif, bukan uji statistik.",
        "",
        "Rentang 1-3 jam adalah kondisi normal; 12 jam terjadi pada materi yang",
        "butuh riset produk dan beberapa kali revisi.",
        "",
        "Persoalan kelima yang tidak muat di slide: standar merek yang berlaku belum",
        "dapat dipakai ulang untuk merek lain. Ini yang dijawab profil merek",
        "terstruktur sebagai data, bukan sebagai kode.",
     ]},

    {"tipe": "kolom", "judul": "Pertanyaan Penelitian dan Celah Riset",
     "sub": "BAB I · 1.3 · BAB II · 2.1", "sz": 1500,
     "kiri": ("Tiga pertanyaan", [
        ("a", "Bagaimana merancang sistemnya?"),
        ("a", "Bagaimana pengaruhnya terhadap efisiensi waktu?"),
        ("a", "Sejauh mana profil merek menjaga konsistensi *brand voice*?"),
     ]),
     "kanan": ("Belum ada yang memenuhi keempatnya sekaligus", [
        ("b", "Untuk proses kerja *nyata*, bukan simulasi;"),
        ("b", "*Multi-agent* dengan pembagian tugas per modul;"),
        ("b", "Profil merek terstruktur sebagai konteks;"),
        ("b", "Diukur dua sisi: waktu dan konsistensi."),
     ]),
     "catatan": [
        "20 penelitian terdahulu ditinjau: 10 naratif di 2.1, 10 pada Tabel 2.1.",
        "Tiga kelompok temuannya:",
        "",
        "1. Kajian multi-agent (Tran dkk. 2025, Lin dkk. 2025, Yan dkk. 2025) sudah",
        "   memetakan mekanisme kolaborasi, tetapi berhenti di tataran konsep.",
        "2. Penerapan pada pemasaran menempatkan agen di sisi konsumen (Chu dkk.",
        "   2025), bukan di sisi produksi materi. Wang dkk. (2025) menemukan model",
        "   kesulitan meniru gaya yang tidak dinyatakan eksplisit — inilah yang",
        "   dijawab profil merek terstruktur.",
        "3. Rancang bangun sistem informasi di Indonesia berhenti pada pengujian",
        "   kesesuaian fungsi; tidak satu pun menilai mutu materi yang dihasilkan.",
        "",
        "Kalau ditanya apa barunya: bukan salah satu dari keempat butir itu,",
        "melainkan gabungan keempatnya dalam konteks ritel berbahasa Indonesia.",
     ]},

    {"tipe": "kolom", "judul": "Batasan Masalah",
     "sub": "BAB I · 1.4", "sz": 1500,
     "kiri": ("Lingkup", [
        ("b", "Satu profil merek aktif."),
        ("b", "Status *prototipe*, masih diuji — belum operasional harian."),
        ("b", "Hanya modul produksi konten: ringkasan, naskah, penghalusan."),
        ("b", "Pendapatan dan performa media sosial di luar lingkup."),
     ]),
     "kanan": ("Pengukuran", [
        ("b", "Model bahasa = *kotak hitam*, tidak dievaluasi."),
        ("b", "Kontribusi arsitektur *multi-agent* tidak diisolasi."),
        ("b", "*Brand voice* dinilai manusia, bukan pendeteksi otomatis."),
        ("b", "Durasi lama berupa estimasi — pembandingan deskriptif."),
     ]),
     "catatan": [
        "Batasan yang paling mungkin ditanyakan: kenapa kontribusi multi-agent tidak",
        "diisolasi. Jawabannya, antarmuka terpusat dan arsitektur agen diterapkan",
        "bersamaan, jadi keduanya tidak dapat dipisahkan secara jujur. Dinyatakan",
        "terbuka, bukan disembunyikan.",
        "",
        "PENTING — generasi gambar (slide 10) TIDAK termasuk butir c. Kalau penguji",
        "menyorotinya, akui terus terang: itu bagian sistem yang dibangun tetapi",
        "berada di luar yang dinilai penelitian ini. Kalau pembimbing ingin ikut",
        "dinilai, batasan 1.4 butir c harus direvisi lebih dulu.",
     ]},

    {"tipe": "gambar", "judul": "Kerangka Berpikir",
     "sub": "BAB II · 2.3", "sz": 1600, "gambar": "Gambar 2.1",
     "isi": [
        ("b", "*Masalah* — waktu panjang, gaya tidak konsisten."),
        ("b", "*Tinjauan* — teori *multi-agent* dan konteks terstruktur."),
        ("b", "*Rancangan* — empat agen, profil merek, pencatatan."),
        ("b", "*Pengujian* — catat waktu dan rubrik secara buta."),
        ("b", "*Hasil* — waktu turun, konsistensi naik."),
     ],
     "catatan": [
        "Alurnya lurus dari masalah ke hasil yang diharapkan. Gambar 2.1 menyusul.",
        "",
        "Sembilan sub-bab landasan teori mendasarinya: produksi konten digital, AI",
        "generatif dan LLM, agen cerdas dan multi-agent, brand voice, otomasi alur",
        "kerja dan antrian, arsitektur web dan REST API, RAD, rubrik dan kesepakatan",
        "antar-penilai, serta UML dan ERD.",
     ]},

    {"tipe": "gambar", "judul": "Arsitektur Sistem",
     "sub": "BAB III · 3.1.3", "sz": 1550, "gambar": "Gambar 3.2",
     "isi": [
        ("b", "*Antarmuka web* — tidak pernah menyentuh gerbang agen "
              "maupun basis data."),
        ("b", "*Layanan backend* — satu-satunya pintu ke basis data "
              "dan seluruh layanan luar."),
        ("b", "*Gerbang agen* — menaungi empat agen dengan tugas berbeda."),
        ("h", "Sistem lama"),
        ("s", "Seluruhnya manual. AI sudah dipakai, tetapi lepas-lepas lewat "
              "antarmuka percakapan umum, tanpa acuan bersama dan tanpa "
              "pencatatan (Gambar 3.1)."),
     ],
     "catatan": [
        "Aturan satu pintu bukan gaya-gayaan: kunci rahasia hanya ada di peladen,",
        "dan setiap permintaan bisa dicatat karena semuanya lewat satu tempat.",
        "Tanpa itu, pencatatan tidak dapat dijamin lengkap.",
        "",
        "Yang perlu ditekankan soal sistem lama: AI sebenarnya SUDAH dipakai. Jadi",
        "penelitian ini bukan soal memperkenalkan AI, melainkan memberinya struktur",
        "dan konteks. Gambar 3.1 memuat activity diagram alur lama itu.",
     ]},

    {"tipe": "kartu", "judul": "Gerbang Agen — Satu Model, Empat Ruang Kerja",
     "sub": "BAB III · 3.1.3 · OpenClaw Gateway", "tinggi": 2377440,
     "kartu": [
        ("Penyusun ringkasan",
         ["Merumuskan sudut pandang",
          "dan arahan visual.",
          "Keluaran: konsep, prompt",
          "gambar, atau brief teks."]),
        ("Penulis naskah",
         ["Menyusun naskah unggahan:",
          "kalimat pembuka, isi,",
          "ajakan bertindak, tagar."]),
        ("Penghalus teks",
         ["Membuang nada robotik.",
          "Dipanggil sebagai",
          "tahap akhir."]),
        ("Penyusun iklan",
         ["Menghasilkan varian naskah",
          "iklan: kail, judul,",
          "dan teks utama."]),
     ],
     "kaki": [
        ("b", "Keempatnya memakai *model bahasa yang sama*. Yang membedakan adalah "
              "ruang kerjanya — tiap agen punya berkas aturan, pengetahuan merek, "
              "dan contoh naskah sendiri."),
        ("b", "Jadi pembagian tugas per modul berarti pembagian "
              "*instruksi dan pengetahuan*, bukan pembagian model."),
     ],
     "catatan": [
        "Nama teknisnya sf-content-brief, sf-copywriting, sf-humanize, dan sf-ads,",
        "berjalan di atas OpenClaw Gateway.",
        "",
        "Pertanyaan yang paling mungkin diajukan penguji: apa bedanya dengan sekadar",
        "memanggil ChatGPT empat kali?",
        "",
        "Bedanya, tiap agen punya kontrak tertulis yang tetap dan terversi (berkas",
        "SKILL.md). Perintah tidak disusun ulang tiap kali oleh admin, melainkan",
        "sudah tertanam sebagai berkas. Isinya dapat diperbaiki tanpa menyentuh kode",
        "backend, dan perbaikannya langsung berlaku pada panggilan berikutnya.",
        "",
        "Pemisahan per agen juga bukan sekadar kerapian: tiap agen hanya membaca",
        "aturan yang relevan dengan tugasnya, sehingga instruksinya bisa spesifik",
        "dan panjang tanpa saling mengganggu.",
        "",
        "Konsekuensi metodologis: yang diuji adalah rancangan pembagian tugas dan",
        "konteks, bukan model bahasanya — sesuai batasan 1.4 butir d.",
     ]},

    {"tipe": "alur", "judul": "Alur Satu Permintaan",
     "sub": "BAB III · 3.1.3",
     "langkah": [
        ("Antarmuka", ["Pengguna mengirim", "data produk."]),
        ("Ambil profil merek", ["Backend membaca profil", "merek dari basis data."]),
        ("Pemicu tipis", ["Nama tugas + data,", "tanpa perintah panjang."]),
        ("Agen menjawab", ["Agen membaca aturannya", "sendiri, lalu membalas", "dalam format baku."]),
        ("Haluskan dan catat", ["Nada dirapikan,", "seluruhnya dicatat."]),
     ],
     "kaki": [
        ("b", "Perintah panjangnya ada pada agen, bukan pada backend — "
              "sehingga dapat diperbaiki tanpa mengubah kode."),
        ("b", "Tiap panggilan memakai sesi baru: bersih dari riwayat, selalu "
              "membaca aturan terbaru, dan aman dijalankan bersamaan."),
     ],
     "catatan": [
        "Langkah 3 paling sering disalahpahami. Backend hanya mengirim kalimat",
        "pemicu singkat berisi nama skill dan data dalam bentuk JSON. Ia tidak",
        "memuat perintah kreatif sama sekali — itu Golden Rule sistem ini.",
        "",
        "Langkah 4: pemilihan agen dilakukan lewat penamaan model pada permintaan",
        "(model: openclaw/<agentId>). Nama yang salah ditolak gerbang, jadi tidak",
        "mungkin diam-diam salah agen.",
        "",
        "Kalau keluaran bukan JSON yang sah, permintaan diulang sekali. Masih gagal,",
        "pengguna menerima pesan yang dapat ditindaklanjuti — bukan jejak galat.",
        "Ini memenuhi kebutuhan non-fungsional keandalan pada 3.1.5.",
        "",
        "Tahap penghalusan bersifat guarded: kalau gerbang gagal, teks asli yang",
        "dipakai, permintaan utama tidak diblokir.",
        "",
        "Untuk proses gabungan (beberapa materi sekaligus), tugas dititipkan ke",
        "antrian di latar; pengguna menerima nomor tugas dan antarmuka tidak",
        "terkunci. Dua ringkasan digarap bersamaan karena tidak saling bergantung.",
     ]},

    {"tipe": "kartu", "judul": "Kunci: Kenapa Keluarannya Tidak Generik",
     "sub": "BAB III · 3.1.3 · pembeda penelitian", "tinggi": 2377440,
     "sz": 1350,
     "kartu": [
        ("Konteks dari basis data",
         ["Profil merek dibaca dari tabel,",
          "bukan ditulis di dalam kode.",
          "Gaya bahasa, audiens, keunggulan,",
          "batasan, ajakan, contoh naskah."]),
        ("Aturan anti-jiplak",
         ["Pengetahuan merek hanya boleh",
          "jadi rujukan latar.",
          "Faktanya boleh dipakai,",
          "kalimatnya tidak."]),
        ("Aturan anti-nada mesin",
         ["Klise dan kata korporat dilarang.",
          "Panjang kalimat wajib",
          "divariasikan."]),
     ],
     "kaki": [("t", "Kelima dimensi rubrik penilaian diturunkan dari bidang profil "
                    "merek yang sama — jadi yang dinilai memang yang dipakai.")],
     "catatan": [
        "Slide ini menjawab langsung temuan Wang dkk. (2025): model kesulitan meniru",
        "gaya yang tidak dinyatakan eksplisit. Di sini gaya dibuat eksplisit,",
        "terstruktur, dan tersimpan sebagai data — bukan tersirat dalam contoh.",
        "",
        "Karena profilnya data, ia dapat diubah pemilik merek lewat antarmuka tanpa",
        "menyentuh kode, dan dapat dipakai ulang untuk merek lain. Itu menjawab",
        "persoalan kelima pada identifikasi masalah.",
        "",
        "Aturan anti-jiplak penting dijelaskan: tanpa itu, sistem cenderung menyalin",
        "ulang contoh naskah, sehingga tampak konsisten tetapi tidak menghasilkan",
        "gagasan baru.",
     ]},

    {"tipe": "alur", "judul": "Dari Naskah ke Gambar",
     "sub": "BAB III · di luar lingkup penilaian",
     "langkah": [
        ("Arahan visual", ["Agen penyusun ringkasan", "menghasilkan prompt", "gambar dan rasio."]),
        ("Kirim tugas", ["Backend mengirimnya ke", "layanan gambar, menerima", "nomor tugas."]),
        ("Kabar balik", ["Layanan memanggil balik", "saat selesai; ada", "pemeriksa cadangan."]),
        ("Tersimpan", ["Gambar tertaut ke", "ringkasan yang", "menghasilkannya."]),
     ],
     "kaki": [
        ("b", "Rasio yang dihasilkan agen dipakai apa adanya — tidak perlu "
              "diterjemahkan, karena keduanya memakai daftar yang sama."),
        ("b", "*Di luar yang dinilai penelitian ini* (batasan 1.4 butir c). "
              "Ditampilkan sebagai bagian sistem, bukan bagian pengukuran."),
     ],
     "catatan": [
        "Layanan gambarnya kie.ai, model nano-banana-2, lewat Jobs API.",
        "",
        "HATI-HATI. Generasi gambar TIDAK disebut pada batasan 1.4 butir c, yang",
        "membatasi modul pada ringkasan konten, penulisan naskah, dan penghalusan",
        "teks. Kalau penguji bertanya, akui terus terang: fitur ini dibangun tetapi",
        "berada di luar yang diukur. Jangan diklaim sebagai bagian hasil penelitian.",
        "",
        "Kalau pembimbing ingin ikut dinilai, batasan 1.4 butir c harus direvisi",
        "lebih dulu, dan rubrik perlu dimensi tambahan untuk mutu visual.",
        "",
        "Detail teknis kalau ditanya: pemanggilan balik dijaga rahasia bersama, dan",
        "ada pemeriksa cadangan berjadwal kalau kabar baliknya telat atau gagal.",
        "Ada pengaman berlapis pada prompt supaya detail produk tidak hilang dan",
        "skala objek tetap wajar — dua lapis, di berkas aturan agen dan di backend.",
     ]},

    {"tipe": "kartu", "judul": "Peta Integrasi dan Statusnya",
     "sub": "BAB III · 3.1.3", "tinggi": 2377440, "sz": 1300,
     "kartu": [
        ("Gerbang agen · aktif",
         ["Seluruh materi teks.",
          "Empat agen, satu model.",
          "Inilah yang diukur",
          "penelitian ini."]),
        ("Layanan gambar · aktif",
         ["Gambar dari arahan visual",
          "yang dihasilkan agen.",
          "Di luar lingkup penilaian."]),
        ("Lokapasar · menunggu kunci",
         ["Data pendapatan.",
          "Kode siap, kredensial",
          "belum tersedia.",
          "Di luar lingkup."]),
        ("Media sosial · menunggu kunci",
         ["Performa unggahan dan iklan.",
          "Aksi berbayar wajib",
          "persetujuan pemilik.",
          "Di luar lingkup."]),
     ],
     "kaki": [
        ("t", "Yang dinilai penelitian ini hanya jalur produksi konten teks. "
              "Sisanya bagian dari sistem, bukan bagian dari pengukuran."),
     ],
     "catatan": [
        "Nama aslinya: OpenClaw Gateway, kie.ai, Ginee OpenAPI, serta Meta dan",
        "TikTok. Keempatnya dipanggil langsung dari backend — tidak ada satu pun",
        "yang diakses antarmuka secara langsung.",
        "",
        "Dua yang menunggu kredensial sudah lengkap kodenya, termasuk penandatanganan",
        "permintaan dan penyimpanan token secara terenkripsi. Yang belum ada hanya",
        "kunci aksesnya.",
        "",
        "Pengaman pada jalur iklan yang layak disebut kalau ditanya: sistem bersifat",
        "baca-saja secara bawaan. Setiap aksi berbayar masuk antrian persetujuan dan",
        "hanya pemilik yang boleh menyetujui. Ini keputusan rancangan, bukan",
        "keterbatasan.",
        "",
        "Kenapa peta ini ditampilkan padahal sebagian besar di luar lingkup: supaya",
        "jelas bahwa batasan penelitian adalah pilihan sadar, bukan karena sistemnya",
        "tidak mampu.",
     ]},

    {"tipe": "tabel", "judul": "Metode dan Rubrik Penilaian",
     "sub": "BAB III · 3.2 · Tabel 3.2",
     "lebar": [2600, 5500],
     "kepala": ["Dimensi", "Yang dinilai pada skor tertinggi (4)"],
     "baris": [
        ["Gaya bahasa", "Nada, sapaan, dan formalitas konsisten di seluruh teks"],
        ["Sasaran audiens", "Diksi dan rujukan tepat sasaran"],
        ["Keunggulan produk", "Keunggulan utama tersampaikan sesuai profil merek"],
        ["Kepatuhan batasan", "Seluruh batasan penulisan dipatuhi"],
        ["Ajakan bertindak", "Bentuk dan penempatan sesuai profil merek"],
     ],
     "sorot": "Pendekatan campuran · dua alat ukur: lembar catat waktu "
              "dan rubrik lima dimensi (skor maksimal 20)",
     "nota": "Data dikumpulkan lewat observasi, wawancara, dokumentasi, dan "
             "eksperimen. Waktu dianalisis dengan median dan rentang, bukan "
             "rata-rata, karena sebaran data proses lama lebar.",
     "catatan": [
        "Kelima dimensi diturunkan dari bidang profil merek pada sistem, sehingga",
        "penilaian dapat ditelusuri ke acuan yang benar-benar dipakai saat naskah",
        "dihasilkan. Deskriptor tiap tingkat ditulis operasional agar penilai tidak",
        "menafsirkan sendiri batas antar-tingkat.",
        "",
        "Kategori skor: 17-20 sangat konsisten, 13-16 konsisten, 9-12 cukup,",
        "5-8 tidak konsisten.",
        "",
        "Tidak ada uji statistik parametrik karena syarat pengukuran setara pada",
        "kedua kelompok tidak terpenuhi. Selain durasi, penyempitan rentang juga",
        "dilaporkan sebagai indikator meningkatnya keterdugaan proses.",
        "",
        "Yang masih terbuka dan sebaiknya disampaikan jujur: batas kategori bersifat",
        "usulan, dan validitas isi rubrik perlu ditelaah pembimbing sebelum dipakai.",
     ]},

    {"tipe": "kolom", "judul": "Rancangan Pengujian dan Jadwal",
     "sub": "BAB III · 3.2.5 dan 3.4", "sz": 1450,
     "kiri": ("Lima pengaman keberpihakan", [
        ("a", "Penilaian *buta* — penilai tidak tahu asal-usul naskah;"),
        ("a", "Urutan sampel diacak;"),
        ("a", "Sekurang-kurangnya tiga penilai, bekerja mandiri;"),
        ("a", "Kesepakatan antar-penilai dilaporkan, bukan disembunyikan;"),
        ("a", "Peneliti tidak menjadi penilai."),
     ]),
     "kanan": ("Jadwal · Sep 2026 – Jan 2027", [
        ("b", "*Sep–Okt* — studi literatur, penyusunan proposal, "
              "pengumpulan data dan wawancara."),
        ("b", "*Nov* — analisis kebutuhan, perancangan, dan implementasi."),
        ("b", "*Des* — pengumpulan materi, penilaian rubrik, "
              "pengukuran waktu produksi."),
        ("b", "*Des–Jan* — analisis hasil dan penyusunan laporan."),
     ]),
     "catatan": [
        "Rancangan pengujian ini menjawab keberatan yang paling mungkin diajukan:",
        "peneliti adalah bagian dari instansi yang diteliti. Lebih baik disampaikan",
        "lebih dulu daripada menunggu ditanya.",
        "",
        "Yang belum ditetapkan dan sebaiknya diakui terbuka: jumlah naskah yang",
        "diuji serta jumlah dan asal penilai. Keduanya menunggu materi terkumpul.",
        "Penilai dari luar tim jauh lebih kuat menahan keberatan soal keberpihakan.",
        "",
        "Pengujian fungsional memakai metode black box terhadap 21 kebutuhan pada",
        "Tabel 3.1.",
        "",
        "Metode perancangan sistem: RAD, empat tahap — Requirements Planning, User",
        "Design, Construction, Cutover (Gambar 3.5). Dipilih karena putaran umpan",
        "baliknya nyata: konteks merek baru ditambahkan setelah keluaran prototipe",
        "dinilai masih terlalu umum. Rentang pengerjaan 60 hari juga cocok dengan",
        "siklus pendek RAD.",
     ]},

    {"tipe": "penutup"},
]


# ---------------------------------------------------------------- perakit slide
def slide_judul(k):
    k.blok(0, 0, W, 20955, JINGGA)
    k.blok(0, H - 754380, W, 754380, NAVY)
    k.kotak(TEPI, 960120, LEBAR, 300000,
            par("PROPOSAL SKRIPSI", "t", 1300, JINGGA, 0, tebal=True, spasi=300))
    k.kotak(TEPI, 1420368, LEBAR - 1463040, 2200000,   # sisakan ruang untuk logo
            par(JUDUL, "t", 3000, NAVY, 0, tebal=True))
    k.kotak(TEPI, 3810000, LEBAR, 300000,
            par("Studi Kasus: SneakersFlash", "t", 1700, TEKS, 0))
    k.blok(TEPI, 4343400, 640080, 41148, JINGGA)
    k.kotak(TEPI, 4526280, LEBAR - 1600200, 1200000,
            par("Muhammad Faizal Triasa", "t", 1800, NAVY, 0, tebal=True)
            + par("NIM 231011701215", "t", 1500, TEKS, 200)
            + par("Program Studi Sistem Informasi S-1 · Fakultas Ilmu Komputer",
                  "t", 1400, REDUP, 200)
            + par("Dosen Pembimbing: [nama dan gelar pembimbing]",
                  "t", 1400, REDUP, 300))
    sisi = 1188720
    gambar_kosong(k, W - TEPI - sisi, 960120, sisi, sisi, "logo Unpam 4 x 4 cm")
    k.kotak(TEPI, H - 505460, LEBAR, 400000,
            par("Universitas Pamulang · 2026", "t", 1400, PUTIH, 0, tebal=True))


def slide_penutup(k):
    k.blok(0, 0, W, 20955, JINGGA)
    k.kotak(TEPI, 2400300, LEBAR, 800000,
            par("Terima kasih", "t", 4000, NAVY, 0, tebal=True))
    k.blok(TEPI, 3474720, 640080, 41148, JINGGA)
    k.kotak(TEPI, 3749040, LEBAR, 900000,
            par("Mohon arahan dan masukan dari Bapak/Ibu Dosen Penguji", "t",
                1700, TEKS, 0)
            + par("Muhammad Faizal Triasa · NIM 231011701215 · "
                  "Sistem Informasi S-1", "t", 1400, REDUP, 400))


def slide_isi(s, k):
    sz = s.get("sz", 1700)
    y = Y_ISI
    if s.get("sorot"):
        y = sorot(k, y, s["sorot"], max(sz - 100, 1300))
    k.kotak(TEPI, y, LEBAR, Y_KAKI - y - 120000,
            "".join(par(t, j, sz) for j, t in s["isi"]))


def slide_kolom(s, k):
    sz = s.get("sz", 1500)
    lebar = (LEBAR - 548640) // 2
    for x, (kepala_kolom, isi) in ((TEPI, s["kiri"]),
                                   (TEPI + lebar + 548640, s["kanan"])):
        k.blok(x, Y_ISI, lebar, 41148, GARIS)
        k.kotak(x, Y_ISI + 137160, lebar, 300000,
                par(kepala_kolom, "t", 1300, JINGGA, 0, tebal=True, spasi=100))
        k.kotak(x, Y_ISI + 548640, lebar, Y_KAKI - Y_ISI - 700000,
                "".join(par(t, j, sz) for j, t in isi))


def slide_gambar(s, k):
    sz = s.get("sz", 1450)
    lebar_teks = 5303520
    x_gbr = TEPI + lebar_teks + 457200
    lebar_gbr = W - TEPI - x_gbr
    k.kotak(TEPI, Y_ISI, lebar_teks, Y_KAKI - Y_ISI - 120000,
            "".join(par(t, j, sz) for j, t in s["isi"]))
    tinggi = Y_KAKI - Y_ISI - 480060
    gambar_kosong(k, x_gbr, Y_ISI, lebar_gbr, tinggi, s["gambar"])
    k.kotak(x_gbr, Y_ISI + tinggi + 137160, lebar_gbr, 300000,
            par(s["gambar"], "t", 1200, REDUP, 0, algn="ctr"))


def slide_tabel(s, k):
    y = Y_ISI
    if s.get("sorot"):
        y = sorot(k, y, s["sorot"], 1300)
    k.tabel(TEPI, y, LEBAR, s["lebar"], s["kepala"], s["baris"],
            sz=s.get("sz", 1250))
    # "nota" = keterangan kaki tabel di slide; "catatan" dipakai untuk
    # catatan pembicara, jadi kuncinya sengaja dibedakan.
    if s.get("nota"):
        n = len(s["baris"]) + 1
        y_cat = y + 320040 + (n - 1) * 288000 + 274320
        k.kotak(TEPI, min(y_cat, Y_KAKI - 500000), LEBAR, 500000,
                par(s["nota"], "t", 1200, REDUP, 0))


def rakit(s, nomor, total):
    k = Kanvas()
    if s["tipe"] == "judul":
        slide_judul(k)
    elif s["tipe"] == "penutup":
        slide_penutup(k)
    else:
        kepala(k, s["judul"], s.get("sub"))
        {"isi": slide_isi, "kolom": slide_kolom, "gambar": slide_gambar,
         "tabel": slide_tabel, "kartu": slide_kartu, "alur": slide_alur,
         "angka": slide_angka, "cip": slide_cip}[s["tipe"]](s, k)
    kaki(k, nomor, total)
    return k.xml()


# ---------------------------------------------------------------- bagian tetap
DEKL = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'

THEME = DEKL + '''<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Sidang">
<a:themeElements><a:clrScheme name="Sidang">
<a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>
<a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>
<a:dk2><a:srgbClr val="12324F"/></a:dk2><a:lt2><a:srgbClr val="F2F5F7"/></a:lt2>
<a:accent1><a:srgbClr val="12324F"/></a:accent1><a:accent2><a:srgbClr val="E4572E"/></a:accent2>
<a:accent3><a:srgbClr val="6B7A85"/></a:accent3><a:accent4><a:srgbClr val="233642"/></a:accent4>
<a:accent5><a:srgbClr val="DCE3E8"/></a:accent5><a:accent6><a:srgbClr val="A3B1BB"/></a:accent6>
<a:hlink><a:srgbClr val="12324F"/></a:hlink><a:folHlink><a:srgbClr val="6B7A85"/></a:folHlink>
</a:clrScheme>
<a:fontScheme name="Sidang">
<a:majorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont>
<a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont>
</a:fontScheme>
<a:fmtScheme name="Sidang">
<a:fillStyleLst>
<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
</a:fillStyleLst>
<a:lnStyleLst>
<a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
<a:ln w="12700"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
<a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
</a:lnStyleLst>
<a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle>
<a:effectStyle><a:effectLst/></a:effectStyle>
<a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>
<a:bgFillStyleLst>
<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
</a:bgFillStyleLst>
</a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>'''

KOSONG_TREE = ('<p:cSld><p:spTree>'
               '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/>'
               '</p:nvGrpSpPr><p:grpSpPr><a:xfrm>'
               '<a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
               '<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
               '</p:spTree></p:cSld>')

MASTER = (DEKL + f'<p:sldMaster {NS}>{KOSONG_TREE}'
          '<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" '
          'accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" '
          'accent6="accent6" hlink="hlink" folHlink="folHlink"/>'
          '<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/>'
          '</p:sldLayoutIdLst></p:sldMaster>')

LAYOUT = (DEKL + f'<p:sldLayout {NS} type="blank" preserve="1">{KOSONG_TREE}'
          '<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>')

NOTES_MASTER = (DEKL + f'<p:notesMaster {NS}>{KOSONG_TREE}'
                '<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" '
                'accent1="accent1" accent2="accent2" accent3="accent3" '
                'accent4="accent4" accent5="accent5" accent6="accent6" '
                'hlink="hlink" folHlink="folHlink"/>'
                '<p:notesStyle/></p:notesMaster>')


def notes_xml(teks):
    """Catatan pembicara: satu paragraf per baris."""
    isi = "".join(
        f'<a:p><a:r><a:rPr lang="id-ID" dirty="0"/>'
        f'<a:t>{esc(b)}</a:t></a:r></a:p>' for b in teks)
    return (DEKL + f'<p:notes {NS}><p:cSld><p:spTree>'
            '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/>'
            '</p:nvGrpSpPr><p:grpSpPr><a:xfrm>'
            '<a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
            '<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
            '<p:sp><p:nvSpPr><p:cNvPr id="2" name="Catatan"/>'
            '<p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>'
            '<p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr><p:spPr/>'
            f'<p:txBody><a:bodyPr/><a:lstStyle/>{isi}</p:txBody></p:sp>'
            '</p:spTree></p:cSld>'
            '<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:notes>')


GAYA_TABEL = (DEKL + '<a:tblStyleLst xmlns:a="http://schemas.openxmlformats.org/'
              'drawingml/2006/main" def="{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}"/>')

REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
TIPE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"


def rel_xml(butir):
    """Tipe boleh berupa URL utuh; kalau tidak, dianggap relatif terhadap TIPE."""
    isi = "".join(
        f'<Relationship Id="{i}" '
        f'Type="{t if t.startswith("http") else TIPE + "/" + t}" Target="{g}"/>'
        for i, t, g in butir)
    return (DEKL + f'<Relationships xmlns="{REL}">{isi}</Relationships>')


def bangun(keluaran):
    total = len(SLIDE)
    slides = [rakit(s, i + 1, total) for i, s in enumerate(SLIDE)]

    ct = [DEKL,
          '<Types xmlns="http://schemas.openxmlformats.org/package/2006/'
          'content-types">',
          '<Default Extension="rels" ContentType="application/vnd.openxmlformats-'
          'package.relationships+xml"/>',
          '<Default Extension="xml" ContentType="application/xml"/>',
          '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.'
          'openxmlformats-officedocument.presentationml.presentation.main+xml"/>',
          '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType='
          '"application/vnd.openxmlformats-officedocument.presentationml.slideMaster'
          '+xml"/>',
          '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType='
          '"application/vnd.openxmlformats-officedocument.presentationml.slideLayout'
          '+xml"/>',
          '<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.'
          'openxmlformats-officedocument.theme+xml"/>',
          '<Override PartName="/ppt/tableStyles.xml" ContentType="application/vnd.'
          'openxmlformats-officedocument.presentationml.tableStyles+xml"/>',
          '<Override PartName="/ppt/notesMasters/notesMaster1.xml" ContentType='
          '"application/vnd.openxmlformats-officedocument.presentationml.notesMaster'
          '+xml"/>',
          '<Override PartName="/docProps/core.xml" ContentType="application/vnd.'
          'openxmlformats-package.core-properties+xml"/>']
    for i in range(1, total + 1):
        ct.append(f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType='
                  '"application/vnd.openxmlformats-officedocument.presentationml.'
                  'slide+xml"/>')
        if SLIDE[i - 1].get("catatan"):
            ct.append(f'<Override PartName="/ppt/notesSlides/notesSlide{i}.xml" '
                      'ContentType="application/vnd.openxmlformats-officedocument.'
                      'presentationml.notesSlide+xml"/>')
    ct.append("</Types>")

    daftar = "".join(f'<p:sldId id="{255 + i}" r:id="rId{10 + i}"/>'
                     for i in range(1, total + 1))
    pres = (DEKL + f'<p:presentation {NS} saveSubsetFonts="1">'
            '<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/>'
            '</p:sldMasterIdLst>'
            '<p:notesMasterIdLst><p:notesMasterId r:id="rId4"/>'
            '</p:notesMasterIdLst>'
            f'<p:sldIdLst>{daftar}</p:sldIdLst>'
            f'<p:sldSz cx="{W}" cy="{H}"/><p:notesSz cx="{H}" cy="{W}"/>'
            '</p:presentation>')

    pres_rel = [("rId1", "slideMaster", "slideMasters/slideMaster1.xml"),
                ("rId2", "theme", "theme/theme1.xml"),
                ("rId3", "tableStyles", "tableStyles.xml"),
                ("rId4", "notesMaster", "notesMasters/notesMaster1.xml")]
    pres_rel += [(f"rId{10 + i}", "slide", f"slides/slide{i}.xml")
                 for i in range(1, total + 1)]

    judul_polos = JUDUL.replace("*", "")
    core = (DEKL + '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/'
            'package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/'
            'elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" '
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
            f'<dc:title>{esc(judul_polos)}</dc:title>'
            '<dc:creator>Muhammad Faizal Triasa</dc:creator>'
            '<cp:lastModifiedBy>Muhammad Faizal Triasa</cp:lastModifiedBy>'
            '</cp:coreProperties>')

    with zipfile.ZipFile(keluaran, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", "".join(ct))
        z.writestr("_rels/.rels", rel_xml([
            ("rId1", "officeDocument", "ppt/presentation.xml"),
            ("rId2", "http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties", "docProps/core.xml")]))
        z.writestr("docProps/core.xml", core)
        z.writestr("ppt/presentation.xml", pres)
        z.writestr("ppt/_rels/presentation.xml.rels", rel_xml(pres_rel))
        z.writestr("ppt/theme/theme1.xml", THEME)
        z.writestr("ppt/tableStyles.xml", GAYA_TABEL)
        z.writestr("ppt/slideMasters/slideMaster1.xml", MASTER)
        z.writestr("ppt/slideMasters/_rels/slideMaster1.xml.rels", rel_xml([
            ("rId1", "slideLayout", "../slideLayouts/slideLayout1.xml"),
            ("rId2", "theme", "../theme/theme1.xml")]))
        z.writestr("ppt/slideLayouts/slideLayout1.xml", LAYOUT)
        z.writestr("ppt/slideLayouts/_rels/slideLayout1.xml.rels", rel_xml([
            ("rId1", "slideMaster", "../slideMasters/slideMaster1.xml")]))
        z.writestr("ppt/notesMasters/notesMaster1.xml", NOTES_MASTER)
        z.writestr("ppt/notesMasters/_rels/notesMaster1.xml.rels", rel_xml([
            ("rId1", "theme", "../theme/theme1.xml")]))
        for i, isi in enumerate(slides, 1):
            z.writestr(f"ppt/slides/slide{i}.xml", isi)
            rel = [("rId1", "slideLayout", "../slideLayouts/slideLayout1.xml")]
            catatan = SLIDE[i - 1].get("catatan")
            if catatan:
                rel.append(("rId2", "notesSlide", f"../notesSlides/notesSlide{i}.xml"))
                z.writestr(f"ppt/notesSlides/notesSlide{i}.xml", notes_xml(catatan))
                z.writestr(f"ppt/notesSlides/_rels/notesSlide{i}.xml.rels", rel_xml([
                    ("rId1", "slide", f"../slides/slide{i}.xml"),
                    ("rId2", "notesMaster", "../notesMasters/notesMaster1.xml")]))
            z.writestr(f"ppt/slides/_rels/slide{i}.xml.rels", rel_xml(rel))
    return total


if __name__ == "__main__":
    arg = sys.argv[1:]
    keluaran = "sidang-proposal.pptx"
    if "-o" in arg:
        keluaran = arg[arg.index("-o") + 1]
    n = bangun(keluaran)
    print(f"{keluaran} — {n} slide")
