"""Periksa paket .pptx: XML sehat, rujukan lengkap, teks tidak meluap."""
import re, sys, zipfile
import xml.etree.ElementTree as ET

EMU_PT = 12700
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
P = "{http://schemas.openxmlformats.org/presentationml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"

berkas = sys.argv[1]
z = zipfile.ZipFile(berkas)
nama = set(z.namelist())
lulus = gagal = 0
def cek(ok, pesan):
    global lulus, gagal
    print(("[LULUS] " if ok else "[GAGAL] ") + pesan)
    if ok: lulus += 1
    else:  gagal += 1

# 1. XML sehat
rusak = []
for n in sorted(nama):
    if n.endswith((".xml", ".rels")):
        try: ET.fromstring(z.read(n))
        except ET.ParseError as e: rusak.append(f"{n}: {e}")
cek(not rusak, "Seluruh bagian XML sehat" + ("" if not rusak else " -> " + "; ".join(rusak)))

# 2. Content_Types menutupi semua bagian
ct = ET.fromstring(z.read("[Content_Types].xml"))
C = "{http://schemas.openxmlformats.org/package/2006/content-types}"
ext = {e.get("Extension").lower() for e in ct.findall(C+"Default")}
ovr = {o.get("PartName") for o in ct.findall(C+"Override")}
luput = [n for n in nama
         if not n.startswith("_rels/") and "/_rels/" not in n
         and "/" + n not in ovr and n.rsplit(".", 1)[-1].lower() not in ext]
cek(not luput, "Setiap bagian punya content type" + ("" if not luput else " -> " + ", ".join(luput)))
hantu = [o for o in ovr if o.lstrip("/") not in nama]
cek(not hantu, "Tidak ada Override menunjuk bagian yang tidak ada" + ("" if not hantu else " -> " + ", ".join(hantu)))

# 3. Setiap r:id yang dipakai terdaftar di .rels, dan target .rels ada
masalah = []
for n in sorted(nama):
    if not n.endswith(".xml") or "/_rels/" in n: continue
    isi = z.read(n).decode("utf-8")
    dipakai = set(re.findall(r'r:id="([^"]+)"', isi)) | set(re.findall(r'r:embed="([^"]+)"', isi))
    rels = n.rsplit("/", 1)
    jalur = (rels[0] + "/_rels/" + rels[1] + ".rels") if len(rels) == 2 else "_rels/" + n + ".rels"
    punya = {}
    if jalur in nama:
        for rel in ET.fromstring(z.read(jalur)):
            punya[rel.get("Id")] = rel.get("Target")
    for rid in sorted(dipakai - set(punya)):
        masalah.append(f"{n} memakai {rid} yang tidak terdaftar")
    dasar = jalur.rsplit("/_rels/", 1)[0]
    for rid, t in punya.items():
        if t.startswith(("http://", "https://")): continue
        bagian = t
        if t.startswith("../"):
            bagian = dasar.rsplit("/", 1)[0] + "/" + t[3:]
        elif not t.startswith("/") and dasar:
            bagian = dasar + "/" + t
        bagian = bagian.lstrip("/")
        while "/../" in bagian:
            bagian = re.sub(r"[^/]+/\.\./", "", bagian, count=1)
        if bagian not in nama:
            masalah.append(f"{jalur}: {rid} -> {t} tidak ada")
cek(not masalah, "Seluruh r:id terdaftar dan targetnya ada" + ("" if not masalah else " -> " + "; ".join(masalah)))

# 4. Jumlah slide sama dengan yang terdaftar di presentation.xml
pres = ET.fromstring(z.read("ppt/presentation.xml"))
terdaftar = len(pres.find(P+"sldIdLst"))
ada = len([n for n in nama if re.fullmatch(r"ppt/slides/slide\d+\.xml", n)])
cek(terdaftar == ada, f"Slide terdaftar = slide yang ada ({terdaftar} vs {ada})")

# 5. Perkiraan luapan teks
LEBAR_HURUF = 0.50   # Calibri, lebar rata-rata terhadap ukuran huruf
TINGGI_BARIS = 1.24
luap = []
for i in range(1, ada + 1):
    n = f"ppt/slides/slide{i}.xml"
    root = ET.fromstring(z.read(n))
    for sp in root.iter(P+"sp"):
        tx = sp.find(P+"txBody")
        xf = sp.find(P+"spPr/"+A+"xfrm")
        if tx is None or xf is None: continue
        cx = int(xf.find(A+"ext").get("cx")); cy = int(xf.find(A+"ext").get("cy"))
        if cx <= 0 or cy <= 0: continue
        total = 0.0
        for par in tx.findall(A+"p"):
            teks = "".join(t.text or "" for t in par.iter(A+"t"))
            if not teks:
                continue
            rpr = par.find(A+"r/"+A+"rPr")
            sz = int(rpr.get("sz", "1800")) / 100.0
            ppr = par.find(A+"pPr")
            marL = int(ppr.get("marL", "0")) if ppr is not None else 0
            lebar_pt = (cx - marL) / EMU_PT
            per_baris = max(lebar_pt / (sz * LEBAR_HURUF), 1)
            baris = max(1, -(-len(teks) // int(per_baris)))
            spc = ppr.find(A+"spcBef/"+A+"spcPts") if ppr is not None else None
            total += baris * sz * TINGGI_BARIS + (int(spc.get("val"))/100.0 if spc is not None else 0)
        if total * EMU_PT > cy * 1.02:
            luap.append(f"slide {i}: perlu ~{total:.0f} pt, tersedia {cy/EMU_PT:.0f} pt")
cek(not luap, "Tidak ada kotak teks yang meluap" + ("" if not luap else " -> " + "; ".join(luap)))

print(f"\nLULUS {lulus}, GAGAL {gagal}")
sys.exit(1 if gagal else 0)
