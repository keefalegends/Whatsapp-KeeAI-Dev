# KeeAI - WhatsApp

KeeAI adalah asisten chatbot WhatsApp pribadi yang cerdas dan responsif, dibangun dengan menggunakan Node.js, `whatsapp-web.js`, serta ditenagai oleh **Google Gemini AI**.

## Fitur Utama

- **Integrasi Gemini AI**: Mampu menjawab berbagai pertanyaan umum secara cerdas menggunakan model `gemini-2.5-flash`.
- **Auto-Reply Perintah**: Menjawab perintah berbasis teks.
- **Bebas Spam**: Hanya membalas pesan yang diawali dengan awalan perintah `!`.
- **Session Auth Terintegrasi**: Menyimpan sesi WhatsApp secara lokal agar tidak perlu berulang kali melakukan scan QR code.

## Daftar Perintah

- `!ping`: Cek konektivitas dan status keaktifan bot.
- `!menu`: Menampilkan daftar menu dan perintah yang tersedia.
- `!info`: Penjelasan singkat tentang KeeAI beserta sifat yang sedang aktif.
- `!sifat <santai/toxic/formal>`: Mengubah kepribadian/sifat respon bot secara real-time.
- `!tanya <pertanyaan>` atau `!ai <pertanyaan>`: Bertanya secara langsung ke Gemini AI.

## Cara Menjalankan

1. Pastikan Anda sudah menginstal Node.js di komputer Anda.
2. Jalankan perintah install dependency:
   ```bash
   npm install
   ```
3. Konfigurasi API Key:
   - Duplikat atau ubah file `.env` yang ada di root directory.
   - Isi variabel `GEMINI_API_KEY` dengan API Key Gemini Anda (Bisa didapatkan gratis di [Google AI Studio](https://aistudio.google.com/)).
4. Jalankan aplikasi bot:
   ```bash
   node index.js
   ```
5. Scan QR Code yang muncul di terminal (atau via browser yang terbuka otomatis) menggunakan aplikasi WhatsApp di handphone Anda.
