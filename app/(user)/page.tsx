"use client";

import { useState, useEffect } from 'react';
import { Home, Search, Library, Plus, Heart, Play, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Menu from '@/app/components/Menu'
import Header from '../components/header';
import styles from './page.module.css';
import SongCard from '../components/Songcard';
import { useAudio } from '@/app/components/AudioPlayerProvider';
import { Song } from '../components/Audioplayer';
interface Album {
 id: number;
 title: string;
 artist: string;
 coverUrl: string;
}
interface MusicData{
  id:string;
  title:string;
  items: Song [];
}
interface MusicSection {
 id: string;
 title: string;
 items: Album[];
}

function formatGreeting(): string {
 const hour = new Date().getHours();
 if (hour < 12) return "Good morning";
 if (hour < 18) return "Good afternoon";
 return "Good evening";
}
export default function HomePage() {
 const [sections, setSections] = useState<MusicSection[]>([]);
 const [MusicData, setMusicData] = useState<any[]>([]);
 const { playSong, currentSong, upSongs } = useAudio();
 const [loading,setLoading]=useState(true);
 const router = useRouter();
 const fetchSections = async () => {
  setLoading(true);
   try {
      const response = await fetch("/api/songs/home", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials:'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to load sections: HTTP ${response.status} - ${response.statusText}`);
      } 
      const data:MusicData [] = await response.json();
      setMusicData(data);
    } catch (err: any) {
      console.log(err.message || "An unknown error occurred while fetching sections.");
    }
    setLoading(false);
 }
 useEffect(() => {
  fetchSections();
  const mockSections: MusicSection[] = [
    {
     id: 'greeting',
     title: formatGreeting(),
     items: [
      { id: 1, title: 'Liked Songs', artist: 'Your favorites', coverUrl: 'https://placehold.co/300x300/be00b8/ffffff?text=LI' },
      { id: 2, title: 'Discover Weekly', artist: 'Your weekly mixtape', coverUrl: 'https://placehold.co/300x300/667eea/ffffff?text=DW' },
     ]
    }
  ];
   setSections(mockSections);
  }, []);

  const greetingSection = sections.find(s => s.id === 'greeting');
  const otherSections = MusicData;

  return (
    <div className={styles.appContainer}>
      <div className={styles.menucontainer}>
    <Menu />
    </div>
    <main className={styles.mainContent}>
      <Header />

      <div className={styles.contentPadding}>
      {greetingSection && (
        <section className={styles.greetingSection}>
        <h2 className={styles.greetingTitle}>{greetingSection.title}</h2>
        <div className={styles.greetingGrid}>
          {greetingSection.items.map((item) => (
          <div
            key={item.id}
            className={styles.greetingItem}
            role="button"
            onClick={(e)=>{
              e.stopPropagation();
              if (item.title === 'Liked Songs') {
              router.push('/favorite');
              }else if (item.title === 'Discover Weekly') {
              router.push('/this-week');
              }
            }}
          >
            <div className={styles.greetingItemCover}>
            <img src={item.coverUrl} alt={item.title} className={styles.itemImage} />
            </div>
            <div className={styles.greetingItemInfo}>
            <h3 className={styles.greetingItemInfoTitle}>{item.title}</h3>
            </div>
            <button 
            onClick={(e) => {
              e.stopPropagation();
              if (item.title === 'Liked Songs') {
              router.push('/favorite');
              }else if (item.title === 'Discover Weekly') {
              router.push('/this-week');
              }
            }}
            className={styles.playButton}
            >
            <Play size={20} fill="white" className={styles.playIcon} />
            </button>
          </div>
          ))}
        </div>
        </section>
      )}
      { loading && (
        <div className={styles.miniLoader}>
          <Loader2 className="animate-spin" size={24} />
          <span>Loading songs...</span>
        </div>
      )}
      {!loading && otherSections.map((section) => (
        <section key={section.id} className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{section.title}</h2>
          <button className={styles.showAllBtn} onClick={()=>{section.id=="recent" ? router.push('/recent') : router.push('/trending')}}>
          Show all
          </button>
        </div>
        
        <div className={styles.albumGrid}>
  {section.items.length > 0 ? (
    section.items.map((item: Song) => (
      <SongCard 
        id={item.id} 
        key={item.id} 
        title={item.title} 
        artist={item.artist} 
        cover={item.coverUrl} 
        onClick={() => {
          upSongs(section.items);
          playSong(item);
        }} 
        isActive={currentSong.id == item.id} 
        url={item.audioUrl} 
      />
    ))
  ) : (
    <p className={styles.noDataMessage}>{section.id=="recent" ? "you did not play any song yet" :(section.id=="trending"? "There is no trending songs right now" : "no song was added this week")}</p>
  )}
</div>
        </section>
      ))}
      </div>
    </main>
    </div>
  );
}