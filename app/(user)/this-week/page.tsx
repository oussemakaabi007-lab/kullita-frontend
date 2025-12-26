"use client";
import Menu from "@/app/components/Menu";
import styles from './page.module.css';
import Header from "@/app/components/header";
import { useEffect, useState } from "react";
import SongCard from "@/app/components/Songcard";
import { Song, useAudio } from "@/app/components/AudioPlayerProvider";
import { CalendarDays } from "lucide-react";
function thisweek() {
    const [weeklySongs, setWeeklySongs] = useState<Song[]>([]);
    const { playSong, currentSong, upSongs } = useAudio();
    const [loading,setLoading]=useState(true);
    useEffect(() => {
      setLoading(true);
        const fetchWeeklySongs = async () => {
            try {
                const response = await fetch('/api/songs/thisweek', {
                    method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials:'include',
        });
                if (!response.ok) {
                    throw new Error(`Failed to load weekly songs: HTTP ${response.status} - ${response.statusText}`);
                }
            const data:Song [] = await response.json();
            console.log(data);
            setWeeklySongs(data);
                    } catch (err: any) {
                console.log(err.message || "An unknown error occurred while fetching weekly songs.");
            }
          setLoading(false);
          };
            
        fetchWeeklySongs();
    }, []);
  return <div className={styles.appContainer}>
    <div className={styles.menucontainer}>
    <Menu /></div>
     <main className={styles.mainContent}>
    <Header />
     <header className={styles.header}>
              <div className={styles.coverArt}>
                <CalendarDays  size={80} />
              </div>
              <div className={styles.headerInfo}>
                <h1 className={styles.title}>Weekly </h1>
                <p className={styles.stats}>Songs released last week</p>
              </div>
      </header>
    <div className={styles.contentPadding}>
      <p style={{ display: loading ? 'block' : 'none' }}>Loading songs...</p>
  {!loading && weeklySongs.length === 0 ? (
    <p className="text-white">No weekly songs available.</p>
  ) : (
    <div className={styles.songslist}>
        
      {weeklySongs.map((song: any) => (
        <SongCard
          id={song.id}
          key={song.id}
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
</div>
     </main>
  </div>;
}
export default thisweek;