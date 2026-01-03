"use client";

import React, { forwardRef, useState, useEffect, useCallback } from 'react';
import styles from './player.module.css';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Heart, Plus, X, ListPlus, Trash2, ChevronDown, ListMusic } from 'lucide-react';
import { useAudio } from './AudioPlayerProvider';

export interface Song {
  id: number;
  title: string;
  audioUrl: string;
  coverUrl: string;
  artist: string;
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean;
  isFavorite: boolean;
}

interface AudioPlayerProps {
  currentSong: Song;
  queue: Song[];
  onNext?: () => void;
  onPrevious?: () => void;
  onPlayFromQueue?: (song: Song) => void;
}

const Audioplayer = forwardRef<HTMLAudioElement, AudioPlayerProps>(
  ({ currentSong, queue, onNext, onPrevious, onPlayFromQueue }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showQueue, setShowQueue] = useState(false);
    
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [isLoading, setIsLoading] = useState(false); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { updateFavoriteStatus, upSongs } = useAudio();
    const getAudioElement = () => (ref as React.MutableRefObject<HTMLAudioElement | null>).current;

    const fullDisplayQueue = currentSong.id !== -1 
      ? (queue.some(s => s.id === currentSong.id) ? queue : [currentSong, ...queue])
      : queue;

    const handleInternalRemove = (songId: number) => {
      const filteredQueue = queue.filter(s => s.id !== songId);
      upSongs(filteredQueue);
    };

    const toggleExpand = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('input')) return;
      setIsExpanded(!isExpanded);
    };

    const handleRemoveFavorite = async (song: Song) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/favorite/del', {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify({ songId: song.id })
        });
        if (response.ok) updateFavoriteStatus(song.id, false);
      } catch (err) { console.error(err); }
      setIsLoading(false);
    };

    const handleAddFavorite = async (song: Song) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/favorite/add', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify({ songId: song.id })
        });
        if (response.ok) updateFavoriteStatus(song.id, true);
      } catch (err) { console.error(err); }
      setIsLoading(false);
    };

    const handleFavorite = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentSong.isFavorite) handleRemoveFavorite(currentSong);
      else handleAddFavorite(currentSong);
    };

    const fetchPlaylists = async (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsLoading(true);
      try {
        const response = await fetch('/api/playlist/showAll', {
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
        });
        const data = await response.json();
        setUserPlaylists(data.playlists || []);
        setIsPlaylistModalOpen(true);
      } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };

    const handleAddToPlaylist = async (playlistId: string) => {
      if (!playlistId || isSubmitting) return;
      setIsSubmitting(true);
      setIsLoading(true);
      try {
        const response = await fetch('/api/playlist/addsong', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify({ playlistId, songId: currentSong.id })
        });
        if (response.ok) {
          setIsPlaylistModalOpen(false);
          setIsCreating(false);
          setNewPlaylistName("");
        }
      } catch (err) { setError("Error"); } finally {
        setIsSubmitting(false);
        setIsLoading(false);
      }
    };

    const handleCreateAndAdd = async () => {
      const trimmedName = newPlaylistName.trim();
      if (!trimmedName) return;
      setIsLoading(true);
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/playlist/create', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify({ name: trimmedName })
        });
        const data = await response.json();
        if (response.ok && data.playlist?.id) await handleAddToPlaylist(data.playlist.id);
      } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };

    const togglePlayPause = useCallback((e?: React.MouseEvent) => {
      e?.stopPropagation();
      const audio = getAudioElement();
      if (!audio) return;
      if (isPlaying) audio.pause();
      else audio.play().catch(console.error);
    }, [isPlaying, ref]);

    useEffect(() => {
      const audio = getAudioElement();
      if (!audio || !currentSong.audioUrl) return;
      audio.src = currentSong.audioUrl;
      setCurrentTime(0);
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
        audio.play().catch(console.error);
      };
    }, [currentSong.audioUrl, ref]);

    useEffect(() => {
      const audio = getAudioElement();
      if (!audio) return;
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const updateTime = () => setCurrentTime(audio.currentTime);
      const handleEnded = () => { setIsPlaying(false); onNext?.(); };
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('ended', handleEnded);
      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('ended', handleEnded);
      };
    }, [onNext, ref]);

    useEffect(() => {
      const audio = getAudioElement();
      if (audio) audio.volume = volume;
    }, [volume, ref]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = parseFloat(e.target.value);
      const audio = getAudioElement();
      if (audio) { audio.currentTime = newTime; setCurrentTime(newTime); }
    };

    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
      <div 
        className={`${currentSong.id === -1 ? styles.hideplayer : styles.playerContainer} ${isExpanded ? styles.expanded : ''}`}
        onClick={toggleExpand}
      >
        <audio ref={ref} />
        
        {isExpanded && (
          <div className={styles.expandedContent}>
            <div className={styles.expandedHeader}>
                <button className={styles.collapseBtn} onClick={() => setIsExpanded(false)}>
                <ChevronDown size={32} />
                </button>
                <button className={styles.queueBtn} onClick={(e) => { e.stopPropagation(); setShowQueue(!showQueue); }}>
                    <ListMusic size={28} color={showQueue ? "#2E79FF" : "white"} />
                </button>
            </div>

            {!showQueue ? (
                <>
                    <div className={styles.expandedCover}>
                        {currentSong.coverUrl && <img src={currentSong.coverUrl} alt={currentSong.title} />}
                    </div>
                    <div className={styles.expandedInfo}>
                        <div className={styles.expandedTitle}>{currentSong.title}</div>
                        <div className={styles.expandedArtist}>{currentSong.artist}</div>
                    </div>
                </>
            ) : (
                <div className={styles.queueContainer} onClick={(e) => e.stopPropagation()}>
                    <h3 className={styles.queueTitle}>Queue</h3>
                    <div className={styles.queueList}>
                        {fullDisplayQueue.map((song, index) => (
                            <div key={`${song.id}-${index}`} className={`${styles.queueItem} ${song.id === currentSong.id ? styles.queueActive : ''}`}>
                                <div className={styles.queueItemInfo} onClick={() => onPlayFromQueue?.(song)}>
                                    <img src={song.coverUrl} alt="" className={styles.queueThumb} />
                                    <div className={styles.queueText}>
                                        <p className={styles.queueSongName}>{song.title} {song.id === currentSong.id && "(Now Playing)"}</p>
                                        <p className={styles.queueArtistName}>{song.artist}</p>
                                    </div>
                                </div>
                                {song.id !== currentSong.id && (
                                  <button 
                                    className={styles.queueRemove} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleInternalRemove(song.id);
                                    }}
                                  >
                                      <Trash2 size={18} />
                                  </button>
                                )}
                            </div>
                        ))}
                        {fullDisplayQueue.length === 0 && <p className={styles.emptyMsg}>Queue is empty</p>}
                    </div>
                </div>
            )}
          </div>
        )}

        <div className={styles.topSection}>
          {!isExpanded && currentSong.coverUrl && (
             <div className={styles.miniCover}>
                <img src={currentSong.coverUrl} alt="" />
             </div>
          )}
          <div className={styles.songInfo}>
            <div className={styles.title}>{currentSong.title}</div>
            <div className={styles.artist}>{currentSong.artist}</div>
          </div>

          <div className={styles.controls}>
            <button onClick={(e) => { e.stopPropagation(); onPrevious?.(); }} className={styles.controlButton}>
              <SkipBack size={24} />
            </button>
            <button onClick={togglePlayPause} className={styles.playButton}>
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onNext?.(); }} className={styles.controlButton}>
              <SkipForward size={24} />
            </button>
            <button onClick={fetchPlaylists} className={styles.controlButton}>
              <Plus size={22} />
            </button>
            <button onClick={handleFavorite} className={styles.likeButton}>
              {currentSong.isFavorite ? <Heart size={22} fill="#2E79FF" stroke="#2E79FF" /> : <Heart size={22} />}
            </button>
          </div>
        </div>

        <div className={styles.progressBarSection}>
          <span className={styles.time}>{formatTime(currentTime)}</span>
          <input
            type="range" min="0" max={duration || 0} value={currentTime}
            onChange={handleSeek} className={styles.progressBar}
            style={{ '--progress-percentage': `${(currentTime / (duration || 1)) * 100}%` } as React.CSSProperties}
          />
          <span className={styles.time}>{formatTime(duration)}</span>
        </div>

        {!isExpanded && (
          <div className={styles.volumeControl}>
            <button onClick={(e) => { e.stopPropagation(); setVolume(v => v > 0 ? 0 : 0.5); }} className={styles.controlButton}>
              {volume > 0 ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <input
              type="range" min="0" max="1" step="0.01" value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))} className={styles.volumeBar}
              style={{ '--volume-percentage': `${volume * 100}%` } as React.CSSProperties}
            />
          </div>
        )}

        {isPlaylistModalOpen && (
          <div className={styles.modalOverlay} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3>Add to Playlist</h3>
                <button onClick={() => { setIsPlaylistModalOpen(false); setIsCreating(false); }} className={styles.closeBtn}>
                  <X size={20} />
                </button>
              </div>
              <div className={styles.playlistList}>
                {!isCreating ? (
                  <div className={styles.createToggle} onClick={() => setIsCreating(true)}>
                    <ListPlus size={18} color="#2E79FF" />
                    <span>Create New Playlist</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input className={styles.playlistInput} placeholder="Playlist name..." value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} autoFocus />
                    <div className={styles.createActions}>
                      <button onClick={handleCreateAndAdd} className={styles.confirmBtn}>Create & Add</button>
                      <button onClick={() => setIsCreating(false)} className={styles.cancelBtn}>Cancel</button>
                    </div>
                  </div>
                )}
                {userPlaylists.map((pl) => (
                  <div key={pl.id} className={styles.playlistItem} onClick={() => handleAddToPlaylist(pl.id)}>
                    <div className={styles.playlistIcon}>{pl.name.charAt(0).toUpperCase()}</div>
                    <span>{pl.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Audioplayer.displayName = "Audioplayer";
export default Audioplayer;