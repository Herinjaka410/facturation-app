import React, { useState, useRef } from 'react';
import './InvoiceViewer.css';

const InvoiceViewer = ({ pdfUrl, fileName }) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const pdfContainerRef = useRef(null);

  return (
    <div className="invoice-viewer-container">
      {pdfUrl ? (
        <>
          <div className="viewer-controls">
            <div className="zoom-controls">
              <button onClick={() => setZoomLevel(prev => Math.max(prev - 10, 50))}>-</button>
              <span>{zoomLevel}%</span>
              <button onClick={() => setZoomLevel(prev => Math.min(prev + 10, 200))}>+</button>
            </div>
            <div className="document-title">{fileName}</div>
          </div>
          <div 
            className="preview-container"
            ref={pdfContainerRef}
            style={{ 
              transform: `scale(${zoomLevel / 100})`,
              height: 'calc(100vh - 60px)'
            }}
          >
            {pdfUrl.endsWith('.pdf') ? (
              <iframe 
                src={pdfUrl} 
                title="PDF Preview"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            ) : (
              <img 
                src={pdfUrl} 
                alt="Document Preview"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            )}
          </div>
        </>
      ) : (
        <div className="empty-viewer">
          <p>Aucun document sélectionné</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceViewer;
