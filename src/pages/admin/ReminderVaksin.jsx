import React, { useState, useEffect } from 'react';
import { vaccineService } from '../../lib/supabaseService';
import PageHeader from '../../components/PageHeader';
import { Bell, Search, Plus, CheckCircle, RefreshCw, Send, Trash2 } from 'lucide-react';

export default function ReminderVaksin() {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ petName: '', ownerName: '', email: '', phone: '', species: 'Anjing', vaccineType: 'Rabies', dueDate: '' });

  const fetchVaccines = async () => {
    try {
      setLoading(true);
      const data = await vaccineService.getAll();
      setVaccines(data);
    } catch (err) {
      setError('Gagal memuat data vaksinasi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccines();
  }, []);

  const handleSendReminder = async (id, ownerName, petName, vaccineType) => {
    try {
      const success = await vaccineService.sendReminder(id);
      if (success) {
        alert(`Kirim pengingat vaksin ${vaccineType} untuk ${petName} (Pemilik: ${ownerName}) sukses diproses!`);
        // Trigger event in sidebar count if any
        window.dispatchEvent(new Event('crm_change'));
        fetchVaccines();
      } else {
        alert('Gagal mengirimkan pengingat');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat mengirim pengingat');
    }
  };

  const handleAddVaccine = async (e) => {
    e.preventDefault();
    try {
      await vaccineService.add(formData);
      setShowAddModal(false);
      setFormData({ petName: '', ownerName: '', email: '', phone: '', species: 'Anjing', vaccineType: 'Rabies', dueDate: '' });
      window.dispatchEvent(new Event('crm_change'));
      fetchVaccines();
    } catch (err) {
      alert('Gagal menambah jadwal vaksin baru');
    }
  };

  const filtered = vaccines.filter(v => {
    const matchSearch = v.petName.toLowerCase().includes(search.toLowerCase()) || v.ownerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'Semua' || v.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ padding: 24, flex: 1, overflowY: 'auto', background: '#F7F8FC' }}>
      <PageHeader title="Reminder Vaksinasi" subtitle="Pantau jadwal vaksin pasien dan kirimkan pengingat otomatis ke kontak pemilik." />

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Jadwal Vaksin', value: vaccines.length, color: '#3B82F6' },
          { label: 'Belum Diingatkan', value: vaccines.filter(v=>v.status==='Belum Diingatkan').length, color: '#F59E0B' },
          { label: 'Sudah Diingatkan', value: vaccines.filter(v=>v.status==='Sudah Diingatkan').length, color: '#10B981' },
        ].map((card, idx) => (
          <div key={idx} style={{ background: 'white', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{card.label}</span>
            <h3 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: card.color }}>{card.value}</h3>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #E5E7EB', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama hewan / pemilik..." style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, outline: 'none', width: 220 }} />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, outline: 'none' }}>
              <option value="Semua">Semua Status</option>
              <option value="Belum Diingatkan">Belum Diingatkan</option>
              <option value="Sudah Diingatkan">Sudah Diingatkan</option>
            </select>
          </div>
          <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#3B82F6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
            <Plus size={16} /> Tambah Jadwal Vaksin
          </button>
        </div>

        {/* Table list */}
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: 20, color: '#6B7280' }}>Memuat...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontWeight: 600 }}>
                  <th style={{ padding: '12px 16px' }}>Pasien / Pemilik</th>
                  <th style={{ padding: '12px 16px' }}>Spesies</th>
                  <th style={{ padding: '12px 16px' }}>Jenis Vaksin</th>
                  <th style={{ padding: '12px 16px' }}>Tanggal Jatuh Tempo</th>
                  <th style={{ padding: '12px 16px' }}>Sisa Hari</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Kirim Pengingat</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => {
                  const statusColors = {
                    'Belum Diingatkan': { bg: '#FEF3C7', text: '#D97706' },
                    'Sudah Diingatkan': { bg: '#D1FAE5', text: '#059669' },
                  }[v.status] || { bg: '#F3F4F6', text: '#374151' };

                  return (
                    <tr key={v.id} style={{ borderBottom: '1px solid #E5E7EB', verticalAlign: 'middle' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 600 }}>🐱 {v.petName}</div>
                        <span style={{ fontSize: 12, color: '#6B7280' }}>Pemilik: {v.ownerName}</span>
                      </td>
                      <td style={{ padding: '16px' }}>{v.species}</td>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{v.vaccineType}</td>
                      <td style={{ padding: '16px' }}>{v.dueDate}</td>
                      <td style={{ padding: '16px', color: v.daysRemaining <= 7 && v.status === 'Belum Diingatkan' ? '#EF4444' : '#374151', fontWeight: v.daysRemaining <= 7 ? 700 : 500 }}>
                        {v.daysRemaining > 0 ? `${v.daysRemaining} hari lagi` : v.daysRemaining === 0 ? 'Hari ini' : `Lewat ${Math.abs(v.daysRemaining)} hari`}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: statusColors.bg, color: statusColors.text, fontSize: 11, fontWeight: 700 }}>
                          {v.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          {v.status === 'Belum Diingatkan' ? (
                            <button onClick={() => handleSendReminder(v.id, v.ownerName, v.petName, v.vaccineType)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#F59E0B', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, boxShadow: '0 2px 4px rgba(245,158,11,0.2)' }}>
                              <Send size={12} /> Kirim WA/Email
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>✓ Diingatkan</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#9CA3AF' }}>Tidak ada data reminder vaksin.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Vaccine Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, width: 400, padding: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700 }}>Tambah Jadwal Vaksin</h3>
            <form onSubmit={handleAddVaccine} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Nama Hewan</label>
                <input required type="text" value={formData.petName} onChange={e => setFormData({ ...formData, petName: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Spesies</label>
                <select value={formData.species} onChange={e => setFormData({ ...formData, species: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }}>
                  <option value="Anjing">Anjing</option>
                  <option value="Kucing">Kucing</option>
                  <option value="Burung">Burung</option>
                  <option value="Kelinci">Kelinci</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Nama Pemilik</label>
                <input required type="text" value={formData.ownerName} onChange={e => setFormData({ ...formData, ownerName: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Email Pemilik</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Nomor WhatsApp / HP</label>
                <input required type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Jenis Vaksin</label>
                <select value={formData.vaccineType} onChange={e => setFormData({ ...formData, vaccineType: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }}>
                  {['Rabies', 'DHPP', 'F4 (Feline Chlamydia)', 'Kombinasi Parvo', 'Lyme Disease'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Tanggal Jatuh Tempo</label>
                <input required type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', cursor: 'pointer' }}>Batal</button>
                <button type="submit" style={{ padding: '8px 20px', border: 'none', background: '#3B82F6', color: 'white', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
