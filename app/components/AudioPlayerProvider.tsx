"use client";
import { createContext, useContext, useEffect, useState } from "react";
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
  currentSong:Song;
}
const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider = ({ children}:any) => {
  const [songs,setSongs]=useState<Song []>([]);

 
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
    setCurrentSong(song);
    addPlayHistory(song.id);
    setnextSong(nextSong);
    setpreviousSong(previousSong);
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
  return (
    <AudioContext.Provider value={{ playSong, upSongs , currentSong }}>
      {children}
      <Audioplayer
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
  const { playSong,upSongs, currentSong } = context;

  return { playSong,upSongs, currentSong };
};
