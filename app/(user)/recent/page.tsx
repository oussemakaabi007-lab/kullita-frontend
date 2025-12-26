"use client";
import Menu from "@/app/components/Menu";
import styles from './page.module.css';
import Header from "@/app/components/header";
import { useEffect, useState, useRef, useCallback } from "react";
import SongCard from "@/app/components/Songcard";
import { Song, useAudio } from "@/app/components/AudioPlayerProvider";
import { History } from "lucide-react";

interface MusicData {
  id: string;
  title: string;
  items: Song[];
}

function Recent() {
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const { playSong, currentSong, upSongs } = useAudio();
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);
  const limit = 20;
  const fetchRecentSongs = useCallback(async (currentOffset: number) => {
    if (loading || !hasMore) return;
    
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

      setRecentSongs(prev => {const newItems = data.items.filter(
    (newItem) => !prev.some((oldItem) => oldItem.id === newItem.id)
  );
  return [...prev, ...newItems];});
      setOffset(prev => prev + limit);
    } catch (err: any) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);
  useEffect(() => {
    fetchRecentSongs(0);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchRecentSongs(offset);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [offset, hasMore, loading, fetchRecentSongs]);

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
            <p className={styles.stats}>songs you have played </p>
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
                  key={song.id}
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
          <div ref={observerTarget} style={{ height: '50px', margin: '20px 0' }}>
            {loading && <p style={{ textAlign: 'center' }}>Loading more songs...</p>}
            {!hasMore && recentSongs.length > 0 && (
              <p style={{ textAlign: 'center', opacity: 0.5 }}>End of history</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Recent;