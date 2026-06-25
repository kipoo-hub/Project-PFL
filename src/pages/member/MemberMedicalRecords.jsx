import React, { useState, useEffect } from 'react';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { medicalRecordService } from '../../lib/supabaseService';

export default function MemberMedicalRecords() {
  const { member } = useMemberAuth();

  const [records, setRecords] = useState([]);
  const [pets, setPets] = useState([]);
  const [years, setYears] = useState([]);
  
  // Filters
  const [selectedPet, setSelectedPet] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  // Modal Detail
  const [activeRecord, setActiveRecord] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMedicalRecords = async () => {
    const memberUser = JSON.parse(localStorage.getItem('memberUser'));
    if (!memberUser?.id) return;
    setLoading(true);
    setError(null);
    try {
      const list = await medicalRecordService.getByMemberId(memberUser.id);
      setRecords(list);

      // Extract unique pets
      const uniquePets = Array.from(new Set(list.map(r => r.petName))).filter(Boolean);
      setPets(uniquePets);

      // Extract unique years
      const uniqueYears = Array.from(new Set(list.map(r => {
        if (!r.date) return null;
        return r.date.split('-')[0];
      }))).filter(Boolean).sort((a, b) => b - a);
      setYears(uniqueYears);
    } catch (err) {
      setError('Gagal memuat rekam medis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicalRecords();
  }, []);

  // Filtering
  const filteredRecords = records.filter(r => {
    const matchPet = selectedPet === 'All' || r.petName?.toLowerCase() === selectedPet.toLowerCase();
    const matchYear = selectedYear === 'All' || (r.date && r.date.startsWith(selectedYear));
    return matchPet && matchYear;
  });

  const handleDownloadPDF = (record) => {
    alert(`Mengunduh Rekam Medis PDF untuk ${record.petName} (ID: ${record.id})...\nSimulasi unduhan berhasil diselesaikan.`);
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Memuat data...</div>;
  if (error) return <div className="p-8 text-center text-rose-500">{error}</div>;

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Riwayat Rekam Medis</h1>
        <p className="text-slate-500 text-sm mt-1">Lihat riwayat klinis lengkap, diagnosis dokter, dan resep obat peliharaan Anda.</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pilih Peliharaan:</span>
          <select 
            value={selectedPet}
            onChange={(e) => setSelectedPet(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500"
          >
            <option value="All">Semua Peliharaan</option>
            {pets.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tahun Kunjungan:</span>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500"
          >
            <option value="All">Semua Tahun</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Medical List */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <th className="p-4 text-xs uppercase tracking-wider">No. Rekam</th>
                <th className="p-4 text-xs uppercase tracking-wider">Nama Pasien</th>
                <th className="p-4 text-xs uppercase tracking-wider">Tanggal Periksa</th>
                <th className="p-4 text-xs uppercase tracking-wider">Dokter Hewan</th>
                <th className="p-4 text-xs uppercase tracking-wider">Diagnosis</th>
                <th className="p-4 text-xs uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    Tidak ada riwayat rekam medis yang cocok.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/30 text-slate-700">
                    <td className="p-4">
                      <span className="font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">{rec.id}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-800">{rec.petName}</td>
                    <td className="p-4 text-slate-500">{rec.date}</td>
                    <td className="p-4 font-semibold text-slate-600">{rec.doctor}</td>
                    <td className="p-4 text-slate-600 max-w-[200px] truncate" title={rec.diagnosis}>
                      {rec.diagnosis}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setActiveRecord(rec)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs transition"
                        >
                          👁️ Rincian
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(rec)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold rounded-lg text-xs transition"
                          title="Simpan PDF"
                        >
                          📥 PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Record Modal */}
      {activeRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveRecord(null)}></div>

          {/* Modal Container */}
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative z-10 overflow-y-auto max-h-[90vh] border border-slate-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Detail Rekam Medis Pasien</h3>
                <p className="text-slate-400 text-xs mt-0.5">ID Rekam Medis: {activeRecord.id}</p>
              </div>
              <button 
                onClick={() => setActiveRecord(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content info */}
            <div className="space-y-5">
              {/* Pet & Doctor Meta */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100/50 text-sm font-medium">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Nama Peliharaan</span>
                  <span className="text-slate-800 font-bold">{activeRecord.petName}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Dokter Pemeriksa</span>
                  <span className="text-slate-800 font-bold">{activeRecord.doctor}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Tanggal Periksa</span>
                  <span className="text-slate-500 font-semibold">{activeRecord.date}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">ID Registrasi</span>
                  <span className="text-slate-500 font-semibold">{activeRecord.id}</span>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="space-y-1">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Diagnosis Utama</span>
                <div className="text-sm font-bold text-slate-800 bg-emerald-50/10 border border-emerald-100 p-3 rounded-xl">
                  {activeRecord.diagnosis}
                </div>
              </div>

              {/* Action & Treatment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Tindakan Medis</span>
                  <div className="text-xs text-slate-600 bg-slate-50 border p-3 rounded-xl leading-relaxed min-h-[80px]">
                    {activeRecord.action}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Terapi / Resep Obat</span>
                  <div className="text-xs text-slate-600 bg-slate-50 border p-3 rounded-xl leading-relaxed min-h-[80px]">
                    {activeRecord.treatment}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {activeRecord.notes && (
                <div className="space-y-1">
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Catatan Dokter Hewan</span>
                  <div className="text-xs text-slate-600 bg-amber-50/40 border border-amber-100/30 p-3.5 rounded-xl italic leading-relaxed">
                    "{activeRecord.notes}"
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-5 border-t border-slate-100 mt-8">
              <button 
                onClick={() => setActiveRecord(null)}
                className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm transition"
              >
                Tutup Rincian
              </button>
              <button 
                onClick={() => handleDownloadPDF(activeRecord)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-sm shadow-emerald-100 flex items-center justify-center gap-2"
              >
                📥 Unduh Resep (PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
