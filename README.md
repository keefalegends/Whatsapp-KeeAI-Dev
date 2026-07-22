# KeeAI

KeeAI adalah chatbot WhatsApp pribadi berbasis Node.js. KeeAI dapat menjalankan perintah sederhana dan meneruskan pertanyaan ke model AI melalui **9router**, yaitu API yang kompatibel dengan format OpenAI.

## Fitur Utama

- **Integrasi 9router**: Menggunakan satu endpoint OpenAI-compatible untuk mengakses model AI atau combo model yang tersedia di 9router.
- **Auto-Reply Perintah**: Menjawab perintah berbasis teks.
- **Bebas Spam**: Hanya membalas pesan yang diawali dengan awalan perintah `!`.
- **Session Auth Terintegrasi**: Menyimpan sesi WhatsApp secara lokal sehingga tidak perlu berulang kali memindai QR code.
- **Personality Dinamis**: Mengubah gaya respons bot secara real-time.
- **Typing Indicator**: Menampilkan status sedang mengetik saat menghubungi AI.

## Daftar Perintah

- `!ping`: Mengecek konektivitas dan status bot.
- `!menu`: Menampilkan daftar perintah yang tersedia.
- `!info`: Menampilkan informasi KeeAI dan personality yang sedang aktif.
- `!sifat <santai/toxic/formal>`: Mengubah personality KeeAI.
- `!personality <santai/toxic/formal>`: Alias dari `!sifat`.
- `!tanya <pertanyaan>`: Mengirim pertanyaan ke AI melalui 9router.
- `!ai <pertanyaan>`: Alias dari `!tanya`.

Contoh:

```text
!ping
!sifat formal
!ai jelaskan cara kerja reservation hotel
```

## Personality

- **santai**: Ramah, santai, kocak, dan menggunakan bahasa gaul.
- **toxic**: Sarkastik dan suka nge-roast, tetapi tetap menghibur.
- **formal**: Profesional, sopan, dan menggunakan bahasa baku.

## Persyaratan

- Node.js
- Akun/API key 9router
- WhatsApp di ponsel untuk memindai QR code saat login pertama kali

## Instalasi

1. Clone repository ini, lalu masuk ke folder project:

   ```bash
   git clone https://github.com/keefalegends/Whatsapp-KeeAI-Dev.git
   cd Whatsapp-KeeAI-Dev
   ```

2. Install dependency:

   ```bash
   npm install
   ```

3. Buat file `.env` di root project dan isi konfigurasi 9router:

   ```env
   ROUTER_BASE_URL=http://your-9router-host:port/v1
   ROUTER_API_KEY=your-9router-api-key
   ROUTER_MODEL=free
   ```

   `ROUTER_MODEL` dapat diganti dengan model ID yang tersedia di 9router, misalnya `free`, `ag/gemini-3-flash`, atau model combo milikmu.

   Jangan commit atau membagikan API key. File `.env` sudah masuk `.gitignore`.

## Menjalankan Bot

Jalankan mode normal dengan:

```bash
npm start
```

Atau langsung menggunakan Node.js:

```bash
node index.js
```

Pada login pertama, QR code akan muncul di terminal. Pindai QR code tersebut menggunakan aplikasi WhatsApp di ponsel. Session berikutnya disimpan di folder `.wwebjs_auth/`.

## Testing

Cek syntax JavaScript dengan:

```bash
npm test
```

## Struktur Konfigurasi

- `index.js`: Logic utama client WhatsApp, command handler, personality, dan integrasi 9router.
- `.env`: Konfigurasi endpoint, API key, dan model 9router. File ini tidak di-commit.
- `.wwebjs_auth/`: Data session WhatsApp lokal.
- `.wwebjs_cache/`: Cache WhatsApp Web lokal.

## Catatan

- Bot hanya merespons pesan yang diawali `!`.
- Model default adalah `free` jika `ROUTER_MODEL` tidak diisi.
- Periksa model ID yang tersedia langsung dari server 9router sebelum mengganti konfigurasi.
- Jangan membagikan API key di chat, screenshot, commit, atau repository publik.

## Repository

Repository utama:

<https://github.com/keefalegends/Whatsapp-KeeAI-Dev>

Jika URL lama masih digunakan pada konfigurasi lokal, GitHub akan mengarahkannya ke repository baru tersebut.

## Lisensi

ISC
