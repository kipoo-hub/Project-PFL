import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { Search, Plus, PawPrint, X, Check } from 'lucide-react';
import { speciesColors, initialPatients } from '../data/pasien';

const StatusBadge = ({ status }) => {
  const cfg = {
    Aktif:  { bg: '#C6F6D5', color: '#48BB78' },
    Kritis: { bg: '#FED7D7', color: '#F56565' },
    Sembuh: { bg: '#E6FFFA', color: '#4FD1C5' },
  };
  const c = cfg[status] || cfg.Aktif;
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: c.bg, color: c.color, fontSize: 11, fontWeight: 700 }}>
      {status}
    </span>
  );
};

const Modal = ({ show, onClose, onSave }) => {
  const [form, setForm] = useState({ nama: '', spesies: 'Anjing', ras: '', pemilik: '', telepon: '', email: '' });
  if (!show) return null;
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSave = () => { onSave(form); setForm({ nama: '', spesies: 'Anjing', ras: '', pemilik: '', telepon: '', email: '' }); };

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: 12, fontSize: 13, color: 'var(--text-primary)', background: '#F8F9FA', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#A0AEC0', display: 'block', marginBottom: 6 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 16, width: 480, boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Tambah Pasien Baru</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><X size={18} /></button>
        </div>
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={labelStyle}>Nama Hewan</label><input name="nama" value={form.nama} onChange={handleChange} style={inputStyle} placeholder="Max" /></div>
          <div>
            <label style={labelStyle}>Spesies</label>
            <select name="spesies" value={form.spesies} onChange={handleChange} style={inputStyle}>
              {['Anjing','Kucing','Burung','Kelinci','Lainnya'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Ras</label><input name="ras" value={form.ras} onChange={handleChange} style={inputStyle} placeholder="Golden Retriever" /></div>
          <div><label style={labelStyle}>Nama Pemilik</label><input name="pemilik" value={form.pemilik} onChange={handleChange} style={inputStyle} placeholder="Budi Santoso" /></div>
          <div><label style={labelStyle}>No. Telepon</label><input name="telepon" value={form.telepon} onChange={handleChange} style={inputStyle} placeholder="0812-xxxx-xxxx" /></div>
          <div><label style={labelStyle}>Email</label><input name="email" value={form.email} onChange={handleChange} style={inputStyle} placeholder="email@contoh.com" /></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px', borderTop: '1px solid #E2E8F0' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 12, border: '1px solid #E2E8F0', background: 'white', fontSize: 13, cursor: 'pointer' }}>Batal</button>
          <button onClick={handleSave} style={{ padding: '8px 20px', borderRadius: 12, border: 'none', background: '#4FD1C5', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(79,209,197,0.3)' }}>
            <Check size={14} /> Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

const Pasien = () => {
  const [patients, setPatients] = useState(initialPatients);
  const [search, setSearch] = useState('');
  const [filterSpesies, setFilterSpesies] = useState('Semua');
  const [showModal, setShowModal] = useState(false);

  const filtered = patients.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase()) || p.pemilik.toLowerCase().includes(search.toLowerCase());
    const matchSpesies = filterSpesies === 'Semua' || p.spesies === filterSpesies;
    return matchSearch && matchSpesies;
  });

  const handleAddPatient = (form) => {
    const newP = { ...form, id: `P-${String(patients.length + 1).padStart(3,'0')}`, kunjunganTerakhir: 'Baru', status: 'Aktif' };
    setPatients(p => [newP, ...p]);
    setShowModal(false);
  };

  return (
    <div style={{ flex: 1, padding: 24, background: '#F7F8FC' }}>
      <PageHeader title="Data Pasien" subtitle="Kelola semua pasien klinik hewan Anda." />

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Pasien', value: patients.length, color: '#319795' },
          { label: 'Pasien Aktif', value: patients.filter(p=>p.status==='Aktif').length, color: '#48BB78' },
          { label: 'Kasus Kritis', value: patients.filter(p=>p.status==='Kritis').length, color: '#F56565' },
          { label: 'Sudah Sembuh', value: patients.filter(p=>p.status==='Sembuh').length, color: '#667EEA' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 12, color: '#A0AEC0', fontWeight: 'bold', textTransform: 'uppercase', tracking: '0.05em' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input id="pasien-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama hewan / pemilik..." style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #E2E8F0', borderRadius: 12, fontSize: 13, outline: 'none', width: 240, background: '#F8F9FA' }} />
            </div>
            {/* Filter */}
            <select id="pasien-filter-spesies" value={filterSpesies} onChange={e => setFilterSpesies(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 12, fontSize: 13, color: 'var(--text-secondary)', background: '#F8F9FA', outline: 'none' }}>
              {['Semua','Anjing','Kucing','Burung','Kelinci','Lainnya'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button id="pasien-add-btn" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, border: 'none', background: '#4FD1C5', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,209,197,0.3)' }}>
            <Plus size={15} /> Tambah Pasien
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {['ID','Hewan','Spesies','Pemilik','Telepon','Kunjungan Terakhir','Status'].map(col => (
                  <th key={col} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const sc = speciesColors[p.spesies] || speciesColors.Lainnya;
                return (
                  <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-color)' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafbff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{p.id}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <PawPrint size={15} color={sc.color} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.nama}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.ras}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 600 }}>{p.spesies}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{p.pemilik}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{p.telepon}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{p.kunjunganTerakhir}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={p.status} /></td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Tidak ada pasien ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} onSave={handleAddPatient} />
    </div>
  );
};

export default Pasien;
