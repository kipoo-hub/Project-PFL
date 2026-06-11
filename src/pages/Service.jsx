import React, { useState } from 'react';
import {
  AlertTriangle, MessageSquare, Users2, BarChart2,
  Plus, Search, Clock, CheckCircle, AlertCircle, XCircle,
  Phone, Mail, Smartphone, ChevronRight, Edit2, Trash2,
  ArrowUpRight, PawPrint, User, Send, FileText, Shield,
  Zap, Timer, Activity,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { cases, communications, templates, queue, slaMetrics } from '../data/service';

// ─── Shared ────────────────────────────────────────────────────────────────────
const card = {
  background: 'var(--bg-card)',
  borderRadius: 'var(--radius-md)',
  padding: '20px 22px',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--border-color)',
};

const badge = (color, bg) => ({
  display: 'inline-flex', alignItems: 'center', gap: 4,
  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, color, background: bg,
});

const prioritasColor = {
  Kritis:  { c: '#e03131', bg: '#fff5f5' },
  Tinggi:  { c: '#f76707', bg: '#fff4e6' },
  Sedang:  { c: '#3b5bdb', bg: '#eef2ff' },
  Rendah:  { c: '#64748b', bg: '#f1f5f9' },
};
const statusCaseColor = {
  'Dalam Proses': { c: '#3b5bdb', bg: '#eef2ff' },
  'Menunggu Respons': { c: '#f76707', bg: '#fff4e6' },
  'Selesai': { c: '#0ca678', bg: '#e6fcf5' },
  'Eskalasi': { c: '#e03131', bg: '#fff5f5' },
};

// ─── Case Management ───────────────────────────────────────────────────────────
const CaseTab = () => {
  const [data] = useState(cases);
  const [selected, setSelected] = useState(null);
  const [filterPrioritas, setFilterPrioritas] = useState('Semua');

  const filtered = filterPrioritas === 'Semua' ? data : data.filter(c => c.prioritas === filterPrioritas);

  const prioritasIcons = { Kritis: '🔴', Tinggi: '🟠', Sedang: '🔵', Rendah: '⚪' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {['Semua', 'Kritis', 'Tinggi', 'Sedang', 'Rendah'].map(p => {
            const pc = prioritasColor[p] || { c: '#64748b', bg: '#f1f5f9' };
            return (
              <button
                key={p}
                onClick={() => setFilterPrioritas(p)}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 600,
                  background: filterPrioritas === p ? (p === 'Semua' ? '#1e293b' : pc.bg) : '#f1f5f9',
                  color: filterPrioritas === p ? (p === 'Semua' ? '#fff' : pc.c) : '#64748b',
                  cursor: 'pointer', transition: 'all 0.2s',
                  outline: filterPrioritas === p && p !== 'Semua' ? `2px solid ${pc.c}` : 'none',
                }}
              >
                {prioritasIcons[p] || ''} {p} {p !== 'Semua' ? `(${data.filter(c => c.prioritas === p).length})` : `(${data.length})`}
              </button>
            );
          })}
          <button id="btn-new-case" style={{
            display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto',
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: '#1e293b', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <Plus size={15} /> Buat Kasus
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(c => {
            const pr = prioritasColor[c.prioritas] || prioritasColor.Rendah;
            const st = statusCaseColor[c.status] || statusCaseColor['Dalam Proses'];
            const isSelected = selected?.id === c.id;
            const overdue = c.sla.resolusiAktual === null && c.status !== 'Selesai';

            return (
              <div
                key={c.id}
                id={`case-card-${c.id.toLowerCase()}`}
                onClick={() => setSelected(isSelected ? null : c)}
                style={{
                  ...card, cursor: 'pointer',
                  border: isSelected ? '1.5px solid #3b5bdb' : c.prioritas === 'Kritis' ? '1.5px solid #fee2e2' : '1px solid var(--border-color)',
                  borderLeft: `4px solid ${pr.c}`,
                  transition: 'all 0.2s', padding: '14px 18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{c.judul}</span>
                      <span style={badge(pr.c, pr.bg)}>{c.prioritas}</span>
                      <span style={badge(st.c, st.bg)}>{c.status}</span>
                      {c.status === 'Eskalasi' && <span style={{ fontSize: 11, color: '#e03131', fontWeight: 700 }}>⚠ ESKALASI</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span><PawPrint size={11} style={{ display: 'inline', marginRight: 3 }} />{c.hewan}</span>
                      <span><User size={11} style={{ display: 'inline', marginRight: 3 }} />{c.klien}</span>
                      <span>📁 {c.kategori}</span>
                      <span>👨‍⚕️ {c.assignedTo}</span>
                      <span style={{ color: overdue ? '#e03131' : '#0ca678' }}>
                        🎯 Target: {c.tanggalTarget}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                      {c.deskripsi}
                    </p>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{c.tanggalBuka}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Panel */}
      <div>
        {selected ? (
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Detail Kasus</h3>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{selected.id}</span>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{selected.judul}</div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selected.deskripsi}</p>
            </div>
            {/* SLA */}
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>SLA Status</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Target Respons</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{selected.sla.targetRespons} jam</div>
                  <div style={{ fontSize: 11, color: '#0ca678' }}>✓ Respons {selected.sla.responsAktual}j</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Target Resolusi</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{selected.sla.targetResolusi} jam</div>
                  <div style={{ fontSize: 11, color: selected.sla.resolusiAktual ? '#0ca678' : '#f76707' }}>
                    {selected.sla.resolusiAktual ? `✓ ${selected.sla.resolusiAktual}j` : '⏳ Dalam proses'}
                  </div>
                </div>
              </div>
            </div>
            {/* Timeline */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Riwayat Aksi</div>
              <div style={{ position: 'relative' }}>
                {selected.riwayatAksi.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, position: 'relative' }}>
                    <div style={{ flexShrink: 0 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={12} color="#3b5bdb" />
                      </div>
                      {i < selected.riwayatAksi.length - 1 && (
                        <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '2px auto' }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4 }}>{r.aksi}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{r.waktu} • {r.pelaku}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: 'var(--text-muted)' }}>
            <AlertTriangle size={40} strokeWidth={1.5} style={{ marginBottom: 12 }} />
            <div style={{ fontWeight: 600 }}>Pilih kasus untuk melihat detail</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Customer Communications ────────────────────────────────────────────────────
const CommunicationTab = () => {
  const [selected, setSelected] = useState('inbox');
  const channelIcon = { WhatsApp: MessageSquare, Email: Mail, SMS: Smartphone };
  const channelColor = { WhatsApp: '#25D366', Email: '#3b5bdb', SMS: '#f76707' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {/* Riwayat Komunikasi */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Riwayat Komunikasi</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {communications.map(c => {
            const Icon = channelIcon[c.tipe] || Mail;
            const cc = channelColor[c.tipe] || '#3b5bdb';
            return (
              <div key={c.id} style={{ ...card, padding: '14px 16px', borderLeft: `3px solid ${cc}`, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: cc + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={cc} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{c.klien}</span>
                      <span style={{ fontSize: 10, background: cc + '15', color: cc, padding: '1px 6px', borderRadius: 10, fontWeight: 600 }}>{c.tipe}</span>
                      <span style={{ fontSize: 10, color: c.arah === 'Keluar' ? '#0ca678' : '#3b5bdb', marginLeft: 'auto' }}>
                        {c.arah === 'Keluar' ? '↗ Keluar' : '↙ Masuk'}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)', marginBottom: 2 }}>{c.subjek}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {c.isi.substring(0, 80)}...
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.waktu}</span>
                      <span style={{ fontSize: 10, color: c.dibaca ? '#0ca678' : '#f76707', fontWeight: 600 }}>
                        {c.dibaca ? '✓✓ Dibaca' : '✓ Terkirim'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Templates */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>Template Pesan</h3>
          <button id="btn-new-template" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 8, border: 'none',
            background: '#1e293b', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            <Plus size={13} /> Buat Template
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {templates.map(t => {
            const cc = { WhatsApp: '#25D366', Email: '#3b5bdb', SMS: '#f76707' }[t.tipe] || '#3b5bdb';
            return (
              <div key={t.id} style={{ ...card, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{t.nama}</span>
                    <span style={{ fontSize: 10, background: cc + '15', color: cc, padding: '1px 7px', borderRadius: 10, fontWeight: 600 }}>{t.tipe}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><Edit2 size={13} /></button>
                    <button id={`use-template-${t.id.toLowerCase()}`} style={{
                      padding: '3px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                      background: '#eef2ff', color: '#3b5bdb', fontSize: 11, fontWeight: 600,
                    }}>Gunakan</button>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                  "{t.isi.substring(0, 100)}..."
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Queue Management ──────────────────────────────────────────────────────────
const QueueTab = () => {
  const [queueData, setQueueData] = useState(queue);
  const jenisColor = { 'Darurat': '#e03131', 'Konsultasi Umum': '#3b5bdb', 'Vaksinasi': '#0ca678', 'Grooming': '#7048e8' };

  const panggil = (id) => {
    setQueueData(prev => prev.map(q =>
      q.id === id ? { ...q, status: 'Sedang Ditangani' } : q
    ));
  };

  const selesai = (id) => {
    setQueueData(prev => prev.filter(q => q.id !== id));
  };

  return (
    <div>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Menunggu', val: queueData.filter(q => q.status === 'Menunggu').length, color: '#f76707', bg: '#fff4e6' },
          { label: 'Sedang Ditangani', val: queueData.filter(q => q.status === 'Sedang Ditangani').length, color: '#0ca678', bg: '#e6fcf5' },
          { label: 'Est. Tunggu Max', val: `${Math.max(0, ...queueData.filter(q => q.status === 'Menunggu').map(q => q.estimasiTunggu))} mnt`, color: '#3b5bdb', bg: '#eef2ff' },
          { label: 'Total Antrian', val: queueData.length, color: '#7048e8', bg: '#f3f0ff' },
        ].map(k => (
          <div key={k.label} style={{ ...card, textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: k.color }}>{k.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Antrian Aktif */}
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>🏥 Antrian Pasien — Live</h3>
          <button id="btn-add-queue" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 8, border: 'none',
            background: '#1e293b', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            <Plus size={13} /> Tambah Antrian
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              {['No.', 'Klien & Hewan', 'Jenis Layanan', 'Dokter/Staf', 'Masuk', 'Est. Tunggu', 'Status', 'Aksi'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {queueData.map((q, i) => (
              <tr key={q.id} style={{ borderBottom: i < queueData.length - 1 ? '1px solid var(--border-color)' : 'none', background: q.status === 'Sedang Ditangani' ? '#f0fdf4' : 'transparent' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#3b5bdb' }}>
                    {q.nomorAntrian}
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{q.klien}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <PawPrint size={10} /> {q.hewan}
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: jenisColor[q.jenis] || '#64748b', background: (jenisColor[q.jenis] || '#64748b') + '15', padding: '3px 10px', borderRadius: 20 }}>
                    {q.jenis}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{q.dokter}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 500 }}>{q.masuk}</td>
                <td style={{ padding: '14px 16px' }}>
                  {q.status === 'Sedang Ditangani' ? (
                    <span style={{ fontSize: 12, color: '#0ca678', fontWeight: 600 }}>✓ Sedang Ditangani</span>
                  ) : (
                    <span style={{ fontSize: 12, color: '#f76707', fontWeight: 600 }}>⏱ ~{q.estimasiTunggu} mnt</span>
                  )}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={badge(
                    q.status === 'Sedang Ditangani' ? '#0ca678' : '#f76707',
                    q.status === 'Sedang Ditangani' ? '#e6fcf5' : '#fff4e6'
                  )}>
                    {q.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {q.status === 'Menunggu' && (
                      <button
                        id={`call-queue-${q.id.toLowerCase()}`}
                        onClick={() => panggil(q.id)}
                        style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: '#eef2ff', color: '#3b5bdb', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Panggil
                      </button>
                    )}
                    {q.status === 'Sedang Ditangani' && (
                      <button
                        id={`done-queue-${q.id.toLowerCase()}`}
                        onClick={() => selesai(q.id)}
                        style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: '#e6fcf5', color: '#0ca678', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Selesai
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── SLA Management ─────────────────────────────────────────────────────────────
const SLATab = () => {
  const overallScore = Math.round(slaMetrics.reduce((s, m) => s + m.skorSLA, 0) / slaMetrics.length);

  return (
    <div>
      {/* Overall Score */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: `conic-gradient(#0ca678 ${overallScore * 3.6}deg, #f1f5f9 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{ width: 78, height: 78, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#0ca678' }}>{overallScore}%</span>
              <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>SKOR SLA</span>
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Service Level Agreement (SLA) Overview</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Pantau pemenuhan SLA untuk setiap kategori kasus. Target skor SLA keseluruhan adalah <strong>≥90%</strong>.
            Skor saat ini <strong style={{ color: overallScore >= 90 ? '#0ca678' : '#f76707' }}>{overallScore >= 90 ? 'memenuhi target ✓' : 'perlu perhatian ⚠'}</strong>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0ca678' }}>{slaMetrics.reduce((s, m) => s + m.onTime, 0)}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>On Time</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#e03131' }}>{slaMetrics.reduce((s, m) => s + m.terlambat, 0)}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Terlambat</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#3b5bdb' }}>{slaMetrics.reduce((s, m) => s + m.totalKasus, 0)}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Kasus</div>
          </div>
        </div>
      </div>

      {/* SLA per Kategori */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {slaMetrics.map(m => (
          <div key={m.kategori} style={{ ...card, borderLeft: `4px solid ${m.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{m.kategori}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>⚡ Respons: {m.targetRespons}</span>
                  <span>✅ Resolusi: {m.targetResolusi}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: m.skorSLA >= 90 ? '#0ca678' : '#f76707' }}>{m.skorSLA}%</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Skor SLA</div>
              </div>
            </div>
            {/* SLA Bar */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${m.skorSLA}%`, background: m.skorSLA >= 90 ? '#0ca678' : '#f76707', borderRadius: 4, transition: 'width 0.8s ease' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Kasus</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{m.totalKasus}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>On Time</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0ca678' }}>{m.onTime}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Terlambat</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: m.terlambat > 0 ? '#e03131' : '#94a3b8' }}>{m.terlambat}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Service Page ─────────────────────────────────────────────────────────
const tabs = [
  { id: 'kasus', label: 'Case Management', icon: AlertTriangle },
  { id: 'komunikasi', label: 'Komunikasi Klien', icon: MessageSquare },
  { id: 'antrian', label: 'Antrian & Routing', icon: Users2 },
  { id: 'sla', label: 'Service Level', icon: Shield },
];

const Service = () => {
  const [activeTab, setActiveTab] = useState('kasus');

  const openCases = cases.filter(c => c.status !== 'Selesai').length;
  const criticalCases = cases.filter(c => c.prioritas === 'Kritis').length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 24, overflowY: 'auto', background: 'var(--bg-app)' }}>
      <PageHeader
        title="Service Automation"
        subtitle="Kelola kasus klien, komunikasi, antrian pasien, dan pantau Service Level Agreement klinik."
      />

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Kasus Terbuka', val: openCases, icon: AlertCircle, color: '#f76707', bg: '#fff4e6' },
          { label: 'Kasus Kritis', val: criticalCases, icon: AlertTriangle, color: '#e03131', bg: '#fff5f5' },
          { label: 'Menunggu Antrian', val: queue.filter(q => q.status === 'Menunggu').length, icon: Clock, color: '#3b5bdb', bg: '#eef2ff' },
          { label: 'Skor SLA', val: '94.2%', icon: Shield, color: '#0ca678', bg: '#e6fcf5' },
        ].map(k => (
          <div key={k.label} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <k.icon size={18} color={k.color} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{k.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{k.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '2px solid var(--border-color)' }}>
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              id={`tab-service-${t.id}`}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', border: 'none', background: 'transparent',
                color: isActive ? '#3b5bdb' : '#64748b',
                fontWeight: isActive ? 700 : 500, fontSize: 13,
                cursor: 'pointer', borderBottom: `2px solid ${isActive ? '#3b5bdb' : 'transparent'}`,
                marginBottom: -2, transition: 'all 0.2s',
              }}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'kasus' && <CaseTab />}
      {activeTab === 'komunikasi' && <CommunicationTab />}
      {activeTab === 'antrian' && <QueueTab />}
      {activeTab === 'sla' && <SLATab />}
    </div>
  );
};

export default Service;
