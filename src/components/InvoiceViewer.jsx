import React, { useState, useRef, useEffect } from 'react';
import './InvoiceViewer.css';
import AWS from 'aws-sdk';
import s3 from './s3Config';

const InvoiceViewer = () => {
  // États
  const [pdfPreview, setPdfPreview] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPath, setCurrentPath] = useState([]); // Modifié pour commencer à la racine
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const pdfContainerRef = useRef(null);

  // Configuration
  const storageOptions = {
    LOCAL: 'local',
    S3: 's3',
    API: 'api'
  };
  const [storageType, setStorageType] = useState(storageOptions.LOCAL);
  const bucketName = 'documents';

  // Données locales
  const localDocuments = [
    { name: 'facture_janvier.pdf', type: 'pdf', path: 'documents/invoices' },
    { name: 'contrat.pdf', type: 'pdf', path: 'documents/contracts' },
    { name: 'photo_profil.jpg', type: 'image', path: 'documents/images' },
    { name: 'facture_fevrier.pdf', type: 'pdf', path: 'documents/invoices' },
    { name: 'specifications.pdf', type: 'pdf', path: 'documents/specs' }
  ];

  // Chargement des documents
  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      try {
        if (storageType === storageOptions.LOCAL) {
          setDocuments(localDocuments.filter(doc => 
            currentPath.length === 0 || doc.path.startsWith(currentPath.join('/'))
          ));
        } else if (storageType === storageOptions.S3) {
          const prefix = currentPath.length > 0 ? `${currentPath.join('/')}/` : '';
          const params = {
            Bucket: bucketName,
            Delimiter: '/',
            Prefix: prefix
          };

          const data = await s3.listObjectsV2(params).promise();

          // Récupération des dossiers
          const folders = (data.CommonPrefixes || []).map(p => ({
            name: p.Prefix.replace(prefix, '').replace('/', ''),
            type: 'folder',
            path: p.Prefix
          }));

          // Récupération des fichiers
          const files = (data.Contents || [])
            .filter(item => item.Key !== prefix)
            .map(item => ({
              name: item.Key.split('/').pop(),
              type: item.Key.split('.').pop() === 'pdf' ? 'pdf' : 'image',
              path: currentPath.join('/'),
              fullPath: item.Key,
              size: item.Size,
              lastModified: item.LastModified
            }));

          setDocuments([...folders, ...files]);
        }
      } catch (error) {
        console.error("Erreur de chargement:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, [currentPath, storageType]);

  // Gestion des fichiers
  const handleFileUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      if (storageType === storageOptions.LOCAL) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPdfPreview({
            url: event.target.result,
            name: file.name,
            type: file.type.includes('pdf') ? 'pdf' : 'image'
          });
        };
        reader.readAsDataURL(file);
      } else if (storageType === storageOptions.S3) {
        const filePath = currentPath.length > 0 
          ? `${currentPath.join('/')}/${file.name}`
          : file.name;
        
        const params = {
          Bucket: bucketName,
          Key: filePath,
          Body: file,
          ContentType: file.type
        };

        await s3.upload(params).promise();
        loadDocuments();
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
    }
  };

  // Affichage des documents - CORRECTION PRINCIPALE ICI
  const handleDocumentClick = async (doc) => {
    try {
      if (doc.type === 'folder') {
        setCurrentPath(doc.path.split('/').filter(Boolean));
        return;
      }

      if (storageType === storageOptions.LOCAL) {
        setPdfPreview({
          url: `/assets/${doc.path}/${doc.name}`,
          name: doc.name,
          type: doc.type
        });
      } else if (storageType === storageOptions.S3) {
        // Correction cruciale pour éviter le téléchargement automatique
        const url = await s3.getSignedUrlPromise('getObject', {
          Bucket: bucketName,
          Key: doc.fullPath,
          Expires: 60 * 5, // 5 minutes
          ResponseContentDisposition: 'inline' // Empêche le téléchargement forcé
        });

        // Solution alternative si le problème persiste
        // const response = await fetch(url);
        // const blob = await response.blob();
        // const objectUrl = URL.createObjectURL(blob);

        setPdfPreview({
          url: url, // ou objectUrl pour la solution alternative
          name: doc.name,
          type: doc.type
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    }
  };

  // Gestion des sélections
  const handleCheckboxChange = (docName, isChecked) => {
    setSelectedDocs(prev => 
      isChecked 
        ? [...prev, docName] 
        : prev.filter(name => name !== docName)
    );
  };

  // Navigation
  const navigateToFolder = (folderIndex) => {
    setCurrentPath(currentPath.slice(0, folderIndex + 1));
  };

  // Filtrage des documents
  const folders = documents.filter(doc => doc.type === 'folder');
  const files = documents.filter(doc => doc.type !== 'folder');

  return (
    <div className="invoice-viewer-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      <header className="header">
        <div className="logo-section">
          <h1>Document Viewer</h1>
        </div>
        <div className="upload-section">
          <div className="storage-selector">
            <select 
              value={storageType} 
              onChange={(e) => {
                setStorageType(e.target.value);
                setCurrentPath([]); // Réinitialise à la racine
                setPdfPreview(null);
              }}
            >
              <option value={storageOptions.LOCAL}>Local Storage</option>
              <option value={storageOptions.S3}>S3 Storage</option>
            </select>
          </div>
          <label htmlFor="pdf-upload" className="upload-button">
            <span className="upload-icon">↑</span> Upload PDF/Image
            <input
              id="pdf-upload"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </header>

      <div className="document-navigation" style={{ padding: '5px 15px', minHeight: '60px' }}>
        <div className="breadcrumb" style={{ marginBottom: '5px', fontSize: '12px' }}>
          <span 
            className="crumb"
            onClick={() => setCurrentPath([])}
            style={{ fontWeight: currentPath.length === 0 ? 'bold' : 'normal' }}
          >
            Racine
          </span>
          
          {currentPath.map((folder, index) => (
            <React.Fragment key={index}>
              <span>/</span>
              <span 
                className="crumb"
                onClick={() => navigateToFolder(index)}
                style={{ fontWeight: index === currentPath.length - 1 ? 'bold' : 'normal' }}
              >
                {folder}
              </span>
            </React.Fragment>
          ))}
        </div>

        <div className="document-list" style={{ padding: '2px 0' }}>
          {/* Dossiers */}
          {folders.map((folder, index) => (
            <div 
              key={`folder-${index}`}
              className="document-card folder"
              onClick={() => handleDocumentClick(folder)}
            >
              <div className="icon">📁</div>
              <div className="name">{folder.name}</div>
            </div>
          ))}

          {/* Fichiers */}
          {files.map((file, index) => (
            <div
              key={`file-${index}`}
              className={`document-card ${file.type}`}
            >
              <input
                type="checkbox"
                checked={selectedDocs.includes(file.name)}
                onChange={(e) => handleCheckboxChange(file.name, e.target.checked)}
                onClick={(e) => e.stopPropagation()}
                className="doc-checkbox"
              />
              <div className="doc-content" onClick={() => handleDocumentClick(file)}>
                <div className="icon">{file.type === 'pdf' ? '📄' : '🖼️'}</div>
                <div className="name">{file.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="document-viewer" style={{ flex: '1 1 auto', minHeight: '0' }}>
        {pdfPreview ? (
          <>
            <div className="viewer-controls" style={{ padding: '5px 15px' }}>
              <div className="zoom-controls">
                <button onClick={() => setZoomLevel(prev => Math.max(prev - 10, 50))}>-</button>
                <span>{zoomLevel}%</span>
                <button onClick={() => setZoomLevel(prev => Math.min(prev + 10, 200))}>+</button>
              </div>
              <div className="document-title">{pdfPreview.name}</div>
            </div>
            <div 
              className="preview-container"
              ref={pdfContainerRef}
              style={{ 
                transform: `scale(${zoomLevel / 100})`,
                height: 'calc(100% - 40px)'
              }}
            >
              {pdfPreview.type === 'pdf' ? (
                <iframe 
                  src={pdfPreview.url} 
                  title="PDF Preview"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              ) : (
                <img 
                  src={pdfPreview.url} 
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              )}
            </div>
          </>
        ) : (
          <div className="empty-viewer">
            <p>Sélectionnez ou uploadez un document</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceViewer;