"use client";

import { Plus, X, AlertTriangle, ListMusic, Trash2, Music, Play, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import styles from './playlist.module.css';
import PlaylistCard from '@/app/components/Playlistcard';
import { useAudio } from '@/app/components/AudioPlayerProvider';

export default function PlaylistClientContent({ playlists: initialPlaylists, user: currentUser }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { playSong, upSongs } = useAudio();
  
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete' | 'view' | null>(null);
  const [activePlaylist, setActivePlaylist] = useState<any>(null);
  const [modalSongs, setModalSongs] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playlistIdFromUrl = searchParams.get('playlistId');

  const fetchPlaylistSongs = useCallback(async (playlist: any) => {
    setLoadingSongs(true);
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
  }, []);

  useEffect(() => {
    const pIdFromStorage = localStorage.getItem('active_playlist_id');
    const idToOpen = playlistIdFromUrl || pIdFromStorage;

    if (idToOpen && initialPlaylists?.length > 0) {
      const found = initialPlaylists.find((p: any) => p.id.toString() === idToOpen);
      if (found) {
        setActivePlaylist(found);
        setModalMode('view');
        fetchPlaylistSongs(found);
        
        if (!playlistIdFromUrl) {
          router.replace(`/playlist?playlistId=${idToOpen}`, { scroll: false });
        }
      }
    }
  }, [playlistIdFromUrl, initialPlaylists, fetchPlaylistSongs, router]);

  const closeModals = () => {
    localStorage.removeItem('active_playlist_id');
    setModalMode(null);
    setActivePlaylist(null);
    setInputValue("");
    setModalSongs([]);
    setError(null);
    router.replace('/playlist', { scroll: false });
  };

  const handleOpenManagementModal = (playlist: any) => {
    localStorage.setItem('active_playlist_id', playlist.id.toString());
    router.push(`/playlist?playlistId=${playlist.id}`, { scroll: false });
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
          handleOpenManagementModal(playlist);
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
    } catch (err) { console.error(err); }
  };

  const handleCreate = async () => {
    if (!inputValue.trim()) { setError("Please enter a name"); return; }
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
    if (!inputValue.trim()) { setError("Name cannot be empty"); return; }
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
        <div style={{ height: '100px', width: '100%' }}></div>
      </div>

      {modalMode && (
        <div className={`${styles.modalOverlay} ${modalMode === 'view' ? styles.viewFullscreen : ''}`}>
          <div className={`${styles.modalContent} ${modalMode === 'delete' ? styles.deleteModal : ''} ${modalMode === 'view' ? styles.fullscreenContent : ''}`}>
            
            <div className={styles.modalHeader}>
              {modalMode !== 'view' && (
                 <h2>
                    {modalMode === 'create' && "New Playlist"}
                    {modalMode === 'edit' && "Edit Details"}
                    {modalMode === 'delete' && "Delete Playlist"}
                 </h2>
              )}
              <button onClick={closeModals} className={styles.closeBtn}><X size={28} /></button>
            </div>

            <div className={styles.modalBody}>
              {modalMode === 'view' ? (
                <>
                  <div className={styles.viewHeaderSection}>
                     <div className={styles.coverContainer}>
                        <div className={styles.mainCover}>
                           <span className={styles.coverLetter}>
                             {activePlaylist?.name?.charAt(0).toUpperCase()}
                           </span>
                        </div>
                     </div>
                     <div className={styles.infoSection}>
                        <h2 className={styles.playlistTitleText}>{activePlaylist?.name}</h2>
                        <p className={styles.playlistSubtitleText}>{modalSongs.length} songs</p>
                     </div>
                  </div>

                  <div className={styles.songList}>
                    {loadingSongs ? (
                      <div className={styles.innerLoader}><Loader2 className="animate-spin" size={32} /></div>
                    ) : modalSongs.length > 0 ? (
                      modalSongs.map((song) => (
                        <div key={song.id} className={styles.songItem}>
                          <div className={styles.songMainInfo}>
                            <Music size={20} className={styles.musicIcon} />
                            <div className={styles.textContainer}>
                              <span className={styles.songTitle}>{song.title}</span>
                              <span className={styles.songArtist}>{song.artist || "Unknown Artist"}</span>
                            </div>
                          </div>
                          <div className={styles.songActions}>
                            <button className={styles.playSongInnerBtn} onClick={() => { playSong(song); upSongs(modalSongs); }}>
                              <Play size={18} fill="currentColor" />
                            </button>
                            <button className={styles.removeSongBtn} onClick={() => handleRemoveSong(song.id)}>
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={styles.emptyMsg}>This playlist is empty.</p>
                    )}
                  </div>
                  <div style={{ height: '150px', width: '100%' }}></div>
                </>
              ) : modalMode === 'delete' ? (
                <div className={styles.deleteWarning}>
                  <AlertTriangle color="#ff4444" size={32} />
                  <p>Delete <strong>{activePlaylist?.name}</strong>?</p>
                </div>
              ) : (
                <div className={styles.inputGroup}>
                  <label>Playlist Name</label>
                  <input 
                    type="text" 
                    className={styles.modalInput}
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    autoFocus 
                  />
                  {error && <span className={styles.errorMessage}>{error}</span>}
                </div>
              )}
            </div>

            {modalMode !== 'view' && (
              <div className={styles.modalFooter}>
                <button onClick={closeModals} className={styles.cancelBtn}>Cancel</button>
                {modalMode === 'create' && <button className={styles.confirmBtn} onClick={handleCreate}>Create</button>}
                {modalMode === 'edit' && <button className={styles.confirmBtn} onClick={handleEdit}>Save</button>}
                {modalMode === 'delete' && <button className={styles.deleteBtn} onClick={handleDelete}>Delete</button>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}