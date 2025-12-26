"use client";

import styles from './Playlistcard.module.css';
import { Play, Trash2, Edit2 } from 'lucide-react';

interface PlaylistCardProps {
  name: string;
  cover?: string;
  onClick?: () => void; 
  onPlay: () => void; 
  onDelete: () => void;
  onEdit: () => void;
}

export default function PlaylistCard({ name, onClick, onPlay, onDelete, onEdit }: PlaylistCardProps) {
  const firstLetter = name.trim().charAt(0).toUpperCase();

  return (
    <div className={styles.card} onClick={onClick} role="button" tabIndex={0}>
      <div className={styles.letterBackground}>
        {firstLetter}
      </div>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className={styles.info}>
          <h4 className={styles.name}>{name}</h4>
          
        </div>

        <div className={styles.actions}>
          <button 
            className={`${styles.iconBtn} ${styles.playBtn}`} 
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
            aria-label="Play"
          >
            <Play size={20} fill="currentColor" />
          </button>
          
          <div className={styles.secondaryActions}>
            <button 
              className={styles.iconBtn} 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              aria-label="Edit"
            >
              <Edit2 size={18} />
            </button>
            <button 
              className={styles.iconBtn} 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              aria-label="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}