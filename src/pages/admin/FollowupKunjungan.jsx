import React, { useState, useEffect } from 'react';
import { followupService } from '../../lib/supabaseService';
import PageHeader from '../../components/PageHeader';
import { ClipboardList, Plus, Search, Check, Edit3, X, Trash2 } from 'lucide-react';

export default function FollowupKunjungan() {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState({ petName: '', ownerName: '', phone: '', doctor: 'Dr. Rizal', service: 'Pemeriksaan Umum' });
  const [editData, setEditData] = useState({ id: '', status: 'Belum', notes: '' });

  const fetchFollowups = async () => {
    try {
      setLoading(true);
      const data = await followupService.getAll();
      setFollowups(data);
    } catch (err) {
      setError('Gagal memuat data follow-up');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, []);

  const handleAddFollowup = async (e) => {
    e.preventDefault();
    try {
      await followupService.add(formData);
      setShowAddModal(false);
      setFormData({ petName: '', ownerName: '', phone: '', doctor: 'Dr. Rizal', service: 'Pemeriksaan Umum' });
      fetchFollowups();
    } catch (err) {
      alert('Gagal menambah follow-up');
    }
  };

  const handleUpdateFollowup = async (e) => {
    e.preventDefault();
    try {
      const success = await followupService.update(editData.id, editData.status, editData.notes);
      if (success) {
        setShowEditModal(false);
        fetchFollowups();
      } else {
        alert('Gagal memperbarui data follow-up');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat memperbarui');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus log follow-up ini?')) return;
    try {
      const success = await followupService.delete(id);
      if (success) fetchFollowups();
    } catch (err) {
      alert('Gagal menghapus log');
    }
  };

  const handleOpenEdit = (item) => {
    setEditData({ id: item.id, status: item.status, notes: item.notes || '' });
    setShowEditModal(true);
  };

  const filtered = followups.filter(f => {
    const matchSearch = f.petName.toLowerCase().includes(search.toLowerCase()) || f.ownerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'Semua' || f.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ padding: 24, flex: 1, overflowY: 'auto', background: '#F7F8FC' }}>
      <PageHeader title="Follow-up Kunjungan" subtitle="Kelola dan catat tindak lanjut kondisi medis pasien setelah berkunjung." />

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Tindak Lanjut', value: followups.length, color: '#3B82F6' },
          { label: 'Belum Selesai', value: followups.filter(f=>f.status==='Belum').length, color: '#F59E0B' },
          { label: 'Selesai di Follow-up', value: followups.filter(f=>f.status==='Selesai').length, color: '#10B981' },
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
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama pasien/pemilik..." style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, outline: 'none', width: 220 }} />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, outline: 'none' }}>
              <option value="Semua">Semua Status</option>
              <option value="Belum">Belum Follow-up</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
          <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#3B82F6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
            <Plus size={16} /> Buat Log Follow-up
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
                  <th style={{ padding: '12px 16px' }}>No. HP</th>
                  <th style={{ padding: '12px 16px' }}>Layanan Terakhir</th>
                  <th style={{ padding: '12px 16px' }}>Dokter</th>
                  <th style={{ padding: '12px 16px' }}>Tanggal Kunjungan</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Catatan</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #E5E7EB', verticalAlign: 'middle' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600 }}>🐶 {f.petName}</div>
                      <span style={{ fontSize: 12, color: '#6B7280' }}>Pemilik: {f.ownerName}</span>
                    </td>
                    <td style={{ padding: '16px' }}>{f.phone}</td>
                    <td style={{ padding: '16px' }}>{f.service}</td>
                    <td style={{ padding: '16px' }}>{f.doctor}</td>
                    <td style={{ padding: '16px' }}>{f.visitDate}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: f.status === 'Selesai' ? '#D1FAE5' : '#FEF3C7', color: f.status === 'Selesai' ? '#059669' : '#D97706', fontSize: 11, fontWeight: 700 }}>
                        {f.status === 'Selesai' ? 'Selesai' : 'Belum'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: f.notes ? '#374151' : '#9CA3AF', fontStyle: f.notes ? 'normal' : 'italic' }}>
                      {f.notes || 'Tidak ada catatan'}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => handleOpenEdit(f)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#3B82F6', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                          <Edit3 size={12} /> Edit Notes
                        </button>
                        <button onClick={() => handleDelete(f.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4 }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#9CA3AF' }}>Tidak ada log follow-up.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, width: 400, padding: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700 }}>Buat Log Follow-up</h3>
            <form onSubmit={handleAddFollowup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Nama Hewan (Pasien)</label>
                <input required type="text" value={formData.petName} onChange={e => setFormData({ ...formData, petName: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Nama Pemilik</label>
                <input required type="text" value={formData.ownerName} onChange={e => setFormData({ ...formData, ownerName: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>No. HP / WhatsApp</label>
                <input required type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Layanan Terakhir</label>
                <select value={formData.service} onChange={e => setFormData({ ...formData, service: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }}>
                  {['Pemeriksaan Umum', 'Operasi Minor', 'Vaksinasi', 'Sterilisasi', 'Terapi Fisik'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Dokter Penanggung Jawab</label>
                <select value={formData.doctor} onChange={e => setFormData({ ...formData, doctor: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }}>
                  {['Dr. Rizal', 'Dr. Maya', 'Dr. Sarah'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', cursor: 'pointer' }}>Batal</button>
                <button type="submit" style={{ padding: '8px 20px', border: 'none', background: '#3B82F6', color: 'white', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Buat Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, width: 400, padding: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Update Status & Catatan</h3>
              <button onClick={() => setShowEditModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateFollowup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Status Tindak Lanjut</label>
                <select value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }}>
                  <option value="Belum">Belum Di-Follow-up</option>
                  <option value="Selesai">Selesai (Sudah Di-hubungi)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Catatan Hasil</label>
                <textarea rows="4" placeholder="Kondisi pasien membaik, obat telah habis dikonsumsi..." value={editData.notes} onChange={e => setEditData({ ...editData, notes: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 13 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', cursor: 'pointer' }}>Batal</button>
                <button type="submit" style={{ padding: '8px 20px', border: 'none', background: '#3B82F6', color: 'white', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
