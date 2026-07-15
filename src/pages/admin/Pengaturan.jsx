import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { Settings, Save, MapPin, Clock, ShieldAlert } from 'lucide-react';

export default function Pengaturan() {
  const [config, setConfig] = useState({
    clinicName: 'PetCare Veteriner Clinic',
    phone: '0812-3456-7890',
    address: 'Jl. Raya Kencana No. 45, Jakarta Selatan',
    openTime: '08:00',
    closeTime: '21:00',
    slaTarget: '30'
  });

  const handleSave = (e) => {
    e.preventDefault();
    alert('Pengaturan klinik berhasil diperbarui secara lokal!');
  };

  return (
    <div style={{ padding: 24, flex: 1, overflowY: 'auto', background: '#F7F8FC' }}>
      <PageHeader title="Pengaturan Klinik" subtitle="Sesuaikan parameter operasional, informasi kontak, dan target SLA layanan." />

      <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', maxWidth: 640 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: '#3B82F6' }}>
          <Settings size={20} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>Konfigurasi Klinik</h3>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Nama Klinik</label>
              <input type="text" value={config.clinicName} onChange={e => setConfig({ ...config, clinicName: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>No. WhatsApp / HP</label>
              <input type="text" value={config.phone} onChange={e => setConfig({ ...config, phone: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Alamat Instansi</label>
            <input type="text" value={config.address} onChange={e => setConfig({ ...config, address: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Jam Buka Klinik</label>
              <input type="time" value={config.openTime} onChange={e => setConfig({ ...config, openTime: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Jam Tutup Klinik</label>
              <input type="time" value={config.closeTime} onChange={e => setConfig({ ...config, closeTime: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Target SLA Respon Chat (Menit)</label>
            <input type="number" value={config.slaTarget} onChange={e => setConfig({ ...config, slaTarget: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, boxSizing: 'border-box' }} />
            <span style={{ fontSize: 11, color: '#9CA3AF', display: 'block', marginTop: 4 }}>Batas waktu toleransi dokter untuk membalas chat sebelum ditandai 'Terlambat'.</span>
          </div>

          <button type="submit" style={{ display: 'flex', alignItems: 'center', justify: 'center', gap: 8, background: '#3B82F6', color: 'white', border: 'none', padding: '12px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,130,246,0.3)', marginTop: 10 }}>
            <Save size={15} /> Simpan Pengaturan
          </button>
        </form>
      </div>
    </div>
  );
}
