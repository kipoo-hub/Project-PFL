import React, { useState, useEffect } from 'react';
import { leadService } from '../../lib/supabaseService';
import PageHeader from '../../components/PageHeader';
import { Target, Search, Plus, CheckCircle, RefreshCw, PhoneCall, Trash2 } from 'lucide-react';

export default function LeadManagement() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ visitorName: '', email: '', phone: '', source: 'Pencarian Web' });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await leadService.getAll();
      setLeads(data);
    } catch (err) {
      setError('Gagal memuat data leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const success = await leadService.updateStatus(id, status);
      if (success) {
        if (status === 'Konversi') {
          alert('Lead sukses dikonversi menjadi member pipeline!');
        }
        fetchLeads();
      } else {
        alert('Gagal memperbarui status lead');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat memperbarui status');
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      await leadService.add(formData);
      setShowAddModal(false);
      setFormData({ visitorName: '', email: '', phone: '', source: 'Pencarian Web' });
      fetchLeads();
    } catch (err) {
      alert('Gagal menambah lead baru');
    }
  };

  const filtered = leads.filter(l => {
    const matchSearch = l.visitorName.toLowerCase().includes(search.toLowerCase()) || (l.email && l.email.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === 'Semua' || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ padding: 24, flex: 1, overflowY: 'auto', background: '#F7F8FC' }}>
      <PageHeader title="Lead Management" subtitle="Lacak calon pelanggan dan konversikan mereka menjadi member aktif klinik." />

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Leads', value: leads.length, color: '#3B82F6', bg: '#EFF6FF' },
          { label: 'Leads Baru Hari Ini', value: leads.filter(l=>l.isNewToday).length, color: '#10B981', bg: '#ECFDF5' },
          { label: 'Dalam Hubungan (Follow-up)', value: leads.filter(l=>l.status==='Dihubungi').length, color: '#F59E0B', bg: '#FFFBEB' },
          { label: 'Telah Dikonversi', value: leads.filter(l=>l.status==='Konversi').length, color: '#8B5CF6', bg: '#F5F3FF' },
        ].map((card, idx) => (
          <div key={idx} style={{ background: 'white', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{card.label}</span>
              <h2 style={{ margin: '6px 0 2px 0', fontSize: 26, fontWeight: 800, color: card.color }}>{card.value}</h2>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
              <Target size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #E5E7EB', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama lead / email..." style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, outline: 'none', width: 220 }} />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, outline: 'none' }}>
              <option value="Semua">Semua Status</option>
              <option value="Baru">Baru</option>
              <option value="Dihubungi">Dihubungi</option>
              <option value="Konversi">Konversi (Member)</option>
              <option value="Tidak Tertarik">Tidak Tertarik</option>
            </select>
          </div>
          <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#3B82F6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
            <Plus size={16} /> Tambah Lead Baru
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
                  <th style={{ padding: '12px 16px' }}>Nama Lead / Pengunjung</th>
                  <th style={{ padding: '12px 16px' }}>Sumber Leads</th>
                  <th style={{ padding: '12px 16px' }}>No. WA / HP</th>
                  <th style={{ padding: '12px 16px' }}>Email</th>
                  <th style={{ padding: '12px 16px' }}>Keaktifan Terakhir</th>
                  <th style={{ padding: '12px 16px' }}>Kunjungan Halaman</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Konversi & Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => {
                  const statusColors = {
                    'Baru': { bg: '#FEF3C7', text: '#D97706' },
                    'Dihubungi': { bg: '#DBEAFE', text: '#2563EB' },
                    'Konversi': { bg: '#D1FAE5', text: '#059669' },
                    'Tidak Tertarik': { bg: '#FEE2E2', text: '#DC2626' },
                  }[lead.status] || { bg: '#F3F4F6', text: '#374151' };

                  return (
                    <tr key={lead.id} style={{ borderBottom: '1px solid #E5E7EB', verticalAlign: 'middle' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {lead.visitorName}
                          {lead.isNewToday && <span style={{ fontSize: 9, background: '#10B981', color: 'white', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>BARU</span>}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>{lead.source}</td>
                      <td style={{ padding: '16px' }}>{lead.phone || '-'}</td>
                      <td style={{ padding: '16px' }}>{lead.email || '-'}</td>
                      <td style={{ padding: '16px' }}>{lead.lastActive}</td>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{lead.visitCount} kali</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: statusColors.bg, color: statusColors.text, fontSize: 11, fontWeight: 700 }}>
                          {lead.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          {lead.status !== 'Konversi' && (
                            <>
                              <button onClick={() => handleUpdateStatus(lead.id, 'Dihubungi')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '5px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                                <PhoneCall size={12} /> Hubungi
                              </button>
                              <button onClick={() => handleUpdateStatus(lead.id, 'Konversi')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#10B981', color: 'white', border: 'none', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, boxShadow: '0 2px 4px rgba(16,185,129,0.2)' }}>
                                <CheckCircle size={12} /> Konversi
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#9CA3AF' }}>Tidak ada data leads.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, width: 400, padding: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700 }}>Tambah Lead Baru</h3>
            <form onSubmit={handleAddLead} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Nama Pengunjung</label>
                <input required type="text" value={formData.visitorName} onChange={e => setFormData({ ...formData, visitorName: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Nomor WhatsApp / HP</label>
                <input required type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Sumber Informasi</label>
                <select value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }}>
                  {['Pencarian Web', 'Instagram', 'Rekomendasi Teman', 'Brosur Klinik', 'TikTok'].map(s => <option key={s}>{s}</option>)}
                </select>
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
