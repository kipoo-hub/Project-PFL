import React from 'react';
import PageHeader from '../../components/PageHeader';
import { Megaphone, Layers, Send, Bell, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CampaignManagement() {
  const campaigns = [
    { title: 'Promo Vaksinasi Tahunan', channel: 'WhatsApp', status: 'Aktif', reached: '350 member', conversions: '42 janji temu' },
    { title: 'Diskon Sterilisasi Kucing', channel: 'Email', status: 'Selesai', reached: '1,200 member', conversions: '89 steril' },
    { title: 'Program Loyalti Bronze ke Silver', channel: 'In-App', status: 'Aktif', reached: '150 member', conversions: '31 upgrade' }
  ];

  return (
    <div style={{ padding: 24, flex: 1, overflowY: 'auto', background: '#F7F8FC' }}>
      <PageHeader title="Campaign Management" subtitle="Rencanakan, kirim, dan pantau kampanye promosi serta loyalitas klinik Anda." />

      {/* Marketing channels grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Segmentasi Member', desc: 'Kelompokkan pelanggan berdasarkan ketertarikan/kunjungan.', icon: Layers, path: '/segmentasi', color: '#8B5CF6', bg: '#F5F3FF' },
          { label: 'Pesan Massal (Blast)', desc: 'Kirim promosi/pengumuman serentak via WA & SMS.', icon: Send, path: '/blast', color: '#4F46E5', bg: '#EEF2FF' },
          { label: 'Reminder Vaksin', desc: 'Pengingat otomatis jadwal vaksinasi terjadwal.', icon: Bell, path: '/reminder', color: '#F59E0B', bg: '#FFFBEB' },
        ].map((item, idx) => (
          <div key={idx} style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
              <item.icon size={20} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 700 }}>{item.label}</h4>
              <p style={{ margin: '0 0 14px 0', fontSize: 13, color: '#6B7280', lineHeight: 1.4 }}>{item.desc}</p>
              <Link to={item.path} style={{ display: 'inline-block', fontSize: 13, color: item.color, fontWeight: 600, textDecoration: 'none' }}>
                Buka Layanan &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign List */}
      <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Megaphone size={18} color="#4F46E5" />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Kampanye Promosi Saat Ini</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {campaigns.map((c, idx) => (
            <div key={idx} style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 700 }}>{c.title}</h4>
                <div style={{ display: 'flex', gap: 10, fontSize: 12, color: '#6B7280' }}>
                  <span>Saluran: <strong>{c.channel}</strong></span>
                  <span>&bull;</span>
                  <span>Jangkauan: <strong>{c.reached}</strong></span>
                  <span>&bull;</span>
                  <span>Hasil Konversi: <strong style={{ color: '#10B981' }}>{c.conversions}</strong></span>
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12, background: c.status === 'Aktif' ? '#D1FAE5' : '#E5E7EB', color: c.status === 'Aktif' ? '#059669' : '#4B5563' }}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
