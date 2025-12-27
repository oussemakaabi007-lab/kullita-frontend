"use client";
import { useEffect, useState } from "react";
import styles from "./WakeUpTrigger.module.css"; // Note the import change

export default function WakeUpTrigger() {
  const [isWakingUp, setIsWakingUp] = useState(true);
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSlowMessage(true), 15000);

    const wakeUpBackend = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${baseUrl}/users/test`);
        
        if (response.ok) {
          clearTimeout(timer);
          setIsWakingUp(false);
        }
      } catch (err) {
        setTimeout(wakeUpBackend, 3000);
      }
    };

    wakeUpBackend();
    return () => clearTimeout(timer);
  }, []);

  if (!isWakingUp) return null;

  return (
    <div className={styles.wakeupOverlay}>
      <div className={styles.wakeupGlow} />

      <div className={styles.barsContainer}>
        {[0.1, 0.2, 0.3, 0.4, 0.5].map((delay, i) => (
          <div 
            key={i} 
            className={styles.bar} 
            style={{ animationDelay: `${delay}s` }} 
          />
        ))}
      </div>

      <h2 className={styles.wakeupTitle}>
        enjoy <span>Kullita</span>
      </h2>
      
      <p className={styles.wakeupDescription}>
        {showSlowMessage 
          ? "Almost there! The server is waking up, just give it a min" 
          : "Hello there if the server lags is not from the app"}
      </p>

      <div className={styles.statusIndicator}>
        <div className={styles.spinner} />
        <span>Establishing Connection</span>
      </div>
    </div>
  );
}