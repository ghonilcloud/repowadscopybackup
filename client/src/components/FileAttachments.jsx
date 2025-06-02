import React from 'react';
import '../styles/FileAttachments.css';

const FileAttachments = ({ files, allowDownload = true, showPreview = true }) => {
  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.includes('pdf')) return '📄';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isPreviewable = (mimeType) => {
    return mimeType.startsWith('image/');
  };

  return (
    <div className="file-attachments">
      <h3>Attachments ({files.length})</h3>
      <div className="attachments-list">
        {files.map((file, index) => (
          <div key={index} className="attachment-item">
            {showPreview && isPreviewable(file.mimeType) ? (
              <img 
                src={file.url} 
                alt={file.originalName}
                className="attachment-preview"
              />
            ) : (
              <span className="file-icon">{getFileIcon(file.mimeType)}</span>
            )}
            <div className="file-info">
              <span className="file-name">{file.originalName}</span>
              <span className="file-size">{formatFileSize(file.size)}</span>
            </div>
            {allowDownload && (
              <a 
                href={file.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="download-btn"
                download={file.originalName}
              >
                ⬇️
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileAttachments;