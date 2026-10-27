# Sales Visit Camera 📸

Aplikasi berbasis Progressive Web App (PWA) statis (tanpa backend) yang dirancang untuk tenaga sales dalam mendokumentasikan kunjungan kerja ke toko bangunan atau pelanggan. Aplikasi ini langsung menempelkan *watermark* berupa Nama Toko, Nama Sales, Koordinat GPS, serta Tanggal & Waktu di atas foto. 

## ✨ Fitur Utama
1. **Watermark Otomatis & Bisa Diedit:** Menggunakan HTML Canvas untuk menanamkan detail kunjungan pada foto.
2. **Kamera & GPS Langsung:** Mengambil posisi *latitude/longitude* dan akses langsung ke kamera HP via browser.
3. **Penyimpanan Lokal (Offline):** Menyimpan riwayat gambar langsung ke memori internal browser menggunakan IndexedDB.
4. **Berbagi Cepat:** Terintegrasi dengan *Web Share API* untuk membagikan hasil gambar langsung ke WhatsApp atau aplikasi lain.
5. **Dukungan PWA:** Dapat diunduh/diinstal (Add to Homescreen) dan diakses secara offline.

## 🚀 Cara Publikasi di GitHub Pages
1. Buat repository baru di GitHub.
2. *Upload* seluruh struktur file (HTML, CSS, JS, manifest, SW, dan folder `icons`).
3. Masuk ke **Settings** repository Anda > Pilih menu **Pages** di sebelah kiri.
4. Pada bagian *Source*, ubah *Branch* menjadi `main` atau `master`, lalu klik **Save**.
5. Tunggu beberapa menit, tautan GitHub Pages akan muncul. Buka tautan tersebut di HP Android Anda.

## 📱 Cara Instal ke Layar Utama HP
1. Buka tautan GitHub Pages dari browser Chrome di Android.
2. Ketuk ikon menu (tiga titik) di pojok kanan atas browser.
3. Pilih **"Tambahkan ke Layar Utama" (Add to Home Screen)** atau klik notifikasi instalasi PWA di bawah layar.
4. Aplikasi akan tampil layaknya aplikasi natif Android di menu HP Anda.
5. Pastikan selalu berikan izin **Akses Lokasi** dan **Akses Kamera** saat ditanya oleh browser.

## 🔒 Privasi dan Keamanan
- **Tanpa Backend:** Aplikasi ini 100% jalan secara lokal (Client-side).
- Data foto, nama toko, dan lokasi hanya disimpan di perangkat HP Anda sendiri melalui IndexedDB.
- Hati-hati menghapus data history browser (Clear Cache/Storage), karena akan menghilangkan riwayat foto kunjungan.

---
**Lisensi:** MIT
