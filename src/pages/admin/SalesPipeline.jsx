import React, { useState, useEffect } from 'react';
import { billService } from '../../lib/supabaseService';
import PageHeader from '../../components/PageHeader';
import { DollarSign, Plus, Check, X, FileText, Filter, Trash2 } from 'lucide-react';

export default function SalesPipeline() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [formData, setFormData] = useState({ memberId: '', service: 'Pemeriksaan Medis', amount: '', invoiceNo: '' });
  const [filterStatus, setFilterStatus] = useState('Semua');

  const fetchBills = async () => {
    try {
      setLoading(true);
      const data = await billService.getAll();
      setBills(data);
    } catch (err) {
      setError('Gagal memuat data tagihan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const success = await billService.updateStatus(id, status);
      if (success) fetchBills();
    } catch (err) {
      alert('Gagal memperbarui status pembayaran');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus tagihan ini?')) return;
    try {
      const success = await billService.delete(id);
      if (success) fetchBills();
    } catch (err) {
      alert('Gagal menghapus tagihan');
    }
  };

  const handleAddBill = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        invoiceNo: formData.invoiceNo || `INV-${Date.now().toString().slice(-6)}`,
        service: formData.service,
        amount: parseFloat(formData.amount),
        status: 'Belum Dibayar',
        details: []
      };
      await billService.add(payload);
      setShowAddModal(false);
      setFormData({ memberId: '', service: 'Pemeriksaan Medis', amount: '', invoiceNo: '' });
      fetchBills();
    } catch (err) {
      alert('Gagal membuat tagihan baru');
    }
  };

  const totalRevenue = bills
    .filter(b => b.status === 'Lunas')
    .reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);

  const pendingRevenue = bills
    .filter(b => b.status === 'Belum Dibayar')
    .reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);

  const filteredBills = bills.filter(b => filterStatus === 'Semua' || b.status === filterStatus);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div style={{ padding: 24, flex: 1, overflowY: 'auto', background: '#F7F8FC' }}>
      <PageHeader title="Keuangan & Tagihan" subtitle="Kelola pembayaran, tagihan, dan pendapatan klinik." />

      {/* Financial Status KPI Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Total Pendapatan (Lunas)</span>
            <h2 style={{ margin: '6px 0 2px 0', fontSize: 24, fontWeight: 800, color: '#10B981' }}>{formatCurrency(totalRevenue)}</h2>
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>Akumulasi dari tagihan selesai</span>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
            <DollarSign size={20} />
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Piutang Pending</span>
            <h2 style={{ margin: '6px 0 2px 0', fontSize: 24, fontWeight: 800, color: '#F59E0B' }}>{formatCurrency(pendingRevenue)}</h2>
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>Tagihan belum dibayar</span>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
            <FileText size={20} />
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Total Transaksi</span>
            <h2 style={{ margin: '6px 0 2px 0', fontSize: 24, fontWeight: 800, color: '#4F46E5' }}>{bills.length} Tagihan</h2>
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>Lunas & pending</span>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
            <Filter size={20} />
          </div>
        </div>
      </div>

      {/* Action and Filter Controls */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #E5E7EB', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, outline: 'none' }}>
              <option value="Semua">Semua Status</option>
              <option value="Lunas">Lunas</option>
              <option value="Belum Dibayar">Belum Dibayar</option>
            </select>
          </div>
          <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#3B82F6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
            <Plus size={16} /> Buat Tagihan
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: 20, color: '#6B7280' }}>Memuat...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontWeight: 600 }}>
                  <th style={{ padding: '12px 16px' }}>Nomor Invoice</th>
                  <th style={{ padding: '12px 16px' }}>Layanan / Deskripsi</th>
                  <th style={{ padding: '12px 16px' }}>Total Tagihan</th>
                  <th style={{ padding: '12px 16px' }}>Tanggal</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #E5E7EB', verticalAlign: 'middle' }}>
                    <td style={{ padding: '16px', fontWeight: 700, color: '#111827' }}>{b.invoiceNo || 'INV-TEMP'}</td>
                    <td style={{ padding: '16px' }}>{b.service}</td>
                    <td style={{ padding: '16px', fontWeight: 600 }}>{formatCurrency(b.amount)}</td>
                    <td style={{ padding: '16px' }}>{b.billDate || '-'}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: b.status === 'Lunas' ? '#D1FAE5' : '#FEE2E2', color: b.status === 'Lunas' ? '#059669' : '#DC2626', fontSize: 11, fontWeight: 700 }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {b.status === 'Belum Dibayar' ? (
                          <button onClick={() => handleUpdateStatus(b.id, 'Lunas')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#10B981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                            <Check size={12} /> Set Lunas
                          </button>
                        ) : (
                          <button onClick={() => handleUpdateStatus(b.id, 'Belum Dibayar')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#EF4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                            <X size={12} /> Set Belum Lunas
                          </button>
                        )}
                        <button onClick={() => handleDelete(b.id)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 4 }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBills.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#9CA3AF' }}>Tidak ada riwayat tagihan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Bill Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, width: 400, padding: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700 }}>Buat Tagihan Baru</h3>
            <form onSubmit={handleAddBill} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Nomor Invoice (Opsional)</label>
                <input type="text" placeholder="Kosongkan untuk auto-generate" value={formData.invoiceNo} onChange={e => setFormData({ ...formData, invoiceNo: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Layanan / Deskripsi</label>
                <select value={formData.service} onChange={e => setFormData({ ...formData, service: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }}>
                  {['Pemeriksaan Medis', 'Vaksinasi Kucing/Anjing', 'Operasi Minor', 'Grooming Lengkap', 'Rawat Inap', 'Obat & Vitamin'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Jumlah Tagihan (IDR)</label>
                <input required type="number" placeholder="250000" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', cursor: 'pointer' }}>Batal</button>
                <button type="submit" style={{ padding: '8px 20px', border: 'none', background: '#3B82F6', color: 'white', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Buat Tagihan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
