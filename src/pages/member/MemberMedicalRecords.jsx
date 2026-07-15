import React, { useState, useEffect } from 'react';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { medicalRecordService } from '../../lib/supabaseService';
import GuestNavbar from '../guest/components/GuestNavbar';
import GuestFooter from '../guest/components/GuestFooter';
import '../guest/guest.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const selStyle = { padding: '7px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.8rem', outline: 'none', background: 'white', color: '#1e293b', cursor: 'pointer' };

export default function MemberMedicalRecords() {
  const { member } = useMemberAuth();
  const [records, setRecords] = useState([]);
  const [pets, setPets] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedPet, setSelectedPet] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [activeRecord, setActiveRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      const memberUser = JSON.parse(localStorage.getItem('memberUser'));
      if (!memberUser?.id) return;
      setLoading(true); setError(null);
      try {
        const list = await medicalRecordService.getByMemberId(memberUser.id);
        setRecords(list);
        setPets(Array.from(new Set(list.map(r => r.petName))).filter(Boolean));
        setYears(Array.from(new Set(list.map(r => r.date?.split('-')[0]))).filter(Boolean).sort((a, b) => b - a));
      } catch { setError('Gagal memuat rekam medis.'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = records.filter(r => {
    const matchPet = selectedPet === 'All' || r.petName?.toLowerCase() === selectedPet.toLowerCase();
    const matchYear = selectedYear === 'All' || (r.date && r.date.startsWith(selectedYear));
    return matchPet && matchYear;
  });

  if (loading) return (
    <div className="guest-page"><GuestNavbar />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, border: '3px solid #16a34a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <GuestFooter />
    </div>
  );

  return (
    <div className="guest-page">
      <GuestNavbar />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } tr.med-row:hover td { background: #f8fafc !important; }`}</style>

      <main style={{ paddingTop: 96, paddingBottom: 80, background: '#f4f7fc', minHeight: '60vh' }}>
        <div className="guest-container">
          {/* Header */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#16a34a', marginBottom: 6 }}>Riwayat Klinis</div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Rekam Medis</h1>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>Riwayat klinis lengkap, diagnosis dokter, dan resep obat peliharaan Anda.</p>
          </div>

          {error && <div style={{ padding: 14, background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12, color: '#e11d48', marginBottom: 16, fontSize: '0.83rem' }}>{error}</div>}

          {/* Filter Row */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #edf2f7', padding: '14px 18px', marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Peliharaan:</span>
              <select value={selectedPet} onChange={e => setSelectedPet(e.target.value)} style={selStyle}>
                <option value="All">Semua Peliharaan</option>
                {pets.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tahun:</span>
              <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={selStyle}>
                <option value="All">Semua Tahun</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>{filtered.length} rekam medis ditemukan</span>
          </div>

          {/* Table */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #edf2f7', overflow: 'hidden', boxShadow: '0 1px 6px rgba(15,23,42,0.05)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
                    {['No. Rekam', 'Nama Pasien', 'Tanggal Periksa', 'Dokter Hewan', 'Diagnosis', 'Aksi'].map((h, i) => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: i === 5 ? 'right' : 'left', fontWeight: 700, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: '#94a3b8' }}>
                      <div style={{ fontSize: '2rem', marginBottom: 8 }}>📋</div>
                      Tidak ada rekam medis yang cocok dengan filter ini.
                    </td></tr>
                  ) : filtered.map(rec => (
                    <tr key={rec.id} className="med-row">
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc' }}>
                        <span style={{ fontWeight: 600, color: '#64748b', background: '#f8fafc', border: '1px solid #edf2f7', padding: '2px 8px', borderRadius: 6, fontSize: '0.72rem' }}>{rec.id}</span>
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', fontWeight: 700, color: '#1e293b' }}>{rec.petName}</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', color: '#64748b' }}>{rec.date}</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', fontWeight: 600, color: '#475569' }}>{rec.doctor}</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', color: '#475569', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={rec.diagnosis}>{rec.diagnosis}</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button onClick={() => setActiveRecord(rec)} style={{ padding: '5px 12px', borderRadius: 8, border: 'none', background: '#f0fdf4', color: '#16a34a', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}>👁️ Rincian</button>
                          <button onClick={() => alert(`Simulasi unduh PDF ${rec.petName}`)} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer' }}>📥 PDF</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {activeRecord && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={() => setActiveRecord(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', zIndex: 10, background: 'white', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>Detail Rekam Medis</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>ID: {activeRecord.id}</div>
              </div>
              <button onClick={() => setActiveRecord(null)} style={{ width: 30, height: 30, border: '1px solid #e2e8f0', borderRadius: 8, background: 'white', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #edf2f7' }}>
                {[['Nama Peliharaan', activeRecord.petName], ['Dokter Pemeriksa', activeRecord.doctor], ['Tanggal Periksa', activeRecord.date], ['ID Registrasi', activeRecord.id]].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 3 }}>{k}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.83rem', color: '#1e293b' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 6 }}>Diagnosis Utama</div>
                <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', color: '#166534' }}>{activeRecord.diagnosis}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['Tindakan Medis', activeRecord.action], ['Terapi / Resep', activeRecord.treatment]].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 6 }}>{k}</div>
                    <div style={{ padding: '10px 12px', background: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 10, fontSize: '0.78rem', color: '#475569', lineHeight: 1.6, minHeight: 70 }}>{v}</div>
                  </div>
                ))}
              </div>
              {activeRecord.notes && (
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 6 }}>Catatan Dokter</div>
                  <div style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, fontSize: '0.78rem', color: '#92400e', fontStyle: 'italic' }}>"{activeRecord.notes}"</div>
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '14px 24px', borderTop: '1px solid #f1f5f9' }}>
              <button onClick={() => setActiveRecord(null)} style={{ padding: '10px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}>Tutup</button>
              <button onClick={() => alert(`PDF ${activeRecord.petName}`)} style={{ padding: '10px', borderRadius: 12, border: 'none', background: '#16a34a', color: 'white', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}>📥 Unduh PDF</button>
            </div>
          </div>
        </div>
      )}
      <GuestFooter />
    </div>
  );
}
