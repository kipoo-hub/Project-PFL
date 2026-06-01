import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Basic/Button';
import LogoAvatar from '../components/Basic/LogoAvatar';
import Card from '../components/Layout/Card';
import Divider from '../components/Layout/Divider';
import KpiCard from '../components/DataDisplay/KpiCard';
import StatusBadge from '../components/DataDisplay/StatusBadge';
import ProgressBar from '../components/DataDisplay/ProgressBar';
import Input from '../components/Form/Input';
import Select from '../components/Form/Select';
import AlertBanner from '../components/Feedback/AlertBanner';
import EmptyState from '../components/Feedback/EmptyState';
import LoadingSpinner from '../components/Feedback/LoadingSpinner';

import { 
  Download, Filter, PawPrint, Users, TrendingUp, Clock, 
  Mail, Search, Bell, Lock, CheckCircle2, Inbox
} from 'lucide-react';

const SectionHeader = ({ num, title, subtitle }) => (
  <div style={{ marginBottom: 16 }}>
    <h3 style={{ 
      fontSize: 18, 
      fontWeight: 600, 
      color: 'var(--text-primary)', 
      marginBottom: 4,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }}>
      {num}. {title}
    </h3>
    <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
      {subtitle}
    </p>
  </div>
);

const PlaygroundContainer = ({ children }) => (
  <div style={{
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    padding: 24,
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 24,
    alignItems: 'flex-start'
  }}>
    {children}
  </div>
);

const ComponentBox = ({ title, children, fullWidth = false }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: fullWidth ? '100%' : 'auto' }}>
    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {title}
    </span>
    <div>{children}</div>
  </div>
);

export default function Components() {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: 24,
      overflowY: 'auto',
      background: 'var(--bg-app)',
    }}>
      <PageHeader
        title="Components Library"
        subtitle="Kumpulan komponen UI terpisah (Reusable Components)."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        {/* 1. Basic Component */}
        <section>
          <SectionHeader num="1" title="Basic Component" subtitle="Tombol, Ikon, Tipografi, dan Avatar" />
          <PlaygroundContainer>
            <ComponentBox title="1. Primary Button">
              <Button variant="primary" icon={<Download size={14} />}>Export Data</Button>
            </ComponentBox>
            
            <ComponentBox title="2. Outline Button">
              <Button variant="outline" icon={<Filter size={14} />}>Filter</Button>
            </ComponentBox>

            <ComponentBox title="3. Danger Button">
              <Button variant="danger">Hapus Data</Button>
            </ComponentBox>

            <ComponentBox title="4. Icon Button (Notification)">
              <Button variant="icon" icon={<Bell size={18} />}>
                <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: 'var(--accent-red)', borderRadius: '50%', border: '2px solid white' }} />
              </Button>
            </ComponentBox>

            <ComponentBox title="5. Gradient Avatar / Logo">
              <LogoAvatar size={40} iconSize={20} />
            </ComponentBox>
          </PlaygroundContainer>
        </section>

        {/* 2. Layout Component */}
        <section>
          <SectionHeader num="2" title="Layout Component" subtitle="Struktur tata letak, Kontainer, dan Pembatas" />
          <PlaygroundContainer>
            <ComponentBox title="6. App Layout Mockup" fullWidth>
              <div style={{ display: 'flex', width: '100%', height: 160, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ width: 64, background: 'var(--bg-sidebar)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', gap: 16 }}>
                  <LogoAvatar size={32} iconSize={16} />
                  <div style={{ width: 32, height: 32, background: 'var(--bg-sidebar-active)', borderRadius: 8 }} />
                  <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
                  <div style={{ height: 40, background: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                    <div style={{ width: 80, height: 16, background: 'var(--bg-app)', borderRadius: 4, border: '1px solid var(--border-color)' }} />
                  </div>
                  <div style={{ padding: 16, display: 'flex', gap: 12 }}>
                    <Card style={{ flex: 1, height: 60, padding: 0 }} />
                    <Card style={{ flex: 1, height: 60, padding: 0 }} />
                  </div>
                </div>
              </div>
            </ComponentBox>

            <ComponentBox title="7. Card Container">
              <Card style={{ width: 200, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13, borderStyle: 'dashed' }}>
                Konten di sini
              </Card>
            </ComponentBox>

            <ComponentBox title="8. Divider with Text">
              <Divider text="ATAU" style={{ width: 200, marginTop: 30 }} />
            </ComponentBox>
          </PlaygroundContainer>
        </section>

        {/* 3. Data Display Component */}
        <section>
          <SectionHeader num="3" title="Data Display Component" subtitle="Kartu Informasi, Status, dan List Data" />
          <PlaygroundContainer>
            <ComponentBox title="9. KPI Card">
              <KpiCard
                title="Total Pasien"
                value="1.284"
                icon={Users}
                iconBg="var(--accent-blue-light)"
                iconColor="var(--accent-blue)"
                trend="up"
                trendValue="+12%"
                style={{ width: 240 }}
              />
            </ComponentBox>

            <ComponentBox title="10. Status Badges">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <StatusBadge status="Sedang Berjalan" />
                <StatusBadge status="Selesai" />
              </div>
            </ComponentBox>

            <ComponentBox title="11. User Profile Item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-card)' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: 13 }}>
                  DR
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>Dr. Rizal</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.2 }}>Dokter Hewan</div>
                </div>
              </div>
            </ComponentBox>
            
            <ComponentBox title="12. Progress Bar">
              <ProgressBar label="Kapasitas Klinik" percentage={75} style={{ width: 200 }} />
            </ComponentBox>
          </PlaygroundContainer>
        </section>

        {/* 4. Form Component */}
        <section>
          <SectionHeader num="4" title="Form Component" subtitle="Input field, Checkbox, Select, dan Password Toggle" />
          <PlaygroundContainer>
            <ComponentBox title="13. Input with Left Icon (Email)">
              <Input type="email" placeholder="dokter@petcareclinic.com" icon={Mail} style={{ width: 260 }} />
            </ComponentBox>

            <ComponentBox title="14. Input with Right Action (Password)">
              <Input type="password" placeholder="••••••••" icon={Lock} style={{ width: 260 }} />
            </ComponentBox>

            <ComponentBox title="15. Search Input">
              <Input type="text" placeholder="Cari pasien, jadwal..." icon={Search} style={{ width: 260 }} />
            </ComponentBox>

            <ComponentBox title="16. Styled Select Dropdown">
              <Select options={['Pilih Spesies', 'Kucing', 'Anjing']} style={{ width: 260 }} />
            </ComponentBox>
          </PlaygroundContainer>
        </section>

        {/* 5. Feedback Component */}
        <section>
          <SectionHeader num="5" title="Feedback Component" subtitle="Pesan Peringatan, Indikator Loading, dan Empty State" />
          <PlaygroundContainer>
            <ComponentBox title="17. Loading Spinner">
              <LoadingSpinner text="Memuat data..." />
            </ComponentBox>

            <ComponentBox title="18. Alert Banner (Success)">
              <AlertBanner type="success" message="Jadwal berhasil ditambahkan!" style={{ width: 280 }} />
            </ComponentBox>

            <ComponentBox title="19. Empty State">
              <EmptyState title="Data Kosong" description="Belum ada catatan jadwal untuk hari ini." style={{ width: 280 }} />
            </ComponentBox>
          </PlaygroundContainer>
        </section>

        {/* 6. Section Component */}
        <section>
          <SectionHeader num="6" title="Section Component" subtitle="Header Halaman Utama" />
          <PlaygroundContainer>
            <ComponentBox title="20. Page Header Wrapper" fullWidth>
              <Card style={{ borderStyle: 'dashed' }}>
                <PageHeader title="Manajemen Pasien" subtitle="Lihat, tambah, dan atur data rekam medis pasien klinik." />
              </Card>
            </ComponentBox>
          </PlaygroundContainer>
        </section>

      </div>
    </div>
  );
}
