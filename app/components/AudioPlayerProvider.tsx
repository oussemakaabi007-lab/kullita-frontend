"use client";
import { createContext, useContext, useEffect, useState,useRef } from "react";
import Audioplayer from "./Audioplayer";
import { useRouter } from "next/navigation";

export interface Song {
  id: number;
  title: string;
  audioUrl: string; 
  coverUrl: string;
  artist: string;  
  createdAt: Date; 
  updatedAt: Date;
  isFavorite:boolean;
}

interface AudioContextType {
  playSong: (song:Song) => void;
  upSongs :(songs:Song [])=>void;
  updateFavoriteStatus: (songId: number, isFavorite: boolean) => void;
  currentSong:Song;
  songs: Song[];
}
const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider = ({ children}:any) => {
  const [songs,setSongs]=useState<Song []>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState({id: -1,
        title: "",
        audioUrl: "",
        coverUrl: "",
        artist: "",
        createdAt:new Date("2022-03-25"),
        updatedAt: new Date("2022-03-25"),
      isFavorite:false});
     const [previousSong, setpreviousSong] = useState({id: -1,
        title: "",
        audioUrl: "",
        coverUrl: "",
        artist: "",
        createdAt:new Date("2022-03-25"),
        updatedAt: new Date("2022-03-25"),
      isFavorite:false});
     const [nextSong, setnextSong] = useState({id: -1,
        title: "",
        audioUrl: "",
        coverUrl: "",
        artist: "",
        createdAt:new Date("2022-03-25"),
        updatedAt: new Date("2022-03-25"),
      isFavorite:false} );
  const playSong =(song:Song) => {
    if (currentSong?.id === song.id) {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  setCurrentSong(song);
    setnextSong(nextSong);
    setpreviousSong(previousSong);
  return;}
    setCurrentSong(song);
    setnextSong(nextSong);
    setpreviousSong(previousSong);
    addPlayHistory(song.id);
  };
  const upSongs =(songs :Song []) =>{
      setSongs(songs);
      
  }
  const addPlayHistory = async (songId: number) => {
    if(!songId){
      return;
    }
    try {
      await fetch("/api/songs/add_playhistory", {
        method: 'POST',
       headers: {
          "Content-Type": "application/json"
        },
        credentials:'include',
        body: JSON.stringify({ songId:songId }),
      });
    } catch (error) {
      console.error('Error adding play history:', error);
    }};
  useEffect(()=>{
    if (songs.length > 0) {
            setnextSong(Next(currentSong)); 
            setpreviousSong(Previous(currentSong)); 
        }}
  ,[songs.length,currentSong])
   const Next= (currentSong:Song) =>{
        const index=songs.findIndex(song =>currentSong.id== song.id);
        return songs[index + 1] ?? songs[0];
    }
    const Previous= (currentSong:Song) =>{
        const index=songs.findIndex(song =>currentSong.id== song.id);
         return songs[index - 1] ?? songs[songs.length-1];
    }
    const updateFavoriteStatus = (songId: number, isFavorite: boolean) => {
    if (currentSong.id === songId) {
    setCurrentSong(prev => ({ ...prev, isFavorite }));
  }
  setSongs(prevSongs => {
    if (!isFavorite) {
      return prevSongs.filter(s => s.id !== songId);
    }
    const exists = prevSongs.find(s => s.id === songId);
    if (!exists) {
    if (!exists && currentSong.id === songId) {
      return [...prevSongs, { 
        ...currentSong, 
        isFavorite: true,
        createdAt: currentSong.createdAt || new Date().toISOString() 
      }];
    }
    }

    return prevSongs.map(s => s.id === songId ? { ...s, isFavorite: true } : s);
  });
  }
  return (
    <AudioContext.Provider value={{ playSong, upSongs , currentSong ,updateFavoriteStatus ,songs}}>
      {children}
      <Audioplayer
     ref={audioRef}
        currentSong={currentSong}
        onNext={()=>{playSong(nextSong)}}
        onPrevious={()=>{playSong(previousSong)}}
      />
    </AudioContext.Provider>
  );
};


export const useAudio = () => {
  const context = useContext(AudioContext);

  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  const { playSong,upSongs, currentSong ,updateFavoriteStatus,songs} = context;

  return { playSong,upSongs, currentSong ,updateFavoriteStatus,songs};
};
