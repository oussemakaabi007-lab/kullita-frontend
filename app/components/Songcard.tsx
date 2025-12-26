"use client";
import styles from './songcard.module.css';
import { Play } from 'lucide-react';

interface SongCardProps {
    id: number;
    title: string;
    artist: string;
    cover: string;
    url: string;
    onClick?: () => void;
    isActive?: boolean;
}

function SongCard({ title, artist, cover, onClick, isActive }: SongCardProps) {
    return (
        <div 
            className={`${styles.card} ${isActive ? styles.active : ''}`} 
            role="button" 
            onClick={onClick}
        >
            <img src={cover} alt={title} className={styles.backgroundImage} />
            <div className={styles.scrim}></div>

            <div className={styles.cardContent}>
                {isActive ? (
                    <div className={styles.eqContainer}>
                        <div className={`${styles.box} ${styles.box1}`}></div>
                        <div className={`${styles.box} ${styles.box2}`}></div>
                        <div className={`${styles.box} ${styles.box3}`}></div>
                        <div className={`${styles.box} ${styles.box4}`}></div>
                        <div className={`${styles.box} ${styles.box5}`}></div>
                    </div>
                ) : (
                    <div className={styles.playIcon}>
                        <Play  size={32} />
                    </div>
                )}

                <div className={styles.info}>
                    <h4 className={styles.songTitle}>{title}</h4>
                    <p className={styles.artistName}>{artist}</p>
                </div>
            </div>
        </div>
    );
}

export default SongCard;