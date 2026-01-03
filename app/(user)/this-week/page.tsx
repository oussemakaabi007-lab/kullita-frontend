"use client";
import Menu from "@/app/components/Menu";
import styles from './page.module.css';
import Header from "@/app/components/header";
import { useEffect, useState, useRef, useCallback } from "react";
import SongCard from "@/app/components/Songcard";
import { Song, useAudio } from "@/app/components/AudioPlayerProvider";
import { CalendarDays, Loader2 } from "lucide-react";

const LIMIT = 10;

function ThisWeek() {
  const [weeklySongs, setWeeklySongs] = useState<Song[]>([]);
  const { playSong, currentSong, upSongs } = useAudio();
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const initialFetchDone = useRef(false);

  const fetchWeeklySongs = useCallback(async (currentOffset: number) => {
    if (loading || (!hasMore && currentOffset !== 0)) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/songs/thisweek?limit=${LIMIT}&offset=${currentOffset}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: Song[] = await response.json();

      if (data.length < LIMIT) {
        setHasMore(false);
      }

      setWeeklySongs(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const newItems = data.filter(newItem => !existingIds.has(newItem.id));
        return currentOffset === 0 ? data : [...prev, ...newItems];
      });
    } catch (err: any) {
      console.error(err.message || "An error occurred fetching weekly songs.");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchWeeklySongs(0);
      initialFetchDone.current = true;
    }
  }, []); 
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading && weeklySongs.length >= LIMIT) {
          fetchWeeklySongs(weeklySongs.length);
        }
      },
      { 
        root: null,
        rootMargin: '400px', 
        threshold: 0.1 
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, weeklySongs.length, fetchWeeklySongs]);

  return (
    <div className={styles.appContainer}>
      <div className={styles.menucontainer}>
        <Menu />
      </div>
      <main className={styles.mainContent}>
        <Header />
        <header className={styles.header}>
          <div className={styles.coverArt}>
            <CalendarDays size={80} />
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Weekly</h1>
            <p className={styles.stats}>Songs released last week</p>
          </div>
        </header>

        <div className={styles.contentPadding}>
          {weeklySongs.length === 0 && !loading ? (
            <p className="text-white text-center">No weekly songs available.</p>
          ) : (
            <div className={styles.songslist}>
              {weeklySongs.map((song) => (
                <SongCard
                  id={song.id}
                  key={`${song.id}-${song.createdAt}`}
                  title={song.title}
                  artist={song.artist}
                  cover={song.coverUrl}
                  onClick={() => {
                    upSongs(weeklySongs);
                    playSong(song);
                  }}
                  isActive={currentSong.id === song.id}
                  url={song.audioUrl}
                />
              ))}
            </div>
          )}
          
          <div ref={loaderRef} style={{ height: '60px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc' }}>
                <Loader2 className="animate-spin" size={24} />
                <span>please wait...</span>
              </div>
            )}
            {!hasMore && weeklySongs.length > 0 && (
              <p style={{ color: '#666', fontSize: '14px' }}>
                You've reached the end of this week's hits!
              </p>
            )}
          </div>
        </div>
        <div className={styles.playerSafeSpace} />
      </main>
    </div>
  );
}

export default ThisWeek;