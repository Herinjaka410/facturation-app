import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AWS from 'aws-sdk';
import './MainPage.css';

// Supprimez la déclaration dupliquée de s3 et utilisez directement AWS.S3
const configureAWS = () => {
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
    region: process.env.REACT_APP_AWS_REGION,
    signatureVersion: 'v4'
  });
  return new AWS.S3();
};

const MainPage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const s3 = configureAWS(); // Initialisation S3

    const fetchPdfFiles = async () => {
      try {
        const params = {
          Bucket: 'photonasync-datcorp',
          Prefix: 'data/768327198/2025-01-14/',
          Delimiter: '/'
        };

        const data = await s3.listObjectsV2(params).promise();
        
        const pdfFiles = await Promise.all(
          data.Contents
            .filter(item => item.Key.endsWith('.pdf'))
            .map(async item => ({
              key: item.Key,
              name: item.Key.split('/').pop(),
              lastModified: item.LastModified,
              url: await s3.getSignedUrlPromise('getObject', {
                Bucket: 'photonasync-datcorp',
                Key: item.Key,
                Expires: 3600
              })
            }))
        );

        setFiles(pdfFiles);
      } catch (error) {
        console.error("Erreur S3:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPdfFiles();
  }, []);

  const handleStartWork = () => {
    if (selectedFile) {
      navigate('/work', { state: { selectedFile } });
    }
  };

  // Données simulées pour les timestamps
  const timestamps = [
    "2025-04-25 07:37",
    "2025-04-25 11:02",
    // ... autres timestamps
  ];

  return (
    <div className="photen-container">
      <div className="sidebar">
        <h1>PHOTEN</h1>
        
        <h2>Filename</h2>
        {isLoading ? (
          <p>Chargement des PDF...</p>
        ) : (
          <ul className="file-list">
            {files.map((file, index) => (
              <li 
                key={index}
                className={`file-item ${selectedFile?.key === file.key ? 'selected' : ''}`}
                onClick={() => setSelectedFile(file)}
              >
                {file.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="main-content">
        <div className="action-buttons">
          <button 
            onClick={handleStartWork}
            disabled={!selectedFile}
            className="primary-button"
          >
            Start Work
          </button>
          <button className="secondary-button">View Details</button>
          <button className="secondary-button">Export</button>
        </div>
        
        <div className="upload-section">
          <h2>Uploaded Ad (PT)</h2>
          {timestamps.map((time, index) => (
            <div key={index} className="timestamp">{time}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
