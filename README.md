# The Forgotten Chronicle

Game petualangan RPG 2D yang dibangun dengan React dan Tailwind, menampilkan sistem pertanian, mini-games, dan gameplay yang menarik.

## 🎮 Dibuat Oleh P.U.N.K

- **Gading Kelana Putra**
- **Abid Irsyad Dinejad**
- **Rafael Romelo Gibran**
- **Naufal Rabbani**

---

## 🎯 Aturan Permainan

### 🏃‍♂️ **Gerakan & Kontrol**
- Gunakan **WASD** atau **Arrow Keys** untuk menggerakkan karakter di dunia game
- **Klik Mouse** untuk berinteraksi dengan NPC, objek, dan elemen UI
- Tombol **ESC** untuk menjeda permainan dan mengakses pengaturan

### 👤 **Sistem Karakter**
- Pilih dari 3 karakter unik: **Louise**, **Eugene**, atau **Alex**
- Setiap karakter memiliki sprite dan animasi yang berbeda untuk berbagai aksi
- Karakter memiliki beberapa stat yang harus dikelola: Kesehatan, Kelaparan, Kebersihan, Kebahagiaan, Energi, dan Uang

### 📊 **Manajemen Stat**
- **Kesehatan** ❤️: Kekuatan hidup karakter Anda
- **Kelaparan** 🍽️: Berkurang seiring waktu, makan makanan untuk memulihkan
- **Kebersihan** 🧼: Jaga kebersihan untuk interaksi yang lebih baik
- **Kebahagiaan** 😊: Mempengaruhi performa karakter dan interaksi
- **Energi** ⚡: Diperlukan untuk aksi, istirahat untuk memulihkan
- **Uang** 💰: Dapatkan melalui quest dan mini-games

### 🌱 **Sistem Pertanian**
- **Tanam Benih**: Gunakan benih di spot yang bisa ditanami
- **Siram Tanaman**: Gunakan kaleng penyiram untuk membantu tanaman tumbuh
- **Panen**: Kumpulkan tanaman matang dengan alat sabit
- **Tahap Pertumbuhan**: Tanaman melalui 3 tahap pertumbuhan sebelum panen
- **Jenis Tanaman**: Saat ini mendukung pertanian kentang dengan 3 tahap visual

### 🎒 **Sistem Inventori**
- Kelola berbagai item termasuk:
  - **Alat**: Cangkul, Kaleng Penyiram, Sabit
  - **Makanan**: Roti, Semur, Daging, Jamur, Kentang
  - **Item Khusus**: Benih, Buku Besar, Dokumen Kerajaan, Bijih Khusus
- Item dapat digunakan untuk crafting, memasak, atau menyelesaikan quest

### 🍳 **Mini-Game Memasak**
- Buat **Semur Lezat** menggunakan bahan-bahan khusus:
  - 1x Kentang
  - 1x Daging  
  - 2x Jamur
- **Fase Permainan**:
  1. **Persiapan**: Tambahkan bahan yang diperlukan
  2. **Pemanasan**: Kontrol suhu (jaga di sekitar rentang optimal)
  3. **Mengaduk**: Ikuti gerakan mouse untuk mengaduk dengan benar
  4. **Pembumbuan**: Tambahkan bumbu pada saat yang tepat
- **Batas Waktu**: Selesaikan memasak dalam 30 detik
- **Sukses/Gagal**: Timing yang sempurna dan teknik yang tepat diperlukan

### 🃏 **Mini-Game Blackjack**
- **Tujuan**: Mendekati angka 21 sedekat mungkin tanpa melewatinya
- **Taruhan**: Pasang taruhan menggunakan uang dalam game
- **Aturan**: Aturan Blackjack standar berlaku
  - Kartu wajah = 10 poin
  - As = 1 atau 11 poin
  - Kartu angka = nilai muka
- **Aksi**: Hit, Stand, atau Double Down
- **Dealer**: Dealer harus hit pada 16 dan stand pada 17

### ♟️ **Mini-Game Catur**
- **Permainan Catur Lengkap**: Implementasi lengkap dengan semua bidak
- **Level Kesulitan**: Pilih lawan AI Mudah, Sedang, atau Sulit
- **Sistem Taruhan**: Pertaruhkan uang pada pertandingan catur Anda
- **Fitur**:
  - Gerakan bidak catur dan aturan yang tepat
  - Castling, En Passant, dan Promosi Pion
  - Deteksi Skak dan Skakmat
  - Validasi gerakan dan highlighting
  - Lawan AI dengan berbagai level kesulitan

### 🐓 **Mini-Game Sabung Ayam**
- **Pemilihan Ayam**: Pilih dari 4 jenis ayam yang berbeda:
  - **Rambo**: Stat seimbang (Serangan: 15, Pertahanan: 12, Kecepatan: 10)
  - **Udin**: Serangan tinggi, pertahanan rendah (Serangan: 18, Pertahanan: 8, Kecepatan: 14)
  - **Dark Brown**: Build tank (pertahanan lebih tinggi)
  - **Light Brown**: Fokus pada kecepatan
- **Sistem Pertarungan**: Pertarungan berbasis giliran dengan manajemen kesehatan
- **Taruhan**: Pertaruhkan uang pada ayam pilihan Anda
- **Animasi**: Sprite ayam beranimasi selama pertarungan

### 📜 **Sistem Quest**
- **Quest Berdasarkan Cerita**: Ikuti alur cerita utama
- **Jurnal Quest**: Lacak quest aktif dan yang sudah selesai

### 🗺️ **Eksplorasi Dunia**
- **Peta Dunia Terbuka**: Jelajahi berbagai area dan lokasi
- **Minimap**: Navigasi menggunakan minimap dalam game
- **Interior**: Masuk ke bangunan seperti rumah dan makam kastil
- **NPC**: Berinteraksi dengan berbagai karakter termasuk:
  - Tetua
  - Pedagang
  - Pandai Besi

### 💾 **Sistem Save**
- **Beberapa Slot Save**: Buat dan kelola beberapa save permainan
- **Auto-Save**: Game otomatis menyimpan progress
- **Cloud Save**: File save disimpan dengan integrasi Firebase
- **Load Game**: Lanjutkan dari titik save mana pun

### 🎵 **Audio & Pengaturan**
- **Musik Latar**: Musik atmosferik untuk area yang berbeda
- **Efek Suara**: Umpan balik audio untuk aksi dan interaksi
- **Kontrol Volume**: Kontrol terpisah untuk musik dan SFX
- **Menu Pengaturan**: Sesuaikan preferensi audio

### 🎬 **Elemen Cerita**
- **Cutscene**: Urutan cerita beranimasi
- **Potret Karakter**: Representasi visual karakter dalam dialog
- **Beberapa Ending**: Percabangan cerita berdasarkan pilihan pemain
- **Sistem Kredit**: Kredit lengkap dan kesimpulan cerita

---

## 🛠️ **Fitur Teknis**

- **React 19.1.0** dengan hooks modern dan context API
- **Vite** untuk pengembangan dan building yang cepat
- Integrasi **Firebase** untuk autentikasi pengguna dan data save
- **Framer Motion** untuk animasi yang halus
- **React Router** untuk navigasi
- **Tailwind CSS** untuk styling
- **Chess.js & Stockfish.js** untuk logika permainan catur

---

## 🚀 **Memulai**

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```

3. **Build untuk Production**:
   ```bash
   npm run build
   ```

4. **Preview Production Build**:
   ```bash
   npm run preview
   ```

---

*Mulailah petualangan epik di The Forgotten Chronicle - di mana pertanian, strategi, dan bercerita bersatu dalam pengalaman gaming yang tak terlupakan!*

