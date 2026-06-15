import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { crmState } from '../lib/crmState';
import { 
  Users, PawPrint, Calendar, ShieldAlert, 
  DollarSign, ArrowRight, MessageSquare, ListFilter,
  Layers, CheckCircle2, ChevronRight
} from 'lucide-react';

const cardStyle = {
  background: 'white',
  borderRadius: 12,
  border: '1px solid var(--border-color)',
  boxShadow: 'var(--shadow-sm)',
  padding: '20px 22px',
};

const categoryCfg = {
  jenisHewan: { label: 'Jenis Hewan', icon: PawPrint, color: '#0ca678', bg: '#e6fcf5' },
  frekuensiKunjungan: { label: 'Frekuensi Kunjungan', icon: Calendar, color: '#3b5bdb', bg: '#eef2ff' },
  statusVaksin: { label: 'Status Vaksin', icon: ShieldAlert, color: '#e03131', bg: '#fff5f5' },
  nilaiTransaksi: { label: 'Nilai Transaksi', icon: DollarSign, color: '#7048e8', bg: '#f3f0ff' },
  pipelineStage: { label: 'Pipeline Stage', icon: Layers, color: '#f76707', bg: '#fff4e6' }
};

export default function Segmentasi() {
  const navigate = useNavigate();
  const [segments, setSegments] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('jenisHewan');
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [memberList, setMemberList] = useState([]);

  useEffect(() => {
    crmState.init();
    const data = crmState.getSegments();
    setSegments(data);
    
    // Auto-select first segment of Jenis Hewan
    if (data.jenisHewan && data.jenisHewan.length > 0) {
      handleSelectSegment('jenisHewan', data.jenisHewan[0]);
    }
  }, []);

  const handleSelectSegment = (catKey, segment) => {
    setSelectedCategory(catKey);
    setSelectedSegment(segment);
    const members = crmState.getMembersBySegment(catKey, segment.value);
    setMemberList(members);
  };

  const handleCreateBlast = () => {
    if (!selectedCategory || !selectedSegment) return;
    // Redirect to blast page with query parameters
    navigate(`/blast?category=${selectedCategory}&value=${selectedSegment.value}`);
  };

  const formatRp = (v) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

  return (
    <div style={{ flex: 1, padding: 24, background: 'var(--bg-app)', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
      <PageHeader 
        title="Segmentasi Member" 
        subtitle="Kelompokkan member berdasarkan karakteristik tertentu untuk pengiriman pesan tepat sasaran." 
      />

      {/* Main Grid: Categories */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {Object.keys(categoryCfg).map(catKey => {
          const cfg = categoryCfg[catKey];
          const isActive = selectedCategory === catKey;
          const totalInCat = segments[catKey]?.reduce((sum, s) => sum + s.count, 0) || 0;
          
          return (
            <div
              key={catKey}
              onClick={() => {
                const firstSeg = segments[catKey]?.[0];
                if (firstSeg) handleSelectSegment(catKey, firstSeg);
              }}
              style={{
                ...cardStyle,
                cursor: 'pointer',
                border: isActive ? `2px solid ${cfg.color}` : '1px solid var(--border-color)',
                padding: '16px 18px',
                textAlign: 'center',
                transition: 'all 0.15s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                <cfg.icon size={20} color={cfg.color} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{cfg.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{segments[catKey]?.length || 0} Sub-segmen</div>
            </div>
          );
        })}
      </div>

      {/* Split Details: Left subsegments list, Right members list */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, flex: 1 }}>
        
        {/* Left Sub-segments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pilih Sub-segmen
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {segments[selectedCategory]?.map(seg => {
              const isActive = selectedSegment?.value === seg.value;
              const cfg = categoryCfg[selectedCategory];
              
              return (
                <div
                  key={seg.value}
                  onClick={() => handleSelectSegment(selectedCategory, seg)}
                  style={{
                    ...cardStyle,
                    cursor: 'pointer',
                    padding: '12px 14px',
                    border: isActive ? `1.5px solid ${cfg.color}` : '1px solid var(--border-color)',
                    background: isActive ? cfg.bg : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s'
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? cfg.color : 'var(--text-primary)' }}>{seg.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{seg.count} Member</div>
                  </div>
                  <ChevronRight size={15} color={isActive ? cfg.color : '#cbd5e1'} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Members list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          
          {/* Header Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daftar Member Segmen:</span>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                {selectedSegment?.name}
              </h3>
            </div>
            <button
              onClick={handleCreateBlast}
              disabled={memberList.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(135deg, var(--accent-blue), #4c6ef5)',
                color: 'white',
                fontSize: 13,
                fontWeight: 600,
                cursor: memberList.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: '0 3px 8px rgba(59, 91, 219, 0.2)'
              }}
            >
              <MessageSquare size={14} /> Kirim Pesan ke Segmen Ini
            </button>
          </div>

          {/* Members Table */}
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#fafafa' }}>
                    {['Nama Member', 'Email', 'Hewan Peliharaan', 'Kunjungan', 'Total Transaksi'].map(c => (
                      <th key={c} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {memberList.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                        <ListFilter size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                        <p style={{ fontSize: 13 }}>Tidak ada member dalam segmen ini.</p>
                      </td>
                    </tr>
                  ) : (
                    memberList.map((m, idx) => (
                      <tr key={m.id || idx} style={{ borderBottom: idx < memberList.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                          {m.name}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                          {m.email}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-primary)' }}>
                          {m.pets && m.pets.length > 0 ? (
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {m.pets.map(p => (
                                <span key={p} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: 4, fontSize: 11.5 }}>
                                  {p}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Tidak ada data</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {m.visits}x
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)' }}>
                          {formatRp(m.totalTransaksi || 0)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
