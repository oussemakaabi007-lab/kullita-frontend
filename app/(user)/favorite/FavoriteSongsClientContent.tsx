"use client";

import { Heart, Play, Clock, MoreHorizontal, Shuffle, Plus } from 'lucide-react';
import { useState } from 'react';
import { Song, useAudio } from '@/app/components/AudioPlayerProvider';
import Link from 'next/link';
import styles from './favorites.module.css';
interface Props {
  songs: Song[];
  username?: string;
}

export default function FavoriteSongsClientContent({ songs: initialSongs ,username :currentUser}: Props) {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const { playSong, currentSong, upSongs } = useAudio();
  const [loading,setLoading]=useState(false);
  const handleRemoveFavorite = async (songId: number) => {
    setLoading(true)
    try {
      const response = await fetch('/api/favorite/del', {
        method: "DELETE",
         headers: { 
          "Content-Type": "application/json",
        },
        credentials:'include',
        body: JSON.stringify({ songId })
      });
      if (response.ok) setSongs(prev => prev.filter(s => s.id !== songId));
    } catch (err) {
      console.error("Delete failed", err);
    }
    setLoading(false);
  };

  const onPlay = (song: Song) => {
    upSongs(songs);
    playSong(song);
  };
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.coverArt}>
          <Heart size={80} fill="white" />
        </div>
        <div className={styles.headerInfo}>
          <p className={styles.label}>PLAYLIST</p>
          <h1 className={styles.title}>Liked Songs</h1>
          <p className={styles.stats}>{currentUser} you liked {songs.length} songs</p>
        </div>
      </header>
      <div className={styles.controls}>
        <button onClick={() => onPlay(songs[0])} className={styles.playBtn}>
          <Play fill="white" />
        </button>
        <Heart className={styles.activeHeart} fill="currentColor" />
       
      </div>
      <div className={styles.table}>
        <div className={`${styles.row} ${styles.tableHeader}`}>
          <div className={styles.colIndex}>#</div>
          <div>TITLE</div>
          <div>DATE ADDED</div>
          <div className={styles.colEnd}>Artist</div>
        </div>
        <p style={{ display: loading ? 'block' : 'none' }}>Loading songs...</p>
        {!loading && (songs.length===0? <p>you did not like any song yet</p> :songs.map((song, index) => {
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
                <span className={styles.duration}>
                  {song.artist}
                </span>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}