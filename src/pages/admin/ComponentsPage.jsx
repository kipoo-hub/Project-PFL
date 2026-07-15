import React from 'react';
import PageHeader from '../../components/PageHeader';
import { Component, HelpCircle } from 'lucide-react';

export default function ComponentsPage() {
  return (
    <div style={{ padding: 24, flex: 1, overflowY: 'auto', background: '#F7F8FC' }}>
      <PageHeader title="UI Components Showcase" subtitle="Pratinjau elemen antarmuka (UI) standar yang digunakan dalam sistem manajemen PetCare." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Buttons Section */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700 }}>Tombol (Buttons)</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>Primary Button</button>
            <button style={{ background: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>Success Button</button>
            <button style={{ background: '#EF4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>Danger Button</button>
            <button style={{ background: 'white', border: '1px solid #E5E7EB', color: '#4B5563', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>Secondary Button</button>
          </div>
        </div>

        {/* Status Badges Section */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700 }}>Lencana Status (Status Badges)</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ padding: '3px 10px', borderRadius: 20, background: '#D1FAE5', color: '#059669', fontSize: 11, fontWeight: 700 }}>Selesai / Lunas</span>
            <span style={{ padding: '3px 10px', borderRadius: 20, background: '#FEF3C7', color: '#D97706', fontSize: 11, fontWeight: 700 }}>Menunggu / Pending</span>
            <span style={{ padding: '3px 10px', borderRadius: 20, background: '#FEE2E2', color: '#DC2626', fontSize: 11, fontWeight: 700 }}>Batal / Gagal</span>
            <span style={{ padding: '3px 10px', borderRadius: 20, background: '#DBEAFE', color: '#2563EB', fontSize: 11, fontWeight: 700 }}>Dalam Proses</span>
          </div>
        </div>
      </div>
    </div>
  );
}
