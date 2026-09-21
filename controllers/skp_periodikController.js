// controllers/skpPeriodikController.js
const skpPeriodikModel = require('../models/skp_periodikModel');
const kinerjaModel = require('../models/kinerjaModel');

// ============================
// HELPER
// ============================
const isAdminLike = (role) => role === 'admin' || role === 'developer';

function parseTarget(target) {
  if (!target) return { nilai: '', satuan: '' };
  const trimmed = String(target).trim();
  const match = trimmed.match(/^([\d.,]+)\s*(.*)$/);
  if (match) return { nilai: match[1], satuan: match[2] || '' };
  return { nilai: trimmed, satuan: '' };
}

// ============================
// 1. GET ALL DATA
// ============================
exports.getAllData = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Belum login' });
    }
    const { nip: userNip, role } = req.session.user;
    const bulan = req.query.bulan;
    const tahun = req.query.tahun;
    const filterNip = req.query.nip;

    // Ambil semua dari MySQL
    let items = await skpPeriodikModel.getAll();

    // ✅ Filter pake periode_bulan & periode_tahun
    if (bulan) items = items.filter(i => String(i.periode_bulan) === String(bulan));
    if (tahun) items = items.filter(i => String(i.periode_tahun) === String(tahun));

    if (!isAdminLike(role)) {
      items = items.filter(i => i.nip === userNip);
    } else if (filterNip) {
      items = items.filter(i => i.nip === filterNip);
    }

    res.json({ success: true, data: items });
  } catch (error) {
    console.error('❌ Error getAllData:', error);
    res.status(500).json({ success: false, message: error.message, data: [] });
  }
};

// ============================
// 2. GET PERIODE
// ============================
exports.getPeriode = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Belum login' });
    }
    const { nip: userNip, role } = req.session.user;
    const bulan = req.params.bulan;
    const tahun = req.params.tahun;

    let items = await skpPeriodikModel.getByPeriode(bulan, tahun);
    if (!isAdminLike(role)) {
      items = items.filter(i => i.nip === userNip);
    }

    res.json({ success: true, data: { bulan, tahun, hasil_kerja: items } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================
// 3. TAMBAH PERIODE
// ============================
exports.tambahPeriode = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Belum login' });
    }
    res.status(201).json({ success: true, message: 'Periode otomatis dibuat saat menambah hasil kerja' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ============================
// 4. HAPUS PERIODE
// ============================
exports.hapusPeriode = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Belum login' });
    }
    const bulan = req.params.bulan;
    const tahun = req.params.tahun;

    const items = await skpPeriodikModel.getByPeriode(bulan, tahun);
    for (const item of items) {
      await skpPeriodikModel.delete(item.id);
    }

    res.json({ success: true, message: 'Periode berhasil dihapus' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ============================
// 5. TAMBAH HASIL KERJA
// ============================
exports.tambahHasilKerja = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Belum login' });
    }
    const userNip = req.session.user.nip;
    const bulan = req.params.bulan;
    const tahun = req.params.tahun;
    const body = req.body || {};

    const skp_tahunan_id = body.skp_tahunan_id || null;
    const indikator = body.indikator_kinerja_individu || '';
    const targetRaw = body.target_bulanan || '';
    const aksiRaw = body.rencana_aksi || [];
    const jenis = body.jenis || 'Organisasi';
    const manualData = body.manualData || {};

    let itemData = {};

    if (skp_tahunan_id) {
      const skpTahunan = await kinerjaModel.getById(skp_tahunan_id);
      if (!skpTahunan) {
        return res.status(404).json({ success: false, message: 'Data SKP Tahunan tidak ditemukan' });
      }
      itemData.kategori = skpTahunan.tipe || 'Utama';
      itemData.rencana_hasil_kerja_pimpinan = skpTahunan.rhk_pimpinan || '';
      itemData.rencana_hasil_kerja = skpTahunan.rencana_hasil_kerja || '';
      itemData.aspek = skpTahunan.aspek || '';
    } else {
      itemData.kategori = manualData.kategori || 'Utama';
      itemData.rencana_hasil_kerja_pimpinan = manualData.rencana_hasil_kerja_pimpinan || '';
      itemData.rencana_hasil_kerja = manualData.rencana_hasil_kerja || '';
      itemData.aspek = manualData.aspek || '';
    }

    itemData.indikator_kinerja_individu = indikator || manualData.indikator_kinerja_individu || '';
    itemData.jenis = jenis || manualData.jenis || 'Organisasi';
    itemData.nip = userNip;

    // ✅ UBAH: pake periode_bulan & periode_tahun
    itemData.periode_bulan = bulan;
    itemData.periode_tahun = tahun;

    // Target
    let targetObj = { nilai: '', satuan: '' };
    if (targetRaw) {
      if (typeof targetRaw === 'object' && targetRaw.nilai !== undefined) {
        targetObj = { nilai: targetRaw.nilai || '', satuan: targetRaw.satuan || '' };
      } else if (typeof targetRaw === 'string') {
        targetObj = parseTarget(targetRaw);
      } else if (typeof targetRaw === 'number') {
        targetObj = { nilai: String(targetRaw), satuan: '' };
      }
    }
    if (!targetObj.nilai && !targetObj.satuan) {
      targetObj = { nilai: '0', satuan: '' };
    }
    itemData.target_bulanan = targetObj;

    // Rencana Aksi
    let aksiArray = [];
    if (aksiRaw !== undefined && aksiRaw !== null) {
      if (Array.isArray(aksiRaw)) {
        aksiArray = aksiRaw.filter(item => item && String(item).trim() !== '');
      } else if (typeof aksiRaw === 'string') {
        aksiArray = aksiRaw.split('\n').filter(s => s.trim() !== '');
      } else {
        aksiArray = [String(aksiRaw)];
      }
    }
    if (aksiArray.length === 0) aksiArray = [' - '];
    itemData.rencana_aksi = aksiArray;

    // Validasi
    if (!itemData.indikator_kinerja_individu || itemData.indikator_kinerja_individu.trim() === '') {
      return res.status(400).json({ success: false, message: 'Indikator Kinerja Individu wajib diisi' });
    }
    if (!itemData.target_bulanan || !itemData.target_bulanan.nilai) {
      return res.status(400).json({ success: false, message: 'Target Bulanan wajib diisi' });
    }

    const hasilKerja = await skpPeriodikModel.create(itemData);
    res.status(201).json({ success: true, message: 'Hasil kerja berhasil ditambahkan', data: hasilKerja });
  } catch (error) {
    console.error('❌ Error di tambahHasilKerja:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ============================
// 6. EDIT HASIL KERJA
// ============================
exports.editHasilKerja = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Belum login' });
    }
    const { nip: userNip, role } = req.session.user;
    const id = req.params.id;

    const item = await skpPeriodikModel.getById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Item tidak ditemukan' });

    if (!isAdminLike(role) && item.nip !== userNip) {
      return res.status(403).json({ success: false, message: 'Anda tidak berhak mengedit data ini' });
    }

    let updateData = { ...req.body };

    // Normalisasi rencana_aksi
    if (updateData.rencana_aksi !== undefined && updateData.rencana_aksi !== null) {
      if (Array.isArray(updateData.rencana_aksi)) {
        updateData.rencana_aksi = updateData.rencana_aksi.filter(s => s && String(s).trim() !== '');
        if (updateData.rencana_aksi.length === 0) updateData.rencana_aksi = [' - '];
      } else if (typeof updateData.rencana_aksi === 'string') {
        const lines = updateData.rencana_aksi.split('\n').filter(s => s.trim() !== '');
        updateData.rencana_aksi = lines.length > 0 ? lines : [' - '];
      } else {
        updateData.rencana_aksi = [String(updateData.rencana_aksi)];
      }
    }

    // Normalisasi target_bulanan
    if (updateData.target_bulanan) {
      if (typeof updateData.target_bulanan === 'string') {
        updateData.target_bulanan = parseTarget(updateData.target_bulanan);
      }
    }

    const updated = await skpPeriodikModel.update(id, updateData);
    res.json({ success: true, message: 'Hasil kerja berhasil diupdate', data: updated });
  } catch (error) {
    console.error('❌ Error di editHasilKerja:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ============================
// 7. HAPUS HASIL KERJA
// ============================
exports.hapusHasilKerja = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Belum login' });
    }
    const { nip: userNip, role } = req.session.user;
    const id = req.params.id;

    const item = await skpPeriodikModel.getById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Item tidak ditemukan' });

    if (!isAdminLike(role) && item.nip !== userNip) {
      return res.status(403).json({ success: false, message: 'Anda tidak berhak menghapus data ini' });
    }

    await skpPeriodikModel.delete(id);
    res.json({ success: true, message: 'Hasil kerja berhasil dihapus' });
  } catch (error) {
    console.error('❌ Error di hapusHasilKerja:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ============================
// 8. GET SKP TAHUNAN LIST (dropdown)
// ============================
exports.getSkpTahunanList = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Belum login' });
    }
    const { nip: userNip, role } = req.session.user;

    let list = await kinerjaModel.getAll();

    if (!isAdminLike(role)) {
      list = list.filter(item => item.nip === userNip);
    } else if (req.query.nip) {
      list = list.filter(item => item.nip === req.query.nip);
    }

    const result = list.map(item => ({
      id: item.id,
      rhk_pimpinan: item.rhk_pimpinan || '',
      rencana_hasil_kerja: item.rencana_hasil_kerja || '',
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Error di getSkpTahunanList:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================
// 9. GET SKP TAHUNAN BY ID
// ============================
exports.getSkpTahunanById = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Belum login' });
    }
    const { nip: userNip, role } = req.session.user;
    const id = req.params.id;

    const item = await kinerjaModel.getById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Data SKP Tahunan tidak ditemukan' });

    if (!isAdminLike(role) && item.nip !== userNip) {
      return res.status(403).json({ success: false, message: 'Anda tidak berhak mengakses data ini' });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================
// 10. GET ALL (untuk admin dengan filter)
// ============================
exports.getAll = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Belum login' });
    }

    const { role, nip } = req.session.user;
    const { tahun, orgId, jabatanId, nip: queryNip } = req.query;

    if (isAdminLike(role)) {
      if (queryNip && tahun) return res.json(await kinerjaModel.getByUserAndTahun(queryNip, tahun));
      if (queryNip) return res.json(await kinerjaModel.getByNip(queryNip));
      if (tahun && orgId && jabatanId) return res.json(await kinerjaModel.getByOrgJabatan(tahun, orgId, jabatanId));
      if (tahun) return res.json(await kinerjaModel.summaryByOrgJabatan(tahun));
      return res.json(await kinerjaModel.getAll());
    }

    if (tahun) return res.json(await kinerjaModel.getByUserAndTahun(nip, tahun));
    return res.json(await kinerjaModel.getByNip(nip));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
