"use client";

import { Plus, X, AlertTriangle, ListMusic, Trash2, Music, Play, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './playlist.module.css';
import PlaylistCard from '@/app/components/Playlistcard';
import { useAudio } from '@/app/components/AudioPlayerProvider';

export default function PlaylistClientContent({ playlists: initialPlaylists, user: currentUser }: any) {
  const router = useRouter();
  const { playSong, upSongs } = useAudio();
  
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete' | 'view' | null>(null);
  const [activePlaylist, setActivePlaylist] = useState<any>(null);
  const [modalSongs, setModalSongs] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loadingSongs, setLoadingSongs] = useState(false);

  const closeModals = () => {
    setModalMode(null);
    setActivePlaylist(null);
    setInputValue("");
    setModalSongs([]);
  };
  const handleOpenManagementModal = async (playlist: any) => {
    setLoadingSongs(true);
    setActivePlaylist(playlist);
    setModalMode('view');
    try {
      const response = await fetch(`/api/playlist/getsongs?playlistId=${playlist.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setModalSongs(data.songs || []);
      }
    } catch (err) {
      console.error("Failed to fetch songs", err);
    } finally {
      setLoadingSongs(false);
    }
  };
  const handleQuickPlay = async (playlist: any) => {
    setLoadingSongs(true);
    try {
      const response = await fetch(`/api/playlist/getsongs?playlistId=${playlist.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const songs = data.songs || [];

        if (songs.length > 0) {
          upSongs(songs);
          playSong(songs[0]);
        } else {
          setActivePlaylist(playlist);
          setModalSongs([]);
          setModalMode('view');
        }
      }
    } catch (err) {
      console.error("Playback fetch failed", err);
    } finally {
      setLoadingSongs(false);
    }
  };
  const handleRemoveSong = async (songId: number) => {
    if (!songId) return;
    try {
      const response = await fetch('/api/playlist/removesong', {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ playlistId: activePlaylist.id, songId })
      });

      if (response.ok) {
        setModalSongs(prev => prev.filter(song => song.id !== songId));
      }
    } catch (err) {
      console.error("Removal failed", err);
    }
  };

  const handleCreate = async () => {
    if (!inputValue.trim()) return;
    try {
      await fetch('/api/playlist/create', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ name: inputValue })
      });
      closeModals();
      router.refresh();
    } catch (err) { console.error(err); }
  };

  const handleEdit = async () => {
    if (!inputValue.trim()) return;
    try {
      await fetch('/api/playlist/edit', {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ playlistId: activePlaylist.id, newname: inputValue })
      });
      closeModals();
      router.refresh();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    try {
      await fetch('/api/playlist/delete', {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ playlistId: activePlaylist.id })
      });
      closeModals();
      router.refresh();
    } catch (err) { console.error(err); }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.coverArt}><ListMusic size={80} fill="white" /></div>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>MY LIBRARY</h1>
          <p className={styles.stats}>{currentUser}, you have {initialPlaylists.length} playlists</p>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.grid}>
          <div onClick={() => setModalMode('create')} className={styles.createCard}>
            <Plus size={32} />
            <h3>Create New</h3>
          </div>

          {initialPlaylists.map((playlist: any) => (
            <PlaylistCard
              key={playlist.id}
              name={playlist.name}
              onPlay={() => handleQuickPlay(playlist)}
              onClick={() => handleOpenManagementModal(playlist)}
              onEdit={() => {
                setActivePlaylist(playlist);
                setInputValue(playlist.name);
                setModalMode('edit');
              }}
              onDelete={() => {
                setActivePlaylist(playlist);
                setModalMode('delete');
              }}
            />
          ))}
        </div>
      </div>
      {loadingSongs && !modalMode && (
        <div className={styles.miniLoader}>
          <Loader2 className="animate-spin" size={24} />
          <span>Loading songs...</span>
        </div>
      )}

      {modalMode && (
        <div className={styles.modalOverlay}>
          <div className={`
            ${styles.modalContent} 
            ${modalMode === 'delete' ? styles.deleteModal : ''} 
            ${modalMode === 'view' ? styles.largeModal : ''}
          `}>
            
            <div className={styles.modalHeader}>
              <h2>
                {modalMode === 'create' && "New Playlist"}
                {modalMode === 'edit' && "Edit Details"}
                {modalMode === 'delete' && "Delete Playlist"}
                {modalMode === 'view' && activePlaylist?.name}
              </h2>
              <button onClick={closeModals} className={styles.closeBtn}><X size={20} /></button>
            </div>

            <div className={styles.modalBody}>
              {modalMode === 'view' ? (
                <div className={styles.songList}>
                  {loadingSongs ?  (
        <div className={styles.miniLoader}>
          <Loader2 className="animate-spin" size={24} />
          <span>Loading songs...</span>
        </div>
      ) :modalSongs.length > 0 ? (
                    modalSongs.map((song) => (
                      <div key={song.id} className={styles.songItem}>
                        <div className={styles.songMainInfo}>
                          <Music size={16} className={styles.musicIcon} />
                          <div className={styles.textContainer}>
                            <span className={styles.songTitle}>{song.title}</span>
                            <span className={styles.songArtist}>{song.artist || "Unknown Artist"}</span>
                          </div>
                        </div>
                        <div className={styles.songActions}>
                          <button 
                            className={styles.playSongInnerBtn} 
                            onClick={() => { playSong(song); upSongs(modalSongs); }}
                          >
                            <Play size={16} fill="currentColor" />
                          </button>
                          <button 
                            className={styles.removeSongBtn} 
                            onClick={() => handleRemoveSong(song.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyStateContainer}>
                      <Music size={48} className={styles.emptyIcon} />
                      <p className={styles.emptyMsg}>This playlist is empty.</p>
                      <button onClick={closeModals} className={styles.addMoreBtn}>Add some music</button>
                    </div>
                  )}
                </div>
              ) : modalMode === 'delete' ? (
                <div className={styles.deleteWarning}>
                  <AlertTriangle color="#ff4444" size={32} />
                  <p>Are you sure you want to delete <strong>{activePlaylist?.name}</strong>?</p>
                </div>
              ) : (
                <div className={styles.inputGroup}>
                  <label>Playlist Name</label>
                  <input 
                    type="text" 
                    className={styles.modalInput}
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    placeholder="My playlist"
                    autoFocus 
                  />
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button onClick={closeModals} className={styles.cancelBtn}>
                {modalMode === 'view' ? "Close" : "Cancel"}
              </button>
              {modalMode === 'create' && <button className={styles.confirmBtn} onClick={handleCreate}>Create</button>}
              {modalMode === 'edit' && <button className={styles.confirmBtn} onClick={handleEdit}>Save</button>}
              {modalMode === 'delete' && <button className={styles.deleteBtn} onClick={handleDelete}>Delete</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}