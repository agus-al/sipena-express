const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: apiKey: process.env.GROQ_API_KEY });

/**
 * Fungsi untuk memproses TUPOKSI menjadi JSON mentah (String)
 * @param {string} tupoksiText - Input teks TUPOKSI dari user
 */
async function prosesSkpAi(tupoksiText) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Anda adalah sistem pakar untuk Sipena. Tugas Anda adalah mengubah TUPOKSI pegawai menjadi draf SKP Tahunan.
          Anda WAJIB memberikan output JSON dengan format persis seperti ini:
          {
            "tupoksi": "teks_tupoksi_input",
            "skp_tahunan": "Hasil rumusan SKP di sini",
            "score": "88%"
          }
          Jangan berikan teks pembuka atau penutup lain, langsung berikan JSON saja.`
        },
        {
          role: "user",
          content: `Proses TUPOKSI ini: "${tupoksiText}"`
        },
      ],
      model: "openai/gpt-oss-120b",
      // Memastikan output berupa JSON murni
      response_format: { type: "json_object" } 
    });

    // Ini adalah String JSON mentah, siap dimasukkan ke kolom database
    const jsonMentah = chatCompletion.choices[0] && chatCompletion.choices[0].message
  ? chatCompletion.choices[0].message.content
  : null;
    
    return jsonMentah;

  } catch (error) {
    console.error("Terjadi kesalahan pada modul AI:", error.message);
    // Return json error standar jika koneksi gagal
    return JSON.stringify({
      tupoksi: tupoksiText,
      skp_tahunan: "Gagal diproses AI",
      score: "0%"
    });
  }
}

module.exports = { prosesSkpAi };
