"use client";
import styles from './songcard.module.css';
import Image from 'next/image';
interface SongCardProps {
    title: string;
    artist: string;
    cover: string;
    // Add an optional handler if clicking the card does something
    onClick?: () => void;
}

function SongCard({ title, artist, cover, onClick }: SongCardProps) {
    return (
        <div 
            className={styles.card} 
            role="button" 
            tabIndex={0}
            onClick={onClick}
        >
            <div className={styles.cardImageContainer}>
                <Image
                    src={cover}
                    alt={`Cover for ${title}`}
                    fill
                    className={styles.cardImage}
                    sizes="(max-width: 600px) 250px, 300px" 
                />
            </div>
            
            <div className={styles.cardInfo}>
                <h4 className={styles.songTitle}>{title}</h4>
                <p className={styles.artistName}>{artist}</p>
            </div>
        </div>
    );
}
export default SongCard;
/*import styles from './songcard.module.css';
import Image from 'next/image';
function SongCard({title,artist,cover}:{title:string,artist:string,cover:string}) {
    return (
        <div className={styles.card}>
            <div className={styles.cardimg} style={{backgroundImage:`url(${cover})`}}>
                
            </div>
            <div className={styles.cardinfo}>
            <h3>{title}</h3>
            <p>{artist}</p>
            </div>
        </div>
    );
}
export default SongCard;*/