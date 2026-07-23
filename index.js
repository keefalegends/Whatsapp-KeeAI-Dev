require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const OpenAI = require('openai');

// Inisialisasi 9router API (OpenAI Compatible) secara aman
const apiKey = process.env.ROUTER_API_KEY;
const baseURL = process.env.ROUTER_BASE_URL || '';
let openai = null;
let currentPersonality = 'santai'; // Sifat default bot

async function requestAIResponse({ model, messages, maxTokens }) {
    console.log(`[AI] Request model=${model}, max_tokens=${maxTokens}`);
    const response = await fetch(`${baseURL.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model,
            messages,
            max_tokens: maxTokens,
            stream: false
        })
    });

    const rawText = await response.text();
    console.log(`[AI] HTTP ${response.status}, response_length=${rawText.length}`);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${rawText}`);
    }

    const trimmed = rawText.trim();

    // 9router kadang mengembalikan format SSE walaupun stream=false.
    // Ambil content dari chunk SSE bila itu terjadi.
    if (trimmed.startsWith('data:')) {
        const chunks = trimmed
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.startsWith('data:') && line !== 'data: [DONE]');

        let content = '';
        let finishReason = null;

        for (const chunkLine of chunks) {
            const payload = chunkLine.slice(5).trim();
            if (!payload) continue;

            const parsed = JSON.parse(payload);
            const choice = parsed.choices?.[0];
            const deltaContent = choice?.delta?.content;

            if (deltaContent) {
                content += deltaContent;
            }

            if (choice?.finish_reason) {
                finishReason = choice.finish_reason;
            }
        }

        return {
            content: content.trim(),
            finishReason,
            rawText
        };
    }

    const parsed = JSON.parse(trimmed);
    return {
        content: parsed.choices?.[0]?.message?.content?.trim() || '',
        finishReason: parsed.choices?.[0]?.finish_reason || null,
        rawText
    };
}

const personalities = {
    santai: 'Kamu adalah KeeAI, bot WhatsApp yang ramah, santai, kocak, dan gaul. Jawab singkat maksimal 2 kalimat menggunakan bahasa santai/lu-gue.',
    toxic: 'Kamu adalah KeeAI, bot WhatsApp yang toxic, suka nge-roast, sarkastik, ketus, tapi tetap lucu dan menghibur. Jawab singkat maksimal 2 kalimat pakai bahasa gaul dan agak ngegas.',
    formal: 'Kamu adalah KeeAI, asisten chatbot WhatsApp yang profesional, formal, sopan, dan to the point. Jawab maksimal dalam 2-3 kalimat menggunakan bahasa baku.'
};

if (apiKey && apiKey !== 'YOUR_API_KEY_HERE') {
    openai = new OpenAI({
        apiKey: apiKey,
        baseURL: baseURL
    });
} else {
    console.warn('⚠️ Peringatan: ROUTER_API_KEY belum dikonfigurasi di file .env. Fitur AI tidak akan berfungsi.');
}

// 1. Inisialisasi client dengan argumen Puppeteer yang lebih stabil
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false, // <--- BROWSER-NYA MUNCUL
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
                `3. *!sifat <santai/toxic/formal>* -> Ubah kepribadian bot\n` +
                `4. *!tanya <pertanyaan>* atau *!ai <pertanyaan>* -> Tanya AI 9router`
            );
        } 
        else if (pesan === '!info') {
            await msg.reply(`KeeAI adalah asisten chatbot WhatsApp pribadi yang cerdas. Saat ini aku sedang bermode sifat *${currentPersonality}*!`);
        } 
        else if (pesan.startsWith('!sifat ') || pesan.startsWith('!personality ')) {
            const tipe = pesan.split(' ')[1];
            
            if (!tipe || !personalities[tipe]) {
                await msg.reply(
                    `⚠️ Pilihan sifat tidak valid!\n\n` +
                    `Gunakan perintah: *!sifat <tipe>*\n` +
                    `Pilihan tipe:\n` +
                    `- *santai* (Default, ramah & gaul)\n` +
                    `- *toxic* (Sarkastik, nge-roast & ngegas)\n` +
                    `- *formal* (Profesional, sopan & baku)`
                );
                return;
            }

            currentPersonality = tipe;
            await msg.reply(`Sifat KeeAI berhasil diubah menjadi *${tipe}*! Coba tanyakan sesuatu sekarang. 😎`);
        }
        else if (pesan.startsWith('!tanya ') || pesan.startsWith('!ai ')) {
            const commandLength = pesan.startsWith('!tanya ') ? 7 : 4;
            const pertanyaan = msg.body.slice(commandLength).trim();

            if (!pertanyaan) {
                await msg.reply('Tuliskan pertanyaan kamu setelah perintah, bro. Contoh: *!ai cara membuat kopi*');
                return;
            }

            if (!openai) {
                await msg.reply('⚠️ Fitur AI belum siap! Harap isi `ROUTER_API_KEY` terlebih dahulu di file `.env`.');
                return;
            }

            try {
                console.log(`[WhatsApp] AI command from ${msg.from}: ${msg.body}`);

                // Typing status is best-effort; continue to AI if WhatsApp Web fails.
                try {
                    const chat = await msg.getChat();
                    if (chat) {
                        await chat.sendStateTyping();
                    }
                } catch (typingErr) {
                    console.warn('[WhatsApp] Gagal menampilkan status mengetik:', typingErr.message);
                }

                const modelName = process.env.ROUTER_MODEL || 'free';
                console.log(`[AI] Using baseURL=${baseURL}, model=${modelName}`);

                // Generate respon menggunakan model via OpenAI SDK format ke 9router
                const messages = [
                    { role: 'system', content: personalities[currentPersonality] },
                    { role: 'user', content: pertanyaan }
                ];
                let aiResult = await requestAIResponse({
                    model: modelName,
                    messages,
                    maxTokens: 1024
                });

                let replyText = aiResult.content;

                // Beberapa model gratis dapat menghabiskan token untuk reasoning tanpa content.
                // Ulangi sekali dengan budget lebih besar agar bot tidak mengirim balasan kosong.
                if (!replyText) {
                    aiResult = await requestAIResponse({
                        model: modelName,
                        messages,
                        maxTokens: 2048
                    });
                    replyText = aiResult.content;
                }

                if (!replyText) {
                    console.error('9router returned empty content:', {
                        model: modelName,
                        finishReason: aiResult.finishReason,
                        preview: aiResult.rawText.slice(0, 500)
                    });
                    await msg.reply('Maaf bro, AI memberikan respon kosong. Coba tanya lagi ya.');
                    return;
                }
                await msg.reply(replyText);
            } catch (aiError) {
                console.error('9router API Error:', aiError);
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

// Error handler — log error asli agar bisa di-debug
process.on('unhandledRejection', (reason, p) => {
    console.error('[ERROR] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('[ERROR] Uncaught Exception:', err);
});

// Jalankan sistem
client.initialize();