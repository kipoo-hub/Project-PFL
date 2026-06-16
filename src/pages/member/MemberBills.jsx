import React, { useState, useEffect } from 'react';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { crmState } from '../../lib/crmState';

export default function MemberBills() {
  const { member } = useMemberAuth();

  const [bills, setBills] = useState([]);
  const [activeBill, setActiveBill] = useState(null);

  const loadBills = () => {
    crmState.init();
    const email = member?.email || 'demo@email.com';
    const list = crmState.getMemberBills(email);
    setBills(list);
  };

  useEffect(() => {
    loadBills();

    const handleUpdate = () => {
      loadBills();
    };
    window.addEventListener('crm_change', handleUpdate);
    return () => window.removeEventListener('crm_change', handleUpdate);
  }, [member]);

  const formatRupiah = (val) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(val);
  };

  const handlePayInvoice = (bill) => {
    alert(`Membuka Gerbang Pembayaran untuk Invoice ${bill.invoiceNo}...\nMetode Pembayaran: QRIS / Virtual Account.\nSimulasi pembayaran sukses!`);
    
    // Simulate updating paid status in local storage
    crmState.init();
    const allBills = JSON.parse(localStorage.getItem('vet_crm_bills_new') || '[]');
    const updated = allBills.map(b => b.id === bill.id ? { ...b, status: 'Lunas' } : b);
    localStorage.setItem('vet_crm_bills_new', JSON.stringify(updated));
    window.dispatchEvent(new Event('crm_change'));
    
    // Refresh modal if open
    const updatedBill = updated.find(b => b.id === bill.id);
    if (updatedBill) {
      setActiveBill(updatedBill);
    }
  };

  // Stats
  const totalBills = bills.length;
  const paidCount = bills.filter(b => b.status === 'Lunas').length;
  const unpaidCount = bills.filter(b => b.status === 'Belum Dibayar').length;
  const unpaidSum = bills.filter(b => b.status === 'Belum Dibayar').reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Riwayat Tagihan & Invoice</h1>
        <p className="text-slate-500 text-sm mt-1">Pantau tagihan pengobatan medis dan lakukan pelunasan kuitansi secara online.</p>
      </div>

      {/* Summary statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Card 1 - Total Transaksi */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Total Transaksi</span>
            <span className="text-xl font-bold text-slate-800 block mt-1">{totalBills}</span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">Semua Kunjungan Medis</span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border bg-sky-50 border-sky-100 text-sky-600">🧾</div>
        </div>

        {/* Card 2 - Invoice Lunas */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Invoice Lunas</span>
            <span className="text-xl font-bold text-slate-800 block mt-1">{paidCount}</span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">Sudah Selesai Dibayar</span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border bg-emerald-50 border-emerald-100 text-emerald-600">✓</div>
        </div>

        {/* Card 3 - Tagihan Tertunggak */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Tagihan Tertunggak</span>
            <span className="text-xl font-bold text-slate-800 block mt-1">{formatRupiah(unpaidSum)}</span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">{unpaidCount} invoice belum dibayar</span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border bg-rose-50 border-rose-100 text-rose-600">⚠️</div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <th className="p-4 text-xs uppercase tracking-wider">No. Invoice</th>
                <th className="p-4 text-xs uppercase tracking-wider">Tanggal</th>
                <th className="p-4 text-xs uppercase tracking-wider">Layanan Utama</th>
                <th className="p-4 text-xs uppercase tracking-wider">Jumlah Tagihan</th>
                <th className="p-4 text-xs uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {bills.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    Tidak ada riwayat tagihan terdaftar.
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/30 text-slate-700">
                    <td className="p-4 font-bold text-slate-800">{bill.invoiceNo}</td>
                    <td className="p-4 text-slate-500">{bill.date}</td>
                    <td className="p-4 text-slate-600 truncate max-w-[200px]" title={bill.service}>
                      {bill.service}
                    </td>
                    <td className="p-4 font-bold text-slate-700">{formatRupiah(bill.amount)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        bill.status === 'Lunas' 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                          : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setActiveBill(bill)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs transition active:scale-95"
                        >
                          👁️ Rincian
                        </button>
                        {bill.status !== 'Lunas' && (
                          <button
                            onClick={() => handlePayInvoice(bill)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition active:scale-95 shadow-sm shadow-emerald-100"
                          >
                            💳 Bayar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal (PDF Style) */}
      {activeBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveBill(null)}></div>

          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative z-10 overflow-y-auto max-h-[90vh] border border-slate-100">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-base font-bold text-slate-800">Kuitansi Pembayaran Resmi</h3>
              <button onClick={() => setActiveBill(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
            </div>

            {/* PDF Style Invoice Container */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/20 shadow-inner text-slate-700">
              
              {/* Invoice Brand Row */}
              <div className="flex justify-between items-start pb-4 border-b border-dashed border-slate-200">
                <div>
                  <h4 className="text-base font-bold text-emerald-700">VETERINARIO CLINIC</h4>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[180px]">Jl. Kesehatan Hewan No. 123, Bandung, Indonesia</p>
                </div>
                <div className="text-right">
                  <h5 className="font-bold text-slate-800 text-sm">INVOICE</h5>
                  <span className="text-xs text-slate-500 block font-semibold">{activeBill.invoiceNo}</span>
                  <span className="text-[10px] text-slate-400 block font-medium">Tanggal: {activeBill.date}</span>
                </div>
              </div>

              {/* Patient/Owner metadata */}
              <div className="grid grid-cols-2 gap-4 py-4 text-xs font-semibold">
                <div>
                  <span className="block text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Pemilik (Client)</span>
                  <span className="text-slate-700 block">{member?.name || 'Budi Santoso'}</span>
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{member?.email || 'budi@email.com'}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Status Pembayaran</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                    activeBill.status === 'Lunas'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border-rose-200'
                  }`}>
                    {activeBill.status}
                  </span>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white text-xs mt-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-200">
                      <th className="p-2.5">Item Deskripsi</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Harga Satuan</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {activeBill.details?.map((item, idx) => {
                      const qty = item.qty || 1;
                      const price = item.price || 0;
                      const itemTotal = qty * price;
                      
                      return (
                        <tr key={idx}>
                          <td className="p-2.5">{item.item}</td>
                          <td className="p-2.5 text-center text-slate-500">{qty}</td>
                          <td className="p-2.5 text-right text-slate-500">{formatRupiah(price)}</td>
                          <td className="p-2.5 text-right text-slate-800">{formatRupiah(itemTotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Calculation Summary Row */}
              <div className="mt-4 pt-3 border-t border-slate-200/50 flex flex-col items-end gap-1.5 text-xs font-semibold">
                <div className="flex justify-between w-64 text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatRupiah(activeBill.amount)}</span>
                </div>
                <div className="flex justify-between w-64 text-slate-500">
                  <span>Pajak (PPN 11%)</span>
                  <span>{formatRupiah(Math.round(activeBill.amount * 0.11))}</span>
                </div>
                <div className="flex justify-between w-64 text-slate-800 font-bold text-sm border-t border-slate-200 pt-2">
                  <span>Total Bayar</span>
                  <span>{formatRupiah(Math.round(activeBill.amount * 1.11))}</span>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-5 border-t border-slate-100 mt-6">
              <button 
                onClick={() => setActiveBill(null)}
                className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm transition"
              >
                Tutup
              </button>
              {activeBill.status !== 'Lunas' ? (
                <button 
                  onClick={() => handlePayInvoice(activeBill)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-sm shadow-emerald-100 flex items-center justify-center gap-2"
                >
                  💳 Lakukan Pembayaran
                </button>
              ) : (
                <button 
                  onClick={() => alert('Mengunduh salinan kuitansi resmi PDF...')}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2"
                >
                  📥 Unduh Kuitansi (PDF)
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
