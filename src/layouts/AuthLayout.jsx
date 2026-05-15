import React from 'react';
import { Outlet } from 'react-router-dom';
import { PawPrint } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#5d87e6', // Biru Royal Utama
      padding: '20px',
      fontFamily: "'Inter', sans-serif"
    }}>
      
      {/* Container Utama */}
      <div style={{
        background: 'white',
        borderRadius: 32,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '1000px',
        display: 'flex',
        minHeight: '600px',
        overflow: 'hidden',
      }}>
        
        {/* KOLOM KIRI: Visual & Branding */}
        <div style={{
          flex: 1,
          background: '#a5c0f3',
          padding: '60px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center', // Membuat konten kiri juga di tengah
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: 28, color: 'white', fontWeight: 500, lineHeight: 1.2 }}>
            Need pet care<br />for your buddy?
          </h1>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#4a71cc', margin: '10px 0 40px' }}>
            PetCare Clinic<br />will help you.
          </h2>

          <div style={{
            width: 160,
            height: 160,
            borderRadius: 40,
            background: '#5d87e6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
          }}>
            <PawPrint size={90} color="white" />
          </div>
          
          <div style={{ marginTop: 'auto', color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
            petcareclinic.com/dashboard
          </div>
        </div>

        {/* KOLOM KANAN: Form (Dibuat ke Tengah) */}
        <div style={{
          flex: 1.2,
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',    // Mengetengahkan secara horizontal
          justifyContent: 'center',   // Mengetengahkan secara vertikal
          background: 'white',
          position: 'relative'
        }}>
          
          {/* Logo Kecil di Atas Form */}
          <div style={{ 
            marginBottom: 32, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 8 
          }}>
             <div style={{ 
               background: '#000', 
               padding: 8, 
               borderRadius: 10,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center'
             }}>
                <PawPrint size={20} color="white" />
             </div>
             <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>PetCare Clinic</span>
          </div>

          {/* Wrapper untuk Form (Outlet) */}
          <div style={{ 
            width: '100%', 
            maxWidth: '360px', // Membatasi lebar form agar rapi di tengah
          }}>
            <Outlet />
          </div>

          {/* Footer Copyright */}
          <p style={{
            position: 'absolute',
            bottom: 24,
            fontSize: 11,
            color: '#94a3b8',
          }}>
            © 2026 PetCare Clinic. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
}