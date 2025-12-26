"use client";

import { useState } from 'react';
import { X, Music, Upload } from 'lucide-react';
import styles from "./artist.module.css";

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadNewSongModal({ onClose, onSuccess }: UploadModalProps) {
  const [title, setTitle] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!audioFile || !coverFile || !title.trim()) {
      setError("Please provide a title, audio file, and cover image.");
      return;
    }
    if (audioFile.size > 50 * 1024 * 1024) {
      setError(`Audio file is too large. Maximum size is 50MB (Current: ${(audioFile.size / 1024 / 1024).toFixed(1)}MB)`);
      return;
    }

    if (coverFile.size > 10 * 1024 * 1024) {
      setError(`Cover image is too large. Maximum size is 10MB (Current: ${(coverFile.size / 1024 / 1024).toFixed(1)}MB)`);
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('audio', audioFile);
    formData.append('cover', coverFile);

    try {
      const res = await fetch('/api/songs/upload', {
        method: 'POST',
        body: formData, 
    credentials: 'include',
      });

      if (res.ok) {
        onSuccess(); 
        onClose();
      } else {
        setError("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Upload failed", err);
      setError("Server connection failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Upload New Song</h3>
          <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
        </div>

        {error && (
          <p className={styles.errorMessage}>{error}</p>
        )}

        <form className={styles.uploadForm} onSubmit={handleUpload}>
          <div className={styles.inputGroup}>
            <label>Song Title</label>
            <input 
              type="text" 
              placeholder="e.g. Moonlight Sonata" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
          </div>
          
          <div className={styles.fileRow}>
            <label className={styles.customUploadBox}>
              <input 
                type="file" 
                accept="audio/*" 
                className={styles.hiddenInput} 
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)} 
              />
              <Music size={24} color="#be00b8" />
              <span>{audioFile ? audioFile.name : "Select Audio"}</span>
            </label>
            <label className={styles.customUploadBox}>
              <input 
                type="file" 
                accept="image/*" 
                className={styles.hiddenInput} 
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)} 
              />
              <Upload size={24} color="#be00b8" />
              <span>{coverFile ? coverFile.name : "Select Cover"}</span>
            </label>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isUploading}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Publish Song"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}