import React, { useState, useEffect, useRef } from 'react';
import { queueService } from '../lib/supabaseService';
import { supabase } from '../lib/supabase';
import { PawPrint } from 'lucide-react';

export default function QueueDisplay() {
  const [queues, setQueues] = useState([]);
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [blinkActive, setBlinkActive] = useState(false);
  const [lastCalledId, setLastCalledId] = useState(null);

  const lastCalledIdRef = useRef(lastCalledId);
  lastCalledIdRef.current = lastCalledId;

  useEffect(() => {
    loadQueues();

    // Clock effect
    const clockInterval = setInterval(() => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');

      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      setDateStr(`${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`);
    }, 1000);

    // Supabase real-time subscription
    const channel = queueService.subscribeToChanges(() => {
      loadQueues();
    });

    return () => {
      clearInterval(clockInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  const loadQueues = async () => {
    try {
      const list = await queueService.getAll();
      setQueues(list);

      // Blinking trigger: if a queue changes status to 'Dipanggil'
      const currentlyCalling = list.find(q => q.status === 'Dipanggil');
      if (currentlyCalling) {
        if (currentlyCalling.id !== lastCalledIdRef.current) {
          setLastCalledId(currentlyCalling.id);
          triggerBlink();
        }
      } else {
        setLastCalledId(null);
      }
    } catch (err) {
      console.error('Gagal memuat antrian:', err);
    }
  };

  const triggerBlink = () => {
    setBlinkActive(true);
    // Blink for 4 seconds
    setTimeout(() => {
      setBlinkActive(false);
    }, 4000);
  };

  const activeQueue = queues.find(q => q.status === 'Dilayani' || q.status === 'Dipanggil');
  const upcomingQueues = queues.filter(q => q.status === 'Menunggu').slice(0, 3);
  const remainingCount = queues.filter(q => q.status === 'Menunggu').length;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#090d16',
      color: '#f8fafc',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Blinking Animation CSS */}
      <style>{`
        @keyframes callingBlink {
          0%, 100% { background-color: #0f172a; border-color: #334155; }
          50% { background-color: #7f1d1d; border-color: #ef4444; box-shadow: 0 0 40px rgba(239, 68, 68, 0.4); }
        }
        .calling-card-blink {
          animation: callingBlink 0.8s ease infinite;
        }
      `}</style>

      {/* TOP HEADER */}
      <header style={{
        padding: '24px 48px',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#0f172a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: '#0ca678',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(12, 166, 120, 0.3)'
          }}>
            <PawPrint size={22} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
              Veterinario<span style={{ color: '#0ca678' }}>.</span>
            </span>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: '#64748b', uppercase: true, letterSpacing: '0.12em', marginTop: 2 }}>
              PETCARE CLINIC LOBBY SCREEN
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>{timeStr || '--:--:-- WIB'}</div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginTop: 4 }}>{dateStr || 'Loading...'}</div>
        </div>
      </header>

      {/* MAIN SCREEN AREA */}
      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40, padding: 48, boxSizing: 'border-box' }}>
        
        {/* LEFT COLUMN: ACTIVE SERVING PATIENT */}
        <section style={{
          background: '#0f172a',
          borderRadius: 24,
          border: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          padding: 40,
          boxSizing: 'border-box',
          transition: 'all 0.3s'
        }}
        className={blinkActive ? 'calling-card-blink' : ''}
        >
          {activeQueue ? (
            <>
              <span style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: activeQueue.status === 'Dipanggil' ? '#f87171' : '#34d399',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                {activeQueue.status === 'Dipanggil' ? '🔔 SEDANG DIPANGGIL' : '🩺 SEDANG DILAYANI'}
              </span>
              
              <div style={{
                fontSize: '10rem',
                fontWeight: 900,
                color: activeQueue.status === 'Dipanggil' ? '#ef4444' : '#10b981',
                lineHeight: 1,
                letterSpacing: '-0.02em'
              }}>
                {activeQueue.queueNumber}
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
                  {activeQueue.ownerName}
                </div>
                <div style={{ fontSize: '1.2rem', color: '#64748b', marginTop: 8 }}>
                  Layanan: <strong style={{ color: '#94a3b8' }}>{activeQueue.service}</strong> · Pasien: <strong style={{ color: '#94a3b8' }}>{activeQueue.petName}</strong>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#475569' }}>
              <span style={{ fontSize: '4rem', display: 'block', marginBottom: 20 }}>🩺</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Belum Ada Antrian Dilayani</h2>
              <p style={{ fontSize: '1rem', marginTop: 8 }}>Loket pemeriksaan sedang kosong.</p>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: UPCOMING QUEUES */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Next List */}
          <div style={{
            background: '#0f172a',
            borderRadius: 24,
            border: '1px solid #1e293b',
            flex: 1,
            padding: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 800,
              color: '#38bdf8',
              borderBottom: '1px solid #1e293b',
              paddingBottom: 14,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Antrian Berikutnya
            </h3>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {upcomingQueues.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: '#475569', fontSize: '1rem' }}>
                  Tidak ada antrian menunggu berikutnya.
                </div>
              ) : (
                upcomingQueues.map((q, idx) => (
                  <div 
                    key={q.id}
                    style={{
                      background: '#1e293b',
                      borderRadius: 16,
                      padding: '16px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid #334155'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                        {q.ownerName}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>
                        Layanan: {q.service} · Pasien: {q.petName}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 900,
                      color: '#38bdf8'
                    }}>
                      {q.queueNumber}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Queue Statistics */}
          <div style={{
            background: '#0ca67820',
            borderRadius: 20,
            border: '1.5px solid #0ca67840',
            padding: '20px 30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>Sisa Antrian Menunggu</div>
              <div style={{ fontSize: '0.85rem', color: '#0ca678', fontWeight: 600, marginTop: 4 }}>
                Estimasi tunggu rata-rata ~15 menit
              </div>
            </div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 950,
              color: '#0ca678'
            }}>
              {remainingCount} <span style={{ fontSize: '1rem', fontWeight: 700, color: '#94a3b8' }}>Pasien</span>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer style={{
        padding: '16px 48px',
        borderTop: '1px solid #1e293b',
        background: '#090d16',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#475569',
        fontWeight: 500
      }}>
        Diharapkan membawa rekam medis hewan kesayangan Anda. Terima kasih atas kerja samanya.
      </footer>
    </div>
  );
}
