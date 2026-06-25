import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { queueService } from '../lib/supabaseService';
import { supabase } from '../lib/supabase';
import { 
  Users, CheckCircle2, UserPlus, Play, Check, 
  Trash2, Monitor, AlertCircle, XCircle
} from 'lucide-react';

const cardStyle = {
  background: 'white',
  borderRadius: 12,
  border: '1px solid var(--border-color)',
  boxShadow: 'var(--shadow-sm)',
  padding: '16px 20px',
  display: 'flex',
  alignItems: 'center',
  gap: 16
};

export default function Queue() {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWalkIn, setNewWalkIn] = useState({
    ownerName: '',
    petName: '',
    service: 'Konsultasi Dokter'
  });

  useEffect(() => {
    loadQueues();

    // Subscribe to real-time changes
    const channel = queueService.subscribeToChanges((updatedQueues) => {
      setQueues(updatedQueues);
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const loadQueues = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await queueService.getAll();
      setQueues(list);
    } catch (err) {
      setError('Gagal memuat data antrian.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await queueService.updateStatus(id, newStatus);
      await loadQueues();
    } catch (err) {
      console.error('Gagal update status antrian:', err);
    }
  };

  const handleAddWalkIn = async (e) => {
    e.preventDefault();
    if (!newWalkIn.ownerName || !newWalkIn.petName) return;

    try {
      await queueService.add({
        ownerName: newWalkIn.ownerName,
        petName: newWalkIn.petName,
        service: newWalkIn.service,
        type: 'Datang Sekarang'
      });

      setIsModalOpen(false);
      setNewWalkIn({
        ownerName: '',
        petName: '',
        service: 'Konsultasi Dokter'
      });

      await loadQueues();
    } catch (err) {
      console.error('Gagal menambah antrian walk-in:', err);
    }
  };

  const handleOpenDisplay = () => {
    window.open('/antrian/display', '_blank');
  };

  // Stats
  const activeQueueObj = queues.find(q => q.status === 'Dilayani');
  const activeQueueNum = activeQueueObj ? activeQueueObj.queueNumber : 'A-000';
  const activeQueueName = activeQueueObj ? `${activeQueueObj.ownerName} (${activeQueueObj.petName})` : 'Tidak ada';
  
  const waitingCount = queues.filter(q => q.status === 'Menunggu' || q.status === 'Dipanggil').length;
  const completedCount = queues.filter(q => q.status === 'Selesai').length;
  
  const nextQueueObj = queues.find(q => q.status === 'Menunggu');
  const nextQueueNum = nextQueueObj ? nextQueueObj.queueNumber : '-';

  const getStatusBadge = (status) => {
    let colors = {};
    switch (status) {
      case 'Selesai': colors = { bg: '#e6fcf5', text: '#0ca678' }; break;
      case 'Dilayani': colors = { bg: '#e7f5ff', text: '#1c7ed6' }; break;
      case 'Dipanggil': colors = { bg: '#fff0f6', text: '#e03131' }; break;
      case 'Batal': colors = { bg: '#f1f3f5', text: '#868e96' }; break;
      default: colors = { bg: '#fff9db', text: '#f08c00' };
    }
    return (
      <span style={{
        fontSize: 10.5,
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 12,
        background: colors.bg,
        color: colors.text
      }}>{status}</span>
    );
  };

  return (
    <div style={{ flex: 1, padding: 24, background: 'var(--bg-app)', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <PageHeader 
          title="Antrian Digital Klinik" 
          subtitle="Kelola nomor antrian pasien secara real-time untuk memandu kunjungan walk-in maupun terjadwal." 
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleOpenDisplay}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid var(--accent-blue)',
              background: 'var(--accent-blue-light)',
              color: 'var(--accent-blue)',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Monitor size={15} /> Tampilkan Display Layar
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent-blue), #4c6ef5)',
              color: 'white',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <UserPlus size={15} /> Tambah Antrian Walk-in
          </button>
        </div>
      </div>

      {/* 3 KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        <div style={cardStyle}>
          <div style={{ background: '#e7f5ff', color: '#1c7ed6', width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <Play size={20} />
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Sedang Dilayani</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{activeQueueNum}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{activeQueueName}</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ background: '#fff9db', color: '#f08c00', width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Antrian Menunggu</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{waitingCount}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Estimasi: {waitingCount * 15} Menit</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ background: '#e6fcf5', color: '#0ca678', width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Selesai Hari Ini</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{completedCount}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Pasien berhasil dilayani</div>
          </div>
        </div>
      </div>

      {/* Main Two Panels Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
        {/* Left Panel: Queues List */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)' }}>
            Daftar Antrian Hari Ini ({queues.length})
          </div>
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                Memuat data...
              </div>
            ) : error ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#e03131', fontSize: 13 }}>
                {error}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid var(--border-color)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {['Nomor', 'Member & Hewan', 'Layanan', 'Jam Daftar', 'Status', 'Tipe', 'Aksi'].map(col => (
                      <th key={col} style={{ padding: '12px 18px' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queues.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                        <AlertCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                        <p style={{ fontSize: 13 }}>Belum ada antrian terdaftar hari ini.</p>
                      </td>
                    </tr>
                  ) : (
                    queues.map((q, idx) => (
                      <tr key={q.id} style={{ borderBottom: idx < queues.length - 1 ? '1px solid var(--border-color)' : 'none', fontSize: 12.5 }}>
                        <td style={{ padding: '14px 18px', fontWeight: 850, color: 'var(--accent-blue)', fontSize: 14 }}>{q.queueNumber}</td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 650 }}>{q.ownerName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Pet: {q.petName}</div>
                        </td>
                        <td style={{ padding: '14px 18px', color: '#475569', fontWeight: 500 }}>{q.service}</td>
                        <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>{q.registeredTime}</td>
                        <td style={{ padding: '14px 18px' }}>{getStatusBadge(q.status)}</td>
                        <td style={{ padding: '14px 18px', fontSize: 11 }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: q.type === 'Jadwalkan' ? '#f3f0ff' : '#f8fafc',
                            color: q.type === 'Jadwalkan' ? '#7048e8' : '#64748b',
                            border: q.type === 'Jadwalkan' ? '1px solid #d0bfff' : '1px solid #e2e8f0'
                          }}>
                            {q.type === 'Jadwalkan' ? `📅 Booking (${q.appointmentTime})` : '🚶 Walk-in'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {q.status === 'Menunggu' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(q.id, 'Dipanggil')}
                                  style={{ padding: '4px 8px', borderRadius: 4, border: 'none', background: '#e03131', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Panggil
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(q.id, 'Batal')}
                                  style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border-color)', background: 'white', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}
                                >
                                  Lewati
                                </button>
                              </>
                            )}
                            {q.status === 'Dipanggil' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(q.id, 'Dilayani')}
                                  style={{ padding: '4px 8px', borderRadius: 4, border: 'none', background: 'var(--accent-blue)', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Layani
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(q.id, 'Dipanggil')} // Toggles storage event to blink on display screen
                                  style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ffa8a8', background: '#fff5f5', color: '#e03131', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Panggil Ulang
                                </button>
                              </>
                            )}
                            {q.status === 'Dilayani' && (
                              <button
                                onClick={() => handleUpdateStatus(q.id, 'Selesai')}
                                style={{ padding: '4px 8px', borderRadius: 4, border: 'none', background: 'var(--accent-teal)', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}
                              >
                                <Check size={11} /> Selesai
                              </button>
                            )}
                            {(q.status === 'Selesai' || q.status === 'Batal') && (
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>Tidak ada aksi</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Panel: Display Preview & Configs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Display Preview Screen */}
          <div style={{ background: '#0f172a', borderRadius: 12, padding: 20, color: 'white', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', tracking: '0.1em' }}>Tampilan Display Antrian</span>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0', width: '100%', borderBottom: '1px solid #1e293b', paddingBottom: 20 }}>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Sedang Dilayani</div>
              <div style={{ fontSize: '4rem', fontWeight: 900, color: '#4ade80', margin: '4px 0', lineHeight: 1 }}>{activeQueueNum}</div>
              <div style={{ fontSize: 11, color: '#475569' }}>LOKET UTAMA</div>
            </div>

            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8' }}>
              <span>Berikutnya: <strong style={{ color: 'white' }}>{nextQueueNum}</strong></span>
              <span>Menunggu: <strong style={{ color: 'white' }}>{waitingCount} Pasien</strong></span>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border-color)', padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Aksi Cepat</h4>
            <button
              onClick={async () => {
                if (window.confirm('Apakah Anda yakin ingin me-reset antrian hari ini? Semua nomor akan dihapus.')) {
                  try {
                    // Delete all queues one by one
                    for (const q of queues) {
                      await queueService.delete(q.id);
                    }
                    await loadQueues();
                  } catch (err) {
                    console.error('Gagal reset antrian:', err);
                  }
                }
              }}
              style={{
                width: '100%',
                padding: '9px 0',
                borderRadius: 8,
                border: '1px solid #ffa8a8',
                background: '#fff5f5',
                color: '#e03131',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Trash2 size={13} /> Reset Semua Antrian
            </button>
          </div>
        </div>
      </div>

      {/* WALK IN MANUAL MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            width: 400,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#1e293b', margin: 0 }}>Tambah Antrian Walk-in</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ border: 'none', background: 'none', color: '#64748b', fontSize: 16, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleAddWalkIn} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5 }}>NAMA MEMBER (PEMILIK)</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama pemilik..."
                  value={newWalkIn.ownerName}
                  onChange={e => setNewWalkIn(prev => ({ ...prev, ownerName: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5 }}>NAMA HEWAN</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama hewan..."
                  value={newWalkIn.petName}
                  onChange={e => setNewWalkIn(prev => ({ ...prev, petName: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 5 }}>JENIS LAYANAN</label>
                <select
                  value={newWalkIn.service}
                  onChange={e => setNewWalkIn(prev => ({ ...prev, service: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: 'white' }}
                >
                  <option value="Konsultasi Dokter">Konsultasi Dokter</option>
                  <option value="Vaksinasi">Vaksinasi</option>
                  <option value="Grooming">Grooming</option>
                  <option value="Pemeriksaan Darah">Pemeriksaan Darah</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: 'white', fontSize: 13, cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, var(--accent-blue), #4c6ef5)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Tambah Antrian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
