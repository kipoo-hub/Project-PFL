import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Loading from './components/Loading';

// Layouts (tidak di-lazy load karena sebagai pembungkus utama)
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages — lazy loaded (hanya di-load saat dibutuhkan)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Pasien = lazy(() => import('./pages/Pasien'));
const JadwalTemu = lazy(() => import('./pages/JadwalTemu'));
const Analitik = lazy(() => import('./pages/Analitik'));
const Pengaturan = lazy(() => import('./pages/Pengaturan'));
const Components = lazy(() => import('./pages/Components'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Auth pages — lazy loaded
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Forgot = lazy(() => import('./pages/auth/Forgot'));

import './index.css';

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Route MainLayout — semua halaman dashboard */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pasien" element={<Pasien />} />
          <Route path="/jadwal" element={<JadwalTemu />} />
          <Route path="/analitik" element={<Analitik />} />
          <Route path="/pengaturan" element={<Pengaturan />} />
          <Route path="/components" element={<Components />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Route AuthLayout — halaman autentikasi */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<Forgot />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
