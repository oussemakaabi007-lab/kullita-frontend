"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Menu from "@/app/components/Menu";
import Header from "@/app/components/header";
import styles from './search.module.css';
import SongCard from "@/app/components/Songcard";
import { useAudio } from "@/app/components/AudioPlayerProvider";
import { Search as SearchIcon, X, Music, Loader2 } from "lucide-react";
import { Song } from '@/app/components/Audioplayer';

const LIMIT = 15;

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const { playSong, currentSong, upSongs } = useAudio();
    
    const loaderRef = useRef<HTMLDivElement | null>(null);

    const handleSearch = useCallback(async (searchQuery: string, currentOffset: number) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setHasMore(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/songs/search?q=${encodeURIComponent(searchQuery)}&limit=${LIMIT}&offset=${currentOffset}`, 
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include',
                }
            );

            if (response.ok) {
                const data = await response.json();
                const newSongs: Song[] = data.songs || [];
                console.log(newSongs)
                if (newSongs.length < LIMIT) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }

                setResults(prev => {
                    if (currentOffset === 0) return newSongs;
                    
                    const existingIds = new Set(prev.map(s => s.id));
                    const uniqueNewItems = newSongs.filter(s => !existingIds.has(s.id));
                    return [...prev, ...uniqueNewItems];
                });
            }
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setHasMore(true);
            handleSearch(query, 0);
        }, 350);

        return () => clearTimeout(timeoutId);
    }, [query, handleSearch]);
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && hasMore && !isLoading && results.length >= LIMIT) {
                    handleSearch(query, results.length);
                }
            },
            { rootMargin: '400px', threshold: 0.1 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, isLoading, results.length, query, handleSearch]);

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
                    {results.length === 0 && !isLoading ? (
                        <div className={styles.emptyState}>
                            <Music size={48} opacity={0.5} />
                            <p>{query ? `No songs found for "${query}"` : "Search for your favorite music"}</p>
                        </div>
                    ) : (
                        <div className={styles.songslist}>
                            {results.map((song) => (
                                <SongCard
                                    id={song.id}
                                    key={`${song.id}-${query}`}
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
                    <div ref={loaderRef} style={{ height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {isLoading && (
                            <div className={styles.miniLoader} style={{ position: 'static', transform: 'none' }}>
                                <Loader2 className="animate-spin" size={24} />
                                <span style={{ marginLeft: '10px' }}>Searching  songs...</span>
                            </div>
                        )}
                        {!hasMore && results.length > 0 && (
                            <p style={{ color: '#666', fontSize: '14px' }}>No more results found.</p>
                        )}
                    </div>
                </div>
                <div className={styles.playerSafeSpace} />
            </main>
        </div>
    );
}