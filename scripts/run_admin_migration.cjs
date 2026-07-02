// ============================================================
// Script: Set admin@gmail.com sebagai Admin via Supabase API
// ============================================================
// Menjalankan fungsi yang setara dengan supabase_set_admin.sql
// Tapi menggunakan Supabase JS Client (anon key)
// ============================================================

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qggrjxcpwwgyngudcueb.supabase.co';
const supabaseKey = 'sb_publishable_qE1yN-RqfPPR-QpF_KpmeA_cYq89G3s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('🔍 Mencari user dengan email: admin@gmail.com...\n');

  // Step 1: Cari profile di tabel profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'admin@gmail.com');

  if (profileError) {
    console.error('❌ Gagal query tabel profiles:', profileError.message);
    console.log('\n⚠️  Tidak bisa akses tabel profiles langsung.');
    console.log('   Coba jalankan supabase_set_admin.sql manual di Supabase Dashboard SQL Editor.\n');
    process.exit(1);
  }

  if (!profiles || profiles.length === 0) {
    console.log('⚠️  User admin@gmail.com BELUM terdaftar di tabel profiles.');
    console.log('   Silakan daftarkan akun admin@gmail.com dulu melalui halaman Register,');
    console.log('   lalu jalankan script ini lagi.\n');
    process.exit(0);
  }

  const profile = profiles[0];
  console.log(`📋 User ditemukan:`);
  console.log(`   ID    : ${profile.user_id}`);
  console.log(`   Name  : ${profile.name}`);
  console.log(`   Email : ${profile.email}`);
  console.log(`   Role  : ${profile.role}\n`);

  if (profile.role === 'admin') {
    console.log('✅ admin@gmail.com SUDAH memiliki role admin. Tidak perlu diubah.\n');
    process.exit(0);
  }

  // Step 2: Update role menjadi admin
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin', updated_at: new Date().toISOString() })
    .eq('user_id', profile.user_id);

  if (updateError) {
    console.error('❌ Gagal update role:', updateError.message);
    console.log('\n⚠️  Tidak punya izin update tabel profiles via anon key.');
    console.log('   Jalankan supabase_set_admin.sql manual di Supabase Dashboard SQL Editor.\n');
    process.exit(1);
  }

  console.log('✅ SUCCESS! Role admin@gmail.com berhasil diubah menjadi admin!\n');
  console.log('Silakan login dengan email: admin@gmail.com');
  console.log('Anda akan otomatis diarahkan ke /dashboard.\n');
}

run().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
