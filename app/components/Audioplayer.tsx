"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import styles from './player.module.css';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Heart, Plus, X } from 'lucide-react';

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

export default function Audioplayer({ currentSong, onNext, onPrevious }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const handleRemoveFavorite = async (song: Song) => {
    try {
      const response = await fetch('/api/favorite/del', {
        method: "DELETE",
       headers: {
          "Content-Type": "application/json"
        },
        credentials:'include',
        body: JSON.stringify({ songId: song.id })
      });
      if (response.ok) song.isFavorite = false;
    } catch (err) { console.error("Delete failed", err); }
  };

  const handleAddFavorite = async (song: Song) => {
    try {
      const response = await fetch('/api/favorite/add', {
        method: "POST",
       headers: {
          "Content-Type": "application/json"
        },
        credentials:'include',
        body: JSON.stringify({ songId: song.id })
      });
      if (response.ok) song.isFavorite = true;
    } catch (err) { console.error("add failed", err); }
  };

  const handleFavorite = (song: Song) => async () => {
    if (song.isFavorite) await handleRemoveFavorite(song);
    else await handleAddFavorite(song);
  };
  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/playlist/showAll', {
       headers: {
          "Content-Type": "application/json"
        },
        credentials:'include',
      });
      const data = await response.json();
      setUserPlaylists(data.playlists);
      setIsPlaylistModalOpen(true);
    } catch (err) { console.error("Fetch playlists failed", err); }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if(!playlistId){
      return;
    }
    try {
      const response = await fetch('/api/playlist/addsong', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials:'include',
        body: JSON.stringify({ playlistId, songId: currentSong.id })
      });
      if (response.ok) setIsPlaylistModalOpen(false);
    } catch (err) { console.error("Add to playlist failed", err); }
  };
  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play().catch(e => console.error("Error playing audio:", e));
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = currentSong.audioUrl;
    setCurrentTime(0);
    setIsPlaying(false);
    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
      audio.play().then(() => setIsPlaying(true)).catch(e => console.error("Autoplay failed:", e));
    };
    return () => { audio.onloadedmetadata = null; };
  }, [currentSong.audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => { setIsPlaying(false); onNext?.(); };
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onNext]);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={currentSong.id===-1? styles.hideplayer : styles.playerContainer }>
      <audio ref={audioRef} />

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
              <Heart size={20} fill="#be00b8" className={styles.filledHeart} />
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
          style={{ '--progress-percentage': `${(currentTime / duration) * 100}%` } as React.CSSProperties}
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
              <button onClick={() => setIsPlaylistModalOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.playlistList}>
              {userPlaylists.length===0? <p>you dont have any playlist <br></br> try to create one</p> :userPlaylists.map((pl) => (
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