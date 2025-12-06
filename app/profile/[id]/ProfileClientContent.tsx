"use client"; 
import styles from './profile.module.css';
import Image from 'next/image';
import { useState } from 'react';
interface Song {
    id: number;
    title: string;
    artist: string;
}

interface User {
    id: string;
    username: string;
    profilePic: string;
    favoriteSongs: Song[];
}

interface ProfileClientProps {
    userInfo: User;
    isCurrentUser: boolean;
}
interface EditableFieldProps {
    initialValue: string;
    label: string;
    onSave: (newValue: string) => void;
}

function EditableField({ initialValue, label, onSave }: EditableFieldProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);

    const handleSave = () => {
        onSave(value);
        setIsEditing(false);
    };

    return (
        <div className={styles.editableField}>
            <p className={styles.fieldLabel}>{label}:</p>
            {isEditing ? (
                <>
                    <input 
                        type="text" 
                        value={value} 
                        onChange={(e) => setValue(e.target.value)}
                        className={styles.fieldInput}
                    />
                    <button onClick={handleSave} className={styles.saveButton}>Save</button>
                    <button onClick={() => { setValue(initialValue); setIsEditing(false); }} className={styles.cancelButton}>Cancel</button>
                </>
            ) : (
                <>
                    <h2 className={styles.fieldDisplay}>{value}</h2>
                    <button onClick={() => setIsEditing(true)} className={styles.editButton}>Edit</button>
                </>
            )}
        </div>
    );
}


export default function ProfileClientContent({ userInfo, isCurrentUser }: ProfileClientProps) {

    const [currentUserInfo, setCurrentUserInfo] = useState(userInfo);

    const handleUsernameSave = (newUsername: string) => {
        console.log(`API call to update username to: ${newUsername}`);
        // Optimistic update:
        setCurrentUserInfo(prev => ({ ...prev, username: newUsername }));
        // 
    };

    const handlePhotoUpdate = (newPhotoUrl: string) => {
        console.log(`API call to update profile photo to: ${newPhotoUrl}`);
        // Optimistic update:
        setCurrentUserInfo(prev => ({ ...prev, profilePic: newPhotoUrl }));
        // TODO: Add file upload logic here
    }

  return (
    <main className={styles.content}>
        <header className={styles.profileHeader}>
            <h1>User Profile</h1>
        </header>

        <section className={styles.profileCard}>
            
            <div className={styles.imageSection}>
                <div className={styles.cardImageContainer}>
                    <Image
                        src={currentUserInfo.profilePic}
                        alt={`Profile picture of ${currentUserInfo.username}`}
                        fill
                        className={styles.cardImage}
                        sizes="15vw" 
                    />
                </div>
                {isCurrentUser && (
                    <button 
                        className={styles.photoEditBtn}
                        // In a real app, this would open a file dialog
                        onClick={() => handlePhotoUpdate("/homebackground.png")} 
                    >
                        Change Photo
                    </button>
                )}
            </div>

            {/* Username Section */}
            <div className={styles.infoSection}>
                {isCurrentUser ? (
                    <EditableField
                        initialValue={currentUserInfo.username}
                        label="Username"
                        onSave={handleUsernameSave}
                    />
                ) : (
                    <h2 className={styles.usernameDisplay}>{currentUserInfo.username}</h2>
                )}
            </div>
        </section>
        
        <hr className={styles.divider} />

        <section className={styles.favoritesSection}>
            <h2>{isCurrentUser ? "Your Favorite Songs" : `${currentUserInfo.username}'s Favorite Songs`}</h2>
            <ul className={styles.favoritesList}>
                {currentUserInfo.favoriteSongs.length > 0 ? (
                    currentUserInfo.favoriteSongs.map(song => (
                        <li key={song.id} className={styles.favoriteItem}>
                            <strong>{song.title}</strong> by {song.artist}
                        </li>
                    ))
                ) : (
                    <p className={styles.emptyState}>No favorite songs listed.</p>
                )}
            </ul>
        </section>
    </main>
  );
}