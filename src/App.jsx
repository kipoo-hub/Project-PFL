import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loading from './components/Loading';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import MemberLayout from './layouts/MemberLayout';

// Auth Context Provider
import { MemberAuthProvider } from './context/MemberAuthContext';

// Route Guards
import { AdminProtectedRoute, MemberProtectedRoute, GuestProtectedRoute, GuestRoute } from './components/MemberRoute';

// Pages — lazy loaded
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Pasien = lazy(() => import('./pages/admin/Pasien'));
const JadwalTemu = lazy(() => import('./pages/admin/JadwalTemu'));
const NotFound = lazy(() => import('./pages/admin/NotFound'));
const GuestPage = lazy(() => import('./pages/guest/GuestPage'));

// Auth pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const MemberRegister = lazy(() => import('./pages/member/auth/MemberRegister'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const MembersManagement = lazy(() => import('./pages/admin/MembersManagement'));

// New CRM Admin pages
const AntrianDigital = lazy(() => import('./pages/admin/AntrianDigital'));
const TiketKeluhan = lazy(() => import('./pages/admin/TiketKeluhan'));
const SLAMonitor = lazy(() => import('./pages/admin/SLAMonitor'));
const SalesPipeline = lazy(() => import('./pages/admin/SalesPipeline'));
const PipelineMember = lazy(() => import('./pages/admin/PipelineMember'));
const FollowupKunjungan = lazy(() => import('./pages/admin/FollowupKunjungan'));
const LeadManagement = lazy(() => import('./pages/admin/LeadManagement'));
const BlastPesan = lazy(() => import('./pages/admin/BlastPesan'));
const ReminderVaksin = lazy(() => import('./pages/admin/ReminderVaksin'));
const CaseManagement = lazy(() => import('./pages/admin/CaseManagement'));
const CampaignManagement = lazy(() => import('./pages/admin/CampaignManagement'));
const SegmentasiMember = lazy(() => import('./pages/admin/SegmentasiMember'));
const Analitik = lazy(() => import('./pages/admin/Analitik'));
const Pengaturan = lazy(() => import('./pages/admin/Pengaturan'));
const ComponentsPage = lazy(() => import('./pages/admin/ComponentsPage'));

// Member pages
const MemberMembership = lazy(() => import('./pages/member/MemberMembership'));
const MemberPets = lazy(() => import('./pages/member/MemberPets'));
const MemberPetDetail = lazy(() => import('./pages/member/MemberPetDetail'));
const MemberAppointments = lazy(() => import('./pages/member/MemberAppointments'));
const MemberVaccines = lazy(() => import('./pages/member/MemberVaccines'));
const MemberMedicalRecords = lazy(() => import('./pages/member/MemberMedicalRecords'));
const MemberChat = lazy(() => import('./pages/member/MemberChat'));
const MemberProfile = lazy(() => import('./pages/member/MemberProfile'));

import './index.css';

function App() {
  return (
    <MemberAuthProvider>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* ── Public routes ─────────────────────────────────── */}
          <Route path="/" element={<GuestPage />} />

          {/* ── Guest protected route ──────────────────────── */}
          <Route element={<GuestProtectedRoute />}>
            <Route path="/guest" element={<GuestPage />} />
          </Route>

          {/* ── Guest redirects to unified login ──────────────── */}
          <Route path="/member/login" element={<Navigate to="/login" replace />} />
          <Route path="/guest/login" element={<Navigate to="/login" replace />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/member/register" element={<Navigate to="/register" replace />} />
          <Route path="/guest/register" element={<Navigate to="/register" replace />} />
          <Route path="/admin/register" element={<Navigate to="/login" replace />} />

          {/* ── Guest auth routes (block if already logged in) ── */}
          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<MemberRegister />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>
          </Route>

          {/* ── Member standalone pages (any logged-in user) ── */}
          <Route element={<GuestProtectedRoute />}>
            <Route path="/member/membership" element={<MemberMembership />} />
            <Route path="/membership" element={<Navigate to="/member/membership" replace />} />
          </Route>

          {/* ── Member protected routes ─────────────────────── */}
          <Route element={<MemberProtectedRoute />}>
            <Route element={<MemberLayout />}>
              <Route path="/member" element={<Navigate to="/member/membership" replace />} />
              <Route path="/member/hewan" element={<MemberPets />} />
              <Route path="/member/hewan/:id" element={<MemberPetDetail />} />
              <Route path="/member/janji" element={<MemberAppointments />} />
              <Route path="/member/vaksin" element={<MemberVaccines />} />
              <Route path="/member/rekam-medis" element={<MemberMedicalRecords />} />
              <Route path="/member/chat" element={<MemberChat />} />
              <Route path="/member/profil" element={<MemberProfile />} />
            </Route>
          </Route>

          {/* ── Admin protected routes (MainLayout) ──────────── */}
          <Route element={<AdminProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pasien" element={<Pasien />} />
              <Route path="/jadwal" element={<JadwalTemu />} />
              <Route path="/admin/members" element={<MembersManagement />} />
              <Route path="/antrian" element={<AntrianDigital />} />
              <Route path="/tiket" element={<TiketKeluhan />} />
              <Route path="/sla" element={<SLAMonitor />} />
              <Route path="/sales" element={<SalesPipeline />} />
              <Route path="/pipeline" element={<PipelineMember />} />
              <Route path="/followup" element={<FollowupKunjungan />} />
              <Route path="/leads" element={<LeadManagement />} />
              <Route path="/blast" element={<BlastPesan />} />
              <Route path="/reminder" element={<ReminderVaksin />} />
              <Route path="/service" element={<CaseManagement />} />
              <Route path="/marketing" element={<CampaignManagement />} />
              <Route path="/segmentasi" element={<SegmentasiMember />} />
              <Route path="/analitik" element={<Analitik />} />
              <Route path="/pengaturan" element={<Pengaturan />} />
              <Route path="/components" element={<ComponentsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </MemberAuthProvider>
  );
}

export default App;
