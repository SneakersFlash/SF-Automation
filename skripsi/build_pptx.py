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


# ---------------------------------------------------------------- isi slide
JUDUL = ("Perancangan Sistem Otomasi Produksi Konten Pemasaran "
         "Berbasis *Multi-Agent* AI untuk Meningkatkan Efisiensi "
         "dan Konsistensi *Brand Voice*")

SLIDE = [
    {"tipe": "judul"},

    {"tipe": "isi", "judul": "Alur Presentasi", "sz": 1700, "isi": [
        ("a", "Latar belakang dan permasalahan"),
        ("a", "Identifikasi, rumusan, dan batasan masalah"),
        ("a", "Tujuan dan manfaat penelitian"),
        ("a", "Penelitian terdahulu dan celah riset"),
        ("a", "Landasan teori dan kerangka berpikir"),
        ("a", "Analisis kebutuhan dan usulan sistem"),
        ("a", "Metode penelitian dan rancangan pengujian"),
        ("a", "Metode perancangan sistem dan jadwal penelitian"),
    ]},

    {"tipe": "isi", "judul": "Latar Belakang (1/3)",
     "sub": "BAB I · 1.1", "sz": 1600, "isi": [
        ("h", "Persaingan bergeser ke kehadiran merek"),
        ("b", "Konsumen membandingkan harga dan ulasan dalam hitungan detik, "
              "sehingga keunggulan lokasi toko tidak lagi memadai (Lubis dkk., 2025)."),
        ("b", "Pada ritel sepatu olahraga, promosi media sosial berpengaruh "
              "signifikan terhadap keputusan pembelian, dan konsistensi pesan "
              "lintas platform dianjurkan (Ibrahim & Abdurrahman, 2025)."),
        ("h", "AI generatif menjawab, tetapi membawa syarat"),
        ("b", "Model bahasa besar sudah dipakai untuk penghasilan konten, namun "
              "menyisakan persoalan privasi, transparansi, dan bias "
              "(Aghaei dkk., 2025)."),
        ("b", "Kajian PRISMA menemukan ketegangan antara efisiensi dan integritas, "
              "dengan risiko halusinasi serta bias algoritmik — manusia tetap "
              "harus menjadi pemeriksa akhir (Rahman dkk., 2025)."),
     ]},

    {"tipe": "isi", "judul": "Latar Belakang (2/3) — Kondisi di SneakersFlash",
     "sub": "BAB I · 1.1", "sz": 1600,
     "sorot": "1–3 jam per materi · kasus ekstrem 12 jam · "
              "kebutuhan 5 materi per hari → 5–15 jam kerja per hari",
     "isi": [
        ("a", "Waktu penyiapan panjang dan sangat bervariasi, sehingga jadwal "
              "peluncuran sulit diperkirakan."),
        ("a", "Gaya bahasa berbeda antar admin karena standar merek hanya hidup "
              "sebagai kesepakatan lisan."),
        ("a", "Perintah ke AI tidak menyertakan konteks merek, sehingga keluaran "
              "generik dan masih menuntut penyuntingan panjang."),
        ("a", "Keluaran tidak tercatat, sehingga materi yang telah terbit tidak "
              "dapat ditelusuri kembali."),
     ]},

    {"tipe": "kolom", "judul": "Latar Belakang (3/3) — Dampak dan Usulan",
     "sub": "BAB I · 1.1", "sz": 1500,
     "kiri": ("Bila dibiarkan", [
        ("b", "Jadwal peluncuran meleset dan momentum yang pendek terlewat."),
        ("b", "Identitas merek kabur karena gaya bahasa berubah antar unggahan."),
        ("b", "Mutu bergantung pada masing-masing admin — pergantian personel "
              "langsung menurunkan mutu."),
        ("b", "Tidak ada jejak pencatatan, sehingga pertanggungjawaban sulit."),
     ]),
     "kanan": ("Yang diusulkan", [
        ("b", "Sistem otomasi produksi konten berpendekatan *multi-agent* melalui "
              "satu gerbang layanan tunggal."),
        ("b", "Pembedanya: *profil merek terstruktur* disertakan sebagai konteks "
              "pada setiap permintaan."),
        ("b", "Standar merek dieksekusi sistem, bukan diingat admin."),
        ("b", "Setiap proses dicatat; manusia tetap pemeriksa akhir."),
     ])},

    {"tipe": "isi", "judul": "Identifikasi Masalah",
     "sub": "BAB I · 1.2", "sz": 1650, "isi": [
        ("a", "Penyiapan materi konten memerlukan waktu lama karena seluruh "
              "tahapannya dikerjakan secara manual;"),
        ("a", "Gaya bahasa merek berubah-ubah antar admin karena standar merek "
              "tidak dieksekusi oleh sistem;"),
        ("a", "Perintah kepada AI dijalankan tanpa konteks merek sehingga keluaran "
              "cenderung generik dan menuntut penyuntingan ulang;"),
        ("a", "Keluaran AI tidak tercatat sehingga materi yang telah terbit tidak "
              "dapat ditelusuri kembali;"),
        ("a", "Standar merek yang berlaku belum dapat dipakai ulang untuk merek lain."),
     ]},

    {"tipe": "isi", "judul": "Rumusan Masalah",
     "sub": "BAB I · 1.3", "sz": 1800,
     "sorot": "Tiga pertanyaan: rancangan sistem · efisiensi waktu · "
              "konsistensi *brand voice*",
     "isi": [
        ("a", "Bagaimana merancang dan membangun sistem otomasi produksi konten "
              "pemasaran berbasis *multi-agent* AI pada SneakersFlash?"),
        ("a", "Bagaimana pengaruh penerapan sistem tersebut terhadap efisiensi "
              "waktu produksi konten dibandingkan proses yang berjalan sebelumnya?"),
        ("a", "Sejauh mana profil merek terstruktur yang digunakan sistem dapat "
              "menjaga konsistensi *brand voice* pada keluaran konten?"),
     ]},

    {"tipe": "kolom", "judul": "Batasan Masalah",
     "sub": "BAB I · 1.4", "sz": 1400,
     "kiri": ("Objek dan lingkup", [
        ("b", "SneakersFlash dengan satu profil merek aktif."),
        ("b", "Sistem berstatus *prototipe* dan masih dalam pengujian — belum "
              "dipakai untuk operasional harian."),
        ("b", "Modul terbatas pada produksi konten: ringkasan konten, penulisan "
              "naskah, dan penghalusan teks."),
        ("b", "Modul pendapatan dan performa media sosial di luar lingkup."),
     ]),
     "kanan": ("Pengukuran dan asumsi", [
        ("b", "Model bahasa diperlakukan sebagai *kotak hitam* — tidak "
              "dievaluasi, dibandingkan, maupun dilatih ulang."),
        ("b", "Perbandingan efisiensi antar-proses secara keseluruhan; kontribusi "
              "arsitektur *multi-agent* tidak diisolasi."),
        ("b", "Konsistensi *brand voice* dinilai manusia dengan rubrik, bukan "
              "pendeteksi teks AI otomatis."),
        ("b", "Durasi proses lama berupa estimasi retrospektif, sehingga "
              "pembandingan bersifat deskriptif."),
        ("b", "Keamanan sistem dan infrastruktur penempatan tidak dibahas."),
     ])},

    {"tipe": "kolom", "judul": "Tujuan dan Manfaat Penelitian",
     "sub": "BAB I · 1.5 dan 1.6", "sz": 1500,
     "kiri": ("Tujuan", [
        ("a", "Merancang dan membangun sistem otomasi produksi konten pemasaran "
              "berbasis *multi-agent* AI pada SneakersFlash;"),
        ("a", "Mengukur pengaruh penerapan sistem terhadap efisiensi waktu produksi "
              "konten dibandingkan proses sebelumnya;"),
        ("a", "Mengevaluasi sejauh mana profil merek terstruktur menjaga "
              "konsistensi *brand voice* pada keluaran konten."),
     ]),
     "kanan": ("Manfaat", [
        ("h", "Universitas Pamulang"),
        ("s", "Rujukan penerapan AI generatif pada proses bisnis nyata dan bahan "
              "pembanding penelitian sejenis."),
        ("h", "Instansi"),
        ("s", "Memangkas waktu penyiapan materi, menyeragamkan identitas merek, "
              "dan menyediakan jejak pencatatan."),
        ("h", "Penulis"),
        ("s", "Menerapkan analisis dan perancangan sistem, rekayasa perangkat lunak, "
              "serta metodologi penelitian pada masalah nyata."),
     ])},

    {"tipe": "isi", "judul": "Penelitian Terdahulu",
     "sub": "BAB II · 2.1 · 20 studi (10 naratif, 10 pada Tabel 2.1)",
     "sz": 1500, "isi": [
        ("h", "Kelompok 1 — Kajian teknologi *multi-agent*"),
        ("s", "Tran dkk. (2025), Lin dkk. (2025), Yan dkk. (2025): mekanisme "
              "kolaborasi antar-agen sudah dipetakan, tetapi berhenti pada tataran "
              "konseptual."),
        ("h", "Kelompok 2 — Penerapan pada pemasaran dan identitas merek"),
        ("s", "Chu dkk. (2025) menempatkan agen pada sisi konsumen; Purpura dkk. "
              "(2025) pada penelaahan materi yang sudah ada — sisi produksi "
              "belum tergarap."),
        ("s", "Kirkby dkk. (2023): pengungkapan AI tidak merusak persepsi keaslian; "
              "Wang dkk. (2025): model kesulitan meniru gaya yang tidak dinyatakan "
              "eksplisit."),
        ("h", "Kelompok 3 — Rancang bangun sistem informasi di Indonesia"),
        ("s", "Yusna dkk. (2025), Yunus dkk. (2025), Hanum dkk. (2026), dan lainnya: "
              "pengujian berhenti pada kesesuaian fungsi (*black box*), tanpa "
              "menilai mutu luaran."),
     ]},

    {"tipe": "isi", "judul": "Celah Riset",
     "sub": "BAB II · 2.1", "sz": 1650,
     "sorot": "Belum ditemukan penelitian yang memenuhi keempat hal berikut sekaligus",
     "isi": [
        ("a", "Merancang sistem produksi konten pemasaran untuk proses kerja yang "
              "*nyata*, bukan simulasi;"),
        ("a", "Menerapkan arsitektur *multi-agent* dengan pembagian tugas per modul;"),
        ("a", "Menggunakan profil merek terstruktur sebagai konteks — menjawab "
              "keterbatasan peniruan gaya yang ditemukan Wang dkk. (2025);"),
        ("a", "Mengukur dampak pada dua sisi sekaligus, yaitu efisiensi waktu dan "
              "konsistensi *brand voice*, dalam konteks ritel berbahasa Indonesia."),
     ]},

    {"tipe": "kolom", "judul": "Landasan Teori",
     "sub": "BAB II · 2.2", "sz": 1500,
     "kiri": ("Domain dan teknologi", [
        ("b", "Produksi konten pemasaran digital"),
        ("b", "Kecerdasan buatan generatif dan model bahasa besar"),
        ("b", "Agen cerdas dan sistem *multi-agent*"),
        ("b", "*Brand voice* dan konsistensi identitas merek"),
        ("b", "Otomasi alur kerja dan antrian tugas"),
     ]),
     "kanan": ("Rekayasa dan pengukuran", [
        ("b", "Arsitektur aplikasi web dan REST API"),
        ("b", "Metode perancangan sistem *Rapid Application Development*"),
        ("b", "Rubrik penilaian dan kesepakatan antar-penilai"),
        ("b", "Notasi perancangan sistem (UML dan ERD)"),
     ])},

    {"tipe": "gambar", "judul": "Kerangka Berpikir",
     "sub": "BAB II · 2.3", "sz": 1450, "gambar": "Gambar 2.1",
     "isi": [
        ("h", "Masalah"),
        ("s", "Waktu penyiapan panjang; gaya bahasa tidak konsisten antar admin."),
        ("h", "Tinjauan"),
        ("s", "Teori *multi-agent* dan konteks terstruktur; penelitian terdahulu "
              "menunjukkan celah pada sisi produksi."),
        ("h", "Rancangan"),
        ("s", "Empat agen per modul, profil merek sebagai konteks, pencatatan "
              "setiap proses."),
        ("h", "Pengujian"),
        ("s", "Pengukuran waktu produksi dan penilaian rubrik secara buta."),
        ("h", "Hasil yang diharapkan"),
        ("s", "Waktu produksi menurun dan konsistensi *brand voice* meningkat."),
     ]},

    {"tipe": "gambar", "judul": "Analisis Sistem yang Sedang Berjalan",
     "sub": "BAB III · 3.1.1 dan 3.1.2", "sz": 1500, "gambar": "Gambar 3.1",
     "isi": [
        ("b", "Admin menyusun sendiri ringkasan konten, naskah unggahan, dan naskah "
              "iklan secara manual."),
        ("b", "Sebagian admin memakai AI lewat antarmuka percakapan umum dengan "
              "perintah yang disusun sendiri, tanpa acuan bersama."),
        ("b", "Tidak ada berkas acuan yang mengikat mengenai gaya bahasa merek."),
        ("b", "Tidak ada pencatatan atas naskah yang dihasilkan."),
        ("h", "Empat permasalahan"),
        ("s", "Waktu panjang · gaya bahasa tidak seragam · keluaran generik "
              "· tidak dapat ditelusuri."),
     ]},

    {"tipe": "gambar", "judul": "Usulan Sistem — Arsitektur Tiga Lapis",
     "sub": "BAB III · 3.1.3", "sz": 1500, "gambar": "Gambar 3.2",
     "isi": [
        ("h", "Lapis 1 — Antarmuka pengguna"),
        ("s", "Aplikasi web internal; tidak pernah mengakses gerbang agen maupun "
              "basis data secara langsung."),
        ("h", "Lapis 2 — Layanan *backend*"),
        ("s", "Satu-satunya pintu menuju basis data dan layanan luar; mengambil "
              "profil merek aktif dan menyertakannya ke setiap permintaan."),
        ("h", "Lapis 3 — Gerbang agen model bahasa besar"),
        ("s", "Empat agen: penyusun ringkasan konten, penulis naskah, penghalus "
              "teks, dan penyusun materi iklan."),
     ]},

    {"tipe": "isi", "judul": "Pembeda — Profil Merek sebagai Konteks",
     "sub": "BAB III · 3.1.3", "sz": 1600,
     "sorot": "Standar merek dieksekusi sistem, bukan bergantung pada ingatan admin",
     "isi": [
        ("h", "Isi profil merek yang disertakan pada setiap permintaan"),
        ("b", "Gaya bahasa · sasaran audiens · keunggulan produk"),
        ("b", "Batasan penulisan · ajakan bertindak · pengetahuan produk "
              "· contoh naskah"),
        ("h", "Pengaman yang menyertainya"),
        ("b", "Setiap proses penghasilan dicatat beserta masukan, keluaran, dan "
              "penggunanya."),
        ("b", "Proses gabungan dijalankan asinkron melalui antrian tugas agar "
              "antarmuka tidak terkunci menunggu."),
        ("b", "Manusia tetap menjadi pemeriksa akhir sebelum materi diterbitkan."),
     ]},

    {"tipe": "tabel", "judul": "Kebutuhan Fungsional",
     "sub": "BAB III · 3.1.4 · Tabel 3.1 memuat 21 kebutuhan",
     "lebar": [1500, 4200, 2400],
     "kepala": ["Kode", "Kelompok kebutuhan", "Aktor"],
     "baris": [
        ["AUTH-01–03", "Masuk, keluar, dan ubah kata sandi", "Owner, Member"],
        ["USER-01–03", "Menambah, menonaktifkan, dan melihat akun", "Owner"],
        ["BRAND-01–05", "Kelola profil merek dan pilih profil aktif",
         "Owner, Member"],
        ["SUBJ-01–02", "Memasukkan dan menyimpan subjek produk", "Owner, Member"],
        ["CRE-01–05", "Ringkasan konten, naskah, penghalusan, proses gabungan",
         "Owner, Member"],
        ["AUD-01–02", "Mencatat proses penghasilan dan melihat riwayat",
         "Sistem, Owner"],
     ],
     "catatan": "Modul performa media sosial dan modul pendapatan tidak dimasukkan "
                "karena integrasinya belum aktif (batasan 1.4)."},

    {"tipe": "kolom", "judul": "Metode Penelitian",
     "sub": "BAB III · 3.2.1 dan 3.2.2", "sz": 1500,
     "kiri": ("Pendekatan campuran", [
        ("b", "*Kuantitatif* — mengukur efisiensi waktu produksi konten "
              "sebelum dan sesudah sistem diterapkan."),
        ("b", "*Kuantitatif berbasis penilaian* — menilai konsistensi "
              "*brand voice* melalui rubrik yang diisi penilai."),
        ("b", "*Kualitatif terbatas* — observasi dan wawancara untuk memahami "
              "proses berjalan dan menyusun kebutuhan."),
     ]),
     "kanan": ("Pengumpulan data", [
        ("a", "Observasi proses penyiapan materi yang berjalan;"),
        ("a", "Wawancara dengan admin yang menjalankan proses;"),
        ("a", "Dokumentasi catatan waktu dan arsip naskah terbit;"),
        ("a", "Eksperimen penghasilan naskah untuk dinilai konsistensinya."),
     ])},

    {"tipe": "tabel", "judul": "Instrumen Penelitian — Rubrik *Brand Voice*",
     "sub": "BAB III · 3.2.4 · Tabel 3.2",
     "lebar": [2600, 5500],
     "kepala": ["Dimensi", "Yang dinilai pada skor tertinggi (4)"],
     "baris": [
        ["Gaya bahasa", "Nada, sapaan, dan tingkat formalitas konsisten di "
                        "seluruh teks"],
        ["Sasaran audiens", "Diksi dan rujukan tepat sasaran di seluruh teks"],
        ["Keunggulan produk", "Keunggulan utama tersampaikan jelas sesuai profil merek"],
        ["Kepatuhan batasan", "Seluruh batasan penulisan dipatuhi"],
        ["Ajakan bertindak", "Bentuk dan penempatan sesuai profil merek"],
     ],
     "sorot": "Lima dimensi × skor 1–4 → skor maksimal 20 · "
              "17–20 sangat konsisten, 13–16 konsisten, "
              "9–12 cukup, 5–8 tidak konsisten",
     "catatan": "Dimensi diturunkan dari bidang pada profil merek di sistem, "
                "sehingga penilaian dapat ditelusuri ke acuan yang benar-benar "
                "dipakai saat naskah dihasilkan. Instrumen kedua: lembar catat waktu."},

    {"tipe": "isi", "judul": "Rancangan Pengujian",
     "sub": "BAB III · 3.2.5", "sz": 1600,
     "sorot": "Peneliti adalah bagian dari instansi yang diteliti — "
              "lima pengaman ditetapkan untuk menekan keberpihakan",
     "isi": [
        ("a", "Penilaian dilakukan secara *buta*: penilai tidak tahu naskah mana "
              "yang dihasilkan dengan konteks merek dan mana yang tanpa;"),
        ("a", "Urutan penyajian sampel diacak sehingga tidak membentuk pola;"),
        ("a", "Sekurang-kurangnya tiga penilai bekerja mandiri tanpa berdiskusi;"),
        ("a", "Kesepakatan antar-penilai dihitung dan dilaporkan, bukan disembunyikan;"),
        ("a", "Peneliti tidak bertindak sebagai penilai."),
        ("h", "Pengujian fungsional"),
        ("s", "Metode *black box* terhadap seluruh kebutuhan pada Tabel 3.1."),
     ]},

    {"tipe": "kolom", "judul": "Metode Analisis Data",
     "sub": "BAB III · 3.2.6", "sz": 1500,
     "kiri": ("Waktu produksi konten", [
        ("b", "Statistik deskriptif: nilai terendah, tertinggi, *median*, dan rentang."),
        ("b", "Median dan rentang dipilih karena data proses lama berupa estimasi "
              "dengan sebaran lebar — rata-rata mudah terdistorsi kasus ekstrem."),
        ("b", "Tanpa uji statistik parametrik: syarat pengukuran setara pada kedua "
              "kelompok tidak terpenuhi."),
        ("b", "Penyempitan rentang dilaporkan sebagai indikator keterdugaan proses."),
     ]),
     "kanan": ("Skor rubrik dan kejujuran klaim", [
        ("b", "Statistik deskriptif per dimensi, dibandingkan antara naskah dengan "
              "konteks merek dan tanpa konteks merek."),
        ("b", "Kesepakatan antar-penilai dihitung dengan koefisien yang sesuai "
              "jumlah penilai dan skala."),
        ("b", "Penelitian *tidak* mengklaim penurunan waktu semata-mata disebabkan "
              "arsitektur *multi-agent* — antarmuka terpusat diterapkan "
              "bersamaan. Keterbatasan ini dinyatakan pada 1.4."),
     ])},

    {"tipe": "gambar", "judul": "Metode Perancangan Sistem — RAD",
     "sub": "BAB III · 3.3", "sz": 1450, "gambar": "Gambar 3.5",
     "isi": [
        ("h", "1. Requirements Planning"),
        ("s", "Observasi, wawancara, dan dokumen acuan (SRS, IA, DS, alur pengguna) "
              "diselesaikan sebelum penulisan kode."),
        ("h", "2. User Design"),
        ("s", "Kerangka aplikasi, tata letak dan navigasi, serta struktur basis data; "
              "ditinjau pengguna dan diperbaiki."),
        ("h", "3. Construction"),
        ("s", "Dibangun bertahap per bagian fungsi, tiap bagian diuji begitu selesai. "
              "Konteks merek disempurnakan saat keluaran dinilai terlalu umum."),
        ("h", "4. Cutover"),
        ("s", "Penempatan dalam wadah pada peladen uji dan pengujian menyeluruh. "
              "Penerapan operasional harian di luar lingkup."),
     ]},

    {"tipe": "tabel", "judul": "Jadwal Penelitian",
     "sub": "BAB III · 3.4 · Tabel 3.3",
     "lebar": [4000, 1000, 1000, 1000, 1000, 1000],
     "kepala": ["Kegiatan", "Sep 26", "Okt 26", "Nov 26", "Des 26", "Jan 27"],
     "baris": [
        ["Studi literatur dan penyusunan proposal", "X", "X", "", "", ""],
        ["Pengumpulan data dan wawancara", "", "X", "X", "", ""],
        ["Analisis kebutuhan dan perancangan", "", "", "X", "", ""],
        ["Implementasi dan penyempurnaan sistem", "", "", "X", "X", ""],
        ["Pengumpulan materi dan penilaian rubrik", "", "", "", "X", ""],
        ["Pengukuran waktu produksi konten", "", "", "", "X", ""],
        ["Analisis hasil dan penyusunan laporan", "", "", "", "X", "X"],
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
    if s.get("catatan"):
        n = len(s["baris"]) + 1
        y_cat = y + 320040 + (n - 1) * 288000 + 274320
        k.kotak(TEPI, min(y_cat, Y_KAKI - 500000), LEBAR, 500000,
                par(s["catatan"], "t", 1200, REDUP, 0))


def rakit(s, nomor, total):
    k = Kanvas()
    if s["tipe"] == "judul":
        slide_judul(k)
    elif s["tipe"] == "penutup":
        slide_penutup(k)
    else:
        kepala(k, s["judul"], s.get("sub"))
        {"isi": slide_isi, "kolom": slide_kolom,
         "gambar": slide_gambar, "tabel": slide_tabel}[s["tipe"]](s, k)
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
          '<Override PartName="/docProps/core.xml" ContentType="application/vnd.'
          'openxmlformats-package.core-properties+xml"/>']
    for i in range(1, total + 1):
        ct.append(f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType='
                  '"application/vnd.openxmlformats-officedocument.presentationml.'
                  'slide+xml"/>')
    ct.append("</Types>")

    daftar = "".join(f'<p:sldId id="{255 + i}" r:id="rId{10 + i}"/>'
                     for i in range(1, total + 1))
    pres = (DEKL + f'<p:presentation {NS} saveSubsetFonts="1">'
            '<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/>'
            '</p:sldMasterIdLst>'
            f'<p:sldIdLst>{daftar}</p:sldIdLst>'
            f'<p:sldSz cx="{W}" cy="{H}"/><p:notesSz cx="{H}" cy="{W}"/>'
            '</p:presentation>')

    pres_rel = [("rId1", "slideMaster", "slideMasters/slideMaster1.xml"),
                ("rId2", "theme", "theme/theme1.xml"),
                ("rId3", "tableStyles", "tableStyles.xml")]
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
        for i, isi in enumerate(slides, 1):
            z.writestr(f"ppt/slides/slide{i}.xml", isi)
            z.writestr(f"ppt/slides/_rels/slide{i}.xml.rels", rel_xml([
                ("rId1", "slideLayout", "../slideLayouts/slideLayout1.xml")]))
    return total


if __name__ == "__main__":
    arg = sys.argv[1:]
    keluaran = "sidang-proposal.pptx"
    if "-o" in arg:
        keluaran = arg[arg.index("-o") + 1]
    n = bangun(keluaran)
    print(f"{keluaran} — {n} slide")
