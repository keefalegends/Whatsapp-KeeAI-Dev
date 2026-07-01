require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inisialisasi Gemini AI secara aman
const apiKey = process.env.GEMINI_API_KEY;
let model = null;

if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
    const genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ 
        model: 'gemini-3.5-flash',
        generationConfig: {
            maxOutputTokens: 150,
            thinkingConfig: {
                thinkingLevel: 'MINIMAL'
            }
        },
        systemInstruction: 'Kamu adalah KeeAI, bot WhatsApp yang ramah, santai, dan TO THE POINT. Jawab pertanyaan user maksimal dalam 2-3 kalimat saja. Jangan bertele-tele.'
    });
} else {
    console.warn('⚠️ Peringatan: GEMINI_API_KEY belum dikonfigurasi di file .env. Fitur AI tidak akan berfungsi.');
}

// 1. Inisialisasi client dengan argumen Puppeteer yang lebih stabil
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false, // <--- KITA UBAH JADI FALSE BIAR BROWSER-NYA MUNCUL!
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    },
    // Mengelabui WhatsApp Web agar mengira ini Chrome asli versi desktop biasa
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
});

// 2. Generate QR Code
client.on('qr', (qr) => {
    console.log('SCAN QR CODE INI PAKAI WHATSAPP KAMU:');
    qrcode.generate(qr, { small: true });
});

// 3. Notifikasi Sukses
client.on('ready', () => {
    console.log('KeeAI Berhasil Konek! Bot siap menerima perintah.');
});

// 4. Logika Auto-Reply yang Lebih Aman (Menggunakan Async/Await)
client.on('message', async (msg) => {
    try {
        const pesan = msg.body.toLowerCase();

        // Hanya tanggapi pesan yang dimulai dengan awalan perintah (!)
        if (!pesan.startsWith('!')) return;

        if (pesan === '!ping') {
            await msg.reply('Pong! KeeAI aktif, bro. 😎');
        } 
        else if (pesan === '!menu') {
            await msg.reply(
                `=== MENU KEEAI ===\n\n` +
                `Silahkan pilih perintah berikut:\n` +
                `1. *!ping* -> Cek status bot\n` +
                `2. *!info* -> Tentang KeeAI\n` +
                `3. *!tanya <pertanyaan>* atau *!ai <pertanyaan>* -> Tanya Gemini AI`
            );
        } 
        else if (pesan === '!info') {
            await msg.reply('KeeAI adalah asisten chatbot WhatsApp pribadi yang cerdas dan siap membantumu kapan saja!');
        } 
        else if (pesan.startsWith('!tanya ') || pesan.startsWith('!ai ')) {
            const commandLength = pesan.startsWith('!tanya ') ? 7 : 4;
            const pertanyaan = msg.body.slice(commandLength).trim();

            if (!pertanyaan) {
                await msg.reply('Tuliskan pertanyaan kamu setelah perintah, bro. Contoh: *!ai cara membuat kopi*');
                return;
            }

            if (!model) {
                await msg.reply('⚠️ Fitur AI belum siap! Harap isi `GEMINI_API_KEY` terlebih dahulu di file `.env`.');
                return;
            }

            try {
                // Generate respon menggunakan model Gemini 3.5 Flash
                const response = await model.generateContent(pertanyaan);
                const replyText = response.response.text();
                await msg.reply(replyText);
            } catch (aiError) {
                console.error('Gemini API Error:', aiError);
                await msg.reply('Maaf bro, terjadi kesalahan saat menghubungi AI. Coba lagi nanti ya.');
            }
        }
        // Respon jika perintah yang diawali '!' tidak dikenali
        else {
            await msg.reply('Maaf bro, perintah tidak dikenali. Ketik *!menu* untuk melihat daftar perintah.');
        }
    } catch (error) {
        console.error('Gagal membalas pesan:', error);
    }
});

// SOLUSI BUG 2: Menangkap error background agar Node.js tidak force close / stuck
process.on('unhandledRejection', (reason, p) => {
    console.log('Terjadi interupsi sistem (browser reload), tapi bot tetap bertahan hidup. Lanjut chat aja.');
});

// Jalankan sistem
client.initialize();