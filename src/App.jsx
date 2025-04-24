import React from 'react';
import InvoiceViewer from './components/InvoiceViewer';
import InvoiceForm from './components/InvoiceForm';

function App() {
  return (
    <div className="flex min-h-screen bg-gray-100 p-4">
      <div className="w-1/2 p-4">
        <InvoiceViewer />
      </div>
      <div className="w-1/2 p-4 bg-white rounded shadow">
        <InvoiceForm />
      </div>
    </div>
  );
}

export default App;