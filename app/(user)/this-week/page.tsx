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
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const fetchWeeklySongs = useCallback(async (currentOffset: number) => {
    if (loading || !hasMore) return;

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
        const newItems = data.filter(
          (newItem) => !prev.some((oldItem) => oldItem.id === newItem.id)
        );
        return [...prev, ...newItems];
      });
      setOffset(prev => prev + LIMIT);
    } catch (err: any) {
      console.error(err.message || "An error occurred fetching weekly songs.");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);
  useEffect(() => {
    fetchWeeklySongs(0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchWeeklySongs(offset);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [offset, hasMore, loading, fetchWeeklySongs]);

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
          <div ref={loaderRef} className={styles.sentinel} style={{ height: '50px', margin: '20px 0' }}>
            {loading && (
              <div className={styles.miniLoader}>
                <Loader2 className="animate-spin" size={24} />
                <span>Loading songs...</span>
              </div>
            )}
            {!hasMore && weeklySongs.length > 0 && (
              <p className={styles.sentinel}>
                You've reached the end of this week's hits!
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ThisWeek;