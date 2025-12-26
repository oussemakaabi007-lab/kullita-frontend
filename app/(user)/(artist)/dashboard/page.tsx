"use client";

import { useState, useEffect } from 'react';
import { Users, PlayCircle, TrendingUp, PlusCircle, X, Music, Upload } from 'lucide-react';
import MenuArtist from '@/app/components/MenuArtist';
import styles from './artist.module.css';
import { UploadNewSongModal } from './Upload';

function formatGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
export default function Dashboard() {
  const [stats, setStats] = useState({ totalListeners: 0, totalPlays: 0 });
  const [topSongs, setTopSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [growth, setGrowth] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', audio: null as File | null, cover: null as File | null });
   useEffect(() => {
  async function fetchArtistData() {
    try {
      const [statsRes, growthRes] = await Promise.all([
        fetch('/api/users/stats', {
         headers: {
          "Content-Type": "application/json"
        },
        credentials:'include',
        }),
        fetch('/api/users/growth', {
         headers: {
          "Content-Type": "application/json"
        },
        credentials:'include',
        })
      ]);

      if (!statsRes.ok || !growthRes.ok) {
        throw new Error("Failed to fetch artist data");
      }
      
      const statsData = await statsRes.json();
      const growthData = await growthRes.json();

      setGrowth(growthData.growth || 0);
      setStats({ 
        totalListeners: statsData.stats.totalListeners, 
        totalPlays: statsData.stats.totalPlays 
      });
      setTopSongs(statsData.topTracks); 

    } catch (err) {
      console.error("Failed to fetch artist data:", err);
    } finally {
      setLoading(false);
    }
  }
  fetchArtistData();
}, []);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'audio' | 'cover') => {
    if (e.target.files && e.target.files[0]) {
      setUploadData({ ...uploadData, [field]: e.target.files[0] });
    }
  };
  return (
    <div className={styles.appContainer}>
      <div className={styles.menucontainer}>
        <MenuArtist />
      </div>

      <div className={styles.mainContent}>
        <div className={styles.contentPadding}>
          
          <header className={styles.dashHeader}>
             <h2 className={styles.greetingTitle}>{formatGreeting()}</h2>
             <p className={styles.subtitle}>Here is what's happening with your music today.</p>
          </header>

          <section className={styles.statsGrid}>
            <div className={styles.statCard}>
              <Users color="#be00b8" size={32} />
              <div>
                <p className={styles.statLabel}>Total Listeners</p>
                <h3 className={styles.statValue}>{stats.totalListeners.toLocaleString()}</h3>
              </div>
            </div>
            <div className={styles.statCard}>
              <PlayCircle color="#be00b8" size={32} />
              <div>
                <p className={styles.statLabel}>Total Streams</p>
                <h3 className={styles.statValue}>{stats.totalPlays.toLocaleString()}</h3>
              </div>
            </div>
            <div className={styles.statCard}>
              <TrendingUp color="#1db954" size={32} />
              <div>
                <p className={styles.statLabel}>Growth</p>
                <h3 className={styles.statValue}>{growth}%</h3>
              </div>
            </div>
          </section>

          <section className={styles.sectionSpace}>
            <div className={styles.sectionHeader}>
              <h3>Your Top 3 Tracks</h3>
            </div>            
            <div className={styles.topTracksContainer}>
              {topSongs.length===0?<p>you dont have any song</p> :topSongs.map((song: any, index: number) => (
                <div key={song.id} className={styles.bestTrackCard}>
                  <span className={styles.rankNumber}>#{index + 1}</span>
                  <div className={styles.bestImageWrapper}>
                    <img 
                      src={song.coverUrl || "/default-cover.jpg"} 
                      alt={song.title} 
                      className={styles.bestSongImage} 
                    />
                    <div className={styles.bestOverlay}>
                      <div className={styles.bestOverlayContent}>
                        <PlayCircle size={32} color="#be00b8" />
                        <span className={styles.playCountText}>
                          {song.listenCount?.toLocaleString()} Plays
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.bestSongInfo}>
                    <h3 className={styles.bestSongTitle}>{song.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className={styles.sectionSpace}>
            <h3>Quick Actions</h3>
            <div className={styles.actionGrid}>
              <button className={styles.actionCard} onClick={() => setIsModalOpen(true)}>
                <PlusCircle size={28} color="#be00b8" />
                <span>Upload New Track</span>
              </button>
            </div>
          </section>
        </div>
      </div>
      {isModalOpen && (
  <UploadNewSongModal 
    onClose={() => setIsModalOpen(false)} 
    onSuccess={async () => {
    try {
      const [statsRes, growthRes] = await Promise.all([
        fetch('/api/users/stats', {
          headers: {
          "Content-Type": "application/json"
        },
        credentials:'include',
        }),
        fetch('/api/users/growth', {
          headers: {
          "Content-Type": "application/json"
        },
        credentials:'include',
        })
      ]);

      if (!statsRes.ok || !growthRes.ok) {
        throw new Error("Failed to fetch artist data");
      }
      
      const statsData = await statsRes.json();
      const growthData = await growthRes.json();

      setGrowth(growthData.growth || 0);
      setStats({ 
        totalListeners: statsData.stats.totalListeners, 
        totalPlays: statsData.stats.totalPlays 
      });
      setTopSongs(statsData.topTracks); 

    } catch (err) {
      console.error("Failed to fetch artist data:", err);
    } finally {
      setLoading(false);
    }
  } } 
  />
)}
    </div>
  );
}