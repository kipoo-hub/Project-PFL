import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Loading from './components/Loading';

// Layouts (tidak di-lazy load karena sebagai pembungkus utama)
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import MemberLayout from './layouts/MemberLayout';

// Auth Context Provider
import { MemberAuthProvider } from './context/MemberAuthContext';

// Route Guards
import { MemberProtectedRoute, MemberGuestRoute } from './components/MemberRoute';

// Pages — lazy loaded (hanya di-load saat dibutuhkan)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Pasien = lazy(() => import('./pages/Pasien'));
const JadwalTemu = lazy(() => import('./pages/JadwalTemu'));
const Analitik = lazy(() => import('./pages/Analitik'));
const Pengaturan = lazy(() => import('./pages/Pengaturan'));
const Components = lazy(() => import('./pages/Components'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const GuestPage = lazy(() => import('./pages/guest/GuestPage'));
const Marketing = lazy(() => import('./pages/Marketing'));
const Sales = lazy(() => import('./pages/Sales'));
const Service = lazy(() => import('./pages/Service'));
const Reminder = lazy(() => import('./pages/Reminder'));
const FollowUp = lazy(() => import('./pages/FollowUp'));
const PipelineMember = lazy(() => import('./pages/PipelineMember'));
const Leads = lazy(() => import('./pages/Leads'));
const Segmentasi = lazy(() => import('./pages/Segmentasi'));
const Blast = lazy(() => import('./pages/Blast'));

// Auth pages — lazy loaded (clinic staff)
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Forgot = lazy(() => import('./pages/auth/Forgot'));

// Member pages — lazy loaded
const MemberLogin    = lazy(() => import('./pages/member/auth/MemberLogin'));
const MemberRegister = lazy(() => import('./pages/member/auth/MemberRegister'));
const MemberDashboard = lazy(() => import('./pages/member/MemberDashboard'));
const MemberTickets = lazy(() => import('./pages/member/MemberTickets'));
const MemberQueue = lazy(() => import('./pages/member/MemberQueue'));
const MemberPets = lazy(() => import('./pages/member/MemberPets'));
const MemberPetDetail = lazy(() => import('./pages/member/MemberPetDetail'));
const MemberAppointments = lazy(() => import('./pages/member/MemberAppointments'));
const MemberVaccines = lazy(() => import('./pages/member/MemberVaccines'));
const MemberMedicalRecords = lazy(() => import('./pages/member/MemberMedicalRecords'));
const MemberChat = lazy(() => import('./pages/member/MemberChat'));
const MemberBills = lazy(() => import('./pages/member/MemberBills'));
const MemberProfile = lazy(() => import('./pages/member/MemberProfile'));

// Admin CRM Stage 3 pages — lazy loaded
const Tickets = lazy(() => import('./pages/Tickets'));
const Queue = lazy(() => import('./pages/Queue'));
const QueueDisplay = lazy(() => import('./pages/QueueDisplay'));
const SLAMonitor = lazy(() => import('./pages/SLAMonitor'));

import './index.css';

function App() {
  return (
    <MemberAuthProvider>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* ── Public route ─────────────────────────────────── */}
          <Route path="/guest" element={<GuestPage />} />
          <Route path="/antrian/display" element={<QueueDisplay />} />

          {/* ── Member auth routes (block if already logged in) ── */}
          <Route element={<MemberGuestRoute />}>
            <Route path="/member/login"    element={<MemberLogin />} />
            <Route path="/member/register" element={<MemberRegister />} />
          </Route>

          {/* ── Member protected routes ─────────────────────── */}
          <Route element={<MemberProtectedRoute />}>
            <Route element={<MemberLayout />}>
              <Route path="/member/dashboard" element={<MemberDashboard />} />
              <Route path="/member/tiket"     element={<MemberTickets />} />
              <Route path="/member/antrian"   element={<MemberQueue />} />
              <Route path="/member/hewan"          element={<MemberPets />} />
              <Route path="/member/hewan/:id"      element={<MemberPetDetail />} />
              <Route path="/member/janji"          element={<MemberAppointments />} />
              <Route path="/member/vaksin"         element={<MemberVaccines />} />
              <Route path="/member/rekam-medis"    element={<MemberMedicalRecords />} />
              <Route path="/member/chat"           element={<MemberChat />} />
              <Route path="/member/tagihan"        element={<MemberBills />} />
              <Route path="/member/profil"         element={<MemberProfile />} />
            </Route>
          </Route>

          {/* ── Dashboard routes (MainLayout) ─────────────────── */}
          <Route element={<MainLayout />}>
            <Route path="/"           element={<Dashboard />} />
            <Route path="/pasien"     element={<Pasien />} />
            <Route path="/jadwal"     element={<JadwalTemu />} />
            <Route path="/analitik"   element={<Analitik />} />
            <Route path="/pengaturan" element={<Pengaturan />} />
            <Route path="/components" element={<Components />} />
            <Route path="/profile"    element={<Profile />} />
            {/* CRM Routes */}
            <Route path="/marketing"  element={<Marketing />} />
            <Route path="/sales"      element={<Sales />} />
            <Route path="/service"    element={<Service />} />
            <Route path="/reminder"   element={<Reminder />} />
            <Route path="/followup"   element={<FollowUp />} />
            <Route path="/pipeline"   element={<PipelineMember />} />
            <Route path="/leads"      element={<Leads />} />
            <Route path="/segmentasi" element={<Segmentasi />} />
            <Route path="/blast"      element={<Blast />} />
            <Route path="/tiket"      element={<Tickets />} />
            <Route path="/sla"        element={<SLAMonitor />} />
            <Route path="/antrian"    element={<Queue />} />
            <Route path="*"           element={<NotFound />} />
          </Route>

          {/* ── Clinic staff auth routes ────────────────────── */}
          <Route element={<AuthLayout />}>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot"   element={<Forgot />} />
          </Route>
        </Routes>
      </Suspense>
    </MemberAuthProvider>
  );
}

export default App;
