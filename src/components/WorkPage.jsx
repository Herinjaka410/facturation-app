import React from 'react';
import { useLocation } from 'react-router-dom';
import InvoiceViewer from './InvoiceViewer';
import InvoiceForm from './InvoiceForm';
import './WorkPage.css';

const WorkPage = () => {
  const { state } = useLocation();
  const { selectedFile } = state || {};

  return (
    <div className="work-container">
      <div className="viewer-panel">
        <InvoiceViewer fileName={selectedFile} />
      </div>
      <div className="form-panel">
        <InvoiceForm selectedFile={selectedFile} />
      </div>
    </div>
  );
};

export default WorkPage;