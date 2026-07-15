import React, { useState, useEffect } from 'react';
import { pipelineService } from '../../lib/supabaseService';
import PageHeader from '../../components/PageHeader';
import { User, ChevronLeft, ChevronRight, RefreshCw, ShoppingBag, Calendar } from 'lucide-react';

export default function PipelineMember() {
  const [pipelineData, setPipelineData] = useState({ BARU: [], AKTIF: [], SETIA: [], TIDAK_AKTIF: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPipeline = async () => {
    try {
      setLoading(true);
      const res = await pipelineService.getAll();
      
      // Map keys to match our column keys
      setPipelineData({
        BARU: res.BARU || [],
        AKTIF: res.AKTIF || [],
        SETIA: res.SETIA || [],
        TIDAK_AKTIF: res.TIDAK_AKTIF || []
      });
    } catch (err) {
      setError('Gagal memuat data pipeline member');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  const handleMove = async (id, currentStage, direction) => {
    const stages = ['BARU', 'AKTIF', 'SETIA', 'TIDAK_AKTIF'];
    const currentIndex = stages.indexOf(currentStage);
    let nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= stages.length) return;
    const newStage = stages[nextIndex];

    try {
      const success = await pipelineService.moveStage(id, newStage);
      if (success) {
        fetchPipeline();
      } else {
        alert('Gagal memindahkan tahapan member');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat memindahkan tahapan');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const columns = [
    { key: 'BARU', title: 'Baru Terdaftar', color: '#3B82F6', bg: '#EFF6FF' },
    { key: 'AKTIF', title: 'Pelanggan Aktif', color: '#10B981', bg: '#ECFDF5' },
    { key: 'SETIA', title: 'Pelanggan Setia (Loyal)', color: '#8B5CF6', bg: '#F5F3FF' },
    { key: 'TIDAK_AKTIF', title: 'Tidak Aktif (Churn)', color: '#EF4444', bg: '#FEE2E2' },
  ];

  return (
    <div style={{ padding: 24, flex: 1, overflowY: 'auto', background: '#F7F8FC', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Pipeline Member" subtitle="Kelola dan analisis siklus hidup kesetiaan pelanggan (CRM)." />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={fetchPipeline} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'white', border: '1px solid #E5E7EB', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          <RefreshCw size={14} /> Segarkan Papan
        </button>
      </div>

      {/* Kanban Board Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, flex: 1, minHeight: '60vh' }}>
        {columns.map(col => {
          const list = pipelineData[col.key] || [];
          return (
            <div key={col.key} style={{ background: '#F3F4F6', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', border: '1px solid #E5E7EB' }}>
              {/* Column Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, padding: '0 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#374151' }}>{col.title}</h4>
                </div>
                <span style={{ background: col.bg, color: col.color, fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>{list.length}</span>
              </div>

              {/* Card List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto' }}>
                {loading ? (
                  <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', padding: 20 }}>Memuat...</p>
                ) : list.length === 0 ? (
                  <div style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', padding: '30px 10px', border: '1px dashed #D1D5DB', borderRadius: 12 }}>Tidak ada member.</div>
                ) : (
                  list.map(member => (
                    <div key={member.id} style={{ background: 'white', borderRadius: 12, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h5 style={{ margin: '0 0 2px 0', fontSize: 13.5, fontWeight: 700, color: '#111827' }}>{member.name}</h5>
                          <span style={{ fontSize: 11, color: '#6B7280' }}>📞 {member.phone}</span>
                        </div>
                        <div style={{ size: 28, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
                          <User size={14} color="#6B7280" />
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11, color: '#4B5563' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} title="Kunjungan">
                          <Calendar size={12} color="#9CA3AF" />
                          <span>{member.visits} Kunjungan</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} title="Total Transaksi">
                          <ShoppingBag size={12} color="#9CA3AF" />
                          <span style={{ fontWeight: 600 }}>{formatCurrency(member.totalTransaksi || 0)}</span>
                        </div>
                      </div>

                      {/* Move Stage Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F3F4F6', paddingTop: 8, marginTop: 4 }}>
                        <button disabled={col.key === 'BARU'} onClick={() => handleMove(member.id, col.key, -1)} style={{ background: 'none', border: 'none', color: col.key === 'BARU' ? '#D1D5DB' : '#6B7280', cursor: col.key === 'BARU' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 2, fontSize: 11 }}>
                          <ChevronLeft size={14} /> Back
                        </button>
                        <button disabled={col.key === 'TIDAK_AKTIF'} onClick={() => handleMove(member.id, col.key, 1)} style={{ background: 'none', border: 'none', color: col.key === 'TIDAK_AKTIF' ? '#D1D5DB' : '#3B82F6', cursor: col.key === 'TIDAK_AKTIF' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 600 }}>
                          Next <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
