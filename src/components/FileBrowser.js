import React, { useState, useEffect } from 'react';
import { listFiles, getFile } from '../services/awsS3';

const FileBrowser = () => {
  const [files, setFiles] = useState([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchFiles = async () => {
      const files = await listFiles(process.env.REACT_APP_S3_BUCKET);
      setFiles(files);
    };
    fetchFiles();
  }, []);

  const handleFileClick = async (key) => {
    const fileContent = await getFile(process.env.REACT_APP_S3_BUCKET, key);
    setContent(fileContent);
  };

  return (
    <div>
      <h2>Fichiers S3</h2>
      <ul>
        {files.map((file) => (
          <li key={file.Key} onClick={() => handleFileClick(file.Key)} style={{ cursor: 'pointer' }}>
            {file.Key}
          </li>
        ))}
      </ul>
      <pre>{content}</pre>
    </div>
  );
};

export default FileBrowser;
