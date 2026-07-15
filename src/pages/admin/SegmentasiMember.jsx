import React, { useState, useEffect } from 'react';
import { pipelineService } from '../../lib/supabaseService';
import PageHeader from '../../components/PageHeader';
import { Layers, User, Award, Percent } from 'lucide-react';

export default function SegmentasiMember() {
  const [segments, setSegments] = useState({ Bronze: [], Silver: [], Gold: [] });
  const [loading, setLoading] = useState(true);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      // Fetch pipeline members and group them manually by Tier
      const res = await pipelineService.getAll();
      const allMembers = [
        ...(res.BARU || []),
        ...(res.AKTIF || []),
        ...(res.SETIA || []),
        ...(res.TIDAK_AKTIF || [])
      ];

      // Segment mapping based on spending
      const bronze = allMembers.filter(m => (m.totalTransaksi || 0) < 500000);
      const silver = allMembers.filter(m => (m.totalTransaksi || 0) >= 500000 && (m.totalTransaksi || 0) < 1500000);
      const gold = allMembers.filter(m => (m.totalTransaksi || 0) >= 1500000);

      setSegments({ Bronze: bronze, Silver: silver, Gold: gold });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  return (
    <div style={{ padding: 24, flex: 1, overflowY: 'auto', background: '#F7F8FC' }}>
      <PageHeader title="Segmentasi Member" subtitle="Kelompokkan pelanggan ke dalam tingkat loyalitas (Tiers) berdasarkan total belanja mereka." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { title: 'Bronze Member', desc: 'Total transaksi < Rp 500.000', count: segments.Bronze.length, color: '#D97706', bg: '#FEF3C7', icon: Award },
          { title: 'Silver Member', desc: 'Total transaksi Rp 500.000 - Rp 1.500.000', count: segments.Silver.length, color: '#9CA3AF', bg: '#F3F4F6', icon: Award },
          { title: 'Gold Member', desc: 'Total transaksi > Rp 1.500.000', count: segments.Gold.length, color: '#F59E0B', bg: '#FEF3C7', icon: Award },
        ].map((tier, idx) => (
          <div key={idx} style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: tier.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tier.color }}>
                <tier.icon size={20} />
              </div>
              <span style={{ fontSize: 24, fontWeight: 800, color: tier.color }}>{tier.count} member</span>
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 700 }}>{tier.title}</h4>
              <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>{tier.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700 }}>Detail Member per Segment</h3>
        {loading ? (
          <p>Memuat data...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {['Gold', 'Silver', 'Bronze'].map(tierName => {
              const list = segments[tierName] || [];
              return (
                <div key={tierName} style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: 16 }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: 14, fontWeight: 700, color: tierName === 'Gold' ? '#F59E0B' : tierName === 'Silver' ? '#4B5563' : '#D97706' }}>Tingkat {tierName} ({list.length})</h4>
                  {list.length === 0 ? (
                    <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>Belum ada member di tingkat ini.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                      {list.map(m => (
                        <div key={m.id} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: 12, background: '#F9FAFB' }}>
                          <span style={{ fontWeight: 600, fontSize: 13, display: 'block' }}>{m.name}</span>
                          <span style={{ fontSize: 11, color: '#6B7280' }}>Belanja: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(m.totalTransaksi)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
