"use client";

import { Heart, Play, Clock, MoreHorizontal, Shuffle, Plus, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Song, useAudio } from '@/app/components/AudioPlayerProvider';
import styles from './favorites.module.css';

interface Props {
  songs: Song[];
  username?: string;
}

export default function FavoriteSongsClientContent({ songs: initialSongs, username: currentUser }: Props) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 1. Get globalSongs (the live list) from the AudioProvider
  const { playSong, currentSong, upSongs, updateFavoriteStatus, songs: globalSongs } = useAudio();

  // 2. When the page first loads, upload the initial songs to the Provider
  useEffect(() => {
    if (initialSongs && initialSongs.length > 0) {
      upSongs(initialSongs);
    }
  }, [initialSongs]); // Runs only when initialSongs changes

  const handleRemoveFavorite = async (songId: number) => {
    setLoading(true);
    try {
      const response = await fetch('/api/favorite/del', {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ songId })
      });

      if (response.ok) {
        // 3. This call now removes the song from the Provider's 'songs' array
        // Because this page is watching 'globalSongs', it will vanish instantly!
        updateFavoriteStatus(songId, false);
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
    setLoading(false);
  };

  const onPlay = (song: Song) => {
    // We play from globalSongs to ensure the queue is consistent
    playSong(song);
  };

  // 4. Use globalSongs for rendering. If it's empty initially, fall back to initialSongs
  const displaySongs = globalSongs.length > 0 ? globalSongs : initialSongs;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.coverArt}><Heart size={80} fill="white" /></div>
        <div className={styles.headerInfo}>
          <p className={styles.label}>PLAYLIST</p>
          <h1 className={styles.title}>Liked Songs</h1>
          <p className={styles.stats}>{currentUser} you liked {displaySongs.length} songs</p>
        </div>
      </header>

      <div className={styles.controls}>
        <button 
          onClick={() => { if (displaySongs.length > 0) onPlay(displaySongs[0]); }} 
          className={styles.playBtn}
        >
          <Play fill="white" />
        </button>
      </div>

      <div className={styles.table}>
        <div className={`${styles.row} ${styles.tableHeader}`}>
          <div className={styles.colIndex}>#</div>
          <div>TITLE</div>
          <div>DATE ADDED</div>
          <div className={styles.colEnd}>Artist</div>
        </div>

        {loading && (
          <div className={styles.miniLoader}>
            <Loader2 className="animate-spin" size={24} />
            <span>Updating favorites...</span>
          </div>
        )}

        {displaySongs.length === 0 && !loading ? (
          <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>You did not like any song yet</h2>
        ) : (
          displaySongs.map((song, index) => {
            const isActive = currentSong?.id === song.id;
            const isHovered = hoveredRow === song.id;

            return (
              <div
                key={song.id}
                className={`${styles.row} ${isActive ? styles.activeRow : ''}`}
                onMouseEnter={() => setHoveredRow(song.id)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => onPlay(song)}
              >
                <div className={styles.colIndex}>
                  {isHovered ? <Play size={14} fill="white" /> : index + 1}
                </div>

                <div className={styles.songInfo}>
                  <img src={song.coverUrl} alt="" className={styles.miniCover} />
                  <div>
                    <div className={isActive ? styles.activeText : styles.whiteText}>{song.title}</div>
                    <div className={styles.grayText}>{song.artist}</div>
                  </div>
                </div>

                <div className={styles.grayText}>{new Date(song.createdAt).toLocaleDateString()}</div>

                <div className={styles.colEnd}>
                  <button 
                    className={isHovered ? styles.visible : styles.hidden}
                    onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(song.id); }}
                  >
                    <Heart size={16} fill="#be00b8" />
                  </button>
                  <span className={styles.duration}>{song.artist}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}