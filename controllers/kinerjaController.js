// controllers/kinerjaController.js
const model = require('../models/kinerjaModel');
const pegawaiModel = require('../models/pegawaiModel');
const tupoksiModel = require('../models/tupoksiModel');
const { prosesSkpAi } = require('../ai_sipena.js');

// ============================
// HELPER
// ============================
const isLoggedIn = (req, res) => {
  if (!req.session || !req.session.user) {
    res.status(401).json({ message: 'Belum login' });
    return false;
  }
  return true;
};

const isAdminLike = (role) => role === 'admin' || role === 'developer';

const cariTupoksiOtomatis = async (nip) => {
  try {
    const pegawai = await pegawaiModel.getByNip(nip);
    if (!pegawai || !pegawai.jabatan) return null;

    const semuaTupoksi = await tupoksiModel.getAll();
    const tumpukanTupoksi = semuaTupoksi.find(t =>
      t.jabatan && t.jabatan.trim().toLowerCase() === pegawai.jabatan.trim().toLowerCase()
    );
    if (!tumpukanTupoksi || !tumpukanTupoksi.tugas) return null;

    let tugasArr = tumpukanTupoksi.tugas;
    if (typeof tugasArr === 'string') {
      try { tugasArr = JSON.parse(tugasArr); } catch (e) { return null; }
    }

    const rincianTugas = tugasArr.find(tgs => tgs.tipe && tgs.tipe.includes('Rincian'));
    if (rincianTugas && rincianTugas.isi && rincianTugas.isi.length > 0) {
      return rincianTugas.isi.join(' ');
    }

    const ringkasanTugas = tugasArr.find(tgs => tgs.tipe && tgs.tipe.includes('Ringkasan'));
    if (ringkasanTugas && ringkasanTugas.isi && ringkasanTugas.isi.length > 0) {
      return ringkasanTugas.isi.join(' ');
    }

    return null;
  } catch (err) {
    console.error('Gagal membaca database TUPOKSI otomatis:', err.message);
    return null;
  }
};

// ============================
// GET ALL
// ============================
exports.getAll = async (req, res) => {
  if (!isLoggedIn(req, res)) return;
  try {
    const { role, nip } = req.session.user;
    const { tahun, orgId, jabatanId, nip: queryNip } = req.query;

    if (isAdminLike(role)) {
      if (queryNip) {
        if (tahun) return res.json(await model.getByUserAndTahun(queryNip, tahun));
        return res.json(await model.getByNip(queryNip));
      }
      if (tahun && orgId && jabatanId) return res.json(await model.getByOrgJabatan(tahun, orgId, jabatanId));
      if (tahun) return res.json(await model.summaryByOrgJabatan(tahun));
      return res.json(await model.getAll());
    }

    if (tahun) return res.json(await model.getByUserAndTahun(nip, tahun));
    return res.json(await model.getByNip(nip));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBySkpId = async (req, res) => {
  if (!isLoggedIn(req, res)) return;
  try {
    return res.json(await model.getBySkpId(req.params.skp_id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  if (!isLoggedIn(req, res)) return;
  try {
    const data = await model.getById(req.params.id);
    if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
    return res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  if (!isLoggedIn(req, res)) return;
  try {
    const { nip, orgId, jabatanId } = req.session.user;
    const {
      skp_id, tipe, rhk_pimpinan, rencana_hasil_kerja, aspek, indikator,
      target, satuan, tahun, realisasi, nilai, catatan, status, tupoksi
    } = req.body;

    if (!rencana_hasil_kerja || !aspek || !indikator || !target) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const baru = await model.create({
      nip: nip || '',
      orgId: orgId || '',
      jabatanId: jabatanId || '',
      tahun: tahun || new Date().getFullYear(),
      skp_id: skp_id || '',
      tipe: tipe || 'Utama',
      rhk_pimpinan: rhk_pimpinan || '',
      rencana_hasil_kerja: rencana_hasil_kerja || '',
      aspek: aspek || '',
      indikator: indikator || '',
      target: target || '',
      satuan: satuan || '',
      realisasi: realisasi || '',
      nilai: nilai || '',
      catatan: catatan || '',
      status: status || 'draft',
      tupoksi: tupoksi || '',
      score: ''
    });

    return res.status(201).json(baru);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  if (!isLoggedIn(req, res)) return;
  try {
    const updated = await model.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Data tidak ditemukan' });
    return res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  if (!isLoggedIn(req, res)) return;
  try {
    const deleted = await model.delete(req.params.id);
    return res.json({ message: 'Data berhasil dihapus', data: deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBySkpId = async (req, res) => {
  if (!isLoggedIn(req, res)) return;
  try {
    const deleted = await model.deleteBySkpId(req.params.skp_id);
    return res.json({ message: 'Data berdasarkan SKP ID berhasil dihapus', data: deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteByUserAndTahun = async (req, res) => {
  if (!isLoggedIn(req, res)) return;
  try {
    const { nip, tahun } = req.body;
    if (!nip || !tahun) return res.status(400).json({ message: 'nip dan tahun wajib diisi' });
    const deleted = await model.deleteByUserAndTahun(nip, tahun);
    return res.json({ message: 'Data user dan tahun berhasil dihapus', data: deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.summaryByOrgJabatan = async (req, res) => {
  if (!isLoggedIn(req, res)) return;
  try {
    const { role } = req.session.user;
    if (!isAdminLike(role)) return res.status(403).json({ message: 'Akses ditolak' });

    const { tahun } = req.query;
    if (!tahun) return res.status(400).json({ message: 'Parameter tahun wajib diisi' });

    return res.json(await model.summaryByOrgJabatan(tahun));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============================
// AI: NILAI SATU DATA (✅ DIPERBAIKI)
// ============================
exports.nilaiSatuData = async (req, res) => {
  if (!isLoggedIn(req, res)) return;

  try {
    const { id } = req.params;
    const data = await model.getById(id);
    if (!data) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });

    let tupoksiTeks = data.tupoksi || await cariTupoksiOtomatis(data.nip);
    if (!tupoksiTeks) {
      return res.status(400).json({
        success: false,
        message: 'Gagal: Data TUPOKSI tidak ditemukan di database untuk NIP user ini.'
      });
    }

    // Panggil AI
    const jsonMentah = await prosesSkpAi(tupoksiTeks);
    console.log('🔍 Response mentah dari AI:', jsonMentah);  // ← DEBUG

    let parsed;
    try {
      parsed = JSON.parse(jsonMentah);
    } catch (e) {
      console.error('❌ Gagal parse JSON dari AI:', e.message);
      parsed = { skp_tahunan: 'Gagal parse', score: '0%' };
    }

    console.log('🔍 Hasil parse:', parsed);  // ← DEBUG

    // ✅ Ambil score dengan hati-hati
    let score = '0%';
    if (parsed && parsed.score) {
      // Kalo score berupa angka (misal 88), ubah jadi "88%"
      if (typeof parsed.score === 'number') {
        score = parsed.score + '%';
      } else {
        score = String(parsed.score);
      }
    }

    // ✅ Pastikan skp_tahunan berupa string
    let skpTahunan = '';
    if (parsed && parsed.skp_tahunan) {
      skpTahunan = typeof parsed.skp_tahunan === 'string'
        ? parsed.skp_tahunan
        : JSON.stringify(parsed.skp_tahunan);
    }

    console.log('🔍 Score yang mau disimpan:', score);  // ← DEBUG

    // Update ke MySQL
    const updated = await model.update(id, {
      score: score,
      tupoksi: data.tupoksi ? data.tupoksi : tupoksiTeks,
      skp_tahunan_ai: skpTahunan
    });

    console.log('🔍 Hasil update:', updated ? updated.toJSON() : null);  // ← DEBUG

    res.json({
      success: true,
      message: 'Penilaian otomatis berhasil!',
      data: {
        id: updated.id,
        tupoksi: updated.tupoksi,
        skp_tahunan: updated.rencana_hasil_kerja,
        score: updated.score  // ← INI yang dibaca frontend
      }
    });
  } catch (error) {
    console.error('❌ Error di nilaiSatuData:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================
// AI: NILAI SEMUA DATA (✅ DIPERBAIKI)
// ============================
exports.nilaiSemuaData = async (req, res) => {
  if (!isLoggedIn(req, res)) return;

  try {
    const allData = await model.getAll();
    let hasil = [];

    for (let item of allData) {
      if (item.score && item.score !== '0%') continue;  // ← skip kalo udah ada score

      let tupoksiTeks = item.tupoksi || await cariTupoksiOtomatis(item.nip);
      if (!tupoksiTeks) continue;

      try {
        const jsonMentah = await prosesSkpAi(tupoksiTeks);
        let parsed;
        try { parsed = JSON.parse(jsonMentah); } catch (e) { parsed = {}; }

        // ✅ Normalisasi score
        let score = '0%';
        if (parsed && parsed.score) {
          score = typeof parsed.score === 'number' ? parsed.score + '%' : String(parsed.score);
        }

        // ✅ Normalisasi skp_tahunan
        let skpTahunan = '';
        if (parsed && parsed.skp_tahunan) {
          skpTahunan = typeof parsed.skp_tahunan === 'string'
            ? parsed.skp_tahunan
            : JSON.stringify(parsed.skp_tahunan);
        }

        await model.update(item.id, {
          score: score,
          tupoksi: item.tupoksi ? item.tupoksi : tupoksiTeks,
          skp_tahunan_ai: skpTahunan
        });

        hasil.push({ id: item.id, score: score });
      } catch (err) {
        console.error(`Gagal proses ID ${item.id}:`, err.message);
      }
    }

    res.json({
      success: true,
      message: `Berhasil memproses ${hasil.length} data secara otomatis`,
      data: hasil
    });
  } catch (error) {
    console.error('Error di nilaiSemuaData:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
