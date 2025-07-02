# Sistem Informasi Penjualan (SIP) — Test Case Project

Halo! 👋

Ini adalah project **test case** yang saya kerjakan sebagai bagian dari proses rekrutmen/lamaran kerja di sebuah perusahaan. Project ini bertujuan untuk menguji kemampuan saya dalam membangun aplikasi frontend berbasis web yang terintegrasi dengan API eksternal, serta menerapkan best practice pengembangan aplikasi sederhana namun fungsional.

---

## 🎯 Tujuan & Konteks
- **Project ini adalah hasil pengerjaan test case dari user/perusahaan** (bukan project pribadi/portofolio biasa).
- Semua fitur, struktur, dan alur aplikasi mengikuti permintaan dan skenario yang diberikan oleh user/tester.
- Saya mengerjakan project ini dengan pendekatan "belajar sambil praktek", tanpa framework modern, agar lebih fokus ke fundamental JavaScript, HTML, dan CSS.

---

## ✨ Fitur Utama
- **Login JWT** — Otentikasi menggunakan username & password, token disimpan di localStorage.
- **CRUD Master Item** — Tambah, edit, hapus, dan lihat daftar item/barang.
- **CRUD Transaksi** — Tambah, edit, hapus, dan lihat daftar transaksi penjualan.
- **Tabel Responsif** — Tabel data item & transaksi yang responsif dan mudah dibaca.
- **Search & Filter** — Pencarian data secara real-time.
- **Toast Notification** — Notifikasi sukses/gagal yang user-friendly.
- **Loading Spinner** — Indikator loading saat fetch data dari API.
- **Modal & Drawer** — Form tambah/edit pakai modal, detail transaksi pakai drawer.
- **Pagination** — Navigasi halaman data item & transaksi.
- **Error Handling** — Penanganan error API, validasi form, dan feedback ke user.

---

## 🛠️ Teknologi yang Digunakan
- **Frontend:** HTML5, CSS3 (Tailwind), JavaScript (ES6)
- **API:** Elsoft Public API (disediakan oleh user/tester)
- **Lainnya:** LocalStorage, Fetch API

---

## 🚀 Cara Menjalankan
1. **Clone repo ini:**
   ```
   git clone https://github.com/AnnisaCode/elsoft-test
   cd elsoft-test
   ```
2. **Buka file `index.html` di browser** (tidak perlu install apa-apa).
3. **Atau cek versi online:**
   [Demo Online](https://annisacode.github.io/elsoft-test/)

---

## 🔑 Login Dummy
- **Username:** testcase
- **Password:** testcase123

---

## 📚 Penjelasan Singkat Struktur Kode
- `index.html` — Struktur utama halaman, modal, drawer, dan tabel.
- `main.js` — Entry point aplikasi, inisialisasi event, routing, dan integrasi antar modul.
- `js/auth.js` — Logic login/logout, simpan token, dan tampilkan navbar.
- `js/item.js` — Logic CRUD item, render tabel item, modal tambah/edit, dan hapus item.
- `js/transaction.js` — Logic CRUD transaksi, render tabel transaksi, detail drawer, dan hapus transaksi.
- `js/api.js` — Utility untuk request ke API (dengan token).
- `js/utils.js` — Fungsi-fungsi bantu: format tanggal, currency, toast, dsb.
- `style.css` — Custom style tambahan (jika ada).

---

## 📝 Catatan Pengalaman Pengerjaan
- Saya mengerjakan project ini **dari awal hingga akhir sendiri**, tanpa framework, agar lebih memahami dasar-dasar frontend.
- Untuk hal-hal teknis yang belum saya kuasai sepenuhnya, saya menggunakan referensi dari berbagai sumber seperti dokumentasi resmi, forum, serta bantuan dari Google, Gemini, dan ChatGPT untuk memahami konsep dan menyelesaikan masalah yang saya temui selama proses pengembangan.
- Banyak belajar tentang **integrasi API eksternal**, penanganan error, dan UX sederhana.
- Beberapa tantangan yang dihadapi:
  - Adaptasi dengan struktur data API yang berubah-ubah.
  - Penyesuaian field dan mapping data agar sesuai kebutuhan.
  - Debugging error API (misal: 403, 422, invalid JSON) dan validasi form.


---

## 🙏 Penutup
Terima kasih atas kesempatan dan kepercayaan yang diberikan untuk mengerjakan test case ini. Semoga hasil kerja saya bisa memenuhi ekspektasi dan menjadi pertimbangan positif dalam proses rekrutmen.

Salam,
Annisa 