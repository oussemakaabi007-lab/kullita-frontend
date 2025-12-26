"use client";
import Link from "next/link";
import styles from "./menu.module.css";
import { useRouter, usePathname } from "next/navigation";
import { Heart, Plus, Home, Search, LogOut ,Library ,History ,TrendingUp} from "lucide-react";
import { useState } from "react";

function Menu() {
  const router = useRouter(); 
  const pathname = usePathname();

  const handleLogout = async () => {
   await fetch('/api/auth/logout', { method: 'POST', credentials: 'include', });
    localStorage.clear();
    localStorage.setItem("logout_event", Date.now().toString());
    router.push('/login');
  };
  const getActiveClass = (href:string) => {
    return pathname === href ? styles.active : '';
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoHeader}>
        <div className={styles.logoIcon}>
          <span className={styles.logoLetter}>K</span>
        </div>
        <span className={styles.appName}>Kulitta</span>
      </div>
      <nav className={styles.nav}>
        <Link 
          href="/" 
          className={`${styles.navBtn} ${getActiveClass('/')}`}
        >
          <Home size={24} />
          <span>Home</span>
        </Link>
        <Link 
          href="/search" 
          className={`${styles.navBtn} ${getActiveClass('/search')}`}
        >
          <Search size={24} />
          <span>Search</span>
        </Link>
        <Link 
          href="/trending" 
          className={`${styles.navBtn} ${getActiveClass('/trending')}`}
        >
          <TrendingUp size={24} />
          <span>Trending</span>
        </Link>
      </nav>
      <div className={styles.playlistSection}>
        <h3 className={styles.sectionTitle}>Playlists</h3>
        <Link 
          href="/favorite" 
          className={`${styles.actionBtn} ${styles.likedBtn} ${getActiveClass('/favorite')}`}
        >
          <Heart size={20} fill="currentColor" />
          <span>Liked Songs</span>
        </Link>
        <div className={styles.playlistList}>
          <Link href="/recent" className={`${styles.actionBtn} ${styles.likedBtn} ${getActiveClass('/recent')}`}>
           <History size={20} />
           <span> Recently Played</span>
          </Link>
          <Link href="/playlist" className={`${styles.actionBtn} ${styles.likedBtn} ${getActiveClass('/playlist')}`}>
            <Library size={20} />
            <span>My Playlist</span>
          </Link>
        </div>
      </div>
      <button onClick={handleLogout} className={styles.logoutBtn}>
        <LogOut size={20} />
        Log out
      </button>
    </aside>
  );
}

export default Menu;