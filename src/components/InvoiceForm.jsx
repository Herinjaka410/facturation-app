import React, { useState, useEffect, useRef, useCallback } from 'react';
import './InvoiceForm.css';

const COLUMN_HEADERS = ['Line', 'Date', 'Order', 'QTY', 'Reference', 'Description', 'Price', 'SKU', 'Tax', 'Amount', 'Actions'];

const InvoiceForm = () => {
  const [selectedCell, setSelectedCell] = useState(null);
  const tableBodyRef = useRef(null);
  const headerRef = useRef(null);
  const [columnWidths, setColumnWidths] = useState({});
  const [isResizing, setIsResizing] = useState(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  // Fonction pour synchroniser le défilement horizontal
  const handleHeaderScroll = useCallback((e) => {
    if (tableBodyRef.current) {
      tableBodyRef.current.scrollLeft = e.target.scrollLeft;
    }
  }, []);
  
  const handleBodyScroll = useCallback((e) => {
    if (headerRef.current) {
      headerRef.current.scrollLeft = e.target.scrollLeft;
    }
  }, []);

  // État initial avec valeurs par défaut
  const initialFormData = {
    startPage: '1',
    endPage: '1',
    balancedue: '0.00',
    total: '0.00',
    subtotal: '0.00',
    shipping: '0.00',
    tax: '0.00',
    tip: '0.00',
    cashback: '0.00',
    discount: '0.00',
    invoiceNumber: '',
    poNumber: '',
    date: '',
    orderDate: '',
    dueDate: '',
    shipDate: '',
    deliveryDate: '',
    serviceStartDate: '',
    serviceEndDate: '',
    category:'',
    currencyCode: '',
    referenceNumber: '',
    paymentTerms: '',
    accountNumber: '',
    cardNumber: '',
    paymentDisplayName:'',
    paymentType:'',
    BillToName:'',
    BillToRecipient:'',
    BillToAddressLine:'',
    BillToCity:'',
    BillToState:'',
    BillToZipcode:'',
    BillToVATNumber:'',
    BillToEmail:'',
    VendorName:'',
    VendorRawName:'',
    VendorRecipient:'',
    VendorEmail:'',
    VendorAddressLine:'',
    VendorCity:'',
    VendorState:'',
    VendorZipcode:'',
    VendorCountry:'',
    VendorType:'',
    VendorPhone:'',
    VendorFax:'',
    VendorWebsite:'',
    VendorABNNumber:'',
    VendorBankName:'',
    VendorBankNumber:'',
    VendorBankSwift:'',
    VendorIBAN:'',
    VendorAccountNumber:'',
    RemitToName:'',
    RemitToAddressLine:'',
    RemitToCity:'',
    RemitToState:'',
    RemitToZipcode:'',
    ShipToName:'',
    ShipToAddressLine:'',
    ShipToCity:'',
    ShipToState:'',
    ShipToZipcode:'',
    Carrier:'',
    TrackingNumber:'',
    'Phone Number': '',
    'All Email Addresses': '',
    'VAT Number': '',
    'Pages': '',
    'Is Duplicate': '',
    'Notes': ''
  };

  // États
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('form');
  const [saveStatus, setSaveStatus] = useState(null);

 // Fonctions pour le redimensionnement
 const startResizing = useCallback((columnIndex, e) => {
  setIsResizing(columnIndex);
  setResizeStartX(e.clientX);
  setResizeStartWidth(columnWidths[columnIndex] || 120);
  e.preventDefault();
}, [columnWidths]);

const handleResize = useCallback((e) => {
  if (isResizing === null) return;
  const newWidth = resizeStartWidth + (e.clientX - resizeStartX);
  setColumnWidths(prev => ({
    ...prev,
    [isResizing]: Math.max(80, newWidth) // Largeur minimale de 80px
  }));
}, [isResizing, resizeStartWidth, resizeStartX]);

const stopResizing = useCallback(() => {
  setIsResizing(null);
}, []);

// Effet pour initialiser les largeurs et gérer le redimensionnement
useEffect(() => {
  const initialWidths = {};
  COLUMN_HEADERS.forEach((_, index) => {
    initialWidths[index] = 120; // Largeur par défaut
  });
  setColumnWidths(initialWidths);

  // Synchronisation initiale
  if (headerRef.current && tableBodyRef.current) {
    headerRef.current.scrollLeft = tableBodyRef.current.scrollLeft;
  }

  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResizing);

  return () => {
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResizing);
  };
}, [handleResize, stopResizing]);

useEffect(() => {
  if (!selectedCell) return;

  // Trouve l'input correspondant à la cellule sélectionnée
  const activeInput = document.querySelector(
    `.table-row:nth-child(${selectedCell.row + 1}) .table-cell:nth-child(${selectedCell.col + 1}) input`
  );
  
  // Met le focus si l'input existe et n'est pas déjà focus
  if (activeInput && document.activeElement !== activeInput) {
    activeInput.focus();
    
    // Option: Sélectionne tout le texte pour faciliter l'édition
    activeInput.select();
  }
}, [selectedCell]); // Se déclenche quand selectedCell change

// Nouvel état pour les line items
const [lineItems, setLineItems] = useState([
  {
    id: 1,
    line: '1',
    date: '',
    order: '', // Champ vide au lieu de false
    qty: '',
    reference: '',
    description: '',
    price: '',
    sku: '',
    tax: '',
    amount: ''
    
  },
  {
    id: 2,
    line: '1',
    date: '',
    order: '', // Champ vide au lieu de false
    qty: '',
    reference: '',
    description: '',
    price: '',
    sku: '',
    tax: '',
    amount: ''
  }
]);

// Fonction pour supprimer une ligne - CORRECTION AJOUTÉE ICI
  const removeLineItem = (id) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

// Fonction pour ajouter une nouvelle ligne
const addLineItem = () => {
  const newId = lineItems.length > 0 ? Math.max(...lineItems.map(item => item.id)) + 1 : 1;
  setLineItems([...lineItems, {
    id: newId,
    line: `${newId}`,
    date: '',
    order: '', // Champ vide au lieu de false
    qty: '',
    reference: '',
    description: '',
    price: '',
    sku: '',
    tax: '',
    amount: ''
  }]);
};

const handleLineItemChange = (id, field, value) => {
  // Validation pour les champs numériques
  if (['qty', 'order', 'price', 'amount'].includes(field)) {
    if (value !== '' && !/^[\d,.]*$/.test(value)) {
      return; // Ne met pas à jour si la valeur n'est pas un nombre
    }
  }
  
  setLineItems(lineItems.map(item => 
    item.id === id ? { ...item, [field]: value } : item
  ));
};

  // Liste des champs de date
  const dateFields = [
    'date', 
    'orderDate',
    'dueDate',
    'shipDate',
    'deliveryDate',
    'serviceStartDate',
    'serviceEndDate'
  ];

  // Fonction pour vérifier si un champ est une date
  const isDateField = (fieldName) => dateFields.includes(fieldName);
 
  // Charger les données sauvegardées au montage
  useEffect(() => {
    const loadSavedData = () => {
      const saved = localStorage.getItem('invoiceFormData');
      if (!saved) return;
  
      try {
        const { lineItems: savedLineItems = [], ...savedFormData } = JSON.parse(saved);
        
        // Nettoyage des lineItems chargés
      const cleanedLineItems = savedLineItems.map(item => ({
        id: item.id,
        line: item.line || '',
        description: item.description || '',
        qty: item.qty || '',
        date: item.date || '',
        price: item.price || '',
        amount: item.amount || '',
        // Supprimez les champs inutiles
      }));

        setFormData(prev => ({
          ...initialFormData, // Valeurs par défaut d'abord
          ...savedFormData    // Puis écrasées par les valeurs sauvegardées
        }));
  
        if (savedLineItems && savedLineItems.length > 0) {
          setLineItems(savedLineItems);
        }
      } catch (error) {
        console.error("Erreur de chargement:", error);
      }
    };
  
    loadSavedData();
  }, []);

    // Déplacez ces fonctions avant le return
const handleKeyNavigation = (e, rowIndex, colIndex) => {
  const { key } = e;
  const lastRow = lineItems.length - 1;
  const lastCol = Object.keys(lineItems[0]).filter(k => k !== 'id').length - 1;

  if (key === 'ArrowDown' && rowIndex < lastRow) {
    e.preventDefault();
    setSelectedCell({ row: rowIndex + 1, col: colIndex });
    scrollToCell(rowIndex + 1);
  } else if (key === 'ArrowUp' && rowIndex > 0) {
    e.preventDefault();
    setSelectedCell({ row: rowIndex - 1, col: colIndex });
    scrollToCell(rowIndex - 1);
  } else if (key === 'ArrowRight' && colIndex < lastCol) {
    e.preventDefault();
    setSelectedCell({ row: rowIndex, col: colIndex + 1 });
  } else if (key === 'ArrowLeft' && colIndex > 0) {
    e.preventDefault();
    setSelectedCell({ row: rowIndex, col: colIndex - 1 });
  } else 
  // Navigation par tabulation
  if (key === 'Tab') {
    e.preventDefault();
    if (e.shiftKey) {
      // Shift+Tab - navigation arrière
      if (colIndex > 0) {
        setSelectedCell({ row: rowIndex, col: colIndex - 1 });
      } else if (rowIndex > 0) {
        setSelectedCell({ row: rowIndex - 1, col: lastCol });
      }
    } else {
      // Tab - navigation avant
      if (colIndex < lastCol) {
        setSelectedCell({ row: rowIndex, col: colIndex + 1 });
      } else if (rowIndex < lastRow) {
        setSelectedCell({ row: rowIndex + 1, col: 0 });
      }
    return;
  }
  } else if (key === 'Enter') {
    e.preventDefault();
    if (rowIndex < lastRow) {
      setSelectedCell({ row: rowIndex + 1, col: colIndex });
      scrollToCell(rowIndex + 1);
    }
  }
};

const scrollToCell = (rowIndex) => {
  if (tableBodyRef.current) {
    const rowHeight = 40; // Ajustez selon votre hauteur de ligne
    tableBodyRef.current.scrollTo({
      top: rowIndex * rowHeight,
      behavior: 'smooth'
    });
  }
};

  
  // Gestion des changements avec support des dates
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    try {
      const dataToSave = {
        ...formData,
        lineItems: lineItems.map(item => ({
          ...item,
          // Garde la valeur telle quelle
          order: item.order
        }))
      };

      localStorage.setItem('invoiceFormData', JSON.stringify(dataToSave));
      setSaveStatus({
        type: 'success',
        message: 'Toutes les données ont été sauvegardées'
      });
    } catch (error) {
      console.error("Sauvegarde échouée:", error);
      setSaveStatus({
        type: 'error',
        message: 'Échec de la sauvegarde'
      });
    }
  };

  const generateJson = () => {
    return JSON.stringify({
      ...formData,
      lineItems // Inclut les lineItems dans l'export JSON
    }, null, 2);
  };

  const downloadJson = () => {
    const jsonStr = generateJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${formData.invoiceNumber || 'data'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="form-container">
      {/* Onglets principaux - AJOUTEZ CETTE SECTION */}
      <div className="main-tabs"></div>
      <div className="page-controls">
        <div className="page-input">
          <label>Start Page:</label>
          <input
            type="text"
            name="startPage"
            value={formData.startPage}
            onChange={handleChange}
          />
        </div>
        <div className="page-input">
          <label>End Page:</label>
          <input
            type="text"
            name="endPage"
            value={formData.endPage}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-tabs-container">
        <div className="tabs">
        <button 
          className={activeTab === 'form' ? 'active' : ''}
          onClick={() => setActiveTab('form')}
        >
          Invoice
        </button>
        <button 
          className={activeTab === 'lineItems' ? 'active' : ''}
          onClick={() => setActiveTab('lineItems')}
        >
          Line Items
        </button>
        <button 
          className={activeTab === 'json' ? 'active' : ''}
          onClick={() => setActiveTab('json')}
        >
          JSON
        </button>
      </div>

        {activeTab === 'form' && (
          <div className="scrollable-form">
            <div className="fields-grid">
              <div className="field-header">Field name</div>
              <div className="field-header">Value</div>
             
    

              {/* Financial Information */}
              <div className="section-header">Financial Information</div>
              <div className="section-header"></div>
              
              {[
                { name: 'Balance Due', field: 'Balance Due' },
                { name: 'Total', field: 'total' },
                { name: 'Subtotal', field: 'subtotal' },
                { name: 'Shipping', field: 'shipping' },
                { name: 'Tax', field: 'tax' },
                { name: 'Tip', field: 'tip' },
                { name: 'Cashback', field: 'cashback' },
                { name: 'Discount', field: 'discount' }
              ].map((item, index) => (
                <React.Fragment key={index}>
                  <div className="field-name">{item.name}</div>
                  <div className="field-value">
                    <input
                      type="text"
                      name={item.field}
                      value={formData[item.field]}
                      onChange={handleChange}
                    />
                  </div>
                </React.Fragment>
              ))}

 {/* Document Information avec sélecteurs de date */}
 <div className="section-header">Document Information</div>
            <div className="section-header"></div>
            
              {[
                { name: 'Invoice Number', field: 'invoiceNumber' },
                { name: 'PO Number', field: 'poNumber' },
                { name: 'Date', field: 'date' },
                { name: 'Order Date', field: 'orderDate' },
                { name: 'Due Date', field: 'dueDate' },
                { name: 'Ship Date', field: 'shipDate' },
                { name: 'Delivery Date', field: 'deliveryDate' },
                { name: 'Service Start Date', field: 'serviceStartDate' },
                { name: 'Service End Date', field: 'serviceEndDate' },
                { name: 'Category', field: 'Category' },
                { name: 'Currency Code', field: 'Currency Code' },
                { name: 'Reference Number', field: 'Reference Number' }

              ].map((item, index) => (
                <React.Fragment key={index}>
                  <div className="field-name">{item.name}</div>
                  <div className="field-value">
                    {isDateField(item.field) ? (
                      <input
                        type="date"
                        name={item.field}
                        value={formData[item.field]}
                        onChange={handleChange}
                      />
                    ) : (
                      <input
                        type="text"
                        name={item.field}
                        value={formData[item.field]}
                        onChange={handleChange}
                      />
                    )}
                  </div>
                </React.Fragment>
              ))}

               {/* Payment & Account */}
               <div className="section-header">Payment & Account</div>
              <div className="section-header"></div>
              
              {[
                { name: 'Payment Terms', field: 'Payment Terms' },
                { name: 'Account Number', field: 'Account Number' },
                { name: 'Card Number', field: 'Card Number' },
                { name: 'Payment Display Name', field: 'Payment Display Name' },
                { name: 'Payment Type', field: 'Payment Type' }
               

              ].map((item, index) => (
                <React.Fragment key={index}>
                  <div className="field-name">{item.name}</div>
                  <div className="field-value">
                    <input
                      type="text"
                      name={item.field}
                      value={formData[item.field]}
                      onChange={handleChange}
                    />
                  </div>
                </React.Fragment>
              ))}

               {/* Bill To Information */}
               <div className="section-header">Bill To Information</div>
              <div className="section-header"></div>
              
              {[
                { name: 'Bill To Name', field: 'Bill To Name' },
                { name: 'Bill To Recipient', field: 'Bill To Recipient' },
                { name: 'Bill To Address Line', field: 'Bill To Address Line' },
                { name: 'Bill To City', field: 'Bill To City' },
                { name: 'Bill To State', field: 'Bill To State' },
                { name: 'Bill To Zipcode', field: 'Bill To Zipcode' },
                { name: 'Bill To VAT Number', field: 'Bill To VAT Number' },
                { name: 'Bill To Email', field: 'Bill To Email' }

              ].map((item, index) => (
                <React.Fragment key={index}>
                  <div className="field-name">{item.name}</div>
                  <div className="field-value">
                    <input
                      type="text"
                      name={item.field}
                      value={formData[item.field]}
                      onChange={handleChange}
                    />
                  </div>
                </React.Fragment>
              ))}

               {/* Vendor Information */}
               <div className="section-header">Vendor Information</div>
              <div className="section-header"></div>
              
              {[
                { name: 'Vendor Name', field: 'Vendor Name' },
                { name: 'Vendor Raw Name', field: 'Vendor Raw Name' },
                { name: 'Vendor Recipient', field: 'Vendor Recipient' },
                { name: 'Vendor Email', field: 'Vendor Email' },
                { name: 'Vendor Address Line', field: 'Vendor Address Line' },
                { name: 'Vendor City', field: 'Vendor City' },
                { name: 'Vendor State', field: 'Vendor State' },
                { name: 'Vendor Zipcode', field: 'Vendor Zipcode' },
                { name: 'Vendor Country', field: 'Vendor Country' },
                { name: 'Vendor Type', field: 'Vendor Type' },
                { name: 'Vendor Phone', field: 'Vendor Phone' },
                { name: 'Vendor Fax', field: 'Vendor Fax' },
                { name: 'Vendor Website', field: 'Vendor Website' },
                { name: 'Vendor ABN Number', field: 'Vendor ABN Number' },
                { name: 'Vendor Bank Name', field: 'Vendor Bank Name' },
                { name: 'Vendor Bank Number', field: 'Vendor Bank Number' },
                { name: 'Vendor Bank Swift', field: 'Vendor Bank Swift' },
                { name: 'Vendor IBAN', field: 'Vendor IBAN' },
                { name: 'Vendor Account Number', field: 'Vendor Account Number' }

              ].map((item, index) => (
                <React.Fragment key={index}>
                  <div className="field-name">{item.name}</div>
                  <div className="field-value">
                    <input
                      type="text"
                      name={item.field}
                      value={formData[item.field]}
                      onChange={handleChange}
                    />
                  </div>
                </React.Fragment>
              ))}

               {/* Remit To Information */}
               <div className="section-header">Remit To Information</div>
              <div className="section-header"></div>
              
              {[
                { name: 'Remit To Name', field: 'Remit To Name' },
                { name: 'Remit To Address Line', field: 'Remit To Address Line' },
                { name: 'Remit To City', field: 'Remit To City' },
                { name: 'Remit To State', field: 'Remit To State' },
                { name: 'Remit To Zipcode', field: 'Remit To Zipcode' }

              ].map((item, index) => (
                <React.Fragment key={index}>
                  <div className="field-name">{item.name}</div>
                  <div className="field-value">
                    <input
                      type="text"
                      name={item.field}
                      value={formData[item.field]}
                      onChange={handleChange}
                    />
                  </div>
                </React.Fragment>
              ))}

               {/* Shipping Information */}
               <div className="section-header">Shipping Information</div>
              <div className="section-header"></div>
              
              {[
                { name: 'Ship To Name', field: 'Ship To Name' },
                { name: 'Ship To Address Line', field: 'Ship To Address Line' },
                { name: 'Ship To City', field: 'Ship To City' },
                { name: 'Ship To State', field: 'Ship To State' },
                { name: 'Ship To Zipcode', field: 'Ship To Zipcode' },
                { name: 'Carrier', field: 'Carrier' },
                { name: 'Tracking Number', field: 'Tracking Number' }
               
              ].map((item, index) => (
                <React.Fragment key={index}>
                  <div className="field-name">{item.name}</div>
                  <div className="field-value">
                    <input
                      type="text"
                      name={item.field}
                      value={formData[item.field]}
                      onChange={handleChange}
                    />
                  </div>
                </React.Fragment>
              ))}

              {/* Additional Information */}
              <div className="section-header">Additional Information</div>
              <div className="section-header"></div>
              
              {[
                { name: 'Phone Number', field: 'Phone Number' },
                { name: 'All Email Addresses', field: 'All Email Addresses' },
                { name: 'VAT Number', field: 'VAT Number' },
                { name: 'Pages', field: 'Pages' },
                { name: 'Is Duplicate', field: 'Is Duplicate' },
                { name: 'Notes', field: 'Notes' }
              ].map((item, index) => (
                <React.Fragment key={index}>
                  <div className="field-name">{item.name}</div>
                  <div className="field-value">
                    <input
                      type="text"
                      name={item.field}
                      value={formData[item.field]}
                      onChange={handleChange}
                    />
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

{activeTab === 'lineItems' && (
  <div className="line-items-section">
    <div className="section-header">
      
      <button className="add-line-btn" onClick={addLineItem}>
        <i className="icon-add"></i> Add Line
      </button>
    </div>

    <div className="table-container">
      {/* En-têtes synchronisés */}
      <div 
  className="table-header-wrapper" 
  ref={headerRef}
  onScroll={handleHeaderScroll}
  style={{ overflowX: 'auto', overflowY: 'hidden' }}
>
  <div className="table-header">
  {COLUMN_HEADERS.map((header, index) => (
      <div
        className="header-cell" 
        key={index}
        style={{ width: columnWidths[index] || 120 }}
      >
        {header}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '5px',
            height: '100%',
            cursor: 'col-resize',
            backgroundColor: isResizing === index ? '#1890ff' : 'transparent'
          }}
          onMouseDown={(e) => startResizing(index, e)}
        />
      </div>
    ))}
  </div>
</div>

      {/* Corps du tableau */}
      <div 
  className="table-body-wrapper" 
  ref={tableBodyRef}
  onScroll={handleBodyScroll}
  style={{ overflowX: 'auto', overflowY: 'auto' }}
>
        {lineItems.map((item, rowIndex) => (
          <div 
            className={`table-row ${selectedCell?.row === rowIndex ? 'selected-row' : ''}`} 
            key={item.id}
            style={{ height: '30px' }} // Hauteur réduite des lignes
          >
            {Object.entries(item)
              .filter(([key]) => key !== 'id')
              .map(([field, value], colIndex) => (
                <div
                  className={`table-cell ${selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? 'selected-cell' : ''}`}
                  key={`${item.id}-${field}`}
                  style={{ width: columnWidths[colIndex] || 120 }}
                  onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                >
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleLineItemChange(item.id, field, e.target.value)}
                    onKeyDown={(e) => handleKeyNavigation(e, rowIndex, colIndex)}
                    onFocus={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                    tabIndex={0} // Ajout important pour la navigation par tabulation
                    className="cell-input"
                    style={{
                      border: 'none',
                      outline: 'none',
                      boxShadow: 'none',
                      width: '100%',
                      height: '100%',
                      padding: '8px 12px',
                      background: 'transparent'
                    }}
                  />
                </div>
              ))}
            <div className="table-cell action-cell"
              style={{ width: columnWidths[10] || 120 }}
            >
              <button className="remove-btn" onClick={() => removeLineItem(item.id)}
                tabIndex={0} // Pour inclure le bouton dans la navigation
              >
              
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
      {activeTab === 'json' && (
        <div className="json-tab">
          <pre>{JSON.stringify({ ...formData, lineItems }, null, 2)}</pre>
          <button onClick={downloadJson} className="download-json-button">
            Download JSON
          </button>
        </div>
      )}
      </div>

      {/* Boutons d'action - MODIFIEZ CETTE SECTION */}
      <div className="action-buttons">
        <div className="left-actions">
          <button 
            type="button" 
            className="save-button"
            onClick={handleSave}
          >
            Save Draft
          </button>
          <button 
            type="button" 
            className="submit-button"
          >
            Submit Invoice
          </button>
        </div>
        <button type="button" className="cancel-button">Cancel</button>
      </div>

      {saveStatus && (
        <div className={`status-message ${saveStatus.type}`}>
          {saveStatus.message}
        </div>
      )}

      {/* Debug section */}
      <div className="debug-info">
        <h4>Debug localStorage:</h4>
        <pre>{localStorage.getItem('invoiceFormData') || 'Aucune donnée sauvegardée'}</pre>
      
      <div className="form-footer">
        <button className="manage-items-btn">
          <i className="icon-add"></i> Manage Line Items
        </button>
      </div>

      </div>
    </div>
  );
};

export default InvoiceForm;