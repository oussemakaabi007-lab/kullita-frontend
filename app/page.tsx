"use client";
import Menu from "./components/Menu";
import Searchbar from "./components/Searchbar"; 
import Songcard from "./components/Songcard";
import styles from './page.module.css';
interface Song {
    id: number;
    title: string;
    artist: string;
    cover: string;
}

const mockSongs: Song[] = [
    { id: 1, title: "Echoes of the Night", artist: "Aurora Bloom", cover: "/login.png" },
    { id: 2, title: "Digital Sunrise", artist: "SynthWave", cover: "/homebackground.png" },
    { id: 3, title: "Acoustic Journey", artist: "The Strays", cover: "/homebackground.png" },
    { id: 4, title: "Urban Rhapsody", artist: "City Lights", cover: "/login.png" },
    { id: 5, title: "Deep Sea Dive", artist: "Aqua Beats", cover: "/login.png" },
    
];

export default function Home() {
    const handleCardClick = (song: Song) => {
        console.log(`Playing song: ${song.title}`);
    };

    return (
        <div className={styles.layout}>
            <Menu />
             
            <main className={styles.content}>
                
                <div className={styles.holder}><Searchbar /></div>
                <section className={styles.songList}>
                    {mockSongs.map(song => (
                        <Songcard 
                            key={song.id}
                            title={song.title}
                            artist={song.artist}
                            cover={song.cover}
                            onClick={() => handleCardClick(song)} 
                        />
                    ))}
                </section>
            </main>
        </div>
    );
}
