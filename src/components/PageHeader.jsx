import React, { useState } from 'react';
import { Calendar, Download, Filter, FileText, Table } from 'lucide-react';

const PageHeader = ({ title, subtitle }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [date, setDate] = useState('2025-05-01');
  const [filterMode, setFilterMode] = useState('semua');

  const handleExportPDF = () => {
    window.print();
    setShowExportMenu(false);
  };

  const handleExportSheet = () => {
    const csvContent = "data:text/csv;charset=utf-8,Laporan,Data\nKlinik,PetCare";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "laporan_klinik.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
      flexWrap: 'wrap',
      gap: 12,
    }}>
      {/* Title & Subtitle */}
      <div>
        <h1 style={{
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: 0,
          lineHeight: 1.3,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            marginTop: 4,
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Date Range Filter */}
        <div style={{ position: 'relative' }}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              padding: '7px 14px',
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
          />
        </div>

        {/* Filter Button / Select */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            style={{
              appearance: 'none',
              padding: '7px 32px 7px 14px',
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <option value="semua">Semua Filter</option>
            <option value="kritis">Kasus Kritis</option>
            <option value="selesai">Selesai</option>
          </select>
          <Filter size={14} style={{ position: 'absolute', right: 10, pointerEvents: 'none', color: 'var(--text-secondary)' }} />
        </div>

        {/* Export Button */}
        <div style={{ position: 'relative' }}>
          <button
            id="page-header-export-btn"
            onClick={() => setShowExportMenu(!showExportMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #667EEA, #5A67D8)',
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(102,126,234,0.4)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102,126,234,0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Download size={14} />
            Export
          </button>

          {/* Export Dropdown Menu */}
          {showExportMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 8,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              minWidth: 160,
              zIndex: 50,
              overflow: 'hidden'
            }}>
              <button 
                onClick={handleExportPDF}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '10px 16px', border: 'none', background: 'transparent',
                  color: 'var(--text-primary)', cursor: 'pointer', fontSize: 13, textAlign: 'left'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-app)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <FileText size={14} color="var(--accent-red)" />
                Export PDF
              </button>
              <button 
                onClick={handleExportSheet}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '10px 16px', border: 'none', background: 'transparent',
                  color: 'var(--text-primary)', cursor: 'pointer', fontSize: 13, textAlign: 'left'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-app)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Table size={14} color="#10b981" />
                Export Google Sheet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
