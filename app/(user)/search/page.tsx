"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Menu from "@/app/components/Menu";
import Header from "@/app/components/header";
import styles from './search.module.css';
import SongCard from "@/app/components/Songcard";
import { useAudio } from "@/app/components/AudioPlayerProvider";
import { Search as SearchIcon, X, Music } from "lucide-react";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { playSong, currentSong, upSongs } = useAudio();
    const handleSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`/api/songs/search?q=${encodeURIComponent(searchQuery)}`, {
                method: "GET",
                headers: {
          "Content-Type": "application/json"
        },
        credentials:'include',
            });
            if (response.ok) {
                const data = await response.json();
                setResults(data.songs || []);
            }
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => handleSearch(query), 350);
        return () => clearTimeout(timeoutId);
    }, [query, handleSearch]);

    return (
        <div className={styles.appContainer}>
            <div className={styles.menucontainer}>
                <Menu />
            </div>

            <main className={styles.mainContent}>
                <Header />

                <header className={styles.header}>
                    <div className={styles.searchWrapper}>
                        <div className={styles.searchBar}>
                            <SearchIcon className={styles.searchIcon} size={20} />
                            <input
                                type="text"
                                placeholder="Search for songs or artists..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className={styles.searchInput}
                                autoFocus
                            />
                            {query && (
                                <X 
                                    className={styles.clearIcon} 
                                    size={20} 
                                    onClick={() => setQuery("")} 
                                />
                            )}
                        </div>
                    </div>
                </header>
                <div className={styles.contentPadding}>
                    {isLoading ? (
                        <p className="text-white">Searching...</p>
                    ) : results.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Music size={48} opacity={0.5} />
                            <p>{query ? `No songs found for "${query}"` : "Search for your favorite music"}</p>
                        </div>
                    ) : (
                        <div className={styles.songslist}>
                            {results.map((song: any) => (
                                <SongCard
                                    id={song.id}
                                    key={song.id}
                                    title={song.title}
                                    artist={song.artist}
                                    cover={song.coverUrl}
                                    url={song.audioUrl}
                                    isActive={currentSong?.id === song.id}
                                    onClick={() => {
                                        upSongs(results);
                                        playSong(song);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}