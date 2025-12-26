"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Music, X, Upload } from 'lucide-react';
import MenuArtist from "@/app/components/MenuArtist";
import styles from "./page.module.css";

export default function SongsPage() {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<any>(null);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const res = await fetch('/api/songs/mysongs', {
        credentials:'include',
      });
      const data = await res.json();
      setSongs(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSong) return;
    try {
      const res = await fetch(`/api/songs/deletemysong`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials:'include',
        body: JSON.stringify({ songId: selectedSong.id })
      });

      if (res.ok) {
        setSongs(songs.filter(s => s.id !== selectedSong.id));
        setIsDeleteOpen(false);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className={styles.appContainer}>
      <div className={styles.menucontainer}><MenuArtist /></div>

      <div className={styles.mainContent}>
        <div className={styles.contentPadding}>
          <div className={styles.headerRow}>
            <h1>My Music Library</h1>
            <button className={styles.addMainBtn} onClick={() => setIsAddOpen(true)}>
              <Plus size={20} /> <span className={styles.btnText}>Upload New Song</span>
            </button>
          </div>

          <div className={styles.tableWrapper}>
            <div className={styles.songsTable}>
              <div className={styles.tableHeader}>
                <span className={styles.indexCol}>#</span>
                <span>Title</span>
                <span className={styles.playsCol}>Plays</span>
                <span className={styles.actionsHeader}>Actions</span>
              </div>

              {loading ? (
                <p style={{ padding: '20px', color: '#b3b3b3' }}>Loading your tracks...</p>
              ) : songs.length === 0 ? (
                <p style={{ padding: '20px', color: '#b3b3b3' }}>No songs found. Start by uploading one!</p>
              ) : (
                songs.map((song, index) => (
                  <div key={song.id} className={styles.songRow}>
                    <span className={`${styles.indexCol} ${styles.hideMobile}`}>{index + 1}</span>
                    <div className={styles.titleCol}>
                      <img src={song.coverUrl || '/login.png'} alt="" className={styles.songThumb} />
                      <div className={styles.songMeta}>
                         <span className={styles.songTitleText}>{song.title}</span>
                         <span className={styles.mobilePlays}>{song.listenCount || 0} plays</span>
                      </div>
                    </div>
                    <span className={`${styles.playsCol} ${styles.hideMobile}`}>{song.listenCount || 0} plays</span>
                    <div className={styles.actionsCol}>
                      <button onClick={() => { setSelectedSong(song); setIsEditOpen(true); }} className={styles.editIconBtn}><Edit2 size={18} /></button>
                      <button onClick={() => { setSelectedSong(song); setIsDeleteOpen(true); }} className={styles.deleteIconBtn}><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {isAddOpen && <UploadModal onClose={() => setIsAddOpen(false)} mode="Add" onSuccess={fetchSongs} />}
      {isEditOpen && <UploadModal onClose={() => setIsEditOpen(false)} mode="Edit" initialData={selectedSong} onSuccess={fetchSongs} />}

      {isDeleteOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsDeleteOpen(false)}>
          <div className={styles.deleteModal} onClick={e => e.stopPropagation()}>
            <h3>Remove Song?</h3>
            <p>Are you sure you want to delete "{selectedSong?.title}"?</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setIsDeleteOpen(false)}>Cancel</button>
              <button className={styles.deleteSubmitBtn} onClick={handleDelete}>Delete Forever</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadModal({ onClose, mode, initialData, onSuccess }: any) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
    if(!title.trim()){
      setError("title is required");
    }
    if (mode !== "Edit" && (!audioFile || !coverFile)) {
        setError("Both audio and cover files are required to publish.");
        return;
    }
        setIsUploading(true);
        const formData = new FormData();
        formData.append('title', title);
        if (mode === "Edit") formData.append('songId', initialData.id);
        if (audioFile) formData.append('audio', audioFile);
        if (coverFile) formData.append('cover', coverFile);
        if (audioFile && audioFile.size > 50 * 1024 * 1024) {
      setError(`Audio file is too large. Maximum size is 50MB (Current: ${(audioFile.size / 1024 / 1024).toFixed(1)}MB)`);
      return;
    }

    if (coverFile && coverFile.size > 10 * 1024 * 1024) {
      setError(`Cover image is too large. Maximum size is 10MB (Current: ${(coverFile.size / 1024 / 1024).toFixed(1)}MB)`);
      return;
    }
        const url = mode === "Edit" ? '/api/songs/edit' : '/api/songs/upload';
        const method = mode === "Edit" ? 'PATCH' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
        credentials:'include',
                body: formData
            });

            if (res.ok) {
                onSuccess();
                onClose();
            }
        } catch (err) {
            console.error(`${mode} failed`, err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>{mode} Song</h3>
                    <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
                </div>
                {error && (
    <p style={{ color: '#ff4d4d', fontSize: '0.85rem', marginBottom: '10px', textAlign: 'center' }}>
        {error}
    </p>
)}
                <form className={styles.uploadForm} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>Song Title</label>
                        <input type="text" placeholder="e.g. Moonlight Sonata" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    
                    <div className={styles.fileRow}>
                        <label className={styles.customUploadBox}>
                            <input type="file" accept="audio/*" className={styles.hiddenInput} onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
                            <Music size={24} color="#be00b8" />
                            <span>{audioFile ? audioFile.name : (mode === "Edit" ? "Change Audio" : "Select Audio")}</span>
                        </label>

                        <label className={styles.customUploadBox}>
                            <input type="file" accept="image/*" className={styles.hiddenInput} onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
                            <Upload size={24} color="#be00b8" />
                            <span>{coverFile ? coverFile.name : (mode === "Edit" ? "Change Cover" : "Select Cover")}</span>
                        </label>
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isUploading}>Cancel</button>
                        <button type="submit" className={styles.submitBtn} disabled={isUploading}>
                            {isUploading ? (mode === "Edit" ? "Saving Changes" : "Uploading" ): (mode === "Edit" ? "Save Changes" : "Publish Song")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}