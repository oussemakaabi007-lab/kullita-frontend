"use client";
import Link from "next/link";
import styles from "./menu.module.css";
import { useRouter, usePathname } from "next/navigation";
import { Heart, Plus, Home, Search, LogOut ,Library ,History ,TrendingUp, LayoutDashboard, Music, UserRoundPen, Loader2} from "lucide-react";
import { useState } from "react";

function MenuArtist() {
  const router = useRouter(); 
  const pathname = usePathname();
  const [loading,setLoading]=useState(false);
  const handleLogout =async () => {
    setLoading(true);
   await fetch('/api/auth/logout', { method: 'POST', credentials: 'include', });
    localStorage.clear();
    localStorage.setItem("logout_event", Date.now().toString());
    setLoading(false);
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
          <LayoutDashboard  size={24} />
          <span>Dashboard</span>
        </Link>
        <Link 
          href="/mysongs" 
          className={`${styles.navBtn} ${getActiveClass('/search')}`}
        >
          <Music  size={24} />
          <span>Your songs</span>
        </Link>
        <Link 
          href="/profile" 
          className={`${styles.navBtn} ${getActiveClass('/profile')}`}
        >
          <UserRoundPen  size={24} />
          <span>Profile</span>
        </Link>
      </nav>
    { loading && (
        <div className={styles.miniLoader}>
          <Loader2 className="animate-spin" size={24} />
          <span>Loading songs...</span>
        </div>
      )}
      <button onClick={handleLogout} className={styles.logoutBtn}>
        <LogOut size={20} />
        Log out
      </button>
    </aside>
  );
}

export default MenuArtist;