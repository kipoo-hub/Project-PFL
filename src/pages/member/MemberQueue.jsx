import React, { useState, useEffect } from 'react';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { crmState } from '../../lib/crmState';

export default function MemberQueue() {
  const { member } = useMemberAuth();
  const [queueList, setQueueList] = useState([]);
  const [myQueue, setMyQueue] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    petName: 'Buddy',
    service: 'Konsultasi Dokter',
    type: 'Datang Sekarang', // 'Datang Sekarang' | 'Jadwalkan'
    appointmentTime: '09:00 WIB'
  });

  useEffect(() => {
    crmState.init();
    loadQueue();

    // Auto refresh queue position every 5 seconds
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, [member]);

  const loadQueue = () => {
    const list = crmState.getQueue();
    setQueueList(list);

    // Find if current member has an active queue today
    const active = list.find(q => 
      (q.ownerName?.toLowerCase() === member?.name?.toLowerCase() || 
       (member?.email === 'demo@email.com' && q.ownerName === 'Budi Santoso')) &&
      ['Menunggu', 'Dipanggil', 'Dilayani'].includes(q.status)
    );
    setMyQueue(active || null);
  };

  const handleTakeQueue = (e) => {
    e.preventDefault();
    
    crmState.addQueue({
      ownerName: member?.name || 'Budi Santoso',
      petName: formData.petName,
      service: formData.service,
      type: formData.type,
      appointmentTime: formData.type === 'Jadwalkan' ? formData.appointmentTime : null
    });

    loadQueue();
    window.dispatchEvent(new Event('storage'));
  };

  const handleCancelQueue = () => {
    if (!myQueue) return;
    if (window.confirm('Apakah Anda yakin ingin membatalkan nomor antrian Anda?')) {
      crmState.updateQueueStatus(myQueue.id, 'Batal');
      loadQueue();
      window.dispatchEvent(new Event('storage'));
    }
  };

  // Calculate stats for active queue
  const getQueuePosition = () => {
    if (!myQueue) return 0;
    return queueList.filter(q => 
      ['Menunggu', 'Dipanggil'].includes(q.status) && 
      q.queueNumber < myQueue.queueNumber
    ).length;
  };

  const currentServing = queueList.find(q => q.status === 'Dilayani')?.queueNumber || 'Belum ada';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="md-page-header">
        <h1 className="md-page-header__welcome" style={{ fontSize: '1.4rem' }}>Antrian Digital Klinik</h1>
        <div className="md-page-header__sub">Ambil nomor antrian online untuk meminimalisir waktu tunggu di ruang tunggu klinik.</div>
      </div>

      {/* Main Grid: Left side details, Right side display info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
        {/* Left Panel: Taking Queue or Active Queue status */}
        <div>
          {myQueue ? (
            /* ACTIVE QUEUE CARD */
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', padding: 30, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Nomor Antrian Anda Aktif
              </span>
              
              <div style={{
                background: 'linear-gradient(135deg, #e6fcf5, #c3fae8)',
                border: '1.5px solid #63e6be',
                width: 150,
                height: 150,
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(12, 166, 120, 0.08)'
              }}>
                <span style={{ fontSize: '3rem', fontWeight: 900, color: '#0ca678', lineHeight: 1 }}>{myQueue.queueNumber}</span>
                <span style={{ fontSize: 11, color: '#0ca678', fontWeight: 700, marginTop: 4 }}>{myQueue.service}</span>
              </div>

              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  Status: <span style={{ color: myQueue.status === 'Dipanggil' ? '#e03131' : myQueue.status === 'Dilayani' ? '#1c7ed6' : '#f08c00' }}>
                    {myQueue.status === 'Dipanggil' ? '⚠️ SILAKAN MASUK (Dipanggil)' : myQueue.status === 'Dilayani' ? '🩺 Sedang Dilayani' : '⏳ Menunggu'}
                  </span>
                </h3>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: 0 }}>
                  Terdaftar untuk: <strong>{myQueue.petName}</strong> ({myQueue.registeredTime})
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, width: '100%', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '16px 0', marginTop: 10 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Antrian Di Depan Anda</div>
                  <div style={{ fontSize: 18, fontWeight: 850, color: '#334155', marginTop: 4 }}>{getQueuePosition()} Hewan</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Estimasi Tunggu</div>
                  <div style={{ fontSize: 18, fontWeight: 850, color: '#334155', marginTop: 4 }}>{getQueuePosition() * 15} Menit</div>
                </div>
              </div>

              <button
                onClick={handleCancelQueue}
                style={{
                  width: '100%',
                  padding: '11px 0',
                  borderRadius: 10,
                  border: '1px solid #ffa8a8',
                  background: '#fff5f5',
                  color: '#e03131',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                Batalkan Antrian
              </button>
            </div>
          ) : (
            /* TAKE QUEUE FORM */
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>Ambil Nomor Antrian Online</h3>
              <p style={{ fontSize: 12.5, color: '#64748b', marginBottom: 20 }}>Silakan isi detail layanan untuk mendapatkan nomor antrian digital Anda hari ini.</p>

              <form onSubmit={handleTakeQueue} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>PILIH HEWAN PELIHARAAN</label>
                    <select
                      value={formData.petName}
                      onChange={e => setFormData(prev => ({ ...prev, petName: e.target.value }))}
                      style={{ width: '100%', padding: '8.5px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: 'white' }}
                    >
                      <option value="Buddy">Buddy (Anjing)</option>
                      <option value="Luna">Luna (Kucing)</option>
                      <option value="Mochi">Mochi (Kelinci)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>JENIS LAYANAN</label>
                    <select
                      value={formData.service}
                      onChange={e => setFormData(prev => ({ ...prev, service: e.target.value }))}
                      style={{ width: '100%', padding: '8.5px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: 'white' }}
                    >
                      <option value="Konsultasi Dokter">Konsultasi Dokter</option>
                      <option value="Vaksinasi">Vaksinasi</option>
                      <option value="Grooming">Grooming</option>
                      <option value="Pemeriksaan Darah">Pemeriksaan Darah</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>WAKTU KEDATANGAN</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: 'Datang Sekarang' }))}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        borderRadius: 8,
                        border: formData.type === 'Datang Sekarang' ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                        background: formData.type === 'Datang Sekarang' ? '#f0fdf4' : 'white',
                        color: formData.type === 'Datang Sekarang' ? '#16a34a' : '#475569',
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      🚶 Datang Sekarang
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: 'Jadwalkan' }))}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        borderRadius: 8,
                        border: formData.type === 'Jadwalkan' ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                        background: formData.type === 'Jadwalkan' ? '#f0fdf4' : 'white',
                        color: formData.type === 'Jadwalkan' ? '#16a34a' : '#475569',
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      📅 Jadwalkan Jam
                    </button>
                  </div>
                </div>

                {formData.type === 'Jadwalkan' && (
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>PILIH JAM KEDATANGAN</label>
                    <select
                      value={formData.appointmentTime}
                      onChange={e => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                      style={{ width: '100%', padding: '8.5px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: 'white' }}
                    >
                      <option value="09:00 WIB">09:00 WIB</option>
                      <option value="10:00 WIB">10:00 WIB</option>
                      <option value="11:00 WIB">11:00 WIB</option>
                      <option value="13:30 WIB">13:30 WIB</option>
                      <option value="14:30 WIB">14:30 WIB</option>
                      <option value="15:30 WIB">15:30 WIB</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  style={{
                    marginTop: 8,
                    padding: '12px 0',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #16a34a, #0d9488)',
                    color: 'white',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)'
                  }}
                >
                  Ambil Nomor Antrian
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Panel: Display Info Monitor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Monitor Card */}
          <div style={{ background: '#0f172a', borderRadius: 16, padding: 20, color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', tracking: '0.1em' }}>Monitor Utama Klinik</span>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0', borderBottom: '1px solid #334155', paddingBottom: 20 }}>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Sedang Dilayani</div>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#4ade80', margin: '4px 0' }}>{currentServing}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Loket Pemeriksaan Dokter</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                <span style={{ color: '#94a3b8' }}>Total Antrian Hari Ini</span>
                <span style={{ fontWeight: 700 }}>{queueList.length} Antrian</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                <span style={{ color: '#94a3b8' }}>Antrian Menunggu</span>
                <span style={{ fontWeight: 700, color: '#f59e0b' }}>
                  {queueList.filter(q => ['Menunggu', 'Dipanggil'].includes(q.status)).length} Pasien
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                <span style={{ color: '#94a3b8' }}>Estimasi Waktu Tunggu Rata-rata</span>
                <span style={{ fontWeight: 700 }}>~15 Menit / Pasien</span>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div style={{ background: '#f8fafc', borderRadius: 16, padding: 20, border: '1px solid #f1f5f9', fontSize: 11.5, color: '#64748b', lineHeight: 1.5 }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#334155', fontWeight: 700 }}>💡 Panduan Antrian</h4>
            <ul style={{ paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Harap datang 10 menit sebelum nomor antrian Anda dipanggil.</li>
              <li>Tunjukkan halaman ini ke resepsionis saat tiba untuk konfirmasi kehadiran.</li>
              <li>Jika terlambat dipanggil lebih dari 3 nomor, antrian Anda akan dilewati dan harus mengambil antrian baru.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
