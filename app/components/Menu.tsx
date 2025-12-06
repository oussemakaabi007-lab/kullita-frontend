"use client";
import Link from "next/link";
import styles from "./menu.module.css";
import {useState} from "react";
function Menu() {
    const [showMenu,setShowMenu] =useState(true);
    return (
        <div><span onClick={()=>setShowMenu(!showMenu)} className={styles.menubtn}>{showMenu? "\u2715" : "\u2630"}</span>
        <div className={showMenu?styles.menu:styles.menun}>
           <ul className={styles.mul}>
            <li className={styles.mli}><Link className={styles.ma} href="/">Home</Link></li>
            <li className={styles.mli}><Link className={styles.ma} href="/playlist/123">PlayList</Link></li>
            <li className={styles.mli}><Link className={styles.ma} href="/signup">Favorites</Link></li>
            <li className={styles.mli}><Link className={styles.ma} href="/profile/123">Profil</Link></li>
            <li className={styles.mli}><Link className={styles.ma} href="/login">Logout</Link></li>
            
           </ul>
        </div></div>
    );
}
export default Menu;