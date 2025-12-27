"use client";

import React, { forwardRef, useState, useEffect, useCallback } from 'react';
import styles from './player.module.css';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Heart, Plus, X, ListPlus, Loader2 } from 'lucide-react';
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
  onNext?: () => void;
  onPrevious?: () => void;
}

const Audioplayer = forwardRef<HTMLAudioElement, AudioPlayerProps>(
  ({ currentSong, onNext, onPrevious }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.5);
    
    // UI States
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");

    // Loading & Error States
    const [isLoading, setIsLoading] = useState(false); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { updateFavoriteStatus } = useAudio();
    const getAudioElement = () => (ref as React.MutableRefObject<HTMLAudioElement | null>).current;

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
      } catch (err) { console.error("Delete failed", err); }
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
      } catch (err) { console.error("add failed", err); }
      setIsLoading(false);
    };

    const handleFavorite = (song: Song) => async () => {
      if (song.isFavorite) await handleRemoveFavorite(song);
      else await handleAddFavorite(song);
    };

    const fetchPlaylists = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/playlist/showAll', {
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
        });
        const data = await response.json();
        setUserPlaylists(data.playlists || []);
        setIsPlaylistModalOpen(true);
      } catch (err) { 
        console.error("Fetch playlists failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    const handleAddToPlaylist = async (playlistId: string) => {
      if (!playlistId || isSubmitting) return;
      setIsSubmitting(true);
      setError(null);
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
        } else {
          setError("Failed to add song.");
        }
      } catch (err) { 
        setError("Error connecting to server.");
      } finally {
        setIsSubmitting(false);
        setIsLoading(false);
      }
    };

    const handleCreateAndAdd = async () => {
      setError(null);
      const trimmedName = newPlaylistName.trim();
      
      if (!trimmedName) {
        setError("Playlist name cannot be empty");
        return;
      }
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
        if (response.ok && data.playlist?.id) {
          await handleAddToPlaylist(data.playlist.id);
        } else {
          setError(data.message || "Failed to create playlist");
          setIsSubmitting(false);
        }
      } catch (err) { 
        setError("Network error. Try again.");
        setIsSubmitting(false);
      }
      setIsLoading(false);
    };

    const togglePlayPause = useCallback(() => {
      const audio = getAudioElement();
      if (!audio) return;
      if (isPlaying) audio.pause();
      else audio.play().catch(e => console.error("Error playing:", e));
    }, [isPlaying, ref]);

    useEffect(() => {
      const audio = getAudioElement();
      if (!audio || !currentSong.audioUrl) return;
      audio.src = currentSong.audioUrl;
      setCurrentTime(0);
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
        audio.play().catch(e => console.error("Autoplay failed:", e));
      };
      return () => { audio.onloadedmetadata = null; };
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
      if (audio) {
        audio.currentTime = newTime;
        setCurrentTime(newTime);
      }
    };

    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
      <div className={currentSong.id === -1 ? styles.hideplayer : styles.playerContainer}>
        <audio ref={ref} />
        {isLoading && (
          <div className={styles.miniLoader}>
            <Loader2 className="animate-spin" size={24} />
            <span>please wait...</span>
          </div>
        )}

        <div className={styles.topSection}>
          <div className={styles.songInfo}>
            <div className={styles.title}>{currentSong.title}</div>
            <div className={styles.artist}>{currentSong.artist}</div>
          </div>

          <div className={styles.controls}>
            <button onClick={onPrevious} className={styles.controlButton} disabled={!onPrevious}>
              <SkipBack size={24} />
            </button>
            <button onClick={togglePlayPause} className={styles.playButton}>
              {isPlaying ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" />}
            </button>
            <button onClick={onNext} className={styles.controlButton} disabled={!onNext}>
              <SkipForward size={24} />
            </button>
            <button onClick={fetchPlaylists} className={styles.controlButton} aria-label="Add to Playlist">
              <Plus size={22} />
            </button>
            <button onClick={handleFavorite(currentSong)} className={styles.likeButton}>
              {currentSong.isFavorite ? (
                <Heart size={20} fill="#2E79FF" className={styles.filledHeart} />
              ) : (
                <Heart size={20} />
              )}
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

        <div className={styles.volumeControl}>
          <button onClick={() => setVolume(v => v > 0 ? 0 : 0.5)} className={styles.controlButton}>
            {volume > 0 ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <input
            type="range" min="0" max="1" step="0.01" value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))} className={styles.volumeBar}
            style={{ '--volume-percentage': `${volume * 100}%` } as React.CSSProperties}
          />
        </div>

        {isPlaylistModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3>Add to Playlist</h3>
                <button onClick={() => { setIsPlaylistModalOpen(false); setIsCreating(false); setError(null); }} className={styles.closeBtn}>
                  <X size={20} />
                </button>
              </div>
              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}
              {isLoading && (
          <div className={styles.miniLoader}>
            <Loader2 className="animate-spin" size={24} />
            <span>please wait...</span>
          </div>
        )}
              
              <div className={styles.playlistList}>
                {!isCreating ? (
                  <div className={styles.createToggle} onClick={() => { setIsCreating(true); setError(null); }}>
                    <div className={styles.createIcon}>
                      <ListPlus size={18} color="#2E79FF" />
                    </div>
                    <span>Create New Playlist</span>
                  </div>
                ) : (
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '5px' }}>
                    <input 
                      className={styles.playlistInput}
                      placeholder="Playlist name..." 
                      value={newPlaylistName}
                      disabled={isSubmitting}
                      onChange={(e) => {
                        setNewPlaylistName(e.target.value);
                        if (error) setError(null);
                      }}
                      autoFocus
                    />
                    <div className={styles.createActions}>
                      <button onClick={handleCreateAndAdd} className={styles.confirmBtn} disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create & Add Song"}
                      </button>
                      <button onClick={() => { setIsCreating(false); setError(null); }} className={styles.cancelBtn} disabled={isSubmitting}>
                        Cancel
                      </button>
                    </div>
                    
                  </div>
                )}
                {userPlaylists.map((pl) => (
                  <div 
                    key={pl.id} 
                    className={styles.playlistItem} 
                    onClick={() => !isSubmitting && handleAddToPlaylist(pl.id)}
                    style={{ opacity: isSubmitting ? 0.5 : 1, pointerEvents: isSubmitting ? 'none' : 'auto' }}
                  >
                    <div className={styles.playlistIcon}>{pl.name.charAt(0).toUpperCase()}</div>
                    <span>{pl.name}</span>
                  </div>
                ))}
                
                {userPlaylists.length === 0 && !isCreating && (
                   <p className={styles.emptyMsg}>you dont have any playlist <br /> try to create one</p>
                )}
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