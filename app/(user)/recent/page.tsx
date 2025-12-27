"use client";
import Menu from "@/app/components/Menu";
import styles from './page.module.css';
import Header from "@/app/components/header";
import { useEffect, useState, useRef, useCallback } from "react";
import SongCard from "@/app/components/Songcard";
import { Song, useAudio } from "@/app/components/AudioPlayerProvider";
import { History, Loader2 } from "lucide-react";

interface MusicData {
  id: string;
  title: string;
  items: Song[];
}

function Recent() {
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const { playSong, currentSong, upSongs } = useAudio();
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement | null>(null);
  const initialFetchDone = useRef(false);
  const limit = 10;

  const fetchRecentSongs = useCallback(async (currentOffset: number) => {
    if (loading || (!hasMore && currentOffset !== 0)) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/songs/recent?limit=${limit}&offset=${currentOffset}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: MusicData = await response.json();
      
      if (data.items.length < limit) {
        setHasMore(false);
      }

      setRecentSongs(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const newItems = data.items.filter(newItem => !existingIds.has(newItem.id));
        return currentOffset === 0 ? data.items : [...prev, ...newItems];
      });
    } catch (err: any) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchRecentSongs(0);
      initialFetchDone.current = true;
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading && recentSongs.length >= limit) {
          fetchRecentSongs(recentSongs.length);
        }
      },
      { 
        root: null,
        rootMargin: '400px',
        threshold: 0.1 
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, recentSongs.length, fetchRecentSongs]);

  return (
    <div className={styles.appContainer}>
      <div className={styles.menucontainer}>
        <Menu />
      </div>
      <main className={styles.mainContent}>
        <Header />
        <header className={styles.header}>
          <div className={styles.coverArt}>
            <History size={80} />
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>HISTORY</h1>
            <p className={styles.stats}>songs you have played</p>
          </div>
        </header>

        <div className={styles.contentPadding}>
          {recentSongs.length === 0 && !loading ? (
            <p className="text-white">No recent songs available.</p>
          ) : (
            <div className={styles.songslist}>
              {recentSongs.map((song: any) => (
                <SongCard
                  id={song.id}
                  key={`${song.id}-${song.createdAt}`}
                  title={song.title}
                  artist={song.artist}
                  cover={song.coverUrl}
                  onClick={() => {
                    upSongs(recentSongs);
                    playSong(song);
                  }}
                  isActive={currentSong.id === song.id}
                  url={song.audioUrl}
                />
              ))}
            </div>
          )}
          <div ref={observerTarget} style={{ height: '60px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            { loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc' }}>
                <Loader2 className="animate-spin" size={24} />
                <span>please wait...</span>
              </div>
            )}
            {!hasMore && recentSongs.length > 0 && (
              <p style={{ color: '#666', fontSize: '14px' }}>End of history</p>
            )}
          </div>
        </div>
        <div className={styles.playerSafeSpace} />
      </main>
    </div>
  );
}

export default Recent;