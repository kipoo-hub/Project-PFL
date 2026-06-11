import React, { useState } from 'react';
import {
  Users, UserPlus, Target, Kanban, Phone, FileText, Package,
  Plus, Search, ChevronDown, Edit2, Trash2, Star, TrendingUp,
  Building2, Mail, MapPin, PawPrint, DollarSign, MoreHorizontal,
  ArrowRight, CheckCircle, Clock, AlertCircle, Filter,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import {
  accounts, leads, opportunities, pipelineStages, pipelineCards, products, quotations,
} from '../data/sales';

// ─── Shared ────────────────────────────────────────────────────────────────────
const card = {
  background: 'var(--bg-card)',
  borderRadius: 'var(--radius-md)',
  padding: '20px 22px',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--border-color)',
};

const badge = (color, bg) => ({
  display: 'inline-flex', alignItems: 'center',
  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, color, background: bg,
});

const segmenColor = { Premium: { c: '#7048e8', bg: '#f3f0ff' }, Regular: { c: '#3b5bdb', bg: '#eef2ff' }, Basic: { c: '#0ca678', bg: '#e6fcf5' } };
const leadStatusColor = {
  Baru: { c: '#3b5bdb', bg: '#eef2ff' },
  Dihubungi: { c: '#f76707', bg: '#fff4e6' },
  Kualifikasi: { c: '#7048e8', bg: '#f3f0ff' },
  Konversi: { c: '#0ca678', bg: '#e6fcf5' },
};
const nilaiColor = { Tinggi: { c: '#0ca678', bg: '#e6fcf5' }, Sedang: { c: '#f76707', bg: '#fff4e6' }, Rendah: { c: '#94a3b8', bg: '#f1f5f9' } };
const formatRp = (v) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

// ─── Account Management ────────────────────────────────────────────────────────
const AccountTab = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const filtered = accounts.filter(a =>
    a.nama.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
      <div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari akun klien..."
              style={{
                width: '100%', padding: '8px 12px 8px 34px', borderRadius: 8,
                border: '1px solid var(--border-color)', fontSize: 13, outline: 'none',
                background: '#fff',
              }}
            />
          </div>
          <button id="btn-new-account" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: '#1e293b', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <Plus size={15} /> Akun Baru
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(a => {
            const seg = segmenColor[a.segmen] || segmenColor.Basic;
            const isActive = selected?.id === a.id;
            return (
              <div
                key={a.id}
                id={`account-card-${a.id.toLowerCase()}`}
                onClick={() => setSelected(isActive ? null : a)}
                style={{
                  ...card, cursor: 'pointer', padding: '16px 18px',
                  border: isActive ? '1.5px solid #3b5bdb' : '1px solid var(--border-color)',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', background: seg.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    fontSize: 16, fontWeight: 700, color: seg.c,
                  }}>
                    {a.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{a.nama}</span>
                      <span style={badge(seg.c, seg.bg)}>{a.segmen}</span>
                      {a.status === 'Kritis' && <span style={badge('#e03131', '#fff5f5')}>⚠ Kritis</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <PawPrint size={11} /> {a.hewan.length} hewan
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <DollarSign size={11} /> {formatRp(a.totalTransaksi)}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} /> Sejak {a.sejak}
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={16} color="#cbd5e1" />
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Detail Akun</h3>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border-color)', background: '#fff', fontSize: 12, cursor: 'pointer' }}>Edit</button>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: 22, fontWeight: 700, color: '#3b5bdb' }}>
                {selected.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{selected.nama}</div>
              <span style={badge(segmenColor[selected.segmen]?.c || '#64748b', segmenColor[selected.segmen]?.bg || '#f1f5f9')}>{selected.segmen}</span>
            </div>
            {[
              { icon: Mail, val: selected.email },
              { icon: Phone, val: selected.telepon },
              { icon: MapPin, val: selected.alamat },
            ].map(({ icon: Icon, val }) => (
              <div key={val} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13, color: 'var(--text-secondary)' }}>
                <Icon size={14} color="#94a3b8" /> {val}
              </div>
            ))}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 8 }}>Hewan Peliharaan</div>
              {selected.hewan.map(h => (
                <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#f8fafc', borderRadius: 6, marginBottom: 6, fontSize: 12 }}>
                  <PawPrint size={13} color="#3b5bdb" /> {h}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: '12px', background: '#f8fafc', borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Statistik</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Total Transaksi</div><div style={{ fontWeight: 700, fontSize: 14 }}>{formatRp(selected.totalTransaksi)}</div></div>
                <div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Kunjungan</div><div style={{ fontWeight: 700, fontSize: 14 }}>{selected.kunjungan}x</div></div>
              </div>
            </div>
            <div style={{ marginTop: 12, padding: '10px 12px', background: '#fffbf0', borderRadius: 8, border: '1px solid #fde68a' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>📝 Catatan</div>
              <div style={{ fontSize: 12, color: '#78350f' }}>{selected.catatan}</div>
            </div>
          </div>
        ) : (
          <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: 'var(--text-muted)' }}>
            <Users size={40} strokeWidth={1.5} style={{ marginBottom: 12 }} />
            <div style={{ fontWeight: 600 }}>Pilih akun untuk melihat detail</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Lead Management ───────────────────────────────────────────────────────────
const LeadTab = () => {
  const [data, setData] = useState(leads);
  const sumberIcons = { Instagram: '📸', 'Referral - Budi Santoso': '👥', 'Google Maps': '📍', 'Walk-in': '🚶' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(leadStatusColor).map(([s, c]) => (
            <span key={s} style={{ ...badge(c.c, c.bg), cursor: 'pointer' }}>{s}: {data.filter(l => l.status === s).length}</span>
          ))}
        </div>
        <button id="btn-new-lead" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 8, border: 'none',
          background: '#1e293b', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          <Plus size={15} /> Lead Baru
        </button>
      </div>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              {['Nama', 'Sumber', 'Hewan', 'Layanan Minat', 'Nilai', 'Status', 'Assigned To', 'Aksi'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((l, i) => {
              const st = leadStatusColor[l.status] || { c: '#64748b', bg: '#f1f5f9' };
              const nv = nilaiColor[l.nilai] || nilaiColor.Rendah;
              return (
                <tr key={l.id} style={{ borderBottom: i < data.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{l.nama}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.email}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>
                    {sumberIcons[l.sumber] || '📌'} {l.sumber}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-primary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><PawPrint size={12} color="#3b5bdb" /> {l.hewan}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>{l.layananMinat}</td>
                  <td style={{ padding: '14px 16px' }}><span style={badge(nv.c, nv.bg)}>{l.nilai}</span></td>
                  <td style={{ padding: '14px 16px' }}><span style={badge(st.c, st.bg)}>{l.status}</span></td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>{l.assignedTo}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><Edit2 size={13} /></button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Pipeline / Kanban ─────────────────────────────────────────────────────────
const PipelineTab = () => {
  const [cards, setCards] = useState(pipelineCards);
  const [dragItem, setDragItem] = useState(null);

  const moveCard = (cardId, newStage) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, stage: newStage } : c));
  };

  const totalPerStage = (stageId) => {
    const stageCards = cards.filter(c => c.stage === stageId);
    return stageCards.reduce((sum, c) => sum + c.nilai, 0);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Total Pipeline: <strong style={{ color: 'var(--text-primary)' }}>{formatRp(cards.reduce((s, c) => s + c.nilai, 0))}</strong>
        </p>
        <button id="btn-new-pipeline" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 8, border: 'none',
          background: '#1e293b', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          <Plus size={15} /> Tambah Deal
        </button>
      </div>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
        {pipelineStages.map(stage => {
          const stageCards = cards.filter(c => c.stage === stage.id);
          return (
            <div
              key={stage.id}
              id={`pipeline-stage-${stage.id}`}
              style={{ minWidth: 220, flex: '0 0 220px' }}
              onDragOver={e => e.preventDefault()}
              onDrop={() => dragItem && moveCard(dragItem, stage.id)}
            >
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: stage.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stage.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{stageCards.length}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatRp(totalPerStage(stage.id))}</div>
                <div style={{ height: 3, background: stage.bgColor, borderRadius: 2, marginTop: 6, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '100%', background: stage.color, borderRadius: 2 }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stageCards.map(c => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={() => setDragItem(c.id)}
                    onDragEnd={() => setDragItem(null)}
                    style={{
                      background: '#fff', borderRadius: 10, padding: '12px 14px',
                      border: `1px solid ${dragItem === c.id ? stage.color : 'var(--border-color)'}`,
                      boxShadow: 'var(--shadow-sm)', cursor: 'grab', transition: 'all 0.2s',
                      opacity: dragItem === c.id ? 0.5 : 1,
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{c.nama}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <PawPrint size={10} /> {c.hewan}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{c.layanan}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: stage.color }}>{formatRp(c.nilai)}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', background: '#f8fafc', padding: '2px 6px', borderRadius: 4 }}>{c.assignedTo}</span>
                    </div>
                    {/* Move buttons */}
                    <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                      {pipelineStages.filter(s => s.id !== stage.id).map(s => (
                        <button
                          key={s.id}
                          onClick={() => moveCard(c.id, s.id)}
                          style={{
                            padding: '2px 8px', borderRadius: 4, border: `1px solid ${s.color}`,
                            background: s.bgColor, color: s.color, fontSize: 10, cursor: 'pointer', fontWeight: 600,
                          }}
                        >
                          → {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Product Configuration ─────────────────────────────────────────────────────
const ProductTab = () => {
  const kategoriList = ['Semua', ...new Set(products.map(p => p.kategori))];
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const filtered = products.filter(p =>
    (filter === 'Semua' || p.kategori === filter) &&
    p.nama.toLowerCase().includes(search.toLowerCase())
  );
  const kategoriColor = { Medis: '#3b5bdb', Vaksinasi: '#0ca678', Grooming: '#7048e8', Operasi: '#e03131', Penitipan: '#f76707', Laboratorium: '#94a3b8' };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari layanan..." style={{ padding: '8px 12px 8px 34px', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: 13, outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
          {kategoriList.map(k => (
            <button key={k} onClick={() => setFilter(k)} style={{
              padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 600,
              background: filter === k ? '#1e293b' : '#f1f5f9',
              color: filter === k ? '#fff' : '#64748b', cursor: 'pointer',
            }}>{k}</button>
          ))}
        </div>
        <button id="btn-new-product" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 8, border: 'none',
          background: '#1e293b', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          <Plus size={15} /> Layanan Baru
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ ...card, opacity: p.tersedia ? 1 : 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={badge(kategoriColor[p.kategori] || '#64748b', (kategoriColor[p.kategori] || '#64748b') + '18')}>{p.kategori}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: p.tersedia ? '#0ca678' : '#94a3b8', background: p.tersedia ? '#e6fcf5' : '#f1f5f9', padding: '2px 8px', borderRadius: 20 }}>
                {p.tersedia ? '✓ Tersedia' : '✗ Tidak Tersedia'}
              </span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.nama}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>{p.deskripsi}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#3b5bdb' }}>{formatRp(p.harga)}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', background: '#f8fafc', padding: '3px 8px', borderRadius: 6 }}>⏱ {p.durasi}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Quotation Tab ─────────────────────────────────────────────────────────────
const QuotationTab = () => {
  const statusColor = { Menunggu: { c: '#f76707', bg: '#fff4e6' }, Diterima: { c: '#0ca678', bg: '#e6fcf5' }, Ditolak: { c: '#e03131', bg: '#fff5f5' } };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button id="btn-new-quotation" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 8, border: 'none',
          background: '#1e293b', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          <Plus size={15} /> Buat Quotation
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {quotations.map(q => {
          const subtotal = q.items.reduce((s, i) => s + i.qty * i.harga, 0);
          const diskonAmt = subtotal * (q.diskon / 100);
          const total = subtotal - diskonAmt;
          const st = statusColor[q.status] || statusColor.Menunggu;
          return (
            <div key={q.id} style={card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{q.id}</span>
                    <span style={badge(st.c, st.bg)}>{q.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {q.namaKlien} • Dibuat: {q.tanggal} • Valid hingga: {q.validHingga}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#3b5bdb' }}>{formatRp(total)}</div>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Layanan/Produk', 'Qty', 'Harga Satuan', 'Subtotal'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {q.items.map((item, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px 12px' }}>{item.produk}</td>
                      <td style={{ padding: '8px 12px' }}>{item.qty}x</td>
                      <td style={{ padding: '8px 12px' }}>{formatRp(item.harga)}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{formatRp(item.qty * item.harga)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 40, fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal: {formatRp(subtotal)}</span>
                <span style={{ color: '#0ca678' }}>Diskon ({q.diskon}%): -{formatRp(diskonAmt)}</span>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Total: {formatRp(total)}</span>
              </div>
              {q.catatan && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: '#fffbf0', borderRadius: 6, border: '1px solid #fde68a', fontSize: 12, color: '#92400e' }}>
                  📝 {q.catatan}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Opportunity Tab ────────────────────────────────────────────────────────────
const OpportunityTab = () => {
  const stageColor = {
    Konsultasi: { c: '#3b5bdb', bg: '#eef2ff' },
    Proposal: { c: '#f76707', bg: '#fff4e6' },
    Negosiasi: { c: '#7048e8', bg: '#f3f0ff' },
    Closing: { c: '#0ca678', bg: '#e6fcf5' },
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Total Nilai: <strong style={{ color: '#3b5bdb', fontSize: 16 }}>{formatRp(opportunities.reduce((s, o) => s + o.nilai, 0))}</strong>
        </div>
        <button id="btn-new-opportunity" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 8, border: 'none',
          background: '#1e293b', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          <Plus size={15} /> Opportunity Baru
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
        {opportunities.map(o => {
          const st = stageColor[o.stage] || stageColor.Konsultasi;
          return (
            <div key={o.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={badge(st.c, st.bg)}>{o.stage}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tutup: {o.tanggalTutup}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{o.nama}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                👤 {o.namaAkun} • 📋 {o.layanan}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>{formatRp(o.nilai)}</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>oleh {o.assignedTo}</span>
              </div>
              {/* Probability bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>Probabilitas Closing</span>
                  <span style={{ fontWeight: 700, color: st.c }}>{o.probabilitas}%</span>
                </div>
                <div style={{ height: 5, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${o.probabilitas}%`, background: st.c, borderRadius: 4, transition: 'width 0.6s' }} />
                </div>
              </div>
              {o.catatan && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>💬 {o.catatan}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main Sales Page ────────────────────────────────────────────────────────────
const tabs = [
  { id: 'account', label: 'Account', icon: Building2 },
  { id: 'lead', label: 'Lead', icon: UserPlus },
  { id: 'opportunity', label: 'Opportunity', icon: Target },
  { id: 'pipeline', label: 'Pipeline', icon: Kanban },
  { id: 'quotation', label: 'Quotation', icon: FileText },
  { id: 'product', label: 'Produk & Layanan', icon: Package },
];

const Sales = () => {
  const [activeTab, setActiveTab] = useState('account');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 24, overflowY: 'auto', background: 'var(--bg-app)' }}>
      <PageHeader
        title="Sales Force Automation"
        subtitle="Kelola akun klien, lead, peluang, dan pipeline penjualan layanan klinik hewan."
      />

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Akun', val: accounts.length, icon: Users, color: '#3b5bdb', bg: '#eef2ff' },
          { label: 'Lead Aktif', val: leads.filter(l => l.status !== 'Konversi').length, icon: UserPlus, color: '#f76707', bg: '#fff4e6' },
          { label: 'Nilai Pipeline', val: 'Rp 11,3 Jt', icon: TrendingUp, color: '#0ca678', bg: '#e6fcf5' },
          { label: 'Opportunity', val: opportunities.length, icon: Target, color: '#7048e8', bg: '#f3f0ff' },
        ].map(k => (
          <div key={k.label} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <k.icon size={18} color={k.color} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{k.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{k.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '2px solid var(--border-color)', paddingBottom: 0 }}>
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              id={`tab-sales-${t.id}`}
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

      {activeTab === 'account' && <AccountTab />}
      {activeTab === 'lead' && <LeadTab />}
      {activeTab === 'opportunity' && <OpportunityTab />}
      {activeTab === 'pipeline' && <PipelineTab />}
      {activeTab === 'quotation' && <QuotationTab />}
      {activeTab === 'product' && <ProductTab />}
    </div>
  );
};

export default Sales;
