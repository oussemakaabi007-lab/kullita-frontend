"use client";
import Link from "next/link";
import styles from "./header.module.css";

function Header() {
  return (
    <header className={styles.header}>    
      <div className={styles.userProfileContainer}>
        <Link href="/profile" className={styles.profileLink}>
          U
        </Link>
      </div>
    </header>
  );
}

export default Header;