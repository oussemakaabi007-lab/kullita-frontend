"use client";
import Menu from "@/app/components/Menu";
import styles from './page.module.css';
import Header from "@/app/components/header";
import { useEffect, useState, useRef, useCallback } from "react";
import SongCard from "@/app/components/Songcard";
import { Song, useAudio } from "@/app/components/AudioPlayerProvider";
import { Loader2, TrendingUp } from "lucide-react";

interface MusicData {
  id: string;
  title: string;
  items: Song[];
}

function Trending() {
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const { playSong, currentSong, upSongs } = useAudio();
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);
  const limit = 10;
  const fetchTrendingSongs = useCallback(async (currentOffset: number) => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/songs/trending?limit=${limit}&offset=${currentOffset}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: MusicData = await response.json();
      if (data.items.length < limit) {
        setHasMore(false);
      }

      setTrendingSongs(prev =>  {const newItems = data.items.filter(
    (newItem) => !prev.some((oldItem) => oldItem.id === newItem.id)
  );
  return [...prev, ...newItems];});
      setOffset(prev => prev + limit);
    } catch (err: any) {
      console.error(err.message || "An error occurred fetching trending songs.");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);
  useEffect(() => {
    fetchTrendingSongs(0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchTrendingSongs(offset);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [offset, hasMore, loading, fetchTrendingSongs]);

  return (
    <div className={styles.appContainer}>
      <div className={styles.menucontainer}>
        <Menu />
      </div>
      <main className={styles.mainContent}>
        <Header />
        <header className={styles.header}>
          <div className={styles.coverArt}>
            <TrendingUp size={80} />
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>TRENDING</h1>
            <p className={styles.stats}>most played songs in the last week</p>
          </div>
        </header>

        <div className={styles.contentPadding}>
          {trendingSongs.length === 0 && !loading ? (
            <p className="text-white">No trending songs available.</p>
          ) : (
            <div className={styles.songslist}>
              {trendingSongs.map((song: any) => (
                <SongCard
                  id={song.id}
                  key={`${song.id}-${song.play_count || Math.random()}`}
                  title={song.title}
                  artist={song.artist}
                  cover={song.coverUrl}
                  onClick={() => {
                    upSongs(trendingSongs);
                    playSong(song);
                  }}
                  isActive={currentSong.id === song.id}
                  url={song.audioUrl}
                />
              ))}
            </div>
          )}
          <div ref={observerTarget} style={{ height: '50px', margin: '20px 0' }}>
             { loading && (
        <div className={styles.miniLoader}>
          <Loader2 className="animate-spin" size={24} />
          <span>Loading songs...</span>
        </div>
      )}
            {!hasMore && trendingSongs.length > 0 && (
              <p style={{ textAlign: 'center', opacity: 0.5 }}>You've seen all the top hits!</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Trending;